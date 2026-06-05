<?php
/**
 * CORS für die REST-API. Ohne das scheitern alle fetch-Calls aus dem Astro-Frontend.
 * Setzt die Allow-Origin-Header nur für erlaubte Origins und beantwortet Preflights.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_CORS {

	/**
	 * Erlaubte Frontend-Origins. Per Filter erweiterbar.
	 *
	 * @return string[]
	 */
	public static function allowed_origins() {
		return apply_filters(
			'rts_allowed_origins',
			array(
				'http://localhost:4321',                 // Astro-Dev (direkt)
				'http://worldskills-shanghai-2026.local', // lokal über nginx-Proxy
				'https://shanghai.wirth-wiener.de',       // Prod
			)
		);
	}

	/**
	 * Hooks registrieren (innerhalb rest_api_init aufrufen).
	 */
	public static function init() {
		// WordPress-Standard-CORS (Origin: *) entfernen, eigenes Handling setzen.
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'send_headers' ), 10, 1 );
	}

	/**
	 * Setzt die CORS-Header und beantwortet OPTIONS-Preflights.
	 *
	 * @param bool $served Ob die Antwort schon ausgeliefert wurde.
	 * @return bool
	 */
	public static function send_headers( $served ) {
		$origin = get_http_origin();

		if ( $origin && in_array( $origin, self::allowed_origins(), true ) ) {
			header( 'Access-Control-Allow-Origin: ' . $origin );
			header( 'Vary: Origin' );
			header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Content-Type' );
			header( 'Access-Control-Max-Age: 600' );
		}

		// Preflight kurzschließen.
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
			status_header( 204 );
			exit;
		}

		return $served;
	}
}
