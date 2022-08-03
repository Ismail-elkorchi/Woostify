/**
 * Easyzoom hanle
 *
 * @package
 */

/* global jQuery */

'use strict';

// Use in product-variation.js.
function easyZoomHandle() {
	if ( window.matchMedia( '( max-width: 991px )' ).matches ) {
		return;
	}

	const image = jQuery( '.product-images .image-item' );

	if ( ! image.length ) {
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
