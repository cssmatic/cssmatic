if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

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

function applyCss(element, css) {
    for (var i = 0; i < css.length; i++) {
        element.css(css[i][0], css[i][1]);
    }
}

function serializeCss(css) {
    var a = [];
    for (var i = 0; i < css.length; i++) {
        a.push(css[i][0] + ': ' + css[i][1] + ';');
    }
    return '<div>' + a.join('</div>\n<div>') + '</div>';
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
                return px(t);
            }
            else {
                return px(t) + ' ' + px(r);
            }
        }
        else {
            return px(t) + ' ' + px(r) + ' ' + px(b);
        }
    }
    else {
        return px(t) + ' ' + px(r) + ' ' + px(b) + ' ' + px(l);
    }
}

/** random utils **/

function px(i) {
    return parseInt(i, 10) + 'px';
}

function CssColorStop(color, percentage) {
    this.color = color;
    this.percentage = percentage;
}

var DIRECTION_TOP = 1,
    DIRECTION_BOTTOM = 2,
    DIRECTION_LEFT = 4,
    DIRECTION_RIGHT = 8;

function serializeDirection(direction) {
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
    if (direction <= 0 ||
        direction > (DIRECTION_RIGHT | DIRECTION_BOTTOM) ||
        (direction & (DIRECTION_TOP | DIRECTION_BOTTOM)) ||
        (direction & (DIRECTION_LEFT | DIRECTION_RIGHT))) {
        alert("Invalid direction " + direction);
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

        webkitColors.push('color_stop(' + (cs.percentage / 100) + '% ' + cs.color + ')');
        if ((i === 0 && cs.percentage === 0) || (i === last_i && cs.percentage === 100)) {
            colors.push(cs.color);
        }
        else {
            colors.push(cs.color + ' ' + cs.percentage);
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

/** button js **/

function Button(options) {
    this.htmlElement = options['htmlElement'] || $('#button-panel');
    this.htmlCode = options['htmlCode'] || $('#button-code');
    this.borderRadiusTL = options['borderRadiusTL'] || 10;
    this.borderRadiusTR = options['borderRadiusTR'] || 10;
    this.borderRadiusBL = options['borderRadiusBL'] || 10;
    this.borderRadiusBR = options['borderRadiusBR'] || 10;
    this.borderWidth = options['borderWidth'] || 0;
    this.borderColor = options['borderColor'] ||'#000000';
    this.borderBackground = options['borderBackground'] || '#e7a61a';
    this.paddingHorizontal = options['paddingHorizontal'] || 18;
    this.paddingVertical = options['paddingVertical'] || 12;
    this.textColor = options['textColor'] || '#000000';
    this.textShadowColor = options['textShadow'] ? 'rgba(255,255,255,0.5)' : '';
    this.reliefWidth = options['reliefWidth'] || 1;
    this.reliefTopColor = options['reliefTopColor'] || 'rgba(255,255,255,0.3)';
    this.reliefBottomColor = options['reliefBottomColor'] || 'rgba(0,0,0,0.3)';
    this.shadowSize = options['shadowSize'] || 0;
    this.shadowDirection = options['shadowDirection'] || (DIRECTION_BOTTOM | DIRECTION_RIGHT);
    this.shadowColor = options['shadowColor'] || 'rgba(0,0,0,0.5)';
}

Button.prototype.getCss = function() {
    var bs = this.borderStyle ? this.borderStyle + ' ' : '';
    var css = [
        ['border-radius', serializeCorners(this.borderRadiusTL, this.borderRadiusTR, this.borderRadiusBR, this.borderRadiusBL)],
        ['padding', serializeCorners(this.paddingVertical, this.paddingHorizontal)],
        ['border', this.borderWidth === 0 ? '0' : (px(this.borderWidth) + ' solid ' + this.borderColor)],
        ['background-color', this.borderBackground],
        ['color', this.textColor],
        ['text-decoration', 'none'],
    ];

    var boxShadowValue = [];
    if (this.reliefTopColor) {
        boxShadowValue.push('inset ' + px(this.reliefWidth) + ' ' + px(this.reliefWidth) + ' 0 0 ' + this.reliefTopColor);
    }
    if (this.reliefBottomColor) {
        boxShadowValue.push('inset ' + px(-this.reliefWidth) + ' ' + px(-this.reliefWidth) + ' 0 0 ' + this.reliefBottomColor);
    }
    var ix = '0';
    if (this.shadowSize) {
        if (this.shadowDirection & DIRECTION_LEFT) {
            ix = px(-this.shadowSize);
        }
        else if (this.shadowDirection & DIRECTION_RIGHT) {
            ix = px(this.shadowSize);
        }
        boxShadowValue.push(ix + ' ' + px(this.shadowSize) + ' ' + px(this.shadowSize / 2) + ' ' + px(this.shadowSize / 2) + ' ' + this.shadowColor);
    }
    if (boxShadowValue) {
        css.push(['box-shadow', boxShadowValue.join(', ')]);
    }

    if (this.textShadowColor) {
        css.push(['text-shadow', '1px 1px 0 ' + this.textShadowColor]);
    }

    return css;
};

Button.prototype.refresh = function () {
    var css = this.getCss();
    css = expandCss(css);
    applyCss(this.htmlElement, css);
    var strCss = serializeCss(css);
    this.htmlCode.html(strCss);
};

Button.prototype.setAllCorners = function (radius) {
    this.borderRadiusTL = radius;
    this.borderRadiusTR = radius;
    this.borderRadiusBL = radius;
    this.borderRadiusBR = radius;
};

function _getAllValuesFromPanelButton(state) {
    var options = {};
    var base = $('.bt-state-' + state);
    options['borderRadiusTL'] = parseFloat(base.find('[name=border-radius-tl]').val());
    options['borderRadiusTR'] = parseFloat(base.find('[name=border-radius-tr]').val());
    options['borderRadiusBL'] = parseFloat(base.find('[name=border-radius-bl]').val());
    options['borderRadiusBR'] = parseFloat(base.find('[name=border-radius-br]').val());
    options['borderWidth'] = parseFloat(base.find('[name=border-width]').val());
    options['borderColor'] = base.find('[name=border-color]').val();
    options['reliefWidth'] = parseFloat(base.find('[name=bevel-width]').val());
    options['reliefBottomColor'] = parseFloat(base.find('[name=bevel-color-br]').val());
    options['reliefTopColor'] = parseFloat(base.find('[name=bevel-color-tl]').val());
    options['textShadow'] = true;
    options['shadowSize'] = 4;
    options['shadowDirection'] = DIRECTION_BOTTOM | DIRECTION_RIGHT;
    options['shadowColor'] = 'rgba(0,0,0,.5)';
    return options;
}

function _getFromField(value, min, max, elem) {
    var val = parseFloat(value);
    if (isNaN(val) || val < min) {
        val = 0;
    } else if (val > max) {
        val = max;
    }

    if (elem)
        elem.val(val);

    return val;
}

$('body').ready(function() {
    buttonSample = new Button(_getAllValuesFromPanelButton('normal'));
    buttonSample.refresh();

    copy_text_button($('#copy-text-input'), $('#button-code'));

    /* Border Style */
    $('#select-border').live('change', function () {
        var val = $(this).val();
        buttonSample.borderStyle = val;
        buttonSample.refresh();
    });

    /* Border Radius */
    $('#slider-all-corners').slider({
        value: 4,
        min: 0,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 50);
            buttonSample.setAllCorners(val);
            buttonSample.refresh();

            $('#all-corners').val(val);
            $('#top-left').val(val);
            $('#top-right').val(val);
            $('#bottom-left').val(val);
            $('#bottom-right').val(val);
            $('#slider-top-left').slider('value', val);
            $('#slider-top-right').slider('value', val);
            $('#slider-bottom-left').slider('value', val);
            $('#slider-bottom-right').slider('value', val);
        }
    });

    $('#slider-top-left').slider({
        value: 4,
        min: 0,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 50, $('#top-left'));
            buttonSample.borderRadiusTL = val;
            buttonSample.refresh();
        }
    });

    $('#slider-top-right').slider({
        value: 4,
        min: 0,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 50, $('#top-right').val(val));
            buttonSample.borderRadiusTR = val;
            buttonSample.refresh();
        }
    });

    $('#slider-bottom-left').slider({
        value: 4,
        min: 0,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 50, $('#bottom-left'));
            buttonSample.borderRadiusBL = val;
            buttonSample.refresh();
        }
    });

    $('#slider-bottom-right').slider({
        value: 4,
        min: 0,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 50, $('#bottom-right'));
            buttonSample.borderRadiusBR = val;
            buttonSample.refresh();
        }
    });

    $('#all-corners').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 50, $('#all-corners'));
        buttonSample.setAllCorners(val);
        buttonSample.refresh();

        $('#slider-all-corners').slider('value', val);
        $('#top-left').val(val);
        $('#top-right').val(val);
        $('#bottom-left').val(val);
        $('#bottom-right').val(val);
        $('#slider-top-left').slider('value', val);
        $('#slider-top-right').slider('value', val);
        $('#slider-bottom-left').slider('value', val);
        $('#slider-bottom-right').slider('value', val);
    });

    $('#top-left').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 50, $('#top-left'));
        buttonSample.borderRadiusTL = val;
        buttonSample.refresh();

        $('#slider-top-left').slider('value', val);
    });

    $('#top-right').live('keyup', function () {
        var val = _getFromField($(this).val(), 0, 50, $('#top-right'));
        buttonSample.borderRadiusTR = val;
        buttonSample.refresh();

        $('#slider-top-right').slider('value', val);
    });

    $('#bottom-left').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 50, $('#bottom-left'));
        buttonSample.borderRadiusBL = val;
        buttonSample.refresh();

        $('#slider-bottom-left').slider('value', val);
    });

    $('#bottom-right').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 50, $('#bottom-right'));
        buttonSample.borderRadiusBR = val;
        buttonSample.refresh();

        $('#slider-bottom-right').slider('value', val);
    });

    /* Border Width */
    $('#slider-border-width').slider({
        value: 0,
        min: 0,
        max: 50,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 50, $('#border-width'));
            buttonSample.borderWidth = val;
            buttonSample.refresh();
        }
    });

    $('#border-width').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 50, $('#border-width'));
        buttonSample.borderWidth = val;
        buttonSample.refresh();

        $('#slider-border-width').slider('value', val);
    });

    /* Color (Border and background) */
    $('#br-color').live('change', function () {
        buttonSample.borderColor = $(this).val();
        buttonSample.refresh();
        $('#br-color-button').css('background-color', '#' + $(this).val());
    });

    $('#br-background-color').live('change', function () {
        buttonSample.borderBackground = $(this).val();
        buttonSample.refresh();
        $('#br-background-color-button').css('background-color', '#' + $(this).val());
    });

    $('#br-background-color-button').live('click', function () {
        $(this).ColorPickerShow();
    });

    $('#br-color-button').live('click', function () {
        $(this).ColorPickerShow();
    });

    $('#br-background-color-button').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            buttonSample.borderBackground = '#' + hex;
            buttonSample.refresh();
            $('#br-background-color').val('#' + hex);
            $('#br-background-color-button').css('background-color', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            buttonSample.borderBackground = '#' + hex;
            buttonSample.refresh();
            $('#br-background-color').val('#' + hex);
            $('#br-background-color-button').css('background-color', '#' + hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($('#br-background-color').val());
        },
    })
    .bind('keyup', function(){
        $(this).ColorPickerSetColor(this.value);
    });

    $('#br-color-button').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            buttonSample.borderColor = '#' + hex;
            buttonSample.refresh();
            $('#br-color').val('#' + hex);
            $('#br-color-button').css('background-color', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            buttonSample.borderColor = '#' + hex;
            buttonSample.refresh();
            $('#br-color').val('#' + hex);
            $('#br-color-button').css('background-color', '#' + hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($('#br-color').val());
        },
    })
    .bind('keyup', function(){
        $(this).ColorPickerSetColor(this.value);
    });
});
