function UserColor(options) {
    if (options && options['format'] && options['color']) {
        this.format = options['format'];
        this.color = options['color'];

        if (this.format === 'hex' && this.color[0] === '#') {
            this.color = this.color.slice(1);
        }
    } else {
        this.format = 'rgb';
        this.color = {'r': 46, 'g': 74, 'b': 117};
    }
}

UserColor.prototype.getAlpha = function() {
    if (this.format[this.format.length - 1] !== 'a') {
        return 1;
    }

    return this.color.a;
};

UserColor.prototype.changeHSLLevels = function(hue, saturation, lightness) {
    var oldFormat = this.format;
    if (oldFormat[oldFormat.length - 1] === 'a')
        this.changeFormatColor('hsla');
    else
        this.changeFormatColor('hsl');

    var h, s, l;
    h = (this.color.h + hue) % 360;
    s = this.color.s * (saturation / 100.0 + 1);
    l = this.color.l * (lightness / 100.0 + 1);

    this.color.h = (h < 0) ? h + 360 : h;
    this.color.s = clamp(Math.round(s), 0, 100);
    this.color.l = clamp(Math.round(l), 0, 100);

    this.changeFormatColor(oldFormat);
};

UserColor.prototype.clone = function() {
    var i;
    var c = {};

    if (this.format == 'hex') {
        return new UserColor({'format': 'hex', 'color': this.color});
    } else {
        for (i = 0; i < this.format.length; i++)
            c[this.format[i]] = this.color[this.format[i]];

        return new UserColor({'format': this.format, 'color': c});
    }
};

UserColor.prototype.changeFormatColor = function(newFormat) {
    var k = 0, newColor = {};
    if (newFormat == this.format){
        return this.color;
    }

    // From RGB(A) to HSL / HEX
    if (this.format == 'rgb' || this.format == 'rgba') {
        if (newFormat == 'hsl' || newFormat == 'hsla') {
            newColor = rgb2hsl(this.color);
            if (newFormat == 'hsla' && this.format == 'rgb') {
                newColor['a'] = 1;
            }
        } else if (newFormat == 'hex') {
            newColor = rgb2hex(this.color);
        } else if (newFormat == 'rgb') {
            newColor = _remove_alpha(this.color);
        } else if (newFormat == 'rgba') {
            newColor = this.color;
            newColor['a'] = 1;
        }
    }

    // From HSL(A) to RGB / HEX
    if (this.format == 'hsl' || this.format == 'hsla') {
        if (newFormat == 'rgb' || newFormat == 'rgba') {
            newColor = hsl2rgb(this.color);
            if (newFormat == 'rgba' && this.format == 'hsl') {
                newColor['a'] = 1;
            }
        } else if (newFormat == 'hex') {
            newColor = hsl2hex(this.color);
        } else if (newFormat == 'hsl') {
            newColor = _remove_alpha(this.color);
        } else if (newFormat == 'hsla') {
            newColor = this.color;
            newColor['a'] = 1;
        }
    }

    // From HEX to RGB / HSL
    if (this.format == 'hex') {
        if (newFormat == 'rgb' || newFormat == 'rgba') {
            newColor = hex2rgb(this.color);
        } else if (newFormat == 'hsl' || newFormat == 'hsla') {
            newColor = hex2hsl(this.color);
        }
        if (newFormat[newFormat.length - 1] == 'a') {
            newColor['a'] = 1;
        }
    }

    this.format = newFormat;
    this.color = newColor;
};

UserColor.prototype.displayColor = function(format) {
    var res = '';
    var color = this;

    if (format && format != this.format) {
        color = this.clone();
        color.changeFormatColor(format);
    }

    if (color.format != 'hex') {
        res = color.format + '(';
    }

    if (color.format == 'hsl' || color.format == 'hsla'){
        res += color.color['h'] + ',';
        res += color.color['s'] + '%,';
        res += color.color['l'] + '%';
    } else if (color.format == 'rgb' || color.format == 'rgba'){
        res += color.color['r'] + ',';
        res += color.color['g'] + ',';
        res += color.color['b'];
    } else if (color.format == 'hex') {
        res += '#' + color.color;
    }

    if (color.format[color.format.length - 1] == 'a'){
        res += ',' + color.color['a'];
    }

    if (color.format != 'hex') {
        res += ')';
    }
    return res;
};

UserColor.prototype.equals = function(a) {
    var ok = a.format = this.format;
    if (ok && a.format === 'hex'){
        ok = a.color == this.color;
    } else if (ok && a.format.slice(0, 3) == 'rgb') {
        ok = a.color.r == this.color.r;
        ok = ok && a.color.g == this.color.g;
        ok = ok && a.color.b == this.color.b;
    } else if (ok && a.format.slice(0, 3) == 'hsl') {
        ok = a.color.h == this.color.h;
        ok = ok && a.color.s == this.color.s;
        ok = ok && a.color.l == this.color.l;
    }

    if (ok && a.format[a.format.length - 1] == 'a') {
        ok = ok && a.color.a == this.color.a;
    }
    return ok;
};

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 1]
// *Returns:* [h, s, l ] in [0, 1]
function rgb2hsl(rgba) {
    var r = rgba['r'] / 255.0;
    var g = rgba['g'] / 255.0;
    var b = rgba['b'] / 255.0;
    var res = {};

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    res = {'h': clamp(Math.round(h * 360) % 360, 0, 360),
           's': clamp(Math.round(s * 100), 0, 100),
           'l': clamp(Math.round(l * 100), 0, 100)};

    if (rgba['a'] || rgba['a'] == 0){
        res['a'] = rgba['a'];
    }
    return res;
}

// `hslToRgb
// Converts an HSL color value to RGB.
// *Assumes:* h, s, and l is contained in [0, 1]
// *Returns:* [r, g, b] in the set [0, 255]
function hsl2rgb(hsla) {
    var h = hsla['h'] / 360.0;
    var s = hsla['s'] / 100.0;
    var l = hsla['l'] / 100.0;
    var res = {};
    var r, g, b;

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    h = h % 1;

    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    res = {'r': clamp(Math.round(r * 255), 0, 255),
           'g': clamp(Math.round(g * 255), 0, 255),
           'b': clamp(Math.round(b * 255), 0, 255)};
    if (hsla['a'] || hsla['a'] == 0) {
        res['a'] = hsla['a'];
    }
    return res;
}

/**
 * Arguments:
 *      hex (str): A color in hexadecimal format
 *
 * Return:
 *      Dict(<str -> int>): A color in rgb format.
*/
function hex2rgb(hex) {
    var r, g, b;
    if (hex.charAt(0) == '#' ) {
        hex = hex.substr(1);
    }

    r = hex.charAt(0) + hex.charAt(1);
    g = hex.charAt(2) + hex.charAt(3);
    b = hex.charAt(4) + hex.charAt(5);

    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);

    return {'r': r, 'g': g, 'b': b};
}

/**
 * Arguments:
 *      Dict(<str -> int>): A color in rgb format.
 *
 * Return:
 *      hex (str): A color in hexadecimal format
*/
function rgb2hex(rgb) {
    function component2Hex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return component2Hex(rgb['r']) + component2Hex(rgb['g']) + component2Hex(rgb['b']);
}

function hsl2hex(hsl) {
    return rgb2hex(hsl2rgb(hsl));
}

function hex2hsl(hex) {
    return rgb2hsl(hex2rgb(hex));
}

function _remove_alpha(colorDefault) {
    var res = {};
    var k;
    for (k in colorDefault){
        if (k != 'a') {
            res[k] = colorDefault[k];
        }
    }
    return res;
}

function clamp(num, minimum, maximum) {
    if (num < minimum) {
        return minimum;
    } else if (num > maximum) {
        return maximum;
    } else {
        return num;
    }
}

function parseColor(colorStr) {
    colorStr = colorStr.replace(/ /gi, '');

    var transparent = colorStr.match('transparent');
    if (transparent)
        return new UserColor({format: 'rgba', color:{r: 0, g: 0, b: 0, a: 0}});

    var formatHex = colorStr.match('#[0-9a-fA-F]{6}');
    if (formatHex)
        return new UserColor({color: formatHex[0], format: 'hex'});

    var numbers = colorStr.match(/[0-9]+/gi),
    alpha = colorStr.match(/[0-1]\.[0-9]+/);

    if (! numbers || numbers.length < 3) {
        return false;
    }
    if (! alpha) {
        alpha = [parseInt(numbers[3])];
    }
    alpha[0] = Math.round(alpha[0] * 100) / 100;
    if (colorStr.match('rgb\\([0-9]+,[0-9]+,[0-9]+\\)')) {
        return new UserColor({color: {r: parseInt(numbers[0]),
                                     g: parseInt(numbers[1]),
                                     b: parseInt(numbers[2])},
                            format: 'rgb'});
    } else if (colorStr.match('rgba\\([0-9]+,[0-9]+,[0-9]+,[0-1](\.[0-9]+)?\\)')) {
        return new UserColor({color: {r: parseInt(numbers[0]),
                                     g: parseInt(numbers[1]),
                                     b: parseInt(numbers[2]),
                                     a: parseFloat(alpha[0])},
                            format: 'rgba'});
    } else if (colorStr.match('hsl\\([0-9]+,[0-9]+%,[0-9]+%\\)')) {
        return new UserColor({color: {h: parseInt(numbers[0]),
                                     s: parseInt(numbers[1]),
                                     l: parseInt(numbers[2])},
                            format: 'hsl'});
    } else if (colorStr.match('hsla\\([0-9]+,[0-9]+%,[0-9]+%,[0-1](\.[0-9]+)?\\)')) {
        return new UserColor({color: {h: parseInt(numbers[0]),
                                     s: parseInt(numbers[1]),
                                     l: parseInt(numbers[2]),
                                     a: parseFloat(alpha[0])},
                            format: 'hsla'});
    }

    return false;
}
