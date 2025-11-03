<?php
/**
 * WooCommerce Service Provider
 *
 * @package Netzstrategen\Onea\Providers
 */

namespace Netzstrategen\Onea\Providers;

use Netzstrategen\Onea\Contracts\AbstractServiceProvider;
use Netzstrategen\Onea\Services\WooCommerce\CartService;
use Netzstrategen\Onea\Services\WooCommerce\OrderMetaService;

/**
 * WooCommerce Service Provider
 *
 * Registers and bootstraps all WooCommerce-related services.
 */
class WooCommerceServiceProvider extends AbstractServiceProvider {

	/**
	 * List of WooCommerce services to register.
	 *
	 * @var array<string, string>
	 */
	protected array $services = [
		'woocommerce.cart'       => CartService::class,
		'woocommerce.order_meta' => OrderMetaService::class,
	];

	/**
	 * Register services in the container.
	 *
	 * @return void
	 */
	public function register(): void {
		// Only register services if WooCommerce is active.
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		foreach ( $this->services as $key => $service_class ) {
			$this->container->set( $key, new $service_class() );
		}
	}

	/**
	 * Bootstrap services.
	 *
	 * @return void
	 */
	public function boot(): void {
		// Only boot services if WooCommerce is active.
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		foreach ( array_keys( $this->services ) as $service_key ) {
			$this->boot_service( $service_key );
		}
	}
}
