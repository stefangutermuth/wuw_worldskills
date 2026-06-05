<?php
/**
 * REST-Endpunkt „Daumendrücken" (§B4/B5).
 *
 *   GET  /rts/v1/cheer  → aktueller Count + letzte Ticker-Einträge
 *   POST /rts/v1/cheer  → +1 (serverseitig), 1×/Gerät/Tag, optional Vorname+Ort+Consent
 *
 * Kernprinzip: Der Client schickt NIE den Zählerwert. Der Server inkrementiert,
 * dedupt pro Gerät/Tag und liefert den autoritativen Count zurück.
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RTS_Cheer {

	/** Anzahl Ticker-Einträge in der Antwort. */
	const TICKER_LIMIT = 8;

	/** Rate-Limit pro IP innerhalb des Fensters. */
	const RATE_MAX    = 60;
	const RATE_WINDOW = 600; // Sekunden (10 Min.)

	/**
	 * Routen registrieren.
	 */
	public static function register_routes() {
		register_rest_route(
			'rts/v1',
			'/cheer',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_cheers' ),
					'permission_callback' => '__return_true',
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'post_cheer' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * GET: Count + Ticker.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_cheers() {
		return new WP_REST_Response(
			array(
				'count'  => RTS_DB::get_count(),
				'ticker' => self::ticker(),
			),
			200
		);
	}

	/**
	 * POST: Daumen +1 (mit Dedup, Rate-Limit, optionalem Ticker-Eintrag).
	 *
	 * @param WP_REST_Request $req Request.
	 * @return WP_REST_Response
	 */
	public static function post_cheer( WP_REST_Request $req ) {
		$ip      = self::client_ip();
		$ip_hash = self::hash( $ip );

		// Rate-Limit pro IP (Sliding window via Transient).
		if ( self::is_rate_limited( $ip_hash ) ) {
			return new WP_REST_Response(
				array(
					'error' => 'rate_limited',
					'count' => RTS_DB::get_count(),
				),
				429
			);
		}
		self::bump_rate( $ip_hash );

		$params = $req->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		// Geräte-ID kommt aus dem Frontend (localStorage). Fallback: IP.
		$device_id = isset( $params['device_id'] ) ? sanitize_text_field( (string) $params['device_id'] ) : '';
		if ( '' === $device_id ) {
			$device_id = 'ip:' . $ip;
		}
		$device_hash = self::hash( $device_id );

		$already = self::has_voted_today( $device_hash );

		$consent = ! empty( $params['consent'] ) ? 1 : 0;
		$vorname = isset( $params['vorname'] ) ? self::clean( $params['vorname'], 80 ) : '';
		$ort     = isset( $params['ort'] ) ? self::clean( $params['ort'], 120 ) : '';

		global $wpdb;
		$named = false;

		if ( ! $already ) {
			$wpdb->insert(
				RTS_DB::table(),
				array(
					'device_hash' => $device_hash,
					'ip_hash'     => $ip_hash,
					// DSGVO: Vorname/Ort nur mit Consent speichern.
					'vorname'     => $consent ? $vorname : '',
					'ort'         => $consent ? $ort : '',
					'consent'     => $consent,
					'created_at'  => current_time( 'mysql' ),
				),
				array( '%s', '%s', '%s', '%s', '%d', '%s' )
			);
			$count = RTS_DB::increment_count();
			$named = ( $consent && '' !== $vorname );
		} else {
			// Schon heute abgestimmt – Zähler bleibt, aber den Namen darf man
			// nachträglich an den bestehenden Eintrag anhängen (Consent + Vorname).
			if ( $consent && '' !== $vorname ) {
				$table  = RTS_DB::table();
				$today  = current_time( 'Y-m-d' );
				$row_id = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT id FROM {$table} WHERE device_hash = %s AND DATE(created_at) = %s ORDER BY id DESC LIMIT 1",
						$device_hash,
						$today
					)
				);
				if ( $row_id ) {
					$wpdb->update(
						$table,
						array(
							'vorname' => $vorname,
							'ort'     => $ort,
							'consent' => 1,
						),
						array( 'id' => (int) $row_id ),
						array( '%s', '%s', '%d' ),
						array( '%d' )
					);
					$named = true;
				}
			}
			$count = RTS_DB::get_count();
		}

		return new WP_REST_Response(
			array(
				'count'   => $count,
				'already' => $already,
				'named'   => $named,
				'ticker'  => self::ticker(),
			),
			200
		);
	}

	/* ----------------------------------------------------------------- */
	/* Helfer                                                            */
	/* ----------------------------------------------------------------- */

	/**
	 * Letzte Ticker-Einträge (nur mit Consent + Vorname).
	 *
	 * @return array<int,array<string,string>>
	 */
	protected static function ticker() {
		global $wpdb;
		$table = RTS_DB::table();

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT vorname, ort, created_at FROM {$table}
				 WHERE consent = 1 AND vorname <> ''
				 ORDER BY id DESC LIMIT %d",
				self::TICKER_LIMIT
			)
		);

		$out = array();
		if ( $rows ) {
			foreach ( $rows as $r ) {
				$out[] = array(
					'vorname' => $r->vorname,
					'ort'     => $r->ort,
					'ts'      => $r->created_at,
				);
			}
		}
		return $out;
	}

	/**
	 * Hat dieses Gerät heute schon abgestimmt?
	 *
	 * @param string $device_hash Hash.
	 * @return bool
	 */
	protected static function has_voted_today( $device_hash ) {
		global $wpdb;
		$table = RTS_DB::table();
		$today = current_time( 'Y-m-d' );

		$n = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE device_hash = %s AND DATE(created_at) = %s",
				$device_hash,
				$today
			)
		);
		return (int) $n > 0;
	}

	/**
	 * Salted SHA-256 (für device_hash / ip_hash – DSGVO: nie Klartext-IP speichern).
	 *
	 * @param string $value Wert.
	 * @return string
	 */
	protected static function hash( $value ) {
		return hash( 'sha256', $value . '|' . wp_salt( 'auth' ) );
	}

	/**
	 * Client-IP (lokal i. d. R. 127.0.0.1; Prod: ggf. hinter Proxy/CDN anpassen).
	 *
	 * @return string
	 */
	protected static function client_ip() {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '0.0.0.0';
	}

	/**
	 * Text säubern + kürzen.
	 *
	 * @param mixed $value Eingabe.
	 * @param int   $max   Max. Länge.
	 * @return string
	 */
	protected static function clean( $value, $max ) {
		$value = sanitize_text_field( (string) $value );
		return mb_substr( $value, 0, $max );
	}

	/**
	 * Rate-Limit prüfen.
	 *
	 * @param string $ip_hash Hash.
	 * @return bool
	 */
	protected static function is_rate_limited( $ip_hash ) {
		return (int) get_transient( 'rts_rl_' . $ip_hash ) >= self::RATE_MAX;
	}

	/**
	 * Rate-Limit-Zähler erhöhen.
	 *
	 * @param string $ip_hash Hash.
	 */
	protected static function bump_rate( $ip_hash ) {
		$key  = 'rts_rl_' . $ip_hash;
		$hits = (int) get_transient( $key );
		set_transient( $key, $hits + 1, self::RATE_WINDOW );
	}
}
