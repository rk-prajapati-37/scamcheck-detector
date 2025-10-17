import React, { useState } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import AnalyticsSection from "./AnalyticsSection";
import StoriesSection from "./StoriesSection";
import ReportScamModal from "./ReportScamModal";
import ScamTypesSection from "./ScamTypesSection";
import { searchBoomLiveContent } from "./boomLiveAPI"; // ✅ Import updated function
import "./App.css";

const BOOMLIVE_WHATSAPP = "+91 77009 06588";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [noAnswerMsg, setNoAnswerMsg] = useState(null);

  // ✅ Simplified handleAnalyze - all logic is in boomLiveAPI.js
  const handleAnalyze = async (query) => {
    console.log('🚀 [App.handleAnalyze] Started with query:', query);
    
    setLoading(true);
    setResult(null);
    setNoAnswerMsg(null);

    try {
      // ✅ This function now handles everything: keyword extraction, retry logic, saving to sheet
  const res = await searchBoomLiveContent(query);
      console.log('📦 [App.handleAnalyze] Result:', res);

      // ✅ Set UI message if no results
      if (!res.found) {
        setNoAnswerMsg(
          "<h5><i class=\"fas fa-search\"></i> No Specific Information Found</h5>" +
          "<p>We couldn't find specific stories matching your input, but please be cautious. " +
          "Do not click on suspicious links or share personal information. " +
          "Our team will investigate this content from our end and update our database if it's a known scam.</p>"
        );
      }

      setResult(res);

      // If initial response returned suggested keywords but no articles, try an automatic follow-up
      if (!res.found && res.suggestedKeywords && res.suggestedKeywords.length > 0) {
        const ks = res.suggestedKeywords.join(' ');
        console.log('🔁 App: performing automatic follow-up search with suggested keywords:', ks);
        try {
          const follow = await searchBoomLiveContent(ks, { skipSave: true });
          console.log('📦 [App.followUp] Result:', follow);
          // If follow-up found articles or answer, update the result shown to user
          if (follow && (follow.found || (follow.articles && follow.articles.length > 0))) {
            setResult((prev) => ({ ...prev, ...follow }));
          }
        } catch (e) {
          console.warn('⚠️ Follow-up search failed:', e);
        }
      }

    } catch (error) {
      console.error("❌ [App.handleAnalyze] Error:", error);
      setResult({
        found: false,
        error: true,
        answer: "Something went wrong. Please try again.",
        articles: []
      });
      setNoAnswerMsg(
        "<h5><i class=\"fas fa-exclamation-triangle\"></i> Error</h5>" +
        "<p>Unable to process your request. Please try again later.</p>"
      );
    } finally {
      setLoading(false);
      console.log('✅ [App.handleAnalyze] Search completed');
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
                headline: result.answer || "Scam Information Found",
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
        suggestedKeywords={result && result.suggestedKeywords ? result.suggestedKeywords : []}
        loading={loading}
        noAnswerMsg={noAnswerMsg}
      />
      
      {/* <AnalyticsSection
        data={result && result.analytics ? result.analytics : []}
        loading={loading}
      /> */}
      
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
