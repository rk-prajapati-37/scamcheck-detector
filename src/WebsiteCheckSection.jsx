import React, { useState } from "react";
import "./WebsiteCheckSection.css";

function getRiskColor(score, riskLevel) {
  // Based on the API documentation risk score classification
  if (score >= 80) {
    return "#10B981"; // Green - LOW RISK
  } else if (score >= 60) {
    return "#F59E0B"; // Yellow - MEDIUM RISK
  } else if (score >= 40) {
    return "#F97316"; // Orange - HIGH RISK
  } else if (score >= 0) {
    return "#EF4444"; // Red - CRITICAL RISK
  }
  return "#6B7280"; // Gray - UNCERTAIN (low confidence)
}

function getRiskIcon(score) {
  if (score >= 80) return "✓"; // checkmark for safe
  if (score >= 60) return "⚠"; // warning for medium
  if (score >= 40) return "⛔"; // stop for high
  return "✕"; // X for critical
}

const WebsiteCheckSection = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);

    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    console.log("🔍 Starting URL check for:", url);
    
    try {
      const res = await fetch(
        "https://qs0ks48sscgg0gs4wk4k08g0.vps.boomlive.in/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      console.log("📊 API Response Status:", res.status);

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      console.log("📦 API Response Data:", data);

      // Handle error responses from API
      if (data?.error) {
        console.error("❌ API Error:", data.message);
        setError(data.message || "API Error: Unable to analyze URL");
        return;
      }

      // Handle timeout response
      if (data?.code === "TIMEOUT") {
        console.error("⏱️ Request Timeout");
        setError("Request timeout. Website might be slow or down. Please try again.");
        return;
      }

      if (data?.prediction) {
        console.log("✅ Prediction received:", data.prediction);
        setPrediction(data.prediction);
      } else {
        console.warn("⚠️ No prediction in response");
        setError("No prediction returned. Please try another URL.");
      }
    } catch (err) {
      console.error("❌ URL check error:", err);
      if (err.message.includes("504")) {
        setError("Request timeout. Please try again later.");
      } else {
        setError("API call failed. Please try again later.");
      }
    }
    setLoading(false);
  };

  return (
    <section className="website-check-section">
      <h1>Check a website:</h1>
      <p>Check if a website or link is a scam, phishing or legit…</p>

      <form onSubmit={handleSubmit} className="check-form">
        <input
          type="text"
          placeholder="Enter website or URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="url-input"
        />
        <button type="submit" disabled={loading} className="submit-btn">
          Scan Website
        </button>
      </form>

      {loading && <p className="loading-text">Analyzing URL...</p>}
      {error && <p className="error-text">{error}</p>}

      {prediction && (
        <div className="result-card">
          <h2>
            {getRiskIcon(prediction.SCORE)} Report Summary
          </h2>

          {/* Risk Level with description */}
          <div className="risk-summary" style={{ borderLeftColor: getRiskColor(prediction.SCORE, prediction.RISK_LEVEL) }}>
            <h3 style={{ color: getRiskColor(prediction.SCORE, prediction.RISK_LEVEL) }}>
              {prediction.RISK_DESCRIPTION}
            </h3>
            <p><strong>Risk Level:</strong> {prediction.RISK_LEVEL}</p>
          </div>

          {/* Score and Confidence */}
          <div className="score-section">
            <div className="score-item">
              <label>Safety Score</label>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${prediction.SCORE}%`,
                    backgroundColor: getRiskColor(prediction.SCORE),
                  }}
                ></div>
              </div>
              <span className="score-value">{prediction.SCORE}/100</span>
            </div>

            <div className="score-item">
              <label>Confidence Level</label>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${prediction.CONFIDENCE}%`,
                    backgroundColor: "#3B82F6",
                  }}
                ></div>
              </div>
              <span className="score-value">{prediction.CONFIDENCE}%</span>
            </div>
          </div>

          {/* Positive Highlights */}
          {prediction.positive_highlights && prediction.positive_highlights.length > 0 && (
            <div className="highlights positive-highlights">
              <h4>✓ Positive Indicators:</h4>
              <ul>
                {prediction.positive_highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Negative Highlights */}
          {prediction.negative_highlights && prediction.negative_highlights.length > 0 && (
            <div className="highlights negative-highlights">
              <h4>⚠ Warning Signs:</h4>
              <ul>
                {prediction.negative_highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Details */}
          {prediction.details && (
            <div className="details-section">
              <h4>Technical Details</h4>
              <table className="details-table">
                <tbody>
                  {Object.entries(prediction.details).map(([key, value]) => (
                    <tr key={key}>
                      <td className="detail-key">{key.replace(/_/g, " ")}</td>
                      <td className="detail-value">{value || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Checks Performed */}
          <div className="checks-info">
            <span>✓ Checks Performed: {prediction.checks_performed || 0}</span>
            <span>Score Breakdown: +{prediction.positive_score || 0} | -{prediction.negative_score || 0}</span>
          </div>

          {/* Target URLs for Typosquatting cases */}
          {prediction.target_urls && prediction.target_urls.length > 0 && (
            <div className="target-urls">
              <h4>⚠ Similar Legitimate Domains (Typosquatting Check):</h4>
              <ul>
                {prediction.target_urls.map((url, idx) => (
                  <li key={idx}>{url}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default WebsiteCheckSection;
