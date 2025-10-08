import React from "react";
import "./RelatedArticles.css";

const truncate = (text, maxLength = 90) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const parseTags = (tags) => {
  if (!tags) return [];
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const getArticleDate = (a) => {
  const raw = a.publishDate || a.createdDate || "";
  if (!raw) return "";
  return new Date(raw.replace(" ", "T")).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const RelatedArticles = ({ articles, loading }) => {
  if (loading) {
    // loading skeleton here or spinner
    return <div>Loading...</div>;
  }

  if (!articles || articles.length === 0) return null;

  return (
    <section className="related-section">
      <h3 className="related-title">Related articles</h3>
      <div className="related-grid">
        {articles.map((a, i) => {
          const articleTags = parseTags(a.tags || a.category);
          const isValidUrl = a.url && a.url !== "#";

          return (
            <div className="related-card" key={i}>
              {/* Image with link */}
              {isValidUrl ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="related-thumb-link">
                  {a.thumbUrl ? (
                    <img src={a.thumbUrl} alt={a.heading || ""} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </a>
              ) : (
                <div className="related-thumb">
                  {a.thumbUrl ? (
                    <img src={a.thumbUrl} alt={a.heading || ""} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </div>
              )}

              <div className="related-body">
                {/* Title with link */}
                {isValidUrl ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="related-title-link">
                    <div className="related-title-row">
                      <span className="related-heading">{a.heading || "Untitled"}</span>
                    </div>
                  </a>
                ) : (
                  <div className="related-title-row">
                    <span className="related-heading">{a.heading || "Untitled"}</span>
                  </div>
                )}

                {/* Description without link */}
                <div className="related-desc-row">
                  <span className="related-desc">{truncate(a.description)}</span>
                </div>

                <div className="related-row-bottom">
                  {/* Date without link */}
                  <span className="related-date">{getArticleDate(a)}</span>

                  {/* Read More link */}
                  {isValidUrl && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="related-readmore"
                    >
                      Read More →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedArticles;
