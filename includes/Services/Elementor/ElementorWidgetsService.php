<?php

/**
 * Elementor Widgets Service
 *
 * @package Netzstrategen\Onea\Services\Elementor
 */

namespace Netzstrategen\Onea\Services\Elementor;

use Netzstrategen\Onea\Contracts\AbstractService;
use Netzstrategen\Onea\Services\Elementor\Widgets\MultipleStepFormWidget;
use Netzstrategen\Onea\Services\Elementor\Widgets\EnergyCertificateCheckWidget;

/**
 * Elementor Widgets Service
 *
 * Handles Elementor widget registration.
 */
class ElementorWidgetsService extends AbstractService {

	/**
	 * List of widget classes to register.
	 *
	 * @var array
	 */
	private array $widgets = [
		MultipleStepFormWidget::class,
		EnergyCertificateCheckWidget::class,
	];

	/**
	 * Initialize the service.
	 *
	 * Registers all Elementor hooks.
	 *
	 * @return void
	 */
	public function init(): void {
		// Only initialize if Elementor is active.
		if (! $this->is_elementor_active()) {
			return;
		}

		// Register custom category.
		add_action('elementor/elements/categories_registered', [ $this, 'register_widget_categories' ]);

		// Register widgets.
		add_action('elementor/widgets/register', [ $this, 'register_widgets' ]);

		// Register scripts for frontend.
		add_action('wp_enqueue_scripts', [ $this, 'register_scripts' ]);

		// Enqueue scripts for Elementor editor.
		add_action('elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_scripts' ]);
	}

	/**
	 * Register or enqueue scripts and styles.
	 *
	 * @param bool $enqueue Whether to enqueue (true) or register (false) the scripts.
	 * @return void
	 */
	private function handle_scripts(bool $enqueue = false): void {
		$plugin_dir = plugin_dir_path(__FILE__) . '../../../';
		$plugin_url = plugin_dir_url(__FILE__) . '../../../';

		// Multiple Step Form
		$msf_assets_file = $plugin_dir . 'build/components/multiple-step-form/index.asset.php';
		if (file_exists($msf_assets_file)) {
			$msf_assets = include $msf_assets_file;

			$script_function = $enqueue ? 'wp_enqueue_script' : 'wp_register_script';
			$style_function  = $enqueue ? 'wp_enqueue_style' : 'wp_register_style';

			$script_function(
				'onea-multiple-step-form',
				$plugin_url . 'build/components/multiple-step-form/index.js',
				$msf_assets['dependencies'],
				$msf_assets['version'],
				true
			);

			$msf_style_file = $plugin_dir . 'build/components/multiple-step-form/style-index.css';
			if (file_exists($msf_style_file)) {
				$style_function(
					'onea-multiple-step-form',
					$plugin_url . 'build/components/multiple-step-form/style-index.css',
					[],
					$msf_assets['version']
				);
			}
		}

		// Energy Certificate Check
		$ecc_assets_file = $plugin_dir . 'build/components/energy-certificate-check/index.asset.php';
		if (file_exists($ecc_assets_file)) {
			$ecc_assets = include $ecc_assets_file;

			$script_function = $enqueue ? 'wp_enqueue_script' : 'wp_register_script';
			$style_function  = $enqueue ? 'wp_enqueue_style' : 'wp_register_style';

			$script_function(
				'onea-energy-certificate-check',
				$plugin_url . 'build/components/energy-certificate-check/index.js',
				$ecc_assets['dependencies'],
				$ecc_assets['version'],
				true
			);

			$ecc_style_file = $plugin_dir . 'build/components/energy-certificate-check/style-index.css';
			if (file_exists($ecc_style_file)) {
				$style_function(
					'onea-energy-certificate-check',
					$plugin_url . 'build/components/energy-certificate-check/style-index.css',
					[],
					$ecc_assets['version']
				);
			}
		}
	}

	/**
	 * Register frontend scripts and styles.
	 *
	 * @return void
	 */
	public function register_scripts(): void {
		$this->handle_scripts(false);
	}

	/**
	 * Enqueue scripts for Elementor editor.
	 *
	 * @return void
	 */
	public function enqueue_scripts(): void {
		$this->handle_scripts(true);
	}

	/**
	 * Register custom widget categories.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Elementor elements manager.
	 * @return void
	 */
	public function register_widget_categories($elements_manager): void {
		$elements_manager->add_category(
			'onea',
			[
				'title' => __('Energieausweis', 'wp-onea-extensions'),
				'icon'  => 'fa fa-plug',
			]
		);
	}

	/**
	 * Register widgets.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
	 * @return void
	 */
	public function register_widgets($widgets_manager): void {
		foreach ($this->widgets as $widget_class) {
			if (class_exists($widget_class)) {
				$widgets_manager->register(new $widget_class());
			}
		}
	}

	/**
	 * Check if Elementor is active.
	 *
	 * @return bool True if Elementor is active.
	 */
	protected function is_elementor_active(): bool {
		return did_action('elementor/loaded');
	}
}
