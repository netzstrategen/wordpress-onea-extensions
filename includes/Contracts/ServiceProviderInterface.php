<?php

/**
 * Service Provider Contract
 *
 * @package Netzstrategen\Onea\Contracts
 */

namespace Netzstrategen\Onea\Contracts;

/**
 * Service Provider Interface
 *
 * Service providers are the central place for configuring services.
 */
interface ServiceProviderInterface {

	/**
	 * Register bindings in the container.
	 *
	 * This is where you bind interfaces to implementations,
	 * register singletons, and set up service dependencies.
	 *
	 * @return void
	 */
	public function register(): void;

	/**
	 * Bootstrap services after all providers have been registered.
	 *
	 * This is called after all providers have registered their services.
	 * Use this to register WordPress hooks, boot services, etc.
	 *
	 * @return void
	 */
	public function boot(): void;
}
