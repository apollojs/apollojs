var ObjectID = require('mongodb').ObjectID;

/**
 * Get a mongodb type update document
 * @param {Object} origin
 * @param {Object} target
 * @param {Number} depth
 * @param {Function} diffarray
 * @return {Object} update document, null if nothing to update
 */
function $diff(origin, target, depth) {
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
  if(arguments.length == 1) {
    //if origin is a mongodb update document,
    //extract the op fields
    if(updateOps.some(function(op) { return origin[op]; })) {
      updateOps.forEach(function(op) {
        if(origin[op]) diff[op] = origin[op];
      });
    }
    //else generate a update document with $set
    else {
      Object.keys(origin).forEach(function(field) {
        if(field == '_id') return;
        if(field[field.length - 1] == '$') return;
        diff.$set[field] = origin[field];
      });
    }
  }
  else {
    if(!target || !origin || typeof target !== 'object' || typeof origin !== 'object')
      throw($error('target and origin must be document'));

    delete target.$diff;
    delete origin.$diff;

    Object.keys(target).forEach(function(field) {
      if(field == '_id') return;
      if(field[field.length - 1] == '$') return;

      if(target[field] === undefined)
        diff.$unset[field] = 1;
      else {
        var equals = $equals(origin[field], target[field], depth-1);
        if(equals === true)
          return;
        else if(equals === false)
          diff.$set[field] = target[field];
        else if(equals === 0) {
          if(origin[field].some(function(o) {
            if (!target[field].some(function(t) { return $equals(o, t, depth-1) === true; })) {
              if(diff.$pull[field])
                return true;
              else
                diff.$pull[field] = o;
            }
          })) {
            diff.$set[field] = target[field];
            delete diff.$pull[field];
          }

          else if(!diff.$pull[field]) {
            if(!diff.$push[field]) diff.$push[field] = { $each: [] };
            target[field].forEach(function(t) {
              if (!origin[field].some(function(o) { return $equals(t, o, depth-1) === true; })) {
                diff.$push[field].$each.push(t);
              }
            });
          }
        }
        else if(equals) {
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
    if(Object.keys(diff[op]).length === 0) delete diff[op];
    else notNull = true;
  });
  return notNull? diff: null;
}

/**
 * Compare two values's equality
 * @param  {[type]} a     [description]
 * @param  {[type]} b     [description]
 * @param  {[type]} depth [description]
 * @return {[type]}       [description]
 */
function $equals(a, b, depth) {
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

  if(!depth) return false;

  var aIsArray = Array.isArray(a);
  var bIsArray = Array.isArray(b);
  if(aIsArray ^ bIsArray) return false;
  else if(aIsArray) {
    //make sure all of a can be found in b
    return (a.length == b.length && a.every(function(elem_a) {
      var used = {};
      return b.some(function(elem_b, i) {
        if(used[i]) return false;
        var eq = $equals(elem_a, elem_b, depth - 1);
        if(eq === null || eq === true)
          return used[i] = true;
        return false;
      });
    })) ? true : 0;
  }
  return $diff(a, b, depth);
}

$define(global, {
  $diff: $diff,
  $equals: $equals
});
