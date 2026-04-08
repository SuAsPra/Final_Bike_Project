import tensorflow as tf

print("TF Version:", tf.__version__)

model = tf.keras.models.load_model("road_condition_model.h5")

converter = tf.lite.TFLiteConverter.from_keras_model(model)

converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS
]

converter.optimizations = []  # No quantization

tflite_model = converter.convert()

with open("road_condition_model2.tflite", "wb") as f:
    f.write(tflite_model)

print("Conversion successful!")