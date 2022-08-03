<?php
/**
 * Woostify Class
 *
 * @package  woostify
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Woostify' ) ) {
	/**
	 * The main Woostify class
	 */
	class Woostify {

		/**
		 * Setup class.
		 */
		public function __construct() {
			// Set the content width based on the theme's design and stylesheet.
			$this->woostify_content_width();
			$this->woostify_includes();

			// Add theme version into html tag.
			add_filter( 'language_attributes', 'woostify_info' );

			add_action( 'after_setup_theme', array( $this, 'woostify_setup' ) );
			add_action( 'widgets_init', array( $this, 'woostify_widgets_init' ) );
			add_action( 'wp_enqueue_scripts', array( $this, 'woostify_scripts' ), 10 );
			add_filter( 'excerpt_length', array( $this, 'woostify_limit_excerpt_character' ), 99 );

			// Search form.
			add_filter( 'get_search_form', 'woostify_custom_search_form', 10, 2 );

			// Add Image column on blog list in admin screen.
			add_filter( 'manage_post_posts_columns', array( $this, 'woostify_columns_head' ), 10 );
			add_action( 'manage_post_posts_custom_column', array( $this, 'woostify_columns_content' ), 10, 2 );

			add_filter( 'body_class', array( $this, 'woostify_body_classes' ) );
			add_filter( 'wp_page_menu_args', array( $this, 'woostify_page_menu_args' ) );
			add_filter( 'navigation_markup_template', array( $this, 'woostify_navigation_markup_template' ) );
			add_action( 'customize_preview_init', array( $this, 'woostify_customize_live_preview' ) );
			add_filter( 'wp_tag_cloud', array( $this, 'woostify_remove_tag_inline_style' ) );
			add_filter( 'excerpt_more', array( $this, 'woostify_modify_excerpt_more' ) );

			add_action( 'wp_head', array( $this, 'sticky_footer_bar' ), 15 );

			// CONTENT.
			add_filter( 'wp_kses_allowed_html', 'woostify_modify_wp_kses_allowed_html' );
		}

		/**
		 * Sticky footer bar
		 */
		public function sticky_footer_bar() {
			$options       = woostify_options( false );
			$header_layout = $options['header_layout'];
			if ( 'layout-7' !== $header_layout ) {
				remove_action( 'woostify_after_footer', 'woostify_sticky_footer_bar', 5 );
			} else {
				remove_action( 'woostify_before_footer', 'woostify_sticky_footer_bar', 15 );
			}
		}

		/**
		 * Includes
		 */
		public function woostify_includes() {
			// Nav menu walker.
			require_once WOOSTIFY_THEME_DIR . 'inc/class-woostify-walker-menu.php';
		}

		/**
		 * Set the content width based on the theme's design and stylesheet.
		 */
		public function woostify_content_width() {
			if ( ! isset( $content_width ) ) {
				// Pixel.
				$content_width = 1170;
			}
		}

		/**
		 * Get featured image
		 *
		 * @param int $post_ID The post id.
		 *
		 * @return     string Image src.
		 */
		public function woostify_get_featured_image_src( $post_ID ) {
			$img_id  = get_post_thumbnail_id( $post_ID );
			$img_src = WOOSTIFY_THEME_URI . 'assets/images/thumbnail-default.jpg';

			if ( $img_id ) {
				$src = wp_get_attachment_image_src( $img_id, 'thumbnail' );
				if ( $src ) {
					$img_src = $src[0];
				}
			}

			return $img_src;
		}

		/**
		 * Column head
		 *
		 * @param array $defaults The defaults.
		 */
		public function woostify_columns_head( $defaults ) {
			// See: https://codex.wordpress.org/Plugin_API/Filter_Reference/manage_$post_type_posts_columns.
			$order    = array();
			$checkbox = 'cb';
			foreach ( $defaults as $key => $value ) {
				$order[ $key ] = $value;
				if ( $key === $checkbox ) {
					$order['thumbnail_image'] = __( 'Image', 'woostify' );
				}
			}

			return $order;
		}

		/**
		 * Column content
		 *
		 * @param string $column_name The column name.
		 * @param int    $post_ID The post id.
		 */
		public function woostify_columns_content( $column_name, $post_ID ) {
			if ( 'thumbnail_image' === $column_name ) {
				$_img_src = $this->woostify_get_featured_image_src( $post_ID );
				?>
				<a href="<?php echo esc_url( get_edit_post_link( $post_ID ) ); ?>">
					<img src="<?php echo esc_url( $_img_src ); ?>"/> </a>
				<?php
			}
		}

		/**
		 * Sets up theme defaults and registers support for various WordPress features.
		 *
		 * Note that this function woostify_is hooked into the after_setup_theme hook, which
		 * runs before the init hook. The init hook is too late for some features, such
		 * as indicating support for post thumbnails.
		 */
		public function woostify_setup() {
			/*
			 * Load Localisation files.
			 *
			 * Note: the first-loaded translation file overrides any following ones if the same translation is present.
			 */

			// Loads wp-content/languages/themes/woostify-it_IT.mo.
			load_theme_textdomain( 'woostify', WP_LANG_DIR . '/themes/' );

			// Loads wp-content/themes/child-theme-name/languages/it_IT.mo.
			load_theme_textdomain( 'woostify', get_stylesheet_directory() . '/languages' );

			// Loads wp-content/themes/woostify/languages/it_IT.mo.
			load_theme_textdomain( 'woostify', WOOSTIFY_THEME_DIR . 'languages' );

			/**
			 * Add default posts and comments RSS feed links to head.
			 */
			add_theme_support( 'automatic-feed-links' );

			/*
			 * Enable support for Post Thumbnails on posts and pages.
			 *
			 * @link https://developer.wordpress.org/reference/functions/add_theme_support/#Post_Thumbnails
			 */
			add_theme_support( 'post-thumbnails' );

			// Post formats.
			add_theme_support(
				'post-formats',
				array(
					'gallery',
					'image',
					'link',
					'quote',
					'video',
					'audio',
					'status',
					'aside',
				)
			);

			/**
			 * Enable support for site logo.
			 */
			add_theme_support(
				'custom-logo',
				apply_filters(
					'woostify_custom_logo_args',
					array(
						'height'      => 110,
						'width'       => 470,
						'flex-width'  => true,
						'flex-height' => true,
					)
				)
			);

			/**
			 * Register menu locations.
			 */
			register_nav_menus(
				apply_filters(
					'woostify_register_nav_menus',
					array(
						'primary'           => __( 'Primary Menu', 'woostify' ),
						'footer'            => __( 'Footer Menu', 'woostify' ),
						'mobile'            => __( 'Mobile Menu', 'woostify' ),
						'mobile_categories' => __( 'Mobile Categories Menu', 'woostify' ),
					)
				)
			);

			/*
			 * Switch default core markup for search form, comment form, comments, galleries, captions and widgets
			 * to output valid HTML5.
			 */
			add_theme_support(
				'html5',
				apply_filters(
					'woostify_html5_args',
					array(
						'search-form',
						'comment-form',
						'comment-list',
						'gallery',
						'caption',
						'widgets',
					)
				)
			);

			/**
			 * Setup the WordPress core custom background feature.
			 */
			add_theme_support(
				'custom-background',
				apply_filters(
					'woostify_custom_background_args',
					array(
						'default-color' => apply_filters( 'woostify_default_background_color', 'ffffff' ),
						'default-image' => '',
					)
				)
			);

			/**
			 * Declare support for title theme feature.
			 */
			add_theme_support( 'title-tag' );

			/**
			 * Declare support for selective refreshing of widgets.
			 */
			add_theme_support( 'customize-selective-refresh-widgets' );

			/**
			 * Gutenberg.
			 */
			$options = woostify_options( false );

			// Default block styles.
			add_theme_support( 'wp-block-styles' );

			// Responsive embedded content.
			add_theme_support( 'responsive-embeds' );

			// Editor styles.
			add_theme_support( 'editor-styles' );

			// Wide Alignment.
			add_theme_support( 'align-wide' );

			// Editor Color Palette.
			add_theme_support(
				'editor-color-palette',
				array(
					array(
						'name'  => __( 'Primary Color', 'woostify' ),
						'slug'  => 'woostify-primary',
						'color' => $options['theme_color'],
					),
					array(
						'name'  => __( 'Heading Color', 'woostify' ),
						'slug'  => 'woostify-heading',
						'color' => $options['heading_color'],
					),
					array(
						'name'  => __( 'Text Color', 'woostify' ),
						'slug'  => 'woostify-text',
						'color' => $options['text_color'],
					),
				)
			);

			// Block Font Sizes.
			add_theme_support(
				'editor-font-sizes',
				array(
					array(
						'name' => __( 'H6', 'woostify' ),
						'size' => $options['heading_h6_font_size'],
						'slug' => 'woostify-heading-6',
					),
					array(
						'name' => __( 'H5', 'woostify' ),
						'size' => $options['heading_h5_font_size'],
						'slug' => 'woostify-heading-5',
					),
					array(
						'name' => __( 'H4', 'woostify' ),
						'size' => $options['heading_h4_font_size'],
						'slug' => 'woostify-heading-4',
					),
					array(
						'name' => __( 'H3', 'woostify' ),
						'size' => $options['heading_h3_font_size'],
						'slug' => 'woostify-heading-3',
					),
					array(
						'name' => __( 'H2', 'woostify' ),
						'size' => $options['heading_h2_font_size'],
						'slug' => 'woostify-heading-2',
					),
					array(
						'name' => __( 'H1', 'woostify' ),
						'size' => $options['heading_h1_font_size'],
						'slug' => 'woostify-heading-1',
					),
				)
			);
		}

		/**
		 * Register widget area.
		 *
		 * @link https://codex.wordpress.org/Function_Reference/register_sidebar
		 */
		public function woostify_widgets_init() {
			// Woostify widgets.
			require_once WOOSTIFY_THEME_DIR . 'inc/widget/class-woostify-recent-post-thumbnail.php';

			// Setup.
			$sidebar_args['sidebar'] = array(
				'name'          => __( 'Main Sidebar', 'woostify' ),
				'id'            => 'sidebar',
				'description'   => __( 'Appears in the sidebar of the site.', 'woostify' ),
				'before_widget' => '<div id="%1$s" class="widget %2$s">',
				'after_widget'  => '</div>',
			);

			if ( class_exists( 'woocommerce' ) ) {
				$sidebar_args['shop_sidebar'] = array(
					'name'          => __( 'Woocommerce Sidebar', 'woostify' ),
					'id'            => 'sidebar-shop',
					'description'   => __( ' Appears in the sidebar of shop/product page.', 'woostify' ),
					'before_widget' => '<div id="%1$s" class="widget %2$s">',
					'after_widget'  => '</div>',
				);
			}

			$sidebar_args['footer'] = array(
				'name'          => __( 'Footer Widget', 'woostify' ),
				'id'            => 'footer',
				'description'   => __( 'Appears in the footer section of the site.', 'woostify' ),
				'before_widget' => '<div id="%1$s" class="widget footer-widget %2$s">',
				'after_widget'  => '</div>',
			);

			foreach ( $sidebar_args as $sidebar => $args ) {
				$widget_tags = array(
					'before_title' => '<h6 class="widget-title">',
					'after_title'  => '</h6>',
				);

				/**
				 * Dynamically generated filter hooks. Allow changing widget wrapper and title tags. See the list below.
				 */
				$filter_hook = sprintf( 'woostify_%s_widget_tags', $sidebar );
				$widget_tags = apply_filters( $filter_hook, $widget_tags );

				if ( is_array( $widget_tags ) ) {
					register_sidebar( $args + $widget_tags );
				}
			}

			// Register.
			register_widget( 'Woostify_Recent_Post_Thumbnail' );
		}

		/**
		 * Enqueue scripts and styles.
		 */
		public function woostify_scripts() {
			$options = woostify_options( false );

			// Import parent theme if using child-theme.
			if ( is_child_theme() ) {
				wp_enqueue_style(
					'woostify-parent-style',
					get_template_directory_uri() . '/style.css',
					array(),
					woostify_version()
				);
			}

			/**
			 * Styles
			 */
			wp_enqueue_style(
				'woostify-style',
				get_stylesheet_uri(),
				array(),
				woostify_version()
			);

			if ( is_rtl() ) {
				wp_enqueue_style(
					'woostify-rtl',
					WOOSTIFY_THEME_URI . 'rtl.css',
					array(),
					woostify_version()
				);
			}

			/**
			 * Scripts
			 */
			// General script.
			wp_enqueue_script(
				'woostify-general',
				WOOSTIFY_THEME_URI . 'assets/js/general' . woostify_suffix() . '.js',
				array( 'jquery' ),
				woostify_version(),
				true
			);

			wp_localize_script(
				'woostify-general',
				'woostify_svg_icons',
				array(
					'file_url' => WOOSTIFY_THEME_URI . 'assets/svg/svgs.json',
					'list'     => wp_json_encode( Woostify_Icon::fetch_all_svg_icon() ),
				)
			);

			// Fallback add wc_add_to_cart_params.
			if ( woostify_is_woocommerce_activated() && 'yes' !== get_option( 'woocommerce_enable_ajax_add_to_cart' ) ) {
				wp_localize_script(
					'woostify-general',
					'wc_add_to_cart_params',
					array(
						'ajax_url'                => WC()->ajax_url(),
						'wc_ajax_url'             => WC_AJAX::get_endpoint( '%%endpoint%%' ),
						'i18n_view_cart'          => esc_attr__( 'View cart', 'woostify' ),
						'cart_url'                => apply_filters( 'woocommerce_add_to_cart_redirect', wc_get_cart_url(), null ),
						'is_cart'                 => is_cart(),
						'cart_redirect_after_add' => get_option( 'woocommerce_cart_redirect_after_add' ),
					)
				);
			}

			// Mobile menu.
			wp_enqueue_script(
				'woostify-navigation',
				WOOSTIFY_THEME_URI . 'assets/js/navigation' . woostify_suffix() . '.js',
				array( 'jquery' ),
				woostify_version(),
				true
			);

			// Arrive jquery plugin.
			wp_register_script(
				'woostify-arrive',
				WOOSTIFY_THEME_URI . 'assets/js/arrive.min.js',
				array(),
				woostify_version(),
				true
			);

			// Quantity button.
			wp_register_script(
				'woostify-quantity-button',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/quantity-button' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			// Multi step checkout.
			wp_register_script(
				'woostify-multi-step-checkout',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/multi-step-checkout' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			if ( class_exists( 'woocommerce' ) && is_checkout() ) {
				$wc_total = WC()->cart->get_totals();
				$price    = 'yes' === get_option( 'woocommerce_calc_taxes' ) ? ( (float) $wc_total['cart_contents_total'] + (float) $wc_total['total_tax'] ) : $wc_total['cart_contents_total'];

				wp_localize_script(
					'woostify-multi-step-checkout',
					'woostify_multi_step_checkout',
					array(
						'ajax_none'     => wp_create_nonce( 'woostify_update_checkout_nonce' ),
						'content_total' => wp_kses( $price, array() ),
						'cart_total'    => wp_kses( wc_price( $wc_total['total'] ), array() ),
					)
				);
			}

			// Woocommerce sidebar for mobile.
			wp_register_script(
				'woostify-woocommerce-sidebar',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/woocommerce-sidebar' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			// Congrats confetti effect.
			wp_register_script(
				'woostify-congrats-confetti-effect',
				WOOSTIFY_THEME_URI . 'assets/js/confetti' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			// Woocommerce.
			wp_register_script(
				'woostify-woocommerce',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/woocommerce' . woostify_suffix() . '.js',
				array( 'jquery', 'woostify-arrive', 'woostify-quantity-button' ),
				woostify_version(),
				true
			);

			if ( $options['shop_single_image_zoom'] ) {
				// Product gallery zoom.
				wp_register_script(
					'easyzoom',
					WOOSTIFY_THEME_URI . 'assets/js/easyzoom' . woostify_suffix() . '.js',
					array( 'jquery' ),
					woostify_version(),
					true
				);

				// Product gallery zoom handle.
				wp_register_script(
					'easyzoom-handle',
					WOOSTIFY_THEME_URI . 'assets/js/woocommerce/easyzoom-handle' . woostify_suffix() . '.js',
					array( 'easyzoom' ),
					woostify_version(),
					true
				);
			}

			// Product varitions.
			wp_register_script(
				'woostify-product-variation',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/product-variation' . woostify_suffix() . '.js',
				array( 'jquery' ),
				woostify_version(),
				true
			);

			// Lightbox js.
			wp_register_script(
				'lity',
				WOOSTIFY_THEME_URI . 'assets/js/lity' . woostify_suffix() . '.js',
				array( 'jquery' ),
				woostify_version(),
				true
			);

			// Sticky sidebar js.
			wp_register_script(
				'sticky-sidebar',
				WOOSTIFY_THEME_URI . 'assets/js/sticky-sidebar' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			// Tiny slider js.
			wp_register_script(
				'tiny-slider',
				WOOSTIFY_THEME_URI . 'assets/js/tiny-slider' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			// Product images ( Flickity ).
			wp_register_script(
				'woostify-flickity',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/flickity.pkgd' . woostify_suffix() . '.js',
				array(),
				woostify_version(),
				true
			);

			$ios_script = '
			( function () {
				var touchingCarousel = false,
				touchStartCoords;

				document.body.addEventListener( "touchstart", function( e ) {
					if ( e.target.closest( ".flickity-slider" ) ) {
						touchingCarousel = true;
					} else {
						touchingCarousel = false;
						return;
					}

					touchStartCoords = {
						x: e.touches[0].pageX,
						y: e.touches[0].pageY
					}
				});

				document.body.addEventListener( "touchmove" , function(e) {
					if ( ! ( touchingCarousel && e.cancelable ) ) {
						return;
					}

					var moveVector = {
						x: e.touches[0].pageX - touchStartCoords.x,
						y: e.touches[0].pageY - touchStartCoords.y
					};

					if ( Math.abs( moveVector.x ) > 7 )
						e.preventDefault()

				}, { passive: false } );
			} ) ();
			';
			wp_add_inline_script( 'woostify-flickity', $ios_script );

			// Product images ( Tiny slider ).
			wp_register_script(
				'woostify-product-images',
				WOOSTIFY_THEME_URI . 'assets/js/woocommerce/product-images' . woostify_suffix() . '.js',
				array( 'jquery', 'tiny-slider', 'woostify-flickity' ),
				woostify_version(),
				true
			);

			if ( $options['shop_single_image_lightbox'] ) {
				// Photoswipe init js.
				wp_register_script(
					'photoswipe-init',
					WOOSTIFY_THEME_URI . 'assets/js/photoswipe-init' . woostify_suffix() . '.js',
					array( 'photoswipe', 'photoswipe-ui-default' ),
					woostify_version(),
					true
				);
			}

			// Ajax single add to cart.
			if ( $options['shop_single_ajax_add_to_cart'] ) {
				wp_register_script(
					'woostify-single-add-to-cart',
					WOOSTIFY_THEME_URI . 'assets/js/woocommerce/ajax-single-add-to-cart' . woostify_suffix() . '.js',
					array(),
					woostify_version(),
					true
				);
			}

			// Sticky footer bar.
			if ( $options['sticky_footer_bar_enable'] && $options['sticky_footer_bar_hide_when_scroll'] ) {
				wp_enqueue_script(
					'woostify-sticky-footer-bar',
					WOOSTIFY_THEME_URI . 'assets/js/sticky-footer-bar' . woostify_suffix() . '.js',
					array(),
					woostify_version(),
					true
				);
			}

			// Comment reply.
			if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
				wp_enqueue_script( 'comment-reply' );
			}

			do_action( 'woostify_enqueue_scripts' );
		}

		/**
		 * Limit the character length in exerpt
		 *
		 * @param int $length The length.
		 */
		public function woostify_limit_excerpt_character( $length ) {
			// Don't change anything inside /wp-admin/.
			if ( is_admin() ) {
				return $length;
			}

			$options = woostify_options( false );
			$length  = $options['blog_list_limit_exerpt'];

			return $length;
		}

		/**
		 * Get our wp_nav_menu() fallback, wp_page_menu(), to show a home link.
		 *
		 * @param array $args Configuration arguments.
		 *
		 * @return array
		 */
		public function woostify_page_menu_args( $args ) {
			$args['show_home'] = true;

			return $args;
		}

		/**
		 * Adds custom classes to the array of body classes.
		 *
		 * @param array $classes Classes for the body element.
		 *
		 * @return array
		 */
		public function woostify_body_classes( $classes ) {
			// Get theme options.
			$options = woostify_options( false );

			// Broser detection.
			if ( woostify_browser_detection() ) {
				$classes[] = woostify_browser_detection() . '-detected';
			}

			// Detect site using child theme.
			if ( is_child_theme() ) {
				$classes[] = 'child-theme-detected';
			}

			// Site container layout.
			$classes[] = woostify_get_site_container_class();

			// Header layout.
			$classes[] = apply_filters( 'woostify_has_header_layout_classes', 'has-header-layout-1' );

			// Header transparent.
			if ( woostify_header_transparent() ) {
				$classes[] = 'has-header-transparent header-transparent-for-' . $options['header_transparent_enable_on'];
			}

			// Sidebar class detected.
			$classes[] = woostify_sidebar_class();

			// Blog page layout.
			$classes[] = ( ( ! is_singular( 'post' ) && woostify_is_blog() ) || ( is_search() && 'any' === get_query_var( 'post_type' ) ) ) ? 'blog-layout-' . $options['blog_list_layout'] : '';

			return array_filter( $classes );
		}

		/**
		 * Custom navigation markup template hooked into `navigation_markup_template` filter hook.
		 */
		public function woostify_navigation_markup_template() {
			$template  = '<nav class="post-navigation navigation %1$s" aria-label="' . esc_attr__( 'Post Pagination', 'woostify' ) . '">';
			$template .= '<h2 class="screen-reader-text">%2$s</h2>';
			$template .= '<div class="nav-links">%3$s</div>';
			$template .= '</nav>';

			return apply_filters( 'woostify_navigation_markup_template', $template );
		}

		/**
		 * Customizer live preview
		 */
		public function woostify_customize_live_preview() {
			wp_enqueue_script(
				'woostify-customizer-preview',
				WOOSTIFY_THEME_URI . 'assets/js/customizer-preview' . woostify_suffix() . '.js',
				array( 'jquery' ),
				woostify_version(),
				true
			);
		}

		/**
		 * Remove inline css on tag cloud
		 *
		 * @param string $string tagCloud.
		 */
		public function woostify_remove_tag_inline_style( $string ) {
			return preg_replace( '/ style=("|\')(.*?)("|\')/', '', $string );
		}


		/**
		 * Modify excerpt more to `...`
		 *
		 * @param string $more More exerpt.
		 */
		public function woostify_modify_excerpt_more( $more ) {
			// Don't change anything inside /wp-admin/.
			if ( is_admin() ) {
				return $more;
			}

			$more = apply_filters( 'woostify_excerpt_more', '...' );

			return $more;
		}
	}

	$woostify = new Woostify();
}
