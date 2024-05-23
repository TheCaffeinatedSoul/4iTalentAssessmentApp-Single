import React from "react";
import "./QuestionsComponent.css";

export const QuestionComponent = ({
  questionNumber,
  quertId,
  query,
  isActive,
  isAnswered,
  isFlagged,
  onClick,
}) => {
  return (
    <div
      className={`question-component ${isActive ? "clicked" : ""} 
      ${isAnswered ? "answered" : ""} ${isFlagged ? "flagged" : ""}
      `}
    >
      <div
        className={`question-component-content ${isActive ? "clicked" : ""} ${
          isAnswered ? "answered" : ""
        } ${isFlagged ? "flagged" : ""}`}
        onClick={onClick}
      >
        <h6>{questionNumber}</h6>
      </div>
    </div>
  );
};
