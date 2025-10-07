import React, { useState } from "react";
import "./Header.css";

const Header = ({ openReportModal }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on link click (optional, UX improvement)
  const handleMenuLinkClick = () => setMenuOpen(false);

  return (
    <nav className="site-navbar">
      <div className="site-logo">
        <i className="fas fa-shield-alt" /> ScamCheck
      </div>
      {/* Hamburger Toggle Button */}
      <button
        className="nav-toggle"
        aria-label="Open menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={`bar${menuOpen ? " open" : ""}`}></span>
        <span className={`bar${menuOpen ? " open" : ""}`}></span>
        <span className={`bar${menuOpen ? " open" : ""}`}></span>
      </button>
      {/* Menu - add 'open' class conditionally */}
      <ul className={`site-menu${menuOpen ? " open" : ""}`}>
        <li><a href="#home" className="active" onClick={handleMenuLinkClick}>Home</a></li>
        <li><a href="#analytics" onClick={handleMenuLinkClick}>Analytics</a></li>
        <li><a href="#stories" onClick={handleMenuLinkClick}>Stories</a></li>
        <li><a href="#scam-types" onClick={handleMenuLinkClick}>Scam Types</a></li>
      </ul>
      <button className="header-btn" onClick={openReportModal}>
        <i className="fas fa-plus"></i>
        <span className="hide-on-mobile">Report Scam</span>
      </button>
    </nav>
  );
};

export default Header;
