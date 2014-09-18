// Constants
var ACTIVE_CLASS = 'selected';

var STOP_MARKER_CLASS = 'stop-marker';
var STOP_MARKER_COLOR_CLASS = 'color-knob';
var STOP_MARKER_OPACITY_CLASS = 'opacity-knob';
var STOP_MARKERS_OPACITY_CLASS = 'stop-markers-opacity';
var STOP_MARKERS_COLOR_CLASS = 'stop-markers-color';

var PREVIEW_GRADIENT_ID = 'gradient-preview';
var GRADIENT_PANEL_BACKGROUND_ID = 'gradient-editor';
var GRADIENT_PANEL_CLASS = 'gradient-real';

var COLOR_INPUT_ID = 'color-value-hex';
var COLOR_BUTTON_ID = 'color-value-button';
var COLOR_DELETE_ID = 'color-delete-button';
var COLOR_POSITION_ID = 'color-location';
var COLOR_SB_LOCATION_ID = 'color-location-slider-bar';

var OPACITY_VALUE_ID = 'opacity';
var OPACITY_SB_VALUE_ID = 'opacity-value-slider-bar';
var OPACITY_SB_LOCATION_ID = 'opacity-location-slider-bar';
var OPACITY_DELETE_ID = 'opacity-delete-button';
var OPACITY_POSITION_ID = 'opacity-location';

var CSS_CODE_TEXT_AREA_ID = 'css-code-content';
var COLOR_FORMAT_ID = 'color-format';

var ORIENTATION_HORIZONTAL_CLASS = 'btn-horizontal';
var ORIENTATION_VERTICAL_CLASS = 'btn-vertical';
var ORIENTATION_DIAG1_CLASS = 'btn-diagonal-1';
var ORIENTATION_DIAG2_CLASS = 'btn-diagonal-2';
var ORIENTATION_RADIAL_CLASS = 'btn-radial';

var HUE_SB_CLASS = 'hue-bar';
var SATURATION_SB_CLASS = 'saturation-bar';
var LIGHTNESS_SB_CLASS = 'lightness-bar';
var HUE_ID = 'hue';
var SATURATION_ID = 'saturation';
var LIGHTNESS_ID = 'lightness';

// Global variables.
var addAMark;
var gradient;
var opacityField = false;
var draggedMarker = null;

function GradientCSS (options) {
    var i = 0, points, info = {};
    this.parse = true;
    this.widthDefault = 474;
    this.heightDefault = 38;
    this.displayComments = false;
    this.ieSupport = false;
    this.cssCode = true; // If True, we have css selected. If false, we have Sass selected
    this.colorDefault = new UserColor({'format': 'rgba', 'color': {'r': 46, 'g': 74, 'b': 117, 'a': 1}});
    this.colorStopHSL = null;
    this.colorStop = [];
    this.opacityStop = [];
    this.format = 'rgba';
    this.orientation = 'horizontal';

    if (options) {
        this.format = options['format'] || 'rgba';
        info = _importCssCode(options['css']);
        if (info) {
            this.orientation = options['orientation'] || info['orientation'] || 'horizontal';
            points = _generateColorAndOpacityListStops(info, this.widthDefault);
            this.colorStop = points[0];
            this.opacityStop = points[1];
        } else if (options['css']) {
            this.parse = false;
        } else {
            this.orientation = options['orientation'] || 'horizontal';
        }
    }

    if (!info || !options) {
        this.opacityStop = [{'opacity': 1, 'location': 0,
                             'htmlBlock': _createStopMarker('opacity', 0, {'opacity': 1, 'location': 0},
                             this.widthDefault)},
                            {'opacity': 1, 'location': 100,
                             'htmlBlock': _createStopMarker('opacity', 1, {'opacity': 1,
                             'location': 100}, this.widthDefault)}];

        this.colorStop = [{'color': this.colorDefault.clone(), 'location': 0,
                           'htmlBlock': _createStopMarker('color', 0, {'color': this.colorDefault,
                           'location': 0}, this.widthDefault)},
                          {'color': this.colorDefault.clone(), 'location': 100,
                           'htmlBlock': _createStopMarker('color', 1, {'color': this.colorDefault,
                           'location': 100}, this.widthDefault)}];
    }
    if (info) {
        this.format = _changeFormatWhenAlpha(this, this.format);
        this.changeFormatColor(this.format);
        $('#' + COLOR_FORMAT_ID + ' option[value=' + this.format + ']')[0].selected = true;
    }
    this.listMarks = _mergeMarkLists(this.colorStop, this.opacityStop);
}

GradientCSS.prototype.updateHSLLevels = function (hue, saturation, lightness) {
    var i = 0;

    saturation = clamp(saturation, -100, 100);
    lightness = clamp(lightness, -100, 100);
    this.colorStopHSL = [];
    for (i = 0; i < this.colorStop.length; i++) {
        this.colorStopHSL.push({location: this.colorStop[i].location, color: this.colorStop[i].color.clone()});
        this.colorStopHSL[i].color.changeHSLLevels(hue, saturation, lightness);
    }
    this.update(true);
};

GradientCSS.prototype.saveHSLStops = function () {
    var i = 0;
    if (!this.colorStopHSL || this.colorStopHSL.length === 0)
        return null;

    for (i = 0; i < this.colorStopHSL.length; i++) {
        this.colorStop[i].color = this.colorStopHSL[i].color.clone();
        this.colorStop[i].htmlBlock.css('background-color', this.colorStop[i].color.displayColor('hex'));
    }
    this.colorStopHSL = null;

    // Reset
    $('#' + SATURATION_ID).val(0);
    $('#' + LIGHTNESS_ID).val(0);
    $('#' + HUE_ID).val(0);
    $('.' + HUE_SB_CLASS).slider('value', 0);
    $('.' + SATURATION_SB_CLASS).slider('value', 0);
    $('.' + LIGHTNESS_SB_CLASS).slider('value', 0);
};

GradientCSS.prototype.addStopMarker = function(type, listElements, mark){
    var i = 0, k = 0, j = 0,
        res = [],
        ok = false;

    res = res.concat(listElements, [mark]);
    res.sort(function(a, b) {
        return a.location - b.location;
    });

    for (i = 0; i < res.length ; i ++) {
        if (res[i] == mark) {
            res[i]['htmlBlock'] = _createStopMarker(type, i, mark, this.widthDefault);
            res[i]['htmlBlock'].addClass(ACTIVE_CLASS);
        } else if (res[i].location >= mark.location) {
            if (res[i]['htmlBlock']) {
                res[i]['htmlBlock'].removeClass(ACTIVE_CLASS);
                res[i]['htmlBlock'].attr('position',  res[i].location);
                res[i]['htmlBlock'].attr('imarker', i);
            } else {
                res[i]['htmlBlock'] = _createStopMarker(type, i, mark, this.widthDefault);
            }
        } else {
            res[i]['htmlBlock'].removeClass(ACTIVE_CLASS);
        }
    }

    if (type == 'color') {
        this.colorStop = res;
    } else if (type == 'opacity') {
        this.opacityStop = res;
    }
};

GradientCSS.prototype.changeFormatColor = function(colorFormat) {
    this.colorDefault.changeFormatColor(colorFormat);
    for (var i = 0; i < this.colorStop.length; i++) {
        this.colorStop[i].color.changeFormatColor(colorFormat);
    }
};

GradientCSS.prototype.createGradientBar = function() {
    var mask = $('<div class="'+ GRADIENT_PANEL_CLASS + '"><div>');
    _updateStyleGradient(mask, this, 'rgba', 'horizontal');
    mask.css('width', this.widthDefault);
    mask.css('height', this.heightDefault);
    $('#' + GRADIENT_PANEL_BACKGROUND_ID).html('');
    $('#' + GRADIENT_PANEL_BACKGROUND_ID).append(mask);
};

GradientCSS.prototype.createPreviewGradient = function (w, h) {
    var mask = $('<div class="' + GRADIENT_PANEL_CLASS + '"></div>');
    _updateStyleGradient(mask, this, 'rgba', this.orientation);
    mask.css('width', w);
    mask.css('height', h);
    $('#' + PREVIEW_GRADIENT_ID).html('');
    $('#' + PREVIEW_GRADIENT_ID).append(mask);
};

/* Show CSS CODE */
GradientCSS.prototype.showCode = function (format) {
    var value = this.getCSSCodeFF36(this.displayComments, format, this.orientation);
    value = escape(value).replace(/%/g, '\\%').replace(/\./g, '\\.').replace(/\-/g, '\\-');
    history.pushState(null, null, '#\'' + value + '\'');
    if (this.cssCode) {
        this.showCSSCode(format);
    } else {
        this.showSassCode(format);
    }
};

GradientCSS.prototype.showCSSCode = function (format) {
    var res = '';
    format = format || this.format;
    res += '<div><b>background</b>: ' + this.getCSSCodeOldBrowsers(this.displayComments, format) + '</div>';
    res += '<div><b>background</b>: ' + this.getCSSCodeFF36(this.displayComments, format, this.orientation) + '</div>';
    res += '<div><b>background</b>: ' + this.getCSSCodeChromeSafari4(this.displayComments, format, this.orientation) + '</div>';
    res += '<div><b>background</b>: ' + this.getCSSCodeChrome10Safari51(this.displayComments, format, this.orientation) + '</div>';
    res += '<div><b>background</b>: ' + this.getCSSCodeOpera1110(this.displayComments, format, this.orientation) + '</div>';
    res += '<div><b>background</b>: ' + this.getCSSCodeIE10(this.displayComments, format, this.orientation) + '</div>';
    res += '<div><b>background</b>: ' + this.getCSSCodeW3C(this.displayComments, format, this.orientation) + '</div>';
    res += '<div><b>filter</b>: ' + this.getCSSCodeIE69(this.displayComments, this.orientation) + '</div>';
    $('#' + CSS_CODE_TEXT_AREA_ID).html(res);
};

GradientCSS.prototype.showSassCode = function(format) {
    var res = '';
    format = format || this.format;
    if (this.displayComments)
        res += '<div>// needs latest Compass, add \'@import "compass"\' to your scss</div>';

    res += '<div><b>background-color</b>: ' + this.getCSSCodeOldBrowsers(this.displayComments, format) + '</div>';
    res += '<div><b>background</b>: ' + this.getSassCodeIE(this.displayComments, this.orientation) + '</div>';

    if (this.ieSupport) {
        res += '<div>// IE9 SVG, needs conditional override of \'filter\' to \'none\'</div>';
        res += '<div>$experimental-support-for-svg: true;</div>';
    }
    res += '<div><b>background</b>: ' + this.getSassCodeAll(format, this.orientation) + '</div>';
    $('#' + CSS_CODE_TEXT_AREA_ID).html(res);
};

GradientCSS.prototype.getCSSCodeOldBrowsers = function(displayComments, format) {
    var res;
    var color;

    if (this.listMarks[0].color.format == 'hsl' || this.listMarks[0].color.format == 'hsla') {
        res = this.listMarks[0].color.displayColor('hex') + ';';
    } else {
        res = this.listMarks[0].color.displayColor(format) + ';';
    }

    if (displayComments) {
        res += '/* Old Browsers */';
    }
    return res;
};

GradientCSS.prototype.getSassCodeIE = function (displayComments, orientation) {
    var res = '@include filter-gradient(';
    res += this.listMarks[0].color.displayColor('hex') + ', ';
    res += this.listMarks[this.colorStop.length - 1].color.displayColor('hex') + ', ';

    if (orientation === 'vertical') {
        res += 'vertical';
    } else {
        res += 'horizontal';
    }
    res += ');';

    if (displayComments) {
        res += '// IE6-9 fallback on horizontal gradient';
    }
    return res;
};

GradientCSS.prototype.getSassCodeAll = function (format, orientation) {
    var startMessage = ['linear-gradient(', 'radial-gradient('];
    var i = 0;
    var text = '';

    text = '@include background-image(';
    if (orientation == 'horizontal') {
        text += startMessage[0] + 'left';
    } else if (orientation == 'vertical') {
        text += startMessage[0] + 'top';
    } else if (orientation == 'diagonal') {
        text += startMessage[0] + 'left top';
    } else if (orientation == 'diagonal-bottom') {
        text += startMessage[0] + 'left bottom';
    } else if (orientation == 'radial') {
        text += startMessage[1] + 'center, ellipse cover';
    }

    text += ', ' + _displayColorStop(this.listMarks[0].color, this.listMarks[0].location, format);
    for (i = 1; i < this.listMarks.length; i++) {
        text += ', ' + _displayColorStop(this.listMarks[i].color, this.listMarks[i].location,
                                         format);
    }
    text += '));';
    return text;
};


GradientCSS.prototype.getCSSCodeFF36 = function(displayComments, format, orientation) {
    return _templateCssCode(orientation, format, this.listMarks,
        ['-moz-linear-gradient', '-moz-radial-gradient'], '/* FF3.6+ */', displayComments);
};

GradientCSS.prototype.getCSSCodeChrome10Safari51 = function(displayComments, format, orientation) {
    return _templateCssCode(orientation, format, this.listMarks, ['-webkit-linear-gradient',
        '-webkit-radial-gradient'], '/* Chrome10+,Safari5.1+ */', displayComments);
};

GradientCSS.prototype.getCSSCodeOpera1110 = function(displayComments, format, orientation) {
    return _templateCssCode(orientation, format, this.listMarks, ['-o-linear-gradient',
        '-o-radial-gradient'], '/* Opera 11.10+ */', displayComments);
};

GradientCSS.prototype.getCSSCodeIE10 = function(displayComments, format, orientation) {
    return _templateCssCode(orientation, format, this.listMarks, ['-ms-linear-gradient',
        '-ms-radial-gradient'], '/* IE 10+ */', displayComments);
};

GradientCSS.prototype.getCSSCodeChromeSafari4 = function(displayComments, format, orientation) {
    var text = '-webkit-gradient(';
    var i = 0;

    if (orientation == 'horizontal') {
        text += 'left top, right top';
    } else if (orientation == 'vertical') {
        text += 'left top, left bottom';
    } else if (orientation == 'diagonal') {
        text += 'left top, right bottom';
    } else if (orientation == 'diagonal-bottom') {
        text += 'left bottom, right top';
    } else if (orientation == 'radial') {
        text += 'radial, center center, 0px, center center, 100%';
    }

    text += ', color-stop(' + this.listMarks[0].location + '%, ';
    text += this.listMarks[0].color.displayColor(format) + ')';
    for (i = 1; i < this.listMarks.length; i++) {
        text += ', color-stop(' + this.listMarks[i].location + '%, ';
        text += this.listMarks[i].color.displayColor(format) + ')';
    }
    text += ');';
    if (displayComments) {
        text += '/* Chrome, Safari4+ */';
    }
    return text;
};

GradientCSS.prototype.getCSSCodeW3C = function(displayComments, format, orientation) {
    var startMessage = ['linear-gradient', 'radial-gradient'];
    var i = 0;
    var text = '';

    if (orientation == 'horizontal') {
        text += startMessage[0] + '(' + 'to right';
    } else if (orientation == 'vertical') {
        text += startMessage[0] + '(' + 'to bottom';
    } else if (orientation == 'diagonal') {
        text += startMessage[0] + '(' + '135deg';
    } else if (orientation == 'diagonal-bottom') {
        text += startMessage[0] + '(' + '45deg';
    } else if (orientation == 'radial') {
        text += startMessage[1] + '(' + 'ellipse at center';
    }

    text += ', ' + _displayColorStop(this.listMarks[0].color, this.listMarks[0].location, format);
    for (i = 1; i < this.listMarks.length; i++) {
        text += ', ' + _displayColorStop(this.listMarks[i].color, this.listMarks[i].location,
                                         format);
    }
    text += ');';
    if (displayComments) {
        text += '/* W3C */';
    }
    return text;
};

GradientCSS.prototype.getCSSCodeIE69 = function(displayComments, orientation) {
    var startColor = this.listMarks[0].color;
    var endColor = this.listMarks[this.listMarks.length - 1].color;
    var text = 'progid:DXImageTransform.Microsoft.gradient( ';

    text += 'startColorstr=\'' + startColor.displayColor('hex') + '\', endColorstr=\'';
    text += endColor.displayColor('hex') + '\', ';
    text += 'GradientType=';

    if (orientation == 'vertical') {
        text += '0 );';
    } else {
        text += '1 );';
    }

    if (displayComments) {
        if (orientation == 'horizontal' || orientation == 'vertical') {
            text += '/* IE6-9 */';
        } else {
            text += '/* IE6-9 fallback on horizontal gradient */';
        }
    }

    return text;
};

GradientCSS.prototype.getStopMarker = function(typeOfMarker, location) {
    var i;
    var res = false;

    if (typeOfMarker == 'color') {
        for (i = 0; i < this.colorStop.length ; i ++) {
            if (this.colorStop[i].location == location) {
                res = this.colorStop[i];
                break;
            }
        }
    } else if (typeOfMarker == 'opacity') {
        for (i = 0; i < this.opacityStop.length ; i ++) {
            if (this.opacityStop[i].location == location) {
                res = this.opacityStop[i];
                break;
            }
        }
    }
    return res;
};

GradientCSS.prototype.removeStopMarker = function(type, listElements, location, value){
    var i, k, res, cond;
    var elem = false;

    if (listElements.length <= 2)
        return null;

    res = [];
    for (i = 0; i < listElements.length ; i ++) {
        if (listElements[i].location != location) {
            res.push(listElements[i]);
        } else {
            cond = (value && type == 'color' && value.equals(this.colorStop[i].color));
            cond = cond || (((value || value == 0) && type == 'opacity' && value == this.opacityStop[i].opacity));
            cond = cond || (!value);
            if (cond) {
                elem = listElements[i];
                break;
            } else {
                res.push(listElements[i]);
            }
            
        }
    }

    for (k = i + 1; k < listElements.length ; k ++) {
        listElements[k]['htmlBlock'].attr('position',  listElements[k].location);
        listElements[k]['htmlBlock'].attr('imarker', k - 1);
        res.push(listElements[k]);
    }

    if (type == 'color') {
        this.colorStop = res;
    } else if (type == 'opacity') {
        this.opacityStop = res;
    }
    return elem;
};

GradientCSS.prototype.show = function(hsl) {
    // Show all the Stop Markers Color
    this.showAllColorStops();

    // Show all the Opacity Stop Markers
    this.showAllOpacityStops();

    // Show all the markers.
    this.listMarks = _mergeMarkLists(this.colorStop, this.opacityStop);

    // Show the css/sass code
    this.showCode();

    // Show the gradient bar
    this.createGradientBar();

    // Show the preview gradient
    this.createPreviewGradient(290, 240);
};

GradientCSS.prototype.reverseGradient = function() {
    this.colorStop = _reverseMarks(this.colorStop, this.widthDefault, 'color');
    this.opacityStop = _reverseMarks(this.opacityStop, this.widthDefault, 'opacity');
    this.show();
};

GradientCSS.prototype.showAllColorStops = function() {
    var i;
    
    /*for (i = this.colorStop.length - 1; i >= 0; i--) {
        this.colorStop[i].htmlBlock = eventDraggable('color', 'parent', this.colorStop[i].htmlBlock).clone();
    }*/

    $('.' + STOP_MARKERS_COLOR_CLASS).html('');
    for (i = this.colorStop.length - 1; i >= 0; i--) {
        this.colorStop[i].htmlBlock = eventDraggable('color', '.' + STOP_MARKERS_COLOR_CLASS,
                                                     this.colorStop[i].htmlBlock);
        (this.colorStop[i].htmlBlock).appendTo($('.' + STOP_MARKERS_COLOR_CLASS));
    }
};

GradientCSS.prototype.showAllOpacityStops = function() {
    var i;
    /*for (i = this.opacityStop.length - 1; i >= 0; i--) {
        this.opacityStop[i].htmlBlock = eventDraggable('opacity', 'parent', this.opacityStop[i].htmlBlock).clone();
    }*/

    $('.' + STOP_MARKERS_OPACITY_CLASS).html('');
    for (i = this.opacityStop.length - 1; i >= 0; i--) {
        this.opacityStop[i].htmlBlock = eventDraggable('opacity', '.' + STOP_MARKERS_OPACITY_CLASS,
                                                       this.opacityStop[i].htmlBlock);
        (this.opacityStop[i].htmlBlock).appendTo($('.' + STOP_MARKERS_OPACITY_CLASS));
    }
};

GradientCSS.prototype.update = function(hsl) {
    if (hsl) {
        // Show all the markers.
        this.listMarks = _mergeMarkLists(this.colorStopHSL, this.opacityStop);
        this.updateMarks(this.colorStopHSL);
    } else {
        // Show all the markers.
        this.listMarks = _mergeMarkLists(this.colorStop, this.opacityStop);
    }

    // Show the css code
    this.showCode();

    // Update the gradient bar and preview gradient
    this.updateGradient();
    this.updateGradientPreview();
};

GradientCSS.prototype.updateMarks = function (colorLists) {
    var i = 0;
    for (i = 0; i < colorLists.length; i ++) {
        this.colorStop[i].htmlBlock.attr('color', colorLists[i].color.displayColor('hex'));
        this.colorStop[i].htmlBlock.css('background-color', colorLists[i].color.displayColor());
    }
};

GradientCSS.prototype.updateGradient = function() {
    var mask = $('#' + GRADIENT_PANEL_BACKGROUND_ID).find('.' + GRADIENT_PANEL_CLASS);
    _updateStyleGradient(mask, this, 'rgba', 'horizontal');
};

GradientCSS.prototype.updateGradientPreview = function() {
    var mask = $('#' + PREVIEW_GRADIENT_ID).find('.' + GRADIENT_PANEL_CLASS);
    _updateStyleGradient(mask, this, 'rgba', this.orientation);
};

function wantToDeleteMarker(mouseObject, elementObject, threshold) {
    var topMouse = mouseObject.pageY;
    var topElement = elementObject.offsetTop + elementObject.offsetParent.offsetTop;
    topElement += elementObject.offsetParent.offsetParent.offsetTop;

    return Math.abs(topElement - topMouse) > threshold;
}

function eventDraggable(typeOfMarker, containmentClass, element) {
    element.draggable({
        axis: 'x',
        containment: containmentClass,
        start: function(event, ui) {
            $('#opacity-gradient').css('display', 'none');
            draggedMarker = gradient.getStopMarker(typeOfMarker, parseInt(ui.helper.attr('position')));

            _getActiveElement(typeOfMarker).removeClass(ACTIVE_CLASS);
            $(this).addClass(ACTIVE_CLASS);

            if (typeOfMarker == 'color') {
                _refreshColor($(this).attr('color'));
            }
        },
        drag: function(event) {
            draggedMarker = _dragAndDrop(typeOfMarker, gradient, this, draggedMarker,
                                         wantToDeleteMarker(event, this, 30));
            gradient.update();
        },
        stop: function(event) {
            draggedMarker = _dragAndDrop(typeOfMarker, gradient, this, draggedMarker,
                                         wantToDeleteMarker(event, this, 30));
            draggedMarker = null;
            gradient.show();
        }
    });

    // Remove in style the sentence: position: relative.
    element.css('position', '');
    return element;
}

function _dragAndDrop(typeOfMarker, grad, drag, dragMarker, drop) {
    var newLocation = Math.round((drag.offsetLeft / grad.widthDefault) * 100),
        oldLocation = dragMarker.location,
        value, marker, element, color, opacity;

    if (drop) {
        if (typeOfMarker == 'opacity') {
            grad.removeStopMarker(typeOfMarker, grad.opacityStop, oldLocation, dragMarker.opacity);
        } else {
            grad.removeStopMarker(typeOfMarker, grad.colorStop, oldLocation, dragMarker.color);
        }
        grad.show();

        element = _getActiveElement(typeOfMarker);
        _refreshValuesInPanel(typeOfMarker, element);
        return null;
    }

    if (oldLocation == newLocation) {
        return dragMarker;
    } else if (newLocation >= 100) {
        newLocation = 100;
        dragMarker.htmlBlock.css('left', drag.widthDefault + 'px');
    }

    element = {};
    element['location'] = newLocation;
    element['htmlBlock'] = dragMarker.htmlBlock.clone();
    element['htmlBlock'].attr('position', newLocation);

    if (typeOfMarker == 'opacity') {
        element['opacity'] = dragMarker.opacity;
        grad.addStopMarker(typeOfMarker, grad.opacityStop, element);
        grad.removeStopMarker(typeOfMarker, grad.opacityStop, oldLocation, dragMarker.opacity);
        $('#' + OPACITY_POSITION_ID).attr('value', newLocation);
        $('#' + OPACITY_SB_LOCATION_ID).slider('value', newLocation);
    } else {
        element['color'] = dragMarker.color.clone();
        grad.addStopMarker(typeOfMarker, grad.colorStop, element);
        grad.removeStopMarker(typeOfMarker, grad.colorStop, oldLocation, dragMarker.color);
        $('#' + COLOR_POSITION_ID).attr('value', newLocation);
        $('#' + COLOR_SB_LOCATION_ID).slider('value', newLocation);
    }
    grad.saveHSLStops();
    return element;
}

/**
 ***********************************************************************
 *  AUXILIARY FUNCTIONS
 ***********************************************************************
*/
function _addBoundsToList(colors) {
    var bounded = [];

    if (colors.length == 0)
        return [];

    // sanity check, make sure we start with a color / opacity
    if (colors[0].location > 0) {
        bounded.push({
            location: 0,
            opacity: colors[0].opacity,
            color: colors[0].color
        });
    }

    bounded = bounded.concat(colors);

    // sanity check, make sure we end with a color / opacity
    if (colors[colors.length - 1].location < 100) {
        bounded.push({
            location: 100,
            opacity: colors[colors.length - 1].opacity,
            color: colors[colors.length - 1].color
        });
    }

    return bounded;
}

function _createStopMarker(typeOfMarker, i, marker, width) {
    var stopMarker, colorAux;
    if (typeOfMarker == 'color') {
        colorAux = marker.color.clone();
        stopMarker = $('<div class="' + STOP_MARKER_COLOR_CLASS + '"><div></div></div>');
        stopMarker.attr('title', 'Color stop');
        stopMarker.attr('color', colorAux.displayColor('hex'));
        stopMarker.css('background-color', colorAux.displayColor('rgb'));
    } else {
        var color = parseInt(Math.round((1 - marker.opacity) * 255));
        stopMarker = $('<div class="' + STOP_MARKER_OPACITY_CLASS + '"><div></div></div>');
        stopMarker.attr('title', 'Opacity stop');
        stopMarker.attr('opacity', marker.opacity);
        stopMarker.css('background-color', 'rgb(' + color + ', ' + color + ', ' + color + ')');
    }
    stopMarker.addClass(STOP_MARKER_CLASS);
    stopMarker.attr('position', marker.location);
    stopMarker.attr('imarker', i);
    stopMarker.css('left', ((marker.location * width) / 100.0) + 'px');
    return stopMarker;
}

function _displayColorStop(color, location, format){
    return color.displayColor(format) + ' ' + location + '%';
}

function _getColor(stopOpacity, c1, c2) {
    var color = {};
    var f = c1.color.format;
    color[f[0]] = _getYinRectBetweenTwoPoints(stopOpacity.location, c1.location, c2.location,
        c1.color.color[f[0]], c2.color.color[f[0]]);
    color[f[1]] = _getYinRectBetweenTwoPoints(stopOpacity.location, c1.location, c2.location,
        c1.color.color[f[1]], c2.color.color[f[1]]);
    color[f[2]] = _getYinRectBetweenTwoPoints(stopOpacity.location, c1.location, c2.location,
        c1.color.color[f[2]], c2.color.color[f[2]]);
    color.a = stopOpacity.opacity;

    return {
        location: stopOpacity.location,
        color: new UserColor({
            format: f,
            color: color
        })
    };
}

function _getOpacity(stopColor, o1, o2) {
    var stop = {
        location: stopColor.location,
        color: stopColor.color.clone()
    };
    stop.color.color.a =  Math.round(_getYinRectBetweenTwoPoints(
        stopColor.location, o1.location, o2.location, o1.opacity * 100, o2.opacity * 100)) / 100.0;
    return stop;
}

function _getYinRectBetweenTwoPoints(x, x1, x2, y1, y2) {
    return parseFloat(Math.round((x - x1) * (y2 - y1) / parseFloat(x2 - x1)) + y1);
}

function _mergeMarkLists(colorList, opacityList) {
    var colors = _addBoundsToList(colorList);
    var opacities = _addBoundsToList(opacityList);
    var c1 = 0, o1 = 0;
    var stops;
    var stop;

    stop = colors[0];
    stop.color.color.a = opacities[0].opacity;
    stops = [stop];

    for (var c2 = 1, o2 = 1; c2 < colors.length && o2 < opacities.length; ) {
        if (colors[c2].location > opacities[o2].location) {
            stops.push(_getColor(opacities[o2], colors[c1], colors[c2]));
            o1++;
            o2++;
        }
        else {
            stops.push(_getOpacity(colors[c2], opacities[o1], opacities[o2]));

            if (colors[c2].location == opacities[o2].location) {
                o1++;
                o2++;
            }
            c1++;
            c2++;
        }
    }

    if (colorList[0].location > 0 && opacityList[0].location > 0) {
        stops.splice(0, 1);
    }

    if (colorList[colorList.length - 1].location < 100 &&
        opacityList[opacityList.length - 1].location < 100) {
        stops.splice(stops.length - 1, stops.length);
    }

    return stops;
}

function _templateCssCode (orientation, format, listMarks, startMessage, comments, displayComments) {
    var text = '';
    var i = 0;

    if (orientation == 'horizontal') {
        text = startMessage[0] + '(' + 'left';
    } else if (orientation == 'vertical') {
        text = startMessage[0] + '(' + 'top';
    } else if (orientation == 'diagonal') {
        text = startMessage[0] + '(' + '-45deg';
    } else if (orientation == 'diagonal-bottom') {
        text = startMessage[0] + '(' + '45deg';
    } else if (orientation == 'radial') {
        text = startMessage[1] + '(' + 'center, ellipse cover';
    }

    text += ', ' + _displayColorStop(listMarks[0].color, listMarks[0].location, format);
    for (i = 1; i < listMarks.length; i++) {
        text += ', ' + _displayColorStop(listMarks[i].color, listMarks[i].location, format);
    }
    text += ');';
    if (displayComments) {
        text += ' ' + comments;
    }
    return text;
}

function _updateStyleGradient(element, gradient, format, orientation) {
    var backgroundImage = gradient.getCSSCodeChrome10Safari51(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeFF36(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeOpera1110(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeIE10(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeOldBrowsers(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeChromeSafari4(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeW3C(false, format, orientation);
    element.css('background-image', backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeIE69(false, orientation);
    element.css('filter', backgroundImage.slice(0, backgroundImage.length - 1));
    element.find('.' + GRADIENT_PANEL_CLASS).css('filter', backgroundImage.slice(0, backgroundImage.length - 1));
}

function _cssSaveValueCookie(element, gradient, format, orientation) {
    var res = [];
    var backgroundImage;
    backgroundImage = gradient.getCSSCodeOldBrowsers(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeChrome10Safari51(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeFF36(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeOpera1110(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeIE10(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeChromeSafari4(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeW3C(false, format, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    backgroundImage = gradient.getCSSCodeIE69(false, orientation);
    res.push(backgroundImage.slice(0, backgroundImage.length - 1));
    return JSON.stringify(res);
}

function _changeFormatWhenAlpha(gr, format) {
    var alpha = false;
    for (var i = 0; i < gr.opacityStop.length; i++){
        if (gr.opacityStop[i].opacity < 1){
            alpha = true;
            break;
        }
    }
    if (alpha) {
        if (format == 'hex')
            format = 'rgba';
        else if (format[format.length - 1] != 'a')
            format = format + 'a';
    }
    return format;
}

function _reverseMarks(list, width, typeOfMarker) {
    var i, color, elements = [];

    if (typeOfMarker == 'color') {
        for (i = 0; i < list.length; i++) {
            elements.push({location: list[i].location, color: list[i].color.clone()});
        }

        for (i = 0; i < list.length; i++) {
            list[i].location = 100 - elements[list.length - i - 1].location;
            list[i].color = elements[list.length - i - 1].color;
            list[i].htmlBlock.attr('position', list[i].location);
            list[i].htmlBlock.attr('color', list[i].color.displayColor('hex'));
            list[i].htmlBlock.css('left', ((list[i].location * width) / 100) + 'px');
            list[i].htmlBlock.css('background-color', list[i].color.displayColor());
        }
    } else if (typeOfMarker == 'opacity') {
        for (i = 0; i < list.length; i++) {
            elements.push({location: list[i].location, opacity: list[i].opacity});
        }

        for (i = 0; i < list.length; i++) {
            list[i].location = 100 - elements[list.length - i - 1].location;
            list[i].opacity = elements[list.length - i - 1].opacity;
            list[i].htmlBlock.attr('position', list[i].location);
            list[i].htmlBlock.attr('opacity', list[i].opacity);
            list[i].htmlBlock.css('left', ((list[i].location * width) / 100) + 'px');

            color = new UserColor({color: {r: list[i].opacity, g: list[i].opacity, b: list[i].opacity},
                                   format: 'rgb'});
            list[i].htmlBlock.css('background-color', color.displayColor());
        }
    }
    return list;
}


function _importCssCode(cssCode) {
    var start = ['-moz-linear-gradient', '-o-linear-gradient', '-ms-linear-gradient', '-webkit-linear-gradient',
                 '-moz-radial-gradient', '-o-radial-gradient','ms-radial-gradient', '-webkit-radial-gradient',
                 '-webkit-gradient',
                 'linear-gradient', 'radial-gradient',
                 'progid:DXImageTransform.Microsoft.gradient'];
    var res = false;
    var exit = false;
    var i = 0;

    if (!cssCode) {
        return false;
    }
    while (! exit && i < start.length) {
        if (cssCode.match(start[i])) {
            cssCode = cssCode.slice(cssCode.search(start[i]) + start[i].length);
            exit = true;
        }
        i ++;
    }
    i = i - 1;
    
    if (! exit) {
        return res;
    }

    if (i <= 7) {
        res = _importCssCodeCommomBrowser(cssCode);
    } else if (i <= 8) {
        res = _importCssCodeChromeSafari4(cssCode);
    } else if (i <= 10) {
        res = _importCssCodeW3C(cssCode);
    } else if (i <= 11) {
        res = _importCssCodeIE69(cssCode);
    }
    return res;
};
/*

    } else if (orientation == 'diagonal') {
        text = startMessage[0] + '(' + '-45deg';
    } else if (orientation == 'diagonal-bottom') {
        text = startMessage[0] + '(' + '45deg';
*/

function _importCssCodeCommomBrowser(cssCode) {
    var res = {}, orientation, regExp;

    if (! cssCode.match('\\([a-zA-Z0-9#\., %\\(\\)]+\\)')) {
        return res;
    }

    regExp = {
        'left': 'horizontal',
        'top': 'vertical',
        '- *45 *deg': 'diagonal',
        '45 *deg': 'diagonal-bottom',
        'center *, +ellipse +cover': 'radial'
    };
    orientation = _importCssCodeGetOrientation(cssCode, regExp);
    cssCode = orientation['css'];
    res['orientation'] = orientation['orientation'];
    res['points'] = _importCssCodeGetListPoints(cssCode);
    return res;
}

function _importCssCodeW3C(cssCode) {
    var res = {}, orientation, regExp;

    if (! cssCode.match('\\([a-zA-Z0-9#,\. %\\(\\)]+\\)')) {
        return res;
    }

    regExp = {
        'to +right': 'horizontal',
        'to +bottom': 'vertical',
        '135 *deg': 'diagonal',
        '45 *deg': 'diagonal-bottom',
        'ellipse +at +center': 'radial'
    };

    orientation = _importCssCodeGetOrientation(cssCode, regExp);
    cssCode = orientation['css'];
    res['orientation'] = orientation['orientation'];
    res['points'] = _importCssCodeGetListPoints(cssCode);
    return res;
}

function _importCssCodeChromeSafari4(cssCode) {
    var res = {}, orientation, regExp;

    if (! cssCode.match('\\([a-zA-Z0-9#,\. %\\(\\)]+\\)')) {
        return res;
    }

    regExp = {
        'left +top *, *right +top': 'horizontal',
        'left +top *, *left +bottom': 'vertical',
        'left top, right bottom': 'diagonal-bottom',
        'left bottom, right top': 'diagonal',
        'radial *, *center +center *, *0px *, *center +center *, *100 *%': 'radial'
    };

    orientation = _importCssCodeGetOrientation(cssCode, regExp);
    cssCode = orientation['css'];
    res['orientation'] = orientation['orientation'];
    res['points'] = _importCssCodeGetListPointsCS(cssCode);
    return res;
}

function _importCssCodeIE69(cssCode) {
    var res = {}, orientation, regExp, color, aux;

    if (! cssCode.match('\\([a-zA-Z0-9#=\', %\\(\\)]+\\)')) {
        return {};
    }
    cssCode = cssCode.replace(/ /gi, '');

    // Colors
    res['points'] = [];
    if (aux = cssCode.match('\\(startColorstr=\'#[a-fA-F0-9]+\',')) {
        color = new UserColor({format: 'hex', color: cssCode.match('[a-fA-F0-9]{6}')[0]});
        res['points'].push({color: color, location: 0});
        cssCode = cssCode.replace(aux[0], '');
    } else {
        return {};
    }

    if (aux = cssCode.match('endColorstr=\'#[a-fA-F0-9]+\',')) {
        color = new UserColor({format: 'hex', color: cssCode.match('[a-fA-F0-9]{6}')[0]});
        res['points'].push({color: color, location: 100});
        cssCode = cssCode.replace(aux[0], '');
    } else {
        return {};
    }

    // Orientation
    if (aux = cssCode.match('GradientType=1\\)')) {
        res['orientation'] = 'horizontal';
    } else if (aux = cssCode.match('GradientType=0\\)')){
        res['orientation'] = 'vertical';
    } else {
        return {};
    }

    return res;
}

function _importCssCodeGetOrientation(cssCode, regExp) {
    var key, exit = false, res = {}, i = 0, allKeys, pattern;

    allKeys = Object.keys(regExp);
    key = cssCode.match('\\([-a-zA-Z0-9%, ]+,');
    if (key) {
        while (! exit && i < allKeys.length) {
            value = cssCode.match(allKeys[i]);
            if (value) {
                res['orientation'] = regExp[allKeys[i]];
                exit = true;
            }
            i ++;
        }
    }

    if (! exit) {
        pattern = cssCode.match('\\( *')[0];
        res['orientation'] = null;
    } else {
        pattern = cssCode.match('\\( *' + value + ' *, *')[0];
    }
    res['css'] = cssCode.replace(pattern, ',');
    return res;
}

function _importCssCodeGetListPoints(cssCode) {
    var listPoints, point, position;
    listPoints = [];

    cssCode = cssCode.replace(/ /gi, '');
    while (true) {
        point = {};
        cssCode = cssCode.replace(/,/, '');
        if (color = cssCode.match('^(rgba|rgb|hsl|hsla)\\([a-zA-Z0-9,%\.]+\\)')) {
            point['color'] = parseColor(color[0]); 
        } else if (color = cssCode.match('^#[0-9a-fA-F]{6}')) {
            point['color'] = parseColor(color[0]);
        } else if (color = cssCode.match('transparent')){
            point['color'] = new UserColor({format: 'rgba', color:{r: 0, g: 0, b: 0, a: 0}});
        } else {
            break;
        }
        cssCode = cssCode.replace(color[0], '');

        position = cssCode.match('[0-9]+(%|px)');
        if (!position) {
            break;
        }

        point['location'] = parseInt(cssCode.match('[0-9]+'));
        cssCode = cssCode.replace(position[0], '');
        listPoints.push(point);
    }

    if (listPoints.length < 2) {
        return [];
    }

    return listPoints;
};

function _importCssCodeGetListPointsCS(cssCode) {
    var listPoints, point, position;
    listPoints = [];

    cssCode = cssCode.replace(/ /gi, '');
    while (true) {
        point = {};
        cssCode = cssCode.replace(',color-stop\(', '');

        // Parse position
        position = cssCode.match('[0-9]+(%|px),');
        if (!position) {
            break;
        }
        point['location'] = parseInt(cssCode.match('[0-9]+'));
        cssCode = cssCode.replace(position[0], '');

        // Parse color
        if (color = cssCode.match('^(rgba|rgb|hsl|hsla)\\([a-zA-Z0-9,%\.]+\\)')) {
            point['color'] = parseColor(color[0]); 
        } else if (color = cssCode.match('^#[0-9a-fA-F]')) {
            point['color'] = parseColor(color[0]);
        } else if (color = cssCode.match('transparent')){
            point['color'] = new UserColor({format: 'rgba', color:{r: 0, g: 0, b: 0, a: 0}});
        } else {
            break;
        }
        cssCode = cssCode.replace(color[0], '');
        cssCode = cssCode.replace('\)', '');
        listPoints.push(point);
    }

    if (listPoints.length < 2) {
        return [];
    }

    return listPoints;
}

function _removeUselessOpacities(opacities) {
    var i = 1;
    var res = [];
    if (opacities.length < 3) {
        return opacities;
    }

    res.push(opacities[0]);
    for (i = 1; i < opacities.length - 1 ; i++) {
        if (opacities[i - 1].opacity !== opacities[i + 1].opacity) {
            res.push(opacities[i]);
        }
    }

    if (res.length == 1 || opacities[i - 1].opacity !== opacities[i].opacity) {
        res.push(opacities[i]);
    }

    if (res.length > 2 && (res[0].opacity == res[1].opacity)) {
        res = res.slice(1);
    } else if (res.length == 2) {
        res[0].location = 0;
        res[1].location = 100;
    }
    return res;
}

function _generateColorAndOpacityListStops (options, width){
    var opacityPoints = [], i, pointColor, pointOpacity, colorPoints = [];

    for (i = 0; i < options['points'].length; i ++) {
        pointColor = options['points'][i];
        pointColor['htmlBlock'] = _createStopMarker('color', i, options['points'][i], width);
        colorPoints.push(pointColor);

        pointOpacity = {
            opacity: options['points'][i]['color'].getAlpha(),
            location: options['points'][i]['location'],
        }
        opacityPoints.push(pointOpacity);
    }

    opacityPoints = _removeUselessOpacities(opacityPoints);
    for (i = 0; i < opacityPoints.length; i ++) {
        opacityPoints[i]['htmlBlock'] = _createStopMarker('opacity', i, opacityPoints[i], width);
    }
    return [colorPoints, opacityPoints];
}
