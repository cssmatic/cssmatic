/* depends on css.js */

function getMostRepeated(args) {
    var count = {}, max = 0;

    for (var i = 0; i < args.length; i++) {
        count[args[i]]++;
        if (count[args[i]] > max) {
            argmax = args[i];
            max = count[args[i]];
        }
    }

    return argmax;
}

function nearestNeighborScaling(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
}

/** button js **/
var BUTTON_EDITOR_DEFAULTS = {
    'borderRadiusTL': 10,
    'borderRadiusTR': 10,
    'borderRadiusBL': 10,
    'borderRadiusBR': 10,
    'borderWidthTop': 0,
    'borderWidthLeft': 0,
    'borderWidthRight': 0,
    'borderWidthBottom': 0,
    'borderColorTop': '#000000',
    'borderColorLeft': '#000000',
    'borderColorRight': '#000000',
    'borderColorBottom': '#000000',
    'backgroundColor': '#e7a61a',
    'paddingHorizontal': 18,
    'paddingVertical': 12,
    'textFontFamily': 'sans-serif',
    'textFontSize': 10,
    'textFontWeight': false,
    'textColor': '#000000',
    'textInset': false,
    'shadowColor': '#000000',
    'shadowOffsetX': 0,
    'shadowOffsetY': 0,
    'shadowBlur': 0,
    'shadowSpread': 0,
    'bevelWidthTop': 0,
    'bevelWidthBottom': 0,
    'bevelWidthLeft': 0,
    'bevelWidthRight': 0,
    'bevelColorTop': 'rgba(255,255,255,0.3)',
    'bevelColorBottom': 'rgba(0,0,0,0.3)',
    'bevelColorLeft': 'rgba(255,255,255,0.3)',
    'bevelColorRight': 'rgba(0,0,0,0.3)'
};

function ButtonEditor(options) {
    Reactor.call(this);

    for (var key in options) {
        this[key] = options[key] || BUTTON_EDITOR_DEFAULTS[key];
    }

    this.registerEvent('refresh');
}

ButtonEditor.prototype = new ReactorCtor();

ButtonEditor.prototype.getCssNormalState = function() {
    var bs = this.borderStyle ? this.borderStyle + ' ' : '';
    var css = [
        ['border-radius', serializeCornersPx(this.borderRadiusTL, this.borderRadiusTR, this.borderRadiusBR, this.borderRadiusBL)],
        ['padding', serializeCornersPx(this.paddingVertical, this.paddingHorizontal)],
        ['background-color', this.backgroundColor],
        ['color', this.textColor],
        ['text-decoration', 'none'],
        ['display', 'inline-block'],
        ['font-size', px(this.textFontSize)],
        ['font-family', this.textFontFamily],
        ['font-weight', this.textFontWeight ? 'bold' : 'normal'],
    ];

    var borderWidths = serializeCornersPx(this.borderWidthTop, this.borderWidthLeft, this.borderWidthRight, this.borderWidthBottom);
    var borderColors = serializeCorners(this.borderColorTop, this.borderColorLeft, this.borderColorRight, this.borderColorBottom);

    if (borderWidths.indexOf(' ') === -1 && borderColors.indexOf(' ') === -1) {
        css.push(['border', borderWidths + ' solid ' + borderColors]);
    }
    else {
        css.push(['border-width', borderWidths]);
        css.push(['border-color', borderColors]);
        css.push(['border-style', 'solid']);
    }

    var boxShadowValue = [];

    var ct = this.bevelColorTop,
        cl = this.bevelColorLeft,
        cr = this.bevelColorRight,
        cb = this.bevelColorBottom,
        wt = this.bevelWidthTop,
        wl = this.bevelWidthLeft,
        wr = this.bevelWidthRight,
        wb = this.bevelWidthBottom;

    if (ct == cl && ct == cr && ct == cb && wt == wl && wt == wr && wt == wb) {
        boxShadowValue.push('inset 0 0 0 ' + px(wt) + ' ' + this.bevelColorTop);
        wt = wl = wr = wb = 0;
    }
    if (ct == cl && wt > 0 && wl > 0) {
        boxShadowValue.push('inset ' + px(wl) + ' ' + px(wt) + ' 0 0 ' + ct);
        wt = wl = 0;
    }
    if (ct == cr && wt > 0 && wr > 0) {
        boxShadowValue.push('inset ' + px(-wr) + ' ' + px(wt) + ' 0 0 ' + ct);
        wt = wr = 0;
    }
    if (cb == cl && wb > 0 && wl > 0) {
        boxShadowValue.push('inset ' + px(wl) + ' ' + px(-wb) + ' 0 0 ' + cb);
        wb = wl = 0;
    }
    if (cb == cr && wb > 0 && wr > 0) {
        boxShadowValue.push('inset ' + px(-wr) + ' ' + px(-wb) + ' 0 0 ' + cb);
        wb = wr = 0;
    }
    if (wt > 0) {
        boxShadowValue.push('inset 0 ' + px(wt) + ' 0 0 ' + ct);
        wt = 0;
    }
    if (wb > 0) {
        boxShadowValue.push('inset 0 ' + px(-wb) + ' 0 0 ' + cb);
        wb = 0;
    }
    if (wl > 0) {
        boxShadowValue.push('inset ' + px(wl) + ' 0 0 0 ' + cl);
        wl = 0;
    }
    if (wr > 0) {
        boxShadowValue.push('inset ' + px(-wr) + ' 0 0 0 ' + cr);
        wr = 0;
    }

    var ix = '0';
    if (this.shadowColor) {
        boxShadowValue.push(px(this.shadowOffsetX) + ' ' + px(this.shadowOffsetY) + ' ' + px(this.shadowBlur) + ' ' + px(this.shadowSpread) + ' ' + this.shadowColor);
    }

    if (boxShadowValue) {
        css.push(['box-shadow', boxShadowValue.join(', ')]);
    }

    if (this.textInset) {
        css.push(['text-shadow', '1px 1px 0 rgba(255,255,255,0.5)']);
    }

    return css;
};

ButtonEditor.prototype.defaultHoverProperties = function() {
    return {
        'backgroundColor': shadeColor(this.backgroundColor, -0.05),
        'textColor': shadeColor(this.textColor, 0.2),
    };
};

ButtonEditor.prototype.defaultActiveProperties = function() {
    return {
        'backgroundColor': shadeColor(this.backgroundColor, -0.05),
        'textColor': shadeColor(this.textColor, 0.2),
    };
};

ButtonEditor.prototype.getCssHoverState = function() {
    var css = [];
    var defaultProperties = this.defaultHoverProperties();
    var bc = this.hoverBackgroundColor || defaultProperties.backgroundColor;
    var tc = this.hoverTextColor || defaultProperties.textColor;

    if (bc !== this.backgroundColor) {
        css.push(['background-color', bc]);
    }

    if (tc !== this.textColor) {
        css.push(['color', tc]);
    }

    return css;
};

ButtonEditor.prototype.getCssActiveState = function() {
    var css = [];
    var defaultProperties = this.defaultActiveProperties();
    var bc = this.hoverBackgroundColor || defaultProperties.backgroundColor;
    var tc = this.hoverTextColor || defaultProperties.textColor;

    if (bc !== this.backgroundColor) {
        css.push(['background-color', bc]);
    }

    if (tc !== this.textColor) {
        css.push(['color', tc]);
    }

    return css;
};

ButtonEditor.prototype.getCss = function() {
    var normalCss = this.getCssNormalState();
    var hoverCss = this.getCssHoverState();
    var activeCss = this.getCssActiveState();
    return {'normal': normalCss, 'hover': hoverCss, 'active': activeCss};
};

ButtonEditor.prototype.refresh = function() {
    var css = this.getCss();
    css['normal'] = expandCss(css['normal']);
    css['hover'] = expandCss(css['hover']);
    css['active'] = expandCss(css['active']);
    this.buttonNormal.removeAttr('style');
    applyCss(this.buttonNormal, css['normal']);
    this.buttonHover.removeAttr('style');
    applyCss(this.buttonHover, css['normal']);
    applyCss(this.buttonHover, css['hover']);
    this.buttonActive.removeAttr('style');
    applyCss(this.buttonActive, css['normal']);
    applyCss(this.buttonActive, css['active']);
    var strCss = cssToHtml(css, 'button');
    this.htmlCode.html(strCss);
    this.dispatchEvent('refresh', this);
};

ButtonEditor.prototype.setAllCorners = function(radius) {
    this.borderRadiusTL = radius;
    this.borderRadiusTR = radius;
    this.borderRadiusBL = radius;
    this.borderRadiusBR = radius;
};

ButtonEditor.prototype.setBorderColor = function(color) {
    this.borderColorTop = color;
    this.borderColorLeft = color;
    this.borderColorRight = color;
    this.borderColorBottom = color;
};

ButtonEditor.prototype.setBorderWidth = function(width) {
    this.borderWidthTop = width;
    this.borderWidthLeft = width;
    this.borderWidthRight = width;
    this.borderWidthBottom = width;
};

ButtonEditor.prototype.setBevelWidth = function(size) {
    this.bevelWidthTop = size;
    this.bevelWidthBottom = size;
    this.bevelWidthLeft = size;
    this.bevelWidthRight = size;
};

ButtonEditor.prototype.setBevelColor = function(color) {
    this.bevelColorTop = color;
    this.bevelColorBottom = color;
    this.bevelColorLeft = color;
    this.bevelColorRight = color;
};

function readButtonEditorValues(buttonEditorControlsContainer, buttonNormal, buttonHover, buttonActive) {
    var options = {};
    var base = buttonEditorControlsContainer;

    options['htmlCode'] = $('#button-code');
    options['buttonNormal'] = buttonNormal;
    options['buttonHover'] = buttonHover;
    options['buttonActive'] = buttonActive;
    options['borderRadiusTL'] = parseFloat(base.find('[name=border-radius-tl]').val());
    options['borderRadiusTR'] = parseFloat(base.find('[name=border-radius-tr]').val());
    options['borderRadiusBL'] = parseFloat(base.find('[name=border-radius-bl]').val());
    options['borderRadiusBR'] = parseFloat(base.find('[name=border-radius-br]').val());
    options['borderWidth'] = parseFloat(base.find('[name=border-width]').val());
    options['borderWidthTop'] = base.find('[name=border-width-top]').val();
    options['borderWidthLeft'] = base.find('[name=border-width-left]').val();
    options['borderWidthRight'] = base.find('[name=border-width-right]').val();
    options['borderWidthBottom'] = base.find('[name=border-width-bottom]').val();
    options['borderColorTop'] = base.find('[name=border-color-top]').val();
    options['borderColorLeft'] = base.find('[name=border-color-left]').val();
    options['borderColorRight'] = base.find('[name=border-color-right]').val();
    options['borderColorBottom'] = base.find('[name=border-color-bottom]').val();
    options['bevelWidthTop'] = parseFloat(base.find('[name=bevel-width-top]').val());
    options['bevelWidthLeft'] = parseFloat(base.find('[name=bevel-width-left]').val());
    options['bevelWidthRight'] = parseFloat(base.find('[name=bevel-width-right]').val());
    options['bevelWidthBottom'] = parseFloat(base.find('[name=bevel-width-bottom]').val());
    options['bevelColorTop'] = parseFloat(base.find('[name=bevel-color-top]').val());
    options['bevelColorLeft'] = parseFloat(base.find('[name=bevel-color-left]').val());
    options['bevelColorRight'] = parseFloat(base.find('[name=bevel-color-right]').val());
    options['bevelColorBottom'] = parseFloat(base.find('[name=bevel-color-bottom]').val());
    options['textColor'] = base.find('[name=text-color]').val();
    options['textFontFamily'] = base.find('[name=text-font-family]').val();
    options['textFontSize'] = parseFloat(base.find('[name=text-font-size]').val());
    options['textFontWeight'] = base.find('[name=text-font-weight]').prop('checked');
    options['textInset'] = base.find('[name=text-inset]').prop('checked');
    options['shadowSize'] = 4;
    options['shadowDirection'] = DIRECTION_BOTTOM | DIRECTION_RIGHT;
    options['shadowColor'] = 'rgba(0,0,0,.5)';
    options['backgroundColor'] = base.find('[name=background-color]').val();
    options['shadowColor'] = base.find('[name=shadow-color]').val();
    options['shadowOffsetX'] = parseFloat(base.find('[name=shadow-offset-x]').val());
    options['shadowOffsetY'] = parseFloat(base.find('[name=shadow-offset-y]').val());
    options['shadowBlur'] = parseFloat(base.find('[name=shadow-blur]').val());
    options['shadowSpread'] = parseFloat(base.find('[name=shadow-spread]').val());
    options['paddingHorizontal'] = parseFloat(base.find('[name=padding-horizontal]').val());
    options['paddingVertical'] = parseFloat(base.find('[name=padding-vertical]').val());

    options['hoverBackgroundColor'] = base.find('[name=hover-background-color]').val();
    options['hoverTextColor'] = base.find('[name=hover-text-color]').val();
    options['hoverBorderColor'] = base.find('[name=hover-border-color]').val();

    options['activeBackgroundColor'] = base.find('[name=active-background-color]').val();
    options['activeTextColor'] = base.find('[name=active-text-color]').val();
    options['activeBorderColor'] = base.find('[name=active-border-color]').val();

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

function getChangeBorderRadiusCallback(name)
{
    return function() {
        var val = _getFromField($(this).val(), 0, 50, $('#' + name));
        buttonEditor.borderRadiusTL = val;
        buttonEditor.refresh();

        $('#slider-' + name).slider('value', val);
    };
}

function displayZoomedCorners(buttonEditor)
{
    var buttonStyle = buttonEditor.buttonNormal.attr('style');
    var canvasTL = document.getElementById('canvas-corner-tl');
    var ctxTL = canvasTL.getContext('2d');
    var canvasTR = document.getElementById('canvas-corner-tr');
    var ctxTR = canvasTR.getContext('2d');
    var canvasBL = document.getElementById('canvas-corner-bl');
    var ctxBL = canvasBL.getContext('2d');
    var canvasBR = document.getElementById('canvas-corner-br');
    var ctxBR = canvasBR.getContext('2d');

    ctxTL.clearRect(0, 0, canvasTL.width, canvasTL.height);
    ctxTR.clearRect(0, 0, canvasTR.width, canvasTR.height);
    ctxBL.clearRect(0, 0, canvasBL.width, canvasBL.height);
    ctxBR.clearRect(0, 0, canvasBR.width, canvasBR.height);

    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
               '<foreignObject width="100%" height="100%">' +
               '<div xmlns="http://www.w3.org/1999/xhtml" style="padding: 3px">' +
               '<div style="width: 94px; height: 94px; box-sizing: border-box; ' + buttonStyle + '"></div>' +
               '</div>' +
               '</foreignObject>' +
               '</svg>';

    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svg);

    img.onload = function () {
        ctxTL.save();
        nearestNeighborScaling(ctxTL);
        ctxTL.scale(16, 16);
        ctxTL.drawImage(img, 0, 0);
        ctxTL.restore();

        ctxTR.save();
        nearestNeighborScaling(ctxTR);
        ctxTR.scale(16, 16);
        ctxTR.drawImage(img, -90, 0);
        ctxTR.restore();

        ctxBL.save();
        nearestNeighborScaling(ctxBL);
        ctxBL.scale(16, 16);
        ctxBL.drawImage(img, 0, -90);
        ctxBL.restore();

        ctxBR.save();
        nearestNeighborScaling(ctxBR);
        ctxBR.scale(16, 16);
        ctxBR.drawImage(img, -90, -90);
        ctxBR.restore();

        DOMURL.revokeObjectURL(url);
    };

    img.src = url;
}

$('body').ready(function() {
    $('input[type="range"]').rangeslider();
    $('input[type="range"]').rangehover();

    var buttonEditorControlsContainer = $('.bt-state-normal');
    var buttonNormal = $('#button-normal');
    var buttonHover = $('#button-hover');
    var buttonActive = $('#button-active');
    var buttonEditorValues = readButtonEditorValues(buttonEditorControlsContainer, buttonNormal, buttonHover, buttonActive);
    var buttonEditor = new ButtonEditor(buttonEditorValues);
    buttonEditor.refresh();

    copy_text_button($('#copy-text-input'), $('#button-code'));

    /* Border Style */
    $('#select-border').live('change', function () {
        var val = $(this).val();
        buttonEditor.borderStyle = val;
        buttonEditor.refresh();
    });

    var borderRadiusNames = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    for (var i in borderRadiusNames) {
        $('#' + borderRadiusNames[i]).live('keyup', getChangeBorderRadiusCallback(borderRadiusNames[i]));
    }

    /* Border Radius */
    $('[name=border-radius]').on('change keyup paste input', function(event) {
        var val = event.currentTarget.value;
        $("[name|=border-radius]").val(val);
        buttonEditor.setAllCorners(val);
        buttonEditor.refresh();
    });

    $('[name=border-radius-tl]').on('change keyup paste input', function(event) {
        buttonEditor.borderRadiusTL = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-radius-tr]').on('change keyup paste input', function(event) {
        buttonEditor.borderRadiusTR = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-radius-bl]').on('change keyup paste input', function(event) {
        buttonEditor.borderRadiusBL = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-radius-br]').on('change keyup paste input', function(event) {
        buttonEditor.borderRadiusBR = event.currentTarget.value;
        buttonEditor.refresh();
    });

    /* border width and color */
    $('[name=border-color]').live('change', function () {
        var val = event.currentTarget.value;
        $("[name|=border-color]").val(val);
        buttonEditor.setBorderColor(val);
        buttonEditor.refresh();
    });

    $('[name=border-color-top]').on('change keyup paste input', function(event) {
        buttonEditor.borderColorTop = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-color-left]').on('change keyup paste input', function(event) {
        buttonEditor.borderColorLeft = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-color-right]').on('change keyup paste input', function(event) {
        buttonEditor.borderColorRight = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-color-bottom]').on('change keyup paste input', function(event) {
        buttonEditor.borderColorBottom = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-width]').live('change', function (event) {
        var val = event.currentTarget.value;
        $("[name|=border-width]").val(val);
        buttonEditor.setBorderWidth(val);
        buttonEditor.refresh();
    });

    $('[name=border-width-top]').on('change keyup paste input', function(event) {
        buttonEditor.borderWidthTop = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-width-left]').on('change keyup paste input', function(event) {
        buttonEditor.borderWidthLeft = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-width-right]').on('change keyup paste input', function(event) {
        buttonEditor.borderWidthRight = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=border-width-bottom]').on('change keyup paste input', function(event) {
        buttonEditor.borderWidthBottom = event.currentTarget.value;
        buttonEditor.refresh();
    });

    /* background */
    $('[name=background-color]').live('change', function () {
        buttonEditor.backgroundColor = $(this).val();
        buttonEditor.refresh();
    });

    /* bevel */
    $('[name=bevel-width]').live('change', function () {
        var val = event.currentTarget.value;
        $("[name|=bevel-width]").val(val);
        buttonEditor.setBevelWidth(val);
        buttonEditor.refresh();
    });

    $('[name=bevel-width-top]').on('change keyup paste input', function(event) {
        buttonEditor.bevelWidthTop = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-width-bottom]').on('change keyup paste input', function(event) {
        buttonEditor.bevelWidthBottom = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-width-left]').on('change keyup paste input', function(event) {
        buttonEditor.bevelWidthLeft = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-width-right]').on('change keyup paste input', function(event) {
        buttonEditor.bevelWidthRight = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-color]').live('change', function () {
        var val = event.currentTarget.value;
        $("[name|=bevel-color]").val(val);
        buttonEditor.setBevelColor(val);
        buttonEditor.refresh();
    });

    $('[name=bevel-color-top]').on('change keyup paste input', function(event) {
        buttonEditor.bevelColorTop = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-color-bottom]').on('change keyup paste input', function(event) {
        buttonEditor.bevelColorBottom = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-color-left]').on('change keyup paste input', function(event) {
        buttonEditor.bevelColorLeft = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=bevel-color-right]').on('change keyup paste input', function(event) {
        buttonEditor.bevelColorRight = event.currentTarget.value;
        buttonEditor.refresh();
    });

    /* text color and font */
    $('[name=text-color]').on('change', function(event) {
        buttonEditor.textColor = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=text-font-size]').on('change', function(event) {
        buttonEditor.textFontSize = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=text-font-weight]').on('change', function(event) {
        buttonEditor.textFontWeight = $(event.currentTarget).prop('checked');
        buttonEditor.refresh();
    });

    $('[name=text-inset]').on('change', function(event) {
        buttonEditor.textInset = $(event.currentTarget).prop('checked');
        buttonEditor.refresh();
    });

    /* box shadow */
    $('[name=shadow-color]').on('change', function(event) {
        buttonEditor.shadowColor = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=shadow-offset-x]').on('change', function(event) {
        buttonEditor.shadowOffsetX = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=shadow-offset-y]').on('change', function(event) {
        buttonEditor.shadowOffsetY = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=shadow-blur]').on('change', function(event) {
        buttonEditor.shadowBlur = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=shadow-spread]').on('change', function(event) {
        buttonEditor.shadowSpread = event.currentTarget.value;
        buttonEditor.refresh();
    });

    /* padding */
    $('[name=padding-horizontal]').on('input', function(event) {
        buttonEditor.paddingHorizontal = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('[name=padding-vertical]').on('input', function(event) {
        buttonEditor.paddingVertical = event.currentTarget.value;
        buttonEditor.refresh();
    });

    $('#br-background-color-button').live('click', function () {
        $(this).ColorPickerShow();
    });

    $('#br-color-button').live('click', function () {
        $(this).ColorPickerShow();
    });

    $('#br-background-color-button').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            buttonEditor.background = '#' + hex;
            buttonEditor.refresh();
            $('#br-background-color').val('#' + hex);
            $('#br-background-color-button').css('background-color', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            buttonEditor.background = '#' + hex;
            buttonEditor.refresh();
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
            buttonEditor.borderColor = '#' + hex;
            buttonEditor.refresh();
            $('#br-color').val('#' + hex);
            $('#br-color-button').css('background-color', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            buttonEditor.borderColor = '#' + hex;
            buttonEditor.refresh();
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

    $('select.fonts').fontSelector({
      fontChange: function(e, ui) {
        buttonEditor.textFontFamily = ui.font;
        buttonEditor.refresh();
      }
    });

    /* corners zoom */
    // buttonEditor.addEventListener('refresh', displayZoomedCorners);

    buttonEditor.dispatchEvent('refresh', buttonEditor);
    var gradientEditor = new GradientEditor($('#background-gradient').get(0));
});
