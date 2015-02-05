function Tooltip(options) {
	var tooltipDefaultStyle = {
		'display': 'inline-block',
		'font-size': '12px',
		'position': 'absolute',
		'top': '-1000px',
		'left': '0',
		'visibility': 'hidden',
		'opacity': '0',
		'transition': 'visibility 0.1s, opacity 0.1s ease-in-out'
	},
	tipTopDefaultStyle = {
		'box-sizing': 'border-box',
		'width': '8px',
		'height': '8px',
		'position': 'absolute',
		'bottom': '-8px',
		'left': '10px',
		'display': 'block',
		'border-right': '4px solid rgba(0,0,0,0)',
		'border-left': '4px solid rgba(0,0,0,0)',
		'border-top': '4px solid #CCC'
	},
	tipBorderDefaultStyle = {
		'box-sizing': 'border-box',
		'width': '8px',
		'height': '8px',
		'position': 'absolute',
		'bottom': '-7px',
		'left': '10px',
		'display': 'block',
		'border-right': '4px solid rgba(0,0,0,0)',
		'border-left': '4px solid rgba(0,0,0,0)',
		'border-top': '4px solid #FFF'
	},
	tooltipContentDefaultStyle = {
		'border': '1px solid #CCC',
		'border-radius': '7px',
		'box-shadow': '0px 0px 1px 1px rgba(0,0,0,0.1)',
		'padding': '3px 12px',
		'overflow': 'hidden',
		'background': '#FFFFFF'
	};

	var html = options.html || '',
		target = options.target || null,
		x = options.x,
		y = options.y,
		className = options.className || 'tooltip',
		style = options.style || {};

	var tooltip = this.tooltip = document.createElement('div'),
		tooltipContent = this.contentWrapper = document.createElement('div'),
		tipTop = this.tipTop = document.createElement('div'),
		tipBorder = document.createElement('div');
	this.dom = tooltip;
	tooltip.appendChild(tooltipContent);
	tooltip.appendChild(tipTop);
	tooltip.appendChild(tipBorder);
	tooltipContent.innerHTML = html;
	applyCss(tooltip, tooltipDefaultStyle);
	applyCss(tooltip, style);
	applyCss(tipTop, tipTopDefaultStyle);
	applyCss(tipBorder, tipBorderDefaultStyle);
	applyCss(tooltipContent, tooltipContentDefaultStyle);
	tooltipContent.className = className;
	document.body.appendChild(tooltip);

	if (target) {
		this.show(getOffsetRect(target));
	}
	else if (x && y) {
		this.show({'top': y, 'left': x});
	}
}

Tooltip.prototype.show = function(coords) {
	var rtip = getOffsetRect(this.tipTop),
		rtooltip = getOffsetRect(this.tooltip),
		offset = this.offset = {'top': rtip.top + Math.round(rtip.height / 2) - rtooltip.top, 'left': rtip.left + Math.round(rtip.width / 2) - rtooltip.left};

	console.log('Show at ', coords);
	var props = {
		'top': coords.top - this.offset.top + 'px',
		'left': coords.left - this.offset.left + 'px',
		'opacity': '1',
		'visibility': 'visible'
	};
	applyCss(this.tooltip, props);
};

Tooltip.prototype.hide = function() {
	applyCss(this.tooltip, {
		'visibility': 'hidden',
		'opacity': '0'
	});
};

Tooltip.prototype.getContentWrapper = function() {
	return this.contentWrapper;
};

Tooltip.prototype.del = function() {
	this.tooltip.parentNode.removeChild(this.tooltip);
};
