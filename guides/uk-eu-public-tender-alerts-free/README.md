# How to get alerts for new UK and EU public tenders for free

If you bid for public contracts, you can get alerts about new UK and EU tenders without paying anyone. Each official portal has its own free alert tool. This guide covers three of them:

1. Contracts Finder
2. Find a Tender
3. TED, the EU's Tenders Electronic Daily

Near the end I mention an Apify Actor I made, for people who want one combined, scheduled feed. Skip that section if the free tools are enough.

Portal menus and wording change. Check each live page before relying on a step.

## 1. Contracts Finder: saved-search email alerts

Contracts Finder is the UK government's search service for business opportunities. It is at https://www.contractsfinder.service.gov.uk.

1. Open the search page and enter your search terms.
2. Apply the filters you want. The search page offers filters for notice stage, contract location and publication date. The stage filter lists Early engagement, Future opportunity, Opportunity and Awarded contract. For alerts you will usually want Opportunity.
3. Choose to save the search. The site asks you to "sign in to your account or register." Saving puts the search in your list of saved searches.
4. Choose to receive emails. The site says you can "choose to receive emails when new notices are published that meet your search criteria."
5. Manage the saved search later from your saved searches list.

What I could not verify on the official pages:
- how often the emails are sent, and whether you can choose a frequency
- exactly which notices trigger an email, such as new notices only or edited ones too

Check these in your account settings. Note that the publication date filter "also searches last edited dates", so a date-filtered search can show notices that were edited recently, not only newly published ones.

Contracts Finder holds information from 26 February 2015 onward. Earlier material is in its archive.

## 2. Find a Tender: saved searches and email notifications

Find a Tender is at https://www.find-tender.service.gov.uk. Its service page says it is a Beta service, so features may change.

1. Sign in with a GOV.UK One Login. You can create one if you do not have one.
2. Search notices and filter them. The official guide mentions filters for notice type, SME suitability and contract location.
3. Save the search and name it. GOV.UK's short guide says you can "name the search and select how frequently you would like a notification emailed to you."
4. You then get an email when someone posts a notice that meets your criteria.

Coverage on Find a Tender, according to its service page:
- For new UK procurements from 24 February 2025, both above-threshold and below-threshold notices are published there. The exception is below-threshold notices in Scotland.
- For earlier procurements, only above-threshold notices are published. The page says this is usually contracts over £139,688 including VAT.
- Below-threshold contracts are also listed on other sites. The page names Contracts Finder, Public Contracts Scotland, Sell2Wales, and eSourcing NI or eTendersNI.

Because Contracts Finder and Find a Tender can overlap, you may see the same opportunity in both sets of alerts. Set up both if you are not sure where your target buyers publish.

## 3. TED (EU): saved searches, alerts and RSS

TED is at https://ted.europa.eu. TED's help page for its dashboard features lists these:

- You can save up to 25 searches.
- You can view and modify search alerts and notice alerts.
- You can create a search alert from the search results page.
- You can create an alert from a notice's page.
- You can create RSS feeds for your saved search profiles.
- You can adjust your TED account preferences. This includes how many items appear in custom RSS feeds.

TED also publishes ready-made RSS feeds. The one I checked was labelled "TED | Research and Development". TED's page says you can subscribe by dragging the feed button or the feed URL into a news reader, or by copying and pasting the URL into one. It also lists some web-based news readers.

I did not verify the exact menu names for creating an alert or the registration steps. I also did not verify how often alert emails are sent. Look at your TED account page.

## Tips for any of the three

- Start with a narrow search, then widen it. A broad keyword can produce a lot of email.
- Public notices use CPV codes (Common Procurement Vocabulary). If a portal lets you filter by CPV, it is more precise than keywords alone.
- Always read the official notice before you bid. Deadlines and requirements are in the notice, not in an alert email.
- Keep one spreadsheet of the alerts you set up on each portal, so you know what is covered and what is not.

## If you want one combined, scheduled feed (disclosure: I made this)

I built an Apify Actor called **UK Find a Tender & Contracts Finder + EU TED Tender Feed** (`public-tender-feed`). I made it with AI tools, and I am not a government body or a portal. It is paid, though it has a free demo. Pick this only if you want the same notice format from all three sources, or want to send new notices on to a spreadsheet or another system yourself. Otherwise the free alerts above are enough.

What it does, per its README:
- It reads the official Find a Tender and Contracts Finder APIs and the TED Search API.
- It returns one normalised record per notice. UK notices are de-duplicated across the two UK portals.
- Inputs include keywords, CPV codes or prefixes, countries (ISO codes), published-since, minimum and maximum value, "only new notices since my last run", maximum notices per run and which sources to use.
- Each record includes the source, notice ID, title, shortened description, buyer name, country, CPV codes, estimated value and currency where published, publication date, deadline, procedure type, a link to the official notice, and licence attribution.
- With "only new" turned on, scheduled runs return only notices it has not returned before for that filter set. Apify's scheduler can run it on a timetable you choose.

Limits you should know about:
- It covers opportunity notices only, not awards.
- Many notices publish no value. Values are compared in each notice's own currency, with no conversion.
- It is not guaranteed complete. The UK APIs are read page by page with caps per run, so a long gap between runs can miss older notices. A `SUMMARY` record shows each source's status.
- Contact details are removed on a best-effort basis, so a personal name can occasionally remain in a description.
- Descriptions are shortened, so the official notice is the authentic version.

Pricing: pay per event, **$0.003 per notice returned** ($3 per 1,000). The demo is not billed. Duplicates removed within a run, notices skipped as already seen, empty runs and failed sources are not billed either. You can set a maximum charge per run in Apify's run options.

Free demo: run it with empty keywords, CPV codes and countries. It returns up to 10 notices from the last 24 hours, and the demo is not billed.

Link: https://apify.com/lineagersiui/public-tender-feed

Open an issue on the Actor's Issues tab if something looks wrong.

## Sources

- Contracts Finder: https://www.contractsfinder.service.gov.uk/Search
- Find a Tender: https://www.find-tender.service.gov.uk
- GOV.UK Procurement Act 2023 short guide for suppliers: https://www.gov.uk/government/publications/procurement-act-2023-short-guides/buyers-and-suppliers-how-to-use-the-central-digital-platform-the-enhanced-find-a-tender-service-html
- TED help (features): https://ted.europa.eu/en/help/about-ted
- TED RSS example feed: https://ted.europa.eu/en/simap/rss-feed/-/rss/search/reco

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

*Testing note: the portal steps are taken from the official pages quoted above and were not run end to end with a live account. This guide contains no code. The Actor's behaviour is described from its README and input schema; I did not run it for this guide.*
