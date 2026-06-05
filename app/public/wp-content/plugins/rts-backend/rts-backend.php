<?php
/**
 * Plugin Name:       RTS Backend – Road to Shanghai
 * Description:        Headless-Backend für die Road-to-Shanghai-Microsite: Zähler („Daumendrücken"), Wünsche, Live-Dispatches, REST-API & CORS. Öffentliches Frontend = Astro.
 * Version:           0.1.0
 * Requires PHP:      8.0
 * Author:            Wirth & Wiener GmbH / GUMU Agentur
 * Text Domain:       rts-backend
 *
 * @package RTS_Backend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Direktaufruf verhindern.
}

define( 'RTS_VERSION', '0.1.0' );
define( 'RTS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RTS_PLUGIN_FILE', __FILE__ );

require_once RTS_PLUGIN_DIR . 'includes/class-rts-db.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-cpt.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-cors.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-cheer.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-turnstile.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-wishes.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-dispatch.php';
require_once RTS_PLUGIN_DIR . 'includes/class-rts-newsletter.php';

// Aktivierung: Tabelle anlegen, Option initialisieren, CPTs registrieren + Rewrites flushen.
register_activation_hook( __FILE__, array( 'RTS_DB', 'activate' ) );

// Laufzeit-Hooks.
add_action( 'init', array( 'RTS_CPT', 'register' ) );
add_action( 'rest_api_init', array( 'RTS_CORS', 'init' ) );
add_action( 'rest_api_init', array( 'RTS_Cheer', 'register_routes' ) );
add_action( 'rest_api_init', array( 'RTS_Wishes', 'register_routes' ) );
add_action( 'rest_api_init', array( 'RTS_Dispatch', 'register_routes' ) );
add_action( 'rest_api_init', array( 'RTS_Newsletter', 'register_routes' ) );

// Admin-Komfort: Spalten für die Wunsch-Moderation.
RTS_CPT::admin_hooks();

// Minimaler Status-Endpunkt (Live-Modus-Schalter, §B4). Datum-/Option-basiert.
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'rts/v1',
			'/status',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function () {
					$live = (bool) get_option( 'rts_live', false );
					return new WP_REST_Response( array( 'live' => $live ), 200 );
				},
			)
		);
	}
);
