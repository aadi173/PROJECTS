# Illegal Surface Mining Detection Using Satellite Imagery

An AI-based environmental monitoring system that uses **satellite imagery** and **Deep Learning** to identify mining-related land patterns from remote sensing images.

This project uses a **MobileNetV2-based Convolutional Neural Network (CNN)** to classify satellite images into land-use categories and then maps selected classes into **Mining** or **Non-Mining** regions.

---

# 📌 Project Overview

Illegal surface mining causes serious environmental problems such as:

- Deforestation
- Land degradation
- Water pollution
- Ecological imbalance

Traditional monitoring methods are manual, expensive, and difficult to scale across large geographical regions.

This project provides a simplified AI-based solution that can:

✅ Analyze satellite images  
✅ Classify land-use patterns  
✅ Detect mining-related areas  
✅ Display results through a user-friendly interface  

---

# 🚀 Features

- Upload and analyze satellite images
- Deep learning-based image classification
- Mining / Non-Mining prediction
- Confidence score display
- Prediction history storage
- Dashboard visualization
- Lightweight and efficient MobileNetV2 model
- Simple web interface using Flask

---

# 🧠 Technologies Used

## Frontend
- HTML
- CSS
- JavaScript

## Backend
- Flask (Python)

## Deep Learning
- TensorFlow
- Keras
- MobileNetV2 (Transfer Learning)

## Database
- SQLite

## Libraries
- NumPy
- Pandas
- PIL
- Matplotlib
- Scikit-learn

---

# 📂 Dataset Used

The project uses the **EuroSAT Dataset**, which contains satellite images of different land-use classes such as:

- Forest
- Industrial
- Residential
- River
- AnnualCrop
- Highway
- Pasture
- SeaLake

Since a dedicated illegal mining dataset was not available, selected classes like:

- Industrial
- AnnualCrop

are treated as mining-related categories using mapping logic.

---

# ⚙️ System Workflow

```text
Image Upload
      ↓
Preprocessing
      ↓
MobileNetV2 CNN Model
      ↓
Land Classification
      ↓
Mining Mapping Logic
      ↓
Mining / Non-Mining Result
      ↓
Dashboard & Database Storage
```

# 🧪 Methodology

## 1. Image Preprocessing
- Resize images to 128×128
- Normalize pixel values
- Apply data augmentation

## 2. Feature Extraction
- Use pretrained MobileNetV2 model
- Extract spatial and texture features

## 3. Classification
- Predict land-use category

## 4. Mining Detection Logic

if predicted_class in ['Industrial', 'AnnualCrop']:
    result = "Mining Detected"
else:
    result = "Non-Mining"

---

# 📊 Output

The system provides:

- Predicted land class
- Confidence score
- Mining / Non-Mining result
- Prediction history

---
