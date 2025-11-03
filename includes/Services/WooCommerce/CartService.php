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
		// Display form data in cart.
		// add_filter( 'woocommerce_get_item_data', [ $this, 'display_cart_item_meta' ], 10, 2 );

		add_action( 'wp_head', [ $this, 'add_cart_styles' ] );
	}

	/**
	 * Add product to cart with form data.
	 *
	 * @param int   $product_id Product ID to add.
	 * @param array $form_data  Form submission data.
	 * @param array $file_ids   Uploaded file attachment IDs.
	 * @return string|\WP_Error Cart item key on success, WP_Error on failure.
	 */
	public function add_product_with_form_data( int $product_id, array $form_data, array $file_ids = [] ) {
		// Validate product exists and is purchasable.
		$product = wc_get_product( $product_id );

		if ( ! $product || ! $product instanceof WC_Product ) {
			return new \WP_Error(
				'invalid_product',
				sprintf(
					/* translators: %d: product ID */
					__( 'Invalid product ID: %d. Please ensure the product exists in WooCommerce.', 'wp-onea-extensions' ),
					$product_id
				)
			);
		}

		if ( ! $product->is_purchasable() ) {
			return new \WP_Error( 'product_not_purchasable', __( 'This product cannot be purchased.', 'wp-onea-extensions' ) );
		}

		// Prepare cart item data.
		$cart_item_data = [
			'_onea_form_data'      => $form_data,
			'_onea_uploaded_files' => $file_ids,
			'_onea_form_id'        => $form_data['form_id'] ?? '',
			// Generate unique key to ensure same product with different form data creates separate cart items.
			'_onea_unique_key'     => md5( wp_json_encode( $form_data ) . wp_json_encode( $file_ids ) ),
		];

		// Add to cart.
		$cart_item_key = WC()->cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );

		if ( ! $cart_item_key ) {
			return new \WP_Error( 'cart_error', __( 'Failed to add product to cart.', 'wp-onea-extensions' ) );
		}

		return $cart_item_key;
	}

	/**
	 * Display form data in cart and checkout.
	 *
	 * @param array $item_data Item data array.
	 * @param array $cart_item Cart item array.
	 * @return array Modified item data.
	 */
	public function display_cart_item_meta( array $item_data, array $cart_item ): array {
		// Check if this cart item has form data.
		if ( empty( $cart_item['_onea_form_data'] ) ) {
			return $item_data;
		}

		$form_data = $cart_item['_onea_form_data'];

		// Build collapsible HTML.
		ob_start();
		?>
		<details class="onea-form-details">
			<summary><span class="onea-toggle-icon">▶</span> <?php esc_html_e( 'Übermittelte Daten', 'wp-onea-extensions' ); ?></summary>
			<div class="onea-form-data-content">
				<table>
					<?php foreach ( $form_data as $key => $field ) : ?>
						<?php
						// Skip form_id.
						if ( $key === 'form_id' ) {
							continue;
						}

						// Skip file fields (they only have label, actual files are in uploaded_files).
						if ( ! isset( $field['value'] ) ) {
							continue;
						}

						// Get label and value.
						$label = isset( $field['label'] ) ? $field['label'] : $key;
						$value = $this->format_value_for_display( $field['value'] );
						?>
						<tr><td class="onea-field-label"><?php echo esc_html( $label ); ?>:</td><td class="onea-field-value"><?php echo esc_html( $value ); ?></td></tr>
					<?php endforeach; ?>

					<?php
					// Display uploaded files.
					if ( ! empty( $cart_item['_onea_uploaded_files'] ) ) :
						foreach ( $cart_item['_onea_uploaded_files'] as $field_name => $file_data ) :
							// Get field label from form_data.
							$field_label = isset( $form_data[ $field_name ]['label'] ) ? $form_data[ $field_name ]['label'] : $field_name;

							// Handle single file or array of files.
							$file_ids = is_array( $file_data ) ? $file_data : [ $file_data ];

							foreach ( $file_ids as $attachment_id ) :
								$file_info = $this->get_file_info( $attachment_id );
								if ( ! $file_info ) {
									continue;
								}
								?>
								<tr><td class="onea-field-label"><?php echo esc_html( $field_label ); ?>:</td><td class="onea-field-value onea-file-info"><?php printf( '%s (%s)', esc_html( $file_info['filename'] ), esc_html( $file_info['size'] ) ); ?></td></tr>
							<?php endforeach; ?>
						<?php endforeach; ?>
					<?php endif; ?>
				</table>
			</div>
		</details>
		<?php
		$html = ob_get_clean();

		// Add as a single cart item data entry with proper structure.
		$item_data[] = [
			'name'    => '',
			'value'   => $html,
			'display' => $html,
		];

		return $item_data;
	}

	/**
	 * Format value for display.
	 *
	 * @param mixed $value Field value.
	 * @return string Formatted value.
	 */
	protected function format_value_for_display( $value ): string {
		// Handle arrays.
		if ( is_array( $value ) ) {
			return implode( ', ', $value );
		}

		// Handle JSON strings.
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return implode( ', ', $decoded );
			}
		}

		return (string) $value;
	}

	/**
	 * Get file information from attachment ID.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return array|null File info with filename and size, or null if invalid.
	 */
	protected function get_file_info( int $attachment_id ): ?array {
		$file_path = get_attached_file( $attachment_id );
		if ( ! $file_path || ! file_exists( $file_path ) ) {
			return null;
		}

		$filename = basename( $file_path );
		$filesize = filesize( $file_path );

		// Format file size.
		$size_formatted = size_format( $filesize, 2 );

		return [
			'filename' => $filename,
			'size'     => $size_formatted,
			'path'     => $file_path,
		];
	}

	/**
	 * Add custom CSS styles for cart display.
	 *
	 * @return void
	 */
	public function add_cart_styles(): void {
		if ( ! is_cart() && ! is_checkout() ) {
			return;
		}
		?>
		<style>
			.onea-form-details {
				margin: 5px 0;
				padding: 8px;
				background: #f8f9fa;
				border: 1px solid #dee2e6;
				border-radius: 4px;
			}
			
			.onea-form-details summary {
				cursor: pointer;
				font-weight: 600;
				padding: 2px;
				user-select: none;
				list-style: none;
				font-size: 14px;
			}
			
			.onea-form-details summary::-webkit-details-marker {
				display: none;
			}
			
			.onea-toggle-icon {
				display: inline-block;
				width: 14px;
				margin-right: 4px;
				transition: transform 0.2s;
			}
			
			.onea-form-details[open] .onea-toggle-icon {
				transform: rotate(90deg);
			}
			
			.onea-form-details summary:hover {
				background: #e9ecef;
			}
			
			.onea-form-data-content {
				margin-top: 8px;
				padding-top: 8px;
				border-top: 1px solid #dee2e6;
			}
			
			.onea-form-data-content table {
				width: 100%;
				border-collapse: collapse;
				font-size: 13px;
			}
			
			.onea-form-data-content td {
				padding: 3px 6px;
				border-bottom: 1px solid #f0f0f0;
			}
			
			.onea-field-label {
				font-weight: 500;
				color: #555;
				width: 35%;
			}
			
			.onea-field-value {
				color: #333;
			}
			
			.onea-form-data-content tr:last-child td {
				border-bottom: none;
			}
			
			.onea-file-info {
				font-family: monospace;
				font-size: 12px;
			}
		</style>
		<?php
	}
}

