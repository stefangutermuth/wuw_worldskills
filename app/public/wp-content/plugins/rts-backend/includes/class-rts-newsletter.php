<?php
/**
 * Newsletter-Anmeldung (§5).
 *
 * Das Frontend postet { email, consent } an /rts/v1/newsletter.
 *
 * Seit 18.09.2026 bevorzugt über das WordPress-Plugin „Newsletter" (TNP) auf der
 * Hauptseite: Es verschickt die Double-Opt-in-Mail selbst über den normalen
 * Mailversand von WordPress (WP Mail SMTP). Grund: Bei Brevo ließ sich die Domain
 * nicht authentifizieren (DMARC-CNAME bei IONOS), die Bestätigungsmails kamen nie an.
 * Ist das Plugin nicht aktiv, greift weiter die Brevo-Anbindung unten.
 *
 * Konfiguration über WP-Optionen (NIE im Code/Repo):
 *   - rts_esp_key            Brevo API-Key v3 (xkeysib-…)            [Pflicht]
 *   - rts_brevo_list_id      Ziel-Listen-ID (int)                    [Pflicht]
 *   - rts_brevo_doi_template DOI-Template-ID (int) → aktiviert DOI   [empfohlen]
 *   - rts_brevo_redirect     Weiterleitungs-URL nach Bestätigung     [bei DOI]
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

		// Konfiguration bevorzugt aus wp-config-Konstanten (Key bleibt außerhalb der DB),
		// sonst aus WP-Optionen (lokal/Dev).
		$api_key  = ( defined( 'WUW_BREVO_API_KEY' ) && WUW_BREVO_API_KEY )
			? (string) WUW_BREVO_API_KEY
			: trim( (string) get_option( 'rts_esp_key', '' ) );
		$list_id  = defined( 'WUW_BREVO_LIST_ID' )
			? (int) WUW_BREVO_LIST_ID
			: (int) get_option( 'rts_brevo_list_id', 0 );
		$tpl_id   = defined( 'WUW_BREVO_DOI_TEMPLATE' )
			? (int) WUW_BREVO_DOI_TEMPLATE
			: (int) get_option( 'rts_brevo_doi_template', 0 );
		$redirect = ( defined( 'WUW_BREVO_REDIRECT' ) && WUW_BREVO_REDIRECT )
			? (string) WUW_BREVO_REDIRECT
			: trim( (string) get_option( 'rts_brevo_redirect', '' ) );
		// DOI braucht eine Weiterleitungs-URL; sinnvoller Default = Microsite-Start.
		if ( '' === $redirect ) {
			$redirect = 'https://shanghai.wirth-wiener.de/';
		}

		// Hook bleibt erhalten (z. B. fürs Logging/CRM), unabhängig vom ESP.
		do_action( 'rts_newsletter_signup', $email, $params );

		if ( class_exists( 'TNP' ) ) {
			return self::subscribe_tnp( $email, $params );
		}

		// Ohne Grundkonfiguration kein Fake-Erfolg – klarer Fehler.
		if ( '' === $api_key || $list_id < 1 ) {
			return new WP_REST_Response( array( 'error' => 'esp_not_configured' ), 503 );
		}

		if ( $tpl_id > 0 && '' !== $redirect ) {
			// Double-Opt-in: Brevo verschickt die Bestätigungsmail selbst.
			$endpoint = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';
			$payload  = array(
				'email'          => $email,
				'includeListIds' => array( $list_id ),
				'templateId'     => $tpl_id,
				'redirectionUrl' => $redirect,
			);
		} else {
			// Fallback: Kontakt direkt in die Liste (Single-Opt-in).
			$endpoint = 'https://api.brevo.com/v3/contacts';
			$payload  = array(
				'email'         => $email,
				'listIds'       => array( $list_id ),
				'updateEnabled' => true,
			);
		}

		$resp = wp_remote_post(
			$endpoint,
			array(
				'timeout' => 15,
				'headers' => array(
					'api-key'      => $api_key,
					'Content-Type' => 'application/json',
					'accept'       => 'application/json',
				),
				'body'    => wp_json_encode( $payload ),
			)
		);

		if ( is_wp_error( $resp ) ) {
			return new WP_REST_Response( array( 'error' => 'esp_unreachable' ), 502 );
		}

		$code = (int) wp_remote_retrieve_response_code( $resp );
		if ( $code >= 200 && $code < 300 ) {
			return new WP_REST_Response( array( 'ok' => true ), 200 );
		}

		// „Kontakt existiert bereits" als Erfolg behandeln (kein Fehler für den Nutzer).
		$data  = json_decode( wp_remote_retrieve_body( $resp ), true );
		$bcode = ( is_array( $data ) && isset( $data['code'] ) ) ? $data['code'] : '';
		if ( 400 === $code && 'duplicate_parameter' === $bcode ) {
			return new WP_REST_Response( array( 'ok' => true, 'already' => true ), 200 );
		}

		// Sonst: Fehler protokollieren (OHNE Key) und neutral antworten.
		error_log( '[rts-newsletter] Brevo HTTP ' . $code . ' – ' . wp_remote_retrieve_body( $resp ) );
		return new WP_REST_Response( array( 'error' => 'esp_error' ), 502 );
	}

	/**
	 * Anmeldung über das Plugin „Newsletter". Es beachtet das dort eingestellte
	 * Double-Opt-in und verschickt die Bestätigungsmail (send_emails).
	 *
	 * @param string $email  Geprüfte Adresse.
	 * @param array  $params Request-Daten (optional: name).
	 * @return WP_REST_Response
	 */
	private static function subscribe_tnp( $email, $params ) {
		$args = array(
			'email'       => $email,
			'send_emails' => true,
		);
		if ( ! empty( $params['name'] ) ) {
			$args['name'] = sanitize_text_field( (string) $params['name'] );
		}

		$user = TNP::subscribe( $args );

		if ( is_wp_error( $user ) ) {
			$code = $user->get_error_code();
			// Schon eingetragen → für den Besucher kein Fehler.
			if ( 'exists' === $code ) {
				return new WP_REST_Response( array( 'ok' => true, 'already' => true ), 200 );
			}
			error_log( '[rts-newsletter] TNP ' . $code . ' – ' . $user->get_error_message() );
			$status = in_array( $code, array( 'email', 'spam' ), true ) ? 422 : 409;
			return new WP_REST_Response( array( 'error' => 'esp_' . $code ), $status );
		}

		return new WP_REST_Response(
			array(
				'ok'      => true,
				// Bereits bestätigte Adressen bekommen keine neue Mail.
				'already' => ( is_object( $user ) && isset( $user->status ) && 'C' === $user->status ),
			),
			200
		);
	}
}
