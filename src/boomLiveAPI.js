// src/api/boomLiveAPI.js

const BOOMLIVE_API_URL = "https://a8c4cosco0wc0gg8s40w8kco.vps.boomlive.in/scam-check";
const SCAMCHECK_ARTICLES_EXTRACTOR = "https://microservices.coolify.vps.boomlive.in/api/extract-scamcheck-articles";
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwApm4wanFbc8Pb-cxecxOHHosSBkx6h5KtcADyoWasa439nAdZc9Bnvvu2HpfcC5aCCg/exec";
const STORIES_API_URL = "https://microservices.coolify.vps.boomlive.in/api/scamcheck/articles";

// Basic stopwords - extend as needed
const STOPWORDS = new Set([
  'the','is','in','at','which','on','a','an','and','or','to','for','of','with','through','via','from','by','that','this','these','those','are','be','was','were','it'
]);

// Extract keywords from a sentence: tokenize, remove stopwords, non-alpha, and keep top N unique tokens
const extractKeywords = (text, maxKeywords = 5) => {
  if (!text || typeof text !== 'string') return [];

  // Normalize and split by non-word characters
  const tokens = text
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  // Count frequency
  const freq = {};
  for (const t of tokens) {
    if (t.length < 2) continue;
    if (STOPWORDS.has(t)) continue;
    if (/^\d+$/.test(t)) continue;
    freq[t] = (freq[t] || 0) + 1;
  }

  // Sort tokens by frequency then length (longer first)
  const sorted = Object.keys(freq).sort((a, b) => {
    if (freq[b] !== freq[a]) return freq[b] - freq[a];
    return b.length - a.length;
  });

  return sorted.slice(0, maxKeywords);
};

// Fetch additional stories from the Stories API to pad results when extractor returns few
const fetchAdditionalStories = async (keywords = [], need = 4) => {
  try {
    if (!Array.isArray(keywords) || keywords.length === 0) return [];
    const body = {
      tags: undefined,
      timeFilter: 'all-time',
      searchText: keywords.join(' '),
      startIndex: 0,
      count: Math.max(need, 4)
    };
    const resp = await fetch(STORIES_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) return [];
    const json = await resp.json();
    if (!json || !json.success || !Array.isArray(json.articles)) return [];

    // Normalize results into { url, heading, description, thumbUrl }
    const out = json.articles.map(a => {
      // story may be in shape { url, data } or { url, heading, description }
      if (!a) return null;
      if (a.data) {
        const d = a.data;
        return {
          url: a.url || d.url,
          heading: d.heading || d.title || d.heading,
          description: d.description || d.summary || d.excerpt || '',
          thumbUrl: d.thumbUrl || d.image || d.thumb || null,
        };
      }
      return {
        url: a.url || a.link || '#',
        heading: a.heading || a.title || '',
        description: a.description || a.summary || '',
        thumbUrl: a.thumbUrl || a.image || null,
      };
    }).filter(Boolean);

    return out;
  } catch (e) {
    console.warn('⚠️ fetchAdditionalStories failed', e);
    return [];
  }
};

// Build n-grams (bigrams) from tokens
const buildNGrams = (tokens, n = 2) => {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    out.push(tokens.slice(i, i + n).join(' '));
  }
  return out;
};

// Try progressive strategies: full phrase, bigrams, then single tokens; aggregate up to `need` articles
const tryFetchWithStrategies = async (keywords = [], need = 4) => {
  const aggregated = [];
  const seen = new Set();

  if (!Array.isArray(keywords) || keywords.length === 0) return aggregated;

  const strategies = [];
  // 1) full phrase
  strategies.push([keywords.join(' ')]);
  // 2) bigrams
  const bigrams = buildNGrams(keywords, 2);
  if (bigrams.length > 0) strategies.push(bigrams);
  // 3) single tokens
  strategies.push(keywords.slice());

  for (const strat of strategies) {
    for (const q of strat) {
      if (aggregated.length >= need) break;
      try {
        const results = await fetchAdditionalStories([q], need - aggregated.length);
        for (const r of results) {
          if (r && r.url && !seen.has(r.url)) {
            aggregated.push(r);
            seen.add(r.url);
            if (aggregated.length >= need) break;
          }
        }
      } catch (e) {
        console.warn('⚠️ tryFetchWithStrategies query failed:', q, e);
      }
    }
    if (aggregated.length >= need) break;
  }

  return aggregated;
};

// Fetch a batch of recent stories (no searchText) for client-side filtering fallback
const fetchRecentStories = async (count = 50) => {
  try {
    const body = { startIndex: 0, count };
    const resp = await fetch(STORIES_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) return [];
    const json = await resp.json();
    if (!json || !json.success || !Array.isArray(json.articles)) return [];
    return json.articles;
  } catch (e) {
    console.warn('⚠️ fetchRecentStories failed', e);
    return [];
  }
};

// Client-side filter: return up to `need` articles that contain any keyword or bigram in title/description
const filterArticlesByKeywords = (articlesBatch = [], keywords = [], need = 4) => {
  if (!Array.isArray(articlesBatch) || articlesBatch.length === 0) return [];
  if (!Array.isArray(keywords) || keywords.length === 0) return [];

  const kws = keywords.map(k => k.toLowerCase());
  const bigrams = buildNGrams(kws, 2);
  const allChecks = [...bigrams, ...kws];

  const matches = [];
  const seen = new Set();

  for (const a of articlesBatch) {
    if (!a) continue;
    const d = a.data || a;
    const title = String(d.heading || d.title || '').toLowerCase();
    const desc = String(d.description || d.summary || '').toLowerCase();
    const text = `${title} ${desc}`;

    let matched = false;
    for (const c of allChecks) {
      if (!c) continue;
      if (text.includes(c)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      const url = a.url || d.url || '#';
      if (!seen.has(url)) {
        matches.push({
          url,
          heading: d.heading || d.title || '',
          description: d.description || d.summary || '',
          thumbUrl: d.thumbUrl || d.image || null
        });
        seen.add(url);
        if (matches.length >= need) break;
      }
    }
  }

  return matches.slice(0, need);
};

// Detect generic 'no information' texts returned by backend so we can retry with keywords
const isGenericNoInfoText = (text) => {
  if (!text || typeof text !== 'string') return false;
  const s = text.toLowerCase();
  const patterns = [
    'no specific information',
    "we couldn't find specific stories",
    'no information found',
    'no specific stories',
    'no related stories',
    'no matching stories'
  ];
  return patterns.some(p => s.includes(p));
};

export const searchBoomLiveContent = async (query, options = {}) => {
  let shouldSaveToSheet = false;
  let saveReason = "";
  let suggestedKeywords = [];
  
  try {
    console.log("🔍 Searching BoomLive for:", query);
    // Primary search attempt with the full query
    const doSearch = async (q) => {
      const resp = await fetch(BOOMLIVE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!resp.ok) {
        throw new Error(`BoomLive API returned status ${resp.status}`);
      }
      return resp.json();
    };

    let responseData = await doSearch(query);

    let data = responseData;
  console.log("📦 BoomLive Response (initial):", data);

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
            // If extractor returned fewer than 4 articles, try to pad with Stories API results
            if (articles.length < 4) {
              try {
                  const needed = 4 - articles.length;
                  const extractedKeywords = extractKeywords(query, 6);
                  let extra = await tryFetchWithStrategies(extractedKeywords, needed);
                  // If strategies returned nothing, try client-side filtering on recent stories
                  if ((!extra || extra.length === 0) && extractedKeywords.length > 0) {
                    console.log('ℹ️ Strategies yielded no results; fetching recent stories for client-side filter fallback');
                    const recent = await fetchRecentStories(60);
                    extra = filterArticlesByKeywords(recent, extractedKeywords, needed);
                    console.log('ℹ️ Client-side fallback found:', extra.length);
                  }
                // merge unique by url
                const existingUrls = new Set(articles.map(a => a.url));
                for (const e of extra) {
                  if (e && e.url && !existingUrls.has(e.url)) {
                    articles.push({
                      url: e.url,
                      heading: e.heading,
                      description: e.description,
                      thumbUrl: e.thumbUrl,
                    });
                    existingUrls.add(e.url);
                    if (articles.length >= 4) break;
                  }
                }
                console.log('ℹ️ Padded articles with Stories API:', extra.length, 'added -> total', articles.length);
              } catch (padErr) {
                console.warn('⚠️ Failed to pad articles:', padErr);
              }
            }
          }
        }
      } catch (extractorError) {
        console.warn("⚠️ Article extractor failed:", extractorError);
      }
    }

    // If extractor did not return any articles, try fetching from Stories API directly using keywords
    if ((!articles || articles.length === 0) && (!sourceUrls || sourceUrls.length === 0)) {
      try {
        const fallbackKeywords = extractKeywords(query, 6);
        if (fallbackKeywords && fallbackKeywords.length > 0) {
          console.log('🔎 Extractor returned nothing — trying Stories API fallback with keywords:', fallbackKeywords.join(' '));
          const padded = await fetchAdditionalStories(fallbackKeywords, 4);
          if (padded && padded.length > 0) {
            articles = padded.map(a => ({
              url: a.url,
              heading: a.heading,
              description: a.description,
              thumbUrl: a.thumbUrl,
            }));
            suggestedKeywords = fallbackKeywords.slice();
            console.log('✅ Fallback Stories API returned articles:', articles.length);
          }
        }
      } catch (fbErr) {
        console.warn('⚠️ Stories API fallback failed:', fbErr);
      }
    }

    // Check if we have meaningful answer
    const responseText = (data.response || "").trim();
    let hasAnswer = responseText.length > 0;
    if (hasAnswer && isGenericNoInfoText(responseText)) {
      console.log('ℹ️ Backend returned generic no-info text; treating as NO answer to trigger retry');
      hasAnswer = false;
    }
    const hasArticles = articles.length > 0;

    console.log("✅ hasAnswer:", hasAnswer);
    console.log("✅ hasArticles:", hasArticles);

    // If nothing meaningful was found, try a keyword-focused retry.
    if (!hasAnswer && !hasArticles) {
      console.log("🔁 No direct match - attempting keyword extraction and retry...");
  const keywords = extractKeywords(query, 6);
  suggestedKeywords = keywords.slice();
      if (keywords && keywords.length > 0) {
        const keywordQuery = keywords.join(" ");
        console.log("🔎 Retrying with keywords:", keywordQuery);

        try {
          const retryData = await doSearch(keywordQuery);
          console.log("📦 BoomLive Response (retry):", retryData);

          // attempt to extract articles from retry response
          const retrySourceUrls = retryData.sources_url || [];
          let retryArticles = [];

          if (retrySourceUrls.length > 0) {
            try {
              const extractorResponse = await fetch(SCAMCHECK_ARTICLES_EXTRACTOR, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: retrySourceUrls }),
              });

              if (extractorResponse.ok) {
                const extractorData = await extractorResponse.json();
                if (extractorData.success && Array.isArray(extractorData.results)) {
                  retryArticles = extractorData.results
                    .filter((item) => item.success && item.data)
                    .map(({ url, data }) => ({
                      url,
                      heading: data.heading,
                      description: data.description,
                      thumbUrl: data.thumbUrl,
                      date_news: data.date_news,
                      date_created: data.date_created,
                      publishDate: data.publishDate,
                      createdDate: data.createdDate,
                      tags: data.tags || data.news_tags || "",
                      author: data.source || data.author || "BoomLive",
                    }));
                }
              }
            } catch (extractorError) {
              console.warn("⚠️ Article extractor failed on retry:", extractorError);
            }
          }

          // If retry produced results, replace data/articles
          const retryResponseText = (retryData.response || "").trim();
          const retryHasAnswer = retryResponseText.length > 0;
          const retryHasArticles = retryArticles.length > 0;

            if (retryHasAnswer || retryHasArticles) {
            console.log("✅ Retry produced results - using retry response");
            data = retryData;
            articles = retryArticles;
          } else {
              console.log("❌ Retry did not find anything relevant - attempting Stories API fallback with retry keywords");
              // Attempt stories API fallback using retry keywords
              try {
                const retryKeywords = extractKeywords(keywordQuery, 6);
                let paddedRetry = await tryFetchWithStrategies(retryKeywords, 4);
                if ((!paddedRetry || paddedRetry.length === 0) && retryKeywords.length > 0) {
                  console.log('ℹ️ Retry strategies empty; trying client-side recent stories filter');
                  const recent = await fetchRecentStories(60);
                  paddedRetry = filterArticlesByKeywords(recent, retryKeywords, 4);
                  console.log('ℹ️ Client-side retry fallback found:', paddedRetry.length);
                }
                if (paddedRetry && paddedRetry.length > 0) {
                  articles = paddedRetry.map(a => ({ url: a.url, heading: a.heading, description: a.description, thumbUrl: a.thumbUrl }));
                  suggestedKeywords = retryKeywords.slice();
                  console.log('✅ Stories API fallback returned articles after retry:', articles.length);
                } else {
                  console.log('❌ Stories API fallback also returned nothing');
                  shouldSaveToSheet = true;
                  saveReason = "No response from BoomLive API after retry";
                }
              } catch (fbErr) {
                console.warn('⚠️ Stories API fallback after retry failed:', fbErr);
                shouldSaveToSheet = true;
                saveReason = "No response from BoomLive API after retry";
              }
          }
        } catch (retryError) {
          console.warn("⚠️ Retry search failed:", retryError);
          shouldSaveToSheet = true;
          saveReason = `Search retry error: ${retryError.message}`;
        }
      } else {
        console.log("⚠️ No keywords extracted - will save unanswered");
        shouldSaveToSheet = true;
        saveReason = "No keywords extracted from query";
      }
    } else {
      console.log("✅ Answer or articles found on initial search - NOT saving to sheet");
    }

    // Recompute final text/flags in case retry replaced `data` or `articles`
    const finalResponseText = (data.response || "").trim();
    const finalHasAnswer = finalResponseText.length > 0;
    const finalHasArticles = Array.isArray(articles) && articles.length > 0;

    return {
      found: finalHasAnswer || finalHasArticles,
      answer: finalResponseText || "<b>No Specific Information Found</b> <br/> We couldn't find specific stories matching your input, but please be cautious. Do not click on suspicious links or share personal information. Our team will investigate this content from our end and update our database if it's a known scam.",
      articles,
      suggestedKeywords,
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
    // allow callers to skip saving for automatic follow-up retries
    if (shouldSaveToSheet && !options.skipSave) {
      console.log("💾 Saving to Google Sheet...");
      await saveUnansweredQuestion({
        query,
        category: "unanswered",
        reason: saveReason,
      });
    } else if (shouldSaveToSheet && options.skipSave) {
      console.log('ℹ️ Skipping save to sheet due to options.skipSave');
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
