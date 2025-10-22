<?php
/**
 * Example Elementor Widget
 *
 * @package Netzstrategen\Onea\Services\Elementor\Widgets
 */

namespace Netzstrategen\Onea\Services\Elementor\Widgets;

use Elementor\Widget_Base;

/**
 * Example Widget
 *
 * Simple example Elementor widget.
 */
class ExampleWidget extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'example_widget';
	}

	/**
	 * Get widget title.
	 *
	 * @return string
	 */
	public function get_title(): string {
		return __('Example Widget', 'wp-onea-extensions');
	}

	/**
	 * Get widget icon.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return 'eicon-code';
	}

	/**
	 * Get widget categories.
	 *
	 * @return array
	 */
	public function get_categories(): array {
		return ['onea'];
	}

	/**
	 * Render widget output on the frontend.
	 *
	 * @return void
	 */
	protected function render(): void {
		echo '<div class="example-widget">';
		echo '<h2>Hello World</h2>';
		echo '</div>';
	}
}
