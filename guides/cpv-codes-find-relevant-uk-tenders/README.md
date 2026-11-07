# CPV codes: how to find relevant UK tenders

If you search UK public tenders by keyword alone, you will miss notices that describe your work in different words and see many that are irrelevant. CPV codes can help. This guide explains what they are, how to pick them, and how to combine them with keywords. It leads with free methods.

At the end I mention an Apify Actor I made that filters by CPV. Skip that section if the free tools are enough.

Portal menus and wording change. Check each live page before relying on a step.

## What a CPV code is

CPV is the Common Procurement Vocabulary, a standard list of codes for what is being bought. It was set up by EU Regulation (EC) No 2195/2002 and is used on UK and EU tender notices. A buyer picks one or more codes for a notice.

As commonly described, a code has eight digits plus a ninth check digit after a hyphen (for example `72000000-5`). The digits are hierarchical:

- the first 2 digits are the division (a very broad area)
- the first 3 are the group
- the first 4 are the class
- the first 5 are the category
- digits 6 to 8 narrow it further

A code ending in zeros is a broad parent. For example, `72000000` is the IT services division, and every code starting `72` sits beneath it. Different sources name the middle levels slightly differently, so treat the names as labels, not rules.

Fact worth knowing: a notice can carry several CPV codes, so one tender can match more than one of your searches.

## Step 1: find your codes (free)

1. Search the official CPV list for the words you would use to describe your work. The EU publishes the vocabulary and a guide to it (see Sources). Several tender-software vendors also publish free CPV lookup pages, but they are commercial, so check what they show against the official list.
2. Better still: find 3 to 5 past notices for work like yours on Find a Tender or Contracts Finder and note which CPV codes the buyers chose. Buyers' real choices are often not the code you would have guessed.
3. Write down a short list, with a few specific codes and one or two broader parent codes.

## Step 2: use the CPV filter on Find a Tender (free)

Find a Tender (https://www.find-tender.service.gov.uk) needs a GOV.UK One Login to save searches. A third-party guide I read describes a filter view in its Notices section where you can search for a CPV code by number or by title. I could not confirm that on an official GOV.UK page, so look for the CPV option in the live filters.

Once the filters are set, save the search and choose how often you want an email, as in my earlier guide on free tender alerts (link below). Make one saved search per cluster of codes rather than one huge one.

## Step 3: Contracts Finder (free), with keywords

Contracts Finder (https://www.contractsfinder.service.gov.uk) is the main UK site for below-threshold notices. When I fetched its search page, I saw a keyword box ("Can include contract title, description and buyer") plus contract-location and procurement-stage filters. I did not see a CPV filter on that page, though the page may render differently for you. If you do not see one, use keywords for Contracts Finder and use CPV on the portals that offer it.

## Broad codes plus keywords

Practical patterns that work with any tool:

- **Start broad, then narrow.** Begin at the 2 or 3 digit level and read what comes back. If it is mostly noise, move down to 4 or 5 digits or add a keyword.
- **Keep a parent code as a safety net.** Buyers sometimes choose a general code rather than the exact one for your service. A broad saved search catches those.
- **Use Contracts Finder's keyword syntax.** Its search box accepts space-separated words (OR), `+` (AND) and "exact phrases", per the live page when I checked.
- **Use keywords for what CPV cannot express.** A code says what category of thing it is. A keyword can say "framework", a product name, a location or a sector.
- **Do not rely on CPV alone.** Some notices may have missing or poorly chosen codes. A keyword-only saved search alongside your CPV search will catch some of these. I have not measured how often this happens.
- **Review and prune.** After a few weeks, drop codes that only ever send irrelevant notices and add the codes you see on notices you would have bid for.
- **Always read the notice.** The CPV code is the buyer's label, not a guarantee the work matches yours.

## If you want CPV filtering in a scheduled feed (disclosure: I made this)

I built an Apify Actor called **UK Find a Tender & Contracts Finder + EU TED Tender Feed** (`public-tender-feed`). I made it with AI tools. It is paid, with a free demo. I am not a government body, a portal, or Apify. Only consider it if you want the same record format across sources, or want to send new notices on to a spreadsheet or another system. The free alerts above are enough for many people.

What it does with CPV, per its README and source code:

- The `cpvCodes` input takes full codes or prefixes. `72` means everything in the IT services division. Hyphens and the check digit are accepted. The input validator accepts digits such as `72000000` or `72`, and rejects a list with no valid code, before anything is fetched or charged.
- A code ending in zeros is treated as a broader prefix: `72000000` is matched as `72`, and `45233120` is matched as `4523312`. If you want an exact narrow code, the trailing zeros are removed first, so a full-length code that ends in zeros acts as a parent.
- Matching is by prefix against each notice's CPV codes, including item-level codes, so a notice matches if any of its codes starts with one of yours.
- You can give up to 30 codes.
- If you give both CPV codes and keywords, a notice must match a CPV prefix and also contain at least one keyword in its title or description. Combining them therefore narrows results. It does not broaden them. A notice with no CPV code will not match when you set a CPV filter, so if you want to catch uncoded notices, run a second keyword-only filter set.
- Each output record includes a `cpvCodes` array, along with the source, notice ID, title, shortened description, buyer name, country, estimated value and currency where published, publication date, deadline, procedure type, and a link to the official notice.
- TED applies the CPV filter on its own servers. The UK APIs have no CPV or keyword search, so the Actor reads recent UK notices page by page and filters them itself.

Limits you should know about:

- It covers opportunity notices only, not awards.
- It is not guaranteed complete. Per run it reads up to 2,400 Find a Tender releases (about the last 5 days at current volumes, per its README) and up to 1,000 Contracts Finder releases. When a cap ends reading early, the `SUMMARY` record shows it and older notices are not returned. Schedule it often enough that a gap does not exceed what a run can cover.
- Many notices publish no value, and values are not converted between currencies.
- Descriptions are shortened and contact details are removed on a best-effort basis. The official notice is the authentic version.

Pricing: pay per event, **$0.003 per notice returned** ($3 per 1,000). The demo, duplicates removed within a run, notices skipped as already seen, empty runs and failed sources are not billed. You can set a maximum charge per run in Apify's run options.

Free demo: run it with empty keywords, CPV codes and countries. It returns up to 10 notices from the last 24 hours and is not billed. Use it to see what the `cpvCodes` field looks like before you choose codes.

Link: https://apify.com/lineagersiui/public-tender-feed

Open an issue on the Actor's Issues tab if something looks wrong.

## Related

- My earlier guide, "How to get alerts for new UK and EU public tenders for free": ../uk-eu-public-tender-alerts-free/README.md

## Sources

- EU Regulation (EC) No 2195/2002 (Common Procurement Vocabulary) and the EU's CPV guide: search for these by name on the official EU sites (EUR-Lex, TED). I have not linked a direct URL because I could not confirm one opens.
- Contracts Finder search: https://www.contractsfinder.service.gov.uk/Search
- Find a Tender: https://www.find-tender.service.gov.uk

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

*Testing note: the portal steps come from the pages named above and a third-party guide, and were not run end to end with a live account. The CPV structure is summarised from secondary descriptions of the EU vocabulary, and I could not open the primary documents to quote them. This guide contains no code. The Actor's CPV behaviour is described from its README, input schema and source code; I did not run it for this guide.*
