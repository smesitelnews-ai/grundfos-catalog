import os

log_path = r"C:\Users\ROM\.gemini\antigravity\brain\76d507b4-9c4f-4edf-b069-557a67bcaeea\.system_generated\logs\transcript.jsonl"

if os.path.exists(log_path):
    print("Transcript found! Searching...")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            if 'credential' in line.lower() or 'cmdkey' in line.lower() or 'push' in line.lower():
                # print first 300 chars of line to avoid clutter
                print(f"[Line {idx}] {line[:300]}")
else:
    print("Transcript not found.")
