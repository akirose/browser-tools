#!/usr/bin/env node

import { tmpdir } from "node:os";
import { join } from "node:path";
import { connectToActivePage, closeBrowser } from "./shared/browser.js";
import { formatTimestampForFilename } from "./shared/format.js";

const { browser, page } = await connectToActivePage();

const timestamp = formatTimestampForFilename();
const filename = `screenshot-${timestamp}.png`;
const filepath = join(tmpdir(), filename);

await page.screenshot({ path: filepath });

console.log(filepath);

await closeBrowser(browser);
