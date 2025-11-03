<?php

/**
 * Form Submission Service Provider
 *
 * @package Netzstrategen\Onea\Providers
 */

namespace Netzstrategen\Onea\Providers;

use Netzstrategen\Onea\Contracts\AbstractServiceProvider;
use Netzstrategen\Onea\Services\FormSubmission\FormSubmissionService;

/**
 * Form Submission Service Provider
 *
 * Registers and bootstraps form submission services.
 */
class FormSubmissionServiceProvider extends AbstractServiceProvider {

	/**
	 * List of form submission services to register.
	 *
	 * @var array<string, string>
	 */
	protected array $services = [
		'form_submission' => FormSubmissionService::class,
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
			$service = $this->container->get($service_key);

			// Inject cart service dependency if available.
			if ($service instanceof FormSubmissionService && $this->container->has('woocommerce.cart')) {
				$service->set_cart_service($this->container->get('woocommerce.cart'));
			}

			// Boot the service.
			$this->boot_service($service_key);
		}
	}
}
