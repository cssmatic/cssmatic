function _doNothing() {}

function _defFilterMovement(delta) {
	return delta;
}

function _getOffset(element) {
	var ox = element.offsetLeft, oy = element.offsetTop, p = element;
	while ((p = p.offsetParent) !== null) {
		ox += p.offsetLeft;
		oy += p.offsetTop;
	}
	return {'x': ox, 'y': oy, 'width': element.offsetWidth, 'height': element.offsetHeight};
}

function _clamp(a, x, b) {
	return a > x ? a : (b < x ? b : x);
}

function moveElementInsideParent(el, delta) {
	var p = el.parentNode,
		ncoords = {
			'top': _clamp(0, el.offsetTop + delta.top, p.offsetHeight - el.offsetHeight),
			'left': _clamp(0, el.offsetLeft + delta.left, p.offsetWidth - el.offsetWidth)
		};
	console.log('el.offsetTop:', el.offsetTop);
	console.log('move element to:', delta, ncoords);
	applyCss(el, {'top': ncoords.top + 'px', 'left': ncoords.left + 'px'});
	return ncoords;
}

function _getPos(event) {
	var posx = 0, posy = 0;

	if (event.pageX || event.pageY) {
		posx = event.pageX;
		posy = event.pageY;
	}
	else if (event.clientX || event.clientY) {
		posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return {'x': posx, 'y': posy};
}

function getOffsetRect(elem) {
    var box = elem.getBoundingClientRect(),
        body = document.body,
        docElem = document.documentElement,
        scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
        clientTop = docElem.clientTop || body.clientTop || 0,
        clientLeft = docElem.clientLeft || body.clientLeft || 0,
        top  = box.top + scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft;
    
    return { top: Math.round(top), left: Math.round(left), width: box.width || elem.offsetWidth, height: box.height || elem.offsetHeight };
}

_DEFAULT_OPTIONS = {
	'onStart': _doNothing,
	'onDrag': _doNothing,
	'onStop': _doNothing,
	'filterMovement': _defFilterMovement
};

function makeDraggable(domElement, options) {
	domElement.style.position = 'absolute';

	options = options || {};
	for (var optName in _DEFAULT_OPTIONS) {
		if (options[optName] === undefined) {
			options[optName] = _DEFAULT_OPTIONS[optName];
		}
	}

	addEvent(domElement, 'mousedown', function(event) {
		event = event || window.event;
		console.log('onmousedown', event);
		event.preventDefault();
		var lastMousePos = _getPos(event);

		options.onStart(event);

		// note: I don't use addEvent and removeEvent here as it's more difficult
		// to use with closures.
		window.onmousemove = function(event) {
			event = event || window.event;
			console.log('onDrag ', event);
			var mouseCoords = _getPos(event),
				delta = options.filterMovement({
					'top': mouseCoords.y - lastMousePos.y,
					'left': mouseCoords.x - lastMousePos.x
				}),
				coords = moveElementInsideParent(domElement, delta);
			lastMousePos.x = mouseCoords.x;
			lastMousePos.y = mouseCoords.y;
			options.onDrag(event, coords);
		};

		window.onmouseup = function(event) {
			event = event || window.event;
			console.log('onStop ', event);
			window.onmousemove = window.onmouseup = null;
			options.onStop(event);
		};
	});
}
