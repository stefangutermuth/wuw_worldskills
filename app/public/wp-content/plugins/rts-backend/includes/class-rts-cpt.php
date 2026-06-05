<?php
/**
 * Custom Post Types: `wunsch` (Wunschbaum, moderiert) und `dispatch` (Live-Berichte).
 * Für Phase 2 nur als Grundgerüst registriert – die Logik (Turnstile, Moderation,
 * REST) folgt in den späteren Phasen.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_CPT {

	/**
	 * Beide CPTs registrieren.
	 */
	public static function register() {
		// --- Wunsch (Wunschbaum) ---
		register_post_type(
			'wunsch',
			array(
				'labels'       => array(
					'name'          => __( 'Wünsche', 'rts-backend' ),
					'singular_name' => __( 'Wunsch', 'rts-backend' ),
					'menu_name'     => __( 'Wünsche', 'rts-backend' ),
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => true,
				'menu_icon'    => 'dashicons-format-status',
				'supports'     => array( 'title', 'editor', 'custom-fields' ),
				'show_in_rest' => false, // eigene REST-Routen statt Standard-API.
			)
		);

		// --- Dispatch (Live-Bericht aus Shanghai) ---
		register_post_type(
			'dispatch',
			array(
				'labels'       => array(
					'name'          => __( 'Live-Berichte', 'rts-backend' ),
					'singular_name' => __( 'Bericht', 'rts-backend' ),
					'menu_name'     => __( 'Live-Berichte', 'rts-backend' ),
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => true,
				'menu_icon'    => 'dashicons-megaphone',
				'supports'     => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
				'show_in_rest' => false,
			)
		);
	}

	/**
	 * Admin-Komfort: Spalten Vorname/Ort in der Wunsch-Liste.
	 */
	public static function admin_hooks() {
		add_filter(
			'manage_wunsch_posts_columns',
			function ( $cols ) {
				$new = array();
				foreach ( $cols as $key => $label ) {
					$new[ $key ] = $label;
					if ( 'title' === $key ) {
						$new['rts_vorname'] = __( 'Vorname', 'rts-backend' );
						$new['rts_ort']     = __( 'Ort', 'rts-backend' );
					}
				}
				return $new;
			}
		);

		add_action(
			'manage_wunsch_posts_custom_column',
			function ( $col, $post_id ) {
				if ( 'rts_vorname' === $col ) {
					echo esc_html( get_post_meta( $post_id, '_rts_vorname', true ) );
				} elseif ( 'rts_ort' === $col ) {
					echo esc_html( get_post_meta( $post_id, '_rts_ort', true ) );
				}
			},
			10,
			2
		);
	}
}
