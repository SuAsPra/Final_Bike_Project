import os

BASE = "dataset"
classes = ['normal', 'pothole', 'speedbreaker']

total_counts = {c: 0 for c in classes}

print("=== SPLIT VERIFICATION ===")

for split in ['train', 'val', 'test']:
    print(f"\n{split.upper()}")
    split_total = 0

    for cls in classes:
        path = os.path.join(BASE, split, cls)
        count = len(os.listdir(path))
        split_total += count
        total_counts[cls] += count
        print(f"{cls:<13}: {count}")

    print(f"TOTAL {split}: {split_total}")

print("\n=== OVERALL DISTRIBUTION ===")
grand_total = sum(total_counts.values())

for cls, count in total_counts.items():
    percent = (count / grand_total) * 100
    print(f"{cls:<13}: {count} ({percent:.2f}%)")

print(f"\nGRAND TOTAL: {grand_total}")
