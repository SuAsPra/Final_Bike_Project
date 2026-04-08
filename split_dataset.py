import os
import shutil
import random

SOURCE_DIR = "all_images"
DEST_DIR = "dataset"

SPLIT_RATIO = {
    "train": 0.7,
    "val": 0.15,
    "test": 0.15
}

IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png')

random.seed(42)

for category in os.listdir(SOURCE_DIR):
    category_path = os.path.join(SOURCE_DIR, category)

    if not os.path.isdir(category_path):
        continue

    images = [
        f for f in os.listdir(category_path)
        if f.lower().endswith(IMAGE_EXTENSIONS)
    ]

    if len(images) == 0:
        print(f"WARNING: No images found in {category}")
        continue

    random.shuffle(images)

    total = len(images)
    train_end = int(SPLIT_RATIO["train"] * total)
    val_end = train_end + int(SPLIT_RATIO["val"] * total)

    split_data = {
        "train": images[:train_end],
        "val": images[train_end:val_end],
        "test": images[val_end:]
    }

    for split, files in split_data.items():
        dest_folder = os.path.join(DEST_DIR, split, category)
        os.makedirs(dest_folder, exist_ok=True)

        for img in files:
            src = os.path.join(category_path, img)
            dst = os.path.join(dest_folder, img)
            shutil.copy(src, dst)

    print(f"{category}: {len(images)} images split")

print("\nDataset split completed successfully")
