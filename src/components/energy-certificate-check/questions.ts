import { Question } from "./types";

/**
 * Decision tree for energy certificate type recommendation
 * Based on German energy certificate regulations (GEG)
 */
export const questions: Question[] = [
  {
    id: "isNewBuilding",
    text: "Handelt es sich bei der Immobilie um einen Neubau?",
    tooltip:
      "Ein Neubau ist ein Gebäude, das nach 2002 gebaut oder genehmigt wurde.",
    options: [
      {
        value: "ja",
        label: "Ja",
        next: "result",
        resultHint: "bedarfsausweis",
      },
      {
        value: "nein",
        label: "Nein",
        next: "buildingType",
      },
    ],
  },
  {
    id: "buildingType",
    text: "Wie viele Wohneinheiten hat das Gebäude?",
    tooltip: "Zählen Sie alle selbstständigen Wohnungen im Gebäude.",
    options: [
      {
        value: "ein-zwei",
        label: "1-2 Wohneinheiten",
        next: "buildingYear",
      },
      {
        value: "drei-vier",
        label: "3-4 Wohneinheiten",
        next: "buildingYear",
      },
      {
        value: "fuenf-plus",
        label: "5 oder mehr Wohneinheiten",
        next: "result",
        resultHint: "both",
      },
    ],
  },
  {
    id: "buildingYear",
    text: "Wann wurde das Gebäude gebaut?",
    tooltip:
      "Maßgeblich ist das Jahr der Baufertigstellung bzw. der Bauantrag.",
    options: [
      {
        value: "before-1977",
        label: "Vor 1977",
        next: "result",
        resultHint: "bedarfsausweis",
      },
      {
        value: "1977-nach",
        label: "1977 oder später",
        next: "hasExtensiveRenovation",
      },
    ],
  },
  {
    id: "hasExtensiveRenovation",
    text: "Wurde das Gebäude nach 1977 umfassend energetisch saniert?",
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
        resultHint: "bedarfsausweis",
      },
    ],
  },
];
