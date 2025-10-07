import React, { useEffect, useMemo, useRef, useState } from "react";
import "./StatsSection.css";

// Helpers
const formatINRCompact = (num) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(num);

const useAnimatedNumber = (value, duration = 600) => {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    fromRef.current = display;
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(fromRef.current + (value - fromRef.current) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
};

const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalScansToday: 0,
    threatsBlocked: 0,
    moneySaved: 0,
    activeUsers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Animated values
  const scansAnim = useAnimatedNumber(stats.totalScansToday);
  const blockedAnim = useAnimatedNumber(stats.threatsBlocked);
  const usersAnim = useAnimatedNumber(stats.activeUsers);

  // Money saved rendered as Lakh compact text
  const moneySavedLakh = useMemo(
    () => (stats.moneySaved / 100000).toFixed(1),
    [stats.moneySaved]
  );

  useEffect(() => {
    // Initial populate
    setStats({
      totalScansToday: randomRange(8600, 9600),
      threatsBlocked: randomRange(2400, 2800),
      moneySaved: randomRange(1500000, 1800000),
      activeUsers: randomRange(360, 420)
    });
    setLastUpdated(new Date());

    // Refresh every 5s
    const interval = setInterval(() => {
      setStats({
        totalScansToday: randomRange(8600, 10200),
        threatsBlocked: randomRange(2300, 3000),
        moneySaved: randomRange(1500000, 2200000),
        activeUsers: randomRange(340, 480)
      });
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Create 7-day bar data
  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const gen = days.map((day) => ({
      day,
      phishing: randomRange(50, 160),
      financial: randomRange(40, 130),
      social: randomRange(30, 100),
      tech: randomRange(20, 90)
    }));
    setChartData(gen);
  }, []);

  const scamTypes = [
    { name: "Financial Fraud", percentage: 35, color: "#ef4444" },
    { name: "Phishing", percentage: 28, color: "#3b82f6" },
    { name: "Social Engineering", percentage: 22, color: "#f59e0b" },
    { name: "Tech Support", percentage: 15, color: "#10b981" }
  ];

  const lastUpdatedText = useMemo(
    () =>
      lastUpdated.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [lastUpdated]
  );

  return (
    <section className="stats-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Real-time Insights</h2>
            <p>Live insights into scam patterns, trends, and our protection effectiveness</p>
          </div>
          <div className="updated-pill" aria-label="Last updated time">
            <i className="fas fa-clock" aria-hidden="true"></i>
            <span>Updated {lastUpdatedText}</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-blue"><i className="fas fa-search"></i></div>
            <div className="stat-content">
              <h3>{formatINRCompact(scansAnim)}</h3>
              <p>Scans Today</p>
              <span className="stat-change positive">+12% from yesterday</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-green"><i className="fas fa-shield-alt"></i></div>
            <div className="stat-content">
              <h3>{formatINRCompact(blockedAnim)}</h3>
              <p>Threats Blocked</p>
              <span className="stat-change positive">+8% this week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-amber"><i className="fas fa-rupee-sign"></i></div>
            <div className="stat-content">
              <h3>₹{moneySavedLakh}L</h3>
              <p>Money Saved</p>
              <span className="stat-change positive">+25% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-purple"><i className="fas fa-users"></i></div>
            <div className="stat-content">
              <h3>{formatINRCompact(usersAnim)}</h3>
              <p>Active Users</p>
              <span className="stat-change live-dot">Online now</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          {/* Bars */}
          <div className="chart-card">
            <h3>Daily Detection Counts (Last 7 Days)</h3>
            <div className="bar-chart" role="img" aria-label="Bar chart of daily detections by type">
              {chartData.map((item, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="chart-bars">
                    <div className="chart-bar phishing" style={{ height: `${item.phishing}px` }}>
                      <span className="bar-tip">Phishing: {item.phishing}</span>
                    </div>
                    <div className="chart-bar financial" style={{ height: `${item.financial}px` }}>
                      <span className="bar-tip">Financial: {item.financial}</span>
                    </div>
                    <div className="chart-bar social" style={{ height: `${item.social}px` }}>
                      <span className="bar-tip">Social: {item.social}</span>
                    </div>
                    <div className="chart-bar tech" style={{ height: `${item.tech}px` }}>
                      <span className="bar-tip">Tech: {item.tech}</span>
                    </div>
                  </div>
                  <span className="chart-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut legend */}
          <div className="chart-card">
            <h3>Current Threat Landscape</h3>
            <div className="donut-wrap">
              {scamTypes.map((type, i) => (
                <div key={i} className="donut-item">
                  <div className="donut">
                    <svg viewBox="0 0 36 36" className="donut-svg">
                      <path
                        className="donut-ring"
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="transparent"
                        stroke="#eef2ff"
                        strokeWidth="3.5"
                      />
                      <path
                        className="donut-segment"
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="transparent"
                        stroke={type.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${type.percentage} ${100 - type.percentage}`}
                        strokeDashoffset="25" />
                      <text x="18" y="20.35" className="donut-text">{type.percentage}%</text>
                    </svg>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: type.color }} />
                    <span className="legend-label">{type.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="premium-cta">
          <div className="cta-content">
            <h3>Want More Detailed Analytics?</h3>
            <p>Get access to advanced threat intelligence reports and customizable dashboards</p>
            <button className="btn-premium">
              <i className="fas fa-crown"></i>
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
