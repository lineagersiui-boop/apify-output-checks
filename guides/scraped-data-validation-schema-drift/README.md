# How to validate scraped data: missing fields, wrong types and schema drift

Scraped data can look fine and still be wrong. The file opens, the row count is plausible, and yet a column is blank, a price has turned into text, or a field you rely on has vanished. This guide shows how to check the data itself, starting with free methods. A hosted option is mentioned at the end, with disclosure.

If your concern is mainly runs that succeed but return too few items, see [Silent scraper failures](../silent-scraper-failures/README.md). This guide is about what is inside the items.

## What usually goes wrong

- **Missing field:** the key is absent from some or all items, often after the source site changes its page layout.
- **Empty field:** the key exists but holds `null`, `""` or whitespace.
- **Type change:** a number arrives as a string (`"19.99"` vs `19.99`), or a single value becomes a list.
- **Format change:** dates, currencies or units switch format (for example `2026-10-31` becomes `31/10/2026`).
- **Renamed or moved field:** `price` becomes `pricing.amount`. Nothing is "missing", but your downstream code no longer finds it.
- **Duplicates:** the same record appears many times.
- **Schema drift:** any of the above happening between one run and the next. It is the hardest to notice, because each run on its own looks plausible.

## Step 0 (free): write down what "good" looks like

Before choosing a tool, list for your dataset:

1. The fields you actually depend on (not every field).
2. For each, the expected type and an example of a valid value.
3. Which may legitimately be empty, and which never should be.
4. What makes a record unique (a URL, an ID).

Every method below is only as good as this list. A 10-line list is enough.

## Method 1 (free): spreadsheet checks

Export the dataset to CSV or Excel and open it in any spreadsheet.

- **Blank counts:** filter each key column for blanks. Compare the count with the total rows.
- **Type problems:** sort a numeric column. Text values usually sort to one end, so they stand out.
- **Format problems:** sort or filter a date column and look at the extremes.
- **Duplicates:** use the spreadsheet's built-in remove-duplicates or conditional-formatting duplicate highlight on your unique key. Review before deleting.
- **Compare two runs:** put the header rows from two exports side by side. A column that appears or disappears is schema drift.

Limits: manual, practical for thousands of rows rather than millions, and CSV flattening can hide nested-field changes.

## Method 2 (free): validate against a JSON Schema

If your data is JSON, you can describe the expected shape in a JSON Schema (required fields, types, allowed patterns) and run a validator over each item. Free open-source validators exist for most languages, and many editors can validate a JSON file against a schema. I haven't compared specific validators, so I don't name any; search for "JSON Schema validator" for your language.

What this catches well: missing required fields, wrong types, values outside a pattern.
What it does not catch: values that are valid but wrong (a price of `0`), a field that quietly goes empty if you allowed empty strings, or too few items.

Tip: keep the schema strict about the fields you depend on and loose about the rest, so harmless new fields don't raise alarms.

## Method 3 (free): if you use Apify, check its own features first

Apify's documentation describes a dataset schema feature and free monitoring and alerts in the Console. Read the current Apify docs on "dataset schema" and "monitoring" to see what applies to your Actor and plan. I haven't tested these features for this guide, and what they offer can change. Fixed alerts tend to be a weak fit when result counts vary a lot, or when you run many Actors.

## Method 4 (free): compare the field set between runs

Schema drift can be found without a full schema:

1. Take a sample of items from the latest run and from an earlier good run.
2. List the keys that appear in each, and what share of items has each key.
3. Flag any key whose share dropped sharply, and any key that is new.

A key present in 98% of items last week and 40% today is a stronger signal than any single bad item. Do this by hand with a spreadsheet pivot, or script it yourself.

## Method 5 (free): a script of your own

If you are comfortable with code, you can combine Methods 2 and 4: validate each item, count failures per field, and compare with the previous run. This guide includes no script, because I haven't tested one for this purpose. Two cautions: sample large datasets rather than loading everything, and keep API tokens read-only and out of source control.

## Hosted option (disclosure: I built this)

I made an Apify Actor, [Scraper Output Guard](https://apify.com/lineagersiui/scraper-output-guard). I earn fees when it is used, and it is new and has few users.

What it does, per its listing:
- Looks at recent runs of Apify Actors that your API token can read, using a limited-permission token you provide (the listing recommends read access only), and gives each Actor one verdict (ok/healthy, warning or unhealthy) with reasons.
- Checks failed-run rate, item-count drops against recent runs, early stops, empty required fields, schema drift between runs, and duplicates.
- Samples up to 1,000 items per run.
- A free demo is available that needs no token.
- Pricing at time of writing: pay per event, $0.005 per Actor checked. Check the listing for current prices.

What it does not do:
- It only checks Apify Actor runs, not CSV files or databases.
- The checks are heuristics, not proof that the data is correct. A consistently wrong value will look normal to it.
- It does not validate values against your own business rules (for example, "price must be above zero").

Use the free methods first. Consider the Actor if you run several Apify scrapers whose runs your token can read and want the same checks applied to all of them without maintaining your own script.

## A simple routine

1. Write your "good" list (Step 0).
2. Validate each new dataset (Method 1 or 2) before it feeds anything else.
3. Compare field coverage with the last good run (Method 4).
4. When something fails, check the source page by hand before assuming the scraper is at fault. The site may have changed legitimately.
5. Update your list when the change is real.

---

Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

**Testing note:** This guide contains no code. The Actor's description, price and limits come from its public listing as read on 2026-10-31, not from a new test for this guide. The spreadsheet and JSON Schema methods are general practice and were not run against a specific dataset for this guide. Apify's dataset schema and monitoring features were not tested here; check the current Apify docs. No specific third-party tools were compared.
