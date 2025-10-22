<?php
/**
 * Plugin Name: Online Energieausweis Extensions
 * Version: 1.0.0
 * Text Domain: wp-onea-extensions
 * Description: Extends functionalities and custom personalizations to Onea (Online Energieausweis) website
 * Author: netzstrategen
 * Author URI: https://netzstrategen.com
 * License: GPL-3.0
 * License URI: http://choosealicense.com/licenses/gpl-3.0/
 *
 * @package Netzstrategen\Onea
 */

namespace Netzstrategen\Onea;

defined('ABSPATH') || exit;

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
	require __DIR__ . '/vendor/autoload.php';
}

register_activation_hook(__FILE__, __NAMESPACE__ . '\Schema::activate');
register_deactivation_hook(__FILE__, __NAMESPACE__ . '\Schema::deactivate');
register_uninstall_hook(__FILE__, __NAMESPACE__ . '\Schema::uninstall');

add_action('init', __NAMESPACE__ . '\init');
