var noiseTexture;
function NoiseTexture(options) {
    if (!options)
        options = {};

    // The canvas and their dimmension.
    this.width = options['widht'] || 361;
    this.height = options['height'] || 370;

    this.canvas = options['canvas'] || $('#noise-canvas').get(0);
    this.download = options['download'] || $('#download-noise');
    this.cssCode = options['cssCode'] || $('#css-code-noise');

    // The background and noise color.
    this.colorBackground = options['colorBackground'] || new UserColor({format: 'hex', color: '4ea6ca'});
    this.colorNoise = options['colorNoise'] || new UserColor({format: 'hex', color: '626262'});
    this.colorNoise.changeFormatColor('rgb');

    // Opacity, density of the noise.
    this.opacity = options['opacity'] || 15;
    this.density = options['density'] || 50;
    this.exportNoiseTransparent = options['exportNoiseTransparent'] || false;

    this.refreshTimeout = null;
    this.transparentCanvas = null;
    this.widthPanelContent = parseInt($('canvas').parent().css('width'));
    this.heightPanelContent = parseInt($('canvas').parent().css('height'));
    setMarginWidth($(this.canvas), this.widthPanelContent, this.width);
    setMarginHeight($(this.canvas), this.heightPanelContent, this.height);
}

NoiseTexture.prototype.setWidth = function(w) {
    if (!w)
        return false;

    setMarginWidth($(this.canvas), this.widthPanelContent, w);
    this.canvas.width = this.width = w;
    this.refresh();
};

NoiseTexture.prototype.setHeight = function(h) {
    if (!h)
        return false;

    setMarginHeight($(this.canvas), this.heightPanelContent, h);
    this.canvas.height = this.height = h;
    this.refresh();
};

NoiseTexture.prototype.refresh = function() {
    if (this.refreshTimeout) {
        window.clearTimeout(this.refreshTimeout);
    }
    this.generateNoise();
};

NoiseTexture.prototype.refreshAsync = function() {
    var self = this;
    if (this.refreshTimeout) {
        window.clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = window.setTimeout(function() {
        self.generateNoise();
    }, 50);
};

NoiseTexture.prototype.setOpacity = function(op) {
    this.opacity = op;
    this.refreshAsync();
};

NoiseTexture.prototype.setDensity = function(den) {
    this.density = den;
    this.refreshAsync();
};

NoiseTexture.prototype.setNoiseColor = function(hex) {
    this.colorNoise.color = hex;
    this.colorNoise.format = 'hex';
    this.colorNoise.changeFormatColor('rgb');
    this.refreshAsync();
};

NoiseTexture.prototype.setBackgroundColor = function(hex) {
    this.colorBackground.color = hex;
    this.colorBackground.format = 'hex';
    this.refreshAsync();
};

NoiseTexture.prototype.generateNoise = function() {
    var ctx = this.canvas.getContext('2d');

    // Paint the background
    ctx.fillStyle = this.colorBackground.displayColor('rgb');
    ctx.fillRect(0, 0, this.width, this.height);

    // Paint the noise
    this.transparentCanvas = _createNoisyImage(
        this.width, this.height, this.opacity, this.density,
        this.colorNoise.color
    );
    ctx.drawImage(this.transparentCanvas, 0, 0);

    // Css noise
    this.exportNoiseCss();
};

NoiseTexture.prototype.exportNoiseCss = function() {
    var i, canvas, noisyCanvas, background, imgs = [], css = [], backgroundImage;
    var bg, noise, cssCode;

    // bg is in hexadecimal whithout the # character.
    bg = this.colorBackground.displayColor('hex').slice(1);
    if (this.exportNoiseTransparent) {
        background = this.transparentCanvas.toDataURL();
        bg += '00';
    }
    else {
        background = this.canvas.toDataURL();
        bg += 'ff';
    }

    // Download Button
    this.download.attr('href', background);
    this.download.attr('download', 'img-noise-' + this.width + 'x' + this.height + '.png');

    // Generate css code
    noise = this.colorNoise.displayColor('hex').slice(1);
    cssCode = 'background-url: http://api.thumbr.it/whitenoise-' +
              this.width + 'x' + this.height + '.png?background=' + bg + '&noise=' + noise +
              '&density=' + this.density + '&opacity=' + this.opacity + '\n';
    this.cssCode.html('<p>' + cssCode + '<p>');
};

function _createNoisyImage(width, height, opacity, density, noisyColor) {
    var canvas = document.createElement('canvas'),
        ctx, i, x, y;
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    for (i = 0; i < width * height * density / 100; i += 1) {
        x = Math.floor(Math.random() * width);
        y = Math.floor(Math.random() * height);
        op = Math.random() * opacity / 100;
        ctx.fillStyle = 'rgba(' + noisyColor.r + ', ' + noisyColor.g + ', ' + noisyColor.b + ', ' + op + ')';
        ctx.fillRect(x, y, 1, 1);
    }
    return canvas;
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

$('body').ready(function() {
    var defaultOpacity = $('#noise-opacity').val(),
        defaultDensity = $('#noise-density').val();

    noiseTexture = new NoiseTexture({
        opacity: defaultOpacity,
        density: defaultDensity,
        colorBackground: new UserColor({format: 'hex', color: $('#bg-color').val()}),
        colorNoise: new UserColor({format: 'hex', color: $('#noise-color').val()})
    });
    noiseTexture.generateNoise();
    copy_text_button($('#copy-text-noise-texture'), $('#css-code-noise'));

    $('#noise-opacity-sb').slider({
        value: defaultOpacity,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 100, $('#noise-opacity'));
            noiseTexture.setOpacity(parseFloat(ui.value));
        }
    });

    $('#noise-density-sb').slider({
        value: defaultDensity,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            var val = _getFromField(ui.value, 0, 100, $('#noise-density'));
            noiseTexture.setDensity(parseFloat(ui.value));
        }
    });

    // colorpicker component
    $('#background-color-btn').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            noiseTexture.setBackgroundColor(hex);
            $('#background-color-btn').css('background', '#' + hex);
            $('#bg-color').val('#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            noiseTexture.setBackgroundColor(hex);
            $('#background-color-btn').css('background', '#' + hex);
            $('#bg-color').val('#' + hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($('#bg-color').val());
        }
    });

    // colorpicker component
    $('#noise-color-btn').ColorPicker({
        onChange: function(hsb, hex, rgb, el) {
            noiseTexture.setNoiseColor(hex);
            $('#noise-color').val('#' + hex);
            $('#noise-color-btn').css('background', '#' + hex);
        },
        onSubmit: function(hsb, hex, rgb, el) {
            noiseTexture.setNoiseColor(hex);
            $('#noise-color').val('#' + hex);
            $('#noise-color-btn').css('background', '#' + hex);
            $(el).ColorPickerHide();
        },
        onBeforeShow: function () {
            $(this).ColorPickerSetColor($('#noise-color').val());
        }
    });
});

$('#noise-opacity').live('keyup', function() {
    var val = _getFromField($(this).val(), 0, 100, $('#noise-opacity'));
    $('#noise-opacity-sb').slider('value', val);
    noiseTexture.setOpacity(val);
});

$('#noise-density').live('keyup', function () {
    var val = _getFromField($(this).val(), 0, 100, $('#noise-density'));
    $('#noise-density-sb').slider('value', val);
    noiseTexture.setDensity(val);
});

$('#width').live('keyup', function() {
    var val = _getFromField($(this).val(), 1, 2000, $('#width'));
    noiseTexture.setWidth(parseInt(val));
});

$('#height').live('keyup', function() {
    var val = _getFromField($(this).val(), 1, 2000, $('#height'));
    noiseTexture.setHeight(parseInt(val));
});

$('#bg-color').live('change', function () {
    var color = $(this).val();
    noiseTexture.setBackgroundColor(color);
    $('#background-color-btn').val(color);
});

$('#noise-color').live('change', function () {
    var color = $(this).val();
    noiseTexture.setNoiseColor(hex);
    $('#noise-color-btn').val($(this).val());
});

$('#background-color-btn').live('click', function() {
    $(this).ColorPickerShow();
});

// colorpicker component
$('#noise-color-btn').live('click', function() {
    $(this).ColorPickerShow();
});

$('#export-noise-transparent-btn').live('click', function (){
    var yes = $(this).find('.right-pos').length > 0;
    noiseTexture.exportNoiseTransparent = yes;
    noiseTexture.generateNoise();
});


function setMarginWidth(element, wPanel, wCanvas) {
    var marginLeft = (wPanel - wCanvas) / 2;
    if (marginLeft < 0) {
        marginLeft = 0;
    }
    element.css('margin-left', marginLeft + 'px');
}

function setMarginHeight(element, hPanel, hCanvas) {
    var marginTop = (hPanel - hCanvas) / 2;
    if (marginTop < 0) {
        marginTop = 0;
    }
    element.css('margin-top', marginTop + 'px');
}