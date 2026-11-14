# How to find UK government contracts as a small business (free methods first)

Public bodies in the UK advertise many contracts openly, and small businesses can bid for them. This guide shows how to find them using free official tools. It is a beginner how-to: where to look, how to set up a first search, and how to pull the data yourself if you want to.

Near the end I mention an Apify Actor I made, for people who want one combined feed. Skip that section if the free tools are enough.

Portal menus and wording change. Check each live page before relying on a step.

## The short version

1. Search Contracts Finder by hand to see what your kind of work looks like.
2. Save the search and turn on email alerts.
3. Do the same on Find a Tender, which has a filter for opportunities marked suitable for small businesses.
4. If you are comfortable with data, use the free Contracts Finder OCDS API (see Method 3).
5. Read each notice in full before deciding whether to bid.

## Method 1: search Contracts Finder by hand

Contracts Finder is the UK government's search service for business opportunities: https://www.contractsfinder.service.gov.uk

When I loaded its search page I saw:

- A **keywords** box, labelled as covering "contract title, description and buyer."
- A **contract location** choice: all locations, a region (the page lists UK nations and other areas such as Europe and Rest of the World), or a postcode with a radius of 5 to 50 miles.
- **Procurement stage** checkboxes: Early engagement, Future opportunity, Opportunity and Awarded contract.

How I would start:

1. Type two or three words that describe what you sell, as a buyer might write them. Try plain words ("cleaning", "website", "printing") before jargon.
2. Tick **Opportunity** to see contracts you can bid for now.
3. Tick **Future opportunity** and **Early engagement** in a separate search to see what is coming. These can give you time to prepare.
4. Search again with **Awarded contract** to see who won similar work. This is useful research on buyers and typical contracts.
5. Use the location filter if you can only serve a local area.

Keyword syntax shown on the page: separate words with a space for OR (`radio television`), join with `+` for AND (`administration+defence`), and wrap an exact phrase in quotes (`"Department of Health"`).

Useful habits:

- Run several narrow searches rather than one broad one.
- Search the words buyers use. If you call it "branding" and they call it "graphic design services", you will miss it.
- After you run a search, the results page offers a download as CSV or XML (check the live page). Keep a simple spreadsheet of notices worth following up.

## Method 2: saved searches and email alerts

Searching every morning gets tedious. Both main UK portals let you save a search and get emailed.

**Contracts Finder.** The official wording says you can sign in or register, save a search, and "choose to receive emails when new notices are published that meet your search criteria." I could not verify from official pages how often emails are sent or exactly which notices trigger one. Check your account settings.

**Find a Tender** (https://www.find-tender.service.gov.uk). This is the other main UK portal, and its service page describes it as a Beta service. GOV.UK's short guide for suppliers says:

- You can save a search and "select how frequently you would like a notification emailed to you."
- A **Suitability** filter lets you choose "Small and medium-sized enterprises", which shows opportunities marked as particularly suitable for SMEs. The buyer sets that marker, so it is a hint, not a guarantee.

Per its service page, Find a Tender uses GOV.UK One Login for sign-in. The GOV.UK short guide points to walkthrough videos for registering on the Central Digital Platform, which suppliers use to register their details with buyers. I did not verify the registration steps. Look at the official videos before you start.

Which portal covers what, according to the Find a Tender service page:

- For new UK procurements from 24 February 2025, both above-threshold and below-threshold notices are published there. The exception is below-threshold notices in Scotland.
- For earlier procurements, only above-threshold notices appear there. The page says this is usually contracts over £139,688 including VAT.
- Below-threshold contracts are also listed on other sites. The page names Contracts Finder, Public Contracts Scotland, Sell2Wales, and eSourcing NI or eTendersNI.

So if you work in Scotland, Wales or Northern Ireland, check the relevant national portal too. For a step-by-step on alerts across the UK and EU portals, see my earlier guide (linked under Related).

## Method 3: the free Contracts Finder OCDS API

If you are comfortable with data, Contracts Finder publishes notices through an API that follows the Open Contracting Data Standard (OCDS). The API page I read does not state any sign-up or authentication requirement.

From the official API documentation page:

- Endpoint: `https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search`
- Optional `publishedFrom` and `publishedTo`, in ISO 8601 format.
- Optional `stages`, comma-separated, from `planning`, `tender`, `award` and `implementation`.
- Optional `limit`, default 100, range 1 to 100.
- Optional `cursor`, "to get the next set of results." The page does not name the field that returns the next cursor, so I could not confirm how paging works. Read the live docs.
- Response: an OCDS release package, as JSON, with a `releases` array. The sample is OCDS version 1.1.
- Licence: the sample points to the Open Government Licence v3.0.
- Rate limits: a 403 response means you may have exceeded the limit, and the documentation says to make no further requests for 5 minutes.

Example request, adapted from the official example (**not tested** by me):

```
https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search?publishedFrom=2026-11-01T00:00:00&publishedTo=2026-11-02T00:00:00&stages=tender&limit=100
```

You can paste this into a browser to see the JSON, or fetch it with any tool you like. Things to bear in mind:

- OCDS JSON is nested and verbose. Expect to write a small script, or use a spreadsheet import tool, to turn it into rows.
- The API does not appear to offer keyword search. That is my reading of the documented parameters, not something I tested. You would filter the results yourself.
- Check the date-filter behaviour. I have not verified whether the API's date filters match on publication date only or also on edited dates, so test with a short date range.
- The API covers Contracts Finder. Find a Tender has its own separate API, which I have not covered here.

If you do not write code, skip this method. Methods 1 and 2 cover most small businesses.

## From a notice to a decision

Finding the notice is the first step. Before you spend time on a bid:

1. Read the whole official notice. The deadline, the requirements and how to apply are in the notice and its linked documents, not in an alert email.
2. Check the deadline against the time you realistically need.
3. Check that the contract's size and location suit you.
4. Look at awarded contracts from the same buyer to see what they bought before.
5. Keep a list of notices you looked at and why you passed or went ahead. It helps you refine your searches.

I am not giving legal or procurement advice. Rules, thresholds and portals change, so rely on official guidance.

## If you want one combined, scheduled feed (disclosure: I made this)

I built an Apify Actor called **UK Find a Tender & Contracts Finder + EU TED Tender Feed** (`public-tender-feed`). I made it with AI tools. I am not a government body, a portal or Apify. It is paid, with a free demo. Only consider it if you want UK and EU notices in the same format, or want to send new notices to a spreadsheet or another system. The free tools above are enough for many small businesses.

What it does, per its README:

- It reads the official Find a Tender and Contracts Finder APIs and the EU's TED Search API, and returns one normalised record per notice. UK notices are de-duplicated across the two UK portals.
- You can filter by keyword, CPV code, country, minimum and maximum value, and published-since date.
- An "only new notices" option returns only notices it has not returned before for that filter set. You can run it on a schedule with Apify's scheduler.

What it does not do:

- It is not a bid-writing tool. It does not write, check or submit bids, and it does not tell you whether you would win.
- It covers opportunity notices only, not awards.
- It does not register you with any portal.
- It is not guaranteed complete. It reads the UK APIs in capped pages per run, so a long gap between runs can miss older notices. A `SUMMARY` record shows each source's status.
- Many notices publish no value, and values are not converted between currencies.
- Descriptions are shortened and contact details are removed on a best-effort basis. The official notice is the authentic version.

Pricing: pay per event, **$0.003 per notice returned** ($3 per 1,000). The free demo, duplicates removed in a run, notices skipped as already seen, empty runs and failed sources are not billed. You can set a maximum charge per run in Apify's run options.

Free demo: run it with empty keywords, CPV codes and countries. It returns up to 10 notices from the last 24 hours, and the demo is not billed.

Link: https://apify.com/lineagersiui/public-tender-feed

Open an issue on the Actor's Issues tab if something looks wrong.

## Related

- My earlier guide, "How to get alerts for new UK and EU public tenders for free": ../uk-eu-public-tender-alerts-free/README.md
- My earlier guide, "CPV codes: how to find relevant UK tenders": ../cpv-codes-find-relevant-uk-tenders/README.md

## Sources

- Contracts Finder search: https://www.contractsfinder.service.gov.uk/Search
- Contracts Finder search results (saved searches, email alerts, CSV/XML download): https://www.contractsfinder.service.gov.uk/Search/Results
- Contracts Finder OCDS API documentation: https://www.contractsfinder.service.gov.uk/apidocumentation/Notices/1/GET-Published-Notice-OCDS-Search
- Find a Tender: https://www.find-tender.service.gov.uk
- GOV.UK Procurement Act 2023 short guide for suppliers: https://www.gov.uk/government/publications/procurement-act-2023-short-guides/buyers-and-suppliers-how-to-use-the-central-digital-platform-the-enhanced-find-a-tender-service-html

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

*Testing note: the portal and API details come from the official pages named above, read on 2026-11-10. I did not run the portal steps end to end with a live account, and I did not run the example API request. The guide's only code is that one URL, marked not tested. The Actor's behaviour is described from its README, input schema and live listing. I did not run it for this guide.*
