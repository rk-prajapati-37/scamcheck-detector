import React from "react";
import "./RelatedArticles.css";

const truncate = (text, maxLength = 150) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const RelatedArticles = ({ articles, loading, noAnswerMsg }) => {
  if (loading) {
    return (
      <section className="scam-alert-section">
        <div className="alert-header">
          <span className="alert-icons">⚠️ </span>
          <h2 className="alert-title">Scam Alert - Related Stories Found</h2>
        </div>
        <div className="stories-grid-two">
          {[1, 2].map((i) => (
            <div className="story-card skeleton" key={i}>
              <div className="skeleton-thumb">
                <div className="skeleton-shimmer"></div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ✅ Show "No Information Found" message
  if (noAnswerMsg && (!articles || articles.length === 0)) {
    return (
      <section className="scam-alert-section">
        <div className="no-info-card">
          <div className="no-info-icon">🔍</div>
          <h3 className="no-info-title">No Specific Information Found</h3>
          <p className="no-info-text">
            We couldn't find specific stories matching your input, but please be cautious. 
            Do not click on suspicious links or share personal information. Our team will 
            investigate this content from our end and update our database if it's a known scam.
          </p>
        </div>
      </section>
    );
  }

  // Don't show anything if no articles
  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = articles.slice(0, 2);

  return (
    <section className="scam-alert-section">
      <div className="alert-header">
        <span className="alert-icons">⚠️</span>
        <h2 className="alert-title">Scam Alert - Related Stories Found</h2>
      </div>

      <div className="stories-grid-two">
        {displayArticles.map((article, index) => {
          const isValidUrl = article.url && article.url !== "#";

          return (
            <div key={index} className="story-card">
              {/* Image Section - No Badge */}
              <div className="card-thumb-wrapper">
                {isValidUrl ? (
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={article.thumbUrl || "https://via.placeholder.com/400x240/f3f4f6/6b7280?text=No+Image"}
                      alt={article.heading || "Scam Alert"}
                      className="card-thumb"
                    />
                  </a>
                ) : (
                  <img
                    src={article.thumbUrl || "https://via.placeholder.com/400x240/f3f4f6/6b7280?text=No+Image"}
                    alt={article.heading || "Scam Alert"}
                    className="card-thumb"
                  />
                )}
              </div>

              {/* Content Section */}
              <div className="card-body">
                {isValidUrl ? (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-title-link"
                  >
                    <h3 className="card-heading">{article.heading || "Untitled Story"}</h3>
                  </a>
                ) : (
                  <h3 className="card-heading">{article.heading || "Untitled Story"}</h3>
                )}
                
                <p className="card-text">{truncate(article.description)}</p>

                {/* Read Full Report Link */}
                {isValidUrl && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="read-full-link"
                  >
                    Read Full Report →
                  </a>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Empty placeholder if only 1 article */}
        {displayArticles.length === 1 && (
          <div className="story-card-placeholder"></div>
        )}
      </div>
    </section>
  );
};

export default RelatedArticles;
