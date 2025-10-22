<?php
/**
 * Elementor Widgets Service
 *
 * @package Netzstrategen\Onea\Services\Elementor
 */

namespace Netzstrategen\Onea\Services\Elementor;

use Netzstrategen\Onea\Contracts\AbstractService;
use Netzstrategen\Onea\Services\Elementor\Widgets\ExampleWidget;

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
		ExampleWidget::class,
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
		if ( ! $this->is_elementor_active() ) {
			return;
		}

		// Register custom category.
		add_action( 'elementor/elements/categories_registered', [ $this, 'register_widget_categories' ] );

		// Register widgets.
		add_action( 'elementor/widgets/register', [ $this, 'register_widgets' ] );
	}

	/**
	 * Register custom widget categories.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Elementor elements manager.
	 * @return void
	 */
	public function register_widget_categories( $elements_manager ): void {
		$elements_manager->add_category(
			'onea',
			[
				'title' => __( 'Energieausweis', 'wp-onea-extensions' ),
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
	public function register_widgets( $widgets_manager ): void {
		foreach ( $this->widgets as $widget_class ) {
			if ( class_exists( $widget_class ) ) {
				$widgets_manager->register( new $widget_class() );
			}
		}
	}

	/**
	 * Check if Elementor is active.
	 *
	 * @return bool True if Elementor is active.
	 */
	protected function is_elementor_active(): bool {
		return did_action( 'elementor/loaded' );
	}
}
