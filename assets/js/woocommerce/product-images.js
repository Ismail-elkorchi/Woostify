/**
 * Product images
 *
 * @package
 */

/* global jQuery woostify_product_images_slider_options, woostify_variation_gallery, woostify_default_gallery */

'use strict';

// Create product images item.
function createImages( fullSrc, src, size ) {
	let item = '<figure class="image-item ez-zoom" itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">';
	item += '<a href=' + fullSrc + ' data-size=' + size + ' itemprop="contentUrl" data-elementor-open-lightbox="no">';
	item += '<img src=' + src + ' itemprop="thumbnail">';
	item += '</a>';
	item += '</figure>';

	return item;
}

// Create product thumbnails item.
function createThumbnails( src ) {
	let item = '<div class="thumbnail-item">';
	item += '<img src="' + src + '">';
	item += '</div>';

	return item;
}

// Sticky summary for list layout.
function woostifyStickySummary() {
	if ( ! woostify_woocommerce_general.enabled_sticky_product_summary ) {
		return;
	}
	const gallery = document.querySelector( '.has-gallery-list-layout .product-gallery.has-product-thumbnails' ),
		summary = document.querySelector( '.has-gallery-list-layout .product-summary' );
	if ( ! gallery || ! summary || window.innerWidth < 992 ) {
		return;
	}

	if ( gallery.offsetHeight <= summary.offsetHeight ) {
		return;
	}

	const sidebarStickCmnKy = new WSYSticky(
		'.summary.entry-summary',
		{
			stickyContainer: '.product-page-container',
			marginTop: parseInt( woostify_woocommerce_general.sticky_top_space ),
			marginBottom: parseInt( woostify_woocommerce_general.sticky_bottom_space ),
		}
	);

	// Update sticky when found variation.
	jQuery( 'form.variations_form' ).on(
		'found_variation',
		function() {
			sidebarStickCmnKy.update();
		}
	);
}

document.addEventListener(
	'DOMContentLoaded',
	function() {
		let gallery = document.querySelector( '.product-gallery' ),
			productThumbnails = document.getElementById( 'product-thumbnail-images' ),
			noSliderLayout = gallery ? ( gallery.classList.contains( 'column-style' ) || gallery.classList.contains( 'grid-style' ) ) : false;

		const prevBtn = document.createElement( 'button' );
		const nextBtn = document.createElement( 'button' );

		let mobileSlider;

		// Product images.
		let imageCarousel,
			options = woostify_product_images_slider_options.main;

		// Product thumbnails.
		const firstImage = gallery ? gallery.querySelector( '.image-item img' ) : false,
			firstImageHeight = firstImage ? firstImage.offsetHeight : 0;

		let thumbCarousel,
			thumbOptions = woostify_product_images_slider_options.thumb;

		if (
			window.matchMedia( '( min-width: 768px )' ).matches &&
			gallery &&
			gallery.classList.contains( 'vertical-style' )
		) {
			thumbOptions.draggable = false;
		}

		if ( productThumbnails ) {
			options.on = {
				ready() {
					changeImageCarouselButtonIcon();
					if ( window.matchMedia( '( min-width: 768px )' ).matches && gallery && gallery.classList.contains( 'vertical-style' ) ) {
						calculateVerticalSliderHeight();
					}
				},
			};

			imageCarousel = new Flickity( options.container, options );

			calculateThumbnailTotalWidth();

			if ( gallery ) {
				if ( window.matchMedia( '( max-width: 767px )' ).matches ) {
					thumbCarousel = new Flickity( thumbOptions.container, thumbOptions );
				} else if ( gallery.classList.contains( 'vertical-style' ) ) {
					verticalThumbnailSliderAction();
					addThumbButtons();
				} else {
					thumbCarousel = new Flickity( thumbOptions.container, thumbOptions );
				}
			}
		}

		function calculateVerticalSliderHeight() {
			const currFirstImage = gallery ? gallery.querySelector( '.image-item img' ) : false;
			const currFirstImageHeight = currFirstImage ? currFirstImage.offsetHeight : 0;
			productThumbnails.style.maxHeight = currFirstImageHeight + 'px';
		}

		function calculateThumbnailTotalWidth() {
			if ( ! productThumbnails ) {
				return;
			}

			if ( gallery && ( gallery.classList.contains( 'horizontal-style' ) || window.matchMedia( '( max-width: 767px )' ).matches ) ) {
				const thumbEls = productThumbnails.querySelectorAll( '.thumbnail-item' );
				let totalWidth = 0;

				if ( thumbEls.length ) {
					thumbEls.forEach(
						function( thumbEl ) {
							let thumbWidth = thumbEl.offsetWidth;
							thumbWidth += parseInt( window.getComputedStyle( thumbEl ).getPropertyValue( 'margin-left' ) );
							thumbWidth += parseInt( window.getComputedStyle( thumbEl ).getPropertyValue( 'margin-right' ) );
							totalWidth += thumbWidth;
						}
					);
				}

				if ( totalWidth >= productThumbnails.offsetWidth ) {
					thumbOptions.groupCells = '60%';
					thumbOptions.wrapAround = true;
					if ( thumbCarousel && thumbCarousel.slider ) {
						thumbCarousel.destroy();
						thumbCarousel = new Flickity( thumbOptions.container, thumbOptions );
					}
				} else {
					thumbOptions.groupCells = '3';
					thumbOptions.wrapAround = false;
					if ( thumbCarousel && thumbCarousel.slider ) {
						thumbCarousel.destroy();
						thumbCarousel = new Flickity( thumbOptions.container, thumbOptions );
					}
				}
			}
		}

		function changeImageCarouselButtonIcon() {
			const imageNextBtn = document.querySelector( '.flickity-button.next' );
			const imagePrevBtn = document.querySelector( '.flickity-button.previous' );

			if ( imageNextBtn ) {
				imageNextBtn.innerHTML = woostify_product_images_slider_options.next_icon;
			}

			if ( imagePrevBtn ) {
				imagePrevBtn.innerHTML = woostify_product_images_slider_options.prev_icon;
			}
		}

		window.addEventListener(
			'resize',
			function() {
				if ( window.matchMedia( '( min-width: 768px )' ).matches && gallery && gallery.classList.contains( 'vertical-style' ) && productThumbnails ) {
					calculateVerticalSliderHeight();
					verticalThumbnailSliderAction();

					displayThumbButtons();
				}
				calculateThumbnailTotalWidth();
			}
		);

		function displayThumbButtons() {
			const thumbs = productThumbnails.querySelectorAll( '.thumbnail-item' );
			let totalThumbHeight = 0;
			if ( thumbs.length ) {
				thumbs.forEach(
					function( thumb ) {
						let thumbHeight = thumb.offsetHeight;
						thumbHeight += parseInt( window.getComputedStyle( thumb ).getPropertyValue( 'margin-top' ) );
						thumbHeight += parseInt( window.getComputedStyle( thumb ).getPropertyValue( 'margin-bottom' ) );
						totalThumbHeight += thumbHeight;
					}
				);
			}

			if ( totalThumbHeight > productThumbnails.offsetHeight ) {
				productThumbnails.classList.add( 'has-buttons' );
				nextBtn.style.display = 'block';
				prevBtn.style.display = 'block';
			} else {
				productThumbnails.classList.remove( 'has-buttons' );
				nextBtn.style.display = 'none';
				prevBtn.style.display = 'none';
			}
		}
		function addThumbButtons() {
			const productThumbnailsWrapper = productThumbnails.parentElement;
			prevBtn.classList.add( 'thumb-btn', 'thumb-prev-btn', 'prev' );
			prevBtn.innerHTML = woostify_product_images_slider_options.vertical_prev_icon;

			nextBtn.classList.add( 'thumb-btn', 'thumb-next-btn', 'next' );
			nextBtn.innerHTML = woostify_product_images_slider_options.vertical_next_icon;

			productThumbnailsWrapper.appendChild( prevBtn );
			productThumbnailsWrapper.appendChild( nextBtn );

			displayThumbButtons();

			const thumbButtons = document.querySelectorAll( '.thumb-btn' );
			if ( thumbButtons.length ) {
				thumbButtons.forEach(
					function( thumbBtn ) {
						thumbBtn.addEventListener(
							'click',
							function() {
								const currBtn = this;
								if ( currBtn.classList.contains( 'prev' ) ) {
									imageCarousel.previous();
								} else {
									imageCarousel.next();
								}
							}
						);
					}
				);
			}
		}

		// For Grid layout on mobile.
		function woostifyGalleryCarouselMobile() {
			const mobileGallery = document.querySelector( '.has-gallery-list-layout .product-gallery.has-product-thumbnails' );
			if ( ! mobileGallery || window.innerWidth > 991 ) {
				return;
			}

			options.on = {
				ready() {
					changeImageCarouselButtonIcon();
				},
			};
			mobileSlider = new Flickity( '#product-images', options );
		}

		function verticalThumbnailSliderAction() {
			const thumbNav = productThumbnails;
			const thumbNavImages = thumbNav.querySelectorAll( '.thumbnail-item' );

			thumbNavImages[ 0 ].classList.add( 'is-nav-selected' );
			thumbNavImages[ 0 ].classList.add( 'is-selected' );

			thumbNavImages.forEach(
				function( thumbNavImg, thumbIndex ) {
					thumbNavImg.addEventListener(
						'click',
						function() {
							imageCarousel.select( thumbIndex );
						}
					);
				}
			);

			const thumbImgHeight = 0 < imageCarousel.selectedIndex ? thumbNavImages[ imageCarousel.selectedIndex ].offsetHeight : thumbNavImages[ 0 ].offsetHeight;
			const thumbHeight = thumbNav.offsetHeight;

			imageCarousel.on(
				'select',
				function() {
					thumbNav.querySelectorAll( '.thumbnail-item' ).forEach(
						function( thumb ) {
							thumb.classList.remove( 'is-nav-selected', 'is-selected' );
						}
					);

					const selected = 0 <= imageCarousel.selectedIndex ? thumbNavImages[ imageCarousel.selectedIndex ] : thumbNavImages[ 0 ];
					selected.classList.add( 'is-nav-selected', 'is-selected' );

					const scrollY = selected.offsetTop + thumbNav.scrollTop - ( thumbHeight + thumbImgHeight ) / 2;
					thumbNav.scrollTo(
						{
							top: scrollY,
							behavior: 'smooth',
						}
					);
				}
			);
		}

		// Reset carousel.
		function resetCarousel() {
			if ( imageCarousel && imageCarousel.slider ) {
				imageCarousel.select( 0 );
			}
			if ( mobileSlider && mobileSlider.slider ) {
				mobileSlider.select( 0 );
			}
		}

		// Update gallery.
		function updateGallery( data, reset, variationId ) {
			if ( ! data.length ) {
				return;
			}

			let images = '',
				thumbnails = '';

			for ( let i = 0, j = data.length; i < j; i++ ) {
				if ( reset ) {
					// For reset variation.
					var size = data[ i ].full_src_w + 'x' + data[ i ].full_src_h;

					images += createImages( data[ i ].full_src, data[ i ].src, size );
					thumbnails += createThumbnails( data[ i ].gallery_thumbnail_src );
				} else if ( variationId && variationId == data[ i ][ 0 ].variation_id ) {
					// Render new item for new Slider.
					if ( 1 >= ( data[ i ].length - 1 ) ) {
						thumbnails = '';
						for ( var x = 1, y = data[ i ].length; x < y; x++ ) {
							var size = data[ i ][ x ].full_src_w + 'x' + data[ i ][ x ].full_src_h;
							images += createImages( data[ i ][ x ].full_src, data[ i ][ x ].src, size );
						}
					} else {
						for ( var x = 1, y = data[ i ].length; x < y; x++ ) {
							var size = data[ i ][ x ].full_src_w + 'x' + data[ i ][ x ].full_src_h;
							images += createImages( data[ i ][ x ].full_src, data[ i ][ x ].src, size );
							thumbnails += createThumbnails( data[ i ][ x ].gallery_thumbnail_src );
						}
					}
				}
			}

			if ( imageCarousel && imageCarousel.slider ) {
				imageCarousel.destroy();
			}

			if ( thumbCarousel && thumbCarousel.slider ) {
				thumbCarousel.destroy();
			}

			if ( mobileSlider && mobileSlider.slider ) {
				mobileSlider.destroy();
			}

			// Append new markup html.
			if ( images && document.querySelector( '.product-images' ) ) {
				document.querySelector( '.product-images' ).querySelector( '#product-images' ).innerHTML = images;
			}

			if ( document.querySelector( '.product-thumbnail-images' ) ) {
				if ( '' !== thumbnails ) {
					let productThumbnailsWrapper = document.querySelector( '.product-thumbnail-images' ).querySelector( '#product-thumbnail-images' );

					if ( ! productThumbnailsWrapper ) {
						productThumbnailsWrapper = document.createElement( 'div' );
						productThumbnailsWrapper.setAttribute( 'id', 'product-thumbnail-images' );
					}

					document.querySelector( '.product-thumbnail-images' ).appendChild( productThumbnailsWrapper ).innerHTML = thumbnails;

					if ( document.querySelector( '.product-gallery' ) ) {
						document.querySelector( '.product-gallery' ).classList.add( 'has-product-thumbnails' );
					}
				} else {
					document.querySelector( '.product-thumbnail-images' ).innerHTML = '';
				}
			}

			// Re-init slider.
			if ( ! noSliderLayout ) {
				productThumbnails = document.getElementById( 'product-thumbnail-images' );
				if ( productThumbnails ) {
					options.on = {
						ready() {
							changeImageCarouselButtonIcon();
							if ( window.matchMedia( '( min-width: 768px )' ).matches && gallery && gallery.classList.contains( 'vertical-style' ) ) {
								calculateVerticalSliderHeight();
							}
						},
					};

					imageCarousel = new Flickity( options.container, options );

					calculateThumbnailTotalWidth();

					if ( gallery ) {
						if ( window.matchMedia( '( max-width: 767px )' ).matches ) {
							thumbCarousel = new Flickity( thumbOptions.container, thumbOptions );
						} else if ( gallery.classList.contains( 'vertical-style' ) ) {
							verticalThumbnailSliderAction();
							addThumbButtons();
						} else {
							thumbCarousel = new Flickity( thumbOptions.container, thumbOptions );
						}
					}
				}
			} else {
				woostifyGalleryCarouselMobile();
			}

			// Hide thumbnail slider if only thumbnail item.
			const getThumbnailSlider = document.querySelectorAll( '.product-thumbnail-images .thumbnail-item' );
			if ( document.querySelector( '.product-thumbnail-images' ) ) {
				if ( getThumbnailSlider.length < 2 ) {
					document.querySelector( '.product-thumbnail-images' ).classList.add( 'has-single-thumbnail-image' );
				} else if ( document.querySelector( '.product-thumbnail-images' ) ) {
					document.querySelector( '.product-thumbnail-images' ).classList.remove( 'has-single-thumbnail-image' );
				}
			}

			// Re-init easyzoom.
			if ( 'function' === typeof ( easyZoomHandle ) ) {
				easyZoomHandle();
			}

			// Re-init Photo Swipe.
			if ( 'function' === typeof ( initPhotoSwipe ) ) {
				initPhotoSwipe( '#product-images' );
			}

			setTimeout(
				function() {
					window.dispatchEvent( new Event( 'resize' ) );
				},
				200
			);
		}

		// Carousel action.
		function carouselAction() {
			// Trigger variation.
			jQuery( 'form.variations_form' ).on(
				'found_variation',
				function( e, variation ) {
					resetCarousel();

					// Update slider height.
					setTimeout(
						function() {
							window.dispatchEvent( new Event( 'resize' ) );
						},
						200
					);

					if ( 'undefined' !== typeof ( woostify_variation_gallery ) && woostify_variation_gallery.length ) {
						updateGallery( woostify_variation_gallery, false, variation.variation_id );
					}
				}
			);

			// Trigger reset.
			jQuery( '.reset_variations' ).on(
				'click',
				function() {
					if ( 'undefined' !== typeof ( woostify_variation_gallery ) && woostify_variation_gallery.length ) {
						updateGallery( woostify_default_gallery, true );
					}

					resetCarousel();

					// Update slider height.
					setTimeout(
						function() {
							window.dispatchEvent( new Event( 'resize' ) );
						},
						200
					);
				}
			);
		}
		carouselAction();

		// Grid and One column to carousel layout on mobile.
		woostifyGalleryCarouselMobile();

		// Load event.
		window.addEventListener(
			'load',
			function() {
				woostifyStickySummary();

				setTimeout(
					function() {
						window.dispatchEvent( new Event( 'resize' ) );
					},
					200
				);
			}
		);
	}
);
