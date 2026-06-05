<?php
/**
 * Datenbank-Schicht: Custom-Tabelle für Cheers (Dedup + Ticker) und
 * atomarer Zählerstand als Option.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_DB {

	/** Option für den schnellen, autoritativen Zählerstand. */
	const COUNT_OPTION = 'rts_cheer_count';

	/**
	 * Voller Tabellenname inkl. Präfix.
	 *
	 * @return string
	 */
	public static function table() {
		global $wpdb;
		return $wpdb->prefix . 'rts_cheers';
	}

	/**
	 * Aktivierungs-Routine: Tabelle anlegen, Zähler-Option sicherstellen,
	 * CPTs registrieren und Rewrite-Regeln flushen (REST braucht Pretty Permalinks).
	 */
	public static function activate() {
		self::create_table();

		if ( false === get_option( self::COUNT_OPTION ) ) {
			add_option( self::COUNT_OPTION, 0, '', 'yes' );
		}

		RTS_CPT::register();
		flush_rewrite_rules();
	}

	/**
	 * Legt die Cheers-Tabelle an (idempotent via dbDelta).
	 */
	public static function create_table() {
		global $wpdb;

		$table   = self::table();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			device_hash CHAR(64) NOT NULL DEFAULT '',
			ip_hash CHAR(64) NOT NULL DEFAULT '',
			vorname VARCHAR(80) NOT NULL DEFAULT '',
			ort VARCHAR(120) NOT NULL DEFAULT '',
			consent TINYINT(1) NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY device_hash (device_hash),
			KEY ip_hash (ip_hash),
			KEY created_at (created_at)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	/**
	 * Aktueller Zählerstand.
	 *
	 * @return int
	 */
	public static function get_count() {
		return (int) get_option( self::COUNT_OPTION, 0 );
	}

	/**
	 * Atomar +1 (race-sicher direkt in SQL) und frischen Wert zurückgeben.
	 *
	 * @return int
	 */
	public static function increment_count() {
		global $wpdb;
		$opt = self::COUNT_OPTION;

		// Race-sicher: Inkrement passiert in der DB, nicht in PHP.
		$wpdb->query(
			$wpdb->prepare(
				"UPDATE {$wpdb->options} SET option_value = option_value + 1 WHERE option_name = %s",
				$opt
			)
		);

		// Options-Cache invalidieren, sonst liefert get_option den alten Wert.
		wp_cache_delete( 'alloptions', 'options' );
		wp_cache_delete( $opt, 'options' );

		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT option_value FROM {$wpdb->options} WHERE option_name = %s",
				$opt
			)
		);
	}
}
