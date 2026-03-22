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

/**
 * Dumps a DOM tree starting from `node`, using string interning for computed style values.
 * This significantly reduces the size of the generated array output.
 * Array format: [tagName, ...children, styleValuesIdsArray]
 * 
 * To use this, the caller should maintain and pass a Map and an Array:
 * const internMap = new Map(); const dict = [];
 * const tree = dumpDomTreeInterned(node, styleNames, internMap, dict);
 * // dict now contains the unique string values.
 * 
 * @param {Node} node The DOM node to start from
 * @param {string[]} styleNames The array of style names to dump
 * @param {Map<string, number>} internMap Map of style value to integer ID
 * @param {string[]} internedValues Array of unique style values
 * @returns {unknown[]} Nested array representing DOM and integer-mapped styles
 */
export function dumpDomTreeInterned(node, styleNames, internMap, internedValues) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    if (!text) return null;
    return text;
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  
  const computedStyle = window.getComputedStyle(node);
  const styleValuesIds = styleNames.map(name => {
    const val = computedStyle.getPropertyValue(name);
    if (!internMap.has(val)) {
      internMap.set(val, internedValues.length);
      internedValues.push(val);
    }
    return internMap.get(val);
  });
  
  const children = Array.from(node.childNodes)
    .map(child => dumpDomTreeInterned(child, styleNames, internMap, internedValues))
    .filter(child => child !== null);
    
  return [
    node.tagName.toLowerCase(),
    ...children,
    styleValuesIds
  ];
}

/**
 * Recreates the computed style object for a node mapped with string interning.
 * @param {string[]} styleNames Array of CSS property names
 * @param {number[]} styleValueIds Array of computed style value IDs for the node
 * @param {string[]} internedValues Array of unique style values dictionary
 * @returns {Record<string, string>} Object mapping style name to value
 */
export function recreateInternedStyleMap(styleNames, styleValueIds, internedValues) {
  const styleMap = {};
  for (let i = 0; i < styleNames.length; i++) {
    const key = styleNames[i];
    styleMap[key] = internedValues[styleValueIds[i]];
  }
  return styleMap;
}
