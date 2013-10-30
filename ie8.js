(function() {

if (!('innerWidth' in window))
  Object.defineProperties(window, {
    innerWidth: {
      get: function() {
        return document.documentElement.clientWidth;
      }
    },
    innerHeight: {
      get: function() {
        return document.documentElement.clientHeight;
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
      }
    });
    var proto = {
      addEventListener: {
        value: function(type, listener) {
          console.log('add to', this, type, listener);
          if (!this.attachEvent('on' + type, listener))
            console.error('Fucking failed!');
        }
      },
      removeEventListener: {
        value: function(type, listener) {
          console.log('remove from', this, type, listener);
          if (!this.detachEvent('on' + type, listener))
            console.error('Fucking failed!');
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
