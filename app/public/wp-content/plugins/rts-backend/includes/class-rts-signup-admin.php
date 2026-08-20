<?php
/**
 * Admin-Ansicht für die lokal gesicherten Newsletter-Anmeldungen.
 *
 * Zeigt die Einträge aus RTS_Signup_Log unter „Werkzeuge → Newsletter-Anmeldungen“
 * als Tabelle, mit CSV-Export und der Möglichkeit, die Liste zu leeren.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Signup_Admin {

	const CAP  = 'manage_options';
	const SLUG = 'rts-signups';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_rts_signups_export', array( __CLASS__, 'export_csv' ) );
		add_action( 'admin_post_rts_signups_clear', array( __CLASS__, 'clear' ) );
	}

	public static function menu() {
		$count = count( self::entries() );
		add_submenu_page(
			'tools.php',
			'Newsletter-Anmeldungen',
			/* translators: %d = Anzahl */
			sprintf( 'Newsletter-Anmeldungen%s', $count ? ' <span class="update-plugins count-' . $count . '"><span class="update-count">' . $count . '</span></span>' : '' ),
			self::CAP,
			self::SLUG,
			array( __CLASS__, 'render' )
		);
	}

	/** @return array Einträge, neueste zuerst. */
	private static function entries() {
		$log = get_option( RTS_Signup_Log::OPTION, array() );
		if ( ! is_array( $log ) ) {
			return array();
		}
		return array_reverse( $log );
	}

	public static function render() {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( 'Keine Berechtigung.' );
		}
		$entries = self::entries();
		$notice  = isset( $_GET['rts_msg'] ) ? sanitize_text_field( wp_unslash( $_GET['rts_msg'] ) ) : '';
		?>
		<div class="wrap">
			<h1>Newsletter-Anmeldungen</h1>

			<?php if ( 'cleared' === $notice ) : ?>
				<div class="notice notice-success is-dismissible"><p>Liste wurde geleert.</p></div>
			<?php endif; ?>

			<p>
				Diese Liste wird <strong>unabhängig von Brevo</strong> geführt: Jede Anmeldung wird hier
				gespeichert, noch bevor Brevo angesprochen wird. Sie geht also auch dann nicht verloren,
				wenn Brevo nicht erreichbar ist oder die Bestätigungsmail im Spam landet.
			</p>
			<p>
				<strong>Wichtig:</strong> Ein Eintrag hier bedeutet <em>nicht</em>, dass die Person den
				Double-Opt-in bestätigt hat. Verschicken darfst du den Newsletter nur an bestätigte
				Kontakte – die stehen in Brevo.
			</p>

			<p>
				<strong><?php echo count( $entries ); ?></strong> Anmeldung(en) gespeichert.
			</p>

			<p>
				<a class="button button-primary" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=rts_signups_export' ), 'rts_signups_export' ) ); ?>">
					Als CSV herunterladen
				</a>
				<?php if ( $entries ) : ?>
					<a class="button" style="margin-left:.5rem"
					   href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=rts_signups_clear' ), 'rts_signups_clear' ) ); ?>"
					   onclick="return confirm('Wirklich alle Einträge löschen? Das lässt sich nicht rückgängig machen.');">
						Liste leeren
					</a>
				<?php endif; ?>
			</p>

			<table class="wp-list-table widefat fixed striped">
				<thead>
					<tr>
						<th style="width:40px">#</th>
						<th>E-Mail</th>
						<th style="width:200px">Zeitpunkt</th>
						<th style="width:140px">IP</th>
						<th style="width:260px">Herkunft</th>
					</tr>
				</thead>
				<tbody>
				<?php if ( ! $entries ) : ?>
					<tr><td colspan="5">Noch keine Anmeldungen.</td></tr>
				<?php else : ?>
					<?php $i = count( $entries ); foreach ( $entries as $e ) : ?>
						<tr>
							<td><?php echo (int) $i--; ?></td>
							<td>
								<a href="mailto:<?php echo esc_attr( $e['email'] ); ?>"><?php echo esc_html( $e['email'] ); ?></a>
							</td>
							<td><?php echo esc_html( self::local_time( $e['time'] ) ); ?></td>
							<td><?php echo esc_html( $e['ip'] ); ?></td>
							<td><?php echo esc_html( $e['src'] ); ?></td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/** UTC-Zeitstempel in lokaler Zeit ausgeben. */
	private static function local_time( $iso ) {
		if ( empty( $iso ) ) {
			return '';
		}
		$ts = strtotime( $iso );
		return $ts ? wp_date( 'd.m.Y H:i', $ts ) : $iso;
	}

	public static function export_csv() {
		if ( ! current_user_can( self::CAP ) || ! check_admin_referer( 'rts_signups_export' ) ) {
			wp_die( 'Keine Berechtigung.' );
		}
		$entries = self::entries();

		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=newsletter-anmeldungen-' . gmdate( 'Y-m-d' ) . '.csv' );

		$out = fopen( 'php://output', 'w' );
		fwrite( $out, "\xEF\xBB\xBF" ); // BOM, damit Excel Umlaute korrekt zeigt
		fputcsv( $out, array( 'E-Mail', 'Zeitpunkt (UTC)', 'IP', 'Herkunft' ), ';' );
		foreach ( $entries as $e ) {
			fputcsv( $out, array( $e['email'], $e['time'], $e['ip'], $e['src'] ), ';' );
		}
		fclose( $out );
		exit;
	}

	public static function clear() {
		if ( ! current_user_can( self::CAP ) || ! check_admin_referer( 'rts_signups_clear' ) ) {
			wp_die( 'Keine Berechtigung.' );
		}
		update_option( RTS_Signup_Log::OPTION, array(), false );
		wp_safe_redirect( admin_url( 'tools.php?page=' . self::SLUG . '&rts_msg=cleared' ) );
		exit;
	}
}
