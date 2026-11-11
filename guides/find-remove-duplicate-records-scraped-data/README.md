# How to find and remove duplicate records in scraped data

Scrapers often return the same record more than once. Pagination overlaps, retries and re-crawls all cause it. Duplicates inflate counts, skew prices and averages, and send the same lead twice. This guide covers free ways to find and remove them in an Apify dataset export, a JSON file or a CSV file.

## Step 1: Decide what "duplicate" means

Pick a **key**, meaning the field or fields that identify one real-world record.

- **Exact duplicate:** every field matches.
- **Key duplicate:** the key matches, but other fields differ, such as a scrape timestamp or a changed price. This is the usual case.

Good keys are a product URL, a SKU, a listing ID, an email address, or a combination such as name plus address. Avoid keys that change between runs, such as a timestamp or a position in the results.

Normalize before comparing. Trim spaces, lowercase the text, and strip tracking parameters from URLs (`?utm_...`). Otherwise `Example.com/a` and `example.com/a?utm_source=x` look different.

## Step 2: Get your data out

- **Apify dataset:** open the run's dataset and use Export. Pick CSV or JSON.
- **Other sources:** a CSV or JSON file works as it is.

Work on a copy and keep the original.

## Method A: Spreadsheet (no code)

1. Open the CSV in Excel, Google Sheets or LibreOffice.
2. **Find first.** Use conditional formatting with a "duplicate values" rule on your key column. It highlights repeated keys so you can look before deleting.
3. **Then remove.** Use the built-in "Remove duplicates" feature (Excel: Data tab. Google Sheets: Data > Data cleanup). Tick only the key column or columns.
4. Check the row count before and after. The difference is the number removed.

Caveats: the tool keeps the first row it meets for each key. If you want the newest record, sort by date, newest first, before removing. Spreadsheets also treat `ABC` and `abc` as the same value, but a stray trailing space makes two values different. Trim the column first.

## Method B: Command line (jq, sort)

*Code in this section is **not tested** by the author. Try it on a copy first.*

- **Whole lines, CSV or text:** `sort -u file.csv > deduped.csv` removes identical lines. This reorders rows and treats the header as an ordinary line, so put the header back afterwards.
- **By key in a JSON array with jq:** `jq 'unique_by(.url)' items.json > deduped.json` keeps one item per `url` value. `unique_by` also sorts the output by that key.

## Method C: PowerShell (Windows)

*Code in this section is **not tested** by the author. Try it on a copy first.*

- **CSV, exact rows:** `Import-Csv in.csv | Sort-Object * -Unique | Export-Csv out.csv -NoTypeInformation`
- **CSV, by key:** `Import-Csv in.csv | Sort-Object url -Unique | Export-Csv out.csv -NoTypeInformation`
- **To see which keys repeat:** `Import-Csv in.csv | Group-Object url | Where-Object Count -gt 1`
- **JSON array, by key:** `Get-Content items.json -Raw | ConvertFrom-Json | Sort-Object url -Unique | ConvertTo-Json -Depth 10`

`Sort-Object -Unique` is case-insensitive by default. It also reorders the rows.

## Method D: SQL

*Code in this section is **not tested** by the author. Adjust the table and column names.*

Load the CSV into SQLite, Postgres, or any tool that can import CSV files. Then:

- **Find repeated keys:** `SELECT url, COUNT(*) FROM items GROUP BY url HAVING COUNT(*) > 1;`
- **Keep the newest row per key:** `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY url ORDER BY scraped_at DESC) AS rn FROM items) AS t WHERE rn = 1;`

SQL is the best option when you must choose which duplicate to keep, or when the file is too big for a spreadsheet.

## Which method to use

| Situation | Suggested method |
|---|---|
| One-off, small file, want to look first | Spreadsheet |
| Quick exact-line cleanup | `sort -u` or PowerShell |
| JSON from a scraper | jq or PowerShell |
| Need "keep newest" or large data | SQL |

## Prevent duplicates, not only clean them

- Make the scraper's start URLs and pagination non-overlapping.
- Use a stable ID as the key when the site provides one.
- Check each run's output instead of only cleaning afterwards. A sudden jump in duplicates often means a scraper change or a site change.

## Disclosed mention: our Actor

I made an Apify Actor, [Scraper Output Guard](https://apify.com/lineagersiui/scraper-output-guard). I earn fees when it is used. It is new and has very few users and no reviews yet.

What it does, per its Store listing: it looks at the recent runs of your Apify Actors and gives each Actor a health verdict (healthy, warning or unhealthy) with reasons. It flags runs that succeed but return an empty dataset, an item-count drop against recent runs, early stops, empty required fields, schema drift, and duplicates. It samples up to 1,000 items per run.

It does not clean or delete anything. It only reports. You still use the methods above to fix the data. Real checks run with your Apify API token and cover the Actors that token can read. The demo does not need a token.

Pricing, per the listing at the time of writing: pay per event, $0.005 per Actor checked, with a free demo. Check the Store page for current pricing, because it can change.

If you only have a few files, the free methods above are enough.

## Testing note

I have not run the commands in this guide. They are standard usage of each tool, but check them on a copy of your data before relying on them. The spreadsheet steps are described from the tools' documented features. Menu names can differ between versions.

---

Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.
