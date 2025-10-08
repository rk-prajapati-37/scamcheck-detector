// src/components/ReportScamModal.jsx - Base64 version

import React, { useRef } from "react";

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwApm4wanFbc8Pb-cxecxOHHosSBkx6h5KtcADyoWasa439nAdZc9Bnvvu2HpfcC5aCCg/exec";

// Helper: Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1]; // Remove data:mime;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ReportScamModal = ({ onClose }) => {
  const fileInputRef = useRef();

  const submitScamReport = async (event) => {
    event.preventDefault();
    console.log("🚀 Form submission started");

    try {
      const file = fileInputRef.current?.files[0];
      let attachment = null;

      // Convert file to base64 if present
      if (file) {
        console.log("📎 Converting file to base64:", file.name);
        const base64 = await fileToBase64(file);
        attachment = {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          data: base64,
        };
      }

      const payload = {
        type: event.target.scamType.value,
        content: event.target.scamContent.value,
        email: event.target.reporterEmail.value || "",
        details: event.target.additionalDetails.value || "",
        attachment: attachment, // Send as JSON
      };

      console.log("📤 Sending payload (file as base64)");

      const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Request sent (no-cors mode)");
      alert("✅ Report submitted successfully!");
      event.target.reset();
      onClose();

    } catch (err) {
      console.error("💥 Error:", err);
      alert("Failed to submit. Check console.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-modal">
        <div className="modal-header">
          <h3 className="modal-title">Report New Scam</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submitScamReport} className="report-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="scamType">Scam Type *</label>
              <select className="form-input" name="scamType" id="scamType" required>
                <option value="">Select scam type</option>
                <option value="phishing">Phishing / Email Scam</option>
                <option value="financial">Financial / UPI Fraud</option>
                <option value="social">Social Engineering</option>
                <option value="tech">Tech Support Scam</option>
                <option value="investment">Investment Fraud</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reporterEmail">Contact Email</label>
              <input type="email" className="form-input" name="reporterEmail" id="reporterEmail" placeholder="you@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="scamContent">Scam Content *</label>
            <textarea className="form-input form-textarea" name="scamContent" id="scamContent" required placeholder="Describe the scam..." rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="attachment">Attachment (image/pdf etc)</label>
            <input type="file" className="form-input" name="attachment" id="attachment" ref={fileInputRef} accept="image/*,.pdf,.doc,.docx" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="additionalDetails">Additional Details</label>
            <textarea className="form-input form-textarea" name="additionalDetails" id="additionalDetails" placeholder="Any further context..." rows={2} />
          </div>
          <div className="button-row">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-paper-plane"></i> Submit Report
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportScamModal;
