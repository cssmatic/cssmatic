/*** random utils ***/

if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

function trim(s) {
    return s.trim();
}

if (typeof(String.prototype.repeat) === "undefined") {
    String.prototype.repeat = function(num) {
        return new Array(num + 1).join(this);
    };
}

(function(){
    /**
     * Decimal adjustment of a number.
     *
     * @param   {String}    type    The type of adjustment.
     * @param   {Number}    value   The number.
     * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}            The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();

/** CSS helpers **/

/* color is the base color in #rrggbb and percent is -1 .. 1 (- for darker, + for lighter) */
function shadeColor(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

var CSS_ALTERNATIVES = {
    'border-radius': ['-webkit-border-radius', '-moz-border-radius', '-ms-border-radius', '-o-border-radius'],
    'box-shadow': ['-webkit-box-shadow', '-moz-box-shadow'],
};

/**
 * Takes a list of tuples, expands names (from border-radius to -*-border-radius) and serializes values.
 */
function expandCss(css) {
    var expandedCss = [];

    for (var i = 0; i < css.length; i++) {
        var cssName = css[i][0];
        var cssValue = css[i][1];

        if (cssName in CSS_ALTERNATIVES) {
            var altNames = CSS_ALTERNATIVES[cssName];
            for (var k = 0; k < altNames.length; k++) {
                expandedCss.push([altNames[k], cssValue]);
            }
        }

        var cssStrValues = serializeCssValue(cssValue);
        for (var j = 0; j < cssStrValues.length; j++) {
            expandedCss.push([cssName, cssStrValues[j]]);
        }
    }

    return expandedCss;
}

/* returns a list with all the serializations that we may need to use for a value.
 * The result has to be a list. For example, a gradient may serialize to
 * ['-webkit-linear-gradient(top, hsl(0, 80%, 70%), #bada55)',
 *  '-moz-linear-gradient(top, hsl(0, 80%, 70%), #bada55)',
 *  '-o-linear-gradient(top, hsl(0, 80%, 70%), #bada55)',
 *  'linear-gradient(to bottom, hsl(0, 80%, 70%), #bada55)']
 */
function serializeCssValue(cssValue) {
    if (cssValue.serializeCss) {
        return cssValue.serializeCss();
    }
    else {
        return [cssValue];
    }
}

// css has to be an array with: [[name1, value1], [name2, value2], ...] or a dict
function applyCss(element, css) {
    var cssProperties = [], name, value;

    if (css.length) {
        for (var i = 0; i < css.length; i++) {
            name = css[i][0];
            value = css[i][1];
            cssProperties.push(name + ':' + value);
        }
    }
    else {
        for (name in css) {
            cssProperties.push(name + ':' + css[name]);
        }
    }

    // works for DOM nodes and jQuery objects
    var el = element.get ? element.get(0) : element;
    el.style.cssText += cssProperties.join(';');
}

function cssToHtml(css, className) {
    var a = [];
    for (var pseudoclass in css) {
        var cssPseudo = css[pseudoclass];

        a.push('<span class="css-class">.' + className + '</span>' + (pseudoclass === 'normal' ? '' : ':' + pseudoclass) + ' {');
        for (var i = 0; i < cssPseudo.length; i++) {
            var name = cssPseudo[i][0];
            var value = cssPseudo[i][1];

            if (7 + name.length + value.length > 78) {
                var joiner = ',\n' + ' '.repeat(6 + name.length);
                value_list = value.split(', ');
                value_list.map(trim);
                value = value_list.join(joiner);
            }
            a.push('    <span class="css-property-name">' + name + '</span>: <span class="css-property-value">' + value + '</span>;');
        }
        a.push('}');
        a.push('');
    }
    return a.join('\n');
}

function serializeCorners(t, r, b, l) {
    if (typeof l == 'undefined') {
        l = r;
    }
    if (typeof b == 'undefined') {
        b = t;
    }

    if (r == l) {
        if (t == b) {
            if (t == r) {
                return t;
            }
            else {
                return t + ' ' + r;
            }
        }
        else {
            return t + ' ' + r + ' ' + b;
        }
    }
    else {
        return t + ' ' + r + ' ' + b + ' ' + l;
    }
}

function serializeCornersPx(t, r, b, l) {
    return serializeCorners(px(t), px(r), px(b), px(l));
}

/** random utils **/

function px(i) {
    if (i === undefined) {
        return undefined;
    }

    var j = parseInt(i, 10);
    return j ? j + 'px' : '0';
}

function ColorFromHex(rgb, alpha) {
    var r = parseInt(this.rgb.substring(1, 3), 16);
    var g = parseInt(this.rgb.substring(3, 5), 16);
    var b = parseInt(this.rgb.substring(5, 7), 16);
    return new CssColor(r, g, b, alpha);
}

function ColorToHex(r, g, b) {
    var hr = r.toString(16);
    var hg = g.toString(16);
    var hb = b.toString(16);
    hr = hr.length < 2 ? '0' + hr : hr;
    hg = hg.length < 2 ? '0' + hg : hg;
    hb = hb.length < 2 ? '0' + hb : hb;
    return '#' + hr + hg + hb;
}

function CssColor(r, g, b, alpha) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.rgb = ColorToHex(r, g, b);
    this.alpha = alpha;
}

CssColor.prototype.serializeCss = function() {
    if (this.alpha == 1) {
        return this.rgb;
    }
    else {
        var r = parseInt(this.rgb.substring(1, 3), 16);
        var g = parseInt(this.rgb.substring(3, 5), 16);
        var b = parseInt(this.rgb.substring(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + this.alpha + ')';
    }
};

// color is a CssColor
// position is a number between 0 and 1
function CssColorStop(position, color) {
    this.color = color;
    this.position = position;
}

var DIRECTION_TOP = 1,
    DIRECTION_BOTTOM = 2,
    DIRECTION_LEFT = 4,
    DIRECTION_RIGHT = 8;

function serializeDirection(d) {
    var fromDir = (d & DIRECTION_TOP ? 'top ' : '') +
                  (d & DIRECTION_BOTTOM ? 'bottom ' : '') +
                  (d & DIRECTION_LEFT ? 'left ' : '') +
                  (d & DIRECTION_RIGHT ? 'right ' : ''),
        toDir = (d & DIRECTION_TOP ? 'bottom ' : '') +
                (d & DIRECTION_BOTTOM ? 'top ' : '') +
                (d & DIRECTION_LEFT ? 'right ' : '') +
                (d & DIRECTION_RIGHT ? 'left ' : '');
    return [fromDir.trim(), toDir.trim()];
}

/** some special CSS clases **/
function CssLinearGradient(direction, color_stop_list) {
    var TB = DIRECTION_TOP | DIRECTION_BOTTOM;
    var LR = DIRECTION_LEFT | DIRECTION_RIGHT;
    if (direction <= 0 ||
        direction > (DIRECTION_RIGHT | DIRECTION_BOTTOM) ||
        (direction & TB) == TB || (direction & LR) == LR) {
        alert("CSSMatic Invalid direction " + direction);
    }
    this.direction = direction;
    this.color_stop_list = color_stop_list;
}

CssLinearGradient.prototype.serializeCss = function() {
    var css, colorCss;
    var colors = [];
    var cs, i;
    var webkitColorCss, webkitColors = [];

    var last_i = this.color_stop_list.length - 1;
    for (i = 0; i <= last_i; i++) {
        cs = this.color_stop_list[i];

        webkitColors.push(
            'color_stop(' + Math.floor(cs.position * 100) + '%, ' +
            cs.color.serializeCss() + ')'
        );
        if ((i === 0 && cs.position === 0) || (i === last_i && cs.position === 1)) {
            colors.push(cs.color.serializeCss());
        }
        else {
            colors.push(cs.color.serializeCss() + ' ' + Math.floor(cs.position * 100) + '%');
        }
    }

    var d = serializeDirection(this.direction);
    var fromDir = d[0], toDir = d[1];

    colorCss = colors.join(', ');
    webkitColorCss = webkitColors.join(', ');

    return ['-webkit-gradient(linear, ' + fromDir + ', ' + toDir + ', ' + webkitColorCss + ')',
            '-webkit-linear-gradient(' + fromDir + ', ' + colorCss + ')',
            '-moz-linear-gradient(' + fromDir + ', ' + colorCss + ')',
            '-ms-linear-gradient(' + fromDir + ', ' + colorCss + ')',
            '-o-linear-gradient(' + fromDir + ', ' + colorCss + ')',
            'linear-gradient(to ' + toDir + ', ' + colorCss + ')'];
};

CssLinearGradient.prototype.setAsBackground = function(dom) {
    var cssValues = this.serializeCss();
    this.setCssAsBackground(cssValues, dom);
};

CssLinearGradient.prototype.setCssAsBackground = function(cssValues, dom) {
    var css = cssValues.map(function(v) { return ['background', v]; });
    applyCss(dom, css);
};

function CssCorners(t, r, b, l) {
    this.t = t;
    this.r = r;
    this.b = b;
    this.l = l;
}

CssCorners.prototype.serializeCss = function() {
    if (typeof this.l == 'undefined') {
        this.l = r;
    }
    if (typeof this.b == 'undefined') {
        this.b = this.t;
    }

    if (this.r == this.l) {
        if (this.t == this.b) {
            if (this.t == this.r) {
                return [px(this.t)];
            }
            else {
                return [px(this.t) + ' ' + px(this.r)];
            }
        }
        else {
            return [px(this.t) + ' ' + px(this.r) + ' ' + px(this.b)];
        }
    }
    else {
        return [px(this.t) + ' ' + px(this.r) + ' ' + px(this.b) + ' ' + px(this.l)];
    }
};
