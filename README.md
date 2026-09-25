# 🏍️ Final Bike Project - Road Condition Detection System

A comprehensive IoT solution for real-time road condition monitoring and safety alerts for cyclists. This project combines a Flutter mobile app with machine learning, sensor data from ESP32, and cloud integration for emergency alerts.

## 📜 Patent

**Publication No.: IN202641109300 A1**
**Title: Pothole Detection & Road Anomaly Monitoring System**

This invention presents an **AI- and IoT-enabled road safety and monitoring system** designed to detect road anomalies and provide real-time safety assistance for cyclists. The system integrates a **Flutter-based mobile application, machine learning-based computer vision, GPS tracking, ESP32 sensor systems, backend services, and cloud-connected data storage** into a unified monitoring platform.

The system uses a **TensorFlow/Keras machine learning model converted to TensorFlow Lite** to perform on-device classification of road conditions into **normal road, pothole, and speed breaker** categories using camera input. Detected road anomalies are associated with **GPS coordinates and timestamps** and transmitted to a Node.js-based backend for storage and visualization.

In addition to vision-based road monitoring, the system incorporates **ESP32-connected sensors**, including ultrasonic sensors, rain sensing, pulse/heart-rate monitoring, and air-quality sensing. The system can monitor abnormal conditions such as potential collisions, sudden impacts, and health-related emergencies.

An integrated **emergency response mechanism** provides manual and automated SOS activation through the mobile application, including voice and shake-based triggers. Emergency events can be transmitted through a **Telegram bot with the rider's location**, enabling rapid notification of designated emergency contacts.

The invention therefore combines **computer vision, edge AI, GPS-based geolocation, IoT sensor monitoring, backend data processing, and automated emergency communication** to provide an integrated road-condition monitoring and cyclist safety solution.


## 📋 Project Overview

The Final Bike Project is a smart bicycle monitoring system that detects road conditions (potholes, speed breakers, normal roads), monitors rider health and bike safety in real-time, and sends emergency alerts. The system integrates:

- **Flutter Mobile App**: Real-time road condition detection using camera and ML model
- **Machine Learning Model**: TensorFlow Lite model for road condition classification
- **ESP32 Sensors**: Ultrasonic sensors, rain detection, heart rate monitoring
- **Node.js Backend Servers**: Data processing, storage, and alert management
- **Telegram Integration**: Real-time emergency notifications

Sample image for dashboard - <img width="1519" height="526" alt="image" src="https://github.com/user-attachments/assets/187aa76b-39dd-4914-b4b8-8c2d36bc93ca" />
<img width="1912" height="667" alt="image" src="https://github.com/user-attachments/assets/ab456f52-87cb-4de7-8f13-6870707086c3" />

Sample image for maps - 
<img width="1519" height="779" alt="image" src="https://github.com/user-attachments/assets/3d0c0d60-2db5-4478-ad9b-fa90c8e3a4d6" />
<img width="1080" height="617" alt="image" src="https://github.com/user-attachments/assets/201c245e-49ee-48e5-b19a-cd3eac97cf8b" />
Telegram in emergency contacts phone when there is an SOS alert - ![WhatsApp Image 2026-03-06 at 4 31 13 PM](https://github.com/user-attachments/assets/899ae387-4e61-4dd6-a1fb-99603723d23f)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────┐
│      Flutter Mobile App             │
│  (Road Detection + GPS + Voice)     │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼─────┐  ┌────▼──────────┐
│ Road      │  │ DirectWifi    │
│ Backend   │  │ Displayer     │
│ (Port 5000)  │ (Port 5001)   │
└───────────┘  └───────────────┘
      │             │
   MongoDB      ESP32 Sensors
   Location      (Ultrasonic,
   Data          Rain, Pulse)
```

---

## 🤖 Machine Learning Model

### Model Information
- **Training Framework**: TensorFlow/Keras
- **Model Format**: TensorFlow Lite (`.tflite`)
- **Input**: Camera frames (preprocessed images)
- **Output**: Classification predictions with confidence scores
- **Classes**: 
  - `normal` - Safe road conditions
  - `pothole` - Road damage/potholes
  - `speedbreaker` - Speed bumps/breakers

### Model Files
- `road_condition_model.h5` - Full Keras model
- `road_condition_model.tflite` - TensorFlow Lite model (Android/iOS)
- `road_condition_model_flex.tflite` - Flexible TensorFlow Lite model

### Python Scripts
- `train_model.py` - Train the model with dataset
- `tensorconverter.py` - Convert Keras model to TensorFlow Lite
- `convert.py` & `convert_flex.py` - Model conversion utilities
- `evaluate_model.py` - Evaluate model performance
- `split_dataset.py` - Prepare training/validation splits
- `verify_split.py` - Verify dataset split

---



<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/955da113-de75-4f42-a233-ab7815c767a1" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/9d0d265f-65b1-4090-a2a9-29a45fcab890" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/4d4d239a-eae2-476e-a513-15ce3c2a3ae0" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/986c7c6b-0266-4561-8805-cfc100756c84" />


## 📱 Flutter Mobile App

### Features

1. **Real-Time Road Detection**
   - Continuous camera capture and analysis
   - ML model inference on device
   - Confidence score display
   - Automatic alerts for hazards

2. **GPS & Location Tracking**
   - Realtime GPS coordinates
   - Location timestamp recording
   - Google Maps integration
   - Location sharing for emergencies

3. **Voice Commands**
   - Speech-to-text voice input
   - Emergency voice activation
   - Voice-based alerts

4. **Sensor Integration**
   - Accelerometer/gyroscope monitoring
   - Shake detection for accidents
   - Vibration feedback

5. **Health Monitoring**
   - Heart rate monitoring (via ESP32)
   - Pulse rate abnormality detection
   - Medical emergency alerts

6. **Emergency Response**
   - SOS trigger (voice/shake detection)
   - One-tap emergency button
   - Automatic location sending
   - Telegram notifications

### Dependencies
```dart
camera: ^0.10.5+9              # Camera capture
tflite_flutter: ^0.10.4         # ML model inference
geolocator: ^10.1.0             # GPS location
sensors_plus: ^4.0.2            # Accelerometer/Gyroscope
speech_to_text: ^6.6.0          # Voice input
vibration: ^1.8.4               # Vibration feedback
http: ^1.2.1                    # API calls
image: ^4.1.3                   # Image processing
```

### Platforms
- ✅ Android (Primary)
- ✅ iOS (Supported)
- ✅ Linux
- ✅ macOS
- ✅ Windows

---

## 🖥️ Backend Servers

### 1. Road Backend Server (Port 5000)

**Location**: `road_detector_app/road_backend/`

**Purpose**: Store road detection data and manage SOS alerts

**Endpoints**:
- `POST /api/detection` - Save detection data to MongoDB
- `POST /api/sos` - Send SOS emergency alerts
- `GET /api/latest-location` - Get last recorded location
- `GET /` - Dashboard view

**Features**:
- MongoDB integration for data persistence
- Telegram SOS alerts with location links
- Emergency notifications with timestamps
- Vehicle identification (e.g., TN07-CB-7741)

**Dependencies**:
```json
{
  "express": "^5.2.1",
  "mongoose": "^9.2.3",
  "axios": "^1.13.6",
  "cors": "^2.8.6"
}
```

### 2. DirectWifi Displayer Server (Port 5001)

**Location**: `DirectWifiDisplayer/`

**Purpose**: Receive and display sensor data from ESP32

**Endpoints**:
- `POST /sensor` - Receive sensor data from ESP32
- `GET /sensor` - Get latest sensor readings
- `GET /` - Real-time sensor dashboard

**Sensor Data Monitored**:
- `distance1`, `distance2` - Ultrasonic sensor readings (collision detection)
- `rain` - Rain sensor readings
- `pulse` - Heart rate (BPM)
- `air` - Air quality

**Alert Conditions**:
- Pulse > 130 or < 40 BPM → Medical emergency alert
- Ultrasonic distance < 50 cm → Accident/collision alert

**Dashboard Features**:
- Real-time chart visualization
- Sensor data display
- Alert history
- Dark theme UI

**Dependencies**:
```json
{
  "express": "^5.2.1",
  "axios": "^1.13.6",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1"
}
```

---

## 📊 Data Flow

```
ESP32 Sensors
    ↓
DirectWifi Displayer (5001) ← Processes sensor data
    ↓
[Dashboard] [Telegram Alerts]

Flutter App (Camera)
    ↓
ML Model (TFLite) ← Road detection
    ↓
Road Backend (5000) ← Stores detections & location
    ↓
MongoDB ← Persistence
    ↓
[Dashboard] [Telegram Alerts]
```

---

## 🚀 Installation & Setup

### Prerequisites
- Flutter SDK (≥3.4.0)
- Node.js (≥14)
- Python (≥3.8)
- Git
- Android Studio / Xcode (for mobile)
- MongoDB Atlas account (cloud database)
- Telegram Bot Token & Chat ID

### Step 1: Clone the Repository
```bash
git clone https://github.com/SuAsPra/Final_Bike_Project.git
cd Final_Bike_Project
```

### Step 2: Set Up Road Backend Server

```bash
cd road_detector_app/road_backend

# Install dependencies
npm install

# Create .env file (optional for development)
# TELEGRAM_BOT_TOKEN=your_token_here
# CHAT_ID=your_chat_id_here

# Start server
npm start
# Server runs on http://localhost:5000
```

### Step 3: Set Up DirectWifi Displayer Server

```bash
cd DirectWifiDisplayer

# Install dependencies
npm install

# Create .env file
# TELEGRAM_BOT_TOKEN=your_token_here
# CHAT_ID=your_chat_id_here

# Start server
npm start
# Server runs on http://localhost:5001
```

### Step 4: Set Up Flutter App

```bash
cd road_detector_app

# Get dependencies
flutter pub get

# Build for Android
flutter build apk

# Or run in debug mode
flutter run
```

### Step 5: Configure ESP32

Update ESP32 code to send sensor data to:
```
POST http://localhost:5001/sensor
```

Payload format:
```json
{
  "distance1": 150,
  "distance2": 145,
  "rain": 0,
  "pulse": 72,
  "air": 50
}
```

### Step 6: Configure MongoDB (Optional)

Update connection string in `road_detector_app/road_backend/server.js`:
```javascript
mongoose.connect("your_mongodb_connection_string")
```

---

## 🎯 How to Run Everything

### Development Environment Setup

**Terminal 1 - Road Backend Server**:
```bash
cd road_detector_app/road_backend
npm start
```
Output: `Server running on port 5000`

**Terminal 2 - DirectWifi Displayer Server**:
```bash
cd DirectWifiDisplayer
npm start
```
Output: `Server running on port 5001`

**Terminal 3 - Flutter App (Phone/Emulator)**:
```bash
cd road_detector_app
flutter run
```

### Access Dashboards

1. **Road Backend Dashboard** (Detections & Maps):
   - URL: `http://localhost:5000`
   - Shows: Detection history, locations, emergency alerts

2. **DirectWifi Displayer Dashboard** (Sensors):
   - URL: `http://localhost:5001`
   - Shows: Real-time sensor readings, charts, alerts

3. **Flutter App**:
   - Launch on Android phone or emulator
   - Camera starts automatically
   - Shows real-time predictions

---

## 📱 Using the Flutter App

### Main Features

1. **Camera View**
   - Auto-captures road conditions
   - Shows prediction: "normal", "pothole", or "speedbreaker"
   - Displays confidence percentage

2. **GPS Tracking**
   - Records latitude, longitude
   - Timestamps each detection
   - Sends data to backend

3. **Voice Commands**
   - Say "help" to trigger emergency
   - Automatic SOS activation

4. **Shake Detection**
   - Detects sudden impacts/accidents
   - Auto-triggers emergency protocol

5. **Emergency Alerts**
   - Manual SOS button
   - Auto-alerts for detected hazards
   - Sends location to emergency contacts via Telegram

---

## 🔧 Configuration

### Telegram Bot Setup

1. Create a bot on BotFather (@BotFather on Telegram)
2. Get your `TELEGRAM_BOT_TOKEN`
3. Get your `CHAT_ID` (user ID or group ID)
4. Add to `.env` files in both servers

### Environment Variables (`.env`)

**road_detector_app/road_backend/.env**:
```
TELEGRAM_BOT_TOKEN=your_bot_token
CHAT_ID=your_chat_id
MONGODB_URI=your_mongodb_connection_string
```

**DirectWifiDisplayer/.env**:
```
TELEGRAM_BOT_TOKEN=your_bot_token
CHAT_ID=your_chat_id
```

---

## 📊 Viewing Results

### Real-Time Monitoring

**Road Detection Dashboard** (`http://localhost:5000`):
- Live map with detection locations
- Detection history table
- Hazard summaries
- SOS alerts log

**Sensor Dashboard** (`http://localhost:5001`):
- Real-time sensor graphs
- Distance measurements
- Pulse monitoring
- Rain sensor status
- Air quality readings

### Data Stored in MongoDB

Collections:
- `detections` - Road condition predictions with location
- `sos_alerts` - Emergency alerts with timestamps
- `locations` - GPS tracking history

---

## 🛠️ Troubleshooting

### App won't connect to servers
- Check if servers are running: `http://localhost:5000`, `http://localhost:5001`
- Verify network connectivity
- Check firewall settings

### Model predictions are inaccurate
- Ensure good lighting for camera
- Clean camera lens
- Retrain model with more diverse dataset

### ESP32 not sending data
- Verify IP addresses and ports
- Check WiFi connection
- Confirm POST payload format

### MongoDB connection failed
- Verify connection string
- Check network access in MongoDB Atlas
- Ensure IP whitelist allows your machine

---

## 📦 Project Structure

```
Final_Bike_Project/
├── road_detector_app/              # Flutter app
│   ├── lib/main.dart              # Main app logic
│   ├── assets/                    # ML models
│   ├── road_backend/              # Road detection backend
│   └── pubspec.yaml              # Flutter dependencies
├── DirectWifiDisplayer/            # ESP32 sensor server
│   ├── server.js                 # Express server
│   ├── public/index.html         # Dashboard UI
│   └── package.json             # Node dependencies
├── road_condition_model.*         # ML model files
└── Python ML Scripts/             # Model training tools
```

---

## 👤 Author

**Suriyan**

---

## 📝 License

This project is licensed under the ISC License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

---

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

## 🚀 Future Enhancements

- [ ] Mobile app backend for user authentication
- [ ] Cloud deployment (AWS/Google Cloud)
- [ ] Advanced ML models with more road conditions
- [ ] Multi-language support
- [ ] Offline mode with data sync
- [ ] Social features (share dangerous locations)
- [ ] Integration with local authorities

---

**Happy Cycling! Stay Safe! 🚴‍♂️🛡️**
# Final_Bike_Project
# Dataset_for_Bike_Project
