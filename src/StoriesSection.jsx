import React, { useState, useEffect } from "react";
import useDragScroll from "./useDragScroll";
import "./StoriesSection.css";

const CATEGORY_MAP = {
  schemes: { tag: "Schemes Scam", icon: "💰", color: "#ef4444", slug: "schemes-scam" },
  finance: { tag: "Finance Scam", icon: "💳", color: "#dc2626", slug: "finance-scam" },
  romance: { tag: "Romance Scam", icon: "❤️", color: "#ec4899", slug: "romance-scam" },
  medical: { tag: "Medical Scam", icon: "🏥", color: "#10b981", slug: "medical-scam" },
  gift: { tag: "Gift Scam", icon: "🎁", color: "#8b5cf6", slug: "gift-scam" },
  digital: { tag: "Digital Arrest", icon: "📱", color: "#6366f1", slug: "digital-arrest" },
  phishing: { tag: "Phishing Scam", icon: "🔗", color: "#3b82f6", slug: "phishing-scam" },
  job: { tag: "Job Scam", icon: "💼", color: "#ea580c", slug: "job-scam" },
  scam: { tag: "Scam Alert", icon: "⚠️", color: "#f59e0b", slug: "scams" },
  all: { tag: "", icon: "", color: "#16a34a", slug: "" }
};

const CATEGORIES = [
  { bg: "#16a34a", key: "all", label: "All" },
  { bg: "linear-gradient(45deg,#dc2626,#ef4444)", key: "finance", label: "Finance Scam" },
  { bg: "linear-gradient(45deg,#ec4899,#f43f5e)", key: "romance", label: "Romance Scam" },
  { bg: "linear-gradient(45deg,#dc2626,#ef4444)", key: "schemes", label: "Schemes Scam" },
  { bg: "linear-gradient(45deg,#059669,#10b981)", key: "medical", label: "Medical Scam" },
  { bg: "linear-gradient(45deg,#7c3aed,#8b5cf6)", key: "gift", label: "Gift Scam" },
  { bg: "linear-gradient(45deg,#64748b,#6366f1)", key: "digital", label: "Digital Arrest" },
  { bg: "linear-gradient(45deg,#2563eb,#3b82f6)", key: "phishing", label: "Phishing Scam" },
  { bg: "linear-gradient(45deg,#fdba74,#ea580c)", key: "job", label: "Job Scam" }
];

const API_URL = "https://microservices.coolify.vps.boomlive.in/api/scamcheck/articles";

function getSolidColor(bg) {
  if (!bg) return "#aaa";
  if (!bg.startsWith("linear-gradient")) return bg;
  const match = bg.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1]}` : "#888";
}

function getCardCategory(storyData) {
  if (!storyData || !storyData.tags) return "scam";
  const tags = String(storyData.tags).toLowerCase();
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (key !== "scam" && key !== "all" && tags.includes(key)) return key;
  }
  if (tags.includes("scam")) return "scam";
  return "scam";
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString.replace(" ", "T"));
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

export default function StoriesSection() {
  const [stories, setStories] = useState([]);
  const [category, setCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all-time");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const count = 6;
  const timeMap = {
    today: "today",
    week: "this-week",
    month: "this-month",
    quarter: "last-3-months",
    "all-time": "all-time"
  };

  async function fetchStories(reset = false) {
    if (loading) return;
    setLoading(true);
    const tagFilters = category === "all" ? undefined : [CATEGORIES.find(c => c.key === category)?.label];
    const body = {
      tags: tagFilters,
      timeFilter: timeMap[timeFilter] || "all-time",
      searchText: searchText.trim() || undefined,
      startIndex: reset ? 0 : startIndex,
      count
    };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        if (reset) {
          setStories(data.articles);
          setStartIndex(count);
        } else {
          setStories(prev => [...prev, ...data.articles]);
          setStartIndex(prev => prev + count);
        }
        setHasMore(data.pagination?.hasMore ?? false);
      }
    } catch (e) {
      console.error("Stories fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStories(true);
    // eslint-disable-next-line
  }, [category, timeFilter, searchText]);

  const padStories = stories.length >= 3 ? stories : [
    ...stories,
    ...Array(3 - stories.length).fill(null)
  ];

  const categoryDragRef = useDragScroll();

  return (
    <section id="stories" className="stories-section stories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Fact-Checked Stories</h2>
          <p className="section-subtitle">Real cases where our AI helped prevent scams and verify threats</p>
        </div>
        
        <div className="filter-section">
          <div className="filter-header">
            <i className="fas fa-filter"></i> Filter Stories
          </div>
          <div className="filter-row">
            <div className="filter-group category-group">
              <label className="filter-label">Category</label>
              <div className="category-filters" ref={categoryDragRef}>
                {CATEGORIES.map(item =>
                  <button
                    key={item.key}
                    className={`category-btn${category === item.key ? " active" : ""}`}
                    onClick={() => setCategory(item.key)}
                    type="button"
                    style={{
                      background: category === item.key ? getSolidColor(item.bg) : "#f3f8fe",
                      color: category === item.key ? "#fff" : "#25263b",
                      borderColor: category === item.key ? getSolidColor(item.bg) : "#dbeafe"
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            </div>
            <div className="filter-group time-group">
              <label className="filter-label">Time Period</label>
              <select className="filter-select" value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
                <option value="all-time">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
            <div className="filter-group search-group">
              <label className="filter-label">Search Stories</label>
              <input
                type="text"
                className="filter-input"
                value={searchText}
                placeholder="Search by title or description..."
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="story-grid">
          {padStories.map((story, idx) => {
            if (!story) {
              return (
                <div
                  className="story-card"
                  style={{ boxShadow: "none", minHeight: "340px" }}
                  key={`empty-${idx}`}
                ></div>
              );
            }
            
            const d = story.data || story;
            const cat = getCardCategory(d);
            const categoryObj = CATEGORIES.find(c => c.key === cat);
            const categoryInfo = CATEGORY_MAP[cat] || CATEGORY_MAP.scam;
            const cardBg = categoryObj ? categoryObj.bg : "#f2f2f8";
            const url = story.url || d.url;
            const formattedDate = formatDate(d.publishDate || d.createdDate || d.date_news || d.date_created);
            const categoryUrl = `https://www.boomlive.in/tags/${categoryInfo.slug}`;
            const authorName = d.authorName || d.source || "BoomLive Team";

            return (
              <div key={url || idx} className="story-card-wrapper">
                <div className="story-card">
                  <div
                    className="story-card-top-link"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (url) window.open(url, '_blank', 'noopener'); }}
                    onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && url) window.open(url, '_blank', 'noopener'); }}
                  >
                    <div className="story-card-top" style={{ background: cardBg }}>
                      <a
                        href={categoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="story-card-tag"
                        style={{ background: getSolidColor(cardBg) }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {categoryObj?.label}
                      </a>
                      {d.thumbUrl && (
                        <img
                          src={d.thumbUrl}
                          alt={d.heading || ""}
                          className="story-thumb"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="story-card-content">
                    <a
                      href={url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="story-title-link"
                    >
                      <div className="story-card-title">{d.heading || "No title"}</div>
                    </a>
                    
                    <div className="story-card-desc">{d.description || ""}</div>
                    
                    <div className="story-card-footer">
                      <div className="footer-left">
                        <span className="footer-icon">👤</span>
                        <span className="footer-label">{authorName}</span>
                      </div>
                      {formattedDate && (
                        <span className="footer-date">📅 {formattedDate}</span>
                      )}
                    </div>
                    
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-report-btn"
                      >
                        Read Full Report →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && !loading &&
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-secondary" onClick={() => fetchStories(false)}>
              <i className="fas fa-plus"></i> Load More Stories
            </button>
          </div>
        }
        {loading && <div style={{ textAlign: "center", marginTop: 22 }}>Loading...</div>}
      </div>
    </section>
  );
}
