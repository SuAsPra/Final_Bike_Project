import tensorflow as tf

print("TensorFlow Version:", tf.__version__)

# Load model
model = tf.keras.models.load_model("road_condition_model.h5", compile=False)

# Convert with Select TF Ops (important for new ops support)
converter = tf.lite.TFLiteConverter.from_keras_model(model)

converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,
    tf.lite.OpsSet.SELECT_TF_OPS
]

converter.optimizations = []

tflite_model = converter.convert()

with open("road_condition_model_flex.tflite", "wb") as f:
    f.write(tflite_model)

print("Conversion successful!")