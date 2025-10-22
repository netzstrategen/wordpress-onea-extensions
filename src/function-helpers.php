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
