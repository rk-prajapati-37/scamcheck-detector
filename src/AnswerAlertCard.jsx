import React from "react";
import "./AnswerAlertCard.css";

const AnswerAlertCard = ({
  scamType,
  category,
  headline,
  summary,
  publishDate,
  date,
  link
}) => (
  <div className="aac-outer">
    <div className="aac-header">
      <span className="aac-icon">❗</span>
      <span className="aac-icon">⚠️</span>
      <span className="aac-title">Scam Alert - We Found Information</span>
    </div>
    <hr className="aac-divider"/>
    <div className="aac-card-main">
      <div className="aac-card-row">
        <span className="aac-badge">{category || scamType || "SCAM"}</span>
        <span className="aac-date">{publishDate || date}</span>
      </div>
      <div className="aac-headline">{headline}</div>
      <div className="aac-desc">{summary}</div>
      {link && (
        <a 
          className="aac-link" 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Read Full Investigation <span className="aac-link-ext">↗</span>
        </a>
      )}
    </div>
  </div>
);

export default AnswerAlertCard;
