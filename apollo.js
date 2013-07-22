var util = require('util');
var url = require('url');
var ObjectID = require('mongodb').ObjectID;
var crypto = require('crypto');
/**
 * Extend an object with another object
 * @param  {Object} obj      object to be extended
 * @param  {Object} ext      extension object
 * @param  {bool} override   Overwrite existing properties in obj
 * @param  {bool} deep       Doing an deep extend (perform extend on every object property)
 * @return {Object}          reference to obj
 */
function $extend(obj, ext, override) {
  if (override)
    for (var key in ext)
      obj[key] = ext[key];
  else
    for (var key in ext)
      if (!(key in obj))
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
 * @return {Object}           reference to object
 */
function $define(object, prototype) {
  var setterGetterPattern = /^(set|get)([A-Z])(.*)/;
  var setterGetters = {};
  for (var key in prototype) {
    var matches = setterGetterPattern.exec(key);
    var fn = prototype[key];
    Object.defineProperty(object, key, {
      value: fn,
      writable: true
    });
    if (matches) {
      if (matches[1] === 'set') {
        if (fn.length !== 1)
          continue;
      } else {
        if (fn.length !== 0)
          continue;
      }
      var name = matches[2].toLowerCase() + matches[3];
      if (!setterGetters.hasOwnProperty(name))
        setterGetters[name] = {};
      setterGetters[name][matches[1]] = fn;
    }
  }
  Object.defineProperties(object, setterGetters);
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
function $inherit(fn, parent, prototype) {
  fn.prototype = {
    constructor: fn,
    __proto__: parent.prototype
  };
  if (prototype) $define(fn.prototype, prototype);
  return fn;
}

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
 * Making an Error instance with given format and parameters.
 * Note: this is a helper function works like util.format(),
 *   apart from it returns an Error object instead of string.
 * @return {Error} generated Error instance
 */
function $error() {
  return new Error(util.format.apply(util, arguments));
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
 * Generates a shallow copy of an Object.
 * @param  {Object} org source object
 * @return {Object}     cloned object
 */
function $clone(org) {
  var obj = {};
  for (var key in org) {
    obj[key] = org[key];
  }
  return obj;
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

function $bind(org, $this) {
  var obj = {};
  for (var key in org)
    obj[key] = org[key].bind($this);
  return obj;
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
function $wrap(obj, Type) {
  obj.__proto__ = Type.prototype;
  if (Type.__wrap)
    Type.__wrap(obj);
  return obj;
}

/**
 * Removing prototype chain from a given object.
 * @param  {Object} object   object to be stripped
 * @return {Object}          object stripped
 */
function $strip(object) {
  object.__proto__ = Object.prototype;
  return object;
}


/**
 * generate a mongo type update document which can
 * update a in-db origin to target.
 * If arguments.length == 0 return an empty update document
 * If arguments.length == 1
 *   If the arg has some update op set, use those updates to
 *   generate a pure update document
 *   Otherwise generate a pure $set update document
 * If argument.length == 2
 *   generate a update document which can update in-db
 *   origin to in-db target
 *
 * Note: will not update _id field in call cases
 * @param  {Document} origin in-db origin
 * @param  {Document} target in-db target
 * @return {UpdateDocument
 */
function $diff(origin, target) {
  const updateOps = [
    "$inc",
    "$rename",
    "$setOnInsert",
    "$set",
    "$unset",
    "$addToSet",
    "$pop",
    "$pullAll",
    "$pull",
    "$pushAll",
    "$push",
    "$bit"];

  var diff = {};
  updateOps.forEach(function(op) { diff[op] = {}; });
  if(arguments.length == 0)
    return diff;
  else if(arguments.length == 1) {
    //if origin is a mongodb update document,
    //extract the op fields
    if(updateOps.some(function(op) { return origin[op] })) {
      updateOps.forEach(function(op) {
        if(origin[op]) diff[op] = origin[op];
      });
    }
    //else generate a update document with $set
    else {
      diff.$set = origin;
      delete diff.$set._id;
    }
  }
  else {
    if(!target || !origin || typeof target !== 'object' || typeof origin !== 'object')
      throw($error('target and origin must be document'));

    Object.keys(target).forEach(function(field) {
      if(field == '_id') return;

      if(target[field] === undefined)
        diff.$unset[field] = 1;
      else {
        var equals = $equals(origin[field], target[field]);
        if(equals === true)
          return;
        else if(equals === false)
          diff.$set[field] = target[field];

        //array case
        else if(equals === 0) {

          origin_hash = {};
          target_hash = {};
          origin[field].forEach(function(elem) {
            origin_hash[JSON.stringify(elem)] = elem;
          })
          target[field].forEach(function(elem) {
            target_hash[JSON.stringify(elem)] = elem;
          })
          
          var pulls = [];
          Object.keys(origin_hash).forEach(function(ohash) {
            if(target_hash[ohash]) return;
            pulls.push(origin_hash[ohash]);
          })
          // console.log(pulls);
          var pushs = []; 
          Object.keys(target_hash).forEach(function(thash) {
            if(origin_hash[thash]) return;
            pushs.push(target_hash[thash]);
          })
          // console.log(pushs);
          if(pulls.length && pushs.length || pulls.length > 1) 
            diff.$set[field] = target[field];
          else if(pulls.length)
            diff.$pull[field] = pulls[0];
          else if(pushs.length == 1)
            diff.$push[field] = pushs[0];
          else if(pushs.length > 1)
            diff.$push[field] = {$each: pushs};

        }
        else if(equals) {
          Object.keys(equals).forEach(function(op) {
            Object.keys(equals[op]).forEach(function(_field) {
              diff[op][field+'.'+_field] = equals[op][_field];
            })
          })
        }
      }
    });
  }
  var notNull = false;
  Object.keys(diff).forEach(function(op) {
    if(Object.keys(diff[op]).length == 0) delete diff[op];
    else notNull = true;
  })
  return notNull? diff: null;
}
/**
 * compare two values equality
 * @param  {Object} a     any type value a
 * @param  {Object} b     any type value b
 * @return {Mix}       true/false/0/object
 *         true; indicates a excatly same case
 *         false; indicates a excatly diff case
 *         0; indicates a mostly diff case (when the object is array)
 *         object; an update document of mongo type
 */
function $equals(a, b) {
  if(typeof b === "function") b = b();
  if(a === b) return true;
  if(a === null) return false;
  if(b === null) return false;
  if(typeof a !== typeof b) return false;
  if(typeof a !== "object") return false;

  var aIsObjectID = a instanceof ObjectID;
  var bIsObjectID = b instanceof ObjectID;
  if(aIsObjectID ^ bIsObjectID) return false;
  else if(aIsObjectID) return a.equals(b);


  var aIsArray = Array.isArray(a);
  var bIsArray = Array.isArray(b);
  if(aIsArray ^ bIsArray) return false;
  else if(aIsArray) return 0;

  var _diff = $diff(a, b);
  if(_diff === null) return true;
  return _diff;
}

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
$define(global, {
  $extend: $extend,
  $define: $define,
  $declare: $declare,
  $inherit: $inherit,
  $defenum: $defenum,
  $error: $error,
  // $prefix: $prefix,
  $clone: $clone,
  // $merge: $merge,
  // $bind: $bind,
  $default: $default,
  // $random: $random,
  $wrap: $wrap,
  $strip: $strip,
  $diff: $diff,
  $equals: $equals,
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
   * @param  {char} ch     padding char
   * @param  {int} length  desired length
   * @return {string}      result
   */
  paddingRight: function(ch, length) {
    if (this.length < length)
      return this + ch.repeat(length - this.length);
    return this;
  }
});

$define(Number.prototype, {
  /**
   * Clamp a this to given range [lb, ub]
   * @param  {number} lb lower bound
   * @param  {number} ub upper bound
   * @return {number}    result
   */
  clamp: function(lb, ub) {
    var rtn = this;
    if (lb !== undefined && rtn < lb)
      rtn = lb;
    if (ub !== undefined && rtn > ub)
      rtn = ub;
    return rtn;
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
      this[index-1] = this[index];
    this.pop();
  },
  /**
   * Rotate this array (0->n, 1->n+1, ...)
   * @param  {int} n   the offset
   * @return {Array}   this
   */
  rotate: function(n) {
    while (n-- > 0)
      this.unshift(this.pop());
    return this;
  },
  /**
   * get last element in this array
   * @return {Mixed} last element
   */
  getBack: function() {
    if (this.length)
      return this[this.length-1];
    return undefined;
  },
  /**
   * get first element in this array
   * @return {Mixed} first element
   */
  getFront: function() {
    return this[0];
  },
  /*
   * @param {int} blocksize
   * @param {function} cb callback
   * @return {array.$ = array}
   */
  partition: function(blocksize, cb) {
    if(typeof blocksize == "function") {
      cb = blocksize;
      blocksize = null;
    }
    blocksize = blocksize ? blocksize : 25;
    var re = [];
    for(var i=0; i<this.length; i+=blocksize)
      re.push(this.slice(i, i+blocksize));
    if(cb) cb(null, re);
    return re;
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
  empty: function(obj) {
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
  }
});
$define(Object.prototype, {
  /**
   * project this with projectiong, same behaviour with mongodb projection
   * @param  {Object} projection  An object mapping fields to values
   * @param  {Boolean} deep       if true, go deep for sub objects
   * @param  {Boolean} keep       if true, keep undefined field of this
   * @return {Object}             projected object
   */
  project: function(projection, deep, keep) {
    if(!projection) return this;
    if(typeof projection != 'object') return this;
    var self = this;
    var res = {};
    Object.keys(projection).forEach(function(key) {
      var proj = projection[key];
      if(proj) {
        var el = self[key];
        if(deep && el !== undefined && typeof el == 'object' && typeof proj == "object")
          res[key] = el.project(projection[key]);
        else {
          if(keep)
            res[key] = el;
          else if(el !== undefined)
            res[key] = el;
        }
      }
    });
    return res;
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
    if (typeof obj === 'nubmer') {
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
      return /^(true|yes|ok|y|on)$/i.test(obj);
    return Boolean(obj);
  }
});

// console.log($equals([1,2,3,4], [1,2,3,4], -1));
// console.log($equals([[1,2,3],2,3,4], [2,[1,2,3],3,4], -1));
// console.log($equals([{x:1,y:[1,2,3]},2,3,4], [2,3,{x:1,y:[1,2,3]},4], -1));
// console.log(JSON.stringify($equals({
//   a:1,
//   b:[2,3,4],
//   c:["3","4","5"],
//   d:[
//     {
//       x:1,
//       y:"123"
//     }
//   ],
//   e:[]
// }, {
//   a:1,
//   b:undefined,
//   c:["4","3"],
//   d:[{
//       y:"123",
//       x:1
//     }, {
//       x:2,
//       y:"123"
//     }
//   ],
//   e:[1,2,3,4]
// }, -1), null, 2));
