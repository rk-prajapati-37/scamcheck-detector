import React, { useState } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import AnalyticsSection from "./AnalyticsSection";
import StoriesSection from "./StoriesSection";
import StatsSection from "./StatsSection";
import ReportScamModal from "./ReportScamModal";
import { searchBoomLiveContent, saveUnansweredQuestion } from "./boomLiveAPI";
import "./App.css";

const BOOMLIVE_WHATSAPP = "+91 77009 06588";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleAnalyze = async (query) => {
    setLoading(true);
    setResult(null);

    const res = await searchBoomLiveContent(query);

    if (!res.found) {
      await saveUnansweredQuestion({
        question: query,
        category: "general",
        queryType: "unanswered",
      });
    }

    setResult(res);
    setLoading(false);
  };

  return (
    <>
      <Header openReportModal={() => setShowReport(true)} />
      <HeroSection
        onAnalyze={handleAnalyze}
        alertData={
          result && result.found
            ? {
                headline: "Global Index Investment Scam Exposed",
                summary: result.answer,
                date: new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                link: result.articles && result.articles[0] ? result.articles[0].url : "#",
              }
            : null
        }
        articles={result && result.articles ? result.articles : []}
        loading={loading}
      />
      <AnalyticsSection
        data={result && result.analytics ? result.analytics : []}
        loading={loading}
      />
      <StoriesSection />
      <StatsSection />
      <button
        className="report-btn-float"
        onClick={() => setShowReport(true)}
        aria-label="Report Scam"
      >
        <i className="fas fa-plus"></i>
      </button>
      {showReport && <ReportScamModal onClose={() => setShowReport(false)} />}
      {!loading && result && !result.found && (
        <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
          Sorry! No answer found. Your question has been saved for research. Contact BoomLive at {BOOMLIVE_WHATSAPP}.
        </p>
      )}
    </>
  );
}

export default App;
