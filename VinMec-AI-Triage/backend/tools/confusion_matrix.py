#!/usr/bin/env python3
"""
Generate confusion matrix and per-class precision/recall from stored logs.

Usage:
  python tools/confusion_matrix.py --out confusion.png

It reads from the same MongoDB collection used by the app (`logs_collection`).
"""

from __future__ import annotations

import argparse
import os
from collections import Counter
from typing import List
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.database import logs_collection


def fetch_pairs(limit: int | None = None) -> List[tuple[str, str]]:
    """Fetch (ai_prediction, user_final_choice) pairs from DB.

    ai_prediction uses the top_3[0]["department"] if available; otherwise empty.
    Only include rows where user_final_choice is set (feedback provided).
    """
    query = {"user_final_choice": {"$ne": None}}

    projection = {"ai_top_3": 1, "user_final_choice": 1}
    cursor = logs_collection.find(query, projection)
    if limit:
        cursor = cursor.limit(limit)

    pairs = []
    for doc in cursor:
        user_choice = doc.get("user_final_choice")
        ai_top3 = doc.get("ai_top_3") or []
        ai_pred = (
            ai_top3[0]["department"]
            if ai_top3 and isinstance(ai_top3, list) and ai_top3[0].get("department")
            else None
        )
        if user_choice is None:
            continue
        # Normalize to str
        ai_label = str(ai_pred) if ai_pred is not None else "<NO_SUGGESTION>"
        user_label = str(user_choice)
        pairs.append((ai_label, user_label))

    return pairs


def build_label_mapping(labels: List[str]) -> dict:
    unique = sorted(set(labels))
    return {label: idx for idx, label in enumerate(unique)}


def plot_confusion_matrix(y_true, y_pred, labels, out_path: str):
    cm = confusion_matrix(y_true, y_pred, labels=range(len(labels)))

    # Precision/recall per class
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=range(len(labels)), zero_division=0
    )

    plt.figure(figsize=(max(6, len(labels) * 0.6), max(6, len(labels) * 0.6)))
    sns.set(style="whitegrid")
    ax = sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
        cbar_kws={"label": "count"},
    )

    ax.set_xlabel("Predicted (AI suggestion)")
    ax.set_ylabel("Actual (User final choice)")
    ax.set_title("Confusion Matrix — AI suggestion vs User final choice")

    # Add precision/recall text to the right of the heatmap
    # Compute normalized positions
    right_ax_x = 1.02
    # Create small table of precision/recall
    stats_lines = [f"Class | Precision | Recall | Support"]
    for lab, p, r, s in zip(labels, precision, recall, support):
        stats_lines.append(f"{lab} | {p:.2f} | {r:.2f} | {s}")

    stats_text = "\n".join(stats_lines)
    plt.gcf().text(0.99, 0.5, stats_text, fontsize=9, va="center", ha="left", family="monospace")

    plt.tight_layout(rect=(0, 0, 0.95, 1))
    plt.savefig(out_path, dpi=200)
    print(f"Saved confusion matrix to {out_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", "-o", default="confusion_matrix.png", help="Output image path")
    parser.add_argument(
        "--limit", "-n", type=int, default=None, help="Limit number of records to fetch"
    )
    args = parser.parse_args()

    pairs = fetch_pairs(limit=args.limit)
    if not pairs:
        print("No labeled pairs found in database. Ensure feedback has been recorded.")
        return

    ai_labels, user_labels = zip(*pairs)
    all_labels = sorted(set(ai_labels) | set(user_labels))
    mapping = build_label_mapping(all_labels)

    y_pred = [mapping[a] for a in ai_labels]
    y_true = [mapping[u] for u in user_labels]

    print(f"Found {len(y_true)} labeled examples across {len(all_labels)} classes")

    plot_confusion_matrix(y_true, y_pred, all_labels, args.out)


if __name__ == "__main__":
    main()
