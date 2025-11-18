<?php
/**
 * Energy Certificate Check Widget
 *
 * @package WP_Onea_Extensions
 */

namespace Netzstrategen\Onea\Services\Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

/**
 * Energy Certificate Check Widget Class
 */
class EnergyCertificateCheckWidget extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'energy-certificate-check';
	}

	/**
	 * Get widget title.
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Energy Certificate Check', 'wp-onea-extensions' );
	}

	/**
	 * Get widget icon.
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-document-file';
	}

	/**
	 * Get widget categories.
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'onea' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'energy', 'certificate', 'check', 'energieausweis', 'onea' ];
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [ 'onea-energy-certificate-check' ];
	}

	/**
	 * Get style dependencies.
	 *
	 * @return array Widget styles dependencies.
	 */
	public function get_style_depends() {
		return [ 'onea-energy-certificate-check' ];
	}

	/**
	 * Render widget output on the frontend.
	 */
	protected function render() {
		?>
		<div class="energy-certificate-check-widget-wrapper">
			<div class="energy-certificate-check-widget"></div>
		</div>
		<?php
	}

	/**
	 * Render widget output in the editor.
	 */
	protected function content_template() {
		?>
		<div class="energy-certificate-check-widget">
			<div style="padding: 40px; text-align: center; background: #f0f9ff; border: 2px dashed #0b5563; border-radius: 8px;">
				<p style="margin: 0; color: #0b5563; font-size: 16px;">
					<strong>Energy Certificate Check Widget</strong><br>
					Preview available on the frontend
				</p>
			</div>
		</div>
		<?php
	}
}
