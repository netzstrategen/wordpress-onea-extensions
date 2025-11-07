<?php

/**
 * Base Service Provider
 *
 * @package Netzstrategen\Onea\Contracts
 */

namespace Netzstrategen\Onea\Contracts;

use Netzstrategen\Onea\Container;
use Netzstrategen\Onea\Contracts\ServiceProviderInterface;

/**
 * Abstract Service Provider
 *
 * Base class for all service providers.
 */
abstract class AbstractServiceProvider implements ServiceProviderInterface {

	/**
	 * The service container instance.
	 *
	 * @var Container
	 */
	protected Container $container;

	/**
	 * Create a new service provider instance.
	 *
	 * @param Container $container The service container.
	 */
	public function __construct(Container $container) {
		$this->container = $container;
	}

	/**
	 * Register services in the container.
	 *
	 * @return void
	 */
	abstract public function register(): void;

	/**
	 * Bootstrap services.
	 *
	 * @return void
	 */
	public function boot(): void {
		// Default implementation - can be overridden.
	}

	/**
	 * Boot a service by calling its init method.
	 *
	 * @param string $service_id Service identifier in the container.
	 * @return void
	 * @throws \RuntimeException If service doesn't implement ServiceInterface.
	 */
	protected function boot_service(string $service_id): void {
		$service = $this->container->get($service_id);

		if (! $service instanceof ServiceInterface) {
			throw new \RuntimeException(
				sprintf(
					'Service "%s" must implement %s',
					$service_id, // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
					ServiceInterface::class
				)
			);
		}

		$service->init();
	}
}
