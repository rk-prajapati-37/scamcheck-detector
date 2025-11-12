import React, { useState } from 'react';
import './AIScamAnalyzer.css';

export default function AIScamAnalyzer() {
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'text'
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlExample = 'https://gifttowallet.com';
  const textExample =
    'Your parcel delivery has been attempted for the 2nd time please confirm your details or your item will be returned: https://indiapots.com/in';

  // Extract URL from text
  const extractURL = (str) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = str.match(urlRegex);
    return matches ? matches[0] : null;
  };

  // Get risk level badge color
  const getRiskBadgeColor = (riskLevel) => {
    const colors = {
      SAFE: '#10b981',
      LOW: '#f59e0b',
      MEDIUM: '#f97316',
      HIGH: '#ef4444',
      CRITICAL: '#dc2626'
    };
    return colors[riskLevel] || '#6b7280';
  };

  // Get risk emoji
  const getRiskEmoji = (riskLevel) => {
    const emojis = {
      SAFE: '🟢',
      LOW: '🟡',
      MEDIUM: '🟠',
      HIGH: '🔴',
      CRITICAL: '🔥'
    };
    return emojis[riskLevel] || '⚪';
  };

  const handleAnalyze = async () => {
    let urlToCheck = null;

    if (activeTab === 'url') {
      if (!urlInput.trim()) {
        setError('Please enter a URL to check');
        setResult(null);
        return;
      }
      urlToCheck = urlInput.trim();
    } else {
      if (!textInput.trim()) {
        setError('Please paste suspicious content to analyze');
        setResult(null);
        return;
      }
      urlToCheck = extractURL(textInput);
      if (!urlToCheck) {
        setError('No URL found in your text. Please paste a message with a URL.');
        setResult(null);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        'https://qs0ks48sscgg0gs4wk4k08g0.vps.boomlive.in/predict',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: urlToCheck })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.prediction);
      setError(null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setTextInput('');
    setResult(null);
    setError(null);
  };

  return (
    <section className="ai-analyzer">
      <div className="ai-card">
        {/* Tabs */}
        <div className="ai-tabs">
          <button
            className={`ai-tab ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('url');
              handleClear();
            }}
          >
            🌐 Quick check for scams
          </button>
          <button
            className={`ai-tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('text');
              handleClear();
            }}
          >
            📝 AI Scam Analyzer
          </button>
        </div>

        {/* URL Tab */}
        {activeTab === 'url' && (
          <>
            <div className="ai-url-input-wrapper">
              <span className="ai-search-icon">🔍</span>
              <input
                type="text"
                className="ai-url-input"
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>

            <div className="ai-url-examples">
              <span className="ai-examples-label">Example :</span>
              <span className="ai-example-badge">🌐 Website</span>
              <span className="ai-example-badge">📱 Phone</span>
              <span className="ai-example-badge">💰 Crypto</span>
              <span className="ai-example-badge">🏦 IBAN</span>
            </div>
          </>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <>
            <h2 className="ai-title">AI Scam Analyzer</h2>
            <p className="ai-sub">Paste suspicious content for instant threat assessment</p>

            <div className="ai-example" onClick={() => setTextInput(textExample)}>
              <div className="ai-example-label">💡 Try this example:</div>
              <div className="ai-example-box">{textExample}</div>
              <div className="ai-example-hint">Click the message above to analyze it</div>
            </div>

            <textarea
              className="ai-textarea"
              placeholder="Paste suspicious messages, links, phone numbers, or describe what happened here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </>
        )}

        {error && <div className="ai-error">{error}</div>}

        {result && (
          <div className="ai-result">
            <div className="ai-result-header">
              <div className="ai-risk-badge" style={{ backgroundColor: getRiskBadgeColor(result.RISK_LEVEL) }}>
                {getRiskEmoji(result.RISK_LEVEL)} {result.RISK_LEVEL}
              </div>
              <div className="ai-score">
                Score: <strong>{result.SCORE}</strong>
              </div>
            </div>

            <div className="ai-details">
              <div className="ai-detail-row">
                <span className="ai-detail-label">Confidence:</span>
                <span className="ai-detail-value">{result.CONFIDENCE}%</span>
              </div>
              <div className="ai-detail-row">
                <span className="ai-detail-label">Checks Completed:</span>
                <span className="ai-detail-value">{result.checks_completed}</span>
              </div>

              <div className="ai-flags">
                {result.isTemporaryDomain && <span className="ai-flag-badge warning">⚠️ Temporary Domain</span>}
                {result.hasMaliciousExtension && <span className="ai-flag-badge danger">⛔ Malicious Extension</span>}
                {result.isDirectIP && <span className="ai-flag-badge warning">🔗 Direct IP</span>}
                {result.InURLVoidBlackList && <span className="ai-flag-badge danger">🚫 URLVoid Blacklist</span>}
                {result.InURLHaus && <span className="ai-flag-badge danger">⛔ URLhaus Listed</span>}
                {!result.isHTTPS && <span className="ai-flag-badge warning">🔓 No HTTPS</span>}
                {!result.hasSSLCertificate && <span className="ai-flag-badge warning">🔐 No SSL</span>}
                {result.GoogleSafePassed && <span className="ai-flag-badge safe">✅ Google Safe</span>}
                {result.InTop1Million && <span className="ai-flag-badge safe">⭐ Top 1M Domain</span>}
              </div>
            </div>
          </div>
        )}

        <div className="ai-actions">
          <button
            className="ai-btn ai-search"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? '⏳ Analyzing...' : '🔍 Search'}
          </button>
          <button
            className="ai-btn ai-clear"
            onClick={handleClear}
            aria-label="Clear"
          >
            ✖ Clear
          </button>
        </div>
      </div>
    </section>
  );
}
