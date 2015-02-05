/* Events on non DOM objects */
function Event(name) {
  this.name = name;
  this.callbacks = [];
}

Event.prototype.registerCallback = function(callback) {
  this.callbacks.push(callback);
};

function Reactor() {
  this.events = {};
}

var ReactorCtor = function() {};
ReactorCtor.prototype = Reactor.prototype;

Reactor.prototype.registerEvent = function(eventName) {
  var event = new Event(eventName);
  this.events[eventName] = event;
};

Reactor.prototype.dispatchEvent = function(eventName, eventArgs) {
  for (var i = 0; i < this.events[eventName].callbacks.length; i++) {
    var callback = this.events[eventName].callbacks[i];
    callback(eventArgs);
  }
};

Reactor.prototype.addEventListener = function(eventName, callback) {
  this.events[eventName].registerCallback(callback);
};

Reactor.prototype.removeEventListener = function(eventName, callback) {
  var event = this.events[eventName];
  if (event) {
    var i;
    while ((i = event.callbacks.indexOf(callback)) !== -1) {
      event.callbacks.splice(i, 1);
    }
  }
};

/* Cross browser addEvent and removeEvent */
function addEvent(obj, type, fn) {
  if (obj.attachEvent) {
    obj['e' + type + fn] = fn;
    obj[type + fn] = function() { obj['e' + type + fn](window.event); };
    obj.attachEvent('on' + type, obj[type + fn]);
  }
  else if (obj.addEventListener) {
    obj.addEventListener(type, fn, false);
  }
}

function removeEvent(obj, type, fn) {
  if (obj.detachEvent) {
    obj.detachEvent('on' + type, obj[type + fn]);
    obj[type + fn] = null;
  }
  else if (obj.removeEventListener) {
    obj.removeEventListener(type, fn, false);
  }
}

function normalizeEvent(e) {
  e = e || window.event;

  // fix for IE<=8
  if (e.pageX === undefined) {
    e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  // fix all browsers except IE to be W3C compliant
  var target = e.target || e.srcElement,
      style = target.currentStyle || window.getComputedStyle(target, null),
      borderLeftWidth = parseInt(style['borderLeftWidth'], 10),
      borderTopWidth = parseInt(style['borderTopWidth'], 10),
      rect = target.getBoundingClientRect();
  e.offsetX = e.clientX - borderLeftWidth - rect.left;
  e.offsetY = e.clientY - borderTopWidth - rect.top;

  e.which = e.keyCode || e.which;
  return e;
}