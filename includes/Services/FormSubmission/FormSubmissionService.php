<?php

/**
 * Form Submission Service
 *
 * @package Netzstrategen\Onea\Services\FormSubmission
 */

namespace Netzstrategen\Onea\Services\FormSubmission;

use Netzstrategen\Onea\Contracts\AbstractService;
use Netzstrategen\Onea\Services\WooCommerce\CartService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Form Submission Service
 *
 * Handles form submissions via REST API, file uploads, and cart integration.
 */
class FormSubmissionService extends AbstractService {

	/**
	 * Cart service instance.
	 *
	 * @var CartService|null
	 */
	protected ?CartService $cart_service = null;

	/**
	 * Maximum file size in bytes (5MB).
	 *
	 * @var int
	 */
	protected int $max_file_size = 5242880;

	/**
	 * Allowed file MIME types.
	 *
	 * @var array
	 */
	protected array $allowed_mime_types = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'application/pdf',
	];

	/**
	 * Initialize the service.
	 *
	 * @return void
	 */
	public function init(): void {
		// Register REST API routes.
		add_action('rest_api_init', [ $this, 'register_rest_routes' ]);
	}

	/**
	 * Set cart service dependency.
	 *
	 * @param CartService $cart_service Cart service instance.
	 * @return void
	 */
	public function set_cart_service(CartService $cart_service): void {
		$this->cart_service = $cart_service;
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		register_rest_route(
			'onea/v1',
			'/form-submission',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'handle_form_submission' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);
	}

	/**
	 * Check if user has permission to submit form.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool True if user can submit.
	 */
	public function check_permissions(WP_REST_Request $request): bool {
		// Allow any user (logged in or not) to submit forms.
		// Nonce validation is handled by WordPress REST API automatically.
		return true;
	}

	/**
	 * Handle form submission.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error Response or error.
	 */
	public function handle_form_submission(WP_REST_Request $request) {
		// Validate request.
		$validation = $this->validate_request($request);
		if (is_wp_error($validation)) {
			return new WP_REST_Response(
				[
					'success' => false,
					'message' => $validation->get_error_message(),
				],
				400
			);
		}

		// Get request data.
		$product_id = absint($request->get_param('product_id'));
		$form_id    = sanitize_text_field($request->get_param('form_id'));
		$fields     = $request->get_param('fields');

		// Process and sanitize fields.
		$form_data = $this->process_fields($fields);

		// Add form ID to form data.
		$form_data['form_id'] = $form_id;

		// Handle file uploads.
		$uploaded_files = $this->handle_file_uploads($request->get_file_params());
		if (is_wp_error($uploaded_files)) {
			return new WP_REST_Response(
				[
					'success' => false,
					'message' => $uploaded_files->get_error_message(),
				],
				400
			);
		}

		// Get cart service.
		if (! $this->cart_service) {
			return new WP_REST_Response(
				[
					'success' => false,
					'message' => __('Cart service not available.', 'wp-onea-extensions'),
				],
				500
			);
		}

		// Add product to cart with form data.
		$result = $this->cart_service->add_product_with_form_data($product_id, $form_data, $uploaded_files);

		if (is_wp_error($result)) {
			return new WP_REST_Response(
				[
					'success' => false,
					'message' => $result->get_error_message(),
				],
				400
			);
		}

		// Success!
		return new WP_REST_Response(
			[
				'success' => true,
				'message' => __('Product successfully added to cart.', 'wp-onea-extensions'),
				'data'    => [
					'cart_item_key'  => $result,
					'cart_url'       => wc_get_cart_url(),
					'uploaded_files' => $uploaded_files,
				],
			],
			200
		);
	}

	/**
	 * Validate request data.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return true|WP_Error True if valid, WP_Error otherwise.
	 */
	protected function validate_request(WP_REST_Request $request) {
		// Check product ID.
		$product_id = $request->get_param('product_id');
		if (empty($product_id) || ! is_numeric($product_id) || absint($product_id) === 0) {
			return new WP_Error(
				'missing_product_id',
				__('Product ID is required and must be a valid number. Please configure a product ID in the Elementor widget settings.', 'wp-onea-extensions')
			);
		}

		// Check form ID.
		$form_id = $request->get_param('form_id');
		if (empty($form_id)) {
			return new WP_Error('missing_form_id', __('Form ID is required.', 'wp-onea-extensions'));
		}

		// Check fields data.
		$fields = $request->get_param('fields');
		if (empty($fields) || ! is_array($fields)) {
			return new WP_Error('invalid_fields', __('Fields data is required and must be an array.', 'wp-onea-extensions'));
		}

		return true;
	}

	/**
	 * Sanitize a single value (string or array).
	 *
	 * @param mixed $value Value to sanitize.
	 * @return mixed Sanitized value.
	 */
	protected function sanitize_value($value) {
		if (is_array($value)) {
			return array_map('sanitize_text_field', $value);
		}
		return sanitize_text_field($value);
	}

	/**
	 * Handle file uploads.
	 *
	 * @param array $files $_FILES array.
	 * @return array|WP_Error Array of attachment IDs grouped by field name, or WP_Error.
	 */
	protected function handle_file_uploads(array $files): array|WP_Error {
		if (empty($files)) {
			return [];
		}

		$uploaded_files = [];
		// Handle files array structure from FormData.
		// When FormData sends files[fieldName], PHP creates:
		// $_FILES['files']['name']['fieldName'] = 'file.jpg'.
		if (isset($files['files']['name']) && is_array($files['files']['name'])) {
			foreach ($files['files']['name'] as $field_name => $file_names) {
				// Sanitize field name to match form_data keys.
				$sanitized_field_name = sanitize_key($field_name);

				// Handle both single files and arrays of files.
				if (is_array($file_names)) {
					// Multiple files for this field.
					$uploaded_files[ $sanitized_field_name ] = [];
					foreach ($file_names as $index => $file_name) {
						if (empty($file_name)) {
							continue;
						}

						$file = [
							'name'     => $file_names[ $index ],
							'type'     => $files['files']['type'][ $field_name ][ $index ],
							'tmp_name' => $files['files']['tmp_name'][ $field_name ][ $index ],
							'error'    => $files['files']['error'][ $field_name ][ $index ],
							'size'     => $files['files']['size'][ $field_name ][ $index ],
						];

						$attachment_id = $this->upload_single_file($file);
						if (is_wp_error($attachment_id)) {
							return $attachment_id;
						}

						$uploaded_files[ $sanitized_field_name ][] = $attachment_id;
					}
				} else {
					// Single file for this field.
					if (empty($file_names)) {
						continue;
					}

					$file = [
						'name'     => $files['files']['name'][ $field_name ],
						'type'     => $files['files']['type'][ $field_name ],
						'tmp_name' => $files['files']['tmp_name'][ $field_name ],
						'error'    => $files['files']['error'][ $field_name ],
						'size'     => $files['files']['size'][ $field_name ],
					];

					$attachment_id = $this->upload_single_file($file);
					if (is_wp_error($attachment_id)) {
						return $attachment_id;
					}

					$uploaded_files[ $sanitized_field_name ] = $attachment_id;
				}
			}
		}

		return $uploaded_files;
	}

	/**
	 * Upload a single file.
	 *
	 * @param array $file File array from $_FILES.
	 * @return int|WP_Error Attachment ID on success, WP_Error on failure.
	 */
	protected function upload_single_file(array $file) {
		// Check for upload errors.
		if ($file['error'] !== UPLOAD_ERR_OK) {
			return new WP_Error('upload_error', __('File upload failed.', 'wp-onea-extensions'));
		}

		// Validate file size.
		if ($file['size'] > $this->max_file_size) {
			return new WP_Error(
				'file_too_large',
				sprintf(
					/* translators: %s: maximum file size */
					__('File size exceeds maximum allowed size of %s.', 'wp-onea-extensions'),
					size_format($this->max_file_size)
				)
			);
		}

		// Validate file type.
		$file_type = wp_check_filetype($file['name']);
		if (! in_array($file_type['type'], $this->allowed_mime_types, true)) {
			return new WP_Error(
				'invalid_file_type',
				sprintf(
					/* translators: %s: allowed file types */
					__('Invalid file type. Allowed types: %s', 'wp-onea-extensions'),
					implode(', ', array_unique(array_map(fn($mime) => str_replace([ 'image/', 'application/' ], '', $mime), $this->allowed_mime_types)))
				)
			);
		}

		// Use WordPress file upload handler.
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		// Temporarily allow uploads for this request by granting upload_files capability.
		add_filter('user_has_cap', [ $this, 'grant_upload_capability' ], 10, 3);
		add_filter('upload_mimes', [ $this, 'allow_upload_mimes' ]);

		// Upload file without form verification.
		$upload = wp_handle_upload(
			$file,
			[
				'test_form' => false,
				'test_type' => false,
				'mimes'     => $this->get_allowed_mimes(),
			]
		);

		// Remove the filters.
		remove_filter('user_has_cap', [ $this, 'grant_upload_capability' ], 10);
		remove_filter('upload_mimes', [ $this, 'allow_upload_mimes' ]);

		if (isset($upload['error'])) {
			return new WP_Error('upload_failed', $upload['error']);
		}

		// Create attachment.
		$attachment_id = wp_insert_attachment(
			[
				'post_mime_type' => $upload['type'],
				'post_title'     => sanitize_file_name(basename($upload['file'])),
				'post_content'   => '',
				'post_status'    => 'private', // Private status hides from media library.
			],
			$upload['file']
		);

		if (is_wp_error($attachment_id)) {
			return $attachment_id;
		}

		// Generate attachment metadata.
		$attach_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
		wp_update_attachment_metadata($attachment_id, $attach_data);

		return $attachment_id;
	}

	/**
	 * Get allowed MIME types in proper format for wp_handle_upload.
	 *
	 * @return array Associative array of file extensions to MIME types.
	 */
	protected function get_allowed_mimes(): array {
		return [
			'jpg|jpeg|jpe' => 'image/jpeg',
			'png'          => 'image/png',
			'gif'          => 'image/gif',
			'webp'         => 'image/webp',
			'pdf'          => 'application/pdf',
		];
	}

	/**
	 * Filter to allow upload MIME types for form submissions.
	 *
	 * @param array $mimes Current allowed MIME types.
	 * @return array Modified MIME types.
	 */
	public function allow_upload_mimes(array $mimes): array {
		return array_merge($mimes, $this->get_allowed_mimes());
	}

	/**
	 * Temporarily grant upload_files capability for form submissions.
	 *
	 * @param array $allcaps All capabilities.
	 * @param array $caps    Required capabilities.
	 * @param array $args    Capability check arguments.
	 * @return array Modified capabilities.
	 */
	public function grant_upload_capability(array $allcaps, array $caps, array $args): array {
		// Grant upload_files capability for this request.
		$allcaps['upload_files'] = true;
		return $allcaps;
	}

	/**
	 * Process and sanitize fields data.
	 *
	 * @param array $fields Fields data from request.
	 * @return array Processed form data.
	 */
	private function process_fields($fields) {
		$form_data = [];

		if (! $fields || ! is_array($fields)) {
			return [];
		}

		foreach ($fields as $field_name => $field_data_json) {
			// Decode JSON field data: value, label, and optional type.
			$field_data = json_decode($field_data_json, true);

			if (! $field_data) {
				continue;
			}

			// Sanitize field name.
			$sanitized_name = sanitize_key($field_name);

			// Handle file fields - they only have label, file comes separately in $_FILES.
			if (isset($field_data['type']) && $field_data['type'] === 'file') {
				$form_data[ $sanitized_name ] = [
					'label' => isset($field_data['label']) ? sanitize_text_field($field_data['label']) : '',
				];
				continue;
			}

			// Regular fields have both value and label.
			$form_data[ $sanitized_name ] = [
				'value' => isset($field_data['value']) ? $this->sanitize_value($field_data['value']) : '',
				'label' => isset($field_data['label']) ? sanitize_text_field($field_data['label']) : '',
			];
		}

		return $form_data;
	}
}
