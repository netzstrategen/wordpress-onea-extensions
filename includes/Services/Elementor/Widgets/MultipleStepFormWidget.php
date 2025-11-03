<?php

/**
 * Multiple Step Form Elementor Widget
 *
 * @package Netzstrategen\Onea\Services\Elementor\Widgets
 */

namespace Netzstrategen\Onea\Services\Elementor\Widgets;

use Elementor\Widget_Base;

/**
 * Multiple Step Form Widget
 *
 * Multi-step form widget for Elementor.
 */
class MultipleStepFormWidget extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'multiple_step_form';
	}

	/**
	 * Get widget title.
	 *
	 * @return string
	 */
	public function get_title(): string {
		return __('Multiple Step Form', 'wp-onea-extensions');
	}

	/**
	 * Get widget icon.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return 'eicon-form-horizontal';
	}

	/**
	 * Get widget categories.
	 *
	 * @return array
	 */
	public function get_categories(): array {
		return [ 'onea' ];
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array
	 */
	public function get_script_depends(): array {
		return [ 'onea-multiple-step-form' ];
	}

	/**
	 * Get style dependencies.
	 *
	 * @return array
	 */
	public function get_style_depends(): array {
		return [ 'onea-multiple-step-form' ];
	}

	/**
	 * Register widget controls.
	 *
	 * @return void
	 */
	protected function register_controls(): void {
		$this->start_controls_section(
			'content_section',
			[
				'label' => __('Form Configuration', 'wp-onea-extensions'),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'product_id',
			[
				'label'       => __('Product ID', 'wp-onea-extensions'),
				'type'        => \Elementor\Controls_Manager::TEXT,
				'default'     => '',
				'placeholder' => __('Enter product ID', 'wp-onea-extensions'),
				'description' => __('Enter the WooCommerce product ID to associate with this form', 'wp-onea-extensions'),
			]
		);

		$this->add_control(
			'form_config',
			[
				'label'       => __('Form Configuration (JSON)', 'wp-onea-extensions'),
				'type'        => \Elementor\Controls_Manager::TEXTAREA,
				'rows'        => 10,
				'default'     => wp_json_encode(
					[
						'title'       => 'My Form',
						'description' => 'This is a sample form',
						'steps'       => [
							[
								'title'       => 'Step 1',
								'description' => 'First step description',
								'fields'      => [
									[
										'name'        => 'first_name',
										'label'       => 'First Name',
										'type'        => 'text',
										'placeholder' => 'Enter your first name',
										'required'    => true,
									],
									[
										'name'        => 'last_name',
										'label'       => 'Last Name',
										'type'        => 'text',
										'placeholder' => 'Enter your last name',
										'required'    => true,
									],
								],
							],
							[
								'title'       => 'Step 2',
								'description' => 'Contact information',
								'fields'      => [
									[
										'name'        => 'email',
										'label'       => 'Email Address',
										'type'        => 'email',
										'placeholder' => 'your@email.com',
										'required'    => true,
									],
									[
										'name'        => 'phone',
										'label'       => 'Phone Number',
										'type'        => 'tel',
										'placeholder' => '+49 123 456789',
										'required'    => false,
									],
								],
							],
						],
					],
					JSON_PRETTY_PRINT
				),
				'placeholder' => __('Enter JSON configuration for the form', 'wp-onea-extensions'),
				'description' => __('Paste your form configuration in JSON format', 'wp-onea-extensions'),
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render widget output on the frontend.
	 *
	 * @return void
	 */
	protected function render(): void {
		// Get widget settings.
		$settings = $this->get_settings_for_display();

		// Parse JSON configuration.
		$form_config = ! empty($settings['form_config']) ? json_decode($settings['form_config'], true) : [];

		// Generate nonce for REST API authentication.
		$nonce = wp_create_nonce('wp_rest');

		// Prepare props for React component.
		$props = [
			'componentId' => $this->get_id(),
			'formConfig'  => $form_config,
			'productId'   => ! empty($settings['product_id']) ? $settings['product_id'] : '',
			'nonce'       => $nonce,
		];

		// Render container for React app.
		?>
		<div
			class="onea-multiple-step-form-root"
			data-props="<?php echo esc_attr(wp_json_encode($props)); ?>"
		>
			<!-- React component will mount here -->
		</div>
		<?php
		wp_enqueue_script('onea-multiple-step-form');
		wp_enqueue_style('onea-multiple-step-form');
	}
}
