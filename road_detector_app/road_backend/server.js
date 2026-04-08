const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

let latestSOS = null;

const TELEGRAM_TOKEN = "8799810863:AAHwBwhCKFPHlFZDBOtgq9K7O75Z_HqWcQA";
const CHAT_ID = "7919402977";



// ================= TELEGRAM ALERT =================

async function sendTelegramSOS(lat, lng, source) {

const message =
`🚨 SOS ALERT

Vehicle TN07-CB-7741 has sent an emergency alert.

Trigger Type: ${source}

Location:
Latitude: ${lat}
Longitude: ${lng}

Google Maps:
https://maps.google.com/?q=${lat},${lng}`;

try {

await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
chat_id: CHAT_ID,
text: message
});

console.log("Telegram SOS sent");

} catch (err) {

console.log("Telegram error:", err.message);

}

}



// ================= MONGODB CONNECT =================

mongoose.connect("mongodb+srv://suriyan:COOWG9nsnloxnMtV@cluster0.pzuq2ov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));



// ================= SCHEMA =================

const detectionSchema = new mongoose.Schema({

latitude: Number,
longitude: Number,
timestamp: String,
prediction: String,
confidence: Number

});

const Detection = mongoose.model("Detection", detectionSchema);



// ================= SAVE DETECTION DATA =================

app.post("/api/detection", async (req, res) => {

try {

const newDetection = new Detection(req.body);
await newDetection.save();

res.json({ message: "Saved to MongoDB" });

} catch (err) {

res.status(500).json({ error: err.message });

}

});



// ================= SOS API =================

app.post("/api/sos", async (req, res) => {

const lat = req.body.latitude;
const lng = req.body.longitude;
const time = req.body.timestamp;
const source = req.body.source || "Manual SOS";

latestSOS = {

latitude: lat,
longitude: lng,
timestamp: time,
source: source

};

console.log("🚨 SOS RECEIVED:", latestSOS);

// Send telegram alert
await sendTelegramSOS(lat, lng, source);

res.json({ message: "SOS received and Telegram alert sent" });

});



// ================= DISPLAY TABLE =================

app.get("/", async (req, res) => {

const detections = await Detection.find().sort({ _id: -1 });

let rows = detections.map((d, index) => `
<tr>
<td>${index + 1}</td>
<td>${d.latitude}</td>
<td>${d.longitude}</td>
<td>${d.timestamp}</td>
<td>${d.prediction}</td>
<td>${(d.confidence * 100).toFixed(2)}%</td>
</tr>
`).join("");

res.send(`
<html>
<head>

<title>AI Road Detections</title>

<style>

body { font-family: Arial; padding: 20px; }

table { border-collapse: collapse; width: 100%; }

th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }

th { background-color: #333; color: white; }

tr:nth-child(even) { background-color: #f2f2f2; }

</style>

</head>

<body>

<h2>AI Road Detection Log</h2>

${latestSOS ? `
<div style="background:red;color:white;padding:15px;margin-bottom:20px;">
<h3>🚨 SOS EMERGENCY ALERT</h3>

Trigger: ${latestSOS.source} <br>
Latitude: ${latestSOS.latitude} <br>
Longitude: ${latestSOS.longitude} <br>
Time: ${latestSOS.timestamp}

</div>
` : ""}

<table>

<tr>
<th>#</th>
<th>Latitude</th>
<th>Longitude</th>
<th>Timestamp</th>
<th>Prediction</th>
<th>Confidence</th>
</tr>

${rows}

</table>

</body>
</html>
`);

});



// ================= GOOGLE MAP PAGE =================

app.get("/map", async (req, res) => {

const detections = await Detection.find();

const filtered = detections.filter(d => d.confidence > 0.80);

const markers = filtered.map(d => ({

lat: d.latitude,
lng: d.longitude,
prediction: d.prediction,
confidence: d.confidence

}));

res.send(`

<html>

<head>

<title>AI Road Map</title>

<style>

#map { height: 100vh; width: 100%; }

</style>

</head>

<body>

<div id="map"></div>

<script>

const markers = ${JSON.stringify(markers)};

function initMap() {

const map = new google.maps.Map(document.getElementById("map"), {

zoom: 14,
center: markers.length > 0 ? markers[0] : {lat: 13.0827, lng: 80.2707}

});

markers.forEach(m => {

let color;

if (m.prediction === "pothole") color = "red";
else if (m.prediction === "speedbreaker") color = "orange";
else color = "green";

new google.maps.Marker({

position: { lat: m.lat, lng: m.lng },

map: map,

icon: {

path: google.maps.SymbolPath.CIRCLE,
scale: 8,
fillColor: color,
fillOpacity: 1,
strokeWeight: 1

},

title: m.prediction + " (" + (m.confidence * 100).toFixed(1) + "%)"

});

});

}

</script>

<script async
src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAs5_jj-d-lUvFx-KgL5HI1iNQC45s1ryI&callback=initMap">
</script>

</body>

</html>

`);

});



// ================= LATEST LOCATION API =================

app.get("/api/latest-location", async (req, res) => {

const latest = await Detection.findOne().sort({ _id: -1 });

if (!latest) {
return res.json({ error: "No data" });
}

res.json({

latitude: latest.latitude,
longitude: latest.longitude,
timestamp: latest.timestamp

});

});



// ================= START SERVER =================

app.listen(5000, "0.0.0.0", () => {

console.log("Server running on port 5000");

});