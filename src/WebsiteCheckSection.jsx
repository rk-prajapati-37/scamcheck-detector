import React, { useState } from "react";
import "./WebsiteCheckSection.css";

function getRiskColor(level) {
  switch (level) {
    case "SAFE":
      return "#29c15c";
    case "LOW":
      return "#f7d41a";
    case "MEDIUM":
      return "#ffb624";
    case "HIGH":
      return "#e94825";
    case "CRITICAL":
      return "#08b3bb";
    default:
      return "#bdbdbd";
  }
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
    try {
      const res = await fetch(
        "https://qs0ks48sscgg0gs4wk4k08g0.vps.boomlive.in/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );
      const data = await res.json();
      if (data?.prediction) {
        setPrediction(data.prediction);
      } else {
        setError("No prediction returned. Please try another URL.");
      }
    } catch (err) {
      setError("API call failed. Please try again later.");
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
          <h2>Report Summary</h2>
          <table>
            <tbody>
              <tr>
                <td>Risk Level:</td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getRiskColor(prediction.RISK_LEVEL) }}
                  >
                    {prediction.RISK_LEVEL}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Score (higher = more dangerous):</td>
                <td>
                  <span
                    className={`score-badge ${
                      prediction.SCORE >= 80
                        ? "score-critical"
                        : prediction.SCORE >= 60
                        ? "score-high"
                        : prediction.SCORE >= 40
                        ? "score-medium"
                        : "score-safe"
                    }`}
                  >
                    {prediction.SCORE} / 100
                  </span>
                  <span className="score-text">
                    {prediction.SCORE >= 80
                      ? "Critical"
                      : prediction.SCORE >= 60
                      ? "High"
                      : prediction.SCORE >= 40
                      ? "Medium"
                      : "Low / Safe"}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Confidence:</td>
                <td>{prediction.CONFIDENCE} %</td>
              </tr>
              <tr>
                <td>Checks Completed:</td>
                <td>{prediction.checks_completed}</td>
              </tr>
              <tr>
                <td>HTTPS:</td>
                <td>{prediction.isHTTPS ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>SSL Certificate:</td>
                <td>{prediction.hasSSLCertificate ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Google Safe:</td>
                <td>{prediction.GoogleSafePassed ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>VirusTotal Detections:</td>
                <td>{prediction.VirusTotalDetections}</td>
              </tr>
              <tr>
                <td>Temporary Domain:</td>
                <td>{prediction.isTemporaryDomain ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Malicious Extension:</td>
                <td>{prediction.hasMaliciousExtension ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Direct IP:</td>
                <td>{prediction.isDirectIP ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default WebsiteCheckSection;
