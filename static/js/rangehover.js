$.fn.rangehover = function() {
    this.after('<output class="rangebubble"></output>');
    this.on('input', function() {
        var newPoint, newPlace, offset, el = $(this);
        var offsetInput = el.offset();
     
        // Measure width of range input
        width = el.width();

        // Figure out placement percentage between left and right of input
        newPoint = (el.val() - el.attr("min")) / (el.attr("max") - el.attr("min"));

        // Janky value to get pointer to line up better
        offset = -1;

        // Prevent bubble from going beyond left or right (unsupported browsers)
        if (newPoint < 0) {
            newPlace = 0;
        }
        else if (newPoint > 1) {
            newPlace = width;
        }
        else {
            newPlace = width * newPoint + offset; offset -= newPoint;
        }
        newPlace += offsetInput.left;

        // Move bubble
        var output = el.next("output");
        output.css({
            left: newPlace,
            top: offsetInput.top - output.height() - 4,
            marginLeft: offset + "%"
        }).text(el.val());
    });
    this.on('mouseenter', function() {
        $(this).next('output').show();
    });
    this.on('mouseleave', function() {
        $(this).next('output').hide();
    });
};
