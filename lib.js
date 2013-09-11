function $NOP() {};

function $I(id) {
  return document.getElementById(id);
}

function $T(tag, ele) {
  return (ele || document).getElementsByTagName(tag);
}

function $(sel, ele) {
  return (ele || document).querySelector(sel);
}

function $A(sel, ele) {
  return (ele || document).querySelectorAll(sel);
}

function $explict(name, obj) {
  window[name] = obj;
}

function $extend(obj, ext, override, deep) {
  if (override)
    if (deep)
      (function rdext(obj, ext) {
        for (var key in ext)
          if (obj[key] instanceof Object)
            rdext(obj[key], ext[key]);
      })(obj, ext);
    else
      for (var key in ext)
        obj[key] = ext[key];
  else
    if (deep)
      (function dext(obj, ext) {
        for (var key in ext)
          if (!(key in obj))
            if (obj[key] instanceof Object)
              rdext(obj[key], ext[key]);
      })(obj, ext);
    else
      for (var key in ext)
        if (!(key in obj))
          obj[key] = ext[key];
}

function $define(object, prototype) {
  var setterGetterPattern = /^(set|get)([A-Z])(.*)/;
  var setterGetters = {};
  for (var key in prototype) {
    var matches = setterGetterPattern.exec(key);
    var fn = prototype[key];
    Object.defineProperty(object, key, {
      value: fn,
      writeable: true // false
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
  console.log(setterGetters);
  Object.defineProperties(object, setterGetters);
}

function $declare(object, prototype) {
  object.prototype.constructor = object;
  $define(object.prototype, prototype);
}

function $inherit(type, parent, proto) {
  type.prototype = {
    constructor: type,
    __proto__: parent.prototype
  };
  if (proto) $define(type.prototype, proto);
}

function $prefix(obj, prefix) {
  var res = {};
  for (var key in obj)
    res[prefix + key] = obj[key];
  return res;
}

function $clone(org) {
  var obj = {};
  for (var key in org)
    obj[key] = org[key];
  return obj;
}

function $merge(a, b) {
  return $extend($clone(a), b);
}

function $bind(org, $this) {
  var obj = {};
  for (var key in org)
    obj[key] = org[key].bind($this);
  return obj;
}

function $default(val, def) {
  return val === undefined ? def : val;
}

function $random(val) {
  return Math.floor(Math.random() * val);
}

function $printf(str) {
  var args = arguments;
  return str.replace(/(.)?\$(\d+)(.)?/g, function(match, before, index, after) {
    return $default(before, '') + args[parseInt(index, 10)] + $default(after, '');
  });
}

function $wrap(obj, Type) {
  if (obj.__proto__) {
    obj.__proto__ = Type.prototype;
  } else {
    var newObj = Type.__default ? Type.__default() : new Type();
    $extend(newObj, obj);
    obj = newObj;
  }
  if (Type.__wrap)
    Type.__wrap(obj);
  return obj;
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

$explict('$E', $E);

$define(String.prototype, {
  repeat: function(len) {
    var res = '';
    for (var i = 0; i < len; i++)
      res += this;
    return res;
  },
  paddingLeft: function(ch, len) {
    if (this.length < len)
      return ch.repeat(len - this.length) + this;
    else
      return this;
  },
  paddingRight: function(ch, len) {
    if (this.length < len)
      return this + ch.repeat(len - this.length);
    else
      return this;
  }
});

$define(Number.prototype, {
  clamp: function(lb, ub) {
    var rtn = Math.max(this, lb);
    if (ub !== undefined) return Math.min(rtn, ub);
    return rtn;
  }
});

$define(Array.prototype, {
  min: function() {
    var res = this[0];
    for (var i = 1; i < this.length; i++)
      if (this[i] < res)
        res = this[i];
    return res;
  },
  max: function() {
    var res = this[0];
    for (var i = 1; i < this.length; i++)
      if (this[i] > res)
        res = this[i];
    return res;
  },
  add: function(val) {
    if (this.indexOf(val) === -1)
      return this.push(val);
    return -1;
  },
  remove: function(val) {
    var idx = this.indexOf(val);
    if (idx === -1) return null;
    for (; idx < this.length-1; idx++)
      this[idx] = this[idx+1];
    this.pop();
    return val;
  },
  rotate: function(n) {
    while (n-- > 0)
      this.unshift(this.pop());
    return this;
  }
});
if (Array.map === undefined)
  ['forEach', 'every', 'some', 'filter', 'map', 'reduce', 'reduceRight']
  .forEach(function(method) {
    var fn = Array.prototype[method];
    Object.defineProperty(Array, method, {
      value: function(a, b, c) {
        return fn.call(a, b, c);
      }
    });
  });

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
  unsetData: function(name) {
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
  unsetData: function(name) {
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
      if (node.getAttribute('data-type') !== undefined)
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
    } else if (xhr.status === 401) {
      console.error(401, res);
      location.href = 'https://sso.stu.edu.cn/login?service=' +
          encodeURIComponent(location.href);
    } else {
      callback(xhr.status, res);
    }
  };
  xhr.onerror = function(evt) {
    console.error(evt);
    callback(evt);
  };
  xhr.open(method, 'https://dev.stu.edu.cn/services/api/' + url, true);
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
$explict('Request', Request);

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
$explict('Tmpl', Tmpl);

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
$explict('StyleSheet', StyleSheet);

})();
