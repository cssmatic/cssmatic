/* depends on css.js */
function getRelativeCoords(event) {
	if (event.offsetX !== undefined && event.offsetY !== undefined) {
		return { x: event.offsetX, y: event.offsetY };
	}
	return { x: event.layerX, y: event.layerY };
}

function alphaToBlackAndWhite(alpha) {
	var r = Math.floor(255 * alpha).toString(16);
	while (r.length < 2) {
		r = '0' + r;
	}
	return '#' + r + r + r;
}

function isDescendant(parent, element) {
	var x = element;
	while ((x = x.parentElement) !== null) {
		if (x === parent)
			return true;
	}
	return false;
}

function AlphaEditor(alpha) {
	Reactor.call(this);

	function dispatchInput() {
		if (this.value !== self.value) {
			self.value = this.value;
			self.dispatchEvent('change', this.value);
		}
	}

	function onDeleteEditor(e) {
		e.preventDefault();
		self.dispatchEvent('delete');
		self.del();
	}

	function onKeyPress(e) {
		e = normalizeEvent(e);

		if (e.which == 27 || e.which == 13) {
			self.hide();
		}
		else if (e.which == 8 || e.which == 46) {
			onDeleteEditor(e);
		}
	}

	var self = this;
	this.tooltip = new Tooltip({
		'className': 'alpha-editor',
		'style': {
			'width': '222px'
		},
		'html': '<div class="ae-block ae-transparent-block"></div> ' +
				'<input type="range" min="0" max="1" step="0.05" value="' + alpha + '" style="vertical-align: middle; width: 129px"> ' +
				'<div class="ae-block ae-opaque-block"></div> ' +
				'<a href="javascript:void" class="ae-delete-link"><img src="/img/delete96.svg" width="13"></a>'
	});
	var wrapper = this.tooltip.getContentWrapper();
	this.dom = wrapper.querySelector('input[type=range]');
	this.domDelete = wrapper.querySelector('.ae-delete-link');
	var transparentBlock = wrapper.querySelector('.ae-transparent-block'),
		opaqueBlock = wrapper.querySelector('.ae-opaque-block');
	this.value = alpha;
	this.registerEvent('change');
	this.registerEvent('delete');

	this.onDocClick = function(event) {
		if (event.target !== wrapper && !isDescendant(wrapper, event.target)) {
			console.log('HIDE');
			self.hide();
		}
	};
	addEvent(transparentBlock, 'click', function() {
		self.dom.value = 0;
		dispatchInput.call(self.dom);
	});
	addEvent(opaqueBlock, 'click', function() {
		self.dom.value = 1;
		dispatchInput.call(self.dom);
	});
	addEvent(this.dom, 'change', dispatchInput);
	addEvent(this.dom, 'input', dispatchInput);
	addEvent(this.dom, 'keypress', onKeyPress);
	addEvent(this.dom, 'keydown', onKeyPress);
	addEvent(this.domDelete, 'click', onDeleteEditor);
}

AlphaEditor.prototype = new ReactorCtor();

AlphaEditor.prototype.show = function(coords) {
	this.tooltip.show(coords);
	this.dom.focus();
	self = this;
	// if we add the event handling synchronously here, and show
	// is called in a mousedown listener, the mousedown that show us will
	// also hide us.
	setTimeout(function() {
		addEvent(document, 'mousedown', self.onDocClick);
	}, 0);
};

AlphaEditor.prototype.hide = function() {
	removeEvent(document, 'mousedown', this.onDocClick);
	this.tooltip.hide();
};

AlphaEditor.prototype.del = function() {
	this.tooltip.del();
};

var HIDDEN_GRADIENT_KNOB_NODE = null;

function GradientKnob(color, alpha, position, domEditor) {
	var self = this;

	Reactor.call(this);

	this.position = position;
	this.color = color;
	this.alpha = alpha;

	this.registerEvent('change');
	this.registerEvent('delete');

	if (!HIDDEN_GRADIENT_KNOB_NODE) {
		HIDDEN_GRADIENT_KNOB_NODE = document.createElement('div');
		HIDDEN_GRADIENT_KNOB_NODE.className = 'gradient-editor-knob';
		applyCss(HIDDEN_GRADIENT_KNOB_NODE, [['visibility', 'hidden'], ['position', 'absolute'], ['left', '-50px']]);
		domEditor.appendChild(HIDDEN_GRADIENT_KNOB_NODE);
	}

	this.domKnob = document.createElement('div');
	this.domKnob.className = 'gradient-editor-knob';
	makeDraggable(this.domKnob, {
		'filterMovement': function(delta) {
			delta.top = 0;
			return delta;
		},
		'onDrag': function(event, coords) {
			self.position = coords.left / domEditor.offsetWidth;
			self.dispatchEvent('change');
		}
	});

	var width = domEditor.offsetWidth,
		knobWidth = HIDDEN_GRADIENT_KNOB_NODE.offsetWidth,
		left = Math.round(Math.max(2 - knobWidth, Math.min(width * position - knobWidth / 2, width - 2)));

	if (color) {
		this.editor = new ColorSelector(color);
		applyCss(this.domKnob, {
			'position': 'absolute',
			'left': px(left),
			'bottom': '0',
			'background-color': color
		});
	}
	else {
		this.editor = new AlphaEditor(alpha);
		applyCss(this.domKnob, {
			'position': 'absolute',
			'left': px(left),
			'top': '0',
			'background-color': alphaToBlackAndWhite(alpha)
		});
	}

	this.registerEvent('change');

	addEvent(this.editor, 'change', function(value) {
		if (self.alpha !== null) {
			self.alpha = parseFloat(value, 10);
			applyCss(self.domKnob, {'background-color': alphaToBlackAndWhite(self.alpha)});
		}
		else {
			self.color = value;
			applyCss(self.domKnob, {'background-color': self.color});
		}

		self.dispatchEvent('change');
	});

	addEvent(this.editor, 'delete', function(value) {
		self.editor = null;
		self.dispatchEvent('delete');
		self.del();
	});

	addEvent(this.domKnob, 'click', function(event) {
		var r = getOffsetRect(self.domKnob);
		event = normalizeEvent(event);
		if (self.editor.show) {
			self.editor.show({'left': r.left + Math.round(r.width / 2), 'top': r.top});
		}
	});

	domEditor.appendChild(this.domKnob);
}

GradientKnob.prototype = new ReactorCtor();

GradientKnob.prototype.del = function() {
	if (this.editor) {
		this.editor.del();
	}
	this.domKnob.parentNode.removeChild(this.domKnob);
};

function GradientEditor(domEditor) {
	Reactor.call(this);
	this.registerEvent('change');

	var self = this;
	this.canvas = document.createElement('canvas');
	this.canvas.width = 100;
	this.canvas.height = 2;
	this.domEditor = domEditor;
	this.alphaStops = [];
	this.colorStops = [];

	this.addAlphaStop(0.2, 0.2);
	this.addAlphaStop(0.8, 1.0);
	this.addColorStop(0.1, '#ff0000');
	this.addColorStop(0.9, '#00ff00');
	this.render();

	addEvent(this.domEditor, 'mousedown', function(event) {
		if (self.domEditor === event.target) {
			self.addAutoStop(event.offsetX / this.offsetWidth, event.offsetY > domEditor.offsetHeight / 2 ? 'color' : 'alpha');
		}
	});
}

GradientEditor.prototype = new ReactorCtor();

GradientEditor.prototype.addAutoStop = function(position, color_or_alpha) {
	var canvas = this.canvas,
		domEditor = this.domEditor,
		width = canvas.width,
		ctx = canvas.getContext('2d'),
		imgd = ctx.getImageData(0, 0, width, 2),
		pixels = imgd.data,
		idx = Math.floor(position * canvas.width);

	if (color_or_alpha === 'color') {
		var color = ColorToHex(pixels[idx * 4], pixels[idx * 4 + 1], pixels[idx * 4 + 2]);
		this.addColorStop(position, color);
	}
	else {
		this.addAlphaStop(position, pixels[(idx + width) * 4] / 255);
	}
};

GradientEditor.prototype.addColorStop = function(position, color) {
	var self = this;
	var colorKnob = new GradientKnob(color, null, position, this.domEditor);
	this.colorStops.push(colorKnob);
	this.dispatchEvent('change');
	addEvent(colorKnob, 'change', function() {
		self.render();
		self.dispatchEvent('change');
	});
	addEvent(colorKnob, 'delete', function() {
		self.colorStops = self.alphaStops.filter(function(x) { return x != colorKnob; });
		self.render();
		self.dispatchEvent('change');
	});
};

GradientEditor.prototype.addAlphaStop = function(position, alpha) {
	var self = this;
	var alphaKnob = new GradientKnob(null, alpha, position, this.domEditor);
	this.alphaStops.push(alphaKnob);
	this.dispatchEvent('change');
	addEvent(alphaKnob, 'change', function() {
		self.render();
		self.dispatchEvent('change');
	});
	addEvent(alphaKnob, 'delete', function() {
		self.alphaStops = self.alphaStops.filter(function(x) { return x != alphaKnob; });
		self.render();
		self.dispatchEvent('change');
	});
};

GradientEditor.prototype._mergePositions = function(alphaStops, colorStops) {
	stops = alphaStops.concat(colorStops).map(function(x) { return x.position; });
	return stops.sort();
};

GradientEditor.prototype.mergeStops = function(colorStops, alphaStops, auxCanvas) {
	if (!auxCanvas) {
		auxCanvas = document.createElement('canvas');
		auxCanvas.width = 100;
	}

	var stopPositions = this._mergePositions(alphaStops, colorStops);
	var ctx = auxCanvas.getContext('2d');
	var width = auxCanvas.width;
	var grdColors = ctx.createLinearGradient(0, 0, width, 0);
	var grdAlpha = ctx.createLinearGradient(0, 0, width, 0);
	var i, stop;

	// first we create the gradient with all the colors without alpha
	for (i = 0; i < colorStops.length; i++) {
		stop = colorStops[i];
		grdColors.addColorStop(stop.position, stop.color);
	}

	// we create another gradient with all the alphas (assuming black color)
	for (i = 0; i < alphaStops.length; i++) {
		stop = alphaStops[i];
		var a = Math.floor(stop.alpha * 255);
		grdAlpha.addColorStop(stop.position, 'rgb(' + a + ',' + a + ',' + a + ')');
	}

	// we draw both gradients on the canvas
	ctx.fillStyle = grdColors;
	ctx.fillRect(0, 0, width, 1);
	ctx.fillStyle = grdAlpha;
	ctx.fillRect(0, 1, width, 1);
	var imgd = ctx.getImageData(0, 0, width, 2);
	var pixels = imgd.data;

	// synthesize the final stops based on a blended color & alpha
	var stops = [];
	for (i = 0; i < stopPositions.length; i++) {
		var pos = stopPositions[i];
		var idx = Math.floor(pos * width);
		var color = new CssColor(pixels[idx * 4], pixels[idx * 4 + 1], pixels[idx * 4 + 2], pixels[(idx + width) * 4] / 255);
		stops.push(new CssColorStop(stopPositions[i], color));
	}

	return stops;
};

GradientEditor.prototype.render = function() {
	var stops = this.mergeStops(this.colorStops, this.alphaStops, this.canvas);
	var finalGradient = new CssLinearGradient(DIRECTION_LEFT, stops);
	finalGradient.setAsBackground(this.domEditor);
};

GradientEditor.prototype.getCss = function() {

};
