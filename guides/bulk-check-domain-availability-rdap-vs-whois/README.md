# How to check many domain names for availability (RDAP vs WHOIS, free methods first)

You have a list of 50, 500 or 5,000 candidate names and you want to know which are free to register. This guide explains the free ways to do it, how RDAP and WHOIS differ, and where each method can mislead you. A disclosed mention of a paid tool I built is at the end.

## Short answer

1. For a handful of names, use a registrar's search box. It is free and it is the only check that shows real price and registrability.
2. For a larger list, a DNS check is a fast first filter, and RDAP confirms the names that look free.
3. Whatever you use, treat "looks available" as a shortlist. The final answer always comes from the registrar at checkout.

## WHOIS vs RDAP in plain terms

- **WHOIS** is the older, text-based lookup protocol, served over TCP port 43. Output formats vary by server.
- **RDAP** (Registration Data Access Protocol) is its successor. It runs over HTTPS and returns JSON, so a script can read it reliably. It is defined in IETF standards: RFC 9082 (query format, for example `/domain/<name>`), RFC 9083 (JSON responses) and RFC 9224 (finding the right server for a TLD).
- **Where gTLD WHOIS stands:** ICANN's WHOIS sunset date was 28 January 2025. ICANN says RDAP is now the definitive source for gTLD registration data. Country-code registries set their own rules, so check the registry for the TLD you care about.
- **Practical effect:** for scripted checks, RDAP is the better choice for any TLD that supports it, and WHOIS is a fallback for the rest.

## Free methods, in the order I would try them

### 1. Registrar search (1 to ~20 names)
Type the name into a registrar's search. It is free and also shows premium pricing and whether the name can be registered. This is the only method that tells you whether you can actually buy the name.

### 2. A single RDAP lookup (spot checks)
IANA publishes a bootstrap file, https://data.iana.org/rdap/dns.json, that maps each TLD to its RDAP server. Find your TLD, then query `<server base URL>domain/<name>`. A registered name returns a JSON record. For an unregistered one, servers typically return an HTTP "not found" error. This varies by registry, so verify the behaviour of each TLD before you rely on it.

```bash
# NOT TESTED: illustrative only. Use the base URL listed for your TLD in dns.json.
curl -s "https://rdap.verisign.com/com/v1/domain/example.com"
```

### 3. DNS check as a first filter (hundreds of names)
If a name has no DNS delegation, it is often unregistered, but not always. A registered name can have no DNS records, and reserved or blocked names can also look empty. So "no DNS" means "worth confirming", never "free". Also check that the TLD itself exists, or you will report names under made-up TLDs as available.

### 4. Confirm the shortlist with RDAP, politely
Only send RDAP queries for names that survived the DNS filter. Registries publish query policies and may rate-limit you, so pace your requests and respect those limits.

## Things that make any bulk check wrong

- **Not registered is not the same as registrable.** Reserved names, premium names, registry restrictions and some TLD eligibility rules can block a name that shows no record.
- **Timing.** Names expiring, in a redemption period, or registered a minute ago can change status between your check and your purchase.
- **Rate limits.** Fast bulk queries to a single registry can get you throttled or blocked.
- **Internationalised names.** RDAP accepts both A-label (xn--) and U-label forms, but check how your tooling handles them.

## A workflow for a big list

1. Build the list (for example, brand words crossed with .com, .io, .ai).
2. Drop names with invalid characters or unknown TLDs.
3. Run a DNS check on everything.
4. RDAP-confirm only the names that look free.
5. Check the final few at a registrar before you buy.

## Disclosure: a tool I made

I built an Apify Actor that does steps 3 and 4 above: **[Bulk Domain Availability Checker](https://apify.com/lineagersiui/domain-availability-checker)**. According to its listing, you can submit up to 1,000 domains, or names crossed with TLDs, per run. Every domain gets a DNS check, and optional RDAP confirms at most 10 likely-available names per run, paced to registry query policies. The other likely-available names stay `likely_available`, so the rest of a big list still needs your own RDAP or registrar check. Some TLDs, such as .io and .co, have no public RDAP service, so their results are DNS-only and reported as `likely_available`. Statuses include `registered`, `available`, `likely_available` and `unknown` (DNS did not answer), plus `invalid_tld`, `not_registrable` and `invalid_input` for bad input. It is priced at $1 per 1,000 domains checked, and the listing says it is not a registrar guarantee. I am the author and it is paid, so weigh this recommendation accordingly. The free methods above work fine for small lists.

Search term this guide targets: **domain availability checker**.

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

**Testing note:** I did not run the Actor or any command for this guide. The curl example is untested. The Actor facts come from its live Apify listing and Store page as of 2026-11-01. The RDAP/WHOIS facts come from the RFCs, the IANA bootstrap file and ICANN's published notice. Registry behaviour (not-found responses, rate limits) varies and was not tested.
