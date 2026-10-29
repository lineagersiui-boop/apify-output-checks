# Run via the Apify API

Run the check synchronously and get the verdicts back in one call. `input.json` is one of the example inputs, with your limited-permission token filled in:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $APIFY_TOKEN" -H "Content-Type: application/json" \
  --data @input.json \
  "https://api.apify.com/v2/acts/lineagersiui~scraper-output-guard/run-sync-get-dataset-items?timeout=240"
```

The response is a JSON array with one item per Actor checked (see `demo-output.json`).

For long lists, start an asynchronous run instead with `POST .../acts/lineagersiui~scraper-output-guard/runs`, then read the run's default dataset when it finishes. See Apify's API docs: https://docs.apify.com/api/v2

To try it without a token, send `{}` as the input. That runs the free demo on built-in sample data, which isn't billed.
