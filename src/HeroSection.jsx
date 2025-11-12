import React, { useState } from "react";
import RelatedArticles from "./RelatedArticles";
import "./HeroSection.css";

const HeroSection = ({
  onAnalyze,
  alertData,
  articles,
  loading,
  noAnswerMsg,
  suggestedKeywords = [],
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [urlResult, setUrlResult] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [lastHadURL, setLastHadURL] = useState(false);
  const [lastHadText, setLastHadText] = useState(false);
  const example =
    "Your parcel delivery has been attempted for the 2nd time please confirm your details or your item will be returned: https://indiapots.com/in";

  // Extract URL from text
  const extractURL = (str) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = str.match(urlRegex);
    return matches ? matches[0] : null;
  };
  const extractURLIfOnlyURL = (str) => {
    const trimmed = str.trim();
    const urlRegex = /^https?:\/\/[^\s]+$/i; // start to end pura URL hona chahiye
    return urlRegex.test(trimmed) ? trimmed : null;
  };

  // Get risk level badge color & emoji
  const getRiskBadgeColor = (riskLevel) => {
    const colors = {
      SAFE: "#10b981",
      LOW: "#f59e0b",
      MEDIUM: "#f97316",
      HIGH: "#ef4444",
      CRITICAL: "#dc2626",
    };
    return colors[riskLevel] || "#6b7280";
  };

  const getRiskEmoji = (riskLevel) => {
    const emojis = {
      SAFE: "🟢",
      LOW: "🟡",
      MEDIUM: "🟠",
      HIGH: "🔴",
      CRITICAL: "🔥",
    };
    return emojis[riskLevel] || "⚪";
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!query.trim()) return;
  //   // Extract URL from query
  //   const url = extractURLIfOnlyURL(query);

  //   // Determine whether query contains URL and/or text
  //   const textOnly = query.replace(url || '', '').trim();
  //   const hasText = textOnly.length > 0;
  //   const hasURL = url;

  //   setLastHadURL(hasURL);
  //   setLastHadText(hasText);

  //   // Clear previous results
  //   setUrlResult(null);
  //   setUrlError(null);
  //   console.log("Submitted query:", query);
  //   // If URL found, analyze it first
  //   if (hasURL) {
  //     console.log("Analyzing URL:", url);
  //     await analyzeURL(url);
  //   } else {
  //     console.log("Calling onAnalyze with:", query.trim());
  //     await onAnalyze(query.trim());

  //   }

  //   // Call main search with the query (text search)
  //   setQuery("");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const url = extractURLIfOnlyURL(query); // sirf agar pura input URL hai tab hi yeh value degi

    const hasURL = !!url;
    const hasText = !hasURL; // Agar URL hai toh text consider nahi karenge

    setLastHadURL(hasURL);
    setLastHadText(hasText);

    setUrlResult(null);
    setUrlError(null);

    if (hasURL) {
      await analyzeURL(url);
    } else {
      await onAnalyze(query.trim());
    }

    setQuery("");
  };

  const analyzeURL = async (url) => {
    setUrlLoading(true);
    setUrlError(null);
    setUrlResult(null);

    try {
      const response = await fetch(
        "https://qs0ks48sscgg0gs4wk4k08g0.vps.boomlive.in/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      // If this is the demo IP example, show a deterministic SAFE sample as requested
      if (url.includes("123.9.85.16")) {
        setUrlResult({
          ...data.prediction,
          // override for demo: show SAFE sample values
          RISK_LEVEL: "SAFE",
          SCORE: 15,
          CONFIDENCE: 60,
          checks_completed: 6,
          GoogleSafePassed: false,
          _mockForExample: true,
        });
      } else {
        setUrlResult(data.prediction);
      }
      setUrlError(null);
    } catch (err) {
      console.error("URL analysis error:", err);
      setUrlError(`URL check failed: ${err.message}`);
      setUrlResult(null);
    } finally {
      setUrlLoading(false);
    }
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
          Paste any suspicious message, link, or content below and get instant
          AI-powered analysis with threat level assessment and protective
          guidance.
        </p>
        <div className="hero-bg">
          <h3 className="hero-analyzer-title">AI Scam Analyzer</h3>
          <p className="hero-analyzer-desc">
            Paste suspicious content for instant threat assessment
          </p>
          <div className="hero-content">
            <form className="search-section" onSubmit={handleSubmit}>
              <div className="hero-example-card">
                <span
                  className="hero-example-title"
                  aria-label="Try this example"
                >
                  <i className="fas fa-lightbulb" aria-hidden="true"></i> Try
                  this example:
                </span>
                <br />
                <span
                  className="hero-example-msg"
                  onClick={handleExampleClick}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleExampleClick();
                  }}
                  aria-label="Click to fill example query"
                >
                  {example}
                </span>
                <small className="hero-example-hint">
                  Click the message above to analyze it
                </small>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="hero-example-link"
                    onClick={() => setQuery("http://123.9.85.16:58003/bin.sh")}
                  >
                    Try malicious URL example{" "}
                    <p>http://123.9.85.16:58003/bin.sh</p>
                  </button>
                </div>
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
                <div className="suggestions-row" style={{ marginTop: "8px" }}>
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

            {/* ✅ URL Safety Result - Only show if URL exists in query and after main loading finishes */}
            {urlResult && !loading && (
              <div className="url-safety-result">
                <div className="url-result-header">
                  <div
                    className="url-risk-badge"
                    style={{
                      backgroundColor: getRiskBadgeColor(urlResult.RISK_LEVEL),
                    }}
                  >
                    {getRiskEmoji(urlResult.RISK_LEVEL)} {urlResult.RISK_LEVEL}
                  </div>
                  <div className="url-result-score">
                    Score: <strong>{urlResult.SCORE}</strong>
                  </div>
                </div>

                <div className="url-result-details">
                  <div className="url-result-row">
                    <span className="url-result-label">Confidence:</span>
                    <span className="url-result-value">
                      {urlResult.CONFIDENCE}%
                    </span>
                  </div>
                  <div className="url-result-row">
                    <span className="url-result-label">Checks Completed:</span>
                    <span className="url-result-value">
                      {urlResult.checks_completed}
                    </span>
                  </div>

                  <div className="url-result-flags">
                    {urlResult.isTemporaryDomain && (
                      <span className="url-flag warning">
                        ⚠️ Temporary Domain
                      </span>
                    )}
                    {urlResult.hasMaliciousExtension && (
                      <span className="url-flag danger">
                        ⛔ Malicious Extension
                      </span>
                    )}
                    {urlResult.isDirectIP && (
                      <span className="url-flag warning">🔗 Direct IP</span>
                    )}
                    {urlResult.InURLVoidBlackList && (
                      <span className="url-flag danger">
                        🚫 URLVoid Blacklist
                      </span>
                    )}
                    {urlResult.InURLHaus && (
                      <span className="url-flag danger">⛔ URLhaus Listed</span>
                    )}
                    {!urlResult.isHTTPS && (
                      <span className="url-flag warning">🔓 No HTTPS</span>
                    )}
                    {!urlResult.hasSSLCertificate && (
                      <span className="url-flag warning">🔐 No SSL</span>
                    )}
                    {urlResult.GoogleSafePassed && (
                      <span className="url-flag safe">✅ Google Safe</span>
                    )}
                    {urlResult.InTop1Million && (
                      <span className="url-flag safe">⭐ Top 1M Domain</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {urlError && <div className="url-error-box">{urlError}</div>}

            {/* ✅ Scam Alert - Related Stories - Show only when the submission included text (hide for URL-only)
            {!loading && articles && articles.length > 0 && lastHadText && (
              <div className="scam-alert-box">
                <div className="scam-alert-header">
                  <span className="scam-alert-icon">🚨</span>
                  <h4 className="scam-alert-title">
                    Scam Alert - Related Stories Found
                  </h4>
                </div>
              </div>
            )} */}
            {/* Scam Alert - Related Stories */}
            {!loading && articles && articles.length > 0 && lastHadText && (
              <div className="scam-alert-box">
                <div className="scam-alert-header">
                  <span className="scam-alert-icon">🚨</span>
                  <h4 className="scam-alert-title">
                    Scam Alert - Related Stories Found
                  </h4>
                </div>
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
            {/* Related Articles */}
            {lastHadText && articles && articles.length > 0 && (
              <div
                className="hero-articles-space"
                style={{ marginTop: "20px" }}
              >
                <RelatedArticles articles={articles} />
              </div>
            )}
            {/* {articles && articles.length > 0 && (
              <div
                className="hero-articles-space"
                style={{ marginTop: "20px" }}
              >
                <RelatedArticles articles={articles} />
              </div>
            )} */}
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
