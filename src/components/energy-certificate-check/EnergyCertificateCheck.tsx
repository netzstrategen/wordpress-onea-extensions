import React, { useState } from "react";
import { Questionnaire } from "./Questionnaire";
import { Results } from "./Results";
import { questions } from "./questions";
import { determineCertificateType } from "./decision-logic";
import { UserAnswers, CertificateRecommendation } from "./types";
import "./style.scss";

export const EnergyCertificateCheck: React.FC = () => {
  const [currentQuestionId, setCurrentQuestionId] =
    useState<string>("isNewBuilding");
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendation, setRecommendation] =
    useState<CertificateRecommendation | null>(null);

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestionId]: value };
    setAnswers(newAnswers);

    const selectedOption = currentQuestion?.options.find(
      (opt) => opt.value === value
    );

    if (selectedOption?.next === "result") {
      // Show results
      const result = determineCertificateType(newAnswers);
      setRecommendation(result);
      setShowResults(true);
    } else if (selectedOption?.next) {
      // Move to next question
      setQuestionHistory([...questionHistory, currentQuestionId]);
      setCurrentQuestionId(selectedOption.next);
    }
  };

  const handleBack = () => {
    if (questionHistory.length > 0) {
      const previousQuestionId = questionHistory[questionHistory.length - 1];
      setCurrentQuestionId(previousQuestionId);
      setQuestionHistory(questionHistory.slice(0, -1));

      // Remove the answer for the current question
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestionId];
      setAnswers(newAnswers);
    }
  };

  const handleReset = () => {
    setCurrentQuestionId("isNewBuilding");
    setAnswers({});
    setQuestionHistory([]);
    setShowResults(false);
    setRecommendation(null);
  };

  if (showResults && recommendation) {
    return <Results recommendation={recommendation} onReset={handleReset} />;
  }

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <div className="energy-certificate-check">
      <Questionnaire
        question={currentQuestion}
        onAnswer={handleAnswer}
        onBack={handleBack}
        canGoBack={questionHistory.length > 0}
      />
    </div>
  );
};
