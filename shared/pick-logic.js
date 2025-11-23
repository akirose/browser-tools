/**
 * Interactive element picker logic
 *
 * This code is injected into the browser page to provide an interactive
 * UI for selecting DOM elements. It creates an overlay with highlighting
 * and allows single or multiple element selection.
 *
 * Usage:
 *   await page.addScriptTag({ content: pickLogicCode });
 *   const result = await page.evaluate((msg) => window.pick(msg), message);
 */

/**
 * The pick function that gets injected into the page
 * This needs to be a string that can be injected via page.evaluate()
 */
export const pickLogicCode = `
if (!window.pick) {
	window.pick = async (message) => {
		if (!message) {
			throw new Error("pick() requires a message parameter");
		}

		return new Promise((resolve) => {
			const selections = [];
			const selectedElements = new Set();

			// Create overlay container
			const overlay = document.createElement("div");
			overlay.style.cssText =
				"position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;pointer-events:none";

			// Create highlight box that follows the mouse
			const highlight = document.createElement("div");
			highlight.style.cssText =
				"position:absolute;border:2px solid #3b82f6;background:rgba(59,130,246,0.1);transition:all 0.1s";
			overlay.appendChild(highlight);

			// Create instruction banner
			const banner = document.createElement("div");
			banner.style.cssText =
				"position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1f2937;color:white;padding:12px 24px;border-radius:8px;font:14px sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:auto;z-index:2147483647";

			const updateBanner = () => {
				banner.textContent = \`\${message} (\${selections.length} selected, Cmd/Ctrl+click to add, Enter to finish, ESC to cancel)\`;
			};
			updateBanner();

			document.body.append(banner, overlay);

			// Cleanup function to remove all UI elements
			const cleanup = () => {
				document.removeEventListener("mousemove", onMove, true);
				document.removeEventListener("click", onClick, true);
				document.removeEventListener("keydown", onKey, true);
				overlay.remove();
				banner.remove();
				selectedElements.forEach((el) => {
					el.style.outline = "";
				});
			};

			// Update highlight position on mouse move
			const onMove = (e) => {
				const el = document.elementFromPoint(e.clientX, e.clientY);
				if (!el || overlay.contains(el) || banner.contains(el)) return;

				const r = el.getBoundingClientRect();
				highlight.style.cssText = \`position:absolute;border:2px solid #3b82f6;background:rgba(59,130,246,0.1);top:\${r.top}px;left:\${r.left}px;width:\${r.width}px;height:\${r.height}px\`;
			};

			// Build element information object
			const buildElementInfo = (el) => {
				const parents = [];
				let current = el.parentElement;

				// Build parent chain for context
				while (current && current !== document.body) {
					const parentInfo = current.tagName.toLowerCase();
					const id = current.id ? \`#\${current.id}\` : "";
					const cls = current.className
						? \`.\${current.className.trim().split(/\\s+/).join(".")}\`
						: "";
					parents.push(parentInfo + id + cls);
					current = current.parentElement;
				}

				return {
					tag: el.tagName.toLowerCase(),
					id: el.id || null,
					class: el.className || null,
					text: el.textContent?.trim().slice(0, 200) || null,
					html: el.outerHTML.slice(0, 500),
					parents: parents.join(" > "),
				};
			};

			// Handle click events
			const onClick = (e) => {
				if (banner.contains(e.target)) return;

				e.preventDefault();
				e.stopPropagation();

				const el = document.elementFromPoint(e.clientX, e.clientY);
				if (!el || overlay.contains(el) || banner.contains(el)) return;

				// Multi-select mode (Cmd/Ctrl + Click)
				if (e.metaKey || e.ctrlKey) {
					if (!selectedElements.has(el)) {
						selectedElements.add(el);
						el.style.outline = "3px solid #10b981";
						selections.push(buildElementInfo(el));
						updateBanner();
					}
				}
				// Single select mode (regular click)
				else {
					cleanup();
					const info = buildElementInfo(el);
					// If we have multi-selections, return them; otherwise return single selection
					resolve(selections.length > 0 ? selections : info);
				}
			};

			// Handle keyboard events
			const onKey = (e) => {
				// ESC to cancel
				if (e.key === "Escape") {
					e.preventDefault();
					cleanup();
					resolve(null);
				}
				// Enter to confirm multi-selection
				else if (e.key === "Enter" && selections.length > 0) {
					e.preventDefault();
					cleanup();
					resolve(selections);
				}
			};

			// Attach event listeners
			document.addEventListener("mousemove", onMove, true);
			document.addEventListener("click", onClick, true);
			document.addEventListener("keydown", onKey, true);
		});
	};
}
`;

/**
 * Initialize the pick functionality on a page
 * @param {Page} page - Playwright page object
 */
export async function initializePicker(page) {
	await page.evaluate(pickLogicCode);
}

/**
 * Run the picker with a message
 * @param {Page} page - Playwright page object
 * @param {string} message - Message to display to the user
 * @returns {Promise<Object|Array|null>} Selected element(s) info or null if cancelled
 */
export async function runPicker(page, message) {
	await initializePicker(page);
	return await page.evaluate((msg) => window.pick(msg), message);
}
