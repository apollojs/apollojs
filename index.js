



// Copyright 2009-2012 by contributors, MIT License
// vim: ts=4 sts=4 sw=4 expandtab

//Add semicolon to prevent IIFE from being passed as argument to concated code.
;
// Module systems magic dance
(function (definition) {
    // RequireJS
    if (typeof define == "function") {
	define(definition);
    // YUI3
    } else if (typeof YUI == "function") {
	YUI.add("es5", definition);
    // CommonJS and <script>
    } else {
	definition();
    }
})(function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// ES-5 15.1.2.2
if (parseInt('08') !== 8) {
    parseInt = (function (origParseInt) {
	var hexRegex = /^0[xX]/;
	return function parseIntES5(str, radix) {
	    str = String(str).trim();
	    if (!+radix) {
		radix = hexRegex.test(str) ? 16 : 10;
	    }
	    return origParseInt(str, radix);
	};
    }(parseInt));
}

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

function Empty() {}

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
	// 1. Let Target be the this value.
	var target = this;
	// 2. If IsCallable(Target) is false, throw a TypeError exception.
	if (typeof target != "function") {
	    throw new TypeError("Function.prototype.bind called on incompatible " + target);
	}
	// 3. Let A be a new (possibly empty) internal list of all of the
	//   argument values provided after thisArg (arg1, arg2 etc), in order.
	// XXX slicedArgs will stand in for "A" if used
	var args = _Array_slice_.call(arguments, 1); // for normal call
	// 4. Let F be a new native ECMAScript object.
	// 11. Set the [[Prototype]] internal property of F to the standard
	//   built-in Function prototype object as specified in 15.3.3.1.
	// 12. Set the [[Call]] internal property of F as described in
	//   15.3.4.5.1.
	// 13. Set the [[Construct]] internal property of F as described in
	//   15.3.4.5.2.
	// 14. Set the [[HasInstance]] internal property of F as described in
	//   15.3.4.5.3.
	var binder = function () {

	    if (this instanceof bound) {
		// 15.3.4.5.2 [[Construct]]
		// When the [[Construct]] internal method of a function object,
		// F that was created using the bind function is called with a
		// list of arguments ExtraArgs, the following steps are taken:
		// 1. Let target be the value of F's [[TargetFunction]]
		//   internal property.
		// 2. If target has no [[Construct]] internal method, a
		//   TypeError exception is thrown.
		// 3. Let boundArgs be the value of F's [[BoundArgs]] internal
		//   property.
		// 4. Let args be a new list containing the same values as the
		//   list boundArgs in the same order followed by the same
		//   values as the list ExtraArgs in the same order.
		// 5. Return the result of calling the [[Construct]] internal
		//   method of target providing args as the arguments.

		var result = target.apply(
		    this,
		    args.concat(_Array_slice_.call(arguments))
		);
		if (Object(result) === result) {
		    return result;
		}
		return this;

	    } else {
		// 15.3.4.5.1 [[Call]]
		// When the [[Call]] internal method of a function object, F,
		// which was created using the bind function is called with a
		// this value and a list of arguments ExtraArgs, the following
		// steps are taken:
		// 1. Let boundArgs be the value of F's [[BoundArgs]] internal
		//   property.
		// 2. Let boundThis be the value of F's [[BoundThis]] internal
		//   property.
		// 3. Let target be the value of F's [[TargetFunction]] internal
		//   property.
		// 4. Let args be a new list containing the same values as the
		//   list boundArgs in the same order followed by the same
		//   values as the list ExtraArgs in the same order.
		// 5. Return the result of calling the [[Call]] internal method
		//   of target providing boundThis as the this value and
		//   providing args as the arguments.

		// equiv: target.call(this, ...boundArgs, ...args)
		return target.apply(
		    that,
		    args.concat(_Array_slice_.call(arguments))
		);

	    }

	};

	// 15. If the [[Class]] internal property of Target is "Function", then
	//     a. Let L be the length property of Target minus the length of A.
	//     b. Set the length own property of F to either 0 or L, whichever is
	//       larger.
	// 16. Else set the length own property of F to 0.

	var boundLength = Math.max(0, target.length - args.length);

	// 17. Set the attributes of the length own property of F to the values
	//   specified in 15.3.5.1.
	var boundArgs = [];
	for (var i = 0; i < boundLength; i++) {
	    boundArgs.push("$" + i);
	}

	// XXX Build a dynamic function with desired amount of arguments is the only
	// way to set the length property of a function.
	// In environments where Content Security Policies enabled (Chrome extensions,
	// for ex.) all use of eval or Function costructor throws an exception.
	// However in all of these environments Function.prototype.bind exists
	// and so this code will never be executed.
	var bound = Function("binder", "return function(" + boundArgs.join(",") + "){return binder.apply(this,arguments)}")(binder);

	if (target.prototype) {
	    Empty.prototype = target.prototype;
	    bound.prototype = new Empty();
	    // Clean up dangling references.
	    Empty.prototype = null;
	}

	// TODO
	// 18. Set the [[Extensible]] internal property of F to true.

	// TODO
	// 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
	// 20. Call the [[DefineOwnProperty]] internal method of F with
	//   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
	//   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
	//   false.
	// 21. Call the [[DefineOwnProperty]] internal method of F with
	//   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
	//   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
	//   and false.

	// TODO
	// NOTE Function objects created using Function.prototype.bind do not
	// have a prototype property or the [[Code]], [[FormalParameters]], and
	// [[Scope]] internal properties.
	// XXX can't delete prototype in pure-js.

	// 22. Return F.
	return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var _Array_slice_ = prototypeOfArray.slice;
// Having a toString local variable name breaks in Opera so use _toString.
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
// Default value for second param
// [bugfix, ielt9, old browsers]
// IE < 9 bug: [1,2].splice(0).join("") == "" but should be "12"
if ([1,2].splice(0).length != 2) {
    var array_splice = Array.prototype.splice;
    var array_push = Array.prototype.push;
    var array_unshift = Array.prototype.unshift;

    if (function() { // test IE < 9 to splice bug - see issue #138
	function makeArray(l) {
	    var a = [];
	    while (l--) {
		a.unshift(l)
	    }
	    return a
	}

	var array = []
	    , lengthBefore
	;

	array.splice.bind(array, 0, 0).apply(null, makeArray(20));
	array.splice.bind(array, 0, 0).apply(null, makeArray(26));

	lengthBefore = array.length; //20
	array.splice(5, 0, "XXX"); // add one element

	if (lengthBefore + 1 == array.length) {
	    return true;// has right splice implementation without bugs
	}
	// else {
	//    IE8 bug
	// }
    }()) {//IE 6/7
	Array.prototype.splice = function(start, deleteCount) {
	    if (!arguments.length) {
		return [];
	    } else {
		return array_splice.apply(this, [
		    start === void 0 ? 0 : start,
		    deleteCount === void 0 ? (this.length - start) : deleteCount
		].concat(_Array_slice_.call(arguments, 2)))
	    }
	};
    }
    else {//IE8
	Array.prototype.splice = function(start, deleteCount) {
	    var result
		, args = _Array_slice_.call(arguments, 2)
		, addElementsCount = args.length
	    ;

	    if (!arguments.length) {
		return [];
	    }

	    if (start === void 0) { // default
		start = 0;
	    }
	    if (deleteCount === void 0) { // default
		deleteCount = this.length - start;
	    }

	    if (addElementsCount > 0) {
		if (deleteCount <= 0) {
		    if (start == this.length) { // tiny optimisation #1
			array_push.apply(this, args);
			return [];
		    }

		    if (start == 0) { // tiny optimisation #2
			array_unshift.apply(this, args);
			return [];
		    }
		}

		// Array.prototype.splice implementation
		result = _Array_slice_.call(this, start, start + deleteCount);// delete part
		args.push.apply(args, _Array_slice_.call(this, start + deleteCount, this.length));// right part
		args.unshift.apply(args, _Array_slice_.call(this, 0, start));// left part

		// delete all items from this array and replace it to 'left part' + _Array_slice_.call(arguments, 2) + 'right part'
		args.unshift(0, this.length);

		array_splice.apply(this, args);

		return result;
	    }

	    return array_splice.call(this, start, deleteCount);
	}

    }
}

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) == undefined but should be "1"
if ([].unshift(0) != 1) {
    var array_unshift = Array.prototype.unshift;
    Array.prototype.unshift = function() {
	array_unshift.apply(this, arguments);
	return this.length;
    };
}

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
	return _toString(obj) == "[object Array]";
    };
}

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object("a"),
    splitString = boxedString[0] != "a" || !(0 in boxedString);
// Check node 0.6.21 bug where third parameter is not boxed
var boxedForEach = true;
if (Array.prototype.forEach) {
    Array.prototype.forEach.call("foo", function(item, i, obj) {
	if (typeof obj !== 'object') boxedForEach = false;
    });
}

if (!Array.prototype.forEach || !boxedForEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		object,
	    thisp = arguments[1],
	    i = -1,
	    length = self.length >>> 0;

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(); // TODO message
	}

	while (++i < length) {
	    if (i in self) {
		// Invoke the callback function with call, passing arguments:
		// context, property value, property key, thisArg object
		// context
		fun.call(thisp, self[i], i, object);
	    }
	}
    };
}

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		object,
	    length = self.length >>> 0,
	    result = Array(length),
	    thisp = arguments[1];

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(fun + " is not a function");
	}

	for (var i = 0; i < length; i++) {
	    if (i in self)
		result[i] = fun.call(thisp, self[i], i, object);
	}
	return result;
    };
}

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		    object,
	    length = self.length >>> 0,
	    result = [],
	    value,
	    thisp = arguments[1];

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(fun + " is not a function");
	}

	for (var i = 0; i < length; i++) {
	    if (i in self) {
		value = self[i];
		if (fun.call(thisp, value, i, object)) {
		    result.push(value);
		}
	    }
	}
	return result;
    };
}

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		object,
	    length = self.length >>> 0,
	    thisp = arguments[1];

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(fun + " is not a function");
	}

	for (var i = 0; i < length; i++) {
	    if (i in self && !fun.call(thisp, self[i], i, object)) {
		return false;
	    }
	}
	return true;
    };
}

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		object,
	    length = self.length >>> 0,
	    thisp = arguments[1];

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(fun + " is not a function");
	}

	for (var i = 0; i < length; i++) {
	    if (i in self && fun.call(thisp, self[i], i, object)) {
		return true;
	    }
	}
	return false;
    };
}

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		object,
	    length = self.length >>> 0;

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(fun + " is not a function");
	}

	// no value to return if no initial value and an empty array
	if (!length && arguments.length == 1) {
	    throw new TypeError("reduce of empty array with no initial value");
	}

	var i = 0;
	var result;
	if (arguments.length >= 2) {
	    result = arguments[1];
	} else {
	    do {
		if (i in self) {
		    result = self[i++];
		    break;
		}

		// if array contains no values, no initial value to return
		if (++i >= length) {
		    throw new TypeError("reduce of empty array with no initial value");
		}
	    } while (true);
	}

	for (; i < length; i++) {
	    if (i in self) {
		result = fun.call(void 0, result, self[i], i, object);
	    }
	}

	return result;
    };
}

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
	var object = toObject(this),
	    self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		object,
	    length = self.length >>> 0;

	// If no callback function or if callback is not a callable function
	if (_toString(fun) != "[object Function]") {
	    throw new TypeError(fun + " is not a function");
	}

	// no value to return if no initial value, empty array
	if (!length && arguments.length == 1) {
	    throw new TypeError("reduceRight of empty array with no initial value");
	}

	var result, i = length - 1;
	if (arguments.length >= 2) {
	    result = arguments[1];
	} else {
	    do {
		if (i in self) {
		    result = self[i--];
		    break;
		}

		// if array contains no values, no initial value to return
		if (--i < 0) {
		    throw new TypeError("reduceRight of empty array with no initial value");
		}
	    } while (true);
	}

	if (i < 0) {
	    return result;
	}

	do {
	    if (i in this) {
		result = fun.call(void 0, result, self[i], i, object);
	    }
	} while (i--);

	return result;
    };
}

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
	var self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		toObject(this),
	    length = self.length >>> 0;

	if (!length) {
	    return -1;
	}

	var i = 0;
	if (arguments.length > 1) {
	    i = toInteger(arguments[1]);
	}

	// handle negative indices
	i = i >= 0 ? i : Math.max(0, length + i);
	for (; i < length; i++) {
	    if (i in self && self[i] === sought) {
		return i;
	    }
	}
	return -1;
    };
}

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1)) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
	var self = splitString && _toString(this) == "[object String]" ?
		this.split("") :
		toObject(this),
	    length = self.length >>> 0;

	if (!length) {
	    return -1;
	}
	var i = length - 1;
	if (arguments.length > 1) {
	    i = Math.min(i, toInteger(arguments[1]));
	}
	// handle negative indices
	i = i >= 0 ? i : length - Math.abs(i);
	for (; i >= 0; i--) {
	    if (i in self && sought === self[i]) {
		return i;
	    }
	}
	return -1;
    };
}

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
	dontEnums = [
	    "toString",
	    "toLocaleString",
	    "valueOf",
	    "hasOwnProperty",
	    "isPrototypeOf",
	    "propertyIsEnumerable",
	    "constructor"
	],
	dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
	hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

	if (
	    (typeof object != "object" && typeof object != "function") ||
	    object === null
	) {
	    throw new TypeError("Object.keys called on a non-object");
	}

	var keys = [];
	for (var name in object) {
	    if (owns(object, name)) {
		keys.push(name);
	    }
	}

	if (hasDontEnumBug) {
	    for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
		var dontEnum = dontEnums[i];
		if (owns(object, dontEnum)) {
		    keys.push(dontEnum);
		}
	    }
	}
	return keys;
    };

}

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000,
    negativeYearString = "-000001";
if (
    !Date.prototype.toISOString ||
    (new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1)
) {
    Date.prototype.toISOString = function toISOString() {
	var result, length, value, year, month;
	if (!isFinite(this)) {
	    throw new RangeError("Date.prototype.toISOString called on non-finite value.");
	}

	year = this.getUTCFullYear();

	month = this.getUTCMonth();
	// see https://github.com/es-shims/es5-shim/issues/111
	year += Math.floor(month / 12);
	month = (month % 12 + 12) % 12;

	// the date time string format is specified in 15.9.1.15.
	result = [month + 1, this.getUTCDate(),
	    this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
	year = (
	    (year < 0 ? "-" : (year > 9999 ? "+" : "")) +
	    ("00000" + Math.abs(year))
	    .slice(0 <= year && year <= 9999 ? -4 : -6)
	);

	length = result.length;
	while (length--) {
	    value = result[length];
	    // pad months, days, hours, minutes, and seconds to have two
	    // digits.
	    if (value < 10) {
		result[length] = "0" + value;
	    }
	}
	// pad milliseconds to have three digits.
	return (
	    year + "-" + result.slice(0, 2).join("-") +
	    "T" + result.slice(2).join(":") + "." +
	    ("000" + this.getUTCMilliseconds()).slice(-3) + "Z"
	);
    };
}


// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = false;
try {
    dateToJSONIsSupported = (
	Date.prototype.toJSON &&
	new Date(NaN).toJSON() === null &&
	new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
	Date.prototype.toJSON.call({ // generic
	    toISOString: function () {
		return true;
	    }
	})
    );
} catch (e) {
}
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
	// When the toJSON method is called with argument key, the following
	// steps are taken:

	// 1.  Let O be the result of calling ToObject, giving it the this
	// value as its argument.
	// 2. Let tv be toPrimitive(O, hint Number).
	var o = Object(this),
	    tv = toPrimitive(o),
	    toISO;
	// 3. If tv is a Number and is not finite, return null.
	if (typeof tv === "number" && !isFinite(tv)) {
	    return null;
	}
	// 4. Let toISO be the result of calling the [[Get]] internal method of
	// O with argument "toISOString".
	toISO = o.toISOString;
	// 5. If IsCallable(toISO) is false, throw a TypeError exception.
	if (typeof toISO != "function") {
	    throw new TypeError("toISOString property is not callable");
	}
	// 6. Return the result of calling the [[Call]] internal method of
	//  toISO with O as the this value and an empty argument list.
	return toISO.call(o);

	// NOTE 1 The argument is ignored.

	// NOTE 2 The toJSON function is intentionally generic; it does not
	// require that its this value be a Date object. Therefore, it can be
	// transferred to other kinds of objects for use as a method. However,
	// it does require that any such object have a toISOString method. An
	// object is free to use the argument key to filter its
	// stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (!Date.parse || "Date.parse is buggy") {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

	// Date.length === 7
	function Date(Y, M, D, h, m, s, ms) {
	    var length = arguments.length;
	    if (this instanceof NativeDate) {
		var date = length == 1 && String(Y) === Y ? // isString(Y)
		    // We explicitly pass it through parse:
		    new NativeDate(Date.parse(Y)) :
		    // We have to manually make calls depending on argument
		    // length here
		    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
		    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
		    length >= 5 ? new NativeDate(Y, M, D, h, m) :
		    length >= 4 ? new NativeDate(Y, M, D, h) :
		    length >= 3 ? new NativeDate(Y, M, D) :
		    length >= 2 ? new NativeDate(Y, M) :
		    length >= 1 ? new NativeDate(Y) :
				  new NativeDate();
		// Prevent mixups with unfixed Date object
		date.constructor = Date;
		return date;
	    }
	    return NativeDate.apply(this, arguments);
	};

	// 15.9.1.15 Date Time String Format.
	var isoDateExpression = new RegExp("^" +
	    "(\\d{4}|[\+\-]\\d{6})" + // four-digit year capture or sign +
				      // 6-digit extended year
	    "(?:-(\\d{2})" + // optional month capture
	    "(?:-(\\d{2})" + // optional day capture
	    "(?:" + // capture hours:minutes:seconds.milliseconds
		"T(\\d{2})" + // hours capture
		":(\\d{2})" + // minutes capture
		"(?:" + // optional :seconds.milliseconds
		    ":(\\d{2})" + // seconds capture
		    "(?:(\\.\\d{1,}))?" + // milliseconds capture
		")?" +
	    "(" + // capture UTC offset component
		"Z|" + // UTC capture
		"(?:" + // offset specifier +/-hours:minutes
		    "([-+])" + // sign capture
		    "(\\d{2})" + // hours offset capture
		    ":(\\d{2})" + // minutes offset capture
		")" +
	    ")?)?)?)?" +
	"$");

	var months = [
	    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
	];

	function dayFromMonth(year, month) {
	    var t = month > 1 ? 1 : 0;
	    return (
		months[month] +
		Math.floor((year - 1969 + t) / 4) -
		Math.floor((year - 1901 + t) / 100) +
		Math.floor((year - 1601 + t) / 400) +
		365 * (year - 1970)
	    );
	}

	function toUTC(t) {
	    return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
	}

	// Copy any custom methods a 3rd party library may have added
	for (var key in NativeDate) {
	    Date[key] = NativeDate[key];
	}

	// Copy "native" methods explicitly; they may be non-enumerable
	Date.now = NativeDate.now;
	Date.UTC = NativeDate.UTC;
	Date.prototype = NativeDate.prototype;
	Date.prototype.constructor = Date;

	// Upgrade Date.parse to handle simplified ISO 8601 strings
	Date.parse = function parse(string) {
	    var match = isoDateExpression.exec(string);
	    if (match) {
		// parse months, days, hours, minutes, seconds, and milliseconds
		// provide default values if necessary
		// parse the UTC offset component
		var year = Number(match[1]),
		    month = Number(match[2] || 1) - 1,
		    day = Number(match[3] || 1) - 1,
		    hour = Number(match[4] || 0),
		    minute = Number(match[5] || 0),
		    second = Number(match[6] || 0),
		    millisecond = Math.floor(Number(match[7] || 0) * 1000),
		    // When time zone is missed, local offset should be used
		    // (ES 5.1 bug)
		    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
		    isLocalTime = Boolean(match[4] && !match[8]),
		    signOffset = match[9] === "-" ? 1 : -1,
		    hourOffset = Number(match[10] || 0),
		    minuteOffset = Number(match[11] || 0),
		    result;
		if (
		    hour < (
			minute > 0 || second > 0 || millisecond > 0 ?
			24 : 25
		    ) &&
		    minute < 60 && second < 60 && millisecond < 1000 &&
		    month > -1 && month < 12 && hourOffset < 24 &&
		    minuteOffset < 60 && // detect invalid offsets
		    day > -1 &&
		    day < (
			dayFromMonth(year, month + 1) -
			dayFromMonth(year, month)
		    )
		) {
		    result = (
			(dayFromMonth(year, month) + day) * 24 +
			hour +
			hourOffset * signOffset
		    ) * 60;
		    result = (
			(result + minute + minuteOffset * signOffset) * 60 +
			second
		    ) * 1000 + millisecond;
		    if (isLocalTime) {
			result = toUTC(result);
		    }
		    if (-8.64e15 <= result && result <= 8.64e15) {
			return result;
		    }
		}
		return NaN;
	    }
	    return NativeDate.parse.apply(this, arguments);
	};

	return Date;
    })(Date);
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
	return new Date().getTime();
    };
}


//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
if (!Number.prototype.toFixed || (0.00008).toFixed(3) !== '0.000' || (0.9).toFixed(0) === '0' || (1.255).toFixed(2) !== '1.25' || (1000000000000000128).toFixed(0) !== "1000000000000000128") {
    // Hide these variables and functions
    (function () {
	var base, size, data, i;

	base = 1e7;
	size = 6;
	data = [0, 0, 0, 0, 0, 0];

	function multiply(n, c) {
	    var i = -1;
	    while (++i < size) {
		c += n * data[i];
		data[i] = c % base;
		c = Math.floor(c / base);
	    }
	}

	function divide(n) {
	    var i = size, c = 0;
	    while (--i >= 0) {
		c += data[i];
		data[i] = Math.floor(c / n);
		c = (c % n) * base;
	    }
	}

	function toString() {
	    var i = size;
	    var s = '';
	    while (--i >= 0) {
		if (s !== '' || i === 0 || data[i] !== 0) {
		    var t = String(data[i]);
		    if (s === '') {
			s = t;
		    } else {
			s += '0000000'.slice(0, 7 - t.length) + t;
		    }
		}
	    }
	    return s;
	}

	function pow(x, n, acc) {
	    return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
	}

	function log(x) {
	    var n = 0;
	    while (x >= 4096) {
		n += 12;
		x /= 4096;
	    }
	    while (x >= 2) {
		n += 1;
		x /= 2;
	    }
	    return n;
	}

	Number.prototype.toFixed = function (fractionDigits) {
	    var f, x, s, m, e, z, j, k;

	    // Test for NaN and round fractionDigits down
	    f = Number(fractionDigits);
	    f = f !== f ? 0 : Math.floor(f);

	    if (f < 0 || f > 20) {
		throw new RangeError("Number.toFixed called with invalid number of decimals");
	    }

	    x = Number(this);

	    // Test for NaN
	    if (x !== x) {
		return "NaN";
	    }

	    // If it is too big or small, return the string value of the number
	    if (x <= -1e21 || x >= 1e21) {
		return String(x);
	    }

	    s = "";

	    if (x < 0) {
		s = "-";
		x = -x;
	    }

	    m = "0";

	    if (x > 1e-21) {
		// 1e-21 < x < 1e21
		// -70 < log2(x) < 70
		e = log(x * pow(2, 69, 1)) - 69;
		z = (e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1));
		z *= 0x10000000000000; // Math.pow(2, 52);
		e = 52 - e;

		// -18 < e < 122
		// x = z / 2 ^ e
		if (e > 0) {
		    multiply(0, z);
		    j = f;

		    while (j >= 7) {
			multiply(1e7, 0);
			j -= 7;
		    }

		    multiply(pow(10, j, 1), 0);
		    j = e - 1;

		    while (j >= 23) {
			divide(1 << 23);
			j -= 23;
		    }

		    divide(1 << j);
		    multiply(1, 1);
		    divide(2);
		    m = toString();
		} else {
		    multiply(0, z);
		    multiply(1 << (-e), 0);
		    m = toString() + '0.00000000000000000000'.slice(2, 2 + f);
		}
	    }

	    if (f > 0) {
		k = m.length;

		if (k <= f) {
		    m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
		} else {
		    m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
		}
	    } else {
		m = s + m;
	    }

	    return m;
	}
    }());
}


//
// String
// ======
//


// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = String.prototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === "t" ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
	var compliantExecNpcg = /()??/.exec("")[1] === void 0; // NPCG: nonparticipating capturing group

	String.prototype.split = function (separator, limit) {
	    var string = this;
	    if (separator === void 0 && limit === 0)
		return [];

	    // If `separator` is not a regex, use native split
	    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
		return string_split.apply(this, arguments);
	    }

	    var output = [],
		flags = (separator.ignoreCase ? "i" : "") +
			(separator.multiline  ? "m" : "") +
			(separator.extended   ? "x" : "") + // Proposed for ES6
			(separator.sticky     ? "y" : ""), // Firefox 3+
		lastLastIndex = 0,
		// Make `global` and avoid `lastIndex` issues by working with a copy
		separator = new RegExp(separator.source, flags + "g"),
		separator2, match, lastIndex, lastLength;
	    string += ""; // Type-convert
	    if (!compliantExecNpcg) {
		// Doesn't need flags gy, but they don't hurt
		separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
	    }
	    /* Values for `limit`, per the spec:
	     * If undefined: 4294967295 // Math.pow(2, 32) - 1
	     * If 0, Infinity, or NaN: 0
	     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	     * If other: Type-convert, then use the above rules
	     */
	    limit = limit === void 0 ?
		-1 >>> 0 : // Math.pow(2, 32) - 1
		limit >>> 0; // ToUint32(limit)
	    while (match = separator.exec(string)) {
		// `separator.lastIndex` is not reliable cross-browser
		lastIndex = match.index + match[0].length;
		if (lastIndex > lastLastIndex) {
		    output.push(string.slice(lastLastIndex, match.index));
		    // Fix browsers whose `exec` methods don't consistently return `undefined` for
		    // nonparticipating capturing groups
		    if (!compliantExecNpcg && match.length > 1) {
			match[0].replace(separator2, function () {
			    for (var i = 1; i < arguments.length - 2; i++) {
				if (arguments[i] === void 0) {
				    match[i] = void 0;
				}
			    }
			});
		    }
		    if (match.length > 1 && match.index < string.length) {
			Array.prototype.push.apply(output, match.slice(1));
		    }
		    lastLength = match[0].length;
		    lastLastIndex = lastIndex;
		    if (output.length >= limit) {
			break;
		    }
		}
		if (separator.lastIndex === match.index) {
		    separator.lastIndex++; // Avoid an infinite loop
		}
	    }
	    if (lastLastIndex === string.length) {
		if (lastLength || !separator.test("")) {
		    output.push("");
		}
	    } else {
		output.push(string.slice(lastLastIndex));
	    }
	    return output.length > limit ? output.slice(0, limit) : output;
	};
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ("0".split(void 0, 0).length) {
    String.prototype.split = function(separator, limit) {
	if (separator === void 0 && limit === 0) return [];
	return string_split.apply(this, arguments);
    }
}


// ECMA-262, 3rd B.2.3
// Note an ECMAScript standart, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
if ("".substr && "0b".substr(-1) !== "b") {
    var string_substr = String.prototype.substr;
    /**
     *  Get the substring of a string
     *  @param  {integer}  start   where to start the substring
     *  @param  {integer}  length  how many characters to return
     *  @return {string}
     */
    String.prototype.substr = function(start, length) {
	return string_substr.call(
	    this,
	    start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
	    length
	);
    }
}

// ES5 15.5.4.20
// http://es5.github.com/#x15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
	trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
	if (this === void 0 || this === null) {
	    throw new TypeError("can't convert "+this+" to object");
	}
	return String(this)
	    .replace(trimBeginRegexp, "")
	    .replace(trimEndRegexp, "");
    };
}

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer

function toInteger(n) {
    n = +n;
    if (n !== n) { // isNaN
	n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
	n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return (
	input === null ||
	type === "undefined" ||
	type === "boolean" ||
	type === "number" ||
	type === "string"
    );
}

function toPrimitive(input) {
    var val, valueOf, toString;
    if (isPrimitive(input)) {
	return input;
    }
    valueOf = input.valueOf;
    if (typeof valueOf === "function") {
	val = valueOf.call(input);
	if (isPrimitive(val)) {
	    return val;
	}
    }
    toString = input.toString;
    if (typeof toString === "function") {
	val = toString.call(input);
	if (isPrimitive(val)) {
	    return val;
	}
    }
    throw new TypeError();
}

// ES5 9.9
// http://es5.github.com/#x9.9
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
	throw new TypeError("can't convert "+o+" to object");
    }
    return Object(o);
};

});

// Copyright 2009-2012 by contributors, MIT License
// vim: ts=4 sts=4 sw=4 expandtab

//Add semicolon to prevent IIFE from being passed as argument to concated code.
;
// Module systems magic dance
(function (definition) {
    // RequireJS
    if (typeof define == "function") {
	define(definition);
    // YUI3
    } else if (typeof YUI == "function") {
	YUI.add("es5-sham", definition);
    // CommonJS and <script>
    } else {
	definition();
    }
})(function () {


var call = Function.prototype.call;
var prototypeOfObject = Object.prototype;
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

// ES5 15.2.3.2
// http://es5.github.com/#x15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/es-shims/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    Object.getPrototypeOf = function getPrototypeOf(object) {
	return object.__proto__ || (
	    object.constructor
		? object.constructor.prototype
		: prototypeOfObject
	);
    };
}

//ES5 15.2.3.3
//http://es5.github.com/#x15.2.3.3

function doesGetOwnPropertyDescriptorWork(object) {
    try {
	object.sentinel = 0;
	return Object.getOwnPropertyDescriptor(
		object,
		"sentinel"
	).value === 0;
    } catch (exception) {
	// returns falsy
    }
}

//check whether getOwnPropertyDescriptor works if it's given. Otherwise,
//shim partially.
if (Object.defineProperty) {
    var getOwnPropertyDescriptorWorksOnObject =
	doesGetOwnPropertyDescriptorWork({});
    var getOwnPropertyDescriptorWorksOnDom = typeof document == "undefined" ||
    doesGetOwnPropertyDescriptorWork(document.createElement("div"));
    if (!getOwnPropertyDescriptorWorksOnDom ||
	    !getOwnPropertyDescriptorWorksOnObject
    ) {
	var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
    }
}

if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a non-object: ";

    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
	if ((typeof object != "object" && typeof object != "function") || object === null) {
	    throw new TypeError(ERR_NON_OBJECT + object);
	}

	// make a valiant attempt to use the real getOwnPropertyDescriptor
	// for I8's DOM elements.
	if (getOwnPropertyDescriptorFallback) {
	    try {
		return getOwnPropertyDescriptorFallback.call(Object, object, property);
	    } catch (exception) {
		// try the shim if the real one doesn't work
	    }
	}

	// If object does not owns property return undefined immediately.
	if (!owns(object, property)) {
	    return;
	}

	// If object has a property then it's for sure both `enumerable` and
	// `configurable`.
	var descriptor =  { enumerable: true, configurable: true };

	// If JS engine supports accessor properties then property may be a
	// getter or setter.
	if (supportsAccessors) {
	    // Unfortunately `__lookupGetter__` will return a getter even
	    // if object has own non getter property along with a same named
	    // inherited getter. To avoid misbehavior we temporary remove
	    // `__proto__` so that `__lookupGetter__` will return getter only
	    // if it's owned by an object.
	    var prototype = object.__proto__;
	    object.__proto__ = prototypeOfObject;

	    var getter = lookupGetter(object, property);
	    var setter = lookupSetter(object, property);

	    // Once we have getter and setter we can put values back.
	    object.__proto__ = prototype;

	    if (getter || setter) {
		if (getter) {
		    descriptor.get = getter;
		}
		if (setter) {
		    descriptor.set = setter;
		}
		// If it was accessor property we're done and return here
		// in order to avoid adding `value` to the descriptor.
		return descriptor;
	    }
	}

	// If we got this far we know that object has an own property that is
	// not an accessor so we set it as a value and return descriptor.
	descriptor.value = object[property];
	descriptor.writable = true;
	return descriptor;
    };
}

// ES5 15.2.3.4
// http://es5.github.com/#x15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
	return Object.keys(object);
    };
}

// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = Object.prototype.__proto__ === null;
    if (supportsProto || typeof document == 'undefined') {
	createEmpty = function () {
	    return { "__proto__": null };
	};
    } else {
	// In old IE __proto__ can't be used to manually set `null`, nor does
	// any other method exist to make an object that inherits from nothing,
	// aside from Object.prototype itself. Instead, create a new global
	// object and *steal* its Object.prototype and strip it bare. This is
	// used as the prototype to create nullary objects.
	createEmpty = function () {
	    var iframe = document.createElement('iframe');
	    var parent = document.body || document.documentElement;
	    iframe.style.display = 'none';
	    parent.appendChild(iframe);
	    iframe.src = 'javascript:';
	    var empty = iframe.contentWindow.Object.prototype;
	    parent.removeChild(iframe);
	    iframe = null;
	    delete empty.constructor;
	    delete empty.hasOwnProperty;
	    delete empty.propertyIsEnumerable;
	    delete empty.isPrototypeOf;
	    delete empty.toLocaleString;
	    delete empty.toString;
	    delete empty.valueOf;
	    empty.__proto__ = null;

	    function Empty() {}
	    Empty.prototype = empty;
	    // short-circuit future calls
	    createEmpty = function () {
		return new Empty();
	    };
	    return new Empty();
	};
    }

    Object.create = function create(prototype, properties) {

	var object;
	function Type() {}  // An empty constructor.

	if (prototype === null) {
	    object = createEmpty();
	} else {
	    if (typeof prototype !== "object" && typeof prototype !== "function") {
		// In the native implementation `parent` can be `null`
		// OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
		// Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
		// like they are in modern browsers. Using `Object.create` on DOM elements
		// is...err...probably inappropriate, but the native version allows for it.
		throw new TypeError("Object prototype may only be an Object or null"); // same msg as Chrome
	    }
	    Type.prototype = prototype;
	    object = new Type();
	    // IE has no built-in implementation of `Object.getPrototypeOf`
	    // neither `__proto__`, but this manually setting `__proto__` will
	    // guarantee that `Object.getPrototypeOf` will work as expected with
	    // objects created using `Object.create`
	    object.__proto__ = prototype;
	}

	if (properties !== void 0) {
	    Object.defineProperties(object, properties);
	}

	return object;
    };
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

function doesDefinePropertyWork(object) {
    try {
	Object.defineProperty(object, "sentinel", {});
	return "sentinel" in object;
    } catch (exception) {
	// returns falsy
    }
}

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document == "undefined" ||
	doesDefinePropertyWork(document.createElement("div"));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
	var definePropertyFallback = Object.defineProperty,
	    definePropertiesFallback = Object.defineProperties;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
				      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
	if ((typeof object != "object" && typeof object != "function") || object === null) {
	    throw new TypeError(ERR_NON_OBJECT_TARGET + object);
	}
	if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null) {
	    throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
	}
	// make a valiant attempt to use the real defineProperty
	// for I8's DOM elements.
	if (definePropertyFallback) {
	    try {
		return definePropertyFallback.call(Object, object, property, descriptor);
	    } catch (exception) {
		// try the shim if the real one doesn't work
	    }
	}

	// If it's a data property.
	if (owns(descriptor, "value")) {
	    // fail silently if "writable", "enumerable", or "configurable"
	    // are requested but not supported
	    /*
	    // alternate approach:
	    if ( // can't implement these features; allow false but not true
		!(owns(descriptor, "writable") ? descriptor.writable : true) ||
		!(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
		!(owns(descriptor, "configurable") ? descriptor.configurable : true)
	    )
		throw new RangeError(
		    "This implementation of Object.defineProperty does not " +
		    "support configurable, enumerable, or writable."
		);
	    */

	    if (supportsAccessors && (lookupGetter(object, property) ||
				      lookupSetter(object, property)))
	    {
		// As accessors are supported only on engines implementing
		// `__proto__` we can safely override `__proto__` while defining
		// a property to make sure that we don't hit an inherited
		// accessor.
		var prototype = object.__proto__;
		object.__proto__ = prototypeOfObject;
		// Deleting a property anyway since getter / setter may be
		// defined on object itself.
		delete object[property];
		object[property] = descriptor.value;
		// Setting original `__proto__` back now.
		object.__proto__ = prototype;
	    } else {
		object[property] = descriptor.value;
	    }
	} else {
	    if (!supportsAccessors) {
		throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
	    }
	    // If we got that far then getters and setters can be defined !!
	    if (owns(descriptor, "get")) {
		defineGetter(object, property, descriptor.get);
	    }
	    if (owns(descriptor, "set")) {
		defineSetter(object, property, descriptor.set);
	    }
	}
	return object;
    };
}

// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (!Object.defineProperties || definePropertiesFallback) {
    Object.defineProperties = function defineProperties(object, properties) {
	// make a valiant attempt to use the real defineProperties
	if (definePropertiesFallback) {
	    try {
		return definePropertiesFallback.call(Object, object, properties);
	    } catch (exception) {
		// try the shim if the real one doesn't work
	    }
	}

	for (var property in properties) {
	    if (owns(properties, property) && property != "__proto__") {
		Object.defineProperty(object, property, properties[property]);
	    }
	}
	return object;
    };
}

// ES5 15.2.3.8
// http://es5.github.com/#x15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
	// this is misleading and breaks feature-detection, but
	// allows "securable" code to "gracefully" degrade to working
	// but insecure code.
	return object;
    };
}

// ES5 15.2.3.9
// http://es5.github.com/#x15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
	// this is misleading and breaks feature-detection, but
	// allows "securable" code to "gracefully" degrade to working
	// but insecure code.
	return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
	return function freeze(object) {
	    if (typeof object == "function") {
		return object;
	    } else {
		return freezeObject(object);
	    }
	};
    })(Object.freeze);
}

// ES5 15.2.3.10
// http://es5.github.com/#x15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
	// this is misleading and breaks feature-detection, but
	// allows "securable" code to "gracefully" degrade to working
	// but insecure code.
	return object;
    };
}

// ES5 15.2.3.11
// http://es5.github.com/#x15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
	return false;
    };
}

// ES5 15.2.3.12
// http://es5.github.com/#x15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
	return false;
    };
}

// ES5 15.2.3.13
// http://es5.github.com/#x15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
	// 1. If Type(O) is not Object throw a TypeError exception.
	if (Object(object) !== object) {
	    throw new TypeError(); // TODO message
	}
	// 2. Return the Boolean value of the [[Extensible]] internal property of O.
	var name = '';
	while (owns(object, name)) {
	    name += '?';
	}
	object[name] = true;
	var returnValue = owns(object, name);
	delete object[name];
	return returnValue;
    };
}

});



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
  console.log(Object.isObjectStrict(obj));
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
	var obj = object[key];
	if (deep && Object.isObjectStrict(obj) && Object.isObjectStrict(proj)) {
	  res[key] = Object.project(obj, projection[key], deep, keep);
	} else {
	  if (keep)
	    res[key] = obj;
	  else if (obj !== undefined)
	    res[key] = obj;
	}
      }
    });
    return res;
  },
  Transformer: function(mapping) {
		var expr = [];
		expr.push('exec=function (object) {');
		expr.push('var res = {};');
		(function loop(lhv, mapping) {
			Object.keys(mapping).forEach(function(key) {
				var source = mapping[key];
				if (/\W/.test(key)) key = '["' + key + '"]';
				else key = '.' + key;


				var target = lhv + key;
				if ($typeof(source) == 'object') {
					expr.push(target + ' = {};');
					return loop(target, source);
				}

				if (true === source)
					source = 'object' + key;
				else if ($typeof(source) == 'string')
					source = 'object' + source;
				else if ($typeof(source) == 'function')
					source = '('+source.toString()+')(object)';
				expr.push(target + ' = ' + source + ';');
			});
		})('res', mapping);
		expr.push('return res;');
		expr.push('}');
		this.exec = eval(expr.join(''));
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

(function() {

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
    return this.$hasClass(cls) ? this.$removeClass(cls) : this.$addClass(cls);
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
    callback(evt, null, xhr);
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

})();

(function() {

(function(obj, proto) {
  for (var name in proto) {
    if (name in obj)
      continue;
    Object.defineProperty(obj, name, proto[name]);
  }
})(window, {
  innerWidth: {
    get: function() {
      return document.documentElement.clientWidth;
    }
  },
  innerHeight: {
    get: function() {
      return document.documentElement.clientHeight;
    }
  },
  pageXOffset: {
    get: function() {
      return document.documentElement.scrollLeft ||
	  document.body.scrollLeft;
    }
  },
  pageYOffset: {
    get: function() {
      return document.documentElement.scrollTop ||
	  document.body.scrollTop;
    }
  },
  scrollTo: {
    value: function(x, y) {
      document.documentElement.scrollLeft =
	  document.body.scrollLeft = x;
      document.documentElement.scrollTop =
	  document.body.scrollTop = y;
    }
  }
});

if (!window.Node)
  window.Node = window.HTMLElement = window.Element;

if (!document.head)
  document.head = document.querySelector('head');

if (!document.getElementsByClassName)
  (function() {
    var proto = {
      getElementsByClassName: {
	value: function(name) {
	  return this.querySelectorAll('.' + name);
	}
      }
    };
    Object.defineProperties(document, proto);
    Object.defineProperties(Element.prototype, proto);
  })();



if (!window.console)
  window.console = {
    log: function() {},
    error: function() {}
  };

})();

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
