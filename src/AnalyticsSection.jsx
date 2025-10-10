import React, { useEffect, useRef } from 'react';
import './AnalyticsSection.css';

const AnalyticsSection = () => {
  const trendsChartRef = useRef(null);
  const distributionChartRef = useRef(null);
  const trendsChartInstance = useRef(null);
  const distributionChartInstance = useRef(null);

  useEffect(() => {
    if (window.Chart && trendsChartRef.current && distributionChartRef.current) {
      setTimeout(() => {
        // Destroy previous instances if present
        if (trendsChartInstance.current) {
          try { trendsChartInstance.current.destroy(); } catch (e) { /* ignore */ }
          trendsChartInstance.current = null;
        }
        if (distributionChartInstance.current) {
          try { distributionChartInstance.current.destroy(); } catch (e) { /* ignore */ }
          distributionChartInstance.current = null;
        }

        trendsChartInstance.current = new window.Chart(trendsChartRef.current, {
          type: 'line',
          data: {
            labels: ['Mar 1', 'Mar 5', 'Mar 10', 'Mar 15', 'Mar 20', 'Mar 25', 'Mar 30'],
            datasets: [{
              label: 'UPI/Payment Fraud',
              data: [45, 67, 89, 76, 95, 123, 108],
              borderColor: '#dc2626',
              backgroundColor: 'rgba(220,38,38,0.07)',
              tension: 0.38,
              pointRadius: 3,
              borderWidth: 2.5,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 18, font: { weight: 500, size: 15 } }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: { stepSize: 10, font: { weight: 500 } }
              },
              x: {
                grid: { color: '#f3f4f6' },
                ticks: { font: { weight: 500 } }
              }
            }
          }
        });

        distributionChartInstance.current = new window.Chart(distributionChartRef.current, {
          type: 'doughnut',
          data: {
            labels: ['UPI/Payment', 'Job Scams', 'Investment', 'Phishing', 'Tech', 'Other'],
            datasets: [{
              data: [35, 24, 18, 15, 5, 3],
              backgroundColor: ['#dc2626', '#ea580c', '#2563eb', '#16a34a', '#8b5cf6', '#6b7280'],
              borderWidth: 2,
              borderColor: "#fff"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "67%",
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 16, font: { size: 14 } }
              }
            }
          }
        });
      }, 400);
    }
    
    return () => {
      // cleanup
      try { if (trendsChartInstance.current) trendsChartInstance.current.destroy(); } catch (e) {}
      try { if (distributionChartInstance.current) distributionChartInstance.current.destroy(); } catch (e) {}
    };
  }, []);

  // **Function yahan define karo, return se pehle!**
  const handleAdvancedDashboard = () => {
    alert('Advanced analytics coming soon!');
  };

  return (
    <section id="analytics" className="analytics-section analytics">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Threat Analytics Dashboard</h2>
          <p className="section-subtitle">Real-time insights into scam patterns, trends, and our protection effectiveness</p>
        </div>

        {/* Dashboard Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value danger">1,247</div>
            <div className="metric-label">Active Threats</div>
            <div className="metric-change up">+23% this week</div>
          </div>
          <div className="metric-card">
            <div className="metric-value success">89,573</div>
            <div className="metric-label">Scams Blocked</div>
            <div className="metric-change down">+156% this month</div>
          </div>
          <div className="metric-card">
            <div className="metric-value primary">1.2s</div>
            <div className="metric-label">Avg Response Time</div>
            <div className="metric-change down">-0.3s improved</div>
          </div>
          <div className="metric-card">
            <div className="metric-value warning">7.4/10</div>
            <div className="metric-label">Current Risk Level</div>
            <div className="metric-change up">+0.2 from last week</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-container">
          <div className="chart">
            <div className="chart-header">
              <h3 className="chart-title">Scam Trends Over Time</h3>
              <div className="chart-subtitle">
                Daily detection counts by scam type (Last 30 days)
              </div>
            </div>
           <div className="chart-canvas">
  <canvas ref={trendsChartRef} />
</div>

          </div>
          <div className="chart">
            <div className="chart-header">
              <h3 className="chart-title">Scam Type Distribution</h3>
              <div className="chart-subtitle">
                Current threat landscape breakdown
              </div>
            </div>
            <div className="chart-canvas">
              <canvas ref={distributionChartRef} />
            </div>
          </div>
        </div>

        {/* Request Advanced Dashboard */}
        {/* <div className="analytics-cta-card">
          <h4>Want More Detailed Analytics?</h4>
          <p>Get access to advanced threat intelligence reports and customizable dashboards</p>
          <button className="btn btn-primary" onClick={handleAdvancedDashboard}>
            <i className="fas fa-chart-line"></i>
            Request Advanced Dashboard
          </button>
        </div> */}

      </div>
    </section>
  );
};

export default AnalyticsSection;
