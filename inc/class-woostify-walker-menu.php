<?php
/**
 * Woostify Walker Menu Class
 *
 * @package  Woostify Pro
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Woostify_Walker_Menu' ) ) {
	/**
	 * Woostify Walker Menu Class
	 */
	class Woostify_Walker_Menu extends Walker_Nav_Menu {
		/**
		 * Walker menu
		 *
		 * @see Walker::start_el()
		 *
		 * @param string $output Passed by reference. Used to append additional content.
		 * @param object $item Menu item data object.
		 * @param int    $depth Depth of menu item. Used for padding.
		 * @param object $args The array.
		 * @param int    $id The id.
		 */
		public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
			$indent      = $depth ? str_repeat( "\t", $depth ) : '';
			$class_names = '';
			$value       = '';

			// Classes name.
			$classes   = empty( $item->classes ) ? array() : (array) $item->classes;
			$classes[] = 'menu-item-' . $item->ID;
			$classes = array_filter( $classes );

			// Check this item has children.
			$has_child = in_array( 'menu-item-has-children', $classes, true ) ? true : false;

			// Join classes name.
			$class_names = join( ' ', apply_filters( 'woostify_mega_menu_css_class', $classes, $item, $args ) );
			$class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';

			// Ids.
			$id = apply_filters( 'woostify_mega_menu_item_id', 'menu-item-' . $item->ID, $item, $args );
			$id = $id ? ' id="' . esc_attr( $id ) . '"' : '';

			// Start output.
			$output .= $indent . '<li' . $id . $value . $class_names . '>';

			// Attributes.
			$atts           = array();
			$atts['target'] = ! empty( $item->target ) ? $item->target : '';
			$atts['rel']    = ! empty( $item->xfn ) ? $item->xfn : '';
			$atts['href']   = ! empty( $item->url ) ? $item->url : '';
			$atts           = apply_filters( 'nav_menu_link_attributes', $atts, $item, $args, $depth );
			$attributes     = '';

			foreach ( $atts as $attr => $value ) {
				if ( ! empty( $value ) ) {
					$value       = 'href' === $attr ? esc_url( $value ) : esc_attr( $value );
					$attributes .= ' ' . $attr . '="' . $value . '"';
				}
			}

			$item_output = $args->before;

			if ( ! empty( $item->attr_title ) ) {
				$item_output .= '<a' . $attributes . ' title="' . esc_attr( $item->attr_title ) . '">';
			} else {
				$item_output .= '<a' . $attributes . '>';
			}

			$title = apply_filters( 'the_title', $item->title, $item->ID );
			$title = apply_filters( 'nav_menu_item_title', $title, $item, $args, $depth );

			// Menu item text.
			$item_output .= $args->link_before . '<span class="menu-item-text">' . $title . '</span>' . $args->link_after;

			// Add arrow icon.
			if ( $has_child ) {
				$item_output .= '<span class="menu-item-arrow arrow-icon">' . Woostify_Icon::fetch_svg_icon( 'angle-down', false ) . '</span>';
			}

			$item_output .= '</a>';
			$item_output .= $args->after;

			$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
		}
	}
}
