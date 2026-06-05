<?php
/**
 * Live-Berichte (§A4/§B4): freigegebene Dispatches chronologisch ausliefern.
 * Postbar vom Handy über wp-admin (CPT `dispatch`).
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Dispatch {

	public static function register_routes() {
		register_rest_route(
			'rts/v1',
			'/dispatches',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'get_dispatches' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function get_dispatches( WP_REST_Request $req ) {
		$q = new WP_Query(
			array(
				'post_type'      => 'dispatch',
				'post_status'    => 'publish',
				'posts_per_page' => 30,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		$items = array();
		foreach ( $q->posts as $p ) {
			$img     = get_the_post_thumbnail_url( $p->ID, 'large' );
			$items[] = array(
				'id'    => $p->ID,
				'title' => get_the_title( $p->ID ),
				'text'  => wp_strip_all_tags( $p->post_content ),
				'date'  => $p->post_date,
				'image' => $img ? $img : null,
			);
		}

		return new WP_REST_Response( array( 'items' => $items ), 200 );
	}
}
