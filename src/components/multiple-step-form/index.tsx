import domReady from "@wordpress/dom-ready";
import { render } from "@wordpress/element";
import MultipleStepForm from "./MultipleStepForm";
import "./style.scss";

/**
 * Declare global elementorFrontend and jQuery
 */
declare global {
  interface Window {
    elementorFrontend?: {
      hooks: {
        addAction: (hook: string, callback: ($element: any) => void) => void;
      };
    };
    jQuery?: any;
  }
}

/**
 * Initialize Multiple Step Form components
 */
const initializeComponents = (): void => {
  const containers = document.querySelectorAll<HTMLElement>(
    ".onea-multiple-step-form-root"
  );

  containers.forEach((container) => {
    // Skip if already initialized
    if (container.dataset.initialized) {
      return;
    }

    const propsData = container.dataset.props || "{}";
    const props = JSON.parse(propsData);

    render(<MultipleStepForm {...props} />, container);

    // Mark as initialized
    container.dataset.initialized = "true";
  });
};

/**
 * Initialize on DOM ready
 */
domReady(() => {
  // Check if we're in Elementor preview/editor
  if (window.elementorFrontend && window.jQuery) {
    // Use jQuery to listen for Elementor's init event
    window.jQuery(window).on("elementor/frontend/init", () => {
      if (window.elementorFrontend?.hooks) {
        // Register widget-specific initialization hook
        window.elementorFrontend.hooks.addAction(
          "frontend/element_ready/multiple_step_form.default",
          initializeComponents
        );
      }
    });
  } else {
    // Regular frontend - initialize immediately
    initializeComponents();
  }
});
