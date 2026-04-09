from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import google.generativeai as genai
import datetime
import os
import json
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
api_key = os.getenv("GEMINI_API_KEY")

app = FastAPI(title="Vinmec AI Triage Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(mongo_uri)
db = client["vinmec_hackathon"]
logs_collection = db["triage_flywheel"]

genai.configure(api_key=api_key)
model = genai.GenerativeModel(
    "gemini-2.5-flash", generation_config={"response_mime_type": "application/json"}
)


class TriageRequest(BaseModel):
    symptom: str


class FeedbackRequest(BaseModel):
    log_id: str
    user_final_choice: str
    handoff_triggered: bool
    user_rating: Optional[bool] = None


@app.post("/api/agent/triage")
async def get_triage(request: TriageRequest):
    try:
        prompt = f"""
        Bạn là bác sĩ phân loại bệnh nhân tại bệnh viện VinMec. 
        Phân tích triệu chứng sau và trả về Top 3 chuyên khoa phù hợp nhất.
        Bắt buộc trả về đúng định dạng JSON này:
        {{"top_3": [{{"department": "tên khoa", "confidence": số_từ_1_đến_100}}]}}
        Triệu chứng của bệnh nhân: "{request.symptom}"
        """

        response = model.generate_content(prompt)
        ai_result = json.loads(response.text)

        log_data = {
            "raw_symptom": request.symptom,
            "ai_top_3": ai_result.get("top_3", []),
            "user_final_choice": None,
            "is_corrected": False,
            "handoff_triggered": False,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
        }
        insert_result = logs_collection.insert_one(log_data)

        return {"log_id": str(insert_result.inserted_id), "result": ai_result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/feedback")
async def save_feedback(request: FeedbackRequest):
    try:
        old_log = logs_collection.find_one({"_id": ObjectId(request.log_id)})
        if not old_log:
            raise HTTPException(status_code=404, detail="Log not found")

        top_1_ai = old_log["ai_top_3"][0]["department"] if old_log["ai_top_3"] else ""
        is_corrected = request.user_final_choice != top_1_ai

        logs_collection.update_one(
            {"_id": ObjectId(request.log_id)},
            {
                "$set": {
                    "user_final_choice": request.user_final_choice,
                    "handoff_triggered": request.handoff_triggered,
                    "is_corrected": is_corrected,
                    "user_rating": request.user_rating,
                }
            },
        )
        return {"status": "success", "message": "Flywheel data updated!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
