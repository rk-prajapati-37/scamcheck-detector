import React, { useRef, useState } from "react";
import "./ReportScamModal.css";

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwApm4wanFbc8Pb-cxecxOHHosSBkx6h5KtcADyoWasa439nAdZc9Bnvvu2HpfcC5aCCg/exec";

// Helper: Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ReportScamModal = ({ onClose }) => {
  const fileInputRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const submitScamReport = async (event) => {
    event.preventDefault();
    console.log("🚀 Form submission started");

    setIsSubmitting(true);

    try {
      const file = fileInputRef.current?.files[0];
      let attachment = null;

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
        attachment: attachment,
      };

      console.log("📤 Sending payload (file as base64)");

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Request sent (no-cors mode)");
      
      // Show success popup
      setIsSubmitting(false);
      setShowSuccess(true);

    } catch (err) {
      console.error("💥 Error:", err);
      setIsSubmitting(false);
      alert("Failed to submit. Please try again.");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      {/* Main Form Modal */}
      <div className="modal-overlay" style={{ display: showSuccess ? 'none' : 'flex' }}>
        <div className="modal-content report-modal">
          <div className="modal-header">
            <h3 className="modal-title">Report New Scam</h3>
            <button className="close-btn" onClick={onClose} disabled={isSubmitting}>×</button>
          </div>
          <form onSubmit={submitScamReport} className="report-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="scamType">Scam Type *</label>
                <select className="form-input" name="scamType" id="scamType" required disabled={isSubmitting}>
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
                <input 
                  type="email" 
                  className="form-input" 
                  name="reporterEmail" 
                  id="reporterEmail" 
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="scamContent">Scam Content *</label>
              <textarea 
                className="form-input form-textarea" 
                name="scamContent" 
                id="scamContent" 
                required 
                placeholder="Describe the scam..." 
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="attachment">Attachment (image/pdf etc)</label>
              <input 
                type="file" 
                className="form-input" 
                name="attachment" 
                id="attachment" 
                ref={fileInputRef} 
                accept="image/*,.pdf,.doc,.docx"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="additionalDetails">Additional Details</label>
              <textarea 
                className="form-input form-textarea" 
                name="additionalDetails" 
                id="additionalDetails" 
                placeholder="Any further context..." 
                rows={2}
                disabled={isSubmitting}
              />
            </div>
            <div className="button-row">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Submit Report
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-popup">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="success-title">Report submitted successfully!</h3>
            <p className="success-message">
              Our team will review it within 24 hours. Thank you for helping keep the community safe!
            </p>
            <button className="btn btn-primary success-btn" onClick={handleSuccessClose}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportScamModal;
