/**
 *   Unslider
 *   version 2.0
 *   by @idiot and friends
 */
 
(function($) {
	//  Don't throw errors if we haven't included jQuery
	if(!$) {
		return alert('Unslider requires jQuery to function. Make sure you\'ve included jQuery in the source code before Unslider.');
	}

	$.Unslider = function(context, options) {
		var self = this;

		//  Set defaults
		this.$context = context;
		this.options = {};

		//  Leave our elements blank for now
		//  Since they get changed by the options, we'll need to
		//  set them in the init method.
		this.$container = null;
		this.$slides = null;
		
		//  Set our indexes and totals
		this.total = 0;
		this.current = 0;

		//  Generate a specific random ID so we don't dupe events
		this.sliderID = ~~(Math.random() * 2e3);

		//  Get everything set up innit
		this.init = function(options) {
			//  Set up our options inside here so we can re-init at
			//  any time
			this.options = $.extend($.Unslider.defaults, options);

			//  We want to keep this script as small as possible
			//  so we'll optimise some checks
			['nav', 'arrows', 'keys'].forEach(function(module) {
				//  If it's not explicitly set to be false, let's call it
				//  otherwise we'll assume it's turned off.
				if(self.options[module] !== false) {
					self['init' + self._ucfirst(module)]();
				}
			});


			this.$container = this.$context.find(this.options.selectors.container);
			this.$slides = this.$container.children(this.options.selectors.slides);

			//  We'll manually init the container
			this.setup();

			//  Everyday I'm chainin
			return this;
		};

		this.setup = function() {
			//  Add a CSS hook to the main element
			this.$context.addClass('unslider');

			//  We need to manually check if the container is absolutely
			//  or relatively positioned
			var position = this.$context.css('position');
			var positions = ['relative', 'absolute'];

			//  If we don't already have a position set, we'll
			//  automatically set it ourselves
			if($.inArray(position, positions) < 0) {
				this.$context.css('position', positions[0]);
			}

			this.$context.css('overflow', 'hidden');

			//  We should be able to recalculate slides at will
			this.calculateSlides();
		};

		//  
		this.calculateSlides = function() {
			this.total = this.$slides.length;

			//  Set the total width
			this.$container.css('width', (this.total * 100) + '%');
			this.$slides.css('width', (100 / this.total) + '%');
		};

		//  Set up our navigation
		this.initNav = function() {
			// @TODO
		};


		//  Set up our navigation
		this.initArrows = function() {
			// @TODO
		};


		//  Set up our navigation
		this.initKeys = function() {
			if(this.options.keys === true) {
				this.options.keys = $.Unslider.defaults.keys;
			}

			$(document).on('keyup.unslider-' + this.sliderID, function(e) {
				$.each(self.options.keys, function(key, val) {
					if(e.which === val) {
						$.isFunction(self[key]) && self[key].call(self);
					}
				});
			});
		};

		this.destroyKeys = function() {
			$(document).off('keyup.unslider-' + this.sliderID);
		}

		this.setIndex = function(to) {
			if(to < 0) {
				to = this.total - 1;
			}

			this.current = Math.min(Math.max(0, to), this.total - 1);
		};
		
		//  Despite the name, this doesn't do any animation - since there's
		//  now three different types of animation, we let this method delegate
		//  to the right type, keeping the name for backwards compat.
		this.animate = function(to) {
			this.setIndex(to);

			//  Delegate the right method - everything's named consistently
			//  so we can assume it'll be called "animate" + 
			var fn = 'animate' + this._ucfirst(this.options.animation);

			//  Make sure it's a valid animation method, otherwise we'll get
			//  a load of bug reports that'll be really hard to report
			if($.isFunction(this[fn])) {
				return this[fn](this.current);
			}

			return this._console('Not a valid Unslider animation method.', 'warn');
		};

		this.next = function() {
			var target = this.current + 1;

			if(target >= this.total) {
				target = 0;
			}

			return this.animate(target);
		};

		this.prev = function() {
			return this.animate(this.current - 1);
		};
		

		//  Our default animation method, the old-school left-to-right
		//  horizontal animation
		this.animateHorizontal = function(to) {
			if(this.options.animateHeight) {
				this.$context.css('height', this.$slides.eq(to).height());
			}

			return this.$container.transform('translateX(-' + ((100 / this.total) * to) + '%)');
		};


		//  Everything beginning with _ is a helper method and shouldn't be
		//  used externally if you can jolly well help it.
		this._console = function(msg, type) {
			//  If we've not got console support or debugging is turned off
			//  this is all a bit of a waste so we'll just leave it here.
			if(this.options.debug !== true || typeof window.console !== "object") {
				return;
			}

			//  Set a default console type. It's more than likely going to be
			//  console.log() but we have some errors and what not as well.
			type = type || 'log';

			//  And that's our little wrapper. Very neat.
			return console[type](msg);
		}


		//  Unfortunately JavaScript doesn't have a ucfirst() function
		//  (one of the good things about PHP!) so this is a workaround for that
		this._ucfirst = function(str) {
			//  Take our variable, run a regex on the first letter
			return str.toString().toLowerCase().replace(/^./, function(match) {
				//  And uppercase it. Simples.
				return match.toUpperCase();
			})
		}
		

		//  Allow daisy-chaining of methods
		return this.init();
	};

	//  Our default option
	//  You can set these before instantiation by changing
	//  $.Unslider.defaults['name'] = "whatever";
	//  but it won't affect any existing sliders.
	$.Unslider.defaults = {
		//  Should Unslider throw any errors or warnings?
		//  (except the jQuery one, that's sort of just there)
		//  Only accepts a boolean true/false
		debug: true,

		//  Speeds are set in milliseconds, pass as a number
		//  or jQuery string: api.jquery.com/animate#duration
		speed: 300,
		
		//  3 second delay between slides moving, pass
		//  as a number in milliseconds.
		delay: 3000,
		
		//  Does it support keyboard arrows?
		//  Can pass either true or false -
		//  or an object with the keycodes, like so:
		//  {
		//	 prev: 37,
		//	 next: 39
		// }
		//  You can call any internal method name
		//  before the keycode and it'll be called.
		keys: {
			prev: 37,
			next: 39
		},
		
		//  Do you want to generate clickable navigation
		//  to skip to each slide? Only accepts boolean true/false
		nav: true,

		//  Should there be left/right arrows to go back/forth?
		//  This isn't keyboard support. Only accepts true/false.
		arrows: true,
		
		//  Should the slider move on its own or only when
		//  you interact with the nav/arrows?
		//  Only accepts boolean true/false.
		autoplay: false,

		//  How should Unslider animate?
		//  It can do one of the following types:
		//  "fade": each slide fades in to each other
		//  "horizontal": each slide moves from left to right
		//  "vertical": each slide moves from top to bottom
		animation: 'horizontal',

		//  jQuery UI easing type
		//  see jqueryui.com/easing for a full list
		easing: 'swing',

		//  If you don't want to use a list to display your slides,
		//  you can change it here. Not recommended and you'll need
		//  to adjust the CSS accordingly.
		selectors: {
			container: 'ul:first',
			slides: 'li'
		},

		//  Do you want to animate the heights of each slide as
		//  it moves
		animateHeight: true
	};

	$.fn.transform = function(val) {
		return this.css({
			webkitTransform: val,
			msTransform: val,
			transform: val
		});
	}

	   
	//  And set up our jQuery plugin
	$.fn.unslider = function(opts) {
		return this.each(function() {
			var $this = $(this);
			return $this.data('unslider', new $.Unslider($this, opts));
		});
	};
	
})(window.jQuery || false);