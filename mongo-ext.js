var ObjectID = require('mongodb').ObjectID;

var kUpdateOps = [
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
  "$bit"
];

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
 * @return {UpdateDocument}
 */
function $diff(origin, target) {

  if (arguments.length === 0)
    return null;

  var diff = {};
  kUpdateOps.forEach(function(op) {
    diff[op] = {};
  });

  if (arguments.length == 1) {
    //if origin is a mongodb update document,
    //extract the op fields
    var foundOne = false;
    kUpdateOps.forEach(function(op) {
      if (origin[op]) {
        diff[op] = origin[op];
        foundOne = true;
      }
    });
    if (!foundOne) {
      // generate a update document with $set
      diff.$set = origin;
      delete diff.$set._id;
    }
  } else {

    if (!Object.isObject(target) || !Object.isObject(origin))
      throw $error('target and origin must be document');

    Object.keys(target).forEach(function(field) {
      if (field == '_id') return;

      if (target[field] === undefined) {
        diff.$unset[field] = 1;
      } else {
        var equals = $equals(origin[field], target[field]);
        if (equals === true)
          return;

        if (equals === false) {
          diff.$set[field] = target[field];

        } else if (equals === 0) {
          //array case

          origin_hash = {};
          target_hash = {};
          origin[field].forEach(function(elem) {
            origin_hash[JSON.stringify(elem)] = elem;
          });
          target[field].forEach(function(elem) {
            target_hash[JSON.stringify(elem)] = elem;
          });

          var pulls = [];
          Object.keys(origin_hash).forEach(function(ohash) {
            if (target_hash[ohash]) return;
            pulls.push(origin_hash[ohash]);
          });
          // console.log(pulls);
          var pushs = [];
          Object.keys(target_hash).forEach(function(thash) {
            if (origin_hash[thash]) return;
            pushs.push(target_hash[thash]);
          });
          // console.log(pushs);
          if (pulls.length && pushs.length || pulls.length > 1)
            diff.$set[field] = target[field];
          else if (pulls.length)
            diff.$pull[field] = pulls[0];
          else if (pushs.length == 1)
            diff.$push[field] = pushs[0];
          else if (pushs.length > 1)
            diff.$push[field] = {$each: pushs};

        } else if (equals) {
          Object.keys(equals).forEach(function(op) {
            Object.keys(equals[op]).forEach(function(_field) {
              diff[op][field+'.'+_field] = equals[op][_field];
            });
          });
        }
      }
    });
  }
  var notNull = false;
  Object.keys(diff).forEach(function(op) {
    if (Object.isEmpty(diff[op]))
      delete diff[op];
    else
      notNull = true;
  });
  return notNull ? diff : null;
}

/**
 * compare two values equality
 * @param  {Object} a     any type value a
 * @param  {Object} b     any type value b
 * @return {Mixed}        true/false/0/object
 *         true; indicates a excatly same case
 *         false; indicates a excatly diff case
 *         0; indicates a mostly diff case (when the object is array)
 *         object; a mongo-style update document
 */
function $equals(a, b) {
  if (typeof b === "function") b = b();
  if (a === b) return true;
  if (a === null) return false;
  if (b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  var aIsArray = Array.isArray(a);
  var bIsArray = Array.isArray(b);
  if (aIsArray ^ bIsArray) return false;
  else if (aIsArray) return 0;

  var aIsObjectID = a instanceof ObjectID;
  var bIsObjectID = b instanceof ObjectID;
  if (aIsObjectID ^ bIsObjectID) return false;
  else if (aIsObjectID) return a.equals(b);

  var _diff = $diff(a, b);
  if (_diff === null) return true;
  return _diff;
}

$define(global, {
  $diff: $diff,
  $equals: $equals
});
