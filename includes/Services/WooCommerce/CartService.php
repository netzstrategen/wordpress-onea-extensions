<?php

/**
 * Cart Service
 *
 * @package Netzstrategen\Onea\Services\WooCommerce
 */

namespace Netzstrategen\Onea\Services\WooCommerce;

use Netzstrategen\Onea\Contracts\AbstractService;
use WC_Product;

/**
 * Cart Service
 *
 * Handles adding products to cart with form data as meta.
 */
class CartService extends AbstractService {

	/**
	 * Initialize the service.
	 *
	 * @return void
	 */
	public function init(): void {
	}

	/**
	 * Add product to cart with form data.
	 *
	 * @param int   $product_id Product ID to add.
	 * @param array $form_data  Form submission data.
	 * @param array $file_ids   Uploaded file attachment IDs.
	 * @return string|\WP_Error Cart item key on success, WP_Error on failure.
	 */
	public function add_product_with_form_data(int $product_id, array $form_data, array $file_ids = []) {
		// Validate product exists and is purchasable.
		$product = wc_get_product($product_id);

		if (! $product || ! $product instanceof WC_Product) {
			return new \WP_Error(
				'invalid_product',
				sprintf(
					/* translators: %d: product ID */
					__('Invalid product ID: %d. Please ensure the product exists in WooCommerce.', 'wp-onea-extensions'),
					$product_id
				)
			);
		}

		if (! $product->is_purchasable()) {
			return new \WP_Error('product_not_purchasable', __('This product cannot be purchased.', 'wp-onea-extensions'));
		}

		// Prepare cart item data.
		$cart_item_data = [
			'_onea_form_data'      => $form_data,
			'_onea_uploaded_files' => $file_ids,
			'_onea_unique_key'     => md5(wp_json_encode($form_data) . wp_json_encode($file_ids)) . time(),
		];

		// Add to cart.
		$cart_item_key = WC()->cart->add_to_cart($product_id, 1, 0, [], $cart_item_data);
		if (! $cart_item_key) {
			return new \WP_Error('cart_error', __('Failed to add product to cart.', 'wp-onea-extensions'));
		}

		return $cart_item_key;
	}
}
