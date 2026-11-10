# Bulk domain check: how to check availability, status and DNS for many domains at once

You have a list of domains, from 20 to a few thousand. You want to know one or more of three things:

- Which are free to register?
- Which are registered, and what is their status?
- Does their DNS resolve, and to what?

These are three different questions, and they need different tools. This guide goes through free methods first. A disclosed mention of a paid tool I built is at the end.

## Short answer

1. **Availability:** use a registrar's bulk search for small lists. For larger lists, use a DNS filter, then confirm the shortlist with RDAP. Final proof is always the registrar's checkout.
2. **Status and expiry of registered domains:** use RDAP. It returns JSON that includes status values and event dates, where the registry provides them.
3. **DNS health:** use `dig` or `nslookup` in a loop, one record type at a time.

## First, decide which question you are asking

| Question | Best free method | Main caveat |
|---|---|---|
| Can I buy it? | Registrar search or bulk search | Only the registrar knows price and registrability |
| Is it registered? | DNS delegation check, then RDAP | No DNS does not mean unregistered |
| What is its status or expiry? | RDAP | Fields vary by registry |
| Does it resolve or have mail? | `dig` / `nslookup` for A, AAAA, NS, MX | A resolver can cache or time out |

## Method 1: registrar bulk search (free, best for under ~100 names)

Many registrars let you paste a list of names or pick several TLDs at once. Check your registrar's own page for the limits, which vary and which I have not verified. Advantages:

- It is free.
- It shows real prices and premium flags.
- It is the only method that tells you whether you can actually register the name.

Disadvantage: it is manual, and it is awkward to export results.

## Method 2: DNS loops with dig or nslookup (free, fast, a first filter)

Put one domain per line in a text file. Then loop over it and ask for the NS records. A domain with no NS answer is often not delegated, so it is often unregistered, but not always. A registered domain can have no DNS, and reserved names can look empty too.

```bash
# NOT TESTED: illustrative only. Bash, with dig installed.
while read -r d; do
  ns=$(dig +short NS "$d")
  echo "$d,${ns:-NO_NS}"
done < domains.txt > ns-results.csv
```

```powershell
# NOT TESTED: illustrative only. Windows PowerShell.
Get-Content domains.txt | ForEach-Object {
  $r = Resolve-DnsName $_ -Type NS -ErrorAction SilentlyContinue
  "$_," + $(if ($r) { "HAS_NS" } else { "NO_NS" })
} | Set-Content ns-results.csv
```

Other record types, for DNS health checks on domains you own:

- **A / AAAA:** does the site resolve?
- **MX:** can the domain receive mail?
- **NS:** which nameservers are authoritative?
- **TXT:** SPF, DKIM and verification records.

Pitfalls:

- **Resolver errors.** A timeout is not the same as "no such domain" (NXDOMAIN). Keep them separate in your output, or you will misclassify names.
- **Caching.** Recent changes may not show yet.
- **Made-up TLDs.** If a typo like `.cmo` is in your list, the lookup fails and the domain looks "free". Validate the TLD against the IANA root list first.
- **Pace yourself.** Thousands of rapid queries to one resolver can get throttled.

## Method 3: RDAP for status and dates (free, structured)

RDAP is the JSON successor to WHOIS. It is defined in RFC 9082, RFC 9083 and RFC 9224. The IANA bootstrap file at https://data.iana.org/rdap/dns.json maps each TLD to its RDAP server. A response for a registered domain typically includes status values and event dates such as registration or expiration. Which fields appear depends on the registry, so check the TLD you care about.

```bash
# NOT TESTED: illustrative only. Replace the base URL with the one listed for your TLD in dns.json.
curl -s "https://rdap.verisign.com/com/v1/domain/example.com"
```

Pitfalls:

- Not every TLD has a public RDAP service. Some country-code TLDs do not.
- Registries publish query policies and may rate-limit you. Pace requests.
- A "not found" response usually means unregistered, but behaviour varies by registry.

For the RDAP vs WHOIS background and an availability workflow, see the sibling guide: [bulk-check-domain-availability-rdap-vs-whois](../bulk-check-domain-availability-rdap-vs-whois/README.md).

## Method 4: WHOIS (fallback only)

If a TLD has no RDAP service, WHOIS may be your only option. Output is free text and the format differs by server. Many servers limit how many queries you can make, so parsing and pacing are your problem. Prefer RDAP wherever it exists.

## A workflow that scales

1. Normalise the list: lowercase, trim whitespace, remove duplicates.
2. Drop entries with invalid characters or TLDs that do not exist.
3. Run the NS check on everything and keep timeout and NXDOMAIN separate.
4. Run RDAP only on the names you need status or confirmation for, at a polite pace.
5. For a purchase decision, confirm the final few at a registrar.
6. Save the output with a timestamp. Statuses change.

## What no bulk check can promise

- **Registrable is not the same as unregistered.** Premium, reserved and restricted names can show no record.
- **Timing.** Expiring, redemption-period and brand-new registrations can change between your check and your purchase.
- **Coverage.** Registries differ in RDAP support and response detail.

## Disclosure: a tool I made

I built an Apify Actor for the availability part of this job: **[Bulk Domain Availability Checker](https://apify.com/lineagersiui/domain-availability-checker)**. I am its author, and it is paid, so weigh this accordingly.

According to its listing:

- You can submit up to 1,000 candidate domains, or names crossed with TLDs, per run.
- It does a per-TLD DNS delegation check, so made-up TLDs are not reported as available.
- Optional paced RDAP lookups confirm a capped number of likely-available names per run (the listing says up to 10).
- Output is a per-domain classification, such as `registered`, `available`, `likely_available`, `unknown` or invalid, plus a run-level summary of counts.
- Pricing is pay-per-event, $1 per 1,000 domains checked, and there is a free demo.
- The listing says it is not a registrar guarantee.

The listing describes availability checks only. For MX, TXT or expiry monitoring, use the methods above. The free methods in this guide are enough for small lists.

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

**Testing note:** I did not run the Actor or any command in this guide. The code blocks are untested and illustrative only. The Actor facts come from its Apify listing as read on 2026-11-06. The protocol facts come from the RFCs and the IANA bootstrap file. I did not test registrar bulk-search limits, registry rate limits or RDAP field coverage. These vary and you should verify them for your TLDs.
