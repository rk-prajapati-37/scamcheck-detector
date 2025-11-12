import React from "react";
import "./WebsiteCheckReport.css";

function getScoreBadge(SCORE) {
  if (SCORE >= 80) return "badge-critical";
  if (SCORE >= 60) return "badge-high";
  if (SCORE >= 40) return "badge-medium";
  return "badge-safe";
}

function getScoreText(SCORE) {
  if (SCORE >= 80) return "Critical";
  if (SCORE >= 60) return "High";
  if (SCORE >= 40) return "Medium";
  return "Low / Safe";
}

const WebsiteCheckReport = ({ prediction }) => {
  if (!prediction) return null;

  return (
    <div className="website-report-container">
      <h2 className="website-report-heading">Report Summary</h2>
      <table className="website-report-table">
        <tbody>
          <tr>
            <td className="website-report-label">Risk Level:</td>
            <td className="website-report-value">
              <span className="website-report-badge badge-critical">
                {prediction.RISK_LEVEL}
              </span>
            </td>
          </tr>
          <tr>
            <td className="website-report-label">
              Score (higher = more dangerous):
            </td>
            <td className="website-report-value">
              <span className={`website-report-badge ${getScoreBadge(prediction.SCORE)}`}>
                {prediction.SCORE} / 100
              </span>
              <span className="website-report-comment">{getScoreText(prediction.SCORE)}</span>
            </td>
          </tr>
          <tr>
            <td className="website-report-label">Confidence:</td>
            <td className="website-report-value">{prediction.CONFIDENCE} %</td>
          </tr>
          <tr>
            <td className="website-report-label">Checks Completed:</td>
            <td className="website-report-value">{prediction.checks_completed}</td>
          </tr>
          <tr>
            <td className="website-report-label">HTTPS?</td>
            <td className="website-report-value">{prediction.isHTTPS ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td className="website-report-label">SSL Certificate?</td>
            <td className="website-report-value">{prediction.hasSSLCertificate ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td className="website-report-label">Google Safe?</td>
            <td className="website-report-value">{prediction.GoogleSafePassed ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td className="website-report-label">VirusTotal Detections:</td>
            <td className="website-report-value">{prediction.VirusTotalDetections}</td>
          </tr>
          <tr>
            <td className="website-report-label">Temporary Domain?</td>
            <td className="website-report-value">{prediction.isTemporaryDomain ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td className="website-report-label">Malicious Extension?</td>
            <td className="website-report-value">{prediction.hasMaliciousExtension ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td className="website-report-label">Direct IP?</td>
            <td className="website-report-value">{prediction.isDirectIP ? "Yes" : "No"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WebsiteCheckReport;
