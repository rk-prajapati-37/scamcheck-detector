const BOOMLIVE_API_URL = "https://a8c4cosco0wc0gg8s40w8kco.vps.boomlive.in/scam-check";
const SCAMCHECK_ARTICLES_EXTRACTOR = "https://microservices.coolify.vps.boomlive.in/api/extract-scamcheck-articles";
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw5eDiHWVL0KppVYR8tFzi8WWnqLl-DJPza0fmxhyjydonFxB7pT1x8fO_M5DvUGwWi/exec";

export const searchBoomLiveContent = async (query) => {
  try {
    const response = await fetch(BOOMLIVE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    const sourceUrls = data.sources_url || [];

    let articles = [];
    if (sourceUrls.length > 0) {
      const extractorResponse = await fetch(SCAMCHECK_ARTICLES_EXTRACTOR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: sourceUrls }),
      });

      if (extractorResponse.ok) {
        const extractorData = await extractorResponse.json();
        if (extractorData.success && Array.isArray(extractorData.results)) {
          articles = extractorData.results
            .filter(item => item.success && item.data)
            .map(({ url, data }) => ({
              url,
              heading: data.heading,
              description: data.description,
              thumbUrl: data.thumbUrl,
            }));
        }
      }
    }

    return {
      found: articles.length > 0,
      answer: data.response || "",
      articles,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      found: false,
      error: true,
      answer: "Unable to connect. Your question has been saved. Contact BoomLive.",
      articles: [],
    };
  }
};

export async function saveUnansweredQuestion(questionData) {
  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...questionData, source: "ScamCheck App", needsResearch: true }),
    });
  } catch (e) {
    console.error("Saving unanswered question failed:", e);
  }
}
