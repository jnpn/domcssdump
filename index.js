/**
 * Gets an array of all computed style property names for a given node.
 * If no node is provided, it attempts to use document.body.
 * @param {Node} node 
 * @returns {string[]} Array of CSS property names
 */
export function getStyleNames(node = document.body) {
  if (!node) return [];
  const computedStyle = window.getComputedStyle(node);
  const ObjectKeysLikeLengthCount = computedStyle.length;
  const names = [];
  
  for (let i = 0; i < ObjectKeysLikeLengthCount; i++) {
    names.push(computedStyle[i]);
  }
  
  return names;
}

/**
 * Dumps a DOM tree starting from `node`, generating a nested array representation.
 * Array format: [tagName, ...children, styleValuesArray]
 * For text nodes: "text content"
 * @param {Node} node The DOM node to start from
 * @param {string[]} styleNames The array of style names to dump
 * @returns {unknown[]} Nested array representing DOM and computed styles
 */
export function dumpDomTree(node, styleNames) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    if (!text) return null;
    return text;
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  
  const computedStyle = window.getComputedStyle(node);
  const styleValues = styleNames.map(name => computedStyle.getPropertyValue(name));
  
  const children = Array.from(node.childNodes)
    .map(child => dumpDomTree(child, styleNames))
    .filter(child => child !== null);
    
  return [
    node.tagName.toLowerCase(),
    ...children,
    styleValues
  ];
}

/**
 * Recreates the computed style object mapping style names to values.
 * @param {string[]} styleNames Array of CSS property names
 * @param {string[]} styleValues Array of computed style values
 * @returns {Record<string, string>} Object mapping style name to value
 */
export function recreateStyleMap(styleNames, styleValues) {
  const styleMap = {};
  for (let i = 0; i < styleNames.length; i++) {
    const key = styleNames[i];
    styleMap[key] = styleValues[i];
  }
  return styleMap;
}
