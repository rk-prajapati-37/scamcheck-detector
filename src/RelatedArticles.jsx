import React from "react";
import "./RelatedArticles.css";

const truncate = (text, maxLength = 130) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const getArticleDate = (article) => {
  const raw = article.publishDate || article.createdDate || "";
  if (!raw) return "";
  return new Date(raw.replace(" ", "T")).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getScamCategory = (heading, description) => {
  const text = `${heading} ${description}`.toLowerCase();
  
  if (text.includes("bank") || text.includes("sms") || text.includes("verification")) {
    return { 
      label: "Bank Verification", 
      icon: "🏦",
      badgeLabel: "Verified Safe",
      badgeColor: "#10b981"
    };
  }
  if (text.includes("investment") || text.includes("ponzi") || text.includes("trading")) {
    return { 
      label: "Investment Analysis", 
      icon: "📊",
      badgeLabel: "Investment Fraud",
      badgeColor: "#ef4444"
    };
  }
  if (text.includes("email") || text.includes("lottery") || text.includes("winner")) {
    return { 
      label: "Email Scanner", 
      icon: "📧",
      badgeLabel: "Email Scam",
      badgeColor: "#8b5cf6"
    };
  }
  if (text.includes("phishing") || text.includes("link") || text.includes("india post")) {
    return { 
      label: "Bank Verification", 
      icon: "🏦",
      badgeLabel: "Verified Safe",
      badgeColor: "#10b981"
    };
  }
  
  return { 
    label: "Fraud Prevention", 
    icon: "🛡️",
    badgeLabel: "Scam Alert",
    badgeColor: "#f59e0b"
  };
};

const RelatedArticles = ({ articles, loading }) => {
  if (loading) {
    return (
      <section className="scam-alert-section">
        <div className="alert-header">
          <span className="alert-icons">⚠️ 🔺</span>
          <h2 className="alert-title">Scam Alert - Related Stories Found</h2>
        </div>
        <div className="stories-grid-two">
          {[1, 2].map((i) => (
            <div className="story-card skeleton" key={i}>
              <div className="skeleton-thumb"></div>
              <div className="skeleton-body">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) return null;

  // Show only first 2 articles
  const displayArticles = articles.slice(0, 2);

  return (
    <section className="scam-alert-section">
      <div className="alert-header">
        <span className="alert-icons">⚠️ 🔺</span>
        <h2 className="alert-title">Scam Alert - Related Stories Found</h2>
      </div>
      
      <div className="stories-grid-two">
        {displayArticles.map((article, index) => {
          const category = getScamCategory(article.heading || "", article.description || "");
          const isValidUrl = article.url && article.url !== "#";
          const articleDate = getArticleDate(article);

          return (
            <div className="story-card" key={index}>
              {/* Image Section */}
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
                <span 
                  className="scam-badge" 
                  style={{ backgroundColor: category.badgeColor }}
                >
                  {category.badgeLabel}
                </span>
              </div>

              {/* Card Body */}
              <div className="card-body">
                {/* Title */}
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

                {/* Description */}
                <p className="card-text">{truncate(article.description)}</p>

                {/* Footer */}
                <div className="card-meta">
                  <div className="meta-left">
                    <span className="meta-icon">{category.icon}</span>
                    <span className="meta-label">{category.label}</span>
                  </div>
                  <span className="meta-date">📅 {articleDate}</span>
                </div>

                {/* Read Report Link */}
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
