

function firstLoad() {
    var hash = window.location.hash;
    if (hash && hash.length > 0) {
        hash = unescape(hash);
        hash = hash.replace(/\\/g, '');
        gr = new GradientCSS({'css': hash});
        if (! gr.parse) {
            gr = loadGradient($('#load-grad-1'), 'horizontal', 'rgba');
        }
    } else {
        gr = loadGradient($('#load-grad-1'), 'horizontal', 'rgba');
    }
    return gr;
}

/***********************************************
 **               EVENTS
 ***********************************************
**/
$(document).ready(function() {
    if ($.browser.msie) {
        var msg = 'Looks like your browser doesn\'t fully support CSS gradients.';
        msg += 'You need a recent version of Firefox, Chrome or Safari to use this tool.';
        alert(msg);
    }

    // Init
    addAMark = true;
    gradient = firstLoad();
    gradient.show();

    // colorpicker component
    $('#' + COLOR_BUTTON_ID).ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            $(el).val(hex);
            $(el).ColorPickerHide();
            $(el).ColorPickerSetColor(hex);
            updateInfo(new UserColor({format: 'hex', color: hex}));
            $('#' + COLOR_INPUT_ID).val('#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            $(el).val(hex);
            $(el).ColorPickerHide();
            $(el).ColorPickerSetColor(hex);
            updateInfo(new UserColor({format: 'hex', color: hex}));
            $('#' + COLOR_INPUT_ID).val('#' + hex);
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor(this.value);
        },
        onShow: function (colpkr) {
            var act = _getActiveElement('color');
            var left = act.offset().left + 20;
            var top = act.offset().top + 20;
            $(colpkr).css('top', top + 'px');
            $(colpkr).css('left', left + 'px');
        },
        onHide: function () {
            var colorHex = _getActiveElement('color').attr('color');
        }
    })
    
    .bind('keyup', function(){
        $(this).ColorPickerSetColor(this.value);
    });

    sliderBarsColorAndOpacity();
    sliderBarsOpacityEditor();
    sliderBarsHSL();

    // Disable panels and select the format RGBA by default.
    $('#' + COLOR_FORMAT_ID + ' option[value=rgba]')[0].selected = true;
    _resetPanel();
    _importAllGradientsFromCookies();
    copy_text_button($('#copy-text-input'), $('#css-code-content'));
});

$('.' + STOP_MARKER_COLOR_CLASS).live('click', function(e){
    gradient.saveHSLStops();
    addAMark = false;
    
    // Active Element
    _getActiveElement('color').removeClass(ACTIVE_CLASS);
    $(this).addClass(ACTIVE_CLASS);

    // Refresh panel
    _selectAMark('color');
    $('#' + COLOR_BUTTON_ID).ColorPickerShow();
});

$('.' + STOP_MARKERS_COLOR_CLASS).live('click', function(e) {
    if (addAMark) {
        gradient.saveHSLStops();

        // Create an object UserColor
        var position = _calculatePosition(e.clientX - (this.offsetParent.offsetLeft + this.offsetLeft),
                                          gradient.widthDefault);
        var colorString = $('#' + COLOR_BUTTON_ID).val();
        var color;

        if (colorString) {
            color = new UserColor({'color': $('#' + COLOR_BUTTON_ID).val(), 'format': 'hex'});
        } else {
            color = gradient.colorStop[0].color.clone();
        }
        color.changeFormatColor(gradient.colorDefault.format);

        // Desactivate all the marks.
        _getActiveElement('color').removeClass(ACTIVE_CLASS);

        // Add the created object to the gradient.
        gradient.addStopMarker('color', gradient.colorStop, {'color': color, 'location': position});
        gradient.show();

        // Refresh panel
        _selectAMark('color');
    }
    addAMark = true;
});

$('.' + STOP_MARKER_OPACITY_CLASS).live('click', function(e) {
    gradient.saveHSLStops();
    addAMark = false;

    _getActiveElement('opacity').removeClass(ACTIVE_CLASS);
    $(this).addClass(ACTIVE_CLASS);

    _selectAMark('opacity', e.clientX);
    e.stopPropagation();
});

$('.' + STOP_MARKERS_OPACITY_CLASS).live('click', function(e) {
    if (addAMark) {
        gradient.saveHSLStops();
        // e.offsetLeft is null in firefox
        var position = _calculatePosition(e.clientX - (this.offsetParent.offsetLeft + this.offsetLeft),
                                          gradient.widthDefault);
        var op = $('#' + OPACITY_VALUE_ID).val();
        var opacityValue;

        if (op == 0) {
            opacityValue = 0;
        } else {
            opacityValue = parseFloat(op) / 100.0 || 1;
        }

        _getActiveElement('opacity').removeClass(ACTIVE_CLASS);
        gradient.addStopMarker('opacity', gradient.opacityStop, {'opacity': opacityValue,
            'location': position});

        gradient.format = _changeFormatWhenAlpha(gradient, $('#' + COLOR_FORMAT_ID).val());
        $('#' + COLOR_FORMAT_ID + ' option[value=' + gradient.format + ']')[0].selected = true;
        gradient.show();

        _selectAMark('opacity', e.clientX);
        e.stopPropagation();
    }
    addAMark = true;
});


$('#' + COLOR_BUTTON_ID).live('click', function(e) {
    gradient.saveHSLStops();
    $('#' + COLOR_BUTTON_ID).ColorPickerShow();
});

$('#' + OPACITY_DELETE_ID).live('click', function (e) {
    gradient.saveHSLStops();
    if (opacityField) {
        opacityField = false;
        return false;
    }

    var activeElement = $('.' + STOP_MARKERS_OPACITY_CLASS + ' .' + ACTIVE_CLASS);
    if (activeElement.length == 0) {
        return false;
    }

    var location = parseInt(activeElement.attr('position'));
    if (location || location == 0) {
        if (gradient.removeStopMarker('opacity', gradient.opacityStop, location)) {
            gradient.show();
        }
    }
    return false;
});

$('#' + COLOR_DELETE_ID).live('click', function (e) {
    gradient.saveHSLStops();

    var activeElement = $('.' + STOP_MARKERS_COLOR_CLASS + ' .' + ACTIVE_CLASS);
    if (activeElement.length === 0) {
        return false;
    }

    var location = parseInt(activeElement.attr('position'));
    if (location || location == 0) {
        if (gradient.removeStopMarker('color', gradient.colorStop, location)) {
            gradient.show();
            activeElement.remove();
        }
    }
    return false;
});

$('.' + ORIENTATION_HORIZONTAL_CLASS).live('click', function(e) {
    gradient.orientation = 'horizontal';
    gradient.updateGradientPreview();
    gradient.showCode();
});

$('.' + ORIENTATION_VERTICAL_CLASS).live('click', function(e) {
    gradient.orientation = 'vertical';
    gradient.updateGradientPreview();
    gradient.showCode();
});

$('.' + ORIENTATION_DIAG1_CLASS).live('click', function(e) {
    gradient.orientation = 'diagonal';
    gradient.updateGradientPreview();
    gradient.showCode();
});

$('.' + ORIENTATION_DIAG2_CLASS).live('click', function(e) {
    gradient.orientation = 'diagonal-bottom';
    gradient.updateGradientPreview();
    gradient.showCode();
});

$('.' + ORIENTATION_RADIAL_CLASS).live('click', function(e) {
    gradient.orientation = 'radial';
    gradient.updateGradientPreview();
    gradient.showCode();
});

$('.btn-reverse').live('click', function() {
    gradient.saveHSLStops();
    gradient.reverseGradient();
});



$('.' + STOP_MARKER_OPACITY_CLASS).live('keyup', function(e) {
    console.log(e.offset().top);
});

$('#' + COLOR_FORMAT_ID).live('change', function() {
    gradient.saveHSLStops();
    var format = $(this).val();
    gradient.format = _changeFormatWhenAlpha(gradient, format);
    $('#' + COLOR_FORMAT_ID + ' option[value=' + gradient.format + ']')[0].selected = true;
    gradient.showCode();
});

$('#' + OPACITY_VALUE_ID).live('keyup', function(e) {
    gradient.saveHSLStops();
    var element = _getActiveElement('opacity');
    if (element.length == 0) {
        e.preventDefault();
        return false;
    }
    
    var opacity = _getFromField($(this).val(), 0, 100, $('#' + OPACITY_VALUE_ID));
    if ((!opacity && opacity !== 0) || opacity > 100) {
        opacity = 100;
        $(this).val(opacity);
    } else if (opacity < 0) {
        opacity = 0;
        $(this).val(opacity);
    }

    _refreshOpacityValue(element.attr('position'), opacity, gradient);
    e.preventDefault();
    opacityField = true;
    return false;
});

$('#' + COLOR_INPUT_ID).live('change', function(e) {
    gradient.saveHSLStops();
    var color = _isValidHexadecimal($(this).val());
    if (color){
        updateInfo(new UserColor ({color: color, format: 'hex'}));
    }
});

$('#' + OPACITY_POSITION_ID).live('keyup', function(e){
    var position = _getFromField($(this).val(), 0, 100, $('#' + OPACITY_POSITION_ID));
    gradient.saveHSLStops();
    _refreshLocation('opacity',
                     _getActiveElement('opacity'),
                     parseInt(position),
                     gradient);
    e.preventDefault();
    return false;
});

$('#' + COLOR_POSITION_ID).live('keyup', function(e){
    var position = _getFromField($(this).val(), 0, 100, $('#' + COLOR_POSITION_ID));
    gradient.saveHSLStops();
    _refreshLocation('color',
                     _getActiveElement('color'),
                     parseInt(position),
                     gradient);
    e.preventDefault();
    return false;
});

// COMMENTS, IE AND CSS/SASS CODE
$('#comments-button').live('click', function() {
    gradient.displayComments = $(this).find('.right-pos').length === 1;
    gradient.showCode();
});

$('#ie9-button').live('click', function() {
    gradient.ieSupport = $(this).find('.right-pos').length === 1;
    gradient.showCode();
    
    if (gradient.ieSupport) {
        $('#ie-support-info').css('display', 'block');
    } else {
        $('#ie-support-info').css('display', 'none');
    }
});

$('#css-sass-button').live('click', function() {
    gradient.cssCode = $(this).find('.left-pos').length === 1;
    gradient.showCode();
});

// IMPORT CSS
$('#import-css-button').live('click', function() {
    var displayed = $('#import-css-panel').css('display') === 'block';

    if (displayed) {
        $('#import-css-panel').css('display', 'none');
        $('.buttons-block').removeClass('bottom-panel');
    } else {
        $('#import-css-panel').css('display', 'block');
        $('.buttons-block').addClass('bottom-panel');
    }
});

$('#import-css-button-ok').live('click', function() {
    var options = {css: $('#import-css-area').val()};
    var gradientAux = new GradientCSS(options);

    if (gradientAux.parse) {
        gradient = gradientAux;
        gradient.show();
        _resetPanel();
    } else {
        alert ('Couldn\'t parse gradient CSS.\nPlease check the format and try again.');
    }
});

$('#import-css-button-cancel').live('click', function() {
    $('#import-css-area').val('');
    $('#import-css-panel').css('display', 'none');
    $('.buttons-block').removeClass('bottom-panel');
});

$('.load-gradient').live('click', function() {
    var gradientAux = loadGradient($(this), gradient.orientation, gradient.format);
    if (gradientAux.parse) {
        gradient = gradientAux;
        gradient.show();
        _resetPanel();
    } else {
        alert('The gradient selected was not able to load properly.');
    }
});

$('#reset-button').live('click', function() {
    gradient = loadGradient($('#load-grad-1'), gradient.orientation, gradient.format);
    gradient.show();
    _resetPanel();
});

function loadGradient(elementHTML, orientation, format) {
    var style = elementHTML.css('background');
    if (!style) {
        style = elementHTML.css('filter');
    }
    if (!style || style == 'none'){
        style = elementHTML.css('background-image');
    }
    return new GradientCSS({'css': style,
                                'orientation': orientation,
                                'format': format});
}

$('#save-cookie-btn').live('click', function() {
    // #save-cookie-input is the input
    var nameCookie = $('#save-cookie-input').val();
    var valueCookie = _cssSaveValueCookie($('.presets-list'), gradient, gradient.format, 'vertical');
    $.cookie('gradient_' + nameCookie, valueCookie, {expires: 7, path: '/' });

    // Refresh html
    $('#save-cookie-input').val('Save your preset');
    _importGradientFromCookie('gradient_' + nameCookie);
});

$('html').click(function () {
    $('#opacity-gradient').css('display', 'none');
});

function updateInfo(color){
    var activeElement = _getActiveElement('color');
    var location = parseFloat(activeElement.attr('position'));
    var mark = gradient.getStopMarker('color', location);
    var colorHex;
    if (mark) {
        // Change the color
        colorHex = color.displayColor('hex');
        color.changeFormatColor(mark.color.format);
        mark.color = color;
        mark.htmlBlock.attr('color', colorHex);

        // Refresh
        gradient.update();
        _refreshColor(colorHex);
        activeElement.css('background-color', colorHex);
    }
}

function sliderBarsOpacityEditor() {
    $('#opacity-gradient').slider({
        value: 100,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            _refreshOpacityValue(parseFloat(_getActiveElement('opacity').attr('position')),
                                 ui.value,
                                 gradient);
            $('#' + OPACITY_SB_VALUE_ID).slider('value', ui.value);
        }
    });
}


function sliderBarsColorAndOpacity() {
    // opacity value
    $('#' + OPACITY_SB_VALUE_ID).slider({
        value: 100,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            _refreshOpacityValue(parseFloat(_getActiveElement('opacity').attr('position')),
                                 ui.value,
                                 gradient);
            $('#opacity-gradient').slider('value', ui.value);
        }
    });

    // opacity location
    $('#' + OPACITY_SB_LOCATION_ID).slider({
        value: 100,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            _refreshLocation('opacity',
                             _getActiveElement('opacity'),
                             ui.value,
                             gradient);
            var left = parseInt(_getActiveElement('opacity').css('left')) + 239 + 'px';
            $('#opacity-gradient').css('left', left);
        }
    });

    // Color location
    $('#' + COLOR_SB_LOCATION_ID).slider({
        value: 100,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $('#' + COLOR_POSITION_ID).val(ui.value);
            _refreshLocation('color',
                             _getActiveElement('color'),
                             ui.value,
                             gradient);
        }
    });
}

function sliderBarsHSL() {
    $('.' + HUE_SB_CLASS).slider({
        value: 0,
        min: -180,
        max: 180,
        step: 1,
        slide: function(event, ui) {
            $('#' + HUE_ID).val(ui.value);

            var h = parseFloat(ui.value),
                s = parseFloat($('#' + SATURATION_ID).val()),
                l = parseFloat($('#' + LIGHTNESS_ID).val());

            gradient.updateHSLLevels(h, s, l);
            _updateSaturationSlider($('.' + SATURATION_SB_CLASS),
                                    Math.round((h + 360 + 180) % 360),
                                    Math.round((l + 100) / 2));

            _updateLightnessSlider($('.' + LIGHTNESS_SB_CLASS),
                                   Math.round((h + 360 + 180) % 360),
                                   Math.round((s + 100) / 2));
        }
    });

    $('.' + SATURATION_SB_CLASS).slider({
        value: 0,
        min: -100,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $('#' + SATURATION_ID).val(ui.value);

            var h = parseFloat($('#' + HUE_ID).val()),
                s = parseFloat(ui.value),
                l = parseFloat($('#' + LIGHTNESS_ID).val());

            gradient.updateHSLLevels(h, s, l);
            _updateLightnessSlider($('.' + LIGHTNESS_SB_CLASS),
                                   Math.round((h + 360 + 180) % 360),
                                   Math.round((s + 100) / 2));

            _updateHueSlider($('.' + HUE_SB_CLASS),
                             Math.round((s + 100) / 2),
                             Math.round((l + 100) / 2));
        }
    });

    $('.' + LIGHTNESS_SB_CLASS).slider({
        value: 0,
        min: -100,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $('#' + LIGHTNESS_ID).val(ui.value);

            var h = (parseFloat($('#' + HUE_ID).val()) + 360) % 360,
                s = parseFloat($('#' + SATURATION_ID).val()),
                l = parseFloat(ui.value);

            gradient.updateHSLLevels(h, s, l);
            _updateSaturationSlider($('.' + SATURATION_SB_CLASS),
                                    Math.round((h + 360 + 180) % 360),
                                    Math.round((l + 100) / 2));

            _updateHueSlider($('.' + HUE_SB_CLASS),
                             Math.round((s + 100) / 2),
                             Math.round((l + 100) / 2));
        }
    });

    $('#' + HUE_ID).live('keyup', function(e) {
        var hue = _getFromField($(this).val(), -180, 180, $('#' + HUE_ID));
        $(this).attr('value', hue);
        $('.' + HUE_SB_CLASS).slider('value', hue);
    
        var h = parseFloat(hue),
            s = parseFloat($('#' + SATURATION_ID).val()),
            l = parseFloat($('#' + LIGHTNESS_ID).val());

        gradient.updateHSLLevels(h, s, l);
        _updateSaturationSlider($('.' + SATURATION_SB_CLASS),
                                Math.round((h + 360 + 180) % 360), Math.round((l + 100) / 2));
        _updateLightnessSlider($('.' + LIGHTNESS_SB_CLASS),
                               Math.round((h + 360 + 180) % 360), Math.round((s + 100) / 2));
    });

    $('#' + SATURATION_ID).live('keyup', function(e) {
        var saturation = _getFromField($(this).val(), -100, 100, $('#' + SATURATION_ID));
        $(this).attr('value', saturation);
        $('.' + SATURATION_SB_CLASS).slider('value', saturation);
    
        var h = parseFloat($('#' + HUE_ID).val()),
            s = parseFloat(saturation),
            l = parseFloat($('#' + LIGHTNESS_ID).val());

        gradient.updateHSLLevels(h, s, l);
        _updateLightnessSlider($('.' + LIGHTNESS_SB_CLASS),
                               Math.round((h + 360 + 180) % 360),
                               Math.round((s + 100) / 2));
        _updateHueSlider($('.' + HUE_SB_CLASS),
                         Math.round((s + 100) / 2),
                         Math.round((l + 100) / 2));
    });

    $('#' + LIGHTNESS_ID).live('change', function(e) {
        var lightness = _getFromField($(this).val(), -100, 100, $('#' + LIGHTNESS_ID));
        $(this).attr('value', lightness);
        $('.' + LIGHTNESS_SB_CLASS).slider('value', lightness);
      
        var h = (parseFloat($('#' + HUE_ID).val()) + 360) % 360,
            s = parseFloat($('#' + SATURATION_ID).val()),
            l = parseFloat(lightness);

        gradient.updateHSLLevels(h, s, l);
        _updateSaturationSlider($('.' + SATURATION_SB_CLASS),
                                Math.round((h + 360 + 180) % 360),
                                Math.round((l + 100) / 2));
        _updateHueSlider($('.' + HUE_SB_CLASS),
                         Math.round((s + 100) / 2),
                         Math.round((l + 100) / 2));
    });
}

/*
 ****************************************
 * Auxiliary functions
 ****************************************
*/

function _updateHueSlider(hueHTML, saturation, lightness) {
    var hue, pos;
    var point = [];
    var aux1 = '', aux2 = '', aux3 = '';
    var numColors = 6;

    point = ['hsl(' + 0 + ', ' + saturation + '%,' + lightness + '%) ', '0%'];
    aux1 += '(left, ' + point[0] + ' ' + point[1];
    aux2 += '(linear, color-stop(' + point[1] + ',' + point[0] + ')';
    for (var i = 1; i <= numColors; i++) {
        hue = Math.round((i / numColors) * 360.0);
        pos = Math.round((i / numColors) * 100.0);

        point = ['hsl(' + hue + ',' + saturation + '%,' + lightness + '%) ', pos + '%'];
        aux1 += ', ' + point[0] + ' ' + point[1];
        aux2 += ', color-stop(' + point[1] + ',' + point[0] + ')';
    }
    aux1 += ')';
    aux2 += ')';

    aux3 = 'progid:DXImageTransform.Microsoft.gradient( startColorstr=';
    aux3 += 'hsl(' + 0 + ', ' + saturation + '%,' + lightness + '%), ';
    aux3 += 'endColorstr=' + point[0] + ',GradientType=1 );';

    hueHTML.css('background', '-webkit-linear-gradient' + aux1);
    hueHTML.css('background', '-moz-linear-gradient' + aux1);
    hueHTML.css('background', '-o-linear-gradient' + aux1);
    hueHTML.css('background', '-ms-linear-gradient' + aux1);
    hueHTML.css('background', 'webkit-gradient' + aux2);
    hueHTML.css('filter', aux3);
}

function _updateLightnessSlider(lightnessHTML, hue, saturation) {
    var start = ['hsl(' + hue + ',' + saturation + '%,' + 0 + '%)', '0%'],
        end = ['hsl(' + hue + ',' + saturation + '%,' + 100 + '%)', '100%'];

    var aux = '(left, ' + start[0] + ' ' + start[1] + ',' + end[0] + ' ' + end[1] + ')';
    var aux2 = '(linear, left top, right top, color-stop(' + start[1] + ',' + start[0] + ')';
    aux2 += ', color-stop(' + end[1] + ',' + end[0] + '))';

    var aux3 = 'progid:DXImageTransform.Microsoft.gradient( startColorstr=';
    aux3 += start[0] + ', endColorstr=' + end[0] + ',GradientType=1 );';

    lightnessHTML.css('background', '-webkit-linear-gradient' + aux);
    lightnessHTML.css('background', '-moz-linear-gradient' + aux);
    lightnessHTML.css('background', '-o-linear-gradient' + aux);
    lightnessHTML.css('background', '-ms-linear-gradient' + aux);
    lightnessHTML.css('background', 'webkit-gradient' + aux2);
    lightnessHTML.css('filter', aux3);
}

function _updateSaturationSlider(saturationHTML, hue, lightness) {
    var start = ['hsl(' + hue + ',' + 0 + '%,' + lightness + '%)', '0%'],
        end = ['hsl(' + hue + ',' + 100 + '%,' + lightness + '%)', '100%'];

    var aux = '(left, ' + start[0] + ' ' + start[1] + ',' + end[0] + ' ' + end[1] + ')';
    var aux2 = '(linear, left top, right top, color-stop(' + start[1] + ',' + start[0] + ')';
    aux2 += ', color-stop(' + end[1] + ',' + end[0] + '))';

    var aux3 = 'progid:DXImageTransform.Microsoft.gradient( startColorstr=';
    aux3 += start[0] + ', endColorstr=' + end[0] + ',GradientType=1 );';

    saturationHTML.css('background', '-webkit-linear-gradient' + aux);
    saturationHTML.css('background', '-moz-linear-gradient' + aux);
    saturationHTML.css('background', '-o-linear-gradient' + aux);
    saturationHTML.css('background', '-ms-linear-gradient' + aux);
    saturationHTML.css('background', 'webkit-gradient' + aux2);
    saturationHTML.css('filter', aux3);
}

function _resetPanel() {
    var color = gradient.colorStop[gradient.colorStop.length - 1].color.displayColor('hex');
    $('#' + OPACITY_VALUE_ID).val('100');
    $('#' + OPACITY_POSITION_ID).val('100');
    $('#' + OPACITY_SB_VALUE_ID).slider('value', 100);
    $('#' + OPACITY_SB_LOCATION_ID).slider('value', 100);
    $('#' + COLOR_POSITION_ID).val('100');
    $('#' + COLOR_SB_LOCATION_ID).slider('value', 100);

    $('#' + COLOR_BUTTON_ID).blur();
    $('#' + COLOR_BUTTON_ID).ColorPickerSetColor({r: 46, g: 74, b: 117});
    $('#' + COLOR_BUTTON_ID).css('background-color', color);
    $('#' + COLOR_INPUT_ID).val(color);

    $('#' + SATURATION_ID).val(0);
    $('#' + LIGHTNESS_ID).val(0);
    $('#' + HUE_ID).val(0);
    $('.' + HUE_SB_CLASS).slider('value', 0);
    $('.' + SATURATION_SB_CLASS).slider('value', 0);
    $('.' + LIGHTNESS_SB_CLASS).slider('value', 0);

    $('#import-css-panel textarea').val('');
    $('#css-sass-button').find('.slider-small a').removeClass('right-pos');
    $('#css-sass-button').find('.slider-small a').addClass('left-pos');

    $('#import-css-area').val('');
    $('#import-css-panel').css('display', 'none');
    $('.buttons-block').removeClass('bottom-panel');
}

function _selectAMark(typeOfMark, x) {
    var element = _getActiveElement(typeOfMark);
    var location = element.attr('position');
    if (typeOfMark == 'opacity') {
        var op = parseInt(parseFloat(element.attr('opacity')) * 100);
        $('#' + OPACITY_POSITION_ID).attr('value', location);
        $('#' + OPACITY_SB_LOCATION_ID).slider('value', location);
        $('#' + OPACITY_SB_VALUE_ID).slider('value', op);
        $('#' + OPACITY_VALUE_ID).val(op);
        $('#opacity-gradient').css('display', 'block');
        $('#opacity-gradient').css('left', x);
        $('#opacity-gradient').slider('value', op);
    } else {
        $('#' + COLOR_POSITION_ID).attr('value', location);
        $('#' + COLOR_SB_LOCATION_ID).slider('value', location);
        _refreshColor(element.attr('color'));
    }
}

function _refreshColor(color) {
    var elem = $('#' + COLOR_BUTTON_ID);
    elem.val(color);
    elem.css('background-color', color);
    elem.css('color', 'rgb(255, 255, 255)');
    elem.css('background-image', 'none');
    $('#' + COLOR_INPUT_ID).val(color);
}

function _refreshPositions(typeOfMarker, position) {
    if (typeOfMarker === 'color') {
        $('#' + COLOR_POSITION_ID).val(position);
    } else if (typeOfMarker === 'opacity') {
        $('#' + OPACITY_POSITION_ID).val(position);
    }
}

function _refreshOpacityValue(location, opacity, gr) {
    var mark = {'location': location, 'opacity': opacity / 100.0};
    gr.addStopMarker('opacity', gr.opacityStop, mark);
    gr.removeStopMarker('opacity', gr.opacityStop, location);

    gr.format = _changeFormatWhenAlpha(gr, $('#' + COLOR_FORMAT_ID).val());
    $('#' + COLOR_FORMAT_ID + ' option[value=' + gr.format + ']')[0].selected = true;
    
    // Refresh gradient
    gr.show();

    // Refresh Panel
    $('#' + OPACITY_VALUE_ID).val(opacity);
    $('#' + OPACITY_SB_VALUE_ID).slider('value', opacity);
    return false;
}

function _refreshLocation(typeOfMark, activeElement, newLocation, gr) {
    element = {};
    element['location'] = newLocation;
    var oldLocation = activeElement.attr('position');

    if (typeOfMark == 'opacity') {
        element['opacity'] = activeElement.attr('opacity');
        gr.addStopMarker(typeOfMark, gr.opacityStop, element);
        gr.removeStopMarker(typeOfMark, gr.opacityStop, oldLocation, activeElement.attr('opacity'));

        // Refresh Panel
        $('#' + OPACITY_POSITION_ID).attr('value', newLocation);
        $('#' + OPACITY_SB_LOCATION_ID).slider('value', newLocation);
    } else {
        var oldColor = new UserColor({color: activeElement.attr('color'), format: 'hex'});
        oldColor.changeFormatColor(gr.format);
        element['color'] = oldColor;
        gr.addStopMarker(typeOfMark, gradient.colorStop, element);
        gr.removeStopMarker(typeOfMark, gradient.colorStop, oldLocation, oldColor);

        // Refresh Panel
        $('#' + COLOR_POSITION_ID).attr('value', newLocation);
        $('#' + COLOR_SB_LOCATION_ID).slider('value', newLocation);
    }

    // Refresh gradient
    gr.show();
}

function _calculatePosition(offset, width) {
    var x = Math.round((offset / width) * 100) - 1;
    return (x < 0) ? 0 : (x > 100) ? 100 : x;
}

function _isValidHexadecimal(input) {
    if (input[0] !== '#') {
        input = '#' + input;
    }
    var res = input.match('#[0-9a-fA-F]{6}');
    if (res){
        res = res[0];
    }
    return res;
}

function _getActiveElement(typeOfMarker) {
    var element;
    if (typeOfMarker === 'color') {
        element = $('.' + STOP_MARKERS_COLOR_CLASS + ' .' + ACTIVE_CLASS);
        if (element.length == 0) {
            element = $($('.' + STOP_MARKERS_COLOR_CLASS + ' .' + STOP_MARKER_CLASS)[0]);
            element.addClass(ACTIVE_CLASS);
        }

    } else if (typeOfMarker === 'opacity') {
        element = $('.' + STOP_MARKERS_OPACITY_CLASS + ' .' + ACTIVE_CLASS);
        if (element.length == 0) {
            element = $($('.' + STOP_MARKERS_OPACITY_CLASS + ' .' + STOP_MARKER_CLASS)[0]);
            element.addClass(ACTIVE_CLASS);
        }
    }
    return element;
}

function _importAllGradientsFromCookies() {
    var allCookies = $.cookie();
    var key, value, element;

    for (key in allCookies) {
        if (key.search('gradient_') == 0) {
            _importGradientFromCookie(key);
        }
    }
}

function _importGradientFromCookie(nameCookie) {
    var element = $('<li><div class="load-gradient" alt="' + nameCookie.replace('gradient_', '') + '"><div></li>');
    var listStyles, i;

    element.appendTo('.presets-list');
    listStyles = JSON.parse($.cookie(nameCookie));

    element = $(element.find('div'));
    for (i = 0; i < listStyles.length - 1; i++) {
        element.css('background', listStyles[i]);
    }
    element.css('filter', listStyles[i]);
}

function _refreshValuesInPanel(typeOfElement, element) {
    var position = element.attr('position');
    if (typeOfElement == 'color') {
        var color = new UserColor({format: 'hex', color: element.attr('color')});
        $('#' + COLOR_INPUT_ID).val(color.displayColor('hex'));
        $('#' + COLOR_BUTTON_ID).val(color.displayColor('hex'));
        $('#' + COLOR_BUTTON_ID).css('background-color', color.displayColor('hex'));
        $('#' + COLOR_POSITION_ID).val(position);
        $('#' + COLOR_SB_LOCATION_ID).slider('value', position);
    } else {
        var opacity = parseFloat(element.attr('opacity'));
        $('#' + OPACITY_VALUE_ID).val(opacity * 100);
        $('#' + OPACITY_SB_VALUE_ID).slider('value', opacity * 100);
        $('#opacity-gradient').slider('value', opacity * 100);
        $('#' + OPACITY_POSITION_ID).val(position);
        $('#' + OPACITY_SB_LOCATION_ID).slider('value', position);
    }
}

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