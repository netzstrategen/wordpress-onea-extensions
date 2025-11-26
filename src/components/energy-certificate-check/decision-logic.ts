import { UserAnswers, CertificateRecommendation } from "./types";

/**
 * Determines the recommended certificate type based on user answers
 */
export function determineCertificateType(
  answers: UserAnswers
): CertificateRecommendation {
  const {
    numberOfUnits,
    buildingYear,
    hasExtensiveRenovation,
    hasConsumptionData,
  } = answers;

  // 1-4 units AND before 1978 = Bedarfsausweis mandatory
  if (numberOfUnits === "1-4" && buildingYear === "before-1978") {
    return {
      recommended: "bedarfsausweis",
      canChoose: false,
      reasons: [
        "Für Gebäude mit 1 bis 4 Wohneinheiten, die vor 1978 gebaut wurden, ist ein Bedarfsausweis Pflicht.",
        "Dies gilt gemäß der Energieeinsparverordnung (EnEV) und dem Gebäudeenergiegesetz (GEG).",
      ],
    };
  }

  // All other combinations with 1-4 units and 1978+ OR 5+ units = free choice
  // Buildings from 1978+ with extensive renovation can choose
  if (buildingYear === "1978+" && hasExtensiveRenovation === "ja") {
    return {
      recommended: "bedarfsausweis",
      canChoose: true,
      reasons: [
        "Für Ihr Gebäude können Sie zwischen beiden Ausweisarten wählen.",
        "Wir empfehlen den Bedarfsausweis aufgrund der höheren energetischen Aussagekraft.",
      ],
    };
  }

  // Buildings from 1978+ without extensive renovation
  if (buildingYear === "1978+" && hasExtensiveRenovation === "nein") {
    // Has consumption data - can choose
    if (hasConsumptionData === "ja") {
      return {
        recommended: "bedarfsausweis",
        canChoose: true,
        reasons: [
          "Für Ihr Gebäude können Sie zwischen beiden Ausweisarten wählen.",
          "Wir empfehlen den Bedarfsausweis aufgrund der höheren energetischen Aussagekraft.",
        ],
      };
    }

    // No consumption data - can still choose (recommendation applies)
    return {
      recommended: "bedarfsausweis",
      canChoose: true,
      reasons: [
        "Für Ihr Gebäude können Sie zwischen beiden Ausweisarten wählen.",
        "Wir empfehlen den Bedarfsausweis aufgrund der höheren energetischen Aussagekraft.",
      ],
    };
  }

  // 5+ units with before 1978 - free choice
  if (numberOfUnits === "5+" && buildingYear === "before-1978") {
    return {
      recommended: "bedarfsausweis",
      canChoose: true,
      reasons: [
        "Für Ihr Gebäude können Sie zwischen beiden Ausweisarten wählen.",
        "Wir empfehlen den Bedarfsausweis aufgrund der höheren energetischen Aussagekraft.",
      ],
    };
  }

  // Default fallback - free choice with Bedarfsausweis recommendation
  return {
    recommended: "bedarfsausweis",
    canChoose: true,
    reasons: [
      "Für Ihr Gebäude können Sie zwischen beiden Ausweisarten wählen.",
      "Wir empfehlen den Bedarfsausweis aufgrund der höheren energetischen Aussagekraft.",
    ],
  };
}
