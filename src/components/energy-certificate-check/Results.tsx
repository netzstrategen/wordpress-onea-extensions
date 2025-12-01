import React, { useEffect } from "react";
import { CertificateRecommendation } from "./types";

interface ResultsProps {
  recommendation: CertificateRecommendation;
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  recommendation,
  onReset,
}) => {
  useEffect(() => {
    // Find the comparison cards container
    const comparisonCards = document.querySelector(".comparison-cards");
    if (!comparisonCards) return;

    // Get both card elements
    const verbrauchsausweisCard = comparisonCards.querySelector(
      ".verbrauchsausweis-card"
    );
    const bedarfsausweisCard = comparisonCards.querySelector(
      ".bedarfsausweis-card"
    );

    if (!verbrauchsausweisCard || !bedarfsausweisCard) return;

    // Show the parent container with flex display and margin
    (comparisonCards as HTMLElement).style.display = "flex";
    (comparisonCards as HTMLElement).style.paddingLeft = "2rem";
    (comparisonCards as HTMLElement).style.paddingRight = "2rem";

    // Determine which cards to show based on recommendation
    if (recommendation.canChoose) {
      // Show both cards with flex display for proper layout
      (verbrauchsausweisCard as HTMLElement).style.display = "flex";
      (bedarfsausweisCard as HTMLElement).style.display = "flex";
    } else {
      // Show only Bedarfsausweis card and center it
      (verbrauchsausweisCard as HTMLElement).style.display = "none";
      (bedarfsausweisCard as HTMLElement).style.display = "flex";
      (comparisonCards as HTMLElement).style.justifyContent = "center";
    }

    // Create and insert button after the comparison cards
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "results-actions-inserted";
    buttonWrapper.style.marginTop = "2rem";
    buttonWrapper.style.marginBottom = "2rem";
    buttonWrapper.style.textAlign = "center";

    const button = document.createElement("button");
    button.textContent = "Erneut prüfen";
    button.className = "reset-button";
    button.onclick = onReset;

    buttonWrapper.appendChild(button);
    comparisonCards.parentNode?.insertBefore(
      buttonWrapper,
      comparisonCards.nextSibling
    );

    // Scroll to the cards
    comparisonCards.scrollIntoView({ behavior: "smooth", block: "start" });

    // Cleanup function to hide cards and remove button when component unmounts
    return () => {
      (comparisonCards as HTMLElement).style.display = "none";
      (verbrauchsausweisCard as HTMLElement).style.display = "none";
      (bedarfsausweisCard as HTMLElement).style.display = "none";
      buttonWrapper.remove();
    };
  }, [recommendation, onReset]);

  return (
    <div className="energy-certificate-results">
      <div className="results-container">
        {recommendation.canChoose ? (
          <h2 className="results-title">
            Sie können zwischen beiden Ausweisarten wählen!
          </h2>
        ) : (
          <h2 className="results-title">
            Für Ihr Gebäude wird ein{" "}
            {recommendation.recommended === "bedarfsausweis"
              ? "Bedarfsausweis"
              : "Verbrauchsausweis"}{" "}
            benötigt
          </h2>
        )}

        <div className="results-reasons">
          {recommendation.reasons.map((reason, index) => (
            <p key={index} className="reason-text">
              {reason}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
