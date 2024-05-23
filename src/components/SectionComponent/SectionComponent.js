import React from "react";
import "./SectionComponent.css";

export const SectionComponent = ({
  sectionName,
  sectionId,
  topicName,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={`section-component ${isActive ? "clicked" : ""}`}
      onClick={onClick}
    >
      <h6>{sectionName}</h6>
      <h6 className="topic-name">{topicName}</h6>
    </div>
  );
};
