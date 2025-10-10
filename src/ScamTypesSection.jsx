import React from "react";
import "./ScamTypesSection.css";

const SCAM_TYPES_DATA = [
  {
    url: "https://www.boomlive.in/tags/phishing-scam",
    title: "Phishing Scam",
    question: "tricks you into revealing personal information, like passwords or bank details",
    highlight: "Phishing",
    character: "phishing",
    icon: "fas fa-user-secret"
  },
  {
    url: "https://www.boomlive.in/tags/finance-scam",
    title: "Finance Scam", 
    question: "are fake money-making schemes to steal your savings",
    highlight: "Finance scams",
    character: "finance",
    icon: "fas fa-user-tie",
    extraIcon: "coin"
  },
  {
    url: "https://www.boomlive.in/tags/romance-scam",
    title: "Romance Scam",
    question: "Is it love in the air, or is it a",
    questionEnd: "?",
    highlight: "romance scam",
    character: "romance", 
    icon: "fas fa-user",
    extraIcon: "heart"
  },
  {
    url: "https://www.boomlive.in/tags/schemes-scam",
    title: "Schemes Scam",
    question: "Fraudulent promising quick money or unrealistic returns",
    highlight: "schemes",
    character: "schemes",
    icon: "fas fa-user-tag",
    extraIcon: "coin"
  },
  {
    url: "https://www.boomlive.in/tags/medical-scam", 
    title: "Medical Scam",
    question: "Fake or health products claiming miracle cures",
    highlight: "medical treatments",
    character: "medical",
    icon: "fas fa-user-md",
    extraIcon: "pills"
  },
  {
    url: "https://www.boomlive.in/tags/gift-scam",
    title: "Gift Scam", 
    question: "Fake and prize claims to steal your money or data",
    highlight: "gift offers",
    character: "gift",
    icon: "fas fa-user-secret",
    extraIcon: "gift-icon"
  },
  {
    url: "https://www.boomlive.in/tags/digital-arrest",
    title: "Digital Arrest",
    question: "Scammers impersonate police to threaten and extort money", 
    highlight: "digital arrest",
    character: "arrest",
    icon: "fas fa-user-shield",
    extraIcon: "handcuffs"
  },
  {
    url: "https://www.boomlive.in/tags/job-scam",
    title: "Job Scam",
    question: "Found your dream job, or is it just a",
    questionEnd: "?",
    highlight: "job scam",
    character: "job", 
    icon: "fas fa-user-check",
    extraIcon: "briefcase"
  }
];

const getExtraIconClass = (iconType) => {
  const iconMap = {
    coin: "fas fa-coins",
    heart: "fas fa-heart-broken", 
    pills: "fas fa-pills",
    "gift-icon": "fas fa-gift",
    handcuffs: "fas fa-handcuffs",
    briefcase: "fas fa-briefcase"
  };
  return iconMap[iconType] || "fas fa-chart-line";
};

export default function ScamTypesSection() {
  return (
    <section id="scam-types" className="scam-types-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Common Scam Types</h2>
          <p className="section-subtitle">
            Learn about different fraud patterns - Click any card to see real verified cases from BoomLive
          </p>
        </div>
        
        <div className="scam-grid">
          {SCAM_TYPES_DATA.map((scam, index) => (
            <a 
              key={index}
              href={scam.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="scam-card"
            >
              <p className="scam-question">
                {scam.question.includes(scam.highlight) ? (
                  <>
                    {scam.question.split(scam.highlight)[0]}
                    <span className="highlight">{scam.highlight}</span>
                    {scam.question.split(scam.highlight)[1]}
                    {scam.questionEnd || ""}
                  </>
                ) : (
                  <>
                    <span className="highlight">{scam.highlight}</span> {scam.question}
                    {scam.questionEnd || ""}
                  </>
                )}
              </p>
              
              <div className="scam-illustration">
                <div className={`scam-character ${scam.character}`}>
                  <i className={scam.icon}></i>
                </div>
                <div className="scam-warning">
                  <i className="fas fa-exclamation"></i>
                </div>
                {scam.extraIcon && (
                  <div className={`scam-icon-symbol ${scam.extraIcon}`}>
                    <i className={getExtraIconClass(scam.extraIcon)}></i>
                  </div>
                )}
              </div>
              
              <h4>{scam.title}</h4>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
