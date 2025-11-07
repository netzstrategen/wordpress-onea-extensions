<?php

/**
 * Elementor Service Provider
 *
 * @package Netzstrategen\Onea\Providers
 */

namespace Netzstrategen\Onea\Providers;

use Netzstrategen\Onea\Contracts\AbstractServiceProvider;
use Netzstrategen\Onea\Services\Elementor\ElementorWidgetsService;

/**
 * Elementor Service Provider
 *
 * Registers and bootstraps all Elementor-related services.
 */
class ElementorServiceProvider extends AbstractServiceProvider {

	/**
	 * List of Elementor services to register.
	 *
	 * @var array<string, string>
	 */
	protected array $services = [
		'elementor.widgets' => ElementorWidgetsService::class,
		// Add more Elementor services here.
		// 'elementor.dynamic_tags' => ElementorDynamicTagsService::class,.
		// 'elementor.controls' => ElementorControlsService::class,.
	];

	/**
	 * Register services in the container.
	 *
	 * @return void
	 */
	public function register(): void {
		foreach ($this->services as $key => $service_class) {
			$this->container->set($key, new $service_class());
		}
	}

	/**
	 * Bootstrap services.
	 *
	 * @return void
	 */
	public function boot(): void {
		foreach (array_keys($this->services) as $service_key) {
			$this->boot_service($service_key);
		}
	}
}
