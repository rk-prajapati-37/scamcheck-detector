import React from "react";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw5eDiHWVL0KppVYR8tFzi8WWnqLl-DJPza0fmxhyjydonFxB7pT1x8fO_M5DvUGwWi/exec";

const ReportScamModal = ({ onClose }) => {
  const submitScamReport = async (event) => {
    event.preventDefault();
    const type = event.target.scamType.value;
    const content = event.target.scamContent.value;
    const email = event.target.reporterEmail.value;
    const details = event.target.additionalDetails.value;
    try {
      const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ type, content, email, details }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      alert(data.message || "Report submitted!");
      onClose();
    } catch (err) {
      alert("Failed to submit: " + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Report New Scam</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <form onSubmit={submitScamReport} id="reportForm">
          <div className="form-group">
            <label className="form-label" htmlFor="scamType">
              Scam Type *
            </label>
            <select className="form-input" name="scamType" id="scamType" required>
              <option value="">Select scam type</option>
              <option value="phishing">Phishing/Email Scam</option>
              <option value="financial">Financial/UPI Fraud</option>
              <option value="social">Social Engineering</option>
              <option value="tech">Tech Support Scam</option>
              <option value="investment">Investment Fraud</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="scamContent">Scam Content *</label>
            <textarea
              className="form-input form-textarea"
              name="scamContent"
              id="scamContent"
              required
              placeholder="Paste the suspicious message, link, or describe what happened..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reporterEmail">
              Contact Information (Optional)
            </label>
            <input
              type="email"
              className="form-input"
              name="reporterEmail"
              id="reporterEmail"
              placeholder="Your email for updates on this case"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="additionalDetails">
              Additional Details
            </label>
            <textarea
              className="form-input form-textarea"
              name="additionalDetails"
              id="additionalDetails"
              placeholder="Any additional context, how you encountered this, financial impact, etc."
            />
          </div>
          <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-paper-plane" aria-hidden="true"></i>
              Submit Report
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportScamModal;
