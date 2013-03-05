function BorderRadius (options) {
    this.htmlElement = options['htmlElement'] || $('#border-radius-panel');
    this.htmlCode = options['htmlCode'] || $('#border-radius-code');
    this.topLeft = options['topLeft'] || 10;
    this.topRight = options['topRight'] || 10;
    this.bottomLeft = options['bottomLeft'] || 10;
    this.bottomRight = options['bottomRight'] || 10;
    this.borderWidth = options['borderWidth'] || 0;
    this.borderStyle = options['borderStyle'] || 'none';
    this.borderColor = options['borderColor'] ||'#000000';
    this.borderBackground = options['borderBackground'] || '#e7a61a';
};

BorderRadius.prototype.refresh = function () {
    var cssCode1 = '', cssCode2 = '';
    cssCode1 += this.topLeft + 'px ' + this.topRight + 'px ' + this.bottomRight + 'px ';
    cssCode1 += this.bottomLeft + 'px';
    cssCode2 += this.borderWidth + 'px ' + this.borderStyle + ' ' + this.borderColor;

    this.htmlElement.css('border-radius', cssCode1);
    this.htmlElement.css('-moz-border-radius', cssCode1);
    this.htmlElement.css('-webkit-border-radius', cssCode1);
    this.htmlElement.css('border', cssCode2);
    this.htmlElement.css('background-color', this.borderBackground);

    this.htmlCode.html('');
    var text = '<div>border-radius: ' + cssCode1 +';</div>';
    text += '<div>-moz-border-radius: ' + cssCode1+';</div>';
    text += '<div>-webkit-border-radius: ' + cssCode1+';</div>';
    text += '<div>border: ' + cssCode2 +';</div>';
    this.htmlCode.append(text);
};

BorderRadius.prototype.setAllCorners = function (radius) {
    this.topLeft = radius;
    this.topRight = radius;
    this.bottomLeft = radius;
    this.bottomRight = radius;
};

function _getAllValuesFromPanelBorderRadius() {
    var options = {};
    options['topLeft'] = parseFloat($('#top-left').val());
    options['topRight'] = parseFloat($('#top-right').val());
    options['bottomLeft'] = parseFloat($('#bottom-left').val());
    options['bottomRight'] = parseFloat($('#bottom-right').val());
    options['borderWidth'] = parseFloat($('#border-width').val());
    options['borderStyle'] = $('#select-border :selected').val();
    options['borderColor'] = $('#br-color').val();
    options['borderBackground'] = $('#br-background-color').val();
    return options;
};

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
    borderRadius = new BorderRadius(_getAllValuesFromPanelBorderRadius());
    borderRadius.refresh();

    copy_text_button($('#copy-text-input'), $('#border-radius-code'));

    /* Border Style */
    $('#select-border').live('change', function () {
        var val = $(this).val();
        borderRadius.borderStyle = val;
        borderRadius.refresh();
    });

    /* Border Radius */
    $('#slider-all-corners').slider({
        value: 10,
        min: 0,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 200);
            borderRadius.setAllCorners(val);
            borderRadius.refresh();

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
        value: 10,
        min: 0,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 200, $('#top-left'));
            borderRadius.topLeft = val;
            borderRadius.refresh();
        }
    });

    $('#slider-top-right').slider({
        value: 10,
        min: 0,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 200, $('#top-right').val(val));
            borderRadius.topRight = val;
            borderRadius.refresh();
        }
    });

    $('#slider-bottom-left').slider({
        value: 10,
        min: 0,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 200, $('#bottom-left'));
            borderRadius.bottomLeft = val;
            borderRadius.refresh();
        }
    });

    $('#slider-bottom-right').slider({
        value: 10,
        min: 0,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 200, $('#bottom-right'));
            borderRadius.bottomRight = val;
            borderRadius.refresh();
        }
    });

    $('#all-corners').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 200, $('#all-corners'));
        borderRadius.setAllCorners(val);
        borderRadius.refresh();

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
        var val = _getFromField($(this).val(), 0, 200, $('#top-left'));
        borderRadius.topLeft = val;
        borderRadius.refresh();

        $('#slider-top-left').slider('value', val);
    });

    $('#top-right').live('keyup', function () {
        var val = _getFromField($(this).val(), 0, 200, $('#top-right'));
        borderRadius.topRight = val;
        borderRadius.refresh();

        $('#slider-top-right').slider('value', val);
    });

    $('#bottom-left').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 200, $('#bottom-left'));
        borderRadius.bottomLeft = val;
        borderRadius.refresh();

        $('#slider-bottom-left').slider('value', val);
    });

    $('#bottom-right').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 200, $('#bottom-right'));
        borderRadius.bottomRight = val;
        borderRadius.refresh();

        $('#slider-bottom-right').slider('value', val);
    });

    /* Border Width */
    $('#slider-border-width').slider({
        value: 0,
        min: 0,
        max: 200,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 200, $('#border-width'));
            borderRadius.borderWidth = val;
            borderRadius.refresh();
        }
    });

    $('#border-width').live('keyup', function() {
        var val = _getFromField($(this).val(), 0, 200, $('#border-width'));
        borderRadius.borderWidth = val;
        borderRadius.refresh();

        $('#slider-border-width').slider('value', val);
    });

    /* Color (Border and background) */
    $('#br-color').live('change', function () {
        borderRadius.borderColor = $(this).val();
        borderRadius.refresh();
        $('#br-color-button').css('background-color', '#' + $(this).val());
    });

    $('#br-background-color').live('change', function () {
        borderRadius.borderBackground = $(this).val();
        borderRadius.refresh();
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
            borderRadius.borderBackground = '#' + hex;
            borderRadius.refresh();
            $('#br-background-color').val('#' + hex);
            $('#br-background-color-button').css('background-color', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            borderRadius.borderBackground = '#' + hex;
            borderRadius.refresh();
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
            borderRadius.borderColor = '#' + hex;
            borderRadius.refresh();
            $('#br-color').val('#' + hex);
            $('#br-color-button').css('background-color', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            borderRadius.borderColor = '#' + hex;
            borderRadius.refresh();
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
