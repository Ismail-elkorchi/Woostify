/**
 * General js
 *
 * @package
 */

/* global jQuery */

'use strict';

Number.prototype.countDecimals = function() {
	if ( Math.floor( this.valueOf() ) === this.valueOf() ) {
		return 0;
	}

	const str = this.toString();
	if ( str.indexOf( '.' ) !== -1 && str.indexOf( '-' ) !== -1 ) {
		return str.split( '-' )[ 1 ] || 0;
	} else if ( str.indexOf( '.' ) !== -1 ) {
		return str.split( '.' )[ 1 ].length || 0;
	}
	return str.split( '-' )[ 1 ] || 0;
};

function get_svg_icon( icon ) {
	let output = '';
	const icon_list = JSON.parse( woostify_svg_icons.list );

	output += '<span class="woostify-svg-icon">';

	if ( icon_list.hasOwnProperty( icon ) ) {
		output += icon_list[ icon ];
	} else {
		output += '';
	}

	output += '</span>';

	return output;
}

// Disable popup/sidebar/menumobile.
function closeAll() {
	// Use ESC key.
	document.body.addEventListener(
		'keyup',
		function( e ) {
			if ( 27 === e.keyCode ) {
				document.documentElement.classList.remove( 'cart-sidebar-open' );
			}
		}
	);

	// Use `X` close button.
	const closeCartSidebarBtn = document.getElementById( 'close-cart-sidebar-btn' );

	if ( closeCartSidebarBtn ) {
		closeCartSidebarBtn.addEventListener(
			'click',
			function() {
				document.documentElement.classList.remove( 'cart-sidebar-open' );
			}
		);
	}

	// Use overlay.
	const overlay = document.getElementById( 'woostify-overlay' );

	if ( overlay ) {
		overlay.addEventListener(
			'click',
			function() {
				document.documentElement.classList.remove( 'cart-sidebar-open', 'sidebar-menu-open' );
			}
		);
	}
}

// Dialog Popup.
function dialogPopup( targetClickClass, popupTarget, type ) {
	let targetClickEl = document.getElementsByClassName( targetClickClass ),
		popupEl = document.querySelector( popupTarget ),
		popupCloseBtn = document.querySelector( popupTarget + ' .dialog-' + type + '-close-icon' ),
		searchField, popupInnerEl, popupContentEl;

	if ( 'search' === type ) {
		searchField = document.querySelector( popupTarget + ' .search-field' );
		if ( ! searchField ) {
			return;
		}
	}

	if ( ! targetClickEl.length || ! popupEl || ! popupCloseBtn ) {
		return;
	}

	if ( 'search' === type && searchField ) {
		// Disabled field suggestions.
		searchField.setAttribute( 'autocomplete', 'off' );

		// Field must not empty.
		searchField.setAttribute( 'required', 'required' );
	}

	if ( 'account' === type ) {
		popupInnerEl = popupEl.querySelector( '.dialog-popup-inner' );
		popupContentEl = popupEl.querySelector( '.dialog-popup-content' );
	}

	const popupOpen = function() {
		document.documentElement.classList.add( 'dialog-' + type + '-open' );
		document.documentElement.classList.remove( 'dialog-' + type + '-close' );
		if ( 'search' === type && searchField ) {
			if ( window.matchMedia( '( min-width: 992px )' ).matches ) {
				searchField.focus();
			}
		}
	};

	const popupClose = function() {
		document.documentElement.classList.add( 'dialog-' + type + '-close' );
		document.documentElement.classList.remove( 'dialog-' + type + '-open' );
	};

	for ( let i = 0, j = targetClickEl.length; i < j; i++ ) {
		if ( 'account' === type ) {
			if ( ! targetClickEl[ i ].classList.contains( 'open-popup' ) ) {
				return;
			}
		}
		targetClickEl[ i ].addEventListener(
			'click',
			function( e ) {
				e.preventDefault();
				popupOpen();

				// Use ESC key.
				document.body.addEventListener(
					'keyup',
					function( e ) {
						if ( 27 === e.keyCode ) {
							popupClose();
						}
					}
				);

				if ( popupInnerEl ) {
					popupInnerEl.addEventListener(
						'click',
						function( e ) {
							if ( this !== e.target ) {
								return;
							}

							popupClose();
						}
					);
				}

				if ( popupContentEl ) {
					popupContentEl.addEventListener(
						'click',
						function( e ) {
							if ( this !== e.target ) {
								return;
							}

							popupClose();
						}
					);
				}

				// Use dialog overlay.
				popupEl.addEventListener(
					'click',
					function( e ) {
						if ( this !== e.target ) {
							return;
						}

						popupClose();
					}
				);

				// Use closr button.
				popupCloseBtn.addEventListener(
					'click',
					function() {
						popupClose();
					}
				);
			}
		);
	}
}

// Scroll action.
function scrollAction( selector, position ) {
	const scroll = function() {
		const item = document.querySelector( selector );
		if ( ! item ) {
			return;
		}

		const pos = arguments.length > 0 && undefined !== arguments[ 0 ] ? arguments[ 0 ] : window.scrollY;

		if ( pos > position ) {
			item.classList.add( 'active' );
		} else {
			item.classList.remove( 'active' );
		}
	};

	window.addEventListener(
		'load',
		function() {
			scroll();
		}
	);

	window.addEventListener(
		'scroll',
		function() {
			scroll();
		}
	);
}

// Go to top button.
function toTopButton() {
	const top = jQuery( '#scroll-to-top' );
	const sticky_footer_bar = jQuery( '.woostify-sticky-footer-bar' );
	if ( ! top.length ) {
		return;
	}

	if ( sticky_footer_bar.length ) {
		const bar_height = sticky_footer_bar.outerHeight();
		top.css( 'bottom', ( bar_height + 10 ) + 'px' );
	}

	top.on(
		'click',
		function() {
			jQuery( 'html, body' ).animate( { scrollTop: 0 }, 300 );
		}
	);
}

// Get all Prev element siblings.
function prevSiblings( target ) {
	let siblings = [],
		n = target;

	if ( n && n.previousElementSibling ) {
		while ( n = n.previousElementSibling ) {
			siblings.push( n );
		}
	}

	return siblings;
}

// Get all Next element siblings.
function nextSiblings( target ) {
	let siblings = [],
		n = target;

	if ( n && n.nextElementSibling ) {
		while ( n = n.nextElementSibling ) {
			siblings.push( n );
		}
	}

	return siblings;
}

// Get all element siblings.
function siblings( target ) {
	const prev = prevSiblings( target ) || [],
		next = nextSiblings( target ) || [];

	return prev.concat( next );
}

document.addEventListener(
	'DOMContentLoaded',
	function() {
		dialogPopup( 'my-account-icon', '#woostify-login-form-popup', 'account' );
		dialogPopup( 'my-account-login-link', '#woostify-login-form-popup', 'account' );
		dialogPopup( 'header-search-icon', '.site-dialog-search', 'search' );
		scrollAction( '#scroll-to-top', 200 );
		toTopButton();
	}
);
