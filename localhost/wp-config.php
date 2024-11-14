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
define( 'AUTH_KEY',         'BKPw< (ExVS-N+=5fEksxobjWb*=>e*$4MMH#=,:J9>I@eJ!h_ldi9i_13/*>_bO' );
define( 'SECURE_AUTH_KEY',  'GeDb62;DGn_U.%9D1pd/z75|i6NKP!jBJ-+O020Xtzf:G1dw((D#a6Y<;F-08SS;' );
define( 'LOGGED_IN_KEY',    'lD5[s|ck772zR.^`;|vO0+2F#QZ=k2bP01-zE62H<o[+t=~R>SfP&9?2uc MJ1f>' );
define( 'NONCE_KEY',        '.D^Ja*Z]rMphna.S,(mvt?lP=xOrBbvlQE7=9X4J*>q.w BbLj5?l<?5R<h;]Lzi' );
define( 'AUTH_SALT',        '3LT8PK,/E33#-(Fd{wM050B@H@hY?FE+E9j{(-#9RdL7lBohZUu]uNMdz8@JVth3' );
define( 'SECURE_AUTH_SALT', ',>.H#eC-?~1.}Eh5~3_q;Zra24K@v]^GUDjVvT,qqmg%xSWLFV,tBL;)H,%koAw$' );
define( 'LOGGED_IN_SALT',   'f]e@B&,K8-hN$15)O8w]1*kpZ2v&Ai#6GfgsxTS1,a)E-M}EJm1fHV_EBcZ4aAeX' );
define( 'NONCE_SALT',       '>t^d|2AGT)?]|,?]sttC &.NBN|D)G Dd7DgabBZo}}QkGOs8on%?C*ytg(&hsh-' );

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
