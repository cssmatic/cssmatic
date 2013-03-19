function copy_text_button(copyElement, cssElement) {
    copyElement.zclip({
        path: '/js/ZeroClipboard.swf',
        copy: function() {
            var text = cssElement.text();
            text = text.replace(/;/g, ';\n').replace(/\n$/, '');
            return text;
        },
        afterCopy: function() {
            copyElement.addClass('in');
        }
    });
}
