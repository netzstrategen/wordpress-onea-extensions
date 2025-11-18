import React from "react";
import { CertificateRecommendation, CertificateOption } from "./types";
import { Button } from "../ui/button";
import { CloseButton } from "./CloseButton";

interface ResultsProps {
  recommendation: CertificateRecommendation;
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  recommendation,
  onReset,
}) => {
  //TODO: abstract this to come from elementor
  const verbrauchsausweis: CertificateOption = {
    type: "verbrauchsausweis",
    title: "Verbrauchsausweis",
    price: "59",
    priceNote: "inkl. MwSt",
    features: [
      "Erfassung in 5 Minuten",
      "Verfügbar innerhalb von 48h",
      "Die günstigere Variante",
      "Rechtsgültig nach GEG",
      "10 Jahre Gültigkeit",
    ],
    ctaText: "Jetzt beantragen",
    ctaUrl: "https://onlineenergieausweis.com/verbrauchsausweis",
    isRecommended: recommendation.recommended === "verbrauchsausweis",
  };

  const bedarfsausweis: CertificateOption = {
    type: "bedarfsausweis",
    title: "Bedarfsausweis",
    price: "99",
    priceNote: "inkl. MwSt",
    features: [
      "Erfassung in 7-10 Minuten",
      "Verfügbar innerhalb von 48h",
      "Auch für kaum sanierte Objekte",
      "Rechtsgültig nach GEG",
      "10 Jahre Gültigkeit",
    ],
    ctaText: "Jetzt beantragen",
    ctaUrl: "https://onlineenergieausweis.com/bedarfsausweis",
    isRecommended: recommendation.recommended === "bedarfsausweis",
  };

  const options = recommendation.canChoose
    ? [verbrauchsausweis, bedarfsausweis]
    : recommendation.recommended === "bedarfsausweis"
    ? [bedarfsausweis]
    : [verbrauchsausweis];

  return (
    <div className="energy-certificate-results">
      <div className="results-container">
        <CloseButton />

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

        <div
          className={`certificate-options ${
            options.length === 2 ? "two-column" : "single-column"
          }`}
        >
          {options.map((option) => (
            <CertificateCard key={option.type} option={option} />
          ))}
        </div>

        <div className="results-actions">
          <Button onClick={onReset} className="reset-button">
            Erneut prüfen
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CertificateCardProps {
  option: CertificateOption;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ option }) => {
  return (
    <div
      className={`certificate-card ${
        option.isRecommended ? "recommended" : ""
      }`}
    >
      <div className="card-header">
        <h3 className="card-title">{option.title}</h3>
        <div className="card-price">
          <span className="price-amount">{option.price}€</span>
          <span className="price-note">{option.priceNote}</span>
        </div>
      </div>

      <ul className="card-features">
        {option.features.map((feature, index) => (
          <li key={index} className="feature-item">
            <svg
              className="checkmark"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.6667 5L7.50004 14.1667L3.33337 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={option.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button"
      >
        {option.ctaText}
      </a>
    </div>
  );
};
