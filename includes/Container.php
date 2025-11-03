<?php

/**
 * Service Container
 *
 * @package Netzstrategen\Onea
 */

namespace Netzstrategen\Onea;

use Netzstrategen\Onea\Exceptions\NotFoundException;
use Psr\Container\ContainerInterface;

/**
 * Container
 *
 * A simple PSR-11 compliant dependency injection container.
 */
class Container implements ContainerInterface {

	/**
	 * Container bindings.
	 *
	 * @var array
	 */
	private array $services = [];

	/**
	 * Store a service in the container.
	 *
	 * @param string $id Service identifier.
	 * @param mixed  $service Service instance.
	 * @return void
	 */
	public function set(string $id, $service): void {
		$this->services[ $id ] = $service;
	}

	/**
	 * Retrieve a service from the container.
	 *
	 * @param string $id Service identifier.
	 * @return mixed
	 * @throws NotFoundException If the service is not found.
	 */
	public function get(string $id) {
		if (! $this->has($id)) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new NotFoundException("Service '{$id}' not found in container.");
		}

		return $this->services[ $id ];
	}

	/**
	 * Check if a service exists in the container.
	 *
	 * @param string $id Service identifier.
	 * @return bool
	 */
	public function has(string $id): bool {
		return isset($this->services[ $id ]);
	}
}
