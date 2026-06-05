<?php
/**
 * Newsletter-Anmeldung (§5) – PLATZHALTER.
 *
 * n8n entfällt; später ruft dieser Endpunkt serverseitig die ESP-API
 * (Brevo/CleverReach) auf und löst das Double-Opt-in aus. Aktuell wird
 * nichts versendet oder gespeichert – nur validiert.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Newsletter {

	public static function register_routes() {
		register_rest_route(
			'rts/v1',
			'/newsletter',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'subscribe' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function subscribe( WP_REST_Request $req ) {
		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$email = isset( $params['email'] ) ? sanitize_email( (string) $params['email'] ) : '';
		if ( ! is_email( $email ) ) {
			return new WP_REST_Response( array( 'error' => 'invalid_email' ), 422 );
		}
		if ( empty( $params['consent'] ) ) {
			return new WP_REST_Response( array( 'error' => 'consent_required' ), 422 );
		}

		/**
		 * TODO (ESP-Anbindung): Sobald der ESP feststeht, hier das Double-Opt-in
		 * auslösen, z. B. wp_remote_post() gegen die Brevo-/CleverReach-API mit
		 * dem Secret aus get_option('rts_esp_key'). Bis dahin: nur Hook + Stub.
		 */
		do_action( 'rts_newsletter_signup', $email, $params );

		return new WP_REST_Response(
			array(
				'ok'          => true,
				'placeholder' => true,
			),
			200
		);
	}
}
