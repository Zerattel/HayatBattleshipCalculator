/**
 *
 * @param {string} value
 * @param {string | RegExp} compareTo
 * @returns {boolean}
 */
export function stringOrRegex(value, compareTo) {
  return typeof compareTo == "string" ? value == compareTo : compareTo.test(value);
}

export function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
