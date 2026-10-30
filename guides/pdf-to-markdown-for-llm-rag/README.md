# Convert PDFs to Markdown for LLMs and RAG: Free Tools, and Batch Without Installing Anything

LLMs and retrieval (RAG) pipelines work better with clean text than with raw PDF files. Markdown is a popular target because it keeps headings, paragraphs and lists, which helps when you split a document into chunks. This guide covers free ways to convert PDFs to Markdown or text, what to watch out for, and, at the end, a hosted option for people who have PDF links and would rather not install anything.

## Before you start
- **Check whether your PDF has a text layer.** Try selecting and copying a sentence in a PDF viewer. If you can't, it is probably a scan (an image of text) and needs OCR, which many simple tools do not do.
- **Decide what matters.** Plain text is enough for search and summaries. If you need headings or structure to chunk sensibly, you want Markdown. If you need tables as structured data, plan for a tool built for that and check the results by hand.
- **Keep the page number.** Page markers in the output let you cite the source page later.
- **Check your rights.** Only process documents you own, that are licensed to you, or that you are otherwise allowed to use. Watch for personal data in them.

## Method 1: pymupdf4llm (free, Python)
`pymupdf4llm` (1.x releases) is a Python package built on PyMuPDF that outputs Markdown from PDFs, aimed at LLM and RAG use. **It is changing:** at the time of writing, PyPI shows a pymupdf4llm 2.0 release that is an empty placeholder, and says the Markdown code now ships inside the `pymupdf` 2.x package. Because of this, older tutorials and install commands may not work as written. Follow the current PyMuPDF documentation for the install steps and the API.

**License caveat.** PyMuPDF and pymupdf4llm are released under the AGPLv3 license, and the maker, Artifex, also sells a commercial license. AGPLv3 is a strong copyleft license. If you build it into a product or a network service you offer to others, you may have to release your own source code under the same terms, or buy a commercial license. For private experiments this is usually not an issue, but for anything commercial, read the license on the project page and get proper advice if you are unsure.

No command is given here for this method, because the install and API are in transition and we have not tested the current version.

## Method 2: marker-pdf (free to try, heavier)
`marker-pdf` (the "marker" project) converts PDFs to Markdown using machine-learning models. It is designed to handle harder layouts and can work on scanned documents, and it can be slower and needs more computing power than the text-layer tools, ideally a GPU for large jobs. First runs usually download model files.

**Check the license.** The code and the model weights may be under different licenses, and there are usage conditions that depend on who you are and how much revenue you make. Read the license section of the project's repository before using it commercially.

Install and usage steps change between versions, so follow the project's current README rather than an old tutorial.

## Method 3: pdfminer.six (free, Python, plain text)
`pdfminer.six` is a long-established Python library for extracting text from PDFs. It is permissively licensed (check the project page for the current terms). It gives you text and layout information, but it does not produce Markdown on its own, so headings and lists are yours to rebuild if you need them. It is a good choice when you want control and are happy to write some code. Example (not tested):

```
pip install pdfminer.six
python -c "from pdfminer.high_level import extract_text; print(extract_text('input.pdf'))"
```

## Method 4: Other options
Some desktop apps, command-line tools such as `pdftotext` (from the Poppler package), and word processors can export text. Quality varies with the PDF, so try your tool on a few representative files first.

## Common pitfalls
- **Scanned PDFs.** Text-layer tools return nothing or very little. You need OCR (marker can help here, or a dedicated OCR tool).
- **Multi-column pages.** Reading order can come out wrong, mixing columns. Spot-check.
- **Headings.** Tools usually guess headings from font size, so some will be missed or added.
- **Tables.** They often become running text in reading order. Check any numbers that matter against the original.
- **Headers, footers and page numbers.** These repeat on every page and can pollute your chunks. Remove them if they hurt retrieval.
- **Encrypted PDFs.** Many tools fail or need a password.
- **Odd fonts and non-Latin text.** Some encodings lose characters. Test with your actual language.
- **Rights and privacy.** Do not send confidential documents to a service you have not checked.

## Method 5: A hosted option, if you have PDF links (disclosure: we built it)
I built an Apify Actor called **Extract Text from PDF: PDF to Markdown & Plain Text for LLMs** (`lineagersiui/pdf-text-extractor`). I am the developer, so this is not a neutral recommendation. It is new and has few users.

What the Actor does, based on its current code and listing:
- Takes a list of public PDF links (up to 100 per run, 50 MB each, 500 MB in total, and up to 25 per website).
- Extracts the text layer as Markdown (headings detected from font size, paragraphs, lists, with page markers) or as plain text.
- Returns one dataset item per document, or one item per page, which is handy for chunking.
- Each item includes the source URL, title, page counts, which pages had no text, and file size. Failed documents carry an error code.
- Reads up to 200 pages per PDF by default, configurable up to 500.
- Honours robots.txt and spaces out requests to each server.

Limits you should know about:
- **No OCR.** Scanned or image-only pages come back empty and are not billed.
- **No tables as structured data, and images are skipped.** Table cells come out as text in reading order.
- **Headings are a best guess** from font size and spacing, so unusual layouts may get extra or missing headings.
- **Encrypted PDFs are not supported.**
- **Input is links only.** The PDFs must be publicly reachable, and there are no file uploads.
- Non-demo runs require you to tick a rights confirmation (`confirmRights`). Without it the run stops before downloading anything.

Pricing: pay per event. A page with at least 20 characters of text is one billable event, at most 15 pages are billed per document however long it is, and the listing showed $0.0003 per page when this guide was written. Blank or scanned pages, failed or duplicate documents, pages beyond your page limit, and the demo are not billed. The Pricing tab on the Actor page is the source of truth, and you can set a maximum charge per run. Running it with an empty URL list gives a free demo on the first 5 pages of RFC 9309.

If you have a handful of files, one of the free methods above is probably enough. A hosted run mainly helps when you have a long list of PDF links and don't want to install or script anything.

Actor page: https://apify.com/lineagersiui/pdf-text-extractor

## Checklist after converting
1. Open a few outputs next to the original PDFs and compare headings, lists and numbers.
2. Look for empty pages, which suggest scans that need OCR.
3. Strip repeated headers and footers if they hurt retrieval.
4. Chunk by heading or by page, and keep the page number with each chunk.

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

Testing note: the commands in this guide are examples that have not been run by the author. The Actor description was checked against its source code and public listing on 2026-10-29. Descriptions of the third-party tools (pymupdf4llm/PyMuPDF, marker-pdf, pdfminer.six) come from their public project pages as read on 2026-10-29, not from testing, and pymupdf4llm's packaging is in flux, so check each project's current page and license. No benchmark was run, and no accuracy or quality claims are made.
