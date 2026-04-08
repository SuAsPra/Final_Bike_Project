import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:sensors_plus/sensors_plus.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:vibration/vibration.dart';

late List<CameraDescription> cameras;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  cameras = await availableCameras();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: AutoCapturePage(),
    );
  }
}

class AutoCapturePage extends StatefulWidget {
  const AutoCapturePage({super.key});

  @override
  State<AutoCapturePage> createState() => _AutoCapturePageState();
}

class _AutoCapturePageState extends State<AutoCapturePage> {

  CameraController? _controller;
  Interpreter? _interpreter;
  Timer? _timer;

  bool isCapturing = false;
  int imageCount = 0;

  String lastPrediction = "None";
  double lastConfidence = 0.0;

  final List<String> labels = ["normal", "pothole", "speedbreaker"];

  double? latitude;
  double? longitude;
  DateTime? lastTimestamp;

  // Voice + Shake
  stt.SpeechToText speech = stt.SpeechToText();
  bool isListening = false;

  StreamSubscription? accelerometerSubscription;

  double shakeThreshold = 25.0;
  bool emergencyTriggered = false;

  @override
  void initState() {
    super.initState();
    initializeCamera();
    loadModel();

    startVoiceDetection();
    startShakeDetection();
  }

  // CAMERA

  Future<void> initializeCamera() async {
    _controller = CameraController(
      cameras[0],
      ResolutionPreset.medium,
      enableAudio: false,
    );

    await _controller!.initialize();

    if (mounted) setState(() {});
  }

  // MODEL

  Future<void> loadModel() async {
    _interpreter = await Interpreter.fromAsset(
      'assets/road_condition_model_flex.tflite',
      options: InterpreterOptions()..threads = 4,
    );

    print("Model Loaded Successfully");
  }

  // LOCATION

  Future<Position> _getCurrentLocation() async {

    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      throw Exception("Location services disabled");
    }

    permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw Exception("Location permission denied");
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  // START CAPTURE

  Future<void> startCapturing() async {

    if (_controller == null || !_controller!.value.isInitialized) return;

    if (_interpreter == null) {
      print("Model not loaded yet");
      return;
    }

    setState(() => isCapturing = true);

    _timer = Timer.periodic(const Duration(seconds: 4), (timer) async {

      try {

        final dir = await getApplicationDocumentsDirectory();

        final filePath = join(
          dir.path,
          'road_${DateTime.now().millisecondsSinceEpoch}.jpg',
        );

        XFile file = await _controller!.takePicture();

        await file.saveTo(filePath);

        imageCount++;

        await runModelOnImage(filePath);

        setState(() {});

      } catch (e) {

        print("Capture error: $e");
      }
    });
  }

  void stopCapturing() {
    _timer?.cancel();
    setState(() => isCapturing = false);
  }

  // EMERGENCY TRIGGER

  Future<void> triggerEmergency(String source) async {

    if (emergencyTriggered) return;

    emergencyTriggered = true;

    try {

      Position position = await _getCurrentLocation();

      if (await Vibration.hasVibrator() ?? false) {
        Vibration.vibrate(duration: 700);
      }

      final url = Uri.parse("http://10.122.244.161:5000/api/sos");

      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "latitude": position.latitude,
          "longitude": position.longitude,
          "timestamp": DateTime.now().toString(),
          "source": source
        }),
      );

      print("Emergency sent: ${response.statusCode}");

    } catch (e) {

      print("Emergency error: $e");
    }

    Future.delayed(const Duration(seconds: 10), () {
      emergencyTriggered = false;
    });
  }

  // MANUAL SOS

  Future<void> sendSOS() async {
    await triggerEmergency("Manual SOS");
  }

  // VOICE DETECTION

  Future<void> startVoiceDetection() async {

    bool available = await speech.initialize(
  onStatus: (status) {
    print("🎙 Speech status: $status");
  },
  onError: (error) {
    print("🎙 Speech error: ${error.errorMsg}");
  },
);
    if (!available) {
      print("Speech not available");
      return;
    }

    isListening = true;

    speech.listen(

      onResult: (result) {

        String words = result.recognizedWords.toLowerCase();

        print("Heard: $words");

        if (words.contains("help me") ||
            words.contains("sos") ||
            words.contains("emergency")) {

          triggerEmergency("Voice Trigger");
        }
      },

      listenFor: const Duration(seconds: 60),
      pauseFor: const Duration(seconds: 5),
      partialResults: true,
    );

    Future.delayed(const Duration(seconds: 65), () {
      if (isListening) startVoiceDetection();
    });
  }

  // SHAKE DETECTION

  void startShakeDetection() {

    accelerometerSubscription =
        accelerometerEvents.listen((AccelerometerEvent event) {

      double magnitude =
          sqrt(event.x * event.x + event.y * event.y + event.z * event.z);

      if (magnitude > shakeThreshold && !emergencyTriggered) {

        print("Phone Shake Detected");

        triggerEmergency("Phone Shake");
      }
    });
  }

  // SEND ROAD DATA

  Future<void> sendToServer() async {

    if (latitude == null || longitude == null) return;

    final url = Uri.parse("http://10.122.244.161:5000/api/detection"); //must change when wifi changes

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": lastTimestamp.toString(),
        "prediction": lastPrediction,
        "confidence": lastConfidence,
      }),
    );

    print("Server Response: ${response.statusCode}");
  }

  // AI MODEL

  Future<void> runModelOnImage(String imagePath) async {

    if (_interpreter == null) return;

    final imageFile = File(imagePath);

    final imageBytes = await imageFile.readAsBytes();

    img.Image? originalImage = img.decodeImage(imageBytes);

    if (originalImage == null) return;

    img.Image resizedImage =
        img.copyResize(originalImage, width: 224, height: 224);

    var input = List.generate(
      1,
      (i) => List.generate(
        224,
        (y) => List.generate(
          224,
          (x) {
            final pixel = resizedImage.getPixel(x, y);
            return [
              pixel.r / 255.0,
              pixel.g / 255.0,
              pixel.b / 255.0,
            ];
          },
        ),
      ),
    );

    var output = List.generate(1, (i) => List.filled(3, 0.0));

    _interpreter!.run(input, output);

    int predictedIndex = output[0].indexOf(output[0].reduce(max));

    try {

      Position position = await _getCurrentLocation();

      latitude = position.latitude;
      longitude = position.longitude;
      lastTimestamp = DateTime.now();

    } catch (e) {

      print("Location error: $e");
    }

    setState(() {

      lastPrediction = labels[predictedIndex];
      lastConfidence = output[0][predictedIndex];
    });

    await sendToServer();
  }

  // DISPOSE

  @override
  void dispose() {

    _timer?.cancel();
    accelerometerSubscription?.cancel();
    speech.stop();

    _controller?.dispose();
    _interpreter?.close();

    super.dispose();
  }

  // UI

  @override
  Widget build(BuildContext context) {

    if (_controller == null || !_controller!.value.isInitialized) {

      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(

      appBar: AppBar(title: const Text("AI Road Detector")),

      body: SingleChildScrollView(

        child: Column(

          children: [

            AspectRatio(
              aspectRatio: _controller!.value.aspectRatio,
              child: CameraPreview(_controller!),
            ),

            const SizedBox(height: 10),

            Text("Images captured: $imageCount"),

            const SizedBox(height: 10),

            Text(
              "Prediction: $lastPrediction",
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold),
            ),

            Text(
              "Confidence: ${(lastConfidence * 100).toStringAsFixed(2)} %",
            ),

            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [

                ElevatedButton(
                  onPressed: isCapturing ? null : startCapturing,
                  child: const Text("Start"),
                ),

                ElevatedButton(
                  onPressed: isCapturing ? stopCapturing : null,
                  child: const Text("Stop"),
                ),
              ],
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: sendSOS,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(
                    horizontal: 40,
                    vertical: 15),
              ),
              child: const Text(
                "SOS EMERGENCY",
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}