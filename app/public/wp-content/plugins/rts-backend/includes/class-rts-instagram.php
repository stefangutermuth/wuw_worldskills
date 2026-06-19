<?php
/**
 * Instagram-Feed (§A4) – spiegelt den Feed der Haupt-WP auf die Microsite.
 *
 * Nutzt den Instagram-Business-Token, den das Smash-Balloon-Plugin
 * (instagram-feed) bereits gespeichert hat (verschlüsselt → via
 * SB_Instagram_Data_Encryption entschlüsselt), und holt die letzten Beiträge
 * über die offizielle Facebook-Graph-API. Ergebnis wird 1 h gecacht.
 *
 * Token bleibt serverseitig; die Microsite bekommt nur Bild-URL, Permalink
 * und Caption als JSON.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Instagram {

	const CACHE_KEY = 'rts_ig_feed';

	public static function register_routes() {
		register_rest_route(
			'rts/v1',
			'/instagram',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'feed' ),
			)
		);
	}

	public static function feed() {
		$cached = get_transient( self::CACHE_KEY );
		if ( is_array( $cached ) ) {
			return new WP_REST_Response( array( 'items' => $cached ), 200 );
		}

		$items = self::fetch();
		// Auch leere Ergebnisse kurz cachen, damit API/DB nicht gehämmert werden.
		set_transient( self::CACHE_KEY, $items, $items ? HOUR_IN_SECONDS : 5 * MINUTE_IN_SECONDS );

		return new WP_REST_Response( array( 'items' => $items ), 200 );
	}

	/**
	 * Holt die letzten Beiträge. Leeres Array, wenn keine Quelle/Token/Tabelle
	 * (z. B. lokal ohne Smash Balloon) – das Frontend zeigt dann Platzhalter.
	 *
	 * @return array
	 */
	private static function fetch() {
		global $wpdb;
		$table = $wpdb->prefix . 'sbi_sources';

		// Tabelle vorhanden?
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row( "SELECT account_id, access_token FROM {$table} WHERE access_token <> '' ORDER BY last_updated DESC LIMIT 1", ARRAY_A );
		if ( ! $row || empty( $row['account_id'] ) || empty( $row['access_token'] ) ) {
			return array();
		}

		$uid   = $row['account_id'];
		$token = $row['access_token'];

		// Smash Balloon legt den Token verschlüsselt ab.
		if ( class_exists( 'SB_Instagram_Data_Encryption' ) ) {
			$enc = new SB_Instagram_Data_Encryption();
			$dec = $enc->decrypt( $token );
			if ( $dec ) {
				$token = $dec;
			}
		}

		$url = 'https://graph.facebook.com/v21.0/' . rawurlencode( $uid ) . '/media'
			. '?fields=id,caption,media_type,media_url,permalink,thumbnail_url'
			. '&limit=12&access_token=' . rawurlencode( $token );

		$resp = wp_remote_get( $url, array( 'timeout' => 15 ) );
		if ( is_wp_error( $resp ) || 200 !== (int) wp_remote_retrieve_response_code( $resp ) ) {
			return array();
		}

		$data = json_decode( wp_remote_retrieve_body( $resp ), true );
		if ( empty( $data['data'] ) || ! is_array( $data['data'] ) ) {
			return array();
		}

		$items = array();
		foreach ( $data['data'] as $m ) {
			$type = isset( $m['media_type'] ) ? $m['media_type'] : 'IMAGE';
			$img  = ( 'VIDEO' === $type )
				? ( isset( $m['thumbnail_url'] ) ? $m['thumbnail_url'] : '' )
				: ( isset( $m['media_url'] ) ? $m['media_url'] : '' );
			if ( ! $img ) {
				continue;
			}
			$items[] = array(
				'image'     => esc_url_raw( $img ),
				'permalink' => isset( $m['permalink'] ) ? esc_url_raw( $m['permalink'] ) : '',
				'caption'   => isset( $m['caption'] ) ? wp_strip_all_tags( mb_substr( $m['caption'], 0, 140 ) ) : '',
				'type'      => $type,
			);
			if ( count( $items ) >= 8 ) {
				break;
			}
		}

		return $items;
	}
}
