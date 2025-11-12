import React, { useState } from "react";
import WebsiteCheckReport from "./WebsiteCheckReport";
import "./WebsiteCheckSection.css";

const WebsiteCheckSection = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!url) {
      setError("Please enter a website URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://qs0ks48sscgg0gs4wk4k08g0.vps.boomlive.in/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );
      const data = await res.json();
      if (data && data.prediction) {
        setResult(data.prediction);
      } else {
        setError("Could not check the website. Try again!");
      }
    } catch {
      setError("API error. Please retry.");
    }
    setLoading(false);
  };

  return (
    <section
      className="website-check-section"
      style={{
        background: "#fff",
        padding: "3rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontWeight: "bold",
          fontSize: "3rem",
          textAlign: "center",
          margin: 0,
          color: "#000",
          letterSpacing: "-1px",
        }}
      >
        Check a website:
      </h1>
      <p
        style={{
          margin: "1rem 0 2rem",
          textAlign: "center",
          fontSize: "1.3rem",
          color: "#000",
        }}
      >
        Check if a website or link is a scam, phishing or legit…
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "2rem",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <input
          type="text"
          placeholder="www.boomlive.in"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: "1rem",
            fontSize: "1.1rem",
            borderRadius: "30px 0 0 30px",
            border: "2px solid #2563eb",
            borderRight: "none",
            outline: "none",
            background: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "0 30px 30px 0",
            padding: "12px 1.5rem",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ➔
        </button>
      </form>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "3rem",
          flexWrap: "wrap",
        }}
      >
        {/* <button
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            padding: "10px 20px",
            fontSize: "1.17rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.19s",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            justifyContent: "center",
          }}
        >
          About this service
        </button>
        <button
          style={{
                border: "2px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    borderRadius: "10px",
    padding: "10px 20px",
    fontSize: "1.17rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    justifyContent: "center",
          }}
        >
          Disclaimer
        </button> */}
      </div>
      {loading && (
        <p style={{ color: "#2563eb", fontWeight: "bold" }}>Checking URL...</p>
      )}
      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}
      {/* FINAL: output just one report component */}
      {result && <WebsiteCheckReport prediction={result} />}
    </section>
  );
};

export default WebsiteCheckSection;
