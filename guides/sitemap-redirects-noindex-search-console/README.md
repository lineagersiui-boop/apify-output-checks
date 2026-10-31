# Sitemap full of redirects, noindex or 404 URLs? How to find and fix them

A sitemap is meant to list the pages you want search engines to index. In practice it often drifts: pages get deleted, URLs move, templates add `noindex`. This guide shows how to find those problem URLs, starting with free methods. A hosted option is mentioned at the end, with disclosure.

If you only want broken (404) links, see also [How to find broken URLs in your sitemap](../sitemap-broken-links/README.md). This guide is about the wider set of problems.

## What counts as a problem sitemap URL

- **404 or 410:** the page is gone. Remove it from the sitemap or restore it.
- **Redirect (301/302/307/308):** the sitemap should list the final URL, not one that bounces elsewhere.
- **Redirect chain:** A redirects to B, which redirects to C. List C.
- **noindex:** a URL you ask search engines to index, but which tells them not to. One of the two is a mistake. A noindex can be sent as an `X-Robots-Tag` HTTP header or as a robots meta tag in the page HTML.
- **Server errors (5xx):** may be temporary, so re-check before acting.
- **Blocked by robots.txt:** listed in the sitemap but disallowed for crawlers.

## Method 1 (free): Google Search Console

If you own the site, start here. It shows what Google itself saw, which no outside tool can.

1. Open your property in Search Console and go to the Page indexing report.
2. Use the dropdown above the chart to show only URLs from your sitemap (all submitted pages, or one specific sitemap).
3. Look at the "Why pages aren't indexed" list. Entries about not found (404), redirects, or noindex are the ones relevant here. Google renames these labels from time to time, so match on meaning, not exact wording.
4. Open a reason to see example URLs. The list shows examples and may not show every affected URL.
5. Use the URL Inspection tool on a single URL to see Google's last crawl result for it.

Limits: it only works for sites you can verify, it reports with a delay, and it is a sample for large sites, not a full list.

## Method 2 (free): check a handful of URLs by hand

For a few URLs, a browser's developer tools (Network tab) or a command-line header request shows the status code, the `Location` header for redirects, and any `X-Robots-Tag` header. This is fine for 5 or 10 URLs and impractical beyond that. For a robots meta tag you must view the page source.

## Method 3 (free): desktop crawlers and online checkers

Several SEO crawlers and online sitemap validators offer free tiers. Typically they cap the number of URLs per crawl or per day, but caps and features change, so check each tool's current page. Things to look for: can it read a sitemap directly, does it follow sitemap indexes, does it report redirect chains, and does it read noindex from headers, meta tags, or both? I haven't compared specific tools, so I don't name any.

## Method 4 (free): a script of your own

If you are comfortable scripting, you can read the sitemap, request each URL, and record status, `Location` and `X-Robots-Tag`. Two cautions: go slowly (a short delay between requests) and respect robots.txt. This guide includes no script, because I haven't tested one for this purpose. The [sitemap-broken-links guide](../sitemap-broken-links/README.md) has a PowerShell example for status codes only.

## Hosted option (disclosure: I built this)

I made an Apify Actor, [Sitemap Checker: Broken Link & 404 Check for Every Sitemap URL](https://apify.com/lineagersiui/sitemap-url-health-checker). I earn fees when it is used, and it is new and has few users and no reviews.

What it does, per its listing:
- Reads a site's robots.txt and sitemap files (including sitemap indexes and `.xml.gz`).
- Checks up to 5,000 listed URLs per run.
- Reports HTTP status, redirects and redirect chains, https-to-http downgrades, `X-Robots-Tag: noindex` headers and last-modified values.
- Paces requests, uses HEAD requests where possible, honours robots.txt, and does not download page content.
- Pricing at time of writing: pay per event, $0.0005 per URL checked ($0.50 per 1,000). Check the listing for current prices.

What it does not do:
- It does not crawl links inside your pages.
- It does not see a robots meta tag in the HTML, because it does not read page content. Only the HTTP header is checked.
- It cannot detect soft 404s (pages that return 200 but say "not found") or JavaScript redirects.
- Sites behind bot protection may answer with 403/429/503, which does not necessarily mean the page is broken.

Use Search Console first if you own the site. Use the Actor if you want a full-sitemap status list without installing anything.

## What to do with the results

1. Replace redirecting URLs in the sitemap with their final destinations.
2. Remove 404/410 URLs, or restore the pages if they were deleted by mistake.
3. For noindex URLs, decide: should the page be indexed? If yes, remove the noindex. If no, remove it from the sitemap.
4. Re-check 5xx and 403/429 results before acting.
5. Resubmit the sitemap in Search Console and re-check later.

Sources: Google's help pages "Page indexing report" and "URL Inspection tool" in Search Console Help.

---

Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

**Testing note:** This guide contains no code. The Actor's behaviour is described from its public listing, not from a new test for this guide. The Search Console steps were checked against Google's public help pages, not a live account, so the interface may differ. Free tool limits were not checked.
