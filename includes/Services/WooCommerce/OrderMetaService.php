<?php
/**
 * Order Meta Service
 *
 * @package Netzstrategen\Onea\Services\WooCommerce
 */

namespace Netzstrategen\Onea\Services\WooCommerce;

use Netzstrategen\Onea\Contracts\AbstractService;
use WC_Order;
use WC_Order_Item_Product;

/**
 * Order Meta Service
 *
 * Transfers cart item meta to order item meta and handles display.
 */
class OrderMetaService extends AbstractService {

	/**
	 * Initialize the service.
	 *
	 * @return void
	 */
	public function init(): void {
		// Transfer cart meta to order meta.
		add_action('woocommerce_checkout_create_order_line_item', [ $this, 'save_order_item_meta' ], 10, 4);

		// Format meta for display.
		add_filter('woocommerce_order_item_get_formatted_meta_data', [ $this, 'format_order_item_meta' ], 10, 2);
	}   /**
		 * Save cart item meta to order item meta.
		 *
		 * @param WC_Order_Item_Product $item          Order item object.
		 * @param string                $cart_item_key Cart item key.
		 * @param array                 $values        Cart item values.
		 * @param WC_Order              $order         Order object.
		 * @return void
		 */
	public function save_order_item_meta(WC_Order_Item_Product $item, string $cart_item_key, array $values, WC_Order $order): void {
		// Check if this cart item has form data.
		if (empty($values['_onea_form_data'])) {
			return;
		}

		// Save internal meta (hidden from display, formatted on load).
		$item->add_meta_data('_onea_form_data', $values['_onea_form_data'], true);

		if (! empty($values['_onea_uploaded_files'])) {
			$item->add_meta_data('_onea_uploaded_files', $values['_onea_uploaded_files'], true);
		}
	}

	/**
	 * Format order item meta for display in admin.
	 *
	 * Transforms internal form data and uploaded files into displayable meta entries.
	 * Only applies to admin area and product order items.
	 *
	 * @param array          $formatted_meta Existing formatted meta data from WooCommerce.
	 * @param \WC_Order_Item $order_item     Order item object.
	 * @return array Formatted meta data with ONEA fields.
	 */
	public function format_order_item_meta(array $formatted_meta, $order_item): array {
		// Only show in admin area, not in emails or thank you page.
		if (! is_admin()) {
			return $formatted_meta;
		}



		// Only process product items.
		if (! $order_item instanceof WC_Order_Item_Product) {
			return $formatted_meta;
		}

		// Get the hidden meta data.
		$form_data = $order_item->get_meta('_onea_form_data', true);
		$uploaded_files = $order_item->get_meta('_onea_uploaded_files', true);

		if (empty($form_data)) {
			return $formatted_meta;
		}

		// Skip during email sending (admin emails trigger is_admin() = true).
		if (doing_action('woocommerce_email_order_details')) {
			return [];
		}

		// Build ONEA meta entries in a fresh array.
		$onea_meta = [];

		// Add form fields to display.
		foreach ($form_data as $field_key => $field_data) {
			// Skip file fields (they only have label, no value).
			if (! isset($field_data['value'])) {
				continue;
			}

			$field_label = $field_data['label'] ?? $field_key;
			$field_value = $this->format_value_for_display($field_data['value']);

			$onea_meta[] = (object) [
				'key'           => $field_key,
				'value'         => $field_value,
				'display_key'   => $field_label,
				'display_value' => $field_value,
			];
		}

		// Add uploaded files to display.
		if (! empty($uploaded_files)) {
			foreach ($uploaded_files as $file_field_key => $file_attachment_ids) {
				$file_field_label = $form_data[ $file_field_key ]['label'] ?? $file_field_key;

				// Normalize to array for consistent handling.
				$attachment_ids = is_array($file_attachment_ids) ? $file_attachment_ids : [ $file_attachment_ids ];

				$file_links = [];
				foreach ($attachment_ids as $attachment_id) {
					$attachment_url = wp_get_attachment_url($attachment_id);
					$attachment_filename = basename(get_attached_file($attachment_id));

					if ($attachment_url && $attachment_filename) {
						$file_links[] = sprintf(
							'<a href="%s" target="_blank">%s</a>',
							esc_url($attachment_url),
							esc_html($attachment_filename)
						);
					}
				}

				if (! empty($file_links)) {
					$file_links_html = implode(', ', $file_links);

					$onea_meta[] = (object) [
						'key'           => $file_field_key,
						'value'         => $file_links_html,
						'display_key'   => $file_field_label,
						'display_value' => $file_links_html,
					];
				}
			}
		}

		return $onea_meta;
	}

	/**
	 * Format value for display.
	 *
	 * @param mixed $value Value to format.
	 * @return string Formatted value.
	 */
	protected function format_value_for_display($value): string {
		if (is_array($value)) {
			return implode(', ', array_map('esc_html', $value));
		}

		return esc_html((string) $value);
	}
}
