# app.py
from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import os
from PIL import Image
import time
import sqlite3
from datetime import datetime

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# LOAD MODEL
model = tf.keras.models.load_model('model/mining_model.h5')

CLASSES = [
    'AnnualCrop','Forest','HerbaceousVegetation','Highway',
    'Industrial','Pasture','PermanentCrop','Residential','River','SeaLake'
]
MINING_CLASSES = ['Industrial', 'AnnualCrop']

# INIT DB
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            predicted_class TEXT,
            confidence REAL,
            is_mining INTEGER,
            timestamp DATETIME
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# PREPROCESS
def preprocess(path):
    img = Image.open(path).convert('RGB')
    img = img.resize((128, 128))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['file']
        path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(path)

        start = time.time()

        img = preprocess(path)
        preds = model.predict(img, verbose=0)[0]

        end = time.time()

        predicted_class = CLASSES[np.argmax(preds)]
        confidence = float(np.max(preds))
        is_mining = predicted_class in MINING_CLASSES

        # Compute mining vs non-mining percentage from scores
        mining_score = sum(float(preds[CLASSES.index(c)]) for c in MINING_CLASSES)
        non_mining_score = 1.0 - mining_score

        ts = datetime.now().isoformat()

        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute(
            """INSERT INTO history
               (filename, predicted_class, confidence, is_mining, timestamp)
               VALUES (?, ?, ?, ?, ?)""",
            (file.filename, predicted_class, confidence, int(is_mining), ts)
        )
        conn.commit()
        conn.close()

        return jsonify({
            "class": predicted_class,
            "confidence": confidence,
            "scores": preds.tolist(),
            "is_mining": is_mining,
            "time": round(end - start, 3),
            "mining_pct": round(mining_score * 100, 2),
            "non_mining_pct": round(non_mining_score * 100, 2)
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/history')
def history():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("""
        SELECT filename, predicted_class, confidence, is_mining, timestamp
        FROM history
        ORDER BY id DESC
    """)
    rows = c.fetchall()
    conn.close()

    data = []
    for r in rows:
        data.append({
            "filename": r[0],
            "class": r[1],
            "confidence": r[2],
            "is_mining": bool(r[3]),
            "time": r[4]
        })

    return jsonify(data)

@app.route('/stats')
def stats():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM history")
    total = c.fetchone()[0] or 0

    c.execute("SELECT COUNT(*) FROM history WHERE is_mining = 1")
    mining = c.fetchone()[0] or 0

    safe = total - mining

    # For charts: last 50 entries
    c.execute("""
        SELECT is_mining, confidence
        FROM history
        ORDER BY id DESC
        LIMIT 50
    """)
    recent = c.fetchall()
    conn.close()

    recent_data = [
        {"is_mining": bool(r[0]), "confidence": r[1]}
        for r in recent
    ]

    return jsonify({
        "total": total,
        "mining": mining,
        "safe": safe,
        "recent": recent_data
    })

if __name__ == '__main__':
    app.run(debug=True)