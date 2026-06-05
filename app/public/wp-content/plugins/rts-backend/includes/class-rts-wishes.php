<?php
/**
 * Wunschbaum (§A3/§B4): Wünsche absenden (→ Moderations-Queue) und
 * freigegebene Wünsche paginiert ausliefern.
 *
 * Moderation = WordPress-nativ über den Post-Status:
 *   pending  → in der Queue (unsichtbar)
 *   publish  → freigegeben (sichtbar über GET /wishes)
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Wishes {

	const PER_PAGE = 9;

	public static function register_routes() {
		register_rest_route(
			'rts/v1',
			'/wishes',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => '__return_true',
					'callback'            => array( __CLASS__, 'get_wishes' ),
				),
				array(
					'methods'             => 'POST',
					'permission_callback' => '__return_true',
					'callback'            => array( __CLASS__, 'post_wish' ),
				),
			)
		);
	}

	/**
	 * Nur freigegebene Wünsche, paginiert.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function get_wishes( WP_REST_Request $req ) {
		$page = max( 1, (int) $req->get_param( 'page' ) );

		$q = new WP_Query(
			array(
				'post_type'      => 'wunsch',
				'post_status'    => 'publish',
				'posts_per_page' => self::PER_PAGE,
				'paged'          => $page,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		$items = array();
		foreach ( $q->posts as $p ) {
			$items[] = array(
				'id'        => $p->ID,
				'vorname'   => (string) get_post_meta( $p->ID, '_rts_vorname', true ),
				'ort'       => (string) get_post_meta( $p->ID, '_rts_ort', true ),
				'nachricht' => $p->post_content,
				'ts'        => $p->post_date,
			);
		}

		return new WP_REST_Response(
			array(
				'items' => $items,
				'page'  => $page,
				'pages' => (int) $q->max_num_pages,
				'total' => (int) $q->found_posts,
			),
			200
		);
	}

	/**
	 * Wunsch absenden → status=pending (Turnstile Pflicht, falls aktiviert).
	 *
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function post_wish( WP_REST_Request $req ) {
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$vorname   = self::clean( $params['vorname'] ?? '', 80 );
		$ort       = self::clean( $params['ort'] ?? '', 120 );
		$nachricht = self::clean_multiline( $params['nachricht'] ?? '', 500 );
		$consent   = ! empty( $params['consent'] );
		$token     = isset( $params['turnstile'] ) ? (string) $params['turnstile'] : '';

		if ( '' === $vorname || '' === $nachricht ) {
			return new WP_REST_Response( array( 'error' => 'missing_fields' ), 422 );
		}
		if ( ! $consent ) {
			return new WP_REST_Response( array( 'error' => 'consent_required' ), 422 );
		}

		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		if ( ! RTS_Turnstile::verify( $token, $ip ) ) {
			return new WP_REST_Response( array( 'error' => 'turnstile_failed' ), 403 );
		}

		$id = wp_insert_post(
			array(
				'post_type'    => 'wunsch',
				'post_status'  => 'pending',
				'post_title'   => sprintf( 'Wunsch von %s%s', $vorname, $ort ? " ({$ort})" : '' ),
				'post_content' => $nachricht,
			),
			true
		);

		if ( is_wp_error( $id ) ) {
			return new WP_REST_Response( array( 'error' => 'save_failed' ), 500 );
		}

		update_post_meta( $id, '_rts_vorname', $vorname );
		update_post_meta( $id, '_rts_ort', $ort );
		update_post_meta( $id, '_rts_consent', $consent ? 1 : 0 );

		return new WP_REST_Response(
			array(
				'ok'      => true,
				'pending' => true,
			),
			201
		);
	}

	/* -------- Helfer -------- */

	protected static function clean( $value, $max ) {
		return mb_substr( sanitize_text_field( (string) $value ), 0, $max );
	}

	protected static function clean_multiline( $value, $max ) {
		return mb_substr( sanitize_textarea_field( (string) $value ), 0, $max );
	}
}
