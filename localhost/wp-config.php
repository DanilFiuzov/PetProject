<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'gc_base' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'vJbkg&+7ZPi1)-w_YX6d8=e4;!RcrA7cKEbX^lAU4CU~k2a=M|Z5u}|JxZ0PnT,%' );
define( 'SECURE_AUTH_KEY',  '~Tr4Y){94MelzhFTfSw@#3s^f{j^w#;Uq[cdi,YFh>#-c}K-[qyKb4jYW2nU[!NR' );
define( 'LOGGED_IN_KEY',    'xX$1XgOQ^EMlO<Z2=js-A~W^D.@@A,XRNLKFf1geCGtGHs`r&>G}06({E[tJf!l3' );
define( 'NONCE_KEY',        'mz`v7?EI10DybJiB8IgFP_*#,;$n$MkyMiW.0?]O zq_{;Z;5qpX3W+K!:TeD2MC' );
define( 'AUTH_SALT',        'JOfh@wF9!w&lKD<f;sY#=3!YnwY^:`Z<{e Je:=& VFsH@Hr$%B_V)HQ?hyDjwu(' );
define( 'SECURE_AUTH_SALT', '?JW~vULT- sA0%&/vG:>Y<]#/EFVjdUg~t,9,WUdENFGUI}rxLY-G,z@q/{:QK`M' );
define( 'LOGGED_IN_SALT',   '$a3JG](!V/s]^DqjrjJ{C],;u4*p?m:Ck0sIhn3SSTmhC]n2!xT<~>MnDnBkAqVx' );
define( 'NONCE_SALT',       'rs,o:%+t<Xz0BGAC;G9.GwS-2rq i2_?(VQAfmk?u?25B|i_73AAa!xqAKPpWd.b' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
