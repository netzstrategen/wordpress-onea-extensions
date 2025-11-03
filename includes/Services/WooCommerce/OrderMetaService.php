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
		add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'save_order_item_meta' ], 10, 4 );

		// Format meta for customer order view.
		add_filter( 'woocommerce_order_item_get_formatted_meta_data', [ $this, 'format_order_item_meta' ], 10, 2 );

		// Hide internal meta keys from order display.
		add_filter( 'woocommerce_hidden_order_itemmeta', [ $this, 'hide_internal_meta' ], 10, 1 );
	}

	/**
	 * Save cart item meta to order item meta.
	 *
	 * @param WC_Order_Item_Product $item          Order item object.
	 * @param string                $cart_item_key Cart item key.
	 * @param array                 $values        Cart item values.
	 * @param WC_Order              $order         Order object.
	 * @return void
	 */
	public function save_order_item_meta( WC_Order_Item_Product $item, string $cart_item_key, array $values, WC_Order $order ): void {
		// Check if this cart item has form data.
		if ( empty( $values['_onea_form_data'] ) ) {
			return;
		}

		// Save form data.
		$item->add_meta_data( '_onea_form_data', $values['_onea_form_data'], true );

		// Save uploaded file IDs.
		if ( ! empty( $values['_onea_uploaded_files'] ) ) {
			$item->add_meta_data( '_onea_uploaded_files', $values['_onea_uploaded_files'], true );
		}

		// Save form ID.
		if ( ! empty( $values['_onea_form_id'] ) ) {
			$item->add_meta_data( '_onea_form_id', $values['_onea_form_id'], true );
		}
	}

	/**
	 * Format order item meta for customer view.
	 *
	 * @param array                 $formatted_meta Formatted meta data.
	 * @param WC_Order_Item_Product $item           Order item object.
	 * @return array Modified formatted meta.
	 */
	public function format_order_item_meta( array $formatted_meta, $item ): array {
		// Only process product items, not shipping or other item types.
		if ( ! $item instanceof WC_Order_Item_Product ) {
			return $formatted_meta;
		}

		$form_data = $item->get_meta( '_onea_form_data' );

		if ( empty( $form_data ) ) {
			return $formatted_meta;
		}

		// Add form data to display.
		foreach ( $form_data as $key => $field ) {
			// Skip form_id.
			if ( $key === 'form_id' ) {
				continue;
			}

			// Skip file fields (they only have label, no value).
			if ( ! isset( $field['value'] ) ) {
				continue;
			}

			// Get label and value.
			$label = isset( $field['label'] ) ? $field['label'] : $key;
			$display_value = $this->format_value_for_display( $field['value'] );

			// Add to formatted meta.
			$formatted_meta[] = (object) [
				'key'           => $key,
				'value'         => $field['value'],
				'display_key'   => $label,
				'display_value' => $display_value,
			];
		}

		// Add uploaded files to display.
		$uploaded_files = $item->get_meta( '_onea_uploaded_files' );
		if ( ! empty( $uploaded_files ) ) {
			foreach ( $uploaded_files as $field_name => $file_data ) {
				// Get field label from form_data.
				$field_label = isset( $form_data[ $field_name ]['label'] ) ? $form_data[ $field_name ]['label'] : $field_name;

				// Handle single file or array of files.
				$file_ids = is_array( $file_data ) ? $file_data : [ $file_data ];

				$file_links = [];
				foreach ( $file_ids as $attachment_id ) {
					$file_url = wp_get_attachment_url( $attachment_id );
					$file_name = basename( get_attached_file( $attachment_id ) );

					if ( $file_url && $file_name ) {
						$file_links[] = sprintf( '<a href="%s" target="_blank">%s</a>', esc_url( $file_url ), esc_html( $file_name ) );
					}
				}

				if ( ! empty( $file_links ) ) {
					$formatted_meta[] = (object) [
						'key'           => $field_name,
						'value'         => implode( ', ', $file_links ),
						'display_key'   => $field_label,
						'display_value' => implode( ', ', $file_links ),
					];
				}
			}
		}

		return $formatted_meta;
	}

	/**
	 * Format value for display.
	 *
	 * @param mixed $value Value to format.
	 * @return string Formatted value.
	 */
	protected function format_value_for_display( $value ): string {
		if ( is_array( $value ) ) {
			return implode( ', ', array_map( 'esc_html', $value ) );
		}

		if ( is_bool( $value ) ) {
			return $value ? __( 'Yes', 'wp-onea-extensions' ) : __( 'No', 'wp-onea-extensions' );
		}

		return esc_html( (string) $value );
	}

	/**
	 * Hide internal meta keys from order display.
	 *
	 * @param array $hidden_meta Array of meta keys to hide.
	 * @return array Modified array of hidden meta keys.
	 */
	public function hide_internal_meta( array $hidden_meta ): array {
		$hidden_meta[] = '_onea_form_id';
		$hidden_meta[] = '_onea_form_data';
		$hidden_meta[] = '_onea_uploaded_files';

		return $hidden_meta;
	}
}
