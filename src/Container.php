<?php
/**
 * PSR-11 compliant service container.
 *
 * @package Netzstrategen\Onea
 */

namespace Netzstrategen\Onea;

use Netzstrategen\Onea\Contracts\ServiceProviderInterface;
use Netzstrategen\Onea\Exceptions\NotFoundException;
use Psr\Container\ContainerInterface;

/**
 * Container to store and reference the plugin components.
 *
 * This container implements PSR-11 ContainerInterface for
 * standardized dependency injection and service location.
 */
class Container implements ContainerInterface {

	/**
	 * Stored service instances.
	 *
	 * @var array<string, mixed>
	 */
	private array $services = [];

	/**
	 * Registered service providers.
	 *
	 * @var array<ServiceProviderInterface>
	 */
	private array $providers = [];

	/**
	 * Whether providers have been booted.
	 *
	 * @var bool
	 */
	private bool $booted = false;

	/**
	 * Sets up the object state.
	 */
	public function __construct() {
		// Container is ready.
	}

	/**
	 * Register a service provider.
	 *
	 * @param string|ServiceProviderInterface $provider The service provider class or instance.
	 * @return ServiceProviderInterface
	 */
	public function register(string|ServiceProviderInterface $provider): ServiceProviderInterface {
		if (is_string($provider)) {
			$provider = new $provider($this);
		}

		$this->providers[] = $provider;
		$provider->register();

		// If already booted, boot this provider immediately.
		if ($this->booted) {
			$provider->boot();
		}

		return $provider;
	}

	/**
	 * Boot all registered providers.
	 *
	 * @return void
	 */
	public function boot_providers(): void {
		if ($this->booted) {
			return;
		}

		foreach ($this->providers as $provider) {
			$provider->boot();
		}

		$this->booted = true;
	}

	/**
	 * Set a service in the container.
	 *
	 * @param string $id       The service identifier.
	 * @param mixed  $service The service instance.
	 * @return void
	 */
	public function set(string $id, mixed $service): void {
		$this->services[$id] = $service;
	}

	/**
	 * Finds an entry of the container by its identifier and returns it.
	 *
	 * @param string $id Identifier of the entry to look for.
	 * @return mixed Entry.
	 * @throws NotFoundException No entry was found for this identifier.
	 */
	public function get(string $id) {
		if (!isset($this->services[$id])) {
			throw new NotFoundException(
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Exception message, not HTML output.
				sprintf('Service "%s" not found in container.', $id)
			);
		}

		return $this->services[$id];
	}

	/**
	 * Returns true if the container can return an entry for the given identifier.
	 * Returns false otherwise.
	 *
	 * @param string $id Identifier of the entry to look for.
	 * @return bool
	 */
	public function has(string $id): bool {
		return isset($this->services[$id]);
	}
}
