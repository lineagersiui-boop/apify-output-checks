# Your Apify run SUCCEEDED and the dataset is half empty: catching silent scraper failures

> The full script and its tests are in this folder: [`check-runs.mjs`](check-runs.mjs), [`check-runs.test.mjs`](check-runs.test.mjs) (`node --test check-runs.test.mjs`).

A scraper that crashes is easy to deal with: the run fails, you get an alert, you fix it. The expensive failures are the quiet ones. The run finishes with status `SUCCEEDED`, but:

- it returned 40 items instead of the usual 500, because the site started paginating differently;
- every item is there, but `price` is empty, because a CSS class changed;
- the site served a consent or bot-check page, and your scraper happily saved zero results.

Downstream, a price monitor, a lead list or a RAG index ingests the bad data as if nothing happened. This guide covers three ways to catch it, starting with the free options that are built into Apify.

## 1. Start with Apify's free monitoring

**Console alerts.** Apify Console has a **Monitoring** tab on each Actor and task. According to the [Apify monitoring docs](https://docs.apify.com/platform/monitoring), "The monitoring system is free for all users." Alerts can be set on:

- **metric thresholds**, for example when the number of results is lower than expected;
- **run status**, for example alert on `FAILED` or `TIMED-OUT`;
- **dataset field statistics**, for example whether a field is filled in all records. This needs the Actor to define a dataset schema.

Notifications go to email, Slack or the Console.

**The free Monitoring Actor suite.** Apify also publishes [a free Monitoring Actor suite](https://apify.com/apify/monitoring) that can validate dataset content and check duplicates. It costs only platform usage.

If your scraper's output is stable and you can choose a fixed minimum result count, these cover most of the problem. Set them up first.

Where a fixed threshold gets awkward:

- **Variable counts.** The normal result count varies a lot from run to run (search results, news, marketplaces), so any fixed minimum is either too loose or too noisy.
- **No dataset schema.** You run Store Actors whose developer didn't define a dataset schema, so field statistics aren't available.
- **Many Actors.** You want one report across many Actors instead of configuring alerts one by one.

## 2. Roll your own check with the Apify API

The idea: compare the latest run with that Actor's previous runs instead of with a fixed number, then check the fields you depend on in its items. Three API calls are enough:

| Call | Gives you |
|---|---|
| `GET /v2/acts/{actorId}/runs?desc=1&limit=10` | The latest runs, each with `status` and `defaultDatasetId` |
| `GET /v2/datasets/{datasetId}` | `itemCount` for a run's dataset |
| `GET /v2/datasets/{datasetId}/items?limit=200` | The first 200 items, to check fields in |

The core check is a pure function, so it's easy to unit-test:

```js
// runs: [{ status, itemCount, items }], newest first
export function checkRuns(runs, { requiredFields = [], maxDropPct = 50, maxEmptyPct = 30 } = {}) {
    const problems = [];
    const [latest, ...older] = runs;
    if (!latest) return ['No runs found.'];
    if (latest.status !== 'SUCCEEDED') return [`Latest run status is ${latest.status}.`];

    // 1. Item count far below the median of earlier successful runs
    const counts = older.filter((r) => r.status === 'SUCCEEDED').map((r) => r.itemCount).sort((a, b) => a - b);
    if (counts.length >= 2) {
        const median = counts[Math.floor(counts.length / 2)];
        if (median > 0 && latest.itemCount < median * (1 - maxDropPct / 100)) {
            problems.push(`Item count ${latest.itemCount} is more than ${maxDropPct}% below the recent median ${median}.`);
        }
    }
    if (latest.itemCount === 0) problems.push('Latest run returned 0 items.');

    // 2. Required fields that are empty in too many of the checked items
    const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    for (const field of requiredFields) {
        if (!latest.items.length) break;
        const empty = latest.items.filter((it) => isEmpty(field.split('.').reduce((o, k) => o?.[k], it))).length;
        const pct = Math.round((100 * empty) / latest.items.length);
        if (pct > maxEmptyPct) problems.push(`Field "${field}" is empty in ${pct}% of sampled items.`);
    }
    return problems;
}
```

And the part that fetches the data. It needs Node 18+ for the built-in `fetch`, and goes in the same file as `checkRuns`:

```js
const API = 'https://api.apify.com/v2';
const token = process.env.APIFY_TOKEN;

async function api(path) {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
}

// Skip runs that are still going, so a check that fires mid-run doesn't raise a false alarm.
export const finishedRuns = (items, n = 5) => items.filter((r) => !['READY', 'RUNNING'].includes(r.status)).slice(0, n);

async function main() {
    const [actorId, fields = ''] = process.argv.slice(2);   // e.g. "username~my-scraper" "price,seller.name"
    if (!token || !actorId) { console.error('Set APIFY_TOKEN and pass an Actor ID.'); process.exit(2); }
    const list = finishedRuns((await api(`/acts/${actorId}/runs?desc=1&limit=10`)).data.items);
    const runs = [];
    for (const run of list) {
        if (run.status !== 'SUCCEEDED') { runs.push({ status: run.status, itemCount: 0, items: [] }); continue; }
        const ds = (await api(`/datasets/${run.defaultDatasetId}`)).data;
        // Only the newest run needs its items checked.
        const items = runs.length === 0 ? await api(`/datasets/${run.defaultDatasetId}/items?limit=200`) : [];
        runs.push({ status: run.status, itemCount: ds.itemCount, items });
    }
    const problems = checkRuns(runs, { requiredFields: fields.split(',').filter(Boolean) });
    console.log(problems.length ? `UNHEALTHY ${actorId}\n- ${problems.join('\n- ')}` : `OK ${actorId}`);
    process.exit(problems.length ? 1 : 0);
}

// Run main() only when executed directly, not when imported by tests.
if (process.argv[1]?.endsWith('check-runs.mjs')) main().catch((e) => { console.error(e.message); process.exit(2); });
```

**Exit codes:** 0 means OK, 1 means unhealthy data, 2 means the check itself failed (no token, an HTTP error, a wrong Actor ID). Alert on 1 and 2 separately: "the data is bad" and "the checker is broken" need different fixes.

Run it from cron or a CI schedule after your scrapers usually finish:

```bash
node check-runs.mjs username~my-scraper price,url
```

**The token.** Apify tokens have full access by default. Create a separate token with limited permissions in Apify Console, under the API settings (the exact menu names may differ), with read access only to the Actor and its storages. If the runs call fails with a permission error, check the token's Actor permissions first. In CI, store the token as a secret variable. Locally, load `APIFY_TOKEN` from a secrets manager or an untracked env file instead of typing it on the command line, where it ends up in shell history.

Things to know before relying on the script:

- **The median needs history.** With fewer than three finished successful runs there's nothing to compare against, so the count check stays quiet.
- **One Actor, several tasks.** If the Actor runs from several tasks with different inputs, a 50-item test task and a 5,000-item production run make the median meaningless. Check each task on its own with `GET /v2/actor-tasks/{taskId}/runs`.
- **It reads the first 200 items, not a random sample.** Breakage that starts late in a run can be missed. Add `&desc=1` to the items call to check the last items as well, or use `offset`.
- **Schema drift** (a field silently disappearing) is a cheap addition: compare `Object.keys()` of the newest item with an item from an older run.
- **These are heuristics.** They reduce the chance of a silent failure; they can't prove the data is right.

## 3. Or use a ready-made Actor

If you'd rather not maintain a script, several developers publish Actors in the Apify Store for this kind of check, for example [Output Completeness Monitor](https://apify.com/ryanclinton/output-completeness-monitor) and [Dataset Drift Monitor](https://apify.com/checksmithcats/dataset-drift-monitor). Pricing differs.

**Disclosure:** I built one of them, [Scraper Output Guard](https://apify.com/lineagersiui/scraper-output-guard), so weigh this accordingly.

- **Checks:** the same kind as the script above (median-based count drops, empty required fields), plus schema drift, duplicates, and runs that asked for N items (`maxItems`, `maxResults`...) but returned far fewer.
- **What it reads:**
  - run metadata;
  - each run's input, only to compare those item limits (input values are never output);
  - up to 1,000 items per run.
- **Output and price:** one verdict per Actor, for up to 50 Actors per run. It costs $0.005 per Actor checked. Running it with no input gives a free demo on sample data, with no events charged.

The script in this post does the core of it for free, and Apify's free monitoring may be all you need.

## Summary

- `SUCCEEDED` means the run didn't crash. It doesn't mean the data is good.
- Set up Apify's free monitoring first.
- If your counts vary or you run many third-party Actors, compare each run with its own recent history and check the fields you depend on.
- Whatever you use, alert on content, not just status.

*Drafted with AI tools (an AI agent) under my direction and reviewed by a separate AI agent. Not affiliated with or endorsed by Apify. The check logic (`checkRuns`) is unit-tested. The API-fetching part follows the Apify API v2 reference but has not yet been run against a live account.*
