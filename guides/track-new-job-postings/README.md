# How to track new job postings at specific companies (Greenhouse, Lever, Ashby): free methods first

If you are a recruiter, a sales or RevOps person, or an investor, "who just opened a new role?" is a useful signal. A company hiring account executives may be about to buy sales tools. A company hiring a Head of Finance may be about to raise money. A new client of an agency may be hiring for roles you can fill.

Most startups and mid-size tech companies post jobs through an applicant tracking system (ATS). Three of the most common are **Greenhouse**, **Lever** and **Ashby**. All three publish a free, read-only JSON feed of a company's open jobs. This guide shows how to use those feeds, how to detect only the new postings, and where the do-it-yourself (DIY) approach starts to hurt.

## Method 1: the public job-board endpoints (free)

You need the company's "board name" (token or slug). Open the company's careers page and look at the job link:

- `boards.greenhouse.io/stripe` means the Greenhouse token is `stripe`.
- `jobs.lever.co/spotify` means the Lever slug is `spotify`.
- `jobs.ashbyhq.com/ramp` means the Ashby board name is `ramp`.

Some companies embed the board in their own site, so the token may not be obvious. Look at the job link or page source.

| ATS | Endpoint (plain GET, no login) |
|---|---|
| Greenhouse | `https://boards-api.greenhouse.io/v1/boards/<token>/jobs` |
| Lever | `https://api.lever.co/v0/postings/<company>?mode=json` |
| Ashby | `https://api.ashbyhq.com/posting-api/job-board/<name>` |

Each of these returned data when I tested it with a read-only GET on one public board (Greenhouse `stripe`, Lever `spotify`, Ashby `ramp`; see the testing note at the end). The useful fields, as I saw them:

| ATS | Where the list is | Stable ID | Title | Link | Publish date |
|---|---|---|---|---|---|
| Greenhouse | `jobs` array in an object | `id` | `title` | `absolute_url` | `first_published` (also `updated_at`) |
| Lever | the response is the array itself | `id` | `text` | `hostedUrl` | `createdAt` (milliseconds) |
| Ashby | `jobs` array in an object | `id` | `title` | `jobUrl` | `publishedAt` |

Field names can change, so check the live response for your board before relying on them.

## Method 2: spot NEW postings by remembering the IDs you saw last time

The feeds show what is open right now. They do not say "new since yesterday". The simplest fix is to store the IDs you have seen and compare on each run:

1. Fetch the board.
2. Build a key such as `ats:board:id` for each posting.
3. Anything whose key is not in your saved list is new.
4. Save the full list of keys for the next run.

Use the job `id`, not a date. Dates such as `updated_at` change when someone edits a posting, which would make old jobs look new.

On the very first run everything looks new, so treat that run as a baseline and do not alert on it.

### PowerShell example (tested)

This script checks one board per ATS, prints new postings, and keeps its memory in `seen.json` next to the script. It was written for Windows PowerShell 5.1.

```powershell
# new-postings.ps1 : print postings not seen on the previous run
$watch = @(
  @{ ats = 'greenhouse'; board = 'stripe'  },
  @{ ats = 'lever';      board = 'spotify' },
  @{ ats = 'ashby';      board = 'ramp'    }
)
$stateFile = Join-Path $PSScriptRoot 'seen.json'
$seen = @{}
$firstRun = -not (Test-Path $stateFile)
if (-not $firstRun) {
  (Get-Content $stateFile -Raw | ConvertFrom-Json).PSObject.Properties |
    ForEach-Object { $seen[$_.Name] = $_.Value }
}

function Get-Postings($w) {
  switch ($w.ats) {
    'greenhouse' {
      (Invoke-RestMethod "https://boards-api.greenhouse.io/v1/boards/$($w.board)/jobs").jobs |
        ForEach-Object { [pscustomobject]@{ id = "$($_.id)"; title = $_.title; url = $_.absolute_url } }
    }
    'lever' {
      $all = Invoke-RestMethod "https://api.lever.co/v0/postings/$($w.board)?mode=json"
      $all | ForEach-Object { [pscustomobject]@{ id = "$($_.id)"; title = $_.text; url = $_.hostedUrl } }
    }
    'ashby' {
      (Invoke-RestMethod "https://api.ashbyhq.com/posting-api/job-board/$($w.board)").jobs |
        ForEach-Object { [pscustomobject]@{ id = "$($_.id)"; title = $_.title; url = $_.jobUrl } }
    }
  }
}

foreach ($w in $watch) {
  try { $jobs = @(Get-Postings $w) }
  catch { Write-Warning "$($w.ats):$($w.board) failed: $($_.Exception.Message)"; continue }
  $new = 0
  foreach ($j in $jobs) {
    $key = "$($w.ats):$($w.board):$($j.id)"
    if (-not $seen.ContainsKey($key)) {
      $seen[$key] = (Get-Date).ToString('s')
      $new++
      if (-not $firstRun) { "NEW  $($w.board)  $($j.title)  $($j.url)" }
    }
  }
  "$($w.ats):$($w.board) open=$($jobs.Count) new=$new"
  Start-Sleep -Seconds 1
}
$seen | ConvertTo-Json | Set-Content $stateFile -Encoding utf8
```

What happened when I ran it:

- First run: it reported every posting as seen but printed no `NEW` lines, because it was the baseline.
- Second run, after I deleted two Lever entries from `seen.json` to simulate new postings: it printed exactly those two as `NEW`.
- Third run: nothing new.

The Lever line has a detail worth knowing. In Windows PowerShell 5.1, piping `Invoke-RestMethod` straight into `ForEach-Object` handed the whole Lever array over as one object, so only 1 of the 89 postings was counted. Assigning the result to a variable first fixes it.

Run it on a schedule (Windows Task Scheduler, or cron with an equivalent script) and send the `NEW` lines to email, Slack or a spreadsheet. From a shell, the same endpoints work with curl, for example `curl -s "https://api.lever.co/v0/postings/spotify?mode=json"`. The curl command is not tested beyond the endpoint returning data; the comparison logic needs a tool such as `jq`, and I did not test that.

## Limits of the DIY approach

This works well for a handful of companies. It gets harder when:

- **You have many boards.** Each company is a separate request, and you must work out the ATS and the board name for each one. A bare company name does not tell you which of the three systems it uses, or whether it uses any of them.
- **Names are case-sensitive in places.** Lever slugs are lower-case: in my test `spotify` worked and `Spotify` returned HTTP 404. Greenhouse `Stripe` and Ashby `Ramp` also returned data in my test, but do not rely on that. Use lower-case everywhere.
- **Wrong or missing boards return 404.** Lever also runs a separate EU instance, so a company hosted there may not be found on the endpoint above (I did not test an EU board). Handle errors per board so one failure does not stop the run.
- **Lists can be large.** Stripe's Greenhouse board returned 737 postings in one response when I tested it. Fine for one board, noticeable for hundreds.
- **State management is yours.** You must keep the memory file safe, handle a posting that closes and reopens, and decide how long to remember IDs.
- **Rate limits and politeness.** I did not hit a rate limit in my small test, and I have not verified any numeric limits for these services. Be polite anyway: send one request at a time, wait at least a second between requests, do not poll more often than you need (hourly or daily is plenty for hiring signals), set a clear User-Agent, and stop for a while if you receive HTTP 429 (too many requests).
- **Terms.** These are public feeds meant for showing jobs, but read each provider's terms before building a commercial product on them, and respect what employers publish.

## Option: a ready-made watchlist Actor (disclosed: I built it)

If you would rather not maintain scripts, I built an Apify Actor that does the same job: [New Job Postings Monitor: Greenhouse, Lever & Ashby](https://apify.com/lineagersiui/hiring-signal-feed) (`hiring-signal-feed`). You list up to 200 company boards, and each run returns only the postings that watchlist has not returned before, as compact rows for a CRM, spreadsheet or webhook. The first run returns postings from the last 7 days by default. The price is $0.002 per new job ($2 per 1,000), and runs with nothing new are not billed. Running it with empty input starts a free demo that reads three public boards and shows up to 10 recent postings. Two things to know up front: it runs on your own Apify account, so check Apify's current pricing and plan terms before relying on it. The free demo is not billed. It does not output job descriptions or personal data, and salary appears only when a Lever or Ashby employer published it. If a few companies are all you need, the script above is enough.

---

*Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify, Greenhouse, Lever or Ashby. I built the hiring-signal-feed Actor and earn its pay-per-event fees.*

*Testing note: on 2026-10-30 I ran read-only GET requests against the three public boards named above (Greenhouse `stripe`, Lever `spotify`, Ashby `ramp`) and ran the PowerShell script in Windows PowerShell 5.1 across three runs, with the results described above. Job counts and fields change over time. The curl/jq remark is not tested. Check each endpoint against your own boards before depending on it.*
