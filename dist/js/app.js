(function ($,undefined){

	var SCRIPT    = {},

	CONTROLLER    = {},

	LAYOUT		  = {},

	DOM		      = {},

	TRANSITIONEND = 'webkitTransitionEnd msTransitionEnd oTransitionEnd transitionend';

	CONTROLLER['home'] = {};

	CONTROLLER['home']['_constructor'] = function(){
		
		// Intro

		$('.fade-in-scale').one(TRANSITIONEND,function(){

			$(this).removeClass('fade-in-scale').css({
			    '-webkit-transition-delay' : '',
	               '-moz-transition-delay' : '',
	                '-ms-transition-delay' : '',
	                 '-o-transition-delay' : '',
	                    'transition-delay' : ''
			});

		});

		$('#home-section-1').addClass('intro');

		// News and articles carousel
		var $hs3 	   = $('#home-section-1'),

		$news_articles = $hs3.find('.news-articles'),

		$news_article  = $news_articles.find('.news-article'),

		$owl_carousel  = $hs3.find('.owl-carousel'),

		$owl_carousel_outer, $owl_carousel_item,

		na_resize  = function () {
				
			var na_height = 0 , oco_height = $owl_carousel_outer.outerHeight();

			$news_article.each(function () {
				var height = $(this).outerHeight()

				if(height > na_height) na_height = height;
			});

			$news_articles.height( DOM.WINDOW.width() < 992 ? na_height : oco_height );
		};	

		$owl_carousel.append($news_article.find('.news-article-thumbnail').removeClass('hide')).owlCarousel({
			// center 	  : true,
			items 	  : 1,
			mouseDrag : false,
			nav 	  : true,
			navText   : ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>']
		});

		$owl_carousel_outer = $owl_carousel.find('.owl-stage-outer');
		$owl_carousel_item	= $owl_carousel_outer.find('.owl-item');

		na_resize();

		$owl_carousel.on('resized.owl.carousel',na_resize);

		$owl_carousel.on('changed.owl.carousel',function(){

			$news_article.filter('.active').off(TRANSITIONEND).removeClass('active').on(TRANSITIONEND,function () {
				$news_article.eq( $owl_carousel_item.filter('.active').index() ).addClass('active');
			});

		});

		// Put header in main inner
		$('main[role="main"] > .inner').prepend( $('header[role="banner"]') );
		// Put footer in home section 4
		$('#footer-append-container').append( $('footer[role="contentinfo"]') );
	};

	// Transition Delay
	SCRIPT['trans-delay'] = function(element, options){

		options = EXTENDOPTIONS({
			time : '0s'
		},options)

		$(element).css({
		    '-webkit-transition-delay' : options.time,
               '-moz-transition-delay' : options.time,
                '-ms-transition-delay' : options.time,
                 '-o-transition-delay' : options.time,
                    'transition-delay' : options.time
		});

	};	

	SCRIPT['owl-carousel'] = function(element, options){

		options = $.extend({},{
			nav: true,
			navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>']
		},options);

		$(element).owlCarousel(options);

	};	

	LAYOUT['fullpage'] = function(){

		var $fullpage   = $('main[role="main"] > .inner'),

		section_resize = function(){

			var flag = DOM.WINDOW.outerWidth() > 992;

			$.fn.fullpage.setMouseWheelScrolling(flag);
    		$.fn.fullpage.setAllowScrolling(flag);

		};

		$fullpage.fullpage({
			navigation		 : true,
			section 	     : 'section',
			verticalCentered : false,
			onLeave 	     : function(index, nextIndex, direction){
				$fullpage.trigger('fullpage.onLeave',[index, nextIndex, direction]);
			}
			// afterRender		 : function(){
			// 	$fullpage.trigger('fullpage.afterRender');
			// }
		});

		section_resize();

		DOM.WINDOW.on('resize',section_resize);

	};

	// Extend only property that provided by target object
	function EXTENDOPTIONS(target, source){
		for(var name in target) 
		{
			if ( typeof source[name] !== 'undefined' ) target[name] = source[name];
		}

		return target;
	}

	// Register script in jquery prototype
	function REGISTERJQUERYFN(name, object){
		$.fn[name] = function(options) {

            if ( this.length ) {
                return this.each(function() {
                    if ( ! $.data(this, name) ) {

                        $.data( this, name, new object(this, options));

                    }
                });
            }

        };

        $.fn[name].Constructor = object;
	}

	$(function(){

		// Cache DOM
		DOM = {

			WINDOW  :  $(window),

			BODY    :  $('body')

		
		};

		// Register all function in SCRIPT to jquery prototype
	    $.each(SCRIPT,function(name,obj){

	    	if( typeof obj === 'function' ) REGISTERJQUERYFN(name,obj);

	    });

	   	// Get all data-script and execute its function
	    $('[data-script]').each(function(){
	    	
	    	var that   = $(this),

	    		data   = that.data(),

	    		script = data.script;

	    	delete data.script;

	    	that[ script ]( data );

	    });
	    
	    // Render page layout
	   	$.each(DOM.BODY.attr('class').split(' '),function(index,class_name){

	   		if( class_name.indexOf("-layout") > -1 )
	   		{
	   			var layout = class_name.replace('-layout','');

	   			if( LAYOUT.hasOwnProperty( layout )  && 
	   				typeof LAYOUT[ layout ] === 'function' 
	   			) LAYOUT[ layout ]();		
	   		}

	   	});

	    //Get all data-controller and execute its action

	    $('[data-controller]').each(function(){
	    	
	    	var that 	   = $(this),

	    		data 	   = that.data(),

	    		controller = data.controller,

	    		action     = data.action;

	    	delete data.controller;
	    	delete data.action;

	    	if( $.isPlainObject(CONTROLLER[controller]) )
	    	{
	    		if( CONTROLLER[ controller ].hasOwnProperty('_constructor') && 
	    			typeof CONTROLLER[ controller ]['_constructor'] === 'function' )
	    			CONTROLLER[ controller ]['_constructor'](data);

	    		if( CONTROLLER[ controller ].hasOwnProperty(action) &&
	    			typeof CONTROLLER[ controller ][action] === 'function' ) 
	    			CONTROLLER[ controller ][action](data);
	    	} 
	    	
	    });   

	});	

})(jQuery);
//# sourceMappingURL=app.js.map
