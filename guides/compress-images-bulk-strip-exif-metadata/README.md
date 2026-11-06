# How to compress images in bulk and strip EXIF and GPS metadata (free methods)

Two jobs often come together. You have a folder of photos that is too big to upload or too slow to load, and you want to remove the hidden data inside them, such as GPS location, camera model and timestamps, before you publish or share. This guide covers free ways to do both for many files at once.

If you want to switch formats (for example JPEG to WebP or AVIF), see the companion guide: [bulk-convert-images-webp-avif](../bulk-convert-images-webp-avif/).

## What EXIF is, and why strip it
Most phone and camera photos contain metadata fields. These can include the GPS position where the photo was taken, the date and time, the device model and sometimes the owner's name. Many websites and platforms remove some of this on upload, but not all do, and you should not assume yours does. Check by viewing a published copy with a metadata viewer.

Two side effects to know about:
- Stripping everything usually also removes copyright and creator fields. If you need those, keep them on purpose (exiftool lets you choose which tags to remove).
- Some photos rely on an orientation tag to display upright. If you remove metadata without applying the rotation first, the image may appear sideways. Check a few results.

## Before you start
- **Work on copies.** Compression to a lossy setting cannot be undone, and metadata removal tools may overwrite files.
- **Check what is in a file first.** Look at one image's metadata before and after, so you know the removal worked.
- **Compression has two parts.** Lossless optimisation shrinks the file without changing pixels, but the saving is often small. Lossy compression (lower JPEG or WebP quality) saves much more, at some cost to quality. Resizing very large dimensions saves the most. Results vary by image, so test on your own files.

## Method 1: exiftool (free, command line) for metadata only
ExifTool is a widely used free tool for reading and editing metadata. It is the most precise way to control what gets removed. Typical commands look like this (not tested by the author; read the ExifTool documentation for your version):

```
exiftool -all= -overwrite_original_in_place photo.jpg
exiftool -gps:all= -overwrite_original_in_place *.jpg
exiftool -all= -r -ext jpg -ext png folder/
```

The first removes all metadata from one file, the second removes only GPS tags from every JPEG in the current folder, and the third works through a folder and its subfolders. By default exiftool keeps a backup copy with an `_original` suffix unless you tell it otherwise, so check your folder afterwards. Run a trial on copies first.

## Method 2: ImageMagick (free, command line) for compression and stripping together
ImageMagick can resize, recompress and strip metadata in one pass. Example (not tested by the author):

```
magick input.jpg -auto-orient -strip -quality 80 output.jpg
magick mogrify -path compressed -auto-orient -strip -quality 80 *.jpg
```

`-auto-orient` applies the rotation tag before it is removed, `-strip` removes metadata and `-quality` sets the lossy level. The `-path` option writes results to a separate folder (create it first). Lower quality gives smaller files; compare a few results by eye before running a whole batch. You can also add `-resize 2000x2000>` to shrink only images larger than that size (also untested; confirm the syntax in the documentation).

## Method 3: Dedicated optimisers (free, command line)
Tools such as `jpegoptim` (JPEG) and `oxipng` or `optipng` (PNG) are built for compression. They can strip metadata as an option and many can target a maximum quality or file size. Check each tool's help output for the flags in your version. These suit a lossless or near-lossless pass over a large folder.

## Method 4: Squoosh (free, in the browser)
Squoosh is a free web app from the Chrome team. Drag in an image, pick a format and quality, and compare before and after side by side. It is the best way to decide what quality is acceptable for a few representative images. It processes one image at a time, so it is slow for hundreds of files. Check the project page for its current status.

## Method 5: Built-in operating system options
- **Windows:** right-click a file, open Properties, then Details and use "Remove Properties and Personal Information" to strip metadata from selected files. This does not compress.
- **macOS:** Preview can export at a lower quality, and the export dialog has options for what to include. Behaviour differs by version.

These are fine for a handful of files, not for thousands.

## Hitting an upload limit
If a site caps file size, some tools can aim for a target and others only accept a quality number. In the second case, lower the quality or dimensions step by step until the files fit, then spot-check them. Text and sharp graphics show compression artifacts sooner than photographs do.

## Common pitfalls
- **Sideways images** after stripping. Apply auto-orient first.
- **Quality set too low.** Judge at full size, not thumbnails.
- **Transparent PNGs saved as JPEG** lose their transparency.
- **Animated GIFs** may lose their animation if converted to a still format.
- **iPhone HEIC files** are not read by many tools. Convert them to JPEG first with software that supports it.
- **Metadata can live outside the file.** Filenames, folder names and surrounding page text can reveal location too.
- **Rights.** Only process images you own or are licensed to use.

## Hosted option if you have image URLs (disclosure: we built it)
I built an Apify Actor called **Bulk Image Compressor & Converter: Images to WebP, AVIF** (`lineagersiui/bulk-image-converter`). I am the developer, so this is not a neutral recommendation. It is new and has very few users and no reviews yet.

What it does, based on its current listing and code:
- Takes a list of public image URLs (up to 500 per run, 25 MB each).
- Outputs WebP, AVIF, JPEG or PNG, and accepts JPEG, PNG, WebP, GIF, AVIF and TIFF input.
- Compresses to a quality you set (1 to 100, default 80), or tries to get each file under a target size in KB. The target is best effort and it does not shrink dimensions to reach it. If it cannot reach the target it saves the smallest version and flags it.
- Optionally resizes, and does not enlarge small images unless you turn that on.
- Removes EXIF, GPS and camera metadata by default (this also removes copyright and creator fields), rotates images upright and converts colours to sRGB.
- Saves the files to the run's key-value store and writes one report row per image with the byte savings.

Limits:
- No HEIC/HEIF or SVG input. These are rejected and not billed.
- Input is public URLs only. There are no file uploads, so it will not help with files that exist only on your computer.
- Non-demo runs require a rights-confirmation input saying you own or are licensed to use the images.
- Animated GIF and WebP are reduced to the first frame.
- It fetches at most 50 images per linked site per run.

Pricing: pay per event, $0.001 per successfully converted image (about $1 per 1,000). Failed, rejected, duplicate and demo images are not billed. The Pricing tab on the Actor page is the source of truth, including any platform charges. You can set a maximum charge per run, and an empty URL list runs a free demo on 3 sample images.

For a few dozen files, the free methods above are likely enough. A hosted run mainly helps if you already have a long list of image URLs and would rather not install or script anything.

Actor page: https://apify.com/lineagersiui/bulk-image-converter

## Checklist after processing
1. Open a sample at full size and check for artifacts and correct rotation.
2. Run a metadata viewer on a processed file and confirm GPS and camera fields are gone.
3. Compare total folder size before and after.
4. Keep the originals somewhere private.

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

Testing note: nothing in this guide was run or tested. The commands are examples taken from general tool knowledge and must be checked against current documentation. The Actor description was compared with its public listing and source code on 2026-11-01. No benchmark was run, and no file-size savings are claimed.
