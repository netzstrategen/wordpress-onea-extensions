<?php
/**
 * Main plugin entry point.
 *
 * @package Netzstrategen\Onea
 */

namespace Netzstrategen\Onea;

use Netzstrategen\Onea\Container;

/**
 * Main plugin entry point.
 */
class Plugin {

	/**
	 * Container instance.
	 *
	 * @var Container|null
	 */
	private static ?Container $container = null;

	/**
	 * List of service providers to register.
	 *
	 * @var array<string>
	 */
	private array $providers = [
		\Netzstrategen\Onea\Providers\ElementorServiceProvider::class,
	];

	/**
	 * Functions/hooks to be initialized/registered during init.
	 *
	 * @return void
	 */
	public static function init(): void {
		self::$container = new Container();

		$plugin = new self();
		$plugin->register_providers();
		$plugin->boot_providers();
	}

	/**
	 * Register all service providers.
	 *
	 * @return void
	 */
	private function register_providers(): void {
		foreach ($this->providers as $provider) {
			self::$container->register($provider);
		}
	}

	/**
	 * Boot all service providers.
	 *
	 * @return void
	 */
	private function boot_providers(): void {
		self::$container->boot_providers();
	}

	/**
	 * Get the container instance.
	 *
	 * @return Container
	 */
	public static function container(): Container {
		if (self::$container === null) {
			self::$container = new Container();
		}

		return self::$container;
	}
}
