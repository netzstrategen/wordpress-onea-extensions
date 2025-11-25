<?php
/**
 * PDF Invoice Service
 *
 * @package Netzstrategen\Onea\Services\WooCommerce
 */

namespace Netzstrategen\Onea\Services\WooCommerce;

use Netzstrategen\Onea\Contracts\AbstractService;

/**
 * PDF Invoice Service
 *
 * Handles integration with WooCommerce German Market PDF Invoice plugin.
 * Filters out ONEA form data from appearing in PDF invoices.
 */
class PdfInvoiceService extends AbstractService {

	/**
	 * Initialize the service.
	 *
	 * @return void
	 */
	public function init(): void {
		// Only initialize if the PDF invoice plugin is active.
		if (! $this->is_pdf_plugin_active()) {
			return;
		}

		// Filter meta for PDF display - runs after OrderMetaService.
		add_filter('woocommerce_order_item_get_formatted_meta_data', [ $this, 'filter_meta_for_pdf' ], 20, 2);
	}

	/**
	 * Check if PDF invoice plugin is active.
	 *
	 * @return bool
	 */
	protected function is_pdf_plugin_active(): bool {
		// Check if WooCommerce German Market PDF addon is active.
		return class_exists('Woocommerce_Invoice_Pdf');
	}

	/**
	 * Filter out ONEA meta data when generating PDFs.
	 *
	 * @param array          $formatted_meta Formatted meta data.
	 * @param \WC_Order_Item $item           Order item object.
	 * @return array Modified formatted meta data.
	 */
	public function filter_meta_for_pdf(array $formatted_meta, $item): array {
		// Check if we're generating a PDF.
		if (! did_action('wp_wc_invoice_pdf_start_template')) {
			return $formatted_meta;
		}

		// Filter out order item meta.
		return [];
	}
}
