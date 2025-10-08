import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ScamTypesSection.css";

const TAGS_DATA = [
  {
    label: "Phishing & Email",
    desc: "Fake emails, OTP requests, and identity theft attempts targeting personal information.",
    color: "#ef4444",
    icon: "fas fa-envelope",
    url: "https://www.boomlive.in/tags/phishing-scam"
  },
  {
    label: "Financial Fraud",
    desc: "UPI scams, fake QR codes, investment schemes, and unauthorized transaction attempts.",
    color: "#f97316",
    icon: "fas fa-credit-card",
    url: "https://example.com/tag/financial"
  },
  {
    label: "Social Engineering",
    desc: "Fake job offers, lottery wins, relationship scams, and emotional manipulation tactics.",
    color: "#22c55e",
    icon: "fas fa-users",
    url: "https://example.com/tag/social"
  },
  {
    label: "Tech Support",
    desc: "Fake virus alerts, remote access requests, and software installation scams.",
    color: "#a78bfa",
    icon: "fas fa-laptop",
    url: "https://example.com/tag/tech"
  },
  {
    label: "Crypto Scam",
    desc: "Fraud ICOs, fake crypto exchanges, crypto investment scams.",
    color: "#facc15",
    icon: "fas fa-coins",
    url: "https://example.com/tag/crypto"
  },
  {
    label: "Loan Fraud",
    desc: "Fake loan offers, high interest traps, unauthorized lending.",
    color: "#0ea5e9",
    icon: "fas fa-hand-holding-usd",
    url: "https://example.com/tag/loan"
  }
  // Add more tags as needed...
];

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 600,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2400,
  pauseOnHover: true,
  arrows: false,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3 } },
    { breakpoint: 840, settings: { slidesToShow: 2 } },
    { breakpoint: 620, settings: { slidesToShow: 1 } }
  ]
};

export default function ScamTypesSection() {
  return (
    <section className="scam-types-section">
      <div className="scam-types-header">
        <h2 className="scam-types-title">Common Scam Types</h2>
        <p className="scam-types-desc">
          Learn about different fraud patterns our AI can detect
        </p>
      </div>
      <div className="scam-types-slider-wrap">
        <Slider {...sliderSettings}>
          {TAGS_DATA.map((tag, idx) => (
            <div className="scam-types-card-wrap" key={tag.label + idx}>
              <div
                className="scam-types-card"
                style={{ borderColor: tag.color }}
                onClick={() => window.open(tag.url, "_blank")}
                tabIndex={0}
                role="button"
                onKeyPress={e => (e.key === "Enter") && window.open(tag.url, "_blank")}
              >
                <div className="scam-types-card-icon" style={{ background: tag.color }}>
                  <i className={tag.icon} />
                </div>
                <div className="scam-types-card-label">{tag.label}</div>
                <div className="scam-types-card-desc">{tag.desc}</div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
