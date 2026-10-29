// check-runs.mjs: flag Apify Actor runs that SUCCEEDED but returned suspicious data.
// Node 18+ (built-in fetch). Usage:
//   node check-runs.mjs username~actor-name price,url
// APIFY_TOKEN must be set in the environment (a CI secret, or loaded from an untracked env file), not typed inline.
// Arguments: the Actor ID ("username~actor-name" or the ID) and an optional comma-separated list of required fields.
// Exit codes: 0 OK, 1 unhealthy, 2 the check itself failed (no token, HTTP error, bad Actor ID).
const API = 'https://api.apify.com/v2';
const token = process.env.APIFY_TOKEN;

async function api(path) {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
}

// Pure check, so it can be tested without the API. runs: [{ status, itemCount, items }], newest first.
export function checkRuns(runs, { requiredFields = [], maxDropPct = 50, maxEmptyPct = 30 } = {}) {
    const problems = [];
    const [latest, ...older] = runs;
    if (!latest) return ['No runs found.'];
    if (latest.status !== 'SUCCEEDED') return [`Latest run status is ${latest.status}.`];

    // 1. Item count far below the median of earlier successful runs.
    const counts = older.filter((r) => r.status === 'SUCCEEDED').map((r) => r.itemCount).sort((a, b) => a - b);
    if (counts.length >= 2) {
        const median = counts[Math.floor(counts.length / 2)];
        if (median > 0 && latest.itemCount < median * (1 - maxDropPct / 100)) {
            problems.push(`Item count ${latest.itemCount} is more than ${maxDropPct}% below the recent median ${median}.`);
        }
    }
    if (latest.itemCount === 0) problems.push('Latest run returned 0 items.');

    // 2. Required fields that are empty in too many sampled items.
    const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    for (const field of requiredFields) {
        if (!latest.items.length) break;
        const empty = latest.items.filter((it) => isEmpty(field.split('.').reduce((o, k) => o?.[k], it))).length;
        const pct = Math.round((100 * empty) / latest.items.length);
        if (pct > maxEmptyPct) problems.push(`Field "${field}" is empty in ${pct}% of sampled items.`);
    }
    return problems;
}

// Skip runs that are still going, so a check that fires mid-run doesn't raise a false alarm.
export const finishedRuns = (items, n = 5) => items.filter((r) => !['READY', 'RUNNING'].includes(r.status)).slice(0, n);

async function main() {
    const [actorId, fields = ''] = process.argv.slice(2);
    if (!token || !actorId) { console.error('Set APIFY_TOKEN and pass an Actor ID.'); process.exit(2); }
    const list = finishedRuns((await api(`/acts/${actorId}/runs?desc=1&limit=10`)).data.items);
    const runs = [];
    for (const run of list) {
        if (run.status !== 'SUCCEEDED') { runs.push({ status: run.status, itemCount: 0, items: [] }); continue; }
        const ds = (await api(`/datasets/${run.defaultDatasetId}`)).data;
        // Only the newest run needs a content sample.
        const items = runs.length === 0 ? await api(`/datasets/${run.defaultDatasetId}/items?limit=200`) : [];
        runs.push({ status: run.status, itemCount: ds.itemCount, items });
    }
    const problems = checkRuns(runs, { requiredFields: fields.split(',').filter(Boolean) });
    console.log(problems.length ? `UNHEALTHY ${actorId}\n- ${problems.join('\n- ')}` : `OK ${actorId}`);
    process.exit(problems.length ? 1 : 0);
}

// Run main() only when executed directly, not when imported by the tests.
if (process.argv[1]?.endsWith('check-runs.mjs')) main().catch((e) => { console.error(e.message); process.exit(2); });
