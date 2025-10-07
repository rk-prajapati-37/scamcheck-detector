import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./AnswerAlertCard.css";

function getParagraphPreview(md, parCount = 3) {
  if (!md) return "";
  const arr = md.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (arr.length <= parCount) return md;
  return arr.slice(0, parCount).join("\n\n") + "\n\n...";
}

const AnswerAlertCard = ({
  scamType,
  category,
  headline,
  summary,
  publishDate,
  date,
  link,
}) => {
  const [expanded, setExpanded] = useState(false);
  const previewText = getParagraphPreview(summary, 1);

  return (
    <div className="alert-outer">
      <div className="alert-head">
        <span className="alert-icon">❗</span>
        <span className="alert-icon">⚠️</span>
        <span className="alert-title">Scam Alert - We Found Information</span>
      </div>
      <hr className="alert-divider" />
      <div className="alert-body">
        <div className="alert-card">
          <div className="alert-row">
            <span className="alert-chip">{category || scamType || "SCAM"}</span>
            <span className="alert-date">{publishDate || date}</span>
          </div>
          <div className="alert-headline">{headline}</div>
          <div className="alert-summary markdown-body">
            <ReactMarkdown
              components={{
                a: (props) => (
                  <a {...props} target="_blank" rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
              }}
            >
              {expanded ? summary : previewText}
            </ReactMarkdown>
            {summary && summary !== previewText && (
              <button
                className="alert-expand-btn"
                type="button"
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "Collapse ▲" : "Expand ▼"}
              </button>
            )}
          </div>
          {link && (
            <a
              className="alert-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Full Investigation <span className="alert-external-icon">🔗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
export default AnswerAlertCard;
