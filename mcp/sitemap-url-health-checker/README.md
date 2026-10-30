# Sitemap URL Health Checker: MCP server (via Apify)

Check every URL listed in a website's XML sitemap for 404s, server errors, redirects, redirect chains, https-to-http downgrades and `X-Robots-Tag: noindex` headers, from any MCP client.

**Disclosure:** we built and maintain the Apify Actor [`lineagersiui/sitemap-url-health-checker`](https://apify.com/lineagersiui/sitemap-url-health-checker) and earn its pay-per-event fees. This listing is not affiliated with or endorsed by Apify or the Model Context Protocol project. The MCP endpoint is Apify's hosted MCP server (`mcp.apify.com`), run by Apify, not by us. This listing only preselects our Actor as the single tool. Drafted with AI tools under the author's direction.

Registry name: `io.github.lineagersiui-boop/sitemap-url-health-checker`

## What it does

- Finds the sitemap from a site address (via robots.txt or `/sitemap.xml`), or takes direct sitemap, sitemap-index, `.xml.gz` or plain-text list URLs.
- Requests each listed URL and reports its status, redirects, final URL and flags.
- Checks only URLs listed in the sitemap. It does not crawl links inside pages.

## Requirements

- **Your own Apify account and API token.** Get the token in [Apify Console → Settings → API & Integrations](https://console.apify.com/settings/integrations). Runs are billed to your Apify account, not ours.
- Permission to check the site. The Actor refuses non-demo runs unless `confirmPermission` is `true`.

## Pricing

- **$0.0005 per URL checked** (one event per URL that returns an HTTP status). 1,000 URLs cost $0.50, plus Apify platform usage.
- Not billed: URLs skipped by robots.txt, timeouts and network errors.
- Free demo: run with empty input to check 20 URLs of apify.com, not billed.

## Connect

Endpoint (Streamable HTTP):

```
https://mcp.apify.com/?tools=lineagersiui/sitemap-url-health-checker
```

The `tools` parameter makes Apify's server load only this Actor. Without it, Apify's server loads its default tool set instead.

Bearer token (most clients):

```json
{
  "mcpServers": {
    "sitemap-url-health-checker": {
      "url": "https://mcp.apify.com/?tools=lineagersiui/sitemap-url-health-checker",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
```

Apify's server also supports OAuth sign-in, without a token in the config, for clients that support it. See [Apify's MCP documentation](https://docs.apify.com/platform/integrations/mcp).

Local stdio, for clients without remote support. This runs Apify's own open-source package, not ours:

```json
{
  "mcpServers": {
    "sitemap-url-health-checker": {
      "command": "npx",
      "args": ["-y", "@apify/actors-mcp-server", "--tools", "lineagersiui/sitemap-url-health-checker"],
      "env": { "APIFY_TOKEN": "<YOUR_APIFY_TOKEN>" }
    }
  }
}
```

## Input

| Field | Type | Notes |
|---|---|---|
| `siteUrls` | array of strings | Site addresses, e.g. `example.com`. Up to 10 |
| `sitemapUrls` | array of strings | Direct sitemap, sitemap-index, `.xml.gz` or plain-text list URLs. Up to 10 |
| `confirmPermission` | boolean | Default `false`. Must be `true` for non-demo runs |
| `maxUrls` | integer | Default 500, range 1 to 5,000. Hard cap per run |
| `onlyProblems` | boolean | Default `false`. Leaves out 2xx URLs with no redirect (they are still billed) |
| `timeLimitSecs` | integer | Default 1,500, range 60 to 3,600. No new checks start after this |

## Output

One dataset item per URL: `url`, `status`, `flags`, `redirects`, `redirectStatuses`, `finalUrl`, `lastmod`, `sitemap`. The key-value store record `SUMMARY` holds the counts: `urlsFound`, `checked`, `billed`, `problems`, `blockedByRobots`, `errors`.

| Flag | Meaning |
|---|---|
| `not_found`, `client_error`, `server_error` | 404/410, another 4xx, or 5xx |
| `redirected`, `redirect_chain`, `too_many_redirects` | One redirect, more than one, or more than 5 |
| `https_downgrade` | An https URL redirects to http |
| `noindex_header` | Sends `X-Robots-Tag: noindex` |
| `blocked_by_robots` | Disallowed by robots.txt; skipped, not billed |
| `timeout`, `network_error`, `blocked_private_address` | Couldn't be checked; not billed |
| `ok` | 2xx, no redirect |

## Example prompts

- "Check the sitemap of example.com for broken links and redirects. I own the site."
- "Which URLs in https://example.com/sitemap_index.xml return 404 or redirect after our migration?"
- "Which pages in our sitemap send a noindex header?"

## Support

Open an issue in this repository. The Actor is maintained by its author on the Apify Store.

## License

This README and `server.json` are MIT-licensed. The Actor and Apify's MCP server have their own terms.
