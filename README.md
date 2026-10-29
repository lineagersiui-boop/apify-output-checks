# Apify output checks: catch scrapers that "succeed" with bad data

A scraper run can end with status `SUCCEEDED` and still be broken. Typical cases:
- it returned 40 items instead of 500;
- a key field went empty;
- the site changed and a field disappeared.

Status-based alerts don't catch these. This repository has ready-to-use **inputs, sample outputs and automation templates** for checking the *content* of your Apify Actor runs with [Scraper Output Guard](https://apify.com/lineagersiui/scraper-output-guard), a pay-per-event Apify Actor.

## What gets flagged
For each Actor you list, its most recent runs are compared:

| Check | Example reason in the output |
|---|---|
| Failed runs / high failure rate | latest run failed |
| Item-count drop vs recent median | `Item count 40 is more than 50% below the recent median 500.` |
| Early stop (asked for N, got far fewer) | `Input maxItems=500 but only 40 items (possible early stop).` |
| Empty required fields | `Field "price" empty in all 20 sampled items.` |
| Schema drift | `Fields no longer present: rating.` |
| Duplicates in the sample | repeated items reported |

**Verdicts:**
- Each Actor gets a verdict: `ok`, `warning` or `unhealthy`.
- An Actor that can't be read (wrong ID, missing access) gets `unknown`, and isn't billed.

**Minimum history:**
- The count-drop check needs at least 2 earlier successful runs.
- The failure-rate check needs at least 3 runs.

## Sample output
Real output of the Actor's free demo (no token, built-in synthetic data): [`examples/demo-output.json`](examples/demo-output.json). The excerpt below omits the `"demo": true` flag.

```json
{
  "actorId": "demo/truncated-scraper",
  "verdict": "unhealthy",
  "reasons": [
    "Item count 40 is more than 50% below the recent median 500.",
    "Input maxItems=500 but only 40 items (possible early stop)."
  ],
  "latestRunId": "d4",
  "latestItemCount": 40,
  "runsChecked": 3
}
```

## Inputs
- [`examples/input-basic.json`](examples/input-basic.json) contains a token placeholder and Actor IDs, with default thresholds.
- [`examples/input-strict.json`](examples/input-strict.json) adds required fields, tighter thresholds and problems-only output.

The token field needs an Apify API token that can read the Actors, runs, datasets and key-value stores you want checked. Apify tokens have full access by default, so create a separate token with limited permissions (read access to those Actors and their storages only). It is sent only to `api.apify.com`, and the Actor doesn't log it or write it to its output. The Actor also reads each checked run's input (from the run's key-value store), only to compare item limits such as `maxItems`. Only that limit number can appear in an early-stop reason; other input values are never written to the output.

## Guide
Want to build the check yourself first? [Catching silent scraper failures](guides/silent-scraper-failures/) compares Apify's free monitoring, a small DIY script and this Actor.

## Run it automatically
1. **Apify Task and Schedule (no code).**
   - In Apify Console, open the Actor and save your input as a **Task**.
   - Add a **Schedule** that runs the task daily, after your scrapers usually finish.
   - Open the dataset's *Verdicts* view. The `SUMMARY` record in the key-value store has the totals.
2. **GitHub Actions.**
   - Copy [`examples/github-actions/scraper-health.yml`](examples/github-actions/scraper-health.yml) into `.github/workflows/` of your own repository.
   - Add a repository secret `APIFY_TOKEN` and a `scraper-health-input.json` file. Use the format of `input-basic.json`, without `apiToken`.
   - The workflow fails, and GitHub notifies you, when any Actor is `unhealthy` or `unknown`.
   - The synchronous API call is limited to about 5 minutes, so split long Actor lists.
   - GitHub disables scheduled workflows after 60 days without repository activity.
3. **API (any scheduler).** See [`examples/run-via-api.md`](examples/run-via-api.md).

Make, Zapier and n8n can also start Apify Actors through Apify's own integrations.

## Pricing (set on Apify, may change; check the Actor's Pricing tab)
- **$0.005 per Actor successfully checked.** Checking 10 Actors once a day is about 300 events a month, roughly $1.50.
- **Not billed:** the demo and Actors that can't be read.
- **Cap:** you can set a maximum charge per run in Apify's run options.

## Limits
- These checks are heuristics. They can't prove your data is correct or complete.
- Up to 1,000 sampled items are read per run.
- The output contains field names and counts, not your item values.

## About
- Made by an independent developer. It isn't affiliated with or endorsed by Apify.
- The Actor and this repository were built with the help of AI tools, under the developer's direction. The examples were checked against the Actor's code and its demo output.
- Issues and suggestions are welcome in this repository's Issues.

License: MIT (examples and templates in this repository).
