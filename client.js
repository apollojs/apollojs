






(function() {








/**
 * Extend an object with another object
 * @param  {Object} obj      object to be extended
 * @param  {Object} ext      extension object
 * @param  {bool} override   Overwrite existing properties in obj
 * @param  {bool} deep       Doing an deep extend (perform extend on every object property)
 * @return {Object}          reference to obj
 */
function $extend(obj, ext, override, deep) {
  var key;
  if (override) {
    if (deep)
      _overrideDeepExtend(obj, ext);
    else
      for (key in ext)
        obj[key] = ext[key];
  } else {
    if (deep)
      _deepExtend(obj, ext);
    else
      for (key in ext)
        if (!(key in obj))
          obj[key] = ext[key];
  }
  return obj;
}

function _overrideDeepExtend(obj, ext) {
  for (var key in ext)
    if (Object.isObjectStrict(obj[key]) && Object.isObjectStrict(ext[key]))
      _overrideDeepExtend(obj[key], ext[key]);
    else
      obj[key] = ext[key];
}

function _deepExtend(obj, ext) {
  for (var key in ext)
    if (Object.isObjectStrict(obj[key]) && Object.isObjectStrict(ext[key]))
      _deepExtend(obj[key], ext[key]);
    else if (!(key in obj))
      obj[key] = ext[key];
}

/**
 * Define properties of an Object, Which usually used to extend prototype
 *   of an object, as it will set properties as non-enumerable, and will
 *   turn setValue(value) and getValue() functions to setter and getters.
 * Note: You should only use $define or Object.defineProperty on prototype,
 *   or on a class' itself (to define static methods), instead of on instances
 *   which could lead to severe performance issue.
 * @param  {Object} object    target object
 * @param  {Object} prototype extension object
 * @param  {bool} preserve    preserve existing property
 * @return {Object}           reference to object
 */
function $define(object, prototype, preserve) {
  Object.getOwnPropertyNames(prototype).forEach(function(key) {
    if (preserve && (key in object))
      return;
    var desc = Object.getOwnPropertyDescriptor(prototype, key);
    if ('value' in desc)
      desc.writable = true;
    delete desc.enumerable;
    delete desc.configurable;
    Object.defineProperty(object, key, desc);
  });
  return object;
}

/**
 * Declare a Class.
 * @param  {Function} fn      constructor of the Class
 * @param  {Object} prototype prototype of Class
 * @return {Function}         reference to constructor
 */
function $declare(fn, prototype) {
  fn.prototype.constructor = fn;
  $define(fn.prototype, prototype);
  return fn;
}

/**
 * Inherit another Class to current Class
 * @param  {Function} fn      constructor of the Class
 * @param  {Function} parent  parent Class
 * @param  {Object} prototype prototype of Class
 * @return {Function}         reference to constructor
 */


var $inherit = (function() {
  if (Object.__proto__)
    return function(fn, parent, prototype) {
      fn.prototype = {
        constructor: fn,
        __proto__: parent.prototype
      };
      if (prototype)
        $define(fn.prototype, prototype);
      return fn;
    };
  // Fix IE support
  return function (fn, parent, prototype) {
    var proto = {};
    Object.getOwnPropertyNames(parent.prototype).forEach(function(name) {
      proto[name] = parent.prototype[name];
    });
    proto.constructor = fn;
    $define(fn.prototype, proto);
    if (prototype)
      $define(fn.prototype, prototype);
    return fn;
  };
})();



/**
 * Adding enumerations to a Class (both static and prototype).
 * @param  {Function} fn     constructor of the Class
 * @param  {Object}   values object holding all enumerates want to define
 * @return {Function}        reference to constructor
 */
function $defenum(fn, values) {
  $define(fn, values);
  $define(fn.prototype, values);
  return fn;
}

/**
 * Format a string with given pattern.
 * @param  {string} str pattern
 * @return {string}     formatted string
 */


function $format(str) {
  var args = arguments;
  var index = 1;
  return str.replace(/%([sdj])/g, function(all, type) {
    if (type === 'j')
      return JSON.stringify(args[index++]);
    return args[index++];
  });
}







/**
 * Making an Error instance with given format and parameters.
 * Note: this is a helper function works like util.format(),
 *   apart from it returns an Error object instead of string.
 * @return {Error} generated Error instance
 */
function $error() {
  return new Error($format.apply(null, arguments));
}


/**
 * Generate a deep copy of an Object with its primitive typed
 * fields (exclude functions).
 * @param  {mixed} obj  source object
 * @return {mixed}      cloned object
 */
function $valueCopy(obj) {
  var res;
  if (Array.isArray(obj)) {
    res = obj.slice(0);
    for (var i = 0; i < res.length; i++)
      if (Object.isObject(res[i]))
        res[i] = $valueCopy(res[i]);
  } else if (Object.isObjectStrict(obj)) {
    res = {};
    for (var key in obj)
      res[key] = $valueCopy(obj[key]);
  } else if (Function.isFunction(obj)) {
    return undefined;
  } else {
    return obj;
  }
  return res;
}

/**
 * Generates a copy of an Object.
 * @param  {Mixed} org  source object
 * @param  {bool} deep  perform a deep clone
 * @return {Mixed}      cloned object
 */
function $clone(obj, deep) {
  var res;
  var _deep = deep === true || deep - 1;
  if (Array.isArray(obj)) {
    res = obj.slice(0);
    if (deep)
      for (var i = 0; i < res.length; i++)
        if (Object.isObject(res[i]))
          res[i] = $clone(res[i], _deep);
  } else if (Object.isObjectStrict(obj)) {
    res = {};
    for (var key in obj)
      res[key] = obj[key];
    if (deep)
      for (var key in obj)
        if (Object.isObject(res[key]))
          res[key] = $clone(res[key], _deep);
  } else {
    return obj;
  }
  return res;
}

/**
 * Return default value of an undefined variable.
 * @param  {Mixed} val  value
 * @param  {Mixed} def  default value
 * @return {Mixed}
 */
function $default(val, def) {
  return val === undefined ? def : val;
}

/**
 * Wrap an object with given Class.
 * Note: it will call Class.__wrap method to do custom wrapping.
 * @param  {Object} obj     object to be wrapped
 * @param  {Function} Type  wrapping Class
 * @return {Object}         wrapped object
 */


var $wrap = (function() {
  if (Object.__proto__)
    return function(obj, Type) {
      obj.__proto__ = Type.prototype;
      if (Type.__wrap)
        Type.__wrap(obj);
      return obj;
    };
  // Fix IE support
  return function(obj, Type) {
    $extend(obj, Type.prototype);
    if (Type.__wrap)
      Type.__wrap(obj);
    return obj;
  };
});



$define(window, {
  $extend: $extend,
  $define: $define,
  $declare: $declare,
  $inherit: $inherit,
  $defenum: $defenum,
  $format: $format,
  $error: $error,
  $valueCopy: $valueCopy,
  $clone: $clone,
  $default: $default,
  $wrap: $wrap






});

$define(String.prototype, {
  /**
   * Repeat current string for given times.
   * @param  {int} times  Times to repeat
   * @return {string}     result
   */
  repeat: function(times) {
    var res = '';
    for (var i = 0; i < times; i++)
      res += this;
    return res;
  },
  /**
   * Padding this to given length with specified char from left.
   * @param  {char} ch    padding char
   * @param  {int} length desired length
   * @return {string}     result
   */
  paddingLeft: function(ch, length) {
    if (this.length < length)
      return ch.repeat(length - this.length) + this;
    return this;
  },
  /**
   * Padding this to given length with specified char from right.
   * @param  {char} ch    padding char
   * @param  {int} length desired length
   * @return {string}     result
   */
  paddingRight: function(ch, length) {
    if (this.length < length)
      return this + ch.repeat(length - this.length);
    return this;
  },

  /**
   * get last character in this string
   * @return {String} last character
   */
  get back() {
    return this[this.length - 1];
  },
  /**
   * get first character in this string
   * @return {String} first character
   */
  get front() {
    return this[0];
  },

  /**
   * Tests if this string starts with the given one.
   * @param  {string} str string to test with
   * @param  {number} pos optional, position to start compare, defaults
   *                      to 0
   * @return {bool}       result
   */
  startsWith: function(str, pos) {
    if (str === null || str === undefined || str.length === 0)
      return true;
    return this.substr(pos || 0, str.length) === str;
  },
  /**
   * Tests if this string ends with the given one.
   * @param  {string} str string to test with
   * @param  {number} len optional, pretend this string is of given length,
   *                      defaults to actual length
   * @return {bool}       result
   */
  endsWith: function(str, len) {
    if (str === null || str === undefined || str.length === 0)
      return true;
    return this.substr((len || this.length) - str.length, str.length) === str;
  },
  /**
   * Return a string in it's title form.
   * @return {string} string in title case
   * Note: if a word containing upper case, nothing
   *   will be done.
   */
  toTitleCase: function() {
    return this.replace(/\b([a-z])(['a-z]*)\b/g, function(all, letter, rest) {
      return letter.toUpperCase() + rest;
    });
  },
  /**
   * Trim whitespaces at the begining of the string
   * @return {string} trimmed string
   */
  trimLeft: function() {
    return this.replace(/^\s+/, '');
  },
  /**
   * Trim whitespaces at the ending of the string
   * @return {string} trimmed string
   */
  trimRight: function() {
    return this.replace(/\s+$/, '');
  }
}, true);

$define(Number.prototype, {
  /**
   * Clamp current value to the given range [lb, ub]
   * @param  {number} lb lower bound
   * @param  {number} ub upper bound
   * @return {number}    result
   */
  clamp: function(lb, ub) {
    var rtn = Number(this);
    if (lb !== undefined && rtn < lb)
      rtn = lb;
    if (ub !== undefined && rtn > ub)
      rtn = ub;
    return rtn;
  },
  /**
   * Shortcut to Math.floor(this)
   * @return {number} Math.floor(this)
   */
  floor: function() {
    return Math.floor(this);
  },
  /**
   * Shortcut to Math.ceil(this)
   * @return {number} Math.ceil(this)
   */
  ceil: function() {
    return Math.ceil(this);
  },
  /**
   * Shortcut to Math.round(this) with additional parameters
   * @param  {number} decimals number of decimal digits to round up to
   * @return {number}          rounded number
   */
  round: function(decimals) {
    if (decimals) {
      var unit = Math.pow(10, decimals);
      return Math.round(this * unit) / unit;
    }
    return Math.round(this);
  },
  /**
   * Get the thousands separated number
   * @param  {number} decimals  number of decimal digits to remain
   * @param  {string} separator separator
   * @return {string}           separated number
   */
  toGroup: function(decimals, separator) {

    decimals = decimals || 0;

    if (this > -1000 && this < 1000)
      return this.toFixed(decimals);

    separator = separator || ',';

    var sign = this < 0 ? '-' : '';
    var tmp = Math.abs(this).toFixed(decimals);

    var intPart, decimalPart;
    if (decimals > 0) {
      intPart = tmp.substr(0, tmp.length - decimals - 1);
      decimalPart = tmp.substr(tmp.length - decimals - 1);
    } else {
      intPart = tmp;
      decimalPart = '';
    }

    var res = '';
    for (var pos = 0, len = intPart.length % 3 || 3;
        pos < intPart.length; pos += len, len = 3) {
      if (res !== '')
        res += separator;
      res += intPart.substr(pos, len);
    }
    return sign + res + decimalPart;

  }
});

$define(Array.prototype, {
  /**
   * get minimum value in this array
   * @return {Mixed} minimal value
   */
  min: function() {
    var res = this[0];
    for (var i = 1; i < this.length; i++)
      if (this[i] < res)
        res = this[i];
    return res;
  },
  /**
   * get maximum value in this array
   * @return {Mixed} maximum value
   */
  max: function() {
    var res = this[0];
    for (var i = 1; i < this.length; i++)
      if (this[i] > res)
        res = this[i];
    return res;
  },
  /**
   * Push a value iif it's not in this array, and return value's index.
   * @param  {Mixed} val  new value
   * @return {int}        index of the value
   * Note: This only works with primitive typed elements, which can be found
   *       with Array#indexOf().
   */
  add: function(val) {
    var index = this.indexOf(val);
    if (index === -1)
      return this.push(val) - 1;
    return index;
  },
  /**
   * Find a value in the array and remove it.
   * @param  {Mixed} val  value to remove
   * @return {Array}      this
   * Note: This only works with primitive typed elements, which can be found
   *       with Array#indexOf().
   */
  remove: function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
      // Shift copy elements instead of Array#splice() for better performance.
      // http://jsperf.com/fast-array-splice/18
      while (++index < this.length)
        this[index - 1] = this[index];
      this.pop();
    }
    return this;
  },
  /**
   * Rotate this array (n->0, n+1->1, ...)
   * @param  {int} n   the offset
   * @return {Array}   this
   */
  rotate: function(n) {
    if (n < 0)
      n = n % this.length + this.length;
    n %= this.length;
    var middle = n;
    var next = n;
    var first = 0;
    while (first < this.length) {
      var t = this[first];
      this[first] = this[next];
      this[next] = t;
      first++;
      next++;
      if (next == this.length) next = middle;
      else if (first == middle) middle = next;
    }
    return this;
  },

  /**
   * get last element in this array
   * Note: It's not a reference when returning a non-object!
   * @return {Mixed} last element
   */
  get back() {
    return this[this.length - 1];
  },
  /**
   * get first element in this array
   * Note: It's not a reference when returning a non-object!
   * @return {Mixed} first element
   */
  get front() {
    return this[0];
  },

  /**
   * Flattern a array with sub arrays.
   * @param  {bool} deep if continue to flatten sub arrays
   * @return {Array}     flattened array.
   */
  flatten: function(deep) {
    var res = [];
    if (!deep)
      return res.concat.apply(res, this);
    for (var i = 0; i < this.length; i++)
      if (Array.isArray(this[i]))
        res.push.apply(res, this[i].flatten(true));
      else
        res.push(this[i]);
    return res;
  },
  /**
   * Return unique elements in the array
   * @return {Array}
   */
  unique: function() {
    var res = [];
    var dict = {};
    for (var i = 0; i < this.length; ++i) {
      var key = this[i].toString();
      if (dict.hasOwnProperty(key))
        continue;
      dict[key] = true;
      res.push(this[i]);
    }
    return res;
  },
  /**
   * shuffle elements in the array in-place
   * @return {Array}
   */
  shuffle: function() {
    for (var n = this.length; n > 0; n--) {
      var idx = Math.floor(n * Math.random());
      if (idx != n - 1) {
        var tmp = this[idx];
        this[idx] = this[n - 1];
        this[n - 1] = tmp;
      }
    }
    return this;
  }
});

/**
 * Forward declaring prototype functions to Array's static
 * methods.
 */
if (Array.map === undefined)
  ['forEach', 'every', 'some', 'filter', 'map', 'reduce', 'reduceRight', 'slice']
    .forEach(function(method) {
      var fn = Array.prototype[method];
      Object.defineProperty(Array, method, {
        value: function(a, b, c) {
          return fn.call(a, b, c);
        }
      });
    });

if (String.trim === undefined)
  ['trim', 'trimLeft', 'trimRight']
    .forEach(function(method) {
      var fn = String.prototype[method];
      Object.defineProperty(String, method, {
        value: function(a) {
          return fn.call(a);
        }
      });
    });

$define(Object, {
  /**
   * Determine if an object is empty
   * @param  {Object} obj  object to test
   * @return {bool}        object is empty
   */
  isEmpty: function(obj) {
    if (!obj)
      return true;
    for (var key in obj)
      return false;
    return true;
  },
  /**
   * Get values of an object, like Object.keys().
   * @param  {Object} obj  object to extract
   * @return {Array}       values in the object
   */
  values: function(obj) {
    return Object.keys(obj).map(function(k) {
      return obj[k];
    });
  },
  /**
   * Vague but fast isObject test
   * Note: new String(), function, array, etc will return true
   * @param  {Mixed} obj  object to test
   * @return {bool}       true if obj is an object and not null
   */
  isObject: function(obj) {
    /**
     * Known fastest way to test, the order of the test
     * following: http://jsperf.com/typeof-vs-bool.
     */
    return obj && typeof obj === 'object';
  },
  /**
   * Strict isObject test, only pure Object will return true
   * Note: only {} will return true
   * @param  {Mixed} obj  object to test
   * @return {bool}       true if obj is strictly an object
   */
  isObjectStrict: function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

});

$define(Function, {
  /**
   * Test if an object is a function
   * @param  {Mixed} obj  object to test
   * @return {bool}       true if so
   */
  isFunction: function(obj) {
    return typeof obj === 'function';
  }
});

$define(Date, {
  /**
   * Cast a value to Date
   * @param  {Mixed} obj  object to cast
   * @return {Date}       casted value
   */
  cast: function(obj) {
    if (obj instanceof Date)
      return obj;
    if (typeof obj === 'string')
      obj = Date.parse(obj);
    if (typeof obj === 'number') {
      if (isNaN(obj))
        return null;
      obj = new Date(obj);
      if (isNaN(obj.valueOf()))
        return null;
      return obj;
    }
    return null;
  },
  /**
   * Determine if an object is a Date
   * @param  {Object}     object to test
   * @return {bool}       true iif it's a date.
   */
  isDate: function(obj) {
    obj = Date.cast(obj);
    if (obj)
      return obj >= 0 && obj < 2147483647000;
    return false;
  }
});

$define(Boolean, {
  /**
   * Cast a value to bool
   * @param  {Object} obj  object to cast
   * @return {bool}        casted value
   */
  cast: function(obj) {
    if (obj === true || obj === false)
      return obj;
    if (typeof obj === 'string')
      return (/^(true|yes|ok|y|on)$/i).test(obj);
    return Boolean(obj);
  }
});

$define(RegExp, {
  /**
   * Escape a string to work within a regular expression
   * @param  {string} str string to escape
   * @return {strign}     escaped string
   */
  escape: function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
});













if (!Function.prototype.bind) {
  (function(slice) {
    Function.prototype.bind = function(self) {
      var fn = this;
      var args = slice.call(arguments, 1);
      return function() {
        return fn.apply(self, args.concat(slice.call(arguments)));
      };
    };
  })(Array.prototype.slice);
}









function $I(id) {
  return document.getElementById(id);
}

function $TA(tag, ele) {
  return (ele || document).getElementsByTagName(tag);
}

function $T(tag, ele) {
  var els = $TA(tag, ele);
  return els.length > 0 ? els[0] : null;
}

function $SA(sel, ele) {
  return (ele || document).querySelectorAll(sel);
}

function $S(sel, ele) {
  return (ele || document).querySelector(sel);
}

function $CA(name, ele) {
  return (ele || document).getElementsByClassName(name);
}

function $C(name, ele) {
  var els = $CA(name, ele);
  return els.length > 0 ? els[0] : null;
}

var pElementCache = {};

function $E(name, att) {
  if (!pElementCache[name])
    pElementCache[name] = document.createElement(name);
  var el = pElementCache[name].cloneNode(false);
  for (var i = 1; i < arguments.length; i++)
    if (arguments[i] instanceof HTMLElement)
      el.appendChild(arguments[i]);
    else if (typeof arguments[i] === 'string')
      el.appendChild(document.createTextNode(arguments[i]));
    else for (var key in arguments[i])
      if (key !== 'class') el.setAttribute(key, arguments[i][key]);
      else el.className = arguments[i][key];
  return el;
}

$define(Node.prototype, {
  $ancestorOf: function(node, noself) {
    for (node = noself ? node.parentNode : node;
        node;
        node = node.parentNode)
      if (this === node) return true;
    return false;
  },
  $findAncestorOfTagName: function(tagname, noself, blocker) {
    blocker = blocker || document;
    for (var node = noself ? this.parentNode : this;
        node;
        node = node.parentNode) {
      if (node.tagName === tagname)
        return node;
      if (node == blocker)
        return null;
    }
    return null;
  },
  $findAncestorWithAttribute: function(attr, noself, blocker) {
    blocker = blocker || document;
    for (var node = noself ? this.parentNode : this;
        node && node != document;
        node = node.parentNode) {
      if (node.hasAttribute(attr))
        return node;
      if (node == blocker)
        return null;
    }
    return null;
  },
  $findTypedAncestor: function(noself, blocker) {
    return this.$findAncestorWithAttribute('data-type', noself, blocker);
  },
  $extract: function() {
    return this.parentNode.removeChild(this);
  },
  $replaceWith: function(node) {
    return this.parentNode.replaceChild(node, this);
  },
  $clearContent: function() {
    while (this.firstChild)
      this.removeChild(this.firstChild);
    return this;
  },
  $setFirstTextNodeValue: function(value) {
    for (var node = this.firstChild; node; node = node.nextSibling)
      if (node.nodeType === 3) {
        node.nodeValue = value;
        return this;
      }
    this.appendChild(document.createTextNode(value));
    return this;
  }
});

function hideClassAfterDuration(el, cls, duration) {
  var timers = el.$getData('apolloTimers', true) || {};
  if (timers[cls])
    clearTimeout(timers[cls]);
  timers[cls] = setTimeout(function() {
    el.$removeClass(cls);
  }, duration);
  el.$setData('apolloTimers', timers, true);
}

// for shitting IE9.
$define(Element.prototype, document.documentElement.classList ? {
  $addClass: function(cls, duration) {
    this.classList.add(cls);
    if (duration)
      hideClassAfterDuration(this, cls, duration);
    return this;
  },
  $removeClass: function(cls) {
    this.classList.remove(cls);
    return this;
  },
  $hasClass: function(cls) {
    return this.classList.contains(cls);
  },
  $toggleClass: function(cls) {
    this.classList.toggle(cls);
    return this;
  }
} : {
  $addClass: function(cls, duration) {
    if (!this.$hasClass(cls))
      this.className += ' ' + cls;
    if (duration)
      hideClassAfterDuration(this, cls, duration);
    return this;
  },
  $removeClass: function(cls) {
    this.className = this.className.replace(new RegExp('\\s*\\b' + cls + '\\b', 'g'), '');
    return this;
  },
  $hasClass: function(cls) {
    return (new RegExp('\\b' + cls + '\\b')).test(this.className);
  },
  $toggleClass: function(cls) {
    if (this.$hasClass(cls))
      this.$removeClass(cls);
    else
      this.$addClass(cls);
    return this;
  }
});

$define(Element.prototype, {
  $setClass: function(cls, set, duration) {
    return set ?
      this.$addClass(cls, duration) :
      this.$removeClass(cls);
  },
  $hide: function() {
    return this.$addClass('HIDE');
  },
  $show: function() {
    return this.$removeClass('HIDE');
  },
  $getVisibility: function() {
    return !this.$hasClass('HIDE');
  },
  $setVisibility: function(visible) {
    return this.$setClass('HIDE', !visible);
  },
  $getSize: function() {
    return {
      w: this.offsetWidth,
      h: this.offsetHeight
    };
  },
  $getOffsetPos: function(blocker) {
    var x = 0, y = 0;
    for (var node = this; node.offsetParent && node !== blocker;
        node = node.offsetParent) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    return {
      x: x,
      y: y
    };
  },
  $getOffsetLeft: function(blocker) {
    var x = 0;
    for (var node = this; node.offsetParent && node !== blocker;
        node = node.offsetParent)
      x += node.offsetLeft;
    return x;
  },
  $getOffsetTop: function(blocker) {
    var y = 0;
    for (var node = this; node.offsetParent && node !== blocker;
        node = node.offsetParent)
      y += node.offsetTop;
    return y;
  },
  $getScreenPos: function() {
    var pos = this.getPos();
    pos.x -= $DE.scrollLeft;
    pos.y -= $DE.scrollTop;
    return pos;
  },
  $setPos: function(pos) {
    if ('x' in pos) this.style.left = pos.x + 'px';
    if ('y' in pos) this.style.top = pos.y + 'px';
    return this;
  },
  $setSize: function(size) {
    if ('w' in size) this.style.width = size.w + 'px';
    if ('h' in size) this.style.height = size.h + 'px';
    return this;
  },
  $measure: function() {
    if (!this.parentNode)
      document.body.appendChild(this);
    return this.$addClass('MEASURING').$getSize();
  },
  $unmeasure: function() {
    var node = this;
    setTimeout(function() {
      node.$removeClass('MEASURING');
    }, 0);
    return this;
  },
  $setAttr: function(name, value, json) {
    if (json)
      value = JSON.stringify(value);
    this.setAttribute(name, value);
    return this;
  },
  $getAttr: function(name, json) {
    var value = this.getAttribute(name);
    if (json)
      return JSON.parse(value);
    return value;
  },
  $removeAttr: function(name) {
    this.removeAttribute(name);
    return this;
  },
  $setTextValue: function(value) {
    if (this.firstChild && this.firstChild.nodeType === 3) {
      this.firstChild.nodeValue = value;
      return this;
    }
    this.appendChild(document.createTextNode(value));
    return this;
  },
  $disableScrollPropagation: function() {
    if (document.body.onmousewheel !== undefined)
      this.addEventListener('mousewheel', disableScrollPropagation, false);
    else
      this.addEventListener('wheel', disableScrollPropagation, false);
    return this;
  },
  $enableScrollPropagation: function() {
    if (document.body.onmousewheel !== undefined)
      this.removeEventListener('mousewheel', disableScrollPropagation, false);
    else
      this.removeEventListener('wheel', disableScrollPropagation, false);
    return this;
  }
});

function disableScrollPropagation(evt) {
  // console.log(evt.wheelDeltaY);
  // debugger;
  // console.log(Object.keys(evt));
  var deltaY = evt.wheelDeltaY || -evt.deltaY || evt.wheelDelta;
  if (deltaY > 0) {
    if (this.scrollTop <= 0)
      evt.preventDefault();
  } else if (this.scrollTop + this.clientHeight >= this.scrollHeight) {
    evt.preventDefault();
  }
}

function toDatasetName(name) {
  return 'data-' + name.replace(/[A-Z]/g, function(cap) {
    return '-' + cap.toLowerCase();
  });
}

$define(Element.prototype, document.documentElement.dataset ? {
  $setData: function(name, value, json) {
    if (json)
      value = JSON.stringify(value);
    this.dataset[name] = value;
    return this;
  },
  $getData: function(name, json) {
    var value = this.dataset[name];
    if (value && json)
      return JSON.parse(value);
    return value;
  },
  $removeData: function(name) {
    delete this.dataset[name];
    return this;
  }
} : {
  $setData: function(name, value, json) {
    if (json)
      value = JSON.stringify(value);
    this.setAttribute(toDatasetName(name), value);
    return this;
  },
  $getData: function(name, json) {
    var value = this.getAttribute(toDatasetName(name)) || undefined;
    if (value && json)
      return JSON.parse(value);
    return value;
  },
  $removeData: function(name) {
    this.removeAttribute(toDatasetName(name));
    return this;
  }
});



/**
 * Request a web resource
 * @param {string}   method                  method of the request
 * @param {string}   url                     url of the request
 * @param {Object}   headers                 headers for the request
 * @param {Object}   payload                 payload of the request
 * @param {mixed}    resDataType             wrap the response with
 *                                           the given function's prototype
 *                                           if a function was given;
 *                                           merge the response to
 *                                           return a JSON object if JSON
 *                                           was given;
 *                                           the given object if a object
 *                                           was given;
 *                                           return responseText if null
 *                                           was given.
 * @param {Function} callback(err, res, xhr) callback function
 * @param {Function} progress(evt)           progress callback
 */
function Request(method, url, headers, payload, resDataType, callback, progress) {

  var xhr = new XMLHttpRequest();
  if (xhr.onload === undefined) {
    // we are fucking with IE8!
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4)
        xhr.onload();
      else if (xhr.readyState === 0)
        xhr.onerror();
    };
  }
  xhr.onload = function() {
    var res;
    if (xhr.status >= 200 && xhr.status <= 207) {
      if (resDataType) {
        try {
          res = JSON.parse(xhr.responseText);
        } catch(e) {
          return callback(e, null, xhr);
        }
        if (resDataType === JSON)
            return callback(null, res, xhr);
        if (Function.isFunction(resDataType))
          return callback(null, $wrap(res, resDataType), xhr);
        return callback(null, $extend(resDataType, res), xhr);
      }
      return callback(null, xhr.responseText, xhr);
    }
    callback(xhr.status, null, xhr);
  };
  xhr.onerror = function(evt) {
    callback(new Error($format('request error %d', xhr.status)), null, xhr);
  };
  if (progress) {
    if (typeof XMLHttpRequestProgressEvent !== 'undefined') {
      xhr.onprogress = progress;
    } else {
      console.log(progress);
    }
  }
  method = method.toUpperCase();
  if (method != 'GET' && method != 'POST') {
    xhr.open('POST', url, true);
    xhr.setRequestHeader('x-http-method-override', method);
  } else {
    xhr.open(method, url, true);
  }
  if (resDataType)
    xhr.setRequestHeader('Accept', 'application/json');

  if (headers)
    for (var key in headers)
      xhr.setRequestHeader(key, headers.value);

  if (method == 'POST' || method == 'PUT') {
    if (Object.isObject(payload)) {
      payload = JSON.stringify(payload);
      xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.send(payload);
  } else {
    xhr.send(null);
  }
  // Return Xhr object, so one may call to abort to the request
  return xhr;
}
['get', 'post', 'put', 'delete', 'head'].forEach(function(method) {
  Request[method] = Request.bind(Request, method.toUpperCase());
});

function Tmpl(node, targets, singleton) {
  this.node = node;
  this.begins = [];
  this.targets = [];
  this.fields = [];
  this.mapping = [];
  this.singleton = singleton;
  for (var i = 0; i < targets.length; i++) {
    var tmp = targets[i] instanceof Array ? targets[i] : [targets[i]];
    this.begins.push(this.targets.length);
    for (var j = 0; j < tmp.length; j++) {
      var field = this.parse(node, tmp[j]);
      if (field) {
        this.targets.push(tmp[j]);
        this.fields.push(field);
        this.mapping.push(i);
      }
    }
  }
  this.begins.push(this.targets.length);
  if (!singleton)
    node.$extract();
}
$declare(Tmpl, {
  generate: function() {
    var data = arguments;
    if (Array.isArray(data[0]))
      data = data[0];
    // if (data) for (var i = 0, l = Math.min(this.fields.length, this.begins[Math.min(this.begins.length-1, data.length)]); i < l; i++)
      // this.fields[i].nodeValue = data[this.mapping[i]];
    for (var i = 0; i < this.fields.length; i++)
      this.fields[i].nodeValue = $default(data[this.mapping[i]], '');
    if (!this.singleton)
      return this.node.cloneNode(true);
    return this.node;
  },
  // apply: function(node, data) {
  //   // for (var i = 0, l = Math.min(this.fields.length, this.begins[Math.min(this.begins.length-1, data.length)]); i < l; i++)
  //     // this.parse(node, this.targets[i]).nodeValue = data[this.mapping[i]];
  //   for (var i = 0; i < this.fields.length; i++)
  //     this.parse(node, this.targets[i]).nodeValue = $default(data[this.mapping[i]], '');
  //   return node;
  // },
  // applySingle: function(node, index, datum) {
  //   for (var i = this.begins[index]; i < this.begins[index+1]; i++)
  //     this.parse(node, this.targets[i]).nodeValue = datum;
  //   return node;
  // },
  // getNode: function(node, index) {
  //   return this.parse(node, this.targets[this.begins[index]]);
  // },
  // getElement: function(node, index) {
  //   var selector = this.targets[this.begins[index]].split('@');
  //   return selector[0] === '.' ? node : $S(selector[0], node);
  // },
  parse: function(that, selector) {
    selector = selector.split('@');
    var node = selector[0] === '.' ? that : $S(selector[0], that);
    if (selector[1]) {
      var attr = node.getAttributeNode(selector[1]);
      if (!attr) {
        attr = document.createAttribute(selector[1]);
        node.setAttributeNode(attr);
      }
      node = attr;
    }
    if (node instanceof HTMLElement && node.nodeType !== 2 && node.nodeType !== 3)
      node = node.firstChild && node.firstChild.nodeType === 3 ?
        node.firstChild : node.appendChild(document.createTextNode(''));
    return node;
  }
});

$define(CSSStyleSheet.prototype, {
  clear: function() {
    this.disabled = true;
    var rules = this.cssRules || this.rules;
    while (rules.length > 0)
      this.removeRule(0);
    this.disabled = false;
  },
  setRules: function(rules) {
    this.disabled = true;
    for (var i = 0; i < rules.length; i++)
      this.appendRule(rules[i]);
    this.disabled = false;
  },
  appendRule: function(selector, style) {
    var rules = this.cssRules || this.rules;
    var idx = rules.length;
    if (this.insertRule)
      this.insertRule(selector + '{}', idx);
    else
      this.addRule(selector, ';');
    var rule = rules[idx];
    // console.log(rule);
    if (style)
      for (var name in style)
        rule.style[name] = style[name];
    return rule;
  },
  indexOf: function(rule) {
    var rules = this.cssRules || this.rules;
    for (var i = 0; i < rules.length; i++)
      if (rules[i] === rule)
        return i;
    return -1;
  },
  removeRule: function(idx) {
    this.deleteRule(idx);
  }
}, true);

/**
 * Create a event throttle for time critical events
 *   eg. Resize, MouseMove, KeyDown etc.
 * @param {number}   rate               Sample Rate in Hz
 * @param {number}   minRate            Minimal sample rate in Hz
 * @param {number}   finalDelay         Delaying some time after all events were
 *                                      emitted.
 * @param {Function} slowHandler        will be called in rate or minRate if
 *                                      event continuing emitted
 * @param {Function} fastHandler(event) will be called after each event emitted
 * Note: if minRate < 1, slowHandler won't be called until finalDelay.
 *   And slowHandler won't be called with event object,
 *   please store it yourself in fastHandler. And slowHandler will
 *   always be called after all event fired.
 */
function EventThrottle(rate, minRate, finalDelay, slowHandler, fastHandler) {

  var defaultKeeper = {};
  var handler;

  if (rate < 0) {
    // This is a automatic throttle, which uses requestAnimationFrame
    handler = function(evt) {
      var timerKeeper = this !== window && this || defaultKeeper;
      if (!timerKeeper.pEventThrottleAnimationFrame) {
        timerKeeper.pEventThrottleAnimationFrame = true;
        requestAnimationFrame(slowHandlerWrapperForAnimationFrame.bind(this, timerKeeper));
      }
      if (handler.fastHandler)
        return handler.fastHandler.call(this, evt);
    };
  } else {
    handler = function(evt) {
      var timerKeeper = this !== window && this || defaultKeeper;
      if (rate > 0) {
        clearTimeout(timerKeeper.pEventThrottleDelay);
        timerKeeper.pEventThrottleDelay = setTimeout(slowHandlerWrapper.bind(this, timerKeeper), 1000 / rate);
      }
      if (finalDelay > 0) {
        clearTimeout(timerKeeper.pEventThrottleFinalDelay);
        timerKeeper.pEventThrottleFinalDelay = setTimeout(slowHandlerWrapper.bind(this, timerKeeper), finalDelay);
      }
      if (minRate > 0 && timerKeeper.pEventThrottleMaxDelay === undefined)
        timerKeeper.pEventThrottleMaxDelay = setTimeout(slowHandlerWrapper.bind(this, timerKeeper), 1000 / minRate);
      if (handler.fastHandler)
        return handler.fastHandler.call(this, evt);
    };
  }

  handler.slowHandler = slowHandler;
  handler.fastHandler = fastHandler;

  return handler;

  function slowHandlerWrapper(timerKeeper) {
    clearTimeout(timerKeeper.pEventThrottleMaxDelay);
    delete timerKeeper.pEventThrottleMaxDelay;
    handler.slowHandler.call(this);
  }

  function slowHandlerWrapperForAnimationFrame(timerKeeper) {
    delete timerKeeper.pEventThrottleAnimationFrame;
    handler.slowHandler.call(this);
  }

}

/**
 * Create a callback buffer, that will buffer the callback until
 *   a certain amount of time.
 * @param {Function} callback      original callback function
 * @param {int}      time          minimal time needed before callback
 * @param {bool}     noErrShortcut no shortcut to callback if err occurs
 * @return {Function}              a wrapped callback function
 */
function CallbackBuffer(callback, time, noErrShortcut) {
  if (!time)
    return callback;
  var startTime = Date.now();
  return function(err) {
    if (err && !noErrShortcut)
      return callback.apply(this, arguments);
    var waitTime = startTime + time - Date.now();
    if (waitTime <= 0)
      return callback.apply(this, arguments);
    var self = this, args = arguments;
    setTimeout(function() {
      callback.apply(self, args);
    }, waitTime);
  };
}

/**
 * Create a wrapper for a callback function which takes no parameters,
 *   and this wrapper will make sure the function will be called only
 *   once. All the following caller will be cached in a queue and get
 *   called after the original callback being called. If the original
 *   callback is already called, the callers will be called immediately.
 * @param {Function} fn       function
 * @param {bool}     reusable true if it's reusable.
 */
function CallOnce(fn, reusable) {
  var loaded = false, loading = false;
  var queue = [];
  var args;
  return function(callback) {
    if (loaded)
      return callback.apply(null, args);
    if (callback)
      queue.push(callback);
    if (loading)
      return;
    loading = true;
    fn.call(this, function() {
      args = arguments;
      loading = false;
      loaded = !reusable;
      for (var i = 0; i < queue.length; i++)
        queue[i].apply(null, args);
      queue.length = 0;
    });
  };
}

/**
 * Create a wrapper for a callback function, which will guarantee no error
 *   argument will be passed to it.
 * @param {Function} fn function being wrapped
 */
function StripError(fn) {
  return function(err) {
    err = null;
    fn.apply(this, arguments);
  };
}

$define(window, {
  $I: $I,
  $TA: $TA,
  $T: $T,
  $SA: $SA,
  $S: $S,
  $CA: $CA,
  $C: $C,
  $E: $E,
  Request: Request,
  Tmpl: Tmpl,
  EventThrottle: EventThrottle,
  CallbackBuffer: CallbackBuffer,
  CallOnce: CallOnce,
  StripError: StripError
});

if (!window.requestAnimationFrame)
  $define(window, {
    requestAnimationFrame: window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame || function(callback) {
        return setTimeout(callback, 25);
      },
    cancelAnimationFrame: window.mozCancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.msCancelAnimationFrame || clearTimeout
    });

(function() {

var kTextInputTypes = {
  'text': true,
  'email': true,
  'password': true,
  'url': true,
  'tel': true,
  'search': true
};

var kNumericInputTypes = {
  'number': true,
  'range': true
};

$define(HTMLFormElement.prototype, {
  $getControls: function() {
    var controls = {};
    Array.forEach(
        $SA('input, select, textarea, button', this),
        function(el) {
          if (!el.name)
            return;
          if (!controls[el.name])
            controls[el.name] = el;
        });
    return controls;
  },
  $autoFocus: function(controls) {
    controls = controls || this.$getControls();
    for (var name in controls) {
      var control = controls[name];
      if (control.hasAttribute('autofocus'))
        control.focus();
    }
    return this;
  },
  /**
   * Make none pre-set disabled controls disabled or editable.
   * @param {bool} disabled disabled if true, editable otherwise
   */
  $setDisabled: function(disabled, controls) {
    controls = controls || this.$getControls();
    for (var name in controls) {
      var control = controls[name];
      if (control.hasAttribute('orgdisabled'))
        continue;
      if (disabled && control.hasAttribute('disabled'))
        control.setAttribute('orgdisabled', true);
      control.disabled = disabled;
    }
    return this;
  },
  $disable: function(controls) {
    return this.$setDisabled(true, controls);
  },
  $enable: function(controls) {
    return this.$setDisabled(false, controls);
  },
  $getFirstInvalidControl: function(controls, values) {
    controls = controls || this.$getControls();
    values = values || this.$getValues(controls);
    for (var name in values) {
      var control = controls[name];
      var value = values[name];
      var type = getType(control);
      var validator = getValidator(control.$getData('validator') || type, this.getAttribute('name'));
      // console.log(name, value, validator);
      if (control.hasAttribute('required') && !value ||
          value && (
            kTextInputTypes[type] && !validateTextControl(control) ||
            kNumericInputTypes[type] && !validateNumericControl(control) ||
            validator && !validator(control, value, values)
          ))
        return controls[name];
    }
    return null;
  },
  $getValues: function(controls) {
    controls = controls || this.$getControls();
    var res = {};
    for (var name in controls)
      res[name] = controls[name].$getValue();
    return res;
  },
  $setValues: function(values, controls) {
    controls = controls || this.$getControls();
    for (var name in controls)
      controls[name].$setValue(values[name]);
    return this;
  }
});

var pFieldValidators = {};

$define(HTMLFormElement, {
  $registerValidator: function(name, validator, formName) {
    formName = formName || '*';
    if (!pFieldValidators[formName])
      pFieldValidators[formName] = {};
    pFieldValidators[formName][name] = validator;
  },
  $registerValidators: function(validators, formName) {
    for (var name in validators)
      HTMLFormElement.$registerValidator(name, validators[name], formName);
  }
});

function getValidator(name, formName) {
  if (!name)
    return null;
  if (pFieldValidators[formName] &&
      pFieldValidators[formName][name])
    return pFieldValidators[formName][name];
  return pFieldValidators['*'][name];
}

function getType(control) {
  var type = control.type;
  if (!type) {
    if (control instanceof HTMLTextAreaElement ||
        control instanceof HTMLInputElement)
      type = 'text';
    else if (control instanceof HTMLSelectElement)
      type = 'select';
    else
      type = 'button';
  }
  return type;
}

function validateTextControl(control) {
  var value = control.value;
  var minLength = parseInt(control.$getAttr('minlength'), 10);
  if (minLength && value.length < minLength)
    return false;
  var maxLength = parseInt(control.$getAttr('maxlength'), 10);
  if (maxLength && value.length > maxLength)
    return false;
  var pattern = control.$getAttr('pattern');
  if (pattern)
    pattern = new RegExp('^' + pattern + '$');
  if (pattern && !pattern.test(value))
    return false;
  return true;
}

function validateNumericControl(control) {
  var value = pasreFloat(control.value.trim());
  if (isNaN(value))
    return false;
  var min = parseFloat(control.$getAttr('min'));
  if (isNaN(min) && value < min)
    return false;
  var max = parseFloat(control.$getAttr('max'));
  if (isNaN(max) && value > max)
    return false;
  return true;
}

var kControlProto = {
  $setDisabled: function(disabled) {
    this.disabled = disabled;
    return this;
  },
  $disable: function() {
    this.disabled = true;
    return this;
  },
  $enable: function() {
    this.disabled = false;
    return this;
  },
  $isDisabled: function() {
    return this.disabled;
  },
  $setValue: function(value) {
    this.value = $default(value, '');
    return this;
  },
  $getValue: function() {
    return this.value;
  }
};

var kButtonControlProto = $extend({
  $setValue: function(value) {
    this.value = $default(value, '');
    var elLabel = $C('Label', this);
    if (elLabel) {
      if (value)
        elLabel.$setData('value', value);
      else
        elLabel.$removeData('value');
    }
    return this;
  }
}, kControlProto);

var kInputControlProto = $extend({
  $setValue: function(value) {
    var type = getType(this);
    if (type == 'checkbox' || type == 'radio') {
      if (!Array.isArray(value))
        value = [value];
      var form = this.$findAncestorOfTagName('FORM');
      var inputs = $TA('input', form);
      // console.log(inputs);
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].name == this.name) {
          // Hooray, got a company;
          inputs[i].checked = value.indexOf(inputs[i].value) > -1;
        }
      }
    } else {
      this.value = $default(value, '');
    }
  },
  $getValue: function() {
    var type = getType(this);
    if (type == 'checkbox' || type == 'radio') {
      var value = [];
      var form = this.$findAncestorOfTagName('FORM');
      var inputs = $TA('input', form);
      var count = 0;
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].name == this.name) {
          count++;
          if (inputs[i].checked)
            value.push(inputs[i].value);
        }
      }
      if (count == 1 || type == 'checkbox')
        return value[0] || null;
      return value;
    }
    return this.value;
  }
}, kControlProto);

$define(HTMLButtonElement.prototype, kButtonControlProto);
$define(HTMLInputElement.prototype, kInputControlProto);
$define(HTMLSelectElement.prototype, kControlProto);
$define(HTMLTextAreaElement.prototype, kControlProto);

HTMLFormElement.$registerValidators({
  email: function(control, value) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  }
});

})();


})();

