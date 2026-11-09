# "Discovered - currently not indexed": check your sitemap first

You open Search Console and many URLs sit under "Discovered - currently not indexed". This guide covers what Google says the status means, what a tidy sitemap can and cannot do about it, and how to check a sitemap for free. A hosted option is mentioned at the end, with disclosure.

Related guides in this repo: [broken URLs in your sitemap](../sitemap-broken-links/README.md) and [redirects and noindex in your sitemap](../sitemap-redirects-noindex-search-console/README.md). This one is about the indexing status itself and where the sitemap fits.

## Step 1: understand what the status means

Google's Page indexing help says this status means the page "was found by Google, but not crawled yet". It adds that Google typically wanted to crawl the URL but expected this to overload the site, so it rescheduled the crawl. That is why the last crawl date is empty in the report.

Two consequences:

- Google has not fetched the page yet. This is different from "Crawled - currently not indexed", where Google fetched the page and chose not to index it (for that status, Google's help says you don't need to resubmit the URL).
- Google's help page offers no specific fix for the status. Anything claiming a guaranteed fix goes beyond what Google documents, and that includes this guide.

Google also says that after a URL is known, it can take up to a few weeks before Google crawls some or all of a site. A few recent URLs in this status may simply be waiting.

## Step 2: diagnose in Search Console

1. Open the Page indexing report for your property.
2. Open "Discovered - currently not indexed" and look at the example URLs. The list is a sample and may not show every URL.
3. Ask: are these URLs ones you want indexed? Parameter variants, old pages and thin pages in this list may be better removed from the sitemap than chased.
4. Use the URL Inspection tool on one or two examples. Google's help recommends it for checking individual pages and says the Page indexing report is not meant for investigating specific pages.
5. Compare the count to the size of your site. Google's crawl budget guide frames its advice for sites with a large portion of URLs in this status, and says it targets very large sites (1 million+ pages with weekly changes) or medium-sized sites (10,000+ pages) with daily changes, noting these are "not exact thresholds". If your site is small, crawl budget is probably not the explanation, and the cause may be elsewhere (server speed, page quality, internal linking). I can't tell you which from outside.

## Step 3: clean the sitemap (cheap, and worth doing either way)

Google's sitemap documentation says to include the URLs you want to see in Google's search results. A sitemap that lists redirects, deleted pages or noindex pages contradicts that. Cleaning it will not guarantee indexing, but it removes noise and mixed signals from the one file you control.

Google's crawl budget guide, for context:

- For permanently removed pages, a 404 is "a strong signal not to crawl that URL again".
- Soft 404s continue to be crawled and waste crawl budget.
- It advises avoiding long redirect chains, which it says hurt crawling.
- It says to keep sitemaps up to date and to include the content you want crawled.

Also, Google's sitemap documentation says a single sitemap is limited to 50 MB uncompressed or 50,000 URLs, and that Google ignores `<priority>` and `<changefreq>`. So don't spend time tuning those.

Look for these in your sitemap:

- URLs returning 404/410: remove them, or restore the page if it was deleted by mistake.
- URLs that redirect: list the final URL instead.
- noindex pages: decide whether the page should be indexed, then fix the noindex or drop the URL from the sitemap.
- 5xx and 429 responses: Google says these make its crawlers temporarily slow down, and that the rate recovers gradually once the server returns 2xx again. If your server returns these under load, that could plausibly matter for this status, but I can't confirm it for your site.

## Step 4: free ways to check a sitemap

**A few URLs by hand (curl).** Not tested for this guide; standard curl options:

```
curl -sI -o /dev/null -w "%{http_code} %{redirect_url}\n" https://example.com/some-page
```

(not tested). This prints the status code and, for a redirect, the target. Add a pause between requests and respect robots.txt if you loop over many URLs. For `X-Robots-Tag`, read the full `curl -I` output instead.

**PowerShell** (7 or later; not tested):

```
(Invoke-WebRequest -Uri "https://example.com/some-page" -Method Head -MaximumRedirection 0 -SkipHttpErrorCheck).StatusCode
```

(not tested). Windows PowerShell 5.1 handles error statuses differently and this line may not work there.

**Screaming Frog SEO Spider.** Per its FAQ, without a licence it is limited to crawling 500 URLs per crawl. I did not verify which sitemap or list-mode features the free version includes, so check its current page before relying on it for a large sitemap.

**Search Console.** In the Page indexing report, filter to your submitted sitemap to see the problems Google itself recorded for those URLs.

None of these read a robots meta tag, soft 404 or JavaScript redirect except a crawler that renders or parses page HTML. Check what your tool covers.

## Hosted option (disclosure: I built this)

I made an Apify Actor, [Sitemap Checker: Broken Link & 404 Check for Every Sitemap URL](https://apify.com/lineagersiui/sitemap-url-health-checker). I earn fees when it is used. It is new, with few users and no reviews.

Per its listing, it reads a sitemap (including sitemap indexes and `.xml.gz`), checks the HTTP status of each listed URL (up to 5,000 per run), and flags 404s, server errors, redirect chains and noindex headers. It honours robots.txt. It is a status check on your sitemap only.

It does **not** fix indexing, does not tell you why Google has not crawled a URL, and does not read page HTML, so it misses robots meta tags, soft 404s and JavaScript redirects. Sites behind bot protection may answer 403/429/503, which does not necessarily mean the page is broken.

Pricing at time of writing: pay per event, $0.0005 per URL checked ($0.50 per 1,000 URLs). Check the listing for current prices.

Use Search Console first if you own the site. Use the Actor if you want a full status list for a large sitemap without installing anything.

## After cleaning

1. Resubmit the sitemap in Search Console.
2. Wait. Google says crawling a known URL can take up to a few weeks.
3. Re-check the "Discovered - currently not indexed" count and examples. If the count is unchanged, the sitemap was probably not the cause, and the next places to look are server response times, internal links and page quality.

Sources (Google documentation): Page indexing report help (support.google.com/webmasters/answer/7440203), Crawl budget management guide (developers.google.com/crawling/docs/crawl-budget), Build a sitemap (developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), HTTP status codes and network errors (developers.google.com/search/docs/crawling-indexing/http-network-errors). Screaming Frog FAQ (screamingfrog.co.uk/seo-spider/faq/).

---

Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

**Testing note:** The two command lines above were not run for this guide. The Google and Screaming Frog statements were checked against their public pages on 2026-11-03, not against a live Search Console account, so the interface may differ. The Actor's behaviour is described from its public listing, not from a new test for this guide. No indexing results are claimed.
