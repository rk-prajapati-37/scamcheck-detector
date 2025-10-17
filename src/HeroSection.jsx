import React, { useState } from "react";
import RelatedArticles from "./RelatedArticles";
import "./HeroSection.css";

const HeroSection = ({ onAnalyze, alertData, articles, loading, noAnswerMsg, suggestedKeywords = [] }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const example = "Your parcel delivery has been attempted for the 2nd time please confirm your details or your item will be returned: https://indiapots.com/in";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onAnalyze(query.trim());
    setQuery("");
  };

  // update suggestions when props change
  React.useEffect(() => {
    if (Array.isArray(suggestedKeywords) && suggestedKeywords.length > 0) {
      setSuggestions(suggestedKeywords);
    } else {
      setSuggestions([]);
    }
  }, [suggestedKeywords]);

  const handleSuggestionClick = (text) => {
    setQuery(text);
    onAnalyze(text);
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
                </span>
                <br />
                <span
                  className="hero-example-msg"
                  onClick={handleExampleClick}
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
              {/* Suggested keywords (if any) */}
              {Array.isArray(suggestions) && suggestions.length > 0 && (
                <div className="suggestions-row" style={{ marginTop: '8px' }}>
                  <small>Tip: try these keywords:</small>
                  <div className="suggestion-chips">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="hero-actions" style={{ marginTop: "10px" }}>
                <button
                  type="submit"
                  className="hero-analyze-btn"
                  disabled={loading || !query.trim()}
                  aria-disabled={loading || !query.trim()}
                  aria-label="Search"
                >
                  <i className="fas fa-search" aria-hidden="true"></i> Search
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

            {/* ✅ Lines Loading Animation */}
            {loading && (
              <div className="loading-card">
                <div className="loading-shimmer">
                  <div className="shimmer-line title"></div>
                  <div className="shimmer-line"></div>
                  <div className="shimmer-line"></div>
                  <div className="shimmer-line short"></div>
                </div>
                <div className="loading-text">Analyzing with AI...</div>
              </div>
            )}

            {/* ✅ No Answer Message - Fixed HTML Rendering */}
            {!loading && noAnswerMsg && (
              <div 
                className="no-answer-box"
                role="alert"
                aria-live="polite"
                dangerouslySetInnerHTML={{ __html: noAnswerMsg }}
              />
            )}

            {articles && articles.length > 0 && (
              <div className="hero-articles-space" style={{ marginTop: "20px" }}>
                <RelatedArticles articles={articles} />
              </div>
            )}
            {alertData && (
              <div className="hero-alert-space" style={{ marginTop: "20px" }}>
                {/* Alert content here if needed */}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
