import { Question } from "./types";

/**
 * Decision tree for energy certificate type recommendation
 * Based on German energy certificate regulations (GEG)
 */
export const questions: Question[] = [
  {
    id: "numberOfUnits",
    text: "Wie viele Wohneinheiten hat Ihr Gebäude?",
    tooltip: "Zählen Sie alle selbstständigen Wohnungen im Gebäude.",
    options: [
      {
        value: "1-4",
        label: "1 bis 4",
        next: "buildingYear",
      },
      {
        value: "5+",
        label: "ab 5",
        next: "buildingYear",
      },
    ],
  },
  {
    id: "buildingYear",
    text: "Welches Baujahr hat Ihr Gebäude?",
    tooltip:
      "Maßgeblich ist das Jahr der Baufertigstellung bzw. der Bauantrag.",
    options: [
      {
        value: "before-1978",
        label: "Vor 1978",
        next: "result",
      },
      {
        value: "1978+",
        label: "Ab 1978",
        next: "hasExtensiveRenovation",
      },
    ],
  },
  {
    id: "hasExtensiveRenovation",
    text: "Wurde das Gebäude nach 1978 umfassend energetisch saniert?",
    tooltip:
      "Eine umfassende Sanierung liegt vor, wenn mindestens die Anforderungen der EnEV 2014 erfüllt wurden.",
    options: [
      {
        value: "ja",
        label: "Ja",
        next: "result",
        resultHint: "both",
      },
      {
        value: "nein",
        label: "Nein",
        next: "hasConsumptionData",
      },
    ],
  },
  {
    id: "hasConsumptionData",
    text: "Liegen vollständige Verbrauchsdaten der letzten 3 Jahre vor?",
    tooltip:
      "Sie benötigen Heizkostenabrechnungen oder Verbrauchsbelege für die letzten drei aufeinanderfolgenden Jahre.",
    options: [
      {
        value: "ja",
        label: "Ja",
        next: "result",
        resultHint: "both",
      },
      {
        value: "nein",
        label: "Nein",
        next: "result",
        resultHint: "both",
      },
    ],
  },
];
