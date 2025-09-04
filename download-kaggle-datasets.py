#!/usr/bin/env python3
"""
Medical RAG System - Kaggle Dataset Downloader
Downloads and processes medical datasets from Kaggle for the RAG system
"""

import os
import json
import pandas as pd
import psycopg2
from kaggle.api.kaggle_api_extended import KaggleApi
import zipfile
import shutil
from pathlib import Path

# Configuration
DATASETS_DIR = "datasets"
KAGGLE_CONFIG = {
    "username": "",  # You'll need to set this
    "key": ""        # You'll need to set this
}

# Medical datasets to download
MEDICAL_DATASETS = [
    {
        "name": "heart-disease-dataset",
        "kaggle_ref": "johnsmith88/heart-disease-dataset",
        "description": "Heart disease prediction dataset"
    },
    {
        "name": "diabetes-dataset",
        "kaggle_ref": "kandij/diabetes-dataset",
        "description": "Diabetes prediction dataset"
    },
    {
        "name": "medical-appointment-no-shows",
        "kaggle_ref": "joniarroba/noshowappointments",
        "description": "Medical appointment no-shows dataset"
    },
    {
        "name": "medical-cost-personal-datasets",
        "kaggle_ref": "mirichoi0218/insurance",
        "description": "Medical insurance cost dataset"
    },
    {
        "name": "stroke-prediction-dataset",
        "kaggle_ref": "fedesoriano/stroke-prediction-dataset",
        "description": "Stroke prediction dataset"
    }
]

def setup_kaggle_api():
    """Setup Kaggle API with credentials"""
    print("🔧 Setting up Kaggle API...")
    
    # Check if kaggle.json exists
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_json = kaggle_dir / "kaggle.json"
    
    if not kaggle_json.exists():
        print("❌ Kaggle API credentials not found!")
        print("📋 Please follow these steps:")
        print("1. Go to https://www.kaggle.com/account")
        print("2. Click 'Create New API Token'")
        print("3. Download kaggle.json")
        print("4. Place it in:", kaggle_json)
        print("5. Run this script again")
        return False
    
    try:
        api = KaggleApi()
        api.authenticate()
        print("✅ Kaggle API authenticated successfully!")
        return api
    except Exception as e:
        print(f"❌ Failed to authenticate with Kaggle: {e}")
        return False

def download_dataset(api, dataset_ref, dataset_name):
    """Download a dataset from Kaggle"""
    print(f"📥 Downloading {dataset_name}...")
    
    try:
        # Create dataset directory
        dataset_path = Path(DATASETS_DIR) / dataset_name
        dataset_path.mkdir(parents=True, exist_ok=True)
        
        # Download dataset
        api.dataset_download_files(
            dataset_ref,
            path=str(dataset_path),
            unzip=True
        )
        
        print(f"✅ Downloaded {dataset_name} successfully!")
        return dataset_path
    except Exception as e:
        print(f"❌ Failed to download {dataset_name}: {e}")
        return None

def process_heart_disease_dataset(dataset_path):
    """Process heart disease dataset"""
    print("🫀 Processing heart disease dataset...")
    
    csv_files = list(dataset_path.glob("*.csv"))
    if not csv_files:
        print("❌ No CSV files found in heart disease dataset")
        return []
    
    df = pd.read_csv(csv_files[0])
    print(f"📊 Found {len(df)} records in heart disease dataset")
    
    # Convert to medical records format
    records = []
    for _, row in df.iterrows():
        record = {
            "patient_id": f"HD_{row.get('id', len(records) + 1)}",
            "first_name": f"Patient_{row.get('id', len(records) + 1)}",
            "last_name": "Heart_Disease",
            "date_of_birth": "1980-01-01",  # Default date
            "gender": "Male" if row.get('sex', 1) == 1 else "Female",
            "medical_history": f"Heart disease risk factors: Age {row.get('age', 'Unknown')}, Chest pain type {row.get('cp', 'Unknown')}",
            "allergies": "None known",
            "current_medications": "Cardiac medications as prescribed",
            "hospital_id": 1
        }
        records.append(record)
    
    return records

def process_diabetes_dataset(dataset_path):
    """Process diabetes dataset"""
    print("🍯 Processing diabetes dataset...")
    
    csv_files = list(dataset_path.glob("*.csv"))
    if not csv_files:
        print("❌ No CSV files found in diabetes dataset")
        return []
    
    df = pd.read_csv(csv_files[0])
    print(f"📊 Found {len(df)} records in diabetes dataset")
    
    # Convert to medical records format
    records = []
    for _, row in df.iterrows():
        record = {
            "patient_id": f"DB_{len(records) + 1}",
            "first_name": f"Patient_{len(records) + 1}",
            "last_name": "Diabetes",
            "date_of_birth": "1985-01-01",  # Default date
            "gender": "Male" if row.get('Gender', 'Male') == 'Male' else "Female",
            "medical_history": f"Diabetes risk factors: Age {row.get('Age', 'Unknown')}, BMI {row.get('BMI', 'Unknown')}",
            "allergies": "None known",
            "current_medications": "Diabetes medications as prescribed",
            "hospital_id": 2
        }
        records.append(record)
    
    return records

def process_stroke_dataset(dataset_path):
    """Process stroke dataset"""
    print("🧠 Processing stroke dataset...")
    
    csv_files = list(dataset_path.glob("*.csv"))
    if not csv_files:
        print("❌ No CSV files found in stroke dataset")
        return []
    
    df = pd.read_csv(csv_files[0])
    print(f"📊 Found {len(df)} records in stroke dataset")
    
    # Convert to medical records format
    records = []
    for _, row in df.iterrows():
        record = {
            "patient_id": f"ST_{len(records) + 1}",
            "first_name": f"Patient_{len(records) + 1}",
            "last_name": "Stroke",
            "date_of_birth": "1975-01-01",  # Default date
            "gender": "Male" if row.get('gender', 'Male') == 'Male' else "Female",
            "medical_history": f"Stroke risk factors: Age {row.get('age', 'Unknown')}, Hypertension {row.get('hypertension', 'Unknown')}",
            "allergies": "None known",
            "current_medications": "Neurological medications as prescribed",
            "hospital_id": 3
        }
        records.append(record)
    
    return records

def insert_patients_to_database(patients_data, hospital_id):
    """Insert patient data into PostgreSQL database"""
    print(f"💾 Inserting {len(patients_data)} patients into hospital {hospital_id} database...")
    
    # Database connection
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': f'fmed_h{hospital_id}',
        'user': 'postgres',
        'password': 'n2pyy3x5sd'
    }
    
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        for patient in patients_data:
            insert_query = """
            INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, 
                                medical_history, allergies, current_medications, hospital_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (patient_id) DO NOTHING
            """
            
            cursor.execute(insert_query, (
                patient['patient_id'],
                patient['first_name'],
                patient['last_name'],
                patient['date_of_birth'],
                patient['gender'],
                patient['medical_history'],
                patient['allergies'],
                patient['current_medications'],
                patient['hospital_id']
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Successfully inserted patients into hospital {hospital_id} database!")
        
    except Exception as e:
        print(f"❌ Failed to insert patients into database: {e}")

def main():
    """Main function to download and process datasets"""
    print("🏥 Medical RAG System - Kaggle Dataset Downloader")
    print("=" * 50)
    
    # Setup Kaggle API
    api = setup_kaggle_api()
    if not api:
        return
    
    # Create datasets directory
    Path(DATASETS_DIR).mkdir(exist_ok=True)
    
    # Download and process datasets
    for dataset in MEDICAL_DATASETS:
        print(f"\n📦 Processing {dataset['name']}...")
        
        # Download dataset
        dataset_path = download_dataset(api, dataset['kaggle_ref'], dataset['name'])
        if not dataset_path:
            continue
        
        # Process based on dataset type
        patients_data = []
        if 'heart-disease' in dataset['name']:
            patients_data = process_heart_disease_dataset(dataset_path)
        elif 'diabetes' in dataset['name']:
            patients_data = process_diabetes_dataset(dataset_path)
        elif 'stroke' in dataset['name']:
            patients_data = process_stroke_dataset(dataset_path)
        
        # Insert into database
        if patients_data:
            hospital_id = 1 if 'heart' in dataset['name'] else (2 if 'diabetes' in dataset['name'] else 3)
            insert_patients_to_database(patients_data, hospital_id)
    
    print("\n🎉 Dataset download and processing complete!")
    print("📊 Your medical RAG system now has real medical data!")

if __name__ == "__main__":
    main()
