'use strict';

angular.module('aApp')
  .service('Geometry', function Geometry($rootScope,jquery) {
    // AngularJS will instantiate a singleton by calling "new" on this function

  var $ = jquery;
  
	function myResize() {
		
		var $w = $(window);
		var $c = $('.container');
		var $cc = $('.webgo-control-container');


		var w = $w.width();
		var h = $w.height();
		var limit, other;
		
		if (w > h) {
			
			$c.addClass('horizontal')
			  .removeClass('vertical');
			$rootScope.orientation = 'horizontal';
			limit = h;
			other = w;
			$cc.css('max-width',other - limit + 8);
			$cc.css('max-height',null);
			
		} else {
			
			$c.removeClass('horizontal')
			  .addClass('vertical');
			$rootScope.orientation = 'vertical';
			limit = w;
			other = h;
			$cc.css('max-width',null);
			$cc.css('max-height',other - limit + 8);
			
		}
		
    var boardSize = limit - 16; // body margin = 8px * 2
    
		console.log($rootScope.orientation);
		$c.attr('data-limit',limit);
    
    $('.dummy-board')
      .css('width',boardSize)
		  .css('height',boardSize);
    $('.dummy-inner')
      .css('width',boardSize-100)
		  .css('height',boardSize-100);
      
    var limitAndControls = limit + 150;
    if (w > limit + 150) {
      $c.css('max-width', limitAndControls)
        .css('margin-left', (w - limitAndControls) / 2);
      $cc.css('max-width',150);
    }
    
		$rootScope.boardPixels = boardSize;
		$rootScope.containerPixels = other - limit;

	}

	$(window).resize( function () {$rootScope.$apply(myResize); } );
	myResize();
	
});

