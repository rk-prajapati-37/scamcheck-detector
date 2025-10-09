// src/api/boomLiveAPI.js

const BOOMLIVE_API_URL = "https://a8c4cosco0wc0gg8s40w8kco.vps.boomlive.in/scam-check";
const SCAMCHECK_ARTICLES_EXTRACTOR = "https://microservices.coolify.vps.boomlive.in/api/extract-scamcheck-articles";
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwApm4wanFbc8Pb-cxecxOHHosSBkx6h5KtcADyoWasa439nAdZc9Bnvvu2HpfcC5aCCg/exec";

export const searchBoomLiveContent = async (query) => {
  let shouldSaveToSheet = false;
  let saveReason = "";
  
  try {
    console.log("🔍 Searching BoomLive for:", query);
    
    const response = await fetch(BOOMLIVE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`BoomLive API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 BoomLive Response:", data);

    const sourceUrls = data.sources_url || [];
    let articles = [];

    // Extract articles if URLs exist
    if (sourceUrls.length > 0) {
      try {
        const extractorResponse = await fetch(SCAMCHECK_ARTICLES_EXTRACTOR, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: sourceUrls }),
        });

        if (extractorResponse.ok) {
          const extractorData = await extractorResponse.json();
          console.log("📦 Extractor Response:", extractorData); // Debug log
          
          if (extractorData.success && Array.isArray(extractorData.results)) {
            articles = extractorData.results
              .filter((item) => item.success && item.data)
              .map(({ url, data }) => ({
                url,
                heading: data.heading,
                description: data.description,
                thumbUrl: data.thumbUrl,
                // ✅ Add all date fields
                date_news: data.date_news,
                date_created: data.date_created,
                publishDate: data.publishDate,
                createdDate: data.createdDate,
                // ✅ Add tags for better categorization
                tags: data.tags || data.news_tags || "",
                // ✅ Add author
                author: data.source || data.author || "BoomLive",
              }));
            
            console.log("✅ Processed articles:", articles); // Debug log
          }
        }
      } catch (extractorError) {
        console.warn("⚠️ Article extractor failed:", extractorError);
      }
    }

    // Check if we have meaningful answer
    const responseText = (data.response || "").trim();
    const hasAnswer = responseText.length > 0;
    const hasArticles = articles.length > 0;

    console.log("✅ hasAnswer:", hasAnswer);
    console.log("✅ hasArticles:", hasArticles);

    // Determine if we should save to sheet
    if (!hasAnswer && !hasArticles) {
      shouldSaveToSheet = true;
      saveReason = "No response from BoomLive API";
      console.log("💾 No answer found - will save to sheet");
    } else {
      console.log("✅ Answer found - NOT saving to sheet");
    }

    return {
      found: hasAnswer || hasArticles,
      answer: responseText || "<b>No Specific Information Found</b> <br/> We couldn't find specific stories matching your input, but please be cautious. Do not click on suspicious links or share personal information. Our team will investigate this content from our end and update our database if it's a known scam.",
      articles,
    };

  } catch (error) {
    console.error("🚨 BoomLive API Error:", error);
    shouldSaveToSheet = true;
    saveReason = `API Error: ${error.message}`;

    return {
      found: false,
      error: true,
      answer: "<b>No Specific Information Found</b> <br/> We couldn't find specific stories matching your input, but please be cautious. Do not click on suspicious links or share personal information. Our team will investigate this content from our end and update our database if it's a known scam.",
      articles: [],
    };
  } finally {
    // Save to sheet ONCE at the end (if needed)
    if (shouldSaveToSheet) {
      console.log("💾 Saving to Google Sheet...");
      await saveUnansweredQuestion({
        query,
        category: "unanswered",
        reason: saveReason,
      });
    }
  }
};

export async function saveUnansweredQuestion(questionData) {
  try {
    console.log("📤 Sending to Google Sheet:", questionData);
    
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...questionData,
        source: "ScamCheck React App",
        timestamp: new Date().toISOString(),
      }),
    });

    console.log("✅ Request sent to Google Sheet");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Failed to save:", error);
    return { success: false };
  }
}
