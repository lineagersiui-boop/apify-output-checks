# How to find broken URLs in your sitemap (free methods first)

A sitemap lists the URLs you want search engines to index. Entries that return 404, server errors, redirect chains or `noindex` waste crawl budget and send mixed signals. Check your sitemap at three moments: before a migration, after a CMS update, and on a regular schedule.

## 1. Free: check a few URLs by hand

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://example.com/some-page
```

This works for 5 URLs. It gets tedious at 500.

## 2. Free: a short script (PowerShell)

```powershell
$xml = [xml](Invoke-WebRequest https://example.com/sitemap.xml -UseBasicParsing).Content
$xml.urlset.url.loc | ForEach-Object {
  $u = $_
  try { $r = Invoke-WebRequest $u -Method Head -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop; "$($r.StatusCode) $u" }
  catch { "$([int]$_.Exception.Response.StatusCode) $u" }
  Start-Sleep -Milliseconds 500
}
```

The script prints one line per URL: `200` means OK, `3xx` means a redirect, and `404` or `5xx` means broken. It was tested in Windows PowerShell 5.1 against a public sitemap, a missing page (404) and an HTTP-to-HTTPS redirect (307).

Limits:
- It doesn't handle sitemap indexes or `.xml.gz` files.
- It doesn't follow redirect chains.
- It doesn't check robots.txt.

Keep requests paced and respect the site's robots.txt.

## 3. Free desktop crawlers

Several desktop SEO crawlers have free tiers with URL limits, and other free link checkers exist. Check their current limits yourself.

## 4. Hosted option (disclosure: I built this)

[Broken Link & Sitemap Checker](https://apify.com/lineagersiui/sitemap-url-health-checker) is an Apify Actor that does the same job on Apify's servers:
- **What it checks:** the HTTP status of every URL in your sitemap. It flags 404s, server errors, redirects, redirect chains and `noindex` headers, and it honours robots.txt.
- **Pricing:** pay-per-event, $0.0005 per URL checked (1,000 URLs = $0.50), plus Apify platform usage. There is a free demo.
- **Track record:** it is a new Actor with very few users, so there are no customer results to show.

## What to do with the results

1. Fix or remove sitemap entries that return 404 or 410.
2. Point sitemap entries at the final URL, not at a redirect.
3. Remove `noindex` URLs from the sitemap.
4. Re-run the check on a schedule after releases.

*Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify. The PowerShell snippet was run as described above; the hosted Actor's facts come from its public listing.*
