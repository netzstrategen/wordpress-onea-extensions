import { UserAnswers, CertificateRecommendation } from "./types";

/**
 * Determines the recommended certificate type based on user answers
 */
export function determineCertificateType(
  answers: UserAnswers
): CertificateRecommendation {
  const {
    isNewBuilding,
    buildingType,
    buildingYear,
    hasExtensiveRenovation,
    hasConsumptionData,
  } = answers;

  // New buildings must use Bedarfsausweis
  if (isNewBuilding === "ja") {
    return {
      recommended: "bedarfsausweis",
      canChoose: false,
      reasons: [
        "Für Neubauten ist gesetzlich ein Bedarfsausweis vorgeschrieben.",
        "Der Bedarfsausweis basiert auf der Gebäudesubstanz und geplanten Technik.",
      ],
    };
  }

  // Buildings with 5+ units can choose
  if (buildingType === "fuenf-plus") {
    return {
      recommended: "bedarfsausweis",
      canChoose: true,
      reasons: [
        "Bei Gebäuden mit 5 oder mehr Wohneinheiten können Sie zwischen beiden Ausweisarten wählen.",
        "Wir empfehlen den Bedarfsausweis aufgrund der größeren Aussagekraft.",
      ],
    };
  }

  // Buildings built before 1977 with up to 4 units must use Bedarfsausweis
  if (buildingYear === "before-1977") {
    return {
      recommended: "bedarfsausweis",
      canChoose: false,
      reasons: [
        "Für Gebäude mit bis zu 4 Wohneinheiten, die vor 1977 gebaut wurden, ist ein Bedarfsausweis Pflicht.",
        "Dies gilt gemäß der Energieeinsparverordnung (EnEV) und dem Gebäudeenergiegesetz (GEG).",
      ],
    };
  }

  // Buildings from 1977+ with extensive renovation can choose
  if (buildingYear === "1977-nach" && hasExtensiveRenovation === "ja") {
    return {
      recommended: "bedarfsausweis",
      canChoose: true,
      reasons: [
        "Durch die umfassende Sanierung können Sie zwischen beiden Ausweisarten wählen.",
        "Der Bedarfsausweis zeigt die Qualität der Sanierung besser auf.",
      ],
    };
  }

  // Buildings from 1977+ without extensive renovation
  if (buildingYear === "1977-nach" && hasExtensiveRenovation === "nein") {
    // Has consumption data - can choose
    if (hasConsumptionData === "ja") {
      return {
        recommended: "verbrauchsausweis",
        canChoose: true,
        reasons: [
          "Mit vollständigen Verbrauchsdaten können Sie zwischen beiden Ausweisarten wählen.",
          "Der Verbrauchsausweis ist günstiger und schneller verfügbar.",
        ],
      };
    }

    // No consumption data - must use Bedarfsausweis
    return {
      recommended: "bedarfsausweis",
      canChoose: false,
      reasons: [
        "Ohne vollständige Verbrauchsdaten ist ein Bedarfsausweis erforderlich.",
        "Der Bedarfsausweis benötigt keine historischen Verbrauchswerte.",
      ],
    };
  }

  // Default fallback
  return {
    recommended: "bedarfsausweis",
    canChoose: true,
    reasons: ["Basierend auf Ihren Angaben empfehlen wir den Bedarfsausweis."],
  };
}
