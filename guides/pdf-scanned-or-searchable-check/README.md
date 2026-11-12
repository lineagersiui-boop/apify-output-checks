# How to Check if a PDF Is Scanned or Searchable (and Why pdftotext Returns Empty)

A PDF can look like a normal document and still contain no text at all. If you have ever run `pdftotext` and got an empty file, this is probably why. This guide shows how to tell, using free methods first.

## The short version

- **Searchable (text-based) PDF:** contains a text layer. You can select, copy and search the words.
- **Scanned (image-only) PDF:** each page is a picture of a page. There is no text layer, so text tools have nothing to extract.
- **Mixed PDF:** some pages have text, others are scans. This is common with merged documents, and a whole-file test can mislead you.

## Method 1: Text selection test (free, 30 seconds)

1. Open the PDF in any viewer (browser, Adobe Reader, Preview, etc.).
2. Try to click and drag to highlight a sentence, or press Ctrl+F (Cmd+F on Mac) and search for a word you can see on the page.
3. Copy the highlighted text and paste it into a plain text editor.

How to read the result:
- Text highlights word by word and the paste is readable: the page has a text layer.
- You can only drag a box over the whole page, or nothing highlights, or search finds nothing: the page is probably an image.
- Garbled characters on paste: there is a text layer, but it is broken (font encoding problems). That is a different problem from a scan, and OCR may still help.

Check several pages, not just the first. A cover page can be a real text page while the body is scanned, or the other way round.

## Method 2: Look at what pdftotext gives you (free)

`pdftotext` is part of the Poppler tools. If you already have it installed, run it on the file and open the output.

- Readable text: searchable.
- Empty file, or only blank lines and page-break characters: usually a scan with no text layer. The tool did not fail. It found nothing to extract.
- A few stray characters (page numbers, a header or footer) but no body text: often a scan with a thin text layer, or a mixed file.

Empty output is a strong hint, not proof. A password-protected or damaged file can also give poor results, so confirm with Method 1 on a few pages.

For checking a whole folder at once, see our existing guide: [extract-text-from-multiple-pdfs-command-line](../extract-text-from-multiple-pdfs-command-line/README.md).

## Method 3: Check for fonts and images (free, optional)

Poppler also ships `pdffonts` and `pdfimages`. As a rough guide:
- A searchable PDF usually lists fonts.
- A pure scan usually lists no fonts and has one large image per page.

This is a heuristic. Some OCR'd PDFs also contain a full-page image plus an invisible text layer, so the text selection test remains the more reliable check.

## Method 4: Add a text layer with OCRmyPDF (free, open source)

If the PDF is a scan, you need OCR (optical character recognition) to turn the page images into text. OCRmyPDF is a free tool that adds an OCR text layer to a PDF.

The mode that matters for mixed files is skip mode. According to the OCRmyPDF documentation, `--skip-text` (the older name for `--mode skip`) means no image processing or OCR is performed on pages that already have text, and those pages are copied to the output. Pages without text are OCR'd. This is the safe choice when you are not sure which pages are scans.

Related options, per the OCRmyPDF docs:
- By default, OCRmyPDF exits with an error if the file already contains OCR text.
- `--redo-ocr` replaces existing OCR text.
- `--force-ocr` rasterizes all pages, which can reduce quality or lose vector content. Use it last.

Install steps and exact usage change between versions, so follow the current OCRmyPDF documentation rather than a copied command. OCR quality depends on scan quality and language settings, so always spot-check the output.

## After OCR: verify the result

1. Re-run the Method 1 selection test on several pages.
2. Run `pdftotext` again and compare a few passages with the page image.
3. Check numbers, tables and names by eye. OCR errors tend to hide in those.

## Common pitfalls

- **Testing only page 1.** Mixed PDFs exist.
- **Searchable-looking scans.** Some scans already have a poor OCR layer, so text exists but is wrong. Compare against the image.
- **Assuming empty means failed.** An empty extraction from a scan is the correct behavior of a text-only tool.
- **Expecting text extraction to read images.** Text extraction reads the text layer. It does not recognize pictures of text.

## Option: a hosted run for text-based PDFs (disclosure: we built it)

We publish an Apify Actor called **PDF to Markdown Converter & PDF Text Extractor for LLM/RAG** (`pdf-text-extractor`). It takes PDF URLs and returns Markdown or plain text, per document or per page.

- It does **no OCR**. It extracts the text layer only, so it is for text-based PDFs. Scanned PDFs are not supported.
- Per its Store listing, pricing is $0.30 per 1,000 pages with text, with at most 15 pages billed per document. Check the listing for current terms before use.
- If you have scans, use OCR (Method 4) first, then give the OCR'd PDF a public link.

Store listing: https://apify.com/lineagersiui/pdf-text-extractor

You do not need it to follow this guide. The free methods above work without it.

## Checklist

- [ ] Selected and copied text from several pages
- [ ] Ran `pdftotext` and read the output
- [ ] Decided: searchable, scanned or mixed
- [ ] If scanned or mixed: OCR with skip mode, then re-verify
- [ ] Spot-checked numbers and names

---

Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

**Testing note:** No commands were run for this guide, and none are included. The statements about OCRmyPDF options come from its documentation (checked 2026-11-09). The statements about the Actor come from its live Store listing (checked 2026-11-09). The selection test, `pdftotext` behavior, `pdffonts`/`pdfimages` heuristics and the "mixed PDF" cases are general knowledge and were not tested on sample files for this guide. OCR quality was not tested.
