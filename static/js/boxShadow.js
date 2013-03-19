function BoxShadow (options) {
    this.htmlElement = options['htmlElement'] || $('#box-shadow-object');
    this.htmlCode = options['htmlCode'] || $('#box-shadow-code');
    this.horizontal = options['horizontal'] || 40;
    this.vertical = options['vertical'] || 40;
    this.blur = options['blur'] || 40;
    this.spread = options['spread'] || 0;
    this.boxColor = options['boxColor'] || new UserColor({'format': 'rgb', 'color': {r: 34, g: 54, b:12}});
    this.shadowColor = options['shadowColor'] || new UserColor({'format': 'rgba', 'color': {r: 34, g: 54, b:12, a: 1}});
    this.inset = options['inset'] || false;
}

BoxShadow.prototype.refresh = function () {
    var codeWBS = this.getWebkitBoxShadowCode();
    var codeMBS = this.getMozBoxShadowCode();
    var codeBS = this.getBoxShadowCode();

    // Change the style of the box Shadow
    this.htmlElement.css('-webkit-box-shadow', codeWBS);
    this.htmlElement.css('-moz-box-shadow', codeMBS);
    this.htmlElement.css('box-shadow', codeBS);
    this.htmlElement.css('background-color', this.boxColor.displayColor());

    // Show the code
    this.htmlCode.html('');
    this.htmlCode.append('<div>-webkit-box-shadow: ' + codeWBS + ';</div>');
    this.htmlCode.append('<div>-moz-box-shadow: ' + codeMBS + ';</div>');
    this.htmlCode.append('<div>box-shadow: ' + codeBS + ';</div>');
};

BoxShadow.prototype.getWebkitBoxShadowCode = function () {
    return _boxShadowCodeCommom(this);
};

BoxShadow.prototype.getMozBoxShadowCode = function () {
    return _boxShadowCodeCommom(this);
};

BoxShadow.prototype.getBoxShadowCode = function () {
    return _boxShadowCodeCommom(this);
};

BoxShadow.prototype.setShadowColor = function (color) {
    this.shadowColor = color;
};

BoxShadow.prototype.setBoxColor = function (color) {
    var alpha = this.boxColor.getAlpha();
    this.boxColor = color;
    this.boxColor.changeFormatColor('rgba');
    this.boxColor.color.a = alpha;
};

BoxShadow.prototype.setOpacity = function (op) {
    this.shadowColor.changeFormatColor('rgba');
    this.shadowColor.color.a = op;
};

function _getAllValuesFromPanelBoxShadow() {
    var options = {};
    options['horizontal'] = parseFloat($('#horizontal-length').val());
    options['vertical'] = parseFloat($('#vertical-length').val());
    options['blur'] = parseFloat($('#blur-radius').val());
    options['shadowColor'] = new UserColor({format: 'hex', color: $('#shadow-color').val()});
    options['boxColor'] = new UserColor({format: 'hex', color: $('#box-color').val()});
    options['opacity'] = parseFloat($('#shadow-opacity').val());
    options['inset'] = $($('#inset-button').find('.right-pos')).length == 1;
    options['spread'] = parseFloat($('#spread-field'));

    var alpha = parseFloat($('#shadow-opacity').val());
    options['shadowColor'].changeFormatColor('rgba');
    options['shadowColor'].color.a = alpha;
    return options;
}

$('body').ready(function() {
    boxShadow = new BoxShadow(_getAllValuesFromPanelBoxShadow());
    boxShadow.refresh();

    copy_text_button($('#copy-text-input'), $('#box-shadow-code'));
    // Slider bars.
    $('#slider-horizontal-bs').slider({
        value: 10,
        min: -200,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, -200, 200, $('#horizontal-length'));
            boxShadow.horizontal = val;
            boxShadow.refresh();
        }
    });

    $('#slider-vertical-bs').slider({
        value: 10,
        min: -200,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, -200, 200, $('#vertical-length'));
            boxShadow.vertical = val;
            boxShadow.refresh();
        }
    });

    $('#slider-blur-bs').slider({
        value: 10,
        min: 0,
        max: 300,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 300, $('#blur-radius'));
            boxShadow.blur = val;
            boxShadow.refresh();
        }
    });

    $('#slider-spread-field').slider({
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, -200, 200, $('#spread-field'));
            boxShadow.spread = val;
            boxShadow.refresh();
        }
    });

    $('#slider-opacity-bs').slider({
        value: 0.7,
        min: 0,
        max: 1,
        step: 0.01,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 1, $('#shadow-opacity'));
            boxShadow.setOpacity(val);
            boxShadow.refresh();
        }
    });

    $('#shadow-color-button').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            boxShadow.setShadowColor(new UserColor({format: 'hex', color: hex}));
            boxShadow.refresh();
            $('#shadow-color-button').css('background', '#' + hex);
            $('#shadow-color').val('#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            boxShadow.setShadowColor(new UserColor({format: 'hex', color: hex}));
            boxShadow.refresh();
            $('#shadow-color-button').css('background', '#' + hex);
            $('#shadow-color').val('#' + hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($('#shadow-color').val());
        },
    })
    .bind('keyup', function(){
        $(this).ColorPickerSetColor(this.value);
    });

    $('#box-color-button').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            boxShadow.setBoxColor(new UserColor({format: 'hex', color: hex}));
            boxShadow.refresh();
            $('#box-color-button').css('background', '#' + hex);
            $('#box-color').val('#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            boxShadow.setBoxColor(new UserColor({format: 'hex', color: hex}));
            boxShadow.refresh();
            $('#box-color-button').css('background', '#' + hex);
            $('#box-color').val('#' + hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($('#box-color').val());
        },
    })
    .bind('keyup', function(){
        $(this).ColorPickerSetColor(this.value);
    });
});

function _getFromField(value, min, max, elem) {
    var val, x;

    val = parseFloat(value);
    if (isNaN(val)) {
        val = 0;
    } else if (val < min) {
        val = min;
        value = min;
    } else if (val > max) {
        val = max;
        value = max;
    }
    elem.val(value);

    return val;
}

$('#horizontal-length').live('keyup', function() {
    var val = _getFromField($(this).val(), -200, 200, $('#horizontal-length'));
    if (val !== false) {
        boxShadow.horizontal = val;
        boxShadow.refresh();
        $('#slider-horizontal-bs').slider('value', val);
    }
});

$('#vertical-length').live('keyup', function () {
    var val = _getFromField($(this).val(), -200, 200, $('#vertical-length'));
    if (val !== false) {
        boxShadow.vertical = val;
        boxShadow.refresh();
        $('#slider-vertical-bs').slider('value', val);
    }
});

$('#blur-radius').live('keyup', function() {
    var val = _getFromField($(this).val(), 0, 300, $('#blur-radius'));
    if (val !== false) {
        boxShadow.blur = val;
        boxShadow.refresh();
        $('#slider-blur-bs').slider('value', val);
    }
});

$('#spread-field').live('keyup', function() {
    var val = _getFromField($(this).val(), -200, 200, $('#spread-field'));
    if (val !== false) {
        boxShadow.spread = val;
        boxShadow.refresh();
        $('#slider-spread-field').slider('value', val);
    }
});

$('#shadow-opacity').live('keyup', function () {
    var val = _getFromField($(this).val(), 0, 1, $('#shadow-opacity'));
    if (val !== false) {
        boxShadow.setOpacity(val);
        boxShadow.refresh();
        $('#slider-opacity-bs').slider('value', val);
    }
});

$('#shadow-color').live('change', function() {
    var color = new UserColor({format: 'hex', color: $(this).val()});
    boxShadow.setShadowColor(color);
    boxShadow.refresh();
});

$('#box-color').live('change', function () {
    var color = new UserColor({format: 'hex', color: $(this).val()});
    boxShadow.setBoxColor(color);
    boxShadow.refresh();
});

// $($('#inset-button').find('.right-pos')).length == 1

$('#inset-button').live('click', function () {
    var inset = $($(this).find('.right-pos')).length == 1;
    boxShadow.inset = inset;
    boxShadow.refresh();
});

$('#box-color-button').live('click', function () {
    $(this).ColorPickerShow();
});

$('#shadow-color-button').live('click', function () {
    $(this).ColorPickerShow();
});

function _boxShadowCodeCommom(bs) {
    res = '';
    if (bs.inset)
        res += 'inset ';

    res += bs.horizontal + 'px ';
    res += bs.vertical + 'px ';
    res += bs.blur + 'px ';
    res += bs.spread + 'px ';
    res += bs.shadowColor.displayColor('rgba');
    return res;
}

