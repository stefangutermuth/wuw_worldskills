<?php
/**
 * Cloudflare-Turnstile-Verifikation (§B6) für das Wunsch-Formular.
 * Ohne konfiguriertes Secret (Option `rts_turnstile_secret`) wird im Dev
 * durchgelassen – so blockiert der fehlende Key die Entwicklung nicht.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Turnstile {

	const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

	public static function secret() {
		return (string) get_option( 'rts_turnstile_secret', '' );
	}

	public static function is_enabled() {
		return '' !== self::secret();
	}

	/**
	 * Token gegen die Cloudflare-API prüfen.
	 *
	 * @param string $token Turnstile-Token vom Frontend.
	 * @param string $ip    Client-IP (optional).
	 * @return bool
	 */
	public static function verify( $token, $ip = '' ) {
		// Placeholder/Dev: ohne Secret kein Block.
		if ( ! self::is_enabled() ) {
			return true;
		}
		if ( empty( $token ) ) {
			return false;
		}

		$resp = wp_remote_post(
			self::VERIFY_URL,
			array(
				'timeout' => 8,
				'body'    => array(
					'secret'   => self::secret(),
					'response' => $token,
					'remoteip' => $ip,
				),
			)
		);

		if ( is_wp_error( $resp ) ) {
			return false;
		}

		$body = json_decode( wp_remote_retrieve_body( $resp ), true );
		return ! empty( $body['success'] );
	}
}
