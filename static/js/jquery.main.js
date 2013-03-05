// page init
jQuery(function(){
	initSwithers();
});

// init swithers
function initSwithers() {
	var activeClass = 'selected';
	var leftClass = 'left-pos';
	var rightClass = 'right-pos';
	jQuery('.slider-block').each(function(){
		var swither = jQuery(this);
		var dot = swither.find('.dot');
		var slider = swither.find('.knob');
		swither.click(function(){
			if(dot.length){
				if(dot.eq(0).hasClass(activeClass)){
					dot.eq(0).removeClass(activeClass);
					dot.eq(1).addClass(activeClass);
				} else {
					dot.eq(0).addClass(activeClass);
					dot.eq(1).removeClass(activeClass);
				}
			}
			if(slider.hasClass(leftClass)){
				slider.removeClass(leftClass).addClass(rightClass);
			} else {
				slider.removeClass(rightClass).addClass(leftClass);
			}
		});
	});
}