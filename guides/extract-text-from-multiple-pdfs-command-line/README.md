# Extract Text from a Folder of PDFs on the Command Line (pdftotext), and Spot the Scanned Ones

You have a folder of PDFs and want a text file for each one. This guide shows the free, standard way to do it with `pdftotext`. It also shows a quick check for the files that came out empty, which are usually scanned PDFs. A hosted option for people with PDF links is mentioned at the end, with a disclosure.

## Before you start
- **Your PDFs need a text layer.** A PDF made from a word processor or exported by software usually has one. A PDF made by scanning paper is a picture of text and usually has none. A quick test: open the PDF and try to select and copy a sentence. If you can't, it is probably a scan.
- **Text extraction is not OCR.** `pdftotext` reads the text that is already inside the file. It does not read text out of images.
- **Check your rights.** Only process documents you own, that are licensed to you, or that you are otherwise allowed to use. Watch for personal data.

## Step 1: Install pdftotext (free)
`pdftotext` is part of the Poppler utilities (a similar tool comes with Xpdf). It is available through most Linux package managers (often in a package named `poppler-utils`), through Homebrew on macOS (package `poppler`), and as Windows builds of Poppler. Install steps vary by system and version, so use your system's current instructions. Then check it runs:

```
pdftotext -v
```

## Step 2: One file
Per the Poppler man page, if you give only the PDF name, the output is named after it with a `.txt` extension:

```
pdftotext report.pdf
```

This should write `report.txt` next to the PDF. Useful options from the man page:
- `-layout` tries to keep the original physical layout. By default the text comes out in reading order.
- `-f N` and `-l N` set the first and last page to convert.
- `-nopgbrk` leaves out the form-feed characters that are normally inserted between pages.
- `-enc` sets the output encoding (the default is UTF-8).
- A dash as the output name (`pdftotext report.pdf -`) sends the text to the screen instead of a file.

## Step 3: A whole folder
**Example (not tested), Linux/macOS shell:**

```
mkdir -p txt
for f in *.pdf; do
  pdftotext "$f" "txt/${f%.pdf}.txt" || echo "FAILED: $f"
done
```

**Example (not tested), Windows PowerShell**, assuming `pdftotext.exe` is on your PATH:

```
New-Item -ItemType Directory -Force txt | Out-Null
Get-ChildItem *.pdf | ForEach-Object {
  pdftotext $_.FullName ("txt\" + $_.BaseName + ".txt")
  if ($LASTEXITCODE -ne 0) { "FAILED: " + $_.Name }
}
```

Both loops print the name of any file where `pdftotext` returned an error. The man page lists exit code 1 for an error opening the PDF, 2 for an error opening the output file, 3 for a permissions error, and 99 for other errors. Which code a damaged or password-protected file returns can vary, so check yours. Both examples only cover PDFs directly in the current folder, and the shell loop matches only lowercase `.pdf` names. Subfolders and other spellings need a different command.

## Step 4: Spot the scanned (empty) files
A PDF with no text layer usually converts "successfully" but gives you an empty file, or one that holds only whitespace or page-break characters. So an error check alone won't find scans. Check how much real text each output has.

**Example (not tested), Linux/macOS shell:** print any output with fewer than 20 non-whitespace bytes (`wc -c` counts bytes, so non-ASCII text counts higher). The 20 is an arbitrary cutoff of mine; adjust it.

```
for t in txt/*.txt; do
  n=$(tr -d '[:space:]' < "$t" | wc -c)
  [ "$n" -lt 20 ] && echo "Possibly scanned or empty: $t ($n bytes)"
done
```

**Example (not tested), Windows PowerShell:**

```
Get-ChildItem txt\*.txt | ForEach-Object {
  $n = ((Get-Content $_.FullName -Raw -Encoding UTF8) -replace '\s','').Length
  if ($n -lt 20) { "Possibly scanned or empty: " + $_.Name + " (" + $n + " characters)" }
}
```

Read the result as a hint, not a verdict:
- **Empty output suggests a scanned PDF**, but it can have other causes: a blank document, a protected file, or text drawn as images or shapes.
- **Partly empty files exist.** A report might be digital with a few scanned pages inside. A file that passes the check can still have blank pages. To find those, convert page by page with `-f` and `-l` and compare.
- **A tiny output doesn't prove a scan either.** A one-page cover sheet may legitimately have little text.
- **Always open a few flagged files** and look before you decide what to do with them.

## What to do with the scanned files
Move them into their own folder and handle them separately with an OCR tool (software that reads text out of images). Some OCR tools are free and some are paid. Their quality depends heavily on scan quality and language, so test on a few files first. This guide doesn't cover OCR setup.

## Common pitfalls
- **Multi-column pages.** The default reading order can mix columns. Compare against the original, and try `-layout` to see if it helps.
- **Tables.** They come out as running text, or as spaced text with `-layout`, not as structured data. Check any numbers that matter.
- **Encrypted PDFs.** These may fail or need a password. See `pdftotext`'s password options in its man page.
- **Odd fonts and non-Latin text.** Some encodings lose characters. Test with your real language.
- **Headers, footers and page numbers.** They repeat on every page and show up in the text.
- **File names with spaces.** Keep the quotes in the shell examples above.

## Option: a hosted run, if you have PDF links (disclosure: we built it)
I built an Apify Actor called **PDF to Markdown Converter & PDF Text Extractor for LLM/RAG** (`lineagersiui/pdf-text-extractor`). I'm the developer, so this is not a neutral recommendation, and it is new with few users. It is not a replacement for the folder method above. It works from links, not from files on your disk.

What it does, per its source code and listing:
- Takes a list of public PDF links (up to 100 per run, 50 MB each, 500 MB in total, up to 25 per website). There are no file uploads, so local files stay with the free method above.
- Returns the text layer as Markdown (headings guessed from font size, paragraphs, lists, page markers) or as plain text, one dataset item per document or per page.
- Each item includes the URL, title, total pages, pages read, which pages had text and which were completely empty, and an error code if the document failed. For billing, a page needs at least 20 non-whitespace characters, so a page with only a page number or a short stamp is reported as having text but is not billed.
- Runs with no URLs give a free demo on the first 5 pages of a public document.

Limits:
- **No OCR.** Scanned pages come back empty and are listed under pages without text. This is the same signal as the empty-file check above.
- No tables as structured data, images are skipped, and encrypted PDFs are not supported.
- Non-demo runs require you to tick a rights confirmation.

Pricing is pay per event. A page with at least 20 characters of text is one billable event, at most 15 pages are billed per document, and the listing showed $0.0003 per page when this guide was written. Pages without text, failed or duplicate documents, and the demo are not billed. The Pricing tab on the Actor page is the source of truth.

If your PDFs are on your own disk, the free `pdftotext` method is the better fit.

Actor page: https://apify.com/lineagersiui/pdf-text-extractor

## Checklist
1. Install `pdftotext` and confirm it runs.
2. Convert a few representative files and open the results next to the originals.
3. Run the whole folder.
4. Run the empty-output check and set the flagged files aside.
5. Spot-check some "good" files for blank pages, columns and tables.

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

Testing note: none of the commands or scripts in this guide have been run by the author; they are examples. The `pdftotext` options, default output naming, stdout behaviour and exit codes were taken from the Poppler `pdftotext` man page (Debian manpages site) as read on 2026-11-02. The Actor description was checked against its source code, README and the public API listing on 2026-11-02. No benchmark was run, and no accuracy or quality claims are made. Package names and install steps change, so check current instructions.
