import React, { useState } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import AnalyticsSection from "./AnalyticsSection";
import StoriesSection from "./StoriesSection";
import ReportScamModal from "./ReportScamModal";
import ScamTypesSection from "./ScamTypesSection";
import { searchBoomLiveContent } from "./boomLiveAPI"; // ✅ सिर्फ search function import करो
import "./App.css";

const BOOMLIVE_WHATSAPP = "+91 77009 06588";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [noAnswerMsg, setNoAnswerMsg] = useState(null);

  const handleAnalyze = async (query) => {
    setLoading(true);
    setResult(null);
    setNoAnswerMsg(null);

    try {
      // ✅ यह function internally save भी कर देगा जब जरूरत हो
      const res = await searchBoomLiveContent(query);

      // ✅ सिर्फ UI message set करो, duplicate save मत करो
      if (!res.found) {
        setNoAnswerMsg("Your question has been saved. No answer found, but we will research it.");
      }

      setResult(res);
    } catch (error) {
      console.error("Error in handleAnalyze:", error);
      setResult({
        found: false,
        error: true,
        answer: "Something went wrong. Please try again.",
        articles: []
      });
    } finally {
      setLoading(false);
    }
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
        noAnswerMsg={noAnswerMsg}
      />
      <AnalyticsSection
        data={result && result.analytics ? result.analytics : []}
        loading={loading}
      />
      <StoriesSection />
      <ScamTypesSection />
      <button
        className="report-btn-float"
        onClick={() => setShowReport(true)}
        aria-label="Report Scam"
      >
        <i className="fas fa-plus"></i>
      </button>
      {showReport && <ReportScamModal onClose={() => setShowReport(false)} />}
    </>
  );
}

export default App;
export { BOOMLIVE_WHATSAPP };
