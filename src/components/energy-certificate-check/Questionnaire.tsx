import React from "react";
import { Question } from "./types";
import { Button } from "../ui/button";
import { CloseButton } from "./CloseButton";

interface QuestionnaireProps {
  question: Question;
  onAnswer: (value: string) => void;
  onBack?: () => void;
  canGoBack: boolean;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  question,
  onAnswer,
  onBack,
  canGoBack,
}) => {
  return (
    <div className="energy-certificate-questionnaire">
      <div className="questionnaire-container">
        <CloseButton />

        <h2 className="questionnaire-title">{question.text}</h2>

        {question.tooltip && (
          <p className="questionnaire-tooltip">{question.tooltip}</p>
        )}

        <div className="questionnaire-options">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              className="questionnaire-option-button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {canGoBack && (
          <div className="questionnaire-navigation">
            <Button onClick={onBack} className="back-button">
              ← Zurück
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
