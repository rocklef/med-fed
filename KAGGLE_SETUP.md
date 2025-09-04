# 🏥 Medical RAG System - Kaggle Dataset Setup

## 📋 Prerequisites

1. **Kaggle Account**: Sign up at [kaggle.com](https://www.kaggle.com)
2. **Python**: Already installed ✅
3. **Kaggle API**: Already installed ✅

## 🔑 Step 1: Get Kaggle API Credentials

1. Go to [Kaggle Account Settings](https://www.kaggle.com/account)
2. Scroll down to "API" section
3. Click **"Create New API Token"**
4. This will download `kaggle.json` file
5. Place the file in: `C:\Users\ASUS\.kaggle\kaggle.json`

## 🚀 Step 2: Run the Dataset Downloader

```bash
python download-kaggle-datasets.py
```

## 📊 What This Will Do

The script will download these medical datasets:

1. **Heart Disease Dataset** → Hospital 1 Database
2. **Diabetes Dataset** → Hospital 2 Database  
3. **Stroke Prediction Dataset** → Hospital 3 Database
4. **Medical Appointment Data** → Aggregator Database
5. **Insurance Cost Data** → Aggregator Database

## 🎯 Expected Results

- **Real medical data** from thousands of patients
- **Multiple disease types** for comprehensive RAG training
- **Structured data** ready for Llama 3 processing
- **Hospital-specific datasets** for federated learning

## 🔍 After Download

Your RAG system will have:
- ✅ Real patient records
- ✅ Medical conditions and treatments
- ✅ Lab results and diagnoses
- ✅ Rich context for Llama 3

## 🚨 Troubleshooting

If you get authentication errors:
1. Check `kaggle.json` is in the right location
2. Verify your Kaggle account is active
3. Make sure you have internet connection

## 🎉 Next Steps

After downloading datasets:
1. Start your backend server: `cd server && npm run dev`
2. Test with real medical queries
3. Enjoy your powerful medical RAG system!

---

**Ready to get real medical data? Let's do this! 🚀**
