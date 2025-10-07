import React, { useState } from "react";
import AnswerAlertCard from "./AnswerAlertCard";
import RelatedArticles from "./RelatedArticles";
import "./HeroSection.css";

const HeroSection = ({ onAnalyze, alertData, articles, loading }) => {
  const [query, setQuery] = useState("");
  const example = "Earn 5x profit in 7 days! 🚀 Invest just ₹500 today on Global Index.";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onAnalyze(query.trim());
    setQuery("");
  };

  const handleExampleClick = () => setQuery(example);

  return (
    <section id="home" className="hero-section">
      <div className="container">
        <h1 className="hero-title">Detect Scams with AI</h1>
        <p className="hero-subtitle">
          Paste any suspicious message, link, or content below and get instant AI-powered analysis with threat level assessment and protective guidance.
        </p>
        <div className="hero-bg">
          <h3 className="hero-analyzer-title">AI Scam Analyzer</h3>
          <p className="hero-analyzer-desc">Paste suspicious content for instant threat assessment</p>
          <div className="hero-content">
            <form className="search-section" onSubmit={handleSubmit}>
              <div className="hero-example-card">
                <span className="hero-example-title" aria-label="Try this example">
                  <i className="fas fa-lightbulb" aria-hidden="true"></i> Try this example:
                </span><br />
                <span
                  className="hero-example-msg"
                  onClick={handleExampleClick}
                  style={{ cursor: "pointer" }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleExampleClick();
                  }}
                  aria-label="Click to fill example query"
                >
                  {example}
                </span>
                <small className="hero-example-hint">Click the message above to analyze it</small>
              </div>
              <textarea
                className="hero-input"
                placeholder="Paste suspicious messages, links, phone numbers, or describe what happened here..."
                value={query}
                rows={3}
                onChange={(e) => setQuery(e.target.value)}
                required
                aria-label="Suspicious content input"
              />
              <div className="hero-actions" style={{ marginTop: "10px" }}>
                <button
                  type="submit"
                  className="hero-analyze-btn"
                  disabled={loading || !query.trim()}
                  aria-disabled={loading || !query.trim()}
                  aria-label="Analyze Threat"
                >
                  <i className="fas fa-search" aria-hidden="true"></i> Analyze Threat
                </button>
                <button
                  type="button"
                  className="hero-clear-btn"
                  onClick={() => setQuery("")}
                  disabled={loading}
                  aria-label="Clear input"
                  style={{ marginLeft: "8px" }}
                >
                  <i className="fas fa-eraser" aria-hidden="true"></i> Clear
                </button>
              </div>
            </form>
            {loading && (
              <div style={{ textAlign: "center", margin: "22px 0" }}>
                <div className="shimmer-loader" />
                <div style={{ marginTop: 8 }}>Analyzing with AI...</div>
              </div>
            )}
            {articles && articles.length > 0 && (
              <div className="hero-articles-space" style={{ marginTop: "20px" }}>
                <RelatedArticles articles={articles} />
              </div>
            )}
            {alertData && (
              <div className="hero-alert-space" style={{ marginTop: "20px" }}>
                <AnswerAlertCard
                  category={alertData.category}
                  scamType={alertData.scamType}
                  headline={alertData.headline}
                  summary={alertData.summary}
                  publishDate={alertData.publishDate}
                  date={alertData.date}
                  link={alertData.link}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
