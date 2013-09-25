(function() {

'use strict';

var types = {};
var inited = false;

function init() {
  var loadModule = document.body.getData('loadModule');
  for (var type in types) {
    var Type = types[type];
    if (Type.init)
      Type.init();
    if (type === loadModule && Type.pageLoad)
      Type.pageLoad();
  }
  ['click', 'dblclick'].forEach(function(eventType) {
    document.addEventListener(eventType, function eventHandler(evt) {
      var target = evt.target;
      for (var node = target.findTypedAncestor(); node;
          node = node.findTypedAncestor(true)) {
        evt.node = node;
        var type = node.getData('type');
        // console.log(node, type);
        if (!types.hasOwnProperty(type))
          continue;
        var Type = types[type];
        // console.log(Type, node.getData('id'));
        if (Type._ && node.getData('id') !== undefined) {
          var instance = Type._(node.getData('id'));
          if (!instance)
            continue;
          if (instance[eventType]) {
            if (instance[eventType](evt))
              continue;
            return false;
          }
        }
        if (Type[eventType]) {
          if (Type[eventType](evt))
            continue;
          return false;
        }
        if (Type.eventHandler)
          return Type.eventHandler(eventType, evt);
      }
    }, false);
  });
  inited = true;
};

$define(Element.prototype, {
  getInstance: function() {
    var node = this.findTypedAncestor();
    if (!node)
      return undefined;
    var Type = node.getInstanceType();
    if (Type && Type._ && node.getData('id') !== undefined)
      return Type._(node.getData('id'));
    return undefined;
  },
  setInstanceType: function(Type, id) {
    this.setData('type', Type.__type);
    if (id !== undefined)
      this.setData('id', id);
    return this;
  },
  getInstanceType: function() {
    var node = this.findTypedAncestor();
    if (!node)
      return undefined;
    var type = node.getData('type');
    if (type && types[type])
      return types[type];
    return undefined;
  }
});

$extend(Element.prototype, {
  dispose: function() {
    var instance = this.getInstance();
    if (instance && instance.dispose)
      instance.dispose();
    return this.parentNode.removeChild(this);
  }
}, true);

window.addEventListener('DOMContentLoaded', init, false);

$define(window, {
  Dispatcher: {
    register: function(Type) {
      types[Type.__type] = Type;
      console.log(Type.__type, inited);
      if (inited && Type.init)
        Type.init();
    },
    unregister: function(Type) {
      delete types[Type.__type];
    },
    fire: function(eventType, data) {
      for (var type in types) {
        var Type = types[type];
        if (Type[eventType])
          Type[eventType](data);
      }
    }
  }
});

})();


