/**
 * Extend string prototype
 */
$define(String.prototype, {
  startsWith: function(str) {
    if (str === null || str === undefined || str.length === 0)
      return true;
    return this.substr(0, str.length) === str;
  },
  endsWith: function(str) {
    if (str === null || str === undefined || str.length === 0)
      return true;
    return this.substr(-str.length) === str;
  }
}, true);
