import { UserAnswers, CertificateRecommendation } from "./types";

/**
 * Determines the recommended certificate type based on user answers
 *
 * Logic:
 * - 1-4 units AND before 1978 -> Bedarfsausweis (mandatory)
 * - All other combinations -> Free choice (Bedarfsausweis recommended)
 */
export function determineCertificateType(
  answers: UserAnswers
): CertificateRecommendation {
  const { numberOfUnits, buildingYear } = answers;

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

  // All other combinations = free choice with Bedarfsausweis recommendation
  return {
    recommended: "bedarfsausweis",
    canChoose: true,
    reasons: [
      "Wir empfehlen den Bedarfsausweis aufgrund der höheren energetischen Aussagekraft.",
    ],
  };
}
