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
    if (Object.isObjectStrict(obj[key]))
      _overrideDeepExtend(obj[key], ext[key]);
    else
      obj[key] = ext[key];
}

function _deepExtend(obj, ext) {
  for (var key in ext)
    if (!(key in obj)) {
      if (Object.isObjectStrict(obj[key]))
        _deepExtend(obj[key], ext[key]);
      else
        obj[key] = ext[key];
    }
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
 * Setting prefix for every property in an object.
 * @param  {Object} obj    object to process
 * @param  {string} prefix [description]
 * @return {[type]}        [description]
 */
// function $prefix(obj, prefix, inplace) {
//   var res = {};
//   for (var key in obj)
//     res[prefix + key] = obj[key];
//   return res;
// }

/**
 * Generates a copy of an Object.
 * @param  {Mixed} org  source object
 * @param  {bool} deep  perform a deep clone
 * @return {Mixed}      cloned object
 */

function $clone(obj, deep) {
  var res;
  if (Array.isArray(obj)) {
    res = obj.slice(0);
    if (deep)
      for (var i = 0; i < res.length; i++)
        if (Object.isObject(res[i]))
          res[i] = $clone(res[i], true);
  } else if (Object.isObject(obj)) {
    res = {};
    for (var key in obj)
      res[key] = obj[key];
    if (deep)
      for (var key in obj)
        if (Object.isObject(res[key]))
          res[key] = $clone(res[key], true);
  }
  return res;
}

/**
 * Merge an object to an other object
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
// function $merge(a, b) {
//   return $extend($clone(a), b);
// }

// function $bind(org, $this) {
//   var obj = {};
//   for (var key in org)
//     obj[key] = org[key].bind($this);
//   return obj;
// }

/**
 * Return default value of an undefined variable.
 * @param  {Mixed} val  value
 * @param  {Mixed} def  default value
 * @return {Mixed}
 */

function $default(val, def) {
  return val === undefined ? def : val;
}

// function $random(val) {
//   return Math.floor(Math.random() * val);
// }

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

/**
 * get a sha1 hash from the stringify JSON of obj
 * @param  {Object} obj
 * @return {String}
 */

function $hashObject(obj) {
  var hasher = crypto.createHash('sha1');
  hasher.update(JSON.stringify(obj));
  return hasher.digest('hex');
}

$define(window, {
  $extend: $extend,
  $define: $define,
  $declare: $declare,
  $inherit: $inherit,
  $defenum: $defenum,
  $format: $format,
  $error: $error,
  // $prefix: $prefix,
  $clone: $clone,
  // $merge: $merge,
  // $bind: $bind,
  $default: $default,
  // $random: $random,
  $wrap: $wrap,
  $hashObject: $hashObject
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
   * Tests if this string starts with the given one.
   * @param  {string} str string to test with
   * @return {bool}       result
   */
  startsWith: function(str) {
    if (str === null || str === undefined || str.length === 0)
      return true;
    return this.substr(0, str.length) === str;
  },
  /**
   * Tests if this string ends with the given one.
   * @param  {string} str string to test with
   * @return {bool}       result
   */
  endsWith: function(str) {
    if (str === null || str === undefined || str.length === 0)
      return true;
    return this.substr(-str.length) === str;
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
   */
  remove: function(val) {
    var index = this.indexOf(val);
    if (index < 0)
      return;
    for (index++; index < this.length; index++)
      this[index - 1] = this[index];
    this.pop();
  },
  /**
   * Rotate this array (n->0, n+1->1, ...)
   * @param  {int} n   the offset
   * @return {Array}   this
   */
  rotate: function(n) {
    n = (n + this.length) % this.length;
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
    if (this.length)
      return this[this.length - 1];
    return undefined;
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
  },
  /**
   * project $object with projectiong, same behaviour with mongodb projection
   * @param  {Object} object      target object
   * @param  {Object} projection  An object mapping fields to values
   * @param  {Boolean} deep       if true, go deep for sub objects
   * @param  {Boolean} keep       if true, keep undefined field of this
   * @return {Object}             projected object
   */
  project: function(object, projection, deep, keep) {
    if (!Object.isObject(projection))
      return object;
    var res = {};
    Object.keys(projection).forEach(function(key) {
      var proj = projection[key];
      if (proj) {
        var el = object[key];
        if (deep && el !== undefined && typeof el == 'object' && typeof proj == "object") {
          res[key] = Object.project(el, projection[key], deep, keep);
        } else {
          if (keep)
            res[key] = el;
          else if (el !== undefined)
            res[key] = el;
        }
      }
    });
    return res;
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
   * @param  {bool}  utc  if the obj is in utc
   * @return {Date}       casted value
   */
  cast: function(obj, utc) {
    if (obj instanceof Date)
      return obj;
    if (typeof obj === 'string')
      obj = Date.parse(obj);
    if (typeof obj === 'number') {
      if (isNaN(obj))
        return null;
      if (utc)
        obj -= new Date().getTimezoneOffset() * 60000;
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

})();
