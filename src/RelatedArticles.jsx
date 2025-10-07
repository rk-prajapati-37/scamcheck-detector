import React from "react";
import "./RelatedArticles.css";

const truncate = (text, maxLength = 65) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const RelatedArticles = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="related-section">
      <h3 className="related-title">Related articles</h3>
      <div className="related-grid">
        {articles.map((a, i) => {
          const isValidUrl = a.url && a.url !== "#";
          return (
            <a
              key={i}
              className={`related-card${!isValidUrl ? " disabled-link" : ""}`}
              href={isValidUrl ? a.url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{ pointerEvents: isValidUrl ? "auto" : "none" }}
            >
              <div className="related-thumb">
                {a.thumbUrl ? (
                  <img
                    src={a.thumbUrl}
                    alt={a.heading || ""}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="no-image-placeholder">No Image</div>
                )}
              </div>
              <div className="related-info">
                <h4 className="related-heading">{a.heading || "Untitled"}</h4>
                <p className="related-desc">{truncate(a.description)}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedArticles;
