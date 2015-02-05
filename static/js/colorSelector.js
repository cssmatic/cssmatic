// depends on isDescendant from gradientEditor.js
// depends on tinycolor.js
function xy2ar(x, y) {
	var alpha = Math.atan2(y, x) * 180 / Math.PI,
		radius = Math.sqrt(x * x + y * y);
	alpha = alpha < 0 ? alpha + 360 : alpha;
	return [alpha, radius];
}

function ar2xy(alpha, radius) {
	var x = radius * Math.cos(alpha),
		y = radius * Math.sin(alpha);
	return [x, y];
}

function getInnerWidth(el) {
	var style = getComputedStyle(el),
		blw = parseInt(style.borderLeftWidth, 10),
		brw = parseInt(style.borderRightWidth, 10);
	return el.offsetWidth - blw - brw;
}

function ColorSelector(color) {
	Reactor.call(this);

	this.color = new tinycolor(color);
	var hsv = this.color.toHsv();
	hsv.v = 1.0;
	var colorMaxValue = new tinycolor(hsv);

	// TODO: add several backgrounds in lightnessDefaultStyle
	var spectrumDefaultStyle = {
		'width': '200px',
		'height': '200px',
		'background': 'url(/static/img/color_spectrum.png)',
		'position': 'relative'
	},
	lightnessDefaultStyle = {
		'width': '200px',
		'height': '10px',
		'margin': '8px 0',
		'background': '-webkit-linear-gradient(left, ' + colorMaxValue.toRgbString() + ' 0%, rgb(0,0,0) 100%)',
		'border-radius': '2px',
		'border': '1px solid #ccc',
		'position': 'relative'
	},
	lightnessThumbDefaultStyle = spectrumSelectorDefaultStyle = {
		'width': '10px',
		'height': '10px',
		'border-radius': '6px',
		'border': '2px solid #333',
		'background': color,
		'position': 'absolute',
		'top': '-2px'
	},
	rgbDefaultStyle = {
	};

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
	this.dom = document.createElement('div');
	this.tooltip = new Tooltip({
		'className': 'color-selector',
		'html': '<div class="cs-spectrum"><div class="cs-selector"></div></div>' +
				'<div class="cs-lightness"><div class="cs-lightness-thumb"></div></div>' +
				'<div><label>RGB #<input class="cs-rgb" value="FFFFFF"></label></div>'
	});
	var wrapper = this.tooltip.getContentWrapper();
	this.domSpectrum = wrapper.querySelector('.cs-spectrum');
	this.domSpectrumSelector = wrapper.querySelector('.cs-selector');
	this.domRgb = wrapper.querySelector('.cs-rgb');
	this.domLightness = wrapper.querySelector('.cs-lightness');
	this.domLightnessThumb = wrapper.querySelector('.cs-lightness-thumb');

	applyCss(this.domSpectrum, spectrumDefaultStyle);
	applyCss(this.domSpectrumSelector, spectrumSelectorDefaultStyle);
	applyCss(this.domRgb, rgbDefaultStyle);
	applyCss(this.domLightness, lightnessDefaultStyle);
	applyCss(this.domLightnessThumb, lightnessThumbDefaultStyle);

	this.registerEvent('change');
	this.registerEvent('delete');
	this.registerEvent('close');

	makeDraggable(this.domSpectrumSelector, {
		'filterMovement': function(delta) {
			var t = xy2ar(x, y);
			return ar2xy(t[0], Math.min(t[1], 100));
		},
		'onDrag': function(event, coords) {
			var t = xy2ar(coords.left, coords.top);
			this.setHSV({'h': t[0], 's': t[1]});
		}
	});
	makeDraggable(this.domLightnessThumb, {
		'filterMovement': function(delta) {
			delta.top = 0;
			return delta;
		},
		'onDrag': function(event, coords) {
			console.log('drag to', coords);
			self.setHSV({'v': 1 - (coords.left / self.domLightness.offsetWidth)});
		}
	});

	this.onDocClick = function(event) {
		if (event.target !== wrapper && !isDescendant(wrapper, event.target)) {
			console.log('HIDE');
			self.hide();
		}
	};
	addEvent(this.domSpectrum, 'click', function(event) {
		if (event.target !== self.domSpectrum) {
			return;
		}
		var x = event.offsetX - 100,
			y = event.offsetY - 100,
			t = xy2ar(x, y);
		self.setHSV({'h': t[0], 's': t[1]});
		self.updatePositions();
	});
	addEvent(this.domLightness, 'click', function(event) {
		if (event.target !== self.domLightness) {
			return;
		}
		var w = getInnerWidth(this),
			value = 1 - event.offsetX / w;
		console.log('value', value);
		self.setHSV({'v': value});
		self.updatePositions();
	});

	this.refresh();
	this.updatePositions();
}

ColorSelector.prototype = new ReactorCtor();

ColorSelector.prototype._moveSpectrumSelector = function(x, y) {
	var t = xy2ar(x, y);
	this.setHSV({'h': t[0], 's': t[1]});
};

// hueDeg in [0, 360], saturation in [0, 1]
ColorSelector.prototype._setHSV = function(hsv) {
	var curHsv = this.color.toHsv();
	for (var k in hsv) {
		console.log('change', k, hsv[k]);
		curHsv[k] = hsv[k];
	}
	this.color = new tinycolor(curHsv);
	console.log(this.color);
};

ColorSelector.prototype.setHSV = function(hsv) {
	this._setHSV(hsv);
	this.dispatchEvent('change', this.color.toHexString());
	this.refresh();
};

ColorSelector.prototype.show = function(coords) {
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

ColorSelector.prototype.hide = function() {
	removeEvent(document, 'mousedown', this.onDocClick);
	this.tooltip.hide();
};

ColorSelector.prototype.del = function() {
	this.tooltip.del();
};

// moves both thumbs to their right position according to this.color
ColorSelector.prototype.updatePositions = function() {
	var hsv = this.color.toHsv(),
		r = Math.floor(100 * hsv.s),
		t = ar2xy(hsv.h, hsv.s * 100),
		x = t[0] + 100,
		y = t[1] + 100;

	var domLightnessWidth = getInnerWidth(this.domLightness);
	applyCss(this.domLightnessThumb, {
		'left': Math.round(domLightnessWidth * (1 - hsv.v) - this.domLightnessThumb.offsetWidth / 2) + 'px'
	});
	var w = this.domSpectrumSelector.offsetWidth,
		h = this.domSpectrumSelector.offsetHeight;
	applyCss(this.domSpectrumSelector, {
		'top': Math.round(y - h / 2) + 'px',
		'left': Math.round(x - w / 2) + 'px'
	});
};

ColorSelector.prototype.refresh = function() {
	var hsv = this.color.toHsv();
	hsv.v = 1.0;
	var colorMaxValueRgb = new tinycolor(hsv).toRgbString();

	this.domRgb.value = this.color.toHex();

	applyCss(this.domLightnessThumb, {
		'background': this.color.toRgbString()
	});
	applyCss(this.domSpectrumSelector, {
		'background': colorMaxValueRgb
	});
	applyCss(this.domLightness, {
		'background': '-webkit-linear-gradient(left, ' + colorMaxValueRgb + ' 0%, rgb(0,0,0) 100%)',
	});
};
