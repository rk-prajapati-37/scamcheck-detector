import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="https://www.boomlive.in" target="_blank" rel="noopener noreferrer">
            BoomLive
          </a>
          <a href="https://www.boomlive.in/fact-check" target="_blank" rel="noopener noreferrer">
            Fact Check
          </a>
          <a href="https://www.boomlive.in/deepfake-tracker" target="_blank" rel="noopener noreferrer">
            Deepfake Tracker
          </a>
          {/* <a href="https://www.boomlive.in/grievance-redressal" target="_blank" rel="noopener noreferrer">
            Grievance Redressal
          </a> */}
        </div>
        <div className="footer-copyright">
          © 2025 BOOM Live
        </div>
      </div>
    </footer>
  );
};

export default Footer;
