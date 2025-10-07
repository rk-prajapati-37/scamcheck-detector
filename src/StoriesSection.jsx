import React, { useState, useEffect } from "react";
import "./StoriesSection.css";

const CATEGORY_MAP = {
  schemes:    { bg: "linear-gradient(45deg,#dc2626,#ef4444)", icon: "fas fa-mobile-alt", tag: "Schemes Scam" },
  finance:    { bg: "linear-gradient(45deg,#dc2626,#ef4444)", icon: "fas fa-mobile-alt", tag: "Finance Scam" },
  romance:    { bg: "linear-gradient(45deg,#ec4899,#f43f5e)", icon: "fas fa-heart", tag: "Romance Scam" },
  medical:    { bg: "linear-gradient(45deg,#059669,#10b981)", icon: "fas fa-syringe", tag: "Medical Scam" },
  gift:       { bg: "linear-gradient(45deg,#7c3aed,#8b5cf6)", icon: "fas fa-gift", tag: "Gift Scam" },
  digital:    { bg: "linear-gradient(45deg,#64748b,#6366f1)", icon: "fas fa-shield-alt", tag: "Digital Arrest" },
  phishing:   { bg: "linear-gradient(45deg,#2563eb,#3b82f6)", icon: "fas fa-fish", tag: "Phishing Scam" },
  job:        { bg: "linear-gradient(45deg,#fdba74,#ea580c)", icon: "fas fa-user-tie", tag: "Job Scam" },
  scam:       { bg: "linear-gradient(45deg,#ef4444 60%,#dc2626 90%)", icon: "fas fa-exclamation-circle", tag: "Scam" },
  all:        { bg: "#f2f2f8", icon: "fas fa-globe", tag: "" }
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "finance", label: "Finance Scam" },
  { key: "romance", label: "Romance Scam" },
  { key: "schemes", label: "Schemes Scam" },
  { key: "medical", label: "Medical Scam" },
  { key: "gift", label: "Gift Scam" },
  { key: "digital", label: "Digital Arrest" },
  { key: "phishing", label: "Phishing Scam" },
  { key: "job", label: "Job Scam" }
];

const API_URL = "https://microservices.coolify.vps.boomlive.in/api/scamcheck/articles";

// --- Category detection: always matches lowercased keys only ---
function getCardCategory(storyData) {
  if (!storyData || !storyData.tags) return "scam";
  const tags = String(storyData.tags).toLowerCase();
  // Add all keys
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (key !== "scam" && key !== "all" && tags.includes(key)) return key;
  }
  if (tags.includes("scam")) return "scam";
  return "scam";
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

  // --- API-compatible time map (debugged/working with backend) ---
  const timeMap = {
    today: "today",
    week: "this-week",
    month: "this-month",
    quarter: "last-3-months",
    "all-time": "all-time"
  };

  // --- Fetch with safe fallback + loading ---
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

  // --- Always return at least 3 slots in grid for design ---
  const padStories = stories.length >= 3 ? stories : [
    ...stories,
    ...Array(3 - stories.length).fill(null)
  ];

  return (
    <section id="stories" className="stories">
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
              <div className="category-filters">
                {CATEGORIES.map(item =>
                  <button key={item.key}
                    className={`category-btn${category === item.key ? " active" : ""}`}
                    onClick={() => setCategory(item.key)}
                    type="button">
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
              // empty slot for design
              return (
                <div 
                  className="story-card"
                  style={{
                    background: "#f7f7fa",
                    border: "1.5px dashed #ececec",
                    boxShadow: "none",
                    minHeight: "340px"
                  }}
                  key={`empty-${idx}`}
                ></div>
              );
            }
            const d = story.data || story;
            const cat = getCardCategory(d);
            const style = CATEGORY_MAP[cat] || CATEGORY_MAP.scam;
            const url = story.url || d.url;

            return (
              <a
                key={url || idx}
                className="story-card"
                href={url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div className="story-card-top"
                  style={{
                    background: style.bg,
                    minHeight: "125px",
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                  {/* Tag top-left */}
                  <span className="story-card-tag" style={{
                    position: "absolute",
                    left: 18,
                    top: 15,
                    zIndex: 3
                  }}>{style.tag}</span>
                  {/* Icon center */}
                  <i className={style.icon} style={{
                    position: "relative",
                    zIndex: 2,
                    color: "white",
                    fontSize: "2.4em"
                  }} />
                  {/* Thumb image (background effect only!) */}
                  {d.thumbUrl && (
                    <img
                      src={d.thumbUrl}
                      alt={d.heading || ""}
                      className="story-thumb"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: "16px 16px 0 0",
                        opacity: 0.18,
                        zIndex: 1
                      }}
                    />
                  )}
                </div>
                <div className="story-card-content">
                  <div className="story-card-title">{d.heading || "No title"}</div>
                  <div className="story-card-desc">{d.description || ""}</div>
                  <div className="story-card-meta">
                    <span>
                      <i className="fas fa-user-circle" style={{ marginRight: 5 }}></i>
                      {d.authorName || "AI Detection Team"}
                    </span>
                    <span>
                      {(d.publishDate || d.createdDate)
                        ? new Date((d.publishDate || d.createdDate).replace(" ", "T"))
                            .toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })
                        : ""}
                    </span>
                  </div>
                </div>
              </a>
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
