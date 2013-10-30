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

if (!window.addEventListener)
  (function() {
    Object.defineProperties(Event.prototype, {
      target: {
        get: function() {
          return this.srcElement;
        }
      },
      preventDefault: {
        value: function() {
          this.returnValue = false;
        }
      },
      stopPropagation: {
        value: function() {
          this.cancelBubble = true;
        }
      },
      defaultPrevented: {
        get: function() {
          return !this.returnValue;
        }
      }
    });

    var listeners = {};
    var idCounter = 1;

    function getApolloId(el) {
      if (el instanceof Window)
        return 'w';
      if (el instanceof HTMLDocument)
        return 'd';
      return el.getAttribute('apollo-id');
    }

    function getKey(apolloId, listenerId) {
      return apolloId + '.' + listenerId;
    }

    function getWrappedListener(el, listener) {
      var apolloId = getApolloId(el);
      var listenerId = listener.pListenerId;
      if (!apolloId) {
        apolloId = idCounter++;
        el.setAttribute('apollo-id', apolloId);
      }
      if (!listenerId) {
        listenerId = idCounter++;
        listener.pListenerId = listenerId;
      }
      var wrappedListener = function(evt) {
        evt.currentTarget = el;
        return listener.call(el, evt);
      };
      listeners[getKey(apolloId, listenerId)] = wrappedListener;
      return wrappedListener;
    }

    function lookupWrappedListener(el, listener) {
      var apolloId = getApolloId(el);
      var listenerId = listener.pListenerId;
      if (!apolloId || !listenerId)
        return;
      var key = getKey(apolloId, listenerId);
      var wrappedListener = listeners[key];
      delete listeners[key];
      return wrappedListener;
    }

    var proto = {
      addEventListener: {
        value: function(type, listener) {
          this.attachEvent('on' + type, getWrappedListener(this, listener));
        }
      },
      removeEventListener: {
        value: function(type, listener) {
          var wrappedListener = getWrappedListener(this, listener);
          if (wrappedListener)
            this.detachEvent('on' + type, wrappedListener);
        }
      }
    };

    Object.defineProperties(Element.prototype, proto);
    Object.defineProperties(HTMLDocument.prototype, proto);
    Object.defineProperties(Window.prototype, proto);

  })();

if (!window.console)
  window.console = {
    log: function() {},
    error: function() {}
  };

})();
