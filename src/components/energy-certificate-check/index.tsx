import { createRoot } from "@wordpress/element";
import { EnergyCertificateCheck } from "./EnergyCertificateCheck";

/**
 * Initialize the Energy Certificate Check component
 */
const init = () => {
  const containers = document.querySelectorAll(
    ".energy-certificate-check-widget"
  );

  containers.forEach((container) => {
    if (container instanceof HTMLElement) {
      const root = createRoot(container);
      root.render(<EnergyCertificateCheck />);
    }
  });
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Re-initialize after Elementor preview updates
if (window.elementorFrontend) {
  window.elementorFrontend.hooks.addAction(
    "frontend/element_ready/energy-certificate-check.default",
    ($scope: any) => {
      const container = $scope.find(".energy-certificate-check-widget")[0];
      if (container) {
        const root = createRoot(container);
        root.render(<EnergyCertificateCheck />);
      }
    }
  );
}

export { EnergyCertificateCheck };
