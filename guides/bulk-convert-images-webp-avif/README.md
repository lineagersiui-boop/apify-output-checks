# How to bulk convert and compress website images to WebP or AVIF

Large JPEG and PNG files are a common reason pages load slowly. WebP and AVIF are usually much smaller than JPEG or PNG at similar visual quality, but the savings vary by image, so test on your own files. This guide covers free ways to convert a whole folder or list of images, what to watch out for, and, at the end, a hosted option for people with image URLs and no desire to install tools.

## Before you start
- Keep your originals. Conversion to a lossy format cannot be undone.
- Decide the target: WebP is widely supported and quick to encode. AVIF is often smaller but slower to encode and needs more care with older software. Check current browser support for your audience on caniuse.com.
- Pick a quality and compare a few results by eye. A single global number is a starting point, not a rule. Photos and flat graphics behave differently.
- Decide about metadata. Camera photos can carry GPS location and camera details. Remove these before publishing unless you need the copyright fields, because stripping usually removes those too.

## Method 1: ImageMagick (free, command line)
ImageMagick converts many formats and runs on Windows, macOS and Linux. Typical commands look like this (not tested by the author; check the ImageMagick documentation for your version):

```
magick input.jpg -strip -quality 80 output.webp
magick mogrify -format webp -quality 80 -strip *.jpg
```

`-strip` removes metadata. The second command converts every JPEG in the folder and writes new `.webp` files next to the originals. AVIF output depends on how your ImageMagick was built, so confirm support first.

## Method 2: cwebp and avifenc (free, command line)
Google's `cwebp` tool, part of the libwebp package, converts to WebP. The `avifenc` tool from libavif converts to AVIF. Both let you set a quality level. Example (not tested):

```
cwebp -q 80 input.png -o output.webp
avifenc input.jpg output.avif
```

Wrap either in a shell loop to process a folder. Read each tool's help output for the current options, and for whether metadata is kept or dropped by default.

## Method 3: Squoosh (free, in the browser)
Squoosh is a free web app from the Chrome team. You drag in an image, choose a format and quality, and compare before and after side by side. It is good for judging what quality setting looks acceptable on a few representative images. It is a one-at-a-time tool, so it is slow for hundreds of files. Check the project page for its current status and for whether a command-line version still exists.

## Method 4: Your CMS, CDN or build step
Many CMS plugins, CDNs and build tools can convert images automatically on upload or at build time. If your platform already does this, that is usually less work than a separate batch step. Check its documentation for the formats and quality it uses.

## Common pitfalls
- **Quality too low.** Compare at full size, not thumbnails.
- **Animated GIFs.** Converting to a still format can lose the animation. Check how your tool handles it.
- **Transparency.** PNG with transparency should go to WebP or AVIF, not JPEG.
- **Orientation and colour.** Phone photos may rely on an orientation tag. Check rotated images after stripping metadata, and check that colours look right.
- **iPhone HEIC files.** Many tools cannot read HEIC. Convert those to JPEG first with a tool that supports it.
- **File-size limits.** Marketplaces, email and some CMSes cap upload size. Some tools can aim for a target size, and others only take a quality number, so you may need to repeat at lower quality.
- **Rights.** Only process images you own or are licensed to use.

## Method 5: A hosted option, if you have image URLs (disclosure: we built it)
I built an Apify Actor called **Image Converter & Compressor: Bulk WebP, AVIF, JPEG, PNG** (`lineagersiui/bulk-image-converter`). I am the developer, so this is not a neutral recommendation. It is new and has few users.

What the Actor does, based on its current code and listing:
- Takes a list of public image URLs (up to 500 per run, 25 MB each).
- Accepts JPEG, PNG, WebP, GIF, AVIF and TIFF input, and outputs WebP, AVIF, JPEG or PNG.
- Compresses to a quality you set (1 to 100, default 80), or tries to get each file under a target size in KB. The target is best effort and it does not shrink dimensions to reach it. If it cannot reach the target, it saves the smallest version and flags it.
- Optionally resizes to a width and/or height, and does not enlarge small images unless you turn that on.
- Removes EXIF, GPS and camera metadata by default (which also removes copyright and creator fields), rotates images upright and converts colours to sRGB.
- Saves converted files to the run's key-value store, and writes one report row per image with the byte savings.

Limits you should know about:
- **No HEIC/HEIF input and no SVG input.** They are rejected and not billed.
- Non-demo runs require you to tick a rights-confirmation input (`confirmRights`) saying you own or are licensed to use the images. Without it the run fails before fetching anything.
- Input is URLs only, so the images must be publicly reachable. There are no file uploads.
- Animated GIF and WebP are converted to their first frame only.
- It fetches at most 50 images per linked site per run, and paces requests to be polite to servers.

Pricing: pay per event, $0.001 per successfully converted image. Failed, rejected, duplicate (identical file content) and demo images are not billed. The Pricing tab on the Actor page is the source of truth, including any platform charges listed there. You can set a maximum charge per run. Running it with an empty URL list gives a free demo on 3 public-domain sample images.

If you have 20 images, one of the free methods above is probably enough. A hosted run mainly helps when you have a long list of URLs and would rather not install or script anything.

Actor page: https://apify.com/lineagersiui/bulk-image-converter

## Checklist after converting
1. Spot-check a sample at full size for artifacts.
2. Compare total size before and after.
3. Update your pages to reference the new files, with a fallback if you must support older browsers.
4. Re-test page speed.

---
Drafted with AI tools (an AI agent) under my direction. Not affiliated with or endorsed by Apify.

Testing note: the commands in this guide are examples that have not been run by the author. The Actor description was checked against its source code and public listing on 2026-10-29. No benchmark was run, and no file-size savings are claimed.
