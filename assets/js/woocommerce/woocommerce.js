/**
 * Woocommerce js
 *
 * @package
 */

/* global jQuery, woostify_woocommerce_general */

'use strict';

function cartSidebarOpen() {
	if ( document.body.classList.contains( 'no-cart-sidebar' ) || document.body.classList.contains( 'disabled-sidebar-cart' ) ) {
		return;
	}

	document.documentElement.classList.add( 'cart-sidebar-open' );
}

function eventCartSidebarOpen() {
	document.body.classList.add( 'updating-cart' );
	document.body.classList.remove( 'cart-updated' );
}

function eventCartSidebarClose() {
	document.body.classList.add( 'cart-updated' );
	document.body.classList.remove( 'updating-cart' );
}

// Event when click shopping bag button.
function shoppingBag() {
	const shoppingBag = document.getElementsByClassName( 'shopping-bag-button' ),
		cartSidebar = document.getElementById( 'shop-cart-sidebar' );

	if (
		! shoppingBag.length ||
		! cartSidebar ||
		document.body.classList.contains( 'woocommerce-cart' ) ||
		document.body.classList.contains( 'woocommerce-checkout' )
	) {
		return;
	}

	for ( let i = 0, j = shoppingBag.length; i < j; i++ ) {
		shoppingBag[ i ].addEventListener(
			'click',
			function( e ) {
				e.preventDefault();

				cartSidebarOpen();
				closeAll();
			}
		);
	}
}

// Condition for Add 'scrolling-up' and 'scrolling-down' class to body.
const woostifyConditionScrolling = function() {
	if (
		// When Demo store enable.
		( document.body.classList.contains( 'woocommerce-demo-store' ) && -1 === document.cookie.indexOf( 'store_notice' ) ) ||
		// When sticky button on mobile, Cart and Checkout page enable.
		( ( document.body.classList.contains( 'has-order-sticky-button' ) || document.body.classList.contains( 'has-proceed-sticky-button' ) ) && window.innerWidth < 768 )
	) {
		return true;
	}

	return false;
};

// Stock progress bar.
const woostifyStockQuantityProgressBar = function() {
	const selector = document.querySelectorAll( '.woostify-single-product-stock-progress-bar' );
	if ( ! selector.length ) {
		return;
	}

	selector.forEach(
		function( element, index ) {
			const number = element.getAttribute( 'data-number' ) || 0;

			element.style.width = number + '%';
		}
	);
};

const progressBarConfetti = function( progress_bar, percent ) {
	if ( woostify_woocommerce_general.shipping_threshold.enabled_shipping_threshold && woostify_woocommerce_general.shipping_threshold.enabled_shipping_threshold_effect ) {
		let curr_progress_bar = document.querySelectorAll( '.free-shipping-progress-bar' ),
			curr_percent = 0;

		if ( curr_progress_bar.length ) {
			curr_percent = parseInt( curr_progress_bar[ 0 ].getAttribute( 'data-progress' ) );
		}

		// Effect.
		if ( ( ! progress_bar.length && curr_percent >= 100 ) || ( percent < curr_percent && curr_percent >= 100 ) ) {
			const confetti_canvas = document.createElement( 'canvas' );

			confetti_canvas.className = 'confetti-canvas';

			document.querySelector( '#shop-cart-sidebar' ).appendChild( confetti_canvas );

			const wConfetti = confetti.create(
				confetti_canvas,
				{
					resize: true,
				}
			);

			confettiSnowEffect( wConfetti, 5000 );

			setTimeout(
				function() {
					wConfetti.reset();
					document.querySelector( '.confetti-canvas' ).remove();
				},
				6000
			);
		}

		percent = curr_percent;
	}
};

var confettiSnowEffect = function( confetti, duration ) {
	const animationEnd = Date.now() + duration,
		gravity = 1,
		startVelocity = 0;

	function randomInRange( min, max ) {
		return Math.random() * ( max - min ) + min;
	}

	( function frame() {
		const timeLeft = animationEnd - Date.now(),
			ticks = Math.max( 200, 500 * ( timeLeft / duration ) );

		confetti(
			{
				particleCount: 1,
				startVelocity,
				ticks,
				origin: {
					x: Math.random(),
					// since particles fall down, skew start toward the top.
					y: 0,
				},
				colors: [ '#EF2964' ],
				shapes: [ 'circle', 'square' ],
				gravity,
				scalar: randomInRange( 0.4, 1 ),
				drift: randomInRange( -0.4, 0.4 ),
			}
		);
		confetti(
			{
				particleCount: 1,
				startVelocity,
				ticks,
				origin: {
					x: Math.random(),
					// since particles fall down, skew start toward the top.
					y: 0,
				},
				colors: [ '#2D87B0' ],
				shapes: [ 'circle', 'square' ],
				gravity,
				scalar: randomInRange( 0.4, 1 ),
				drift: randomInRange( -0.4, 0.4 ),
			}
		);

		if ( timeLeft > 0 ) {
			requestAnimationFrame( frame );
		}
	}() );
};

// Product quantity on mini cart.
const woostifyQuantityMiniCart = function() {
	const cartCountContainer = document.querySelector( '.shopping-bag-button .shop-cart-count' );
	const infor = document.querySelectorAll( '.mini-cart-product-infor' );

	if ( ! infor.length || ! cartCountContainer ) {
		if ( cartCountContainer ) {
			cartCountContainer.classList.add( 'hide' );
		}
		return;
	}

	cartCountContainer.classList.remove( 'hide' );

	infor.forEach(
		function( ele, i ) {
			let quantityBtn = ele.querySelectorAll( '.mini-cart-product-qty' ),
				input = ele.querySelector( 'input.qty' ),
				currInputVal = input.value,
				max = Number( input.getAttribute( 'max' ) || -1 ),
				cartItemKey = input.getAttribute( 'data-cart_item_key' ) || '',
				eventChange = new Event( 'change' ),
				qtyUpdate = new Event( 'quantity_updated' );

			if ( ! quantityBtn.length || ! input ) {
				return;
			}

			for ( var i = 0, j = quantityBtn.length; i < j; i++ ) {
				quantityBtn[ i ].onclick = function() {
					const t = this,
						current = Number( input.value || 0 ),
						step = Number( input.getAttribute( 'step' ) || 1 ),
						min = Number( input.getAttribute( 'min' ) || 1 ),
						dataType = t.getAttribute( 'data-qty' );

					if ( current < min || isNaN( current ) ) {
						alert( woostify_woocommerce_general.qty_warning );
						return;
					}

					if ( 'minus' === dataType ) { // Minus button.
						if ( current <= min || ( current - step ) < min || current <= step ) {
							return;
						}

						var qty = Number( ( current - step ).toFixed( step.countDecimals() ) );

						input.value = qty;
						currInputVal = qty;
					} else if ( 'plus' === dataType ) { // Plus button.
						if ( max > 0 && ( current >= max || ( current + step ) > max ) ) {
							return;
						}

						var qty = Number( ( current + step ).toFixed( step.countDecimals() ) );

						input.value = qty;
						currInputVal = qty;
					}

					// Trigger event.
					input.dispatchEvent( eventChange );
				};
			}

			// Check valid quantity.
			input.addEventListener(
				'change',
				function() {
					const inputVal = Number( input.value || 0 ),
						min = Number( input.getAttribute( 'min' ) || 0 );

					// Valid quantity.
					if ( inputVal < min || isNaN( inputVal ) || ( max > 0 && ( Number( inputVal ) > max ) ) ) {
						alert( woostify_woocommerce_general.qty_warning );
						input.value = currInputVal;
						return;
					}

					// Request.
					const request = new Request(
						woostify_woocommerce_general.ajax_url,
						{
							method: 'POST',
							body: 'action=update_quantity_in_mini_cart&ajax_nonce=' + woostify_woocommerce_general.ajax_nonce + '&key=' + cartItemKey + '&qty=' + inputVal,
							credentials: 'same-origin',
							headers: new Headers(
								{
									'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
								}
							),
						}
					);

					// Add loading.
					document.documentElement.classList.add( 'mini-cart-updating' );

					// Fetch API.
					fetch( request )
						.then(
							function( res ) {
								if ( 200 !== res.status ) {
									alert( woostify_woocommerce_general.ajax_error );
									console.log( 'Status Code: ' + res.status );
									throw res;
								}

								return res.json();
							}
						).then(
							function( json ) {
								if ( ! json.success ) {
									return;
								}

								jQuery( document.body ).trigger( 'updated_wc_div' );

								const data = json.data,
									totalPrice = document.querySelector( '.cart-sidebar-content .woocommerce-mini-cart__total .woocommerce-Price-amount.amount' ),
									headerCartPriceContainer = document.querySelectorAll( '.woostify-header-total-price' ),
									productCount = document.querySelectorAll( '.shop-cart-count' ),
									shipping_threshold = document.querySelectorAll( '.free-shipping-progress-bar' );

								// Update total price.
								if ( totalPrice ) {
									totalPrice.innerHTML = data.total_price;
									if ( headerCartPriceContainer.length ) {
										for ( let si = 0, sc = headerCartPriceContainer.length; si < sc; si++ ) {
											headerCartPriceContainer[ si ].innerHTML = data.total_price;
										}
									}
								}

								// Update product count.
								if ( productCount.length ) {
									for ( let c = 0, n = productCount.length; c < n; c++ ) {
										productCount[ c ].innerHTML = data.item;
									}
								}

								// Update free shipping threshold.
								if ( shipping_threshold.length && data.hasOwnProperty( 'free_shipping_threshold' ) ) {
									const prev_percent = shipping_threshold[ 0 ].getAttribute( 'data-progress' );
									for ( let fsti = 0, fstc = shipping_threshold.length; fsti < fstc; fsti++ ) {
										shipping_threshold[ fsti ].setAttribute( 'data-progress', data.free_shipping_threshold.percent );
										shipping_threshold[ fsti ].querySelector( '.progress-bar-message' ).innerHTML = data.free_shipping_threshold.message;
										if ( shipping_threshold[ fsti ].querySelector( '.progress-percent' ) ) {
											shipping_threshold[ fsti ].querySelector( '.progress-percent' ).innerHTML = data.free_shipping_threshold.percent + '%';
										}
										if ( shipping_threshold[ fsti ].querySelector( '.progress-bar-status' ) ) {
											shipping_threshold[ fsti ].querySelector( '.progress-bar-status' ).style.minWidth = data.free_shipping_threshold.percent + '%';
											shipping_threshold[ fsti ].querySelector( '.progress-bar-status' ).style.transitionDuration = '.6s';
											if ( 100 <= parseInt( data.free_shipping_threshold.percent ) ) {
												shipping_threshold[ fsti ].querySelector( '.progress-bar-status' ).classList.add( 'success' );
											} else {
												shipping_threshold[ fsti ].querySelector( '.progress-bar-status' ).classList.remove( 'success' );
											}
										}
									}

									if ( woostify_woocommerce_general.shipping_threshold.enabled_shipping_threshold && woostify_woocommerce_general.shipping_threshold.enabled_shipping_threshold_effect ) {
										if ( prev_percent < 100 && data.free_shipping_threshold.percent >= 100 ) {
											const confetti_canvas = document.createElement( 'canvas' );

											confetti_canvas.className = 'confetti-canvas';

											document.querySelector( '#shop-cart-sidebar' ).appendChild( confetti_canvas );

											const wConfetti = confetti.create(
												confetti_canvas,
												{
													resize: true,
												}
											);

											confettiSnowEffect( wConfetti, 5000 );

											setTimeout(
												function() {
													wConfetti.reset();
													document.querySelector( '.confetti-canvas' ).remove();
												},
												6000
											);
										}
									}
								}
							}
						).catch(
							function( err ) {
								console.log( err );
							}
						).finally(
							function() {
								document.documentElement.classList.remove( 'mini-cart-updating' );
								document.dispatchEvent( qtyUpdate );
							}
						);
				}
			);
		}
	);
};

const updateHeaderCartPrice = function() {
	let total = document.querySelector( '.cart-sidebar-content .woocommerce-mini-cart__total .woocommerce-Price-amount.amount' ),
		priceFormat = '',
		headerCartPriceContainer = document.querySelectorAll( '.woostify-header-total-price' );

	if ( headerCartPriceContainer.length ) {
		switch ( woostify_woocommerce_general.currency_pos ) {
			case 'left':
				priceFormat = '<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">' + woostify_woocommerce_general.currency_symbol + '</span>0</bdi></span>';
				break;
			case 'right':
				priceFormat = '<span class="woocommerce-Price-amount amount"><bdi>0<span class="woocommerce-Price-currencySymbol">' + woostify_woocommerce_general.currency_symbol + '</span></bdi></span>';
				break;
			case 'left_space':
				priceFormat = '<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">' + woostify_woocommerce_general.currency_symbol + '</span>&nbsp;0</bdi></span>';
				break;
			case 'right_space':
				priceFormat = '<span class="woocommerce-Price-amount amount"><bdi>0&nbsp;<span class="woocommerce-Price-currencySymbol">' + woostify_woocommerce_general.currency_symbol + '</span></bdi></span>';
				break;

			default:
				break;
		}
		for ( let si = 0, sc = headerCartPriceContainer.length; si < sc; si++ ) {
			if ( total ) {
				headerCartPriceContainer[ si ].innerHTML = '<span class="woocommerce-Price-amount amount">' + total.innerHTML + '</span>';
			} else {
				headerCartPriceContainer[ si ].innerHTML = priceFormat;
			}
		}
	}
};

// Product carousel.
const woostifyProductsCarousel = function( selector ) {
	const elements = document.querySelectorAll( selector );

	if ( ! elements.length ) {
		return;
	}

	elements.forEach(
		function( element ) {
			if ( element.classList.contains( 'tns-slider' ) ) {
				return;
			}
			if ( ! woostify_woocommerce_general.related_carousel_opts.hasOwnProperty( 'loop' ) ) {
				return;
			}
			const options = woostify_woocommerce_general.related_carousel_opts;
			options.container = element;

			const slider = tns( options );
		}
	);
};

// Show an element.
const woostiftToggleShow = function( elem ) {
	// Get the natural height of the element.
	const getHeight = function() {
		elem.style.display = 'block';
		const height = elem.scrollHeight + 'px';
		elem.style.display = '';
		return height;
	};

	const height = getHeight();
	elem.classList.add( 'is-visible' );
	elem.style.height = height;

	// Once the transition is complete, remove the inline max-height so the content can scale responsively.
	window.setTimeout(
		function() {
			elem.style.height = '';
		},
		350
	);
};

// Hide an element.
const woostiftToggleHide = function( elem ) {
	// Give the element a height to change from.
	elem.style.height = elem.scrollHeight + 'px';

	// Set the height back to 0.
	window.setTimeout(
		function() {
			elem.style.height = '0';
		},
		1
	);

	// When the transition is complete, hide it.
	window.setTimeout(
		function() {
			elem.classList.remove( 'is-visible' );
		},
		350
	);
};

// Toggle element visibility.
const woostifyToggleSlide = function( elem, timing ) {
	// If the element is visible, hide it.
	if ( elem.classList.contains( 'is-visible' ) ) {
		woostiftToggleHide( elem );
		return;
	}

	// Otherwise, show it.
	woostiftToggleShow( elem );
};

const productDataTabsAccordion = function() {
	const wcTabs = document.querySelectorAll( '.woocommerce-tabs.layout-accordion' );

	if ( ! wcTabs.length ) {
		return;
	}

	wcTabs.forEach(
		function( wcTab ) {
			const tabTitles = wcTab.querySelectorAll( '.woostify-accordion-title' );
			if ( ! tabTitles.length ) {
				return;
			}

			const tabsWrapper = wcTab.querySelectorAll( '.woostify-tab-wrapper' );

			tabTitles.forEach(
				function( tabTitle, tabTitleIdx ) {
					tabTitle.onclick = function() {
						tabsWrapper.forEach(
							function( tabWrapper, tabWrapperIdx ) {
								if ( tabWrapperIdx === tabTitleIdx ) {
									return;
								}

								if ( tabWrapper.classList.contains( 'active' ) ) {
									woostifyToggleSlide( tabWrapper.querySelector( '.woocommerce-Tabs-panel' ) );
								}
								tabWrapper.classList.remove( 'active' );
							}
						);

						if ( tabTitle.parentNode.classList.contains( 'active' ) ) {
							tabTitle.parentNode.classList.remove( 'active' );
						} else {
							tabTitle.parentNode.classList.add( 'active' );
						}

						const nextEls = nextSiblings( tabTitle );
						woostifyToggleSlide( nextEls[ 0 ] );
					};
				}
			);
		}
	);
};

// Sticky order review.
const stickyOrderReview = function() {
	const form = 'form.woocommerce-checkout';
	const sidebarContainerSelector = 'form.woocommerce-checkout .woostify-col .col-right-inner';

	const reviewOrder = new WSYSticky(
		sidebarContainerSelector,
		{
			stickyContainer: form,
			marginTop: 96,
		}
	);
};

// Checkout page Layout 3 scripts.
const checkoutOrder = function() {
	const checkout_opt = document.querySelector( '.before-checkout' );
	if ( ! checkout_opt ) {
		return;
	}

	const spacer_orig = checkout_opt.offsetHeight,
		div_height = spacer_orig,
		show_login = document.querySelector( '.showlogin' ),
		sc_coupons_list = document.querySelector( '#coupons_list' ); // coupon list of plugin Smart Coupon for WC.

	if ( sc_coupons_list ) {
		document.arrive(
			'.sc-coupon',
			function() {
				document.getElementById( 'coupons_list' ).style.display = 'block';
				setTimeout(
					function() {
						set_heights();
						jQuery( document ).unbindArrive( '.sc-coupon' );
					},
					1000
				);
			}
		);
	} else {
		set_heights();
	}

	document.body.addEventListener(
		'click',
		function( event ) {
			if ( event.target !== show_login ) {
				return;
			}

			const refreshIntervalId = setInterval(
				function() {
					set_heights();
				},
				50
			);

			setTimeout(
				function() {
					if ( spacer_orig == div_height ) {
						clearInterval( refreshIntervalId );
					}
				},
				2000
			);
		}
	);

	function set_heights() {
		setTimeout(
			function() {
				const div_height = checkout_opt.offsetHeight;
				document.querySelector( '#checkout-spacer' ).style.minHeight = div_height + 'px';
				checkout_opt.classList.add( 'ready' );
			},
			200
		);
	}
};

const woostifyGetUrl = function( endpoint ) {
	return wc_cart_fragments_params.wc_ajax_url.toString().replace(
		'%%endpoint%%',
		endpoint
	);
};

const woostifyShowNotice = function( html_element, $target ) {
	if ( ! $target ) {
		$target = jQuery( '.woocommerce-notices-wrapper:first' ) || jQuery( '.cart-empty' ).closest( '.woocommerce' ) || jQuery( '.woocommerce-cart-form' );
	}
	$target.prepend( html_element );
};

const ajaxCouponForm = function() {
	const couponForm = document.querySelector( 'form.checkout_coupon' );

	if ( ! couponForm ) {
		return;
	}
	couponForm.addEventListener(
		'submit',
		function( event ) {
			event.preventDefault();
			const text_field = document.getElementById( 'coupon_code' );
			const coupon_code = text_field.value;

			const data = {
				security: woostify_woocommerce_general.apply_coupon_nonce,
				coupon_code,
			};

			jQuery.ajax(
				{
					type: 'POST',
					url: woostifyGetUrl( 'apply_coupon' ),
					data,
					dataType: 'html',
					success( response ) {
						jQuery( '.woocommerce-error, .woocommerce-message, .woocommerce-NoticeGroup .woocommerce-info, .woocommerce-notices-wrapper .woocommerce-info' ).remove();
						woostifyShowNotice( response, jQuery( '.woostify-woocommerce-NoticeGroup' ) );
						jQuery( document.body ).trigger( 'applied_coupon', [ coupon_code ] );
					},
					complete() {
						text_field.value = '';
						jQuery( document.body ).trigger( 'update_checkout' );
					},
				}
			);
		}
	);
};

const woostifyMoveNoticesInCheckoutPage = function() {
	const noticesWrapper = document.querySelectorAll( '.woocommerce-notices-wrapper' );
	const infoNotices = document.querySelectorAll( '.woocommerce > .woocommerce-info' );
	const woostifyNoticeGroup = document.querySelector( '.woostify-woocommerce-NoticeGroup' );

	if ( noticesWrapper.length ) {
		const noticesWrapperEl = noticesWrapper[ 0 ];
		const noticesWrapperNode = document.createElement( 'div' );
		noticesWrapperNode.innerHTML = noticesWrapperEl.innerHTML;
		woostifyNoticeGroup.appendChild( noticesWrapperNode );
		noticesWrapperEl.remove();
	}

	if ( infoNotices.length ) {
		infoNotices.forEach(
			function( infoNotice ) {
				const infoNoticeNode = infoNotice.cloneNode( true );
				const classes = infoNotice.getAttribute( 'class' );

				infoNoticeNode.setAttribute( 'class', classes );
				woostifyNoticeGroup.appendChild( infoNoticeNode );
				infoNotice.remove();
			}
		);
	}
};

const woostifyCheckoutFormFieldAnimation = function() {
	const inputs = document.querySelectorAll( 'form.checkout .input-text, form.checkout_coupon .input-text' );
	const formRows = document.querySelectorAll( 'form.checkout .form-row' );

	if ( inputs.length ) {
		inputs.forEach(
			function( input ) {
				const formRow = input.closest( '.form-row' );

				if ( ! formRow ) {
					return;
				}

				if ( '' !== input.value ) {
					formRow.classList.add( 'w-anim-wrap' );
				}

				input.addEventListener(
					'focus',
					function( event ) {
						const formRow = event.target.closest( '.form-row' );
						formRow.classList.add( 'w-anim-wrap' );
					}
				);

				input.addEventListener(
					'blur',
					function( event ) {
						const formRow = event.target.closest( '.form-row' );
						if ( '' === event.target.value ) {
							formRow.classList.remove( 'w-anim-wrap' );
							if ( formRow.classList.contains( 'validate-required' ) ) {
								formRow.classList.add( 'woocommerce-invalid-required-field' );
							}
						}
					}
				);
			}
		);
	}
	if ( formRows.length ) {
		formRows.forEach(
			function( formRowEl ) {
				const labelEl = formRowEl.querySelector( 'label' );

				if ( labelEl == null ) {
					formRowEl.classList.add( 'no-label' );
				} else {
					labelEl.classList.remove( 'screen-reader-text' );
				}

				if ( formRowEl.classList.contains( 'address-field' ) ) {
					const fieldInputs = formRowEl.querySelectorAll( 'input' );
					const select2Inputs = formRowEl.querySelectorAll( 'span.select2' );
					if ( fieldInputs.length && fieldInputs.length > 0 ) {
						fieldInputs.forEach(
							function( fInput ) {
								if ( 'hidden' === fInput.getAttribute( 'type' ) ) {
									formRowEl.classList.add( 'field-readonly' );
								} else {
									formRowEl.classList.remove( 'field-readonly' );
								}
							}
						);
					}
					if ( select2Inputs.length && select2Inputs.length > 0 ) {
						formRowEl.classList.add( 'w-anim-wrap' );
						formRowEl.classList.remove( 'field-readonly' );
					}
				}
			}
		);
	}
};

document.addEventListener(
	'DOMContentLoaded',
	function() {
		shoppingBag();
		woostifyQuantityMiniCart();
		woostifyProductsCarousel( '.related.products ul.products' );
		woostifyProductsCarousel( '.upsells.products ul.products' );
		woostifyProductsCarousel( '.woostify-product-recently-viewed-section ul.products' );

		productDataTabsAccordion();

		window.addEventListener(
			'load',
			function() {
				woostifyStockQuantityProgressBar();
			}
		);

		jQuery( document.body ).on(
			'adding_to_cart',
			function() {
				eventCartSidebarOpen();
			}
		).on(
			'added_to_cart',
			function( e, fragments, cart_hash, $button ) {
				cartSidebarOpen();
				woostifyQuantityMiniCart();
				updateHeaderCartPrice();
				eventCartSidebarClose();
				closeAll();

				$button = typeof $button === 'undefined' ? false : $button;

				if ( $button ) {
					$button.removeClass( 'loading' );

					if ( fragments ) {
						$button.addClass( 'added' );
					}

					// View cart text.
					if ( fragments && ! wc_add_to_cart_params.is_cart && $button.parent().find( '.added_to_cart' ).length === 0 ) {
						const icon = get_svg_icon( 'shopping-cart-full' );
						$button.after(
							'<a href="' + wc_add_to_cart_params.cart_url + '" class="added_to_cart wc-forward" title="' + wc_add_to_cart_params.i18n_view_cart + '">' + icon + wc_add_to_cart_params.i18n_view_cart + '</a>'
						);
					}

					jQuery( document.body ).trigger( 'wc_cart_button_updated', [ $button ] );
				}
			}
		).on(
			'removed_from_cart', /* For mini cart */
			function() {
				woostifyQuantityMiniCart();
				updateHeaderCartPrice();
			}
		).on(
			'updated_cart_totals',
			function() {
				if ( 'function' === typeof ( customQuantity ) ) {
					customQuantity();
				}
				woostifyQuantityMiniCart();
				updateHeaderCartPrice();
			}
		).on(
			'wc_fragments_loaded wc_fragments_refreshed',
			function() {
				woostifyQuantityMiniCart();
				updateHeaderCartPrice();

				if ( woostify_woocommerce_general.shipping_threshold.enabled_shipping_threshold && woostify_woocommerce_general.shipping_threshold.enabled_shipping_threshold_effect ) {
					const progress_bar = document.querySelectorAll( '.free-shipping-progress-bar' );
					let percent = 0;
					if ( progress_bar.length ) {
						percent = parseInt( progress_bar[ 0 ].getAttribute( 'data-progress' ) );
					}

					progressBarConfetti( progress_bar, percent );
				}
			}
		).on(
			'wc_cart_emptied', /* Reload Cart page if it's empty */
			function() {
				location.reload();
			}
		);

		jQuery( document.body ).on(
			'init_checkout updated_checkout payment_method_selected',
			function() {
				// Add quantity button list.
				if ( 'function' === typeof ( customQuantity ) ) {
					customQuantity();
				}
			}
		);

		const isMinimalCheckoutLayout = document.body.classList.contains( 'checkout-layout-3' );

		if ( isMinimalCheckoutLayout ) {
			let resized = false;
			woostifyCheckoutFormFieldAnimation();

			// Move notices.
			woostifyMoveNoticesInCheckoutPage();

			jQuery( document.body ).on(
				'updated_checkout',
				function( event, data ) {
					setTimeout(
						function() {
							woostifyCheckoutFormFieldAnimation();
						},
						100
					);
				}
			).on(
				'init_checkout updated_checkout payment_method_selected',
				function( event, data ) {
					// Clear old notifications before displaying new ones.
					jQuery( '.woostify-woocommerce-NoticeGroup' ).html( '' );

					jQuery( 'form.checkout' ).arrive(
						'form.checkout_coupon',
						function( newEl ) {
							ajaxCouponForm();
							jQuery( 'form.checkout' ).unbindArrive( 'form.checkout_coupon' );
						}
					);

					jQuery( 'form.checkout' ).arrive(
						'.ajax-coupon-form',
						function( newEl ) {
							jQuery( newEl ).removeClass( 'loading' );
							jQuery( newEl ).addClass( 'ready' );
						}
					);

					jQuery( 'form.checkout' ).arrive(
						'.woocommerce-NoticeGroup',
						function() {
							jQuery( '.woostify-woocommerce-NoticeGroup' ).append( jQuery( '.woocommerce-NoticeGroup' ).html() );
							jQuery( '.woocommerce-NoticeGroup' ).remove();
						}
					);

					jQuery( document ).arrive(
						'.woocommerce > .woocommerce-message',
						function( newEl ) {
							const newWcMsg = jQuery( newEl ),
								newWcMsgClone = newWcMsg.clone();

							jQuery( '.woostify-woocommerce-NoticeGroup' ).append( newWcMsgClone );
							jQuery( newEl ).remove();
						}
					);

					jQuery( document ).arrive(
						'.woocommerce > .woocommerce-info',
						function( newEl ) {
							const newWcMsg = jQuery( newEl ),
								newWcMsgClone = newWcMsg.clone();

							jQuery( '.woostify-woocommerce-NoticeGroup' ).append( newWcMsgClone );
							jQuery( newEl ).remove();
						}
					);
				}
			).on(
				'applied_coupon',
				function() {
					jQuery( 'form.checkout' ).arrive(
						'form.checkout_coupon',
						function( newEl ) {
							ajaxCouponForm();
							jQuery( 'form.checkout' ).unbindArrive( 'form.checkout_coupon' );
						}
					);
				}
			);

			jQuery( 'form.checkout' ).arrive(
				'form.checkout_coupon',
				function( newEl ) {
					ajaxCouponForm();
					jQuery( 'form.checkout' ).unbindArrive( 'form.checkout_coupon' );
				}
			);

			checkoutOrder();
			stickyOrderReview();

			window.onscroll = function() {
				if ( ! resized ) {
					window.dispatchEvent( new Event( 'resize' ) );
					resized = true;
				}
			};
		}
	}
);
