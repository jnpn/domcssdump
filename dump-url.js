import puppeteer from 'puppeteer';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const url = process.argv[2];
const outputFile = process.argv[3];

if (!url || !outputFile) {
  console.error("Usage: node dump-url.js <URL> <output-file>");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load our local index.js tools and strip exports so they evaluate nicely in the browser
const jsPath = join(__dirname, 'index.js');
const dumperScript = fs.readFileSync(jsPath, 'utf-8');
const browserReadyScript = dumperScript.replace(/export function /g, 'function ');

(async () => {
  console.log(`Starting headless browser to dump ${url}...`);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Set a standard viewport to ensure consistent renders
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to the target URL
  await page.goto(url, { waitUntil: 'networkidle0' });

  console.log(`Page loaded. Injecting dom-css-dump script...`);

  // Inject the script into the page context
  await page.addScriptTag({ content: browserReadyScript });

  console.log(`Extracting DOM and Computed Styles...`);

  const dumpResult = await page.evaluate(() => {
    // These functions are now globally available from our injected script
    const styleNames = window.getStyleNames(document.body);
    const internMap = new Map();
    const internedValues = [];
    const tree = window.dumpDomTreeInterned(document.body, styleNames, internMap, internedValues);

    return {
      styleNames,
      dict: internedValues,
      tree
    };
  });

  console.log(`Dumped successfully. Writing to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(dumpResult));

  const fileSizeMb = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
  console.log(`Complete! File saved to ${outputFile} (${fileSizeMb} MB)`);

  await browser.close();
})();
