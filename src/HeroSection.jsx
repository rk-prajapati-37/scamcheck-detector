import React, { useState } from "react";
import RelatedArticles from "./RelatedArticles";
import "./HeroSection.css";
import "./WebsiteCheckSection.css";

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
  const [urlError, setUrlError] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [lastHadText, setLastHadText] = useState(false);
  const example =
    "Your parcel delivery has been attempted for the 2nd time please confirm your details or your item will be returned: https://indiapots.com/in";

  // Extract a URL-like substring from text (accepts http(s), www, or domains like .com/.in)
  const extractURLFromText = (str) => {
    if (!str || typeof str !== "string") return null;
    const trimmed = str.trim();
    // match full http(s) URLs first
    const httpRegex = /https?:\/\/[^\s,;"'<>]+/i;
    const m1 = trimmed.match(httpRegex);
    if (m1 && m1[0]) return m1[0];

    // match www or domain patterns with common TLDs
    const domainRegex = /(?:www\.)?[a-z0-9-]+\.(?:com|in|co|net|org|io|info|xyz|me|online|tech|biz)\b[^\s,;"'<>]*/i;
    const m2 = trimmed.match(domainRegex);
    if (m2 && m2[0]) {
      // if it doesn't start with protocol, prepend http:// so backend accepts
      return m2[0].startsWith("http") ? m2[0] : `http://${m2[0]}`;
    }

    return null;
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

  const getScoreClass = (score) => {
    if (typeof score !== 'number') return '';
    if (score >= 80) return 'score-safe';
    if (score >= 60) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-critical';
  };

  // emoji helper removed (not used) to avoid lint warning

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

    const url = extractURLFromText(query);

    const hasURL = !!url;
    // If input contains both URL and other text, we will prefer URL mode (per requirement)
    const textOnly = query.replace(url || "", "").trim();
    const hasText = textOnly.length > 0;

    // If a URL is present treat this submission as a URL-check only (hide article results)
    setLastHadText(!hasURL && hasText);

    setUrlResult(null);
    setUrlError(null);

    if (hasURL) {
      await analyzeURL(url);
      // Do NOT call onAnalyze when URL is present — keep UI focused on website report only
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

  const handleExampleUrlClick = async (exampleUrl) => {
    // Fill the input and run the URL analyzer immediately
    setQuery(exampleUrl);
    try {
      await analyzeURL(exampleUrl);
    } catch (e) {
      console.warn('Example URL analysis failed', e);
    }
  };

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
                    onClick={() => handleExampleUrlClick('http://likeme.com')}
                    aria-label="Try example website"
                  >
                    🔗 Try this website: <span style={{ marginLeft: 8, fontWeight: 600 }}>http://likeme.com</span>
                  </button>
                </div>
                {/* <div style={{ marginTop: 8 }}>
                   <button
                    type="button"
                    className="hero-example-link"
                    onClick={() => setQuery("http://123.9.85.16:58003/bin.sh")}
                  >
                 🔗 Website{" "}
                    <p>http://123.9.85.16:58003/bin.sh</p>
                  </button>
                </div> */}
              </div>
              <textarea
                className="hero-input"
                placeholder="Paste suspicious messages, links, phone numbers, websites/URLs, or describe what happened here..."
                value={query}
                rows={3}
                onChange={(e) => setQuery(e.target.value)}
                required
                aria-label="Suspicious content input"
              />
              {/* Suggested keywords (if any) - hide when input contains a URL */}
              {Array.isArray(suggestions) && suggestions.length > 0 && !extractURLFromText(query) && (
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

            {/* ✅ URL Safety Result (WebsiteCheck layout) */}
            {urlResult && !loading && !urlLoading && (
              <div className="result-card">
                <h2>Report Summary</h2>
                <table>
                  <tbody>
                    <tr>
                      <td>Risk Level:</td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: getRiskBadgeColor(urlResult.RISK_LEVEL) }}
                        >
                          {urlResult.RISK_LEVEL}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Score:</td>
                      <td>
                        <span className={`score-badge ${getScoreClass(Number(urlResult.SCORE))}`}>
                          {urlResult.SCORE} / 100
                        </span>
                        <span className="score-text">
                          {urlResult.SCORE >= 80
                            ? "Safe"
                            : urlResult.SCORE >= 60
                            ? "Caution"
                            : urlResult.SCORE >= 40
                            ? "Suspicious"
                            : "Danger"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Confidence:</td>
                      <td>{urlResult.CONFIDENCE} %</td>
                    </tr>
                    <tr>
                      <td>Checks Completed:</td>
                      <td>{urlResult.checks_performed || urlResult.checks_completed || 0}</td>
                    </tr>
                    <tr>
                      <td>HTTPS:</td>
                      <td>{urlResult.isHTTPS ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                      <td>SSL Certificate:</td>
                      <td>{urlResult.hasSSLCertificate ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                      <td>Google Safe:</td>
                      <td>{urlResult.GoogleSafePassed ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                      <td>VirusTotal Detections:</td>
                      <td>{urlResult.VirusTotalDetections || 0}</td>
                    </tr>
                    <tr>
                      <td>Temporary Domain:</td>
                      <td>{urlResult.isTemporaryDomain ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                      <td>Malicious Extension:</td>
                      <td>{urlResult.hasMaliciousExtension ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                      <td>Direct IP:</td>
                      <td>{urlResult.isDirectIP ? "Yes" : "No"}</td>
                    </tr>
                  </tbody>
                </table>
                {/* Positive / Negative highlights */}
                {urlResult.positive_highlights && urlResult.positive_highlights.length > 0 && (
                  <div className="highlights positive-highlights" style={{ marginTop: 16 }}>
                    <h4>✓ Positive Indicators</h4>
                    <ul>
                      {urlResult.positive_highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {urlResult.negative_highlights && urlResult.negative_highlights.length > 0 && (
                  <div className="highlights negative-highlights" style={{ marginTop: 12 }}>
                    <h4>⚠ Warning Signs</h4>
                    <ul>
                      {urlResult.negative_highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical details */}
                {urlResult.details && (
                  <div className="details-section" style={{ marginTop: 16 }}>
                    <h4>Technical Details</h4>
                    <table className="details-table">
                      <tbody>
                        {Object.entries(urlResult.details).map(([k, v]) => (
                          <tr key={k}>
                            <td className="detail-key">{k.replace(/_/g, ' ')}</td>
                            <td className="detail-value">{v || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Score breakdown and target URLs */}
                <div className="checks-info" style={{ marginTop: 16 }}>
                  <span>Positive Score: {urlResult.positive_score ?? 'N/A'}</span>
                  <span>Negative Score: {urlResult.negative_score ?? 'N/A'}</span>
                  <span>Checks Performed: {urlResult.checks_performed ?? urlResult.checks_completed ?? 0}</span>
                </div>

                {urlResult.target_urls && urlResult.target_urls.length > 0 && (
                  <div className="target-urls" style={{ marginTop: 12 }}>
                    <h4>Similar Legitimate Domains</h4>
                    <ul>
                      {urlResult.target_urls.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
            {/* {!loading && articles && articles.length > 0 && lastHadText && (
              <div className="scam-alert-box">
                <div className="scam-alert-header">
                  <span className="scam-alert-icon">🚨</span>
                  <h4 className="scam-alert-title">
                    Scam Alert - Related Stories Found
                  </h4>
                </div>
              </div>
            )} */}
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
            {alertData && lastHadText && (
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



