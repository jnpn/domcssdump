# dom-css-dump

Quick-n-dirty DOM + computed styles dumper for debugging and diffing. Might be useful to detect changes in styles between two versions of a page.

Core original idea:
```
(div
	(p	"foo")
	(div
		(p	"bar")))
```
		
becomes

```
(div
	(p	"foo" [0,0,1,"auto","2px","red",...] /* computed styles values VS */ )
	(div
		(p	"bar" [0,1,1,"auto","4px","blue",...])
		[0,0,0,"auto","2px","gray",...]))
```

A set of simple zero-dependency JavaScript tools to dump a remote or local DOM tree alongside its nested styles. For each node, it extracts and stores an array of all its `window.getComputedStyle` values, computes deduplication hashes, and leverages CSS string-interning dictionaries to compress outputs.

The toolkit includes:
1. **Core Extractor Library** (`index.js`)
2. **Headless Automation Scraper** (`dump-url.js`)
3. **Dual-Pane CSS Diff Explorer UI** (`explorer.html`)

---

## 1. Core Extractor Library (`index.js`)
*Can be loaded directly into any browser environment to securely extract and parse a full DOM tree natively.*

- **`getStyleNames(node)`**: Interrogates the browser to extract an ordered array of every known CSS property explicitly supported in the runtime.
- **`dumpDomTree(node, styleNames)`**: Recursively descends the DOM tree yielding highly-structured arrays representing each node format: 
  `[tagName, ...children, hash, styleValuesArray]`
- **`dumpDomTreeInterned(node, styleNames, new Map(), [])`**: An ultra-compressed extractor proxy that uses dynamic string interning to replace colossal strings configurations (like `"rgba(0, 0, 0, 0)"` or `"0px"`) with simple tiny identifiers mapped back to a dedicated dictionary object.
- **`recreateStyleMap` / `recreateInternedStyleMap`**: Lightweight functions that perfectly reconstitute those minified arrays back into readable `{ "color": "blue", "padding": "2px" }` standard JS Objects.

## 2. Headless Automation Scraper (`dump-url.js`)
*An automated NodeJS CLI bridge integrating Puppeteer to fluently bypass frontend blocks and scrape entire computed DOM trees flawlessly into a local file.*

```bash
npm install                     # Install Puppeteer 
node dump-url.js "https://en.wikipedia.org" wikipedia.domcssdump
```
It instantly launches a Headless Chromium build, navigates to your targeted URL, securely circumvents CSP policies by directly evaluating our inner `index.js` logic context, leverages our string interning algorithm on massive trees, and safely saves the compressed output locally as json!

## 3. Visual Diff Explorer (`explorer.html`)
*A remarkably fast, deep-dark glassmorphic dual-pane dashboard to load, map, and scrutinize `.domcssdump` files side-by-side.*

1. Run any local static UI server in this specific directory (e.g. `python3 -m http.server 8089`).
2. Simply navigate to `http://localhost:8089/explorer.html` in your browser.
3. Upload your Base Dump and Compare Dump files using the top controls.
4. **Asynchronous Visual Tracing**: It parses tens of thousands of deeply nested DOM elements seamlessly via ultra-fast template string concatenators mapped with native EventDelegation so it'll never block the master thread.
5. **Structural Hashes**: Any internal hashes computed by `simpleHash()` that misalign structure between the DOM boundaries actively glow Neon Red to warn you!
6. **Live Inspector Dock**: Clicking on these mismatched differential nodes triggers the immersive inspector tray which reconstructs the CSS property mapping for both elements natively and automatically jumps you through the explicit CSS Property deviations via the "Prev/Next Diff" cyclic nav widgets!