<?php
/**
 * Newsletter-Anmeldungen lokal sichern (Ausfallsicherung neben Brevo).
 *
 * Hängt sich an `rts_newsletter_signup` – dieser Hook feuert BEVOR Brevo
 * aufgerufen wird. Dadurch ist jede Anmeldung festgehalten, selbst wenn Brevo
 * gerade nicht erreichbar ist, der Key abläuft oder die Bestätigungsmail im
 * Spam landet.
 *
 * Gespeichert wird in der Option `rts_signup_log` (autoload = no).
 * Zusätzlich geht sofort eine Benachrichtigung an RTS_SIGNUP_NOTIFY.
 *
 * Auslesen/Export per WP-CLI:
 *   wp option get rts_signup_log --format=json
 *   wp eval 'foreach(get_option("rts_signup_log",[]) as $e) echo $e["email"],";",$e["time"],"\n";'
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Signup_Log {

	const OPTION = 'rts_signup_log';
	const MAX    = 2000;

	public static function init() {
		add_action( 'rts_newsletter_signup', array( __CLASS__, 'record' ), 10, 2 );
	}

	/**
	 * @param string $email  Bereits validierte Adresse.
	 * @param array  $params Rohe Request-Parameter.
	 */
	public static function record( $email, $params = array() ) {
		$email = sanitize_email( (string) $email );
		if ( ! is_email( $email ) ) {
			return;
		}

		$entry = array(
			'email' => $email,
			'time'  => gmdate( 'c' ),
			// Zeitstempel + IP dienen als Nachweis der Einwilligung (Opt-in-Doku).
			'ip'    => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
			'src'   => isset( $_SERVER['HTTP_ORIGIN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '',
		);

		$log = get_option( self::OPTION, array() );
		if ( ! is_array( $log ) ) {
			$log = array();
		}
		$log[] = $entry;
		if ( count( $log ) > self::MAX ) {
			$log = array_slice( $log, -self::MAX );
		}
		// autoload = no: Der Log wird nicht bei jedem Seitenaufruf mitgeladen.
		update_option( self::OPTION, $log, false );

		self::notify( $entry, count( $log ) );
	}

	private static function notify( array $entry, $total ) {
		$to = defined( 'RTS_SIGNUP_NOTIFY' ) && RTS_SIGNUP_NOTIFY
			? (string) RTS_SIGNUP_NOTIFY
			: (string) get_option( 'rts_signup_notify', 'info@gumu-agentur.de' );
		if ( ! is_email( $to ) ) {
			return;
		}

		$body = "Neue Newsletter-Anmeldung auf der Road-to-Shanghai-Seite:\n\n"
			. 'E-Mail:    ' . $entry['email'] . "\n"
			. 'Zeitpunkt: ' . $entry['time'] . " (UTC)\n"
			. 'IP:        ' . $entry['ip'] . "\n"
			. 'Herkunft:  ' . $entry['src'] . "\n\n"
			. 'Insgesamt gespeicherte Anmeldungen: ' . (int) $total . "\n\n"
			. "Hinweis: Diese Adresse ist lokal in WordPress gesichert. Ob die\n"
			. "Bestaetigungsmail von Brevo angekommen ist, steht damit noch nicht fest.\n";

		wp_mail( $to, 'Newsletter-Anmeldung: ' . $entry['email'], $body );
	}
}
