<?php

/**
 * The function helpers file provides all necessary PHP functions for the plugin.
 *
 * @author netzstrategen
 * @package Netzstrategen\Onea
 */

namespace Netzstrategen\Onea;

/**
 * Bootstraps the plugin
 *
 * @return void
 */
function init(): void {
	plugin()->init();
}

/**
 * Stores a single instance of the plugin in the static $plugin variable.
 *
 * @return Plugin Returns plugin instance
 */
function plugin(): Plugin {
	static $plugin;
	if (!$plugin instanceof Plugin) {
		$plugin = new Plugin();
	}
	return $plugin;
}

/**
 * Custom logging function for ONEA plugin.
 * Logs to a separate file: wp-content/plugins/wordpress-onea-extensions/debug-onea.log
 *
 * @param string $message The message to log.
 * @param string $level   Log level (INFO, ERROR, WARNING, DEBUG).
 * @return void
 */
function onea_log(string $message, string $level = 'INFO'): void {
	// Only log if WP_DEBUG_LOG is enabled.
	if (! defined('WP_DEBUG_LOG') || ! WP_DEBUG_LOG) {
		return;
	}

	$log_file = dirname(__DIR__) . '/debug-onea.log';
	$timestamp = current_time('Y-m-d H:i:s');
	$formatted_message = sprintf(
		"[%s] [%s] %s\n",
		$timestamp,
		$level,
		$message
	);

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	file_put_contents($log_file, $formatted_message, FILE_APPEND);
}
