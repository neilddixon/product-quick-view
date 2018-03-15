jQuery(document).ready(function($){
	//final width --> this is the quick view image slider width
	//maxQuickWidth --> this is the max-width of the quick-view panel
	var sliderFinalWidth = 400,
		maxQuickWidth = 900;

	//open the quick view panel
	$('.cd-trigger').on('click', function(event){
		var selectedImage = $(this).parent('.cd-item').children('img'),
			selectedImageUrl = selectedImage.attr('src');

        var selectedItemTitle = $(this).parent('.cd-item').find('[data-id="title"]').first().html();
        var selectedItemDescription = $(this).parent('.cd-item').find('[data-id="description"]').first().html();
        var selectedItemImages = $(this).parent('.cd-item').find('[data-id="images"]').first().children();
        var selectedItemActions = $(this).parent('.cd-item').find('[data-id="item-actions"]').first().children();
        var selectedItemExtraContent = $(this).parent('.cd-item').find('[data-id="extra-content"]').first().children();

        setQuickViewContent(selectedItemTitle,
            selectedItemDescription,
            selectedItemImages.length > 0 ? selectedItemImages : [selectedImage],
            selectedItemActions,
            selectedItemExtraContent);

		$('body').addClass('overlay-layer');
		animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');

		//update the visible slider image in the quick view panel
		//you don't need to implement/use the updateQuickView if retrieving the quick view data with ajax
		updateQuickView(selectedImageUrl);
	});

	//close the quick view panel
	$('body').on('click', function(event){
		if( $(event.target).is('.cd-close') || $(event.target).is('body.overlay-layer')) {
			closeQuickView( sliderFinalWidth, maxQuickWidth);
		}
	});
	$(document).keyup(function(event){
		//check if user has pressed 'Esc'
    	if(event.which=='27'){
			closeQuickView( sliderFinalWidth, maxQuickWidth);
		}
	});

	//quick view slider implementation
	$('.cd-quick-view').on('click', '.cd-slider-navigation a', function(){
		updateSlider($(this));
	});

	//center quick-view on window resize
	$(window).on('resize', function(){
		if($('.cd-quick-view').hasClass('is-visible')){
			window.requestAnimationFrame(resizeQuickView);
		}
	});

	function updateSlider(navigation) {
		var sliderContainer = navigation.parents('.cd-slider-wrapper').find('.cd-slider'),
			activeSlider = sliderContainer.children('.selected').removeClass('selected');
		if ( navigation.hasClass('cd-next') ) {
			( !activeSlider.is(':last-child') ) ? activeSlider.next().addClass('selected') : sliderContainer.children('li').eq(0).addClass('selected');
		} else {
			( !activeSlider.is(':first-child') ) ? activeSlider.prev().addClass('selected') : sliderContainer.children('li').last().addClass('selected');
		} 
	}

	function setQuickViewContent(title, description, images, actions, extraContent){
        var $qvItemInfo = $('.cd-quick-view .cd-item-info');
        var $itemTitleTarget = $qvItemInfo.find('[data-id="title"]');
        var $itemDescriptionTarget = $qvItemInfo.find('[data-id="description"]');
        var $itemActionsTarget = $qvItemInfo.find('[data-id="item-actions"]');
        var $itemExtraContentTarget = $qvItemInfo.find('[data-id="extra-content"]');

        setSliderImages($('.cd-quick-view .cd-slider-wrapper ul.cd-slider'), images);
        setActionItems($itemActionsTarget, actions);
        setExtraContent($itemExtraContentTarget, extraContent);

        var defaultTitle = "Title";
        $itemTitleTarget.html(title ? title : defaultTitle);

        var defaultDescription = "Description";
        $itemDescriptionTarget.html(description ? description : defaultDescription);
	}

	function setSliderImages($qvSlider, images){
        $qvSlider.empty();
        for (var i = 0; i < images.length; i++) {
            var $image = $(images[i]);
            $qvSlider.append("<li>" + $image[0].outerHTML + "</li>");
        }
        var $qvSliderNav = $('.cd-quick-view .cd-slider-navigation');
        if (images.length <= 1){
            $qvSliderNav.hide();
        }else {
            $qvSliderNav.show();
        }
    }

    function setActionItems($itemActionsTarget, actions){
        $itemActionsTarget.empty();
        if (actions.length === 0){
            $itemActionsTarget.hide();
        }else {
            $itemActionsTarget.show();
        }
        for (var i = 0; i < actions.length; i++) {
            var $actionItem = $(actions[i]);
            $itemActionsTarget.append("<li>" + $actionItem[0].outerHTML + "</li>");
        }
    }

    function setExtraContent($itemExtraContentTarget, extraContent){
        if (extraContent){
            $itemExtraContentTarget.empty();
            for (var i = 0; i < extraContent.length; i++) {
                var $extraContentItem = $(extraContent[i]);
                $itemExtraContentTarget.append($extraContentItem[0].outerHTML);
            }
            $itemExtraContentTarget.show();
        }else {
            $itemExtraContentTarget.hide();
        }
    }

	function updateQuickView(url) {
		$('.cd-quick-view .cd-slider li').removeClass('selected').find('img[src="'+ url +'"]').parent('li').addClass('selected');
	}

	function resizeQuickView() {
		var quickViewLeft = ($(window).width() - $('.cd-quick-view').width())/2,
			quickViewTop = ($(window).height() - $('.cd-quick-view').height())/2;
		$('.cd-quick-view').css({
		    "top": quickViewTop,
		    "left": quickViewLeft,
		});
	} 

	function closeQuickView(finalWidth, maxQuickWidth) {
		// var close = $('.cd-close'),
			// activeSliderUrl = close.siblings('.cd-slider-wrapper').find('.selected img').attr('src'),
			selectedImage = $('.empty-box').find('img');
		//update the image in the gallery
		if( !$('.cd-quick-view').hasClass('velocity-animating') && $('.cd-quick-view').hasClass('add-content')) {
			// selectedImage.attr('src', activeSliderUrl);
			animateQuickView(selectedImage, finalWidth, maxQuickWidth, 'close');
		} else {
			closeNoAnimation(selectedImage, finalWidth, maxQuickWidth);
		}
	}

	function animateQuickView(image, finalWidth, maxQuickWidth, animationType) {
		//store some image data (width, top position, ...)
		//store window data to calculate quick view panel position
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width(),
			heightSelected = image.height(),
			windowWidth = $(window).width(),
			windowHeight = $(window).height(),
			finalLeft = (windowWidth - finalWidth)/2,
			finalHeight = finalWidth * heightSelected/widthSelected,
			finalTop = (windowHeight - finalHeight)/2,
			quickViewWidth = ( windowWidth * .8 < maxQuickWidth ) ? windowWidth * .8 : maxQuickWidth ,
			quickViewLeft = (windowWidth - quickViewWidth)/2;

		if( animationType == 'open') {
			//hide the image in the gallery
			parentListItem.addClass('empty-box');
			//place the quick view over the image gallery and give it the dimension of the gallery image
			$('.cd-quick-view').css({
			    "top": topSelected,
			    "left": leftSelected,
			    "width": widthSelected,
			}).velocity({
				//animate the quick view: animate its width and center it in the viewport
				//during this animation, only the slider image is visible
			    'top': finalTop+ 'px',
			    'left': finalLeft+'px',
			    'width': finalWidth+'px',
			}, 1000, [ 400, 20 ], function(){
				//animate the quick view: animate its width to the final value
				$('.cd-quick-view').addClass('animate-width').velocity({
					'left': quickViewLeft+'px',
			    	'width': quickViewWidth+'px',
				}, 300, 'ease' ,function(){
					//show quick view content
					$('.cd-quick-view').addClass('add-content');
				});
			}).addClass('is-visible');
		} else {
			//close the quick view reverting the animation
			$('.cd-quick-view').removeClass('add-content').velocity({
			    'top': finalTop+ 'px',
			    'left': finalLeft+'px',
			    'width': finalWidth+'px',
			}, 300, 'ease', function(){
				$('body').removeClass('overlay-layer');
				$('.cd-quick-view').removeClass('animate-width').velocity({
					"top": topSelected,
				    "left": leftSelected,
				    "width": widthSelected,
				}, 500, 'ease', function(){
					$('.cd-quick-view').removeClass('is-visible');
					parentListItem.removeClass('empty-box');
				});
			});
		}
	}
	function closeNoAnimation(image, finalWidth, maxQuickWidth) {
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width();

		//close the quick view reverting the animation
		$('body').removeClass('overlay-layer');
		parentListItem.removeClass('empty-box');
		$('.cd-quick-view').velocity("stop").removeClass('add-content animate-width is-visible').css({
			"top": topSelected,
		    "left": leftSelected,
		    "width": widthSelected,
		});
	}
});