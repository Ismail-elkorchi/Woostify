/**
 * Easyzoom hanle
 *
 * @package
 */

'use strict';

// Use in product-variation.js.
function easyZoomHandle() {
	if ( window.matchMedia( '( max-width: 991px )' ).matches ) {
		return;
	}

	const image = jQuery( '.product-images .image-item' );

	if ( ! image.length || document.documentElement.classList.contains( 'quick-view-open' ) ) {
		return;
	}

	if ( jQuery().easyZoom ) {
		const zoom = image.easyZoom(),
			api = zoom.data( 'easyZoom' );

		api.teardown();
		api._init();
	}
}

document.addEventListener(
	'DOMContentLoaded',
	function() {
		// Setup image zoom.
		if ( window.matchMedia( '( min-width: 992px )' ).matches && jQuery().easyZoom ) {
			jQuery( '.ez-zoom' ).easyZoom(
				{
					loadingNotice: '',
				}
			);
		}
	}
);
