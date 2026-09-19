<?php
/**
 * Absender der Newsletter-Mails (Plugin „Newsletter") – ÜBERGANGSLÖSUNG.
 *
 * WP Mail SMTP erzwingt für alle Mails der Hauptseite stefan@gumu-agentur.de. Das wird
 * sauber zugestellt (mail-tester 9/10), zeigt aber die Agentur als Absender. Für den
 * Newsletter soll Wirth & Wiener sichtbar sein. Ohne Zugang zum IONOS-Postfach geht das
 * nur über den All-Inkl-Server: sichtbar info@wirth-wiener.de, Rücksendepfad (SPF) über
 * gumu-agentur.de – die Domain erlaubt den Server per „a"-Eintrag.
 *
 * Bewusste Entscheidung vom 19.09.2026 trotz mail-tester 5,7/10: DMARC scheitert, weil
 * sichtbare Domain und geprüfte Domain auseinanderfallen; einzelne Postfächer lehnen ab
 * oder sortieren in den Spam.
 *
 * Nur Mails des Newsletter-Plugins werden umgestellt. Kontaktformulare & Co. bleiben
 * beim gumu-Absender.
 *
 * ENTFERNEN, sobald WP Mail SMTP über smtp.ionos.de als info@wirth-wiener.de sendet
 * (geplant Anfang Oktober 2026): in wp-config.php
 *     define( 'RTS_NL_SENDER_OVERRIDE', false );
 * setzen oder diese Datei samt require in rts-backend.php löschen.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Newsletter_Sender {

	const FROM_EMAIL  = 'info@wirth-wiener.de';
	const FROM_NAME   = 'Wirth & Wiener'; // allgemeiner W&W-Newsletter (Entscheidung 19.09.2026), Shanghai ist ein Thema darin
	const RETURN_PATH = 'stefan@gumu-agentur.de';

	public static function init() {
		if ( defined( 'RTS_NL_SENDER_OVERRIDE' ) && ! RTS_NL_SENDER_OVERRIDE ) {
			return;
		}
		// Als Letztes: WP Mail SMTP greift mit 10 ein, das Newsletter-Plugin mit 100.
		add_action( 'phpmailer_init', array( __CLASS__, 'apply' ), PHP_INT_MAX );
	}

	/**
	 * @param PHPMailer\PHPMailer\PHPMailer $phpmailer Mailer-Instanz von wp_mail().
	 */
	public static function apply( $phpmailer ) {
		if ( ! self::is_newsletter_mail() ) {
			return;
		}
		try {
			$phpmailer->setFrom( self::FROM_EMAIL, self::FROM_NAME, false );
			$phpmailer->Sender = self::RETURN_PATH;
		} catch ( \Exception $e ) {
			error_log( '[rts-newsletter] Absender nicht gesetzt: ' . $e->getMessage() );
		}
	}

	/**
	 * Das Newsletter-Plugin hält die Nachricht, die es gerade per wp_mail() verschickt,
	 * in $current_message – bei Bestätigungs-, Willkommens- und Newsletter-Mails.
	 */
	private static function is_newsletter_mail() {
		if ( ! class_exists( 'Newsletter' ) || ! class_exists( 'NewsletterDefaultMailer' ) ) {
			return false;
		}
		$mailer = Newsletter::instance()->get_mailer();
		return ( $mailer instanceof NewsletterDefaultMailer ) && null !== $mailer->current_message;
	}
}
