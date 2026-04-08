const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

let latestData = {
  distance1: 0,
  distance2: 0,
  rain: 0,
  pulse: 0,
  air: 0
};

// ================= TELEGRAM CONFIG =================

const BOT = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.CHAT_ID;

// ================= GET LOCATION FROM SERVER A =================

async function getLatestLocation() {
  try {
    const res = await axios.get("http://localhost:5000/api/latest-location");
    return res.data;
  } catch (err) {
    console.log("Location server not reachable");
    return null;
  }
}

// ================= SEND TELEGRAM ALERT =================

async function sendAlert(message) {
  try {
    const location = await getLatestLocation();
    let text = message;
    if (location) {
      text += `\n\nLocation:\nhttps://www.google.com/maps?q=${location.latitude},${location.longitude}\n\nTimestamp:\n${location.timestamp}`;
    }
    const url = `https://api.telegram.org/bot${BOT}/sendMessage`;
    await axios.post(url, { chat_id: CHAT, text });
    console.log("Telegram alert sent");
  } catch (err) {
    console.log("Telegram error");
  }
}

// ================= RECEIVE SENSOR DATA =================

app.post("/sensor", async (req, res) => {
  latestData = req.body;
  console.log("Received:", latestData);

  const { distance1, distance2, pulse } = latestData;

  if (pulse > 130 || pulse < 40) {
    sendAlert("🚨 MEDICAL EMERGENCY\n\nPulse rate abnormal.\n\nImmediate attention required.");
  }

  if (distance1 < 50 || distance2 < 50) {
    sendAlert("⚠ ACCIDENT ALERT\n\nPossible collision detected.\nUltrasonic sensor distance < 50 cm.\n\nBike may be damaged.");
  }

  res.send({ status: "ok" });
});

// ================= DASHBOARD API =================

app.get("/sensor", (req, res) => {
  res.json(latestData);
});

// ================= DASHBOARD PAGE =================

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Bike Monitoring Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
    padding: 24px;
  }

  h1 {
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .subtitle {
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 24px;
  }

  /* ---- SENSOR CARDS (side by side) ---- */
  .cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .card {
    background: #1e293b;
    border-radius: 12px;
    padding: 18px 16px;
    text-align: center;
    border: 1px solid #334155;
  }

  .card-label {
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 26px;
    font-weight: 700;
    color: #f1f5f9;
    transition: color 0.3s;
  }

  .card-value.alert {
    color: #f87171;
  }

  .card-unit {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }

  /* ---- LIVE GRAPHS (side by side) ---- */
  .graphs {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 32px;
  }

  .graph-card {
    background: #1e293b;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #334155;
  }

  .graph-title {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .graph-card canvas {
    width: 100% !important;
  }

  /* ---- DESCRIPTION ---- */
  .description {
    background: #1e293b;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #334155;
    max-width: 900px;
    margin: 0 auto;
    line-height: 1.7;
    color: #cbd5e1;
  }

  .description h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #f1f5f9;
  }

  .description p {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .description p:last-child {
    margin-bottom: 0;
  }

  /* ---- STATUS BAR ---- */
  .status-bar {
    text-align: center;
    font-size: 12px;
    color: #475569;
    margin-bottom: 20px;
  }

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    margin-right: 6px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @media (max-width: 900px) {
    .cards, .graphs { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 600px) {
    .cards, .graphs { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<h1>Smart Bike Monitoring System</h1>
<p class="subtitle">Vehicle ID: TN-07-CB-7741</p>

<div class="status-bar">
  <span class="status-dot"></span>Live — updating every 2 seconds
</div>

<!-- SENSOR CARDS -->
<div class="cards">
  <div class="card">
    <div class="card-label">Distance 1</div>
    <div class="card-value" id="d1">--</div>
    <div class="card-unit">cm</div>
  </div>
  <div class="card">
    <div class="card-label">Distance 2</div>
    <div class="card-value" id="d2">--</div>
    <div class="card-unit">cm</div>
  </div>
  <div class="card">
    <div class="card-label">Rain</div>
    <div class="card-value" id="rain">--</div>
    <div class="card-unit">%</div>
  </div>
  <div class="card">
    <div class="card-label">Pulse</div>
    <div class="card-value" id="pulse">--</div>
    <div class="card-unit">bpm</div>
  </div>
  <div class="card">
    <div class="card-label">Air Quality</div>
    <div class="card-value" id="air">--</div>
    <div class="card-unit">AQI</div>
  </div>
</div>

<!-- LIVE GRAPHS -->
<div class="graphs">
  <div class="graph-card">
    <div class="graph-title">Distance 1 (cm)</div>
    <div style="height:90px; position:relative">
      <canvas id="chart-d1"></canvas>
    </div>
  </div>
  <div class="graph-card">
    <div class="graph-title">Distance 2 (cm)</div>
    <div style="height:90px; position:relative">
      <canvas id="chart-d2"></canvas>
    </div>
  </div>
  <div class="graph-card">
    <div class="graph-title">Rain (%)</div>
    <div style="height:90px; position:relative">
      <canvas id="chart-rain"></canvas>
    </div>
  </div>
  <div class="graph-card">
    <div class="graph-title">Pulse (bpm)</div>
    <div style="height:90px; position:relative">
      <canvas id="chart-pulse"></canvas>
    </div>
  </div>
  <div class="graph-card">
    <div class="graph-title">Air Quality</div>
    <div style="height:90px; position:relative">
      <canvas id="chart-air"></canvas>
    </div>
  </div>
</div>

<!-- DESCRIPTION -->
<div class="description">
  <h2>Why This System Matters</h2>
  <p>
    Monitoring needs for cycling vary significantly by age and focus,
    ranging from theft prevention for bikes to safety and location
    tracking for children, and performance analytics for adults.
  </p>
  <p>
    This system integrates multiple sensors to continuously monitor
    environmental and rider health conditions in real time.
    Distance sensors help detect possible collisions or obstacles,
    air quality sensors monitor pollution exposure, rain detection
    helps anticipate road hazards, and pulse sensors track rider
    health conditions.
  </p>
  <p>
    By combining IoT hardware with a web-based dashboard,
    the system provides a centralized monitoring interface that
    can alert users instantly in case of accidents or medical emergencies.
    This improves cycling safety, situational awareness, and rider health monitoring.
  </p>
</div>

<script>
  const MAX_POINTS = 20;

  const chartConfigs = [
    { id: "chart-d1",    color: "#38bdf8", min: 0,   max: 300 },
    { id: "chart-d2",    color: "#34d399", min: 0,   max: 300 },
    { id: "chart-rain",  color: "#a78bfa", min: 0,   max: 100 },
    { id: "chart-pulse", color: "#fb7185", min: 30,  max: 180 },
    { id: "chart-air",   color: "#fbbf24", min: 0,   max: 500 },
  ];

  function makeChart(cfg) {
    return new Chart(document.getElementById(cfg.id), {
      type: "line",
      data: {
        labels: Array(MAX_POINTS).fill(""),
        datasets: [{
          data: Array(MAX_POINTS).fill(null),
          borderColor: cfg.color,
          backgroundColor: cfg.color + "22",
          borderWidth: 1.5,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
          spanGaps: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: {
            min: cfg.min,
            max: cfg.max,
            ticks: {
              font: { size: 10 },
              color: "#64748b",
              maxTicksLimit: 3
            },
            grid: { color: "rgba(255,255,255,0.05)" },
            border: { display: false }
          }
        }
      }
    });
  }

  const charts = {
    d1:    makeChart(chartConfigs[0]),
    d2:    makeChart(chartConfigs[1]),
    rain:  makeChart(chartConfigs[2]),
    pulse: makeChart(chartConfigs[3]),
    air:   makeChart(chartConfigs[4]),
  };

  function pushToChart(chart, value) {
    const ds = chart.data.datasets[0];
    ds.data.push(value);
    if (ds.data.length > MAX_POINTS) ds.data.shift();
    chart.update("none");
  }

  async function load() {
    try {
      const res = await fetch("/sensor");
      const data = await res.json();

      // Update value cards
      document.getElementById("d1").textContent    = data.distance1;
      document.getElementById("d2").textContent    = data.distance2;
      document.getElementById("rain").textContent  = data.rain;
      document.getElementById("air").textContent   = data.air;

      const pulseEl = document.getElementById("pulse");
      pulseEl.textContent = data.pulse;
      pulseEl.className = "card-value" + (data.pulse > 130 || data.pulse < 40 ? " alert" : "");

      // Push to graphs
      pushToChart(charts.d1,    data.distance1);
      pushToChart(charts.d2,    data.distance2);
      pushToChart(charts.rain,  data.rain);
      pushToChart(charts.pulse, data.pulse);
      pushToChart(charts.air,   data.air);

    } catch (err) {
      console.log("Fetch error:", err);
    }
  }

  load();
  setInterval(load, 2000);
</script>

</body>
</html>
  `);
});

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});

