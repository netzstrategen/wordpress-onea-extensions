import { Question } from "./types";

/**
 * Decision tree for energy certificate type recommendation
 * Based on German energy certificate regulations (GEG)
 *
 * Logic:
 * - 1-4 units AND before 1978 -> Bedarfsausweis (mandatory)
 * - All other combinations -> Free choice (Bedarfsausweis recommended)
 */
export const questions: Question[] = [
  {
    id: "numberOfUnits",
    text: "Wie viele Wohneinheiten hat Ihr Gebäude?",
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
    options: [
      {
        value: "before-1978",
        label: "Vor 1978",
        next: "result",
      },
      {
        value: "1978+",
        label: "Ab 1978",
        next: "result",
      },
    ],
  },
];
