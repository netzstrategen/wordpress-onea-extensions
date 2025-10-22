<?php
/**
 * Main Plugin Class
 *
 * @package Netzstrategen\Onea
 */

namespace Netzstrategen\Onea;

use Netzstrategen\Onea\Contracts\ServiceProviderInterface;
use Netzstrategen\Onea\Exceptions\ContainerException;

/**
 * Plugin
 *
 * Main plugin orchestrator that bootstraps the application.
 * Acts like Laravel's Application class.
 */
final class Plugin {

	/**
	 * Service container instance.
	 *
	 * @var Container
	 */
	private static Container $container;

	/**
	 * Registered service providers.
	 *
	 * @var ServiceProviderInterface[]
	 */
	private array $providers = [];

	/**
	 * Service provider class names to register.
	 *
	 * @var array
	 */
	private array $provider_classes = [
		Providers\ElementorServiceProvider::class,
	];

	/**
	 * Booted status.
	 *
	 * @var bool
	 */
	private bool $booted = false;

	/**
	 * Initialize the plugin.
	 *
	 * @return void
	 */
	public static function init(): void {
		$instance = new self();
		$instance->bootstrap();
	}

	/**
	 * Bootstrap the plugin.
	 *
	 * @return void
	 */
	private function bootstrap(): void {
		// Create container.
		self::$container = new Container();

		// Register all service providers.
		$this->register_providers();

		// Boot all service providers.
		$this->boot_providers();
	}

	/**
	 * Register all service providers.
	 *
	 * @return void
	 */
	private function register_providers(): void {
		foreach ( $this->provider_classes as $provider_class ) {
			$this->register_provider( $provider_class );
		}
	}

	/**
	 * Register a service provider.
	 *
	 * @param string|ServiceProviderInterface $provider Provider class name or instance.
	 * @return ServiceProviderInterface The registered provider.
	 * @throws ContainerException If provider cannot be instantiated.
	 */
	private function register_provider( $provider ): ServiceProviderInterface {
		// If it's a class name, instantiate it.
		if ( is_string( $provider ) ) {
			if ( ! class_exists( $provider ) ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				throw new ContainerException( "Service provider class {$provider} does not exist." );
			}
			$provider = new $provider( self::$container );
		}

		// Check if it implements the interface.
		if ( ! $provider instanceof ServiceProviderInterface ) {
			throw new ContainerException(
				sprintf(
					'Service provider must implement %s',
					ServiceProviderInterface::class
				)
			);
		}

		// Register the provider.
		$provider->register();

		// Store the provider instance.
		$this->providers[] = $provider;

		return $provider;
	}

	/**
	 * Boot all registered service providers.
	 *
	 * @return void
	 */
	private function boot_providers(): void {
		if ( $this->booted ) {
			return;
		}

		foreach ( $this->providers as $provider ) {
			$provider->boot();
		}

		$this->booted = true;
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
