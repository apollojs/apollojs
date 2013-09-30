function $NOP() {};

function $I(id) {
  return document.getElementById(id);
}

function $T(tag, ele) {
  var els = $TA(tag, ele);
  return els.length > 0 ? els[0] : null;
}

function $TA(tag, ele) {
  return (ele || document).getElementsByTagName(tag);
}

function $(sel, ele) {
  return (ele || document).querySelector(sel);
}

function $A(sel, ele) {
  return (ele || document).querySelectorAll(sel);
}

function $CA(name, ele) {
  return (ele || document).getElementsByClassName(name);
}

function $C(name, ele) {
  var els = $CA(name, ele);
  return els.length > 0 ? els[0] : null;
}

(function() {

var elementCache = {};
function $E(name, att) {
  var el = elementCache.hasOwnProperty(name) ? elementCache[name].cloneNode(true)
         : document.createElement(name);
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

$define(Element.prototype, {
  setClass: function(cls, set) {
    return set ?
      this.addClass(cls) :
      this.removeClass(cls);
  },
  hide: function() {
    return this.addClass('HIDE');
  },
  show: function() {
    return this.removeClass('HIDE');
  },
  getSize: function() {
    return {
      w: this.offsetWidth,
      h: this.offsetHeight
    };
  },
  getPos: function() {
    var node = this, x = 0, y = 0;
    while (node.offsetParent) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return {
      x: x,
      y: y
    };
  },
  getScreenPos: function() {
    var pos = this.getPos();
    pos.x -= $DE.scrollLeft;
    pos.y -= $DE.scrollTop;
    return pos;
  },
  setPos: function(pos) {
    if ('x' in pos) this.style.left = pos.x + 'px';
    if ('y' in pos) this.style.top = pos.y + 'px';
    return this;
  },
  setSize: function(size) {
    if ('w' in size) this.style.width = size.w + 'px';
    if ('h' in size) this.style.height = size.h + 'px';
    return this;
  },
  measure: function() {
    if (!this.parentNode)
      document.body.appendChild(this);
    return this.addClass('MEASURING').getSize();
  },
  unmeasure: function() {
    var node = this;
    setTimeout(function() {
      node.removeClass('MEASURING');
    }, 0);
    return this;
  },
  dispose: function() {
    return this.parentNode.removeChild(this);
  },
  setAttr: function(name, value) {
    this.setAttribute(name, value);
    return this;
  },
  getAttr: function(name, json) {
    var value = this.getAttribute(name);
    if (json)
      return JSON.parse(value);
    return value;
  },
  removeAttr: function(name) {
    this.removeAttribute(name);
  },
  setTextValue: function(value) {
    if (this.firstChild && this.firstChild.nodeType === 3) {
      this.firstChild.nodeValue = value;
      return this;
    }
    this.appendChild(document.createTextNode(value));
    return this;
  }
});

// for shitting IE9.
$define(Element.prototype, document.documentElement.classList ? {
  addClass: function(cls) {
    this.classList.add(cls);
    return this;
  },
  removeClass: function(cls) {
    this.classList.remove(cls);
    return this;
  },
  hasClass: function(cls) {
    return this.classList.contains(cls);
  },
  toggleClass: function(cls) {
    this.classList.toggle(cls);
    return this;
  }
} : {
  addClass: function(cls) {
    if (!this.hasClass(cls))
      this.className += ' ' + cls;
    return this;
  },
  removeClass: function(cls) {
    this.className = this.className.replace(new RegExp('\\s*\\b' + cls + '\\b', 'g'), '');
    return this;
  },
  hasClass: function(cls) {
    return (new RegExp('\\b' + cls + '\\b')).test(this.className);
  },
  toggleClass: function(cls) {
    return this.hasClass(cls) ? this.removeClass(cls) : this.addClass(cls);
  }
});

function toDatasetName(name) {
  return 'data-' + name.replace(/A-Z/g, function(cap) {
    return '-' + cap.toLowerCase();
  });
}

$define(Element.prototype, document.documentElement.dataset ? {
  setData: function(name, value) {
    this.dataset[name] = value;
    return this;
  },
  getData: function(name) {
    return this.dataset[name];
  },
  removeData: function(name) {
    delete this.dataset[name];
    return this;
  }
} : {
  setData: function(name, value) {
    this.setAttribute(toDatasetName(name), value);
    return this;
  },
  getData: function(name) {
    return this.getAttribute(toDatasetName(name));
  },
  removeData: function(name) {
    this.removeAttribute(toDatasetName(name));
    return this;
  }
});

$define(Node.prototype, {
  ancestorOf: function(node, noself) {
    for (node = noself ? this.parentNode : node; node; node = node.parentNode)
      if (this === node) return true;
    return false;
  },
  findAncestorOfType: function(type, noself) {
    for (var node = noself ? this.parentNode : this; node && node !== document; node = node.parentNode)
      if (node.getAttribute('data-type') === Type.__type)
        return node;
    return null;
  },
  findTypedAncestor: function(noself) {
    for (var node = noself ? this.parentNode : this; node && node !== document; node = node.parentNode)
      if (node.getAttribute('data-type') !== null)
        return node;
    return null;
  },
  findAncestorOfTagName: function(tagname, noself) {
    for (var node = noself ? this.parentNode : this; node && node !== document; node = node.parentNode)
      if (node.tagName === tagname)
        return node;
    return null;
  },
  findAncestorHasAttribute: function(attr, noself) {
    for (var node = noself ? this.parentNode : this; node && node !== document; node = node.parentNode)
      if (node.hasAttribute(attr))
        return node;
    return null;
  },
  clear: function() {
    while (this.firstChild)
      this.removeChild(this.firstChild);
    return this;
  },
  setFirstTextNodeValue: function(value) {
    for (var node = this.firstChild; node; node = node.nextChild)
      if (node.nodeType === 3) {
        node.nodeValue = value;
        return this;
      }
    this.appendChild(document.createTextNode(value));
    return this;
  }
});

function Request(method, url, payload, resDataType, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function(evt) {
    var res = null;
    try {
      res = JSON.parse(xhr.responseText);
    } catch(e) {
      callback(e, null);
    }
    if (xhr.status === 200) {
      if (resDataType)
        callback(null, $wrap(res, resDataType));
      else
        callback(null, res);
    } else {
      callback(xhr.status, res);
    }
  };
  xhr.onerror = function(evt) {
    console.error(evt);
    callback(evt);
  };
  xhr.open(method, url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  if (method.toLowerCase() !== 'get') {
    payload = JSON.stringify(payload);
    xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.setRequestHeader('Content-Length', payload.length);
    xhr.send(payload);
  } else {
    xhr.send(null);
  }
}
['get', 'post', 'put'].forEach(function(method) {
  Request[method] = Request.bind(Request, method);
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
    node.dispose();
}
$declare(Tmpl, {
  generate: function(data) {
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
  //   return selector[0] === '.' ? node : $(selector[0], node);
  // },
  parse: function(that, selector) {
    selector = selector.split('@');
    var node = selector[0] === '.' ? that : $(selector[0], that);
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

function StyleSheet() {
  var styleSheet = document.head.appendChild(document.createElement('style'));
  styleSheet.type = 'text/css';
  return document.styleSheets[document.styleSheets.length-1];
}
$define(CSSStyleSheet.prototype, {
  empty: function() {
    return this.cssRules.length === 0;
  },
  clear: function() {
    this.disabled = true;
    while (this.cssRules.length > 0)
      this.deleteRule(0);
    this.disabled = false;
  },
  setRules: function(rules) {
    this.disabled = true;
    for (var i = 0; i < rules.length; i++)
      this.appendRule(rules[i]);
    this.disabled = false;
  },
  appendRule: function(selector, style) {
    var idx = this.cssRules.length;
    if (this.insertRule)
      this.insertRule(selector + '{}', idx);
    else
      this.addRule(selector, ';');
    var rule = this.cssRules[idx];
    // console.log(rule);
    if (style)
      for (var name in style)
        rule.style[name] = style[name];
    return rule;
  }
});

/**
 * Craete a event throttle for time critical events
 *   eg. Resize, MouseMove, KeyDown etc.
 * @param {number}   rate               Sample Rate in Hz
 * @param {number}   minRate            Minimal sample rate in Hz
 * @param {number}   finalDelay         Delaying some time after all events were
 *                                      emitted.
 * @param {Function} slowHandler        will be called in rate or minRate if
 *                                      event continuing emitted
 * @param {Function} fastHandler(event) will be called after each event emitted
 * Note that: slowHandler won't be called with event object,
 *   please store it yourself in fastHandler. And slowHandler will
 *   always be called after all event fired.
 */
function EventThrottle(rate, minRate, finalDelay, slowHandler, fastHandler) {

  var animationFrameTimer = false;
  var handler;

  if (rate < 0) {
    // This is a automatic throttle, which uses requestAnimationFrame
    handler = function(evt) {
      if (!animationFrameTimer) {
        animationFrameTimer = true;
        requestAnimationFrame(slowHandlerWrapperForAnimationFrame);
      }
      if (handler.fastHandler)
        return handler.fastHandler(evt);
    };
  } else {
    var delay = 1000 / rate;
    var maxDelay = 1000 / minRate;
    var delayTimer = null, maxDelayTimer = null, finalDelayTimer = null;
    handler = function(evt) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(slowHandlerWrapper, delay);
      clearTimeout(finalDelayTimer);
      finalDelayTimer = setTimeout(slowHandlerWrapper, finalDelay);
      if (maxDelayTimer === null) {
        maxDelayTimer = setTimeout(slowHandlerWrapper, maxDelay);
      }
      if (handler.fastHandler)
        return handler.fastHandler(evt);
    };
  }

  handler.slowHandler = slowHandler;
  handler.fastHandler = fastHandler;

  return handler;

  function slowHandlerWrapper() {
    clearTimeout(maxDelayTimer);
    maxDelayTimer = null;
    handler.slowHandler();
  }

  function slowHandlerWrapperForAnimationFrame() {
    animationFrameTimer = false;
    handler.slowHandler();
  }

}

$define(window, {
  $E: $E,
  Request: Request,
  Tmpl: Tmpl,
  StyleSheet: StyleSheet,
  EventThrottle: EventThrottle
});

if (!window.requestAnimationFrame) {
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
}

})();
