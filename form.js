(function() {

var kTextInputTypes = {
  'text': true,
  'email': true,
  'password': true,
  'search': true
};

var kNumericInputTypes = {
  'number': true
};

$define(HTMLFormElement.prototype, {
  getControls: function() {
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
  init: function() {
    this.autoFocus();
    return this;
  },
  autoFocus: function(controls) {
    controls = controls || this.getControls();
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
  setDisabled: function(disabled, controls) {
    controls = controls || this.getControls();
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
  disable: function(controls) {
    return this.setDisabled(true, controls);
  },
  enable: function(controls) {
    return this.setDisabled(false, controls);
  },
  getFirstInvalidControl: function(controls) {
    controls = controls || this.getControls();
    for (var name in controls)
      if (!validateControl(controls[name]))
        return controls[name];
    return null;
  },
  validate: function(controls) {
    if (this.getFirstInvalidControl(controls))
      return false;
    return true;
  },
  toJSON: function(controls) {
    controls = controls || this.getControls();
    var res = {};
    for (var name in controls) {
      var control = controls[name];
      var value = control.value;
      var type = getType(control);
      switch (control.type) {
        case 'button':
          continue;
        case 'number':
          value = parseInt(value, 10);
          break;
        case 'date':
          value = Date.cast(value);
          break;
      }
      res[name] = value;
    }
    return res;
  }
});

function validateControl(control) {
  var value = control.value;
  var type = getType(control);
  var valid = !(
      control.hasAttribute('required') && !value ||
      value && (
        kTextInputTypes[type] && !validateTextControl(control) ||
        kNumericInputTypes[type] && !validateNumericControl(control)
      ));
  control.setClass('Invalid', !valid, true);
  return valid;
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
  var minLength = parseInt(control.getAttr('minlength'), 10);
  if (minLength && value.length < minLength)
    return false;
  var maxLength = parseInt(control.getAttr('maxlength'), 10);
  if (maxLength && value.length > maxLength)
    return false;
  var pattern = control.getAttr('pattern');
  if (pattern) pattern = new RegExp('^' + pattern + '$');
  if (control.type == 'email')
    pattern = pattern || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  if (pattern && !pattern.test(value))
    return false;
  return true;
}

function validateNumericControl(control) {
  var value = pasreFloat(control.value.trim());
  if (isNaN(value))
    return false;
  var min = parseFloat(control.getAttr('min'));
  if (isNaN(min) && value < min)
    return false;
  var max = parseFloat(control.getAttr('max'));
  if (isNaN(max) && value > max)
    return false;
  return true;
}

var kControlProto = {
  setDisabled: function(disabled) {
    this.disabled = disabled;
    return this;
  },
  disable: function() {
    this.disabled = true;
    return this;
  },
  enable: function() {
    this.disabled = false;
    return this;
  },
  isEnabled: function() {
    return !this.disabled;
  }
};

$define(HTMLButtonElement.prototype, kControlProto);
$define(HTMLInputElement.prototype, kControlProto);
$define(HTMLSelectElement.prototype, kControlProto);
$define(HTMLTextAreaElement.prototype, kControlProto);

})();
