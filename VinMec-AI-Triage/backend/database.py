"""
MongoDB Atlas connection and collection references.
Sets up text index as fallback for RAG.

NOTE: Atlas Vector Search index 'symptom_vector_index' must be created
manually via Atlas UI. See PLAN_LOG.md Phase 2 for index definition.
"""

from pymongo import MongoClient
from config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]
logs_collection = db[settings.COLLECTION_NAME]

# Text index fallback (idempotent, safe on every startup)
try:
    logs_collection.create_index(
        [("raw_symptom", "text"), ("user_final_choice", "text")],
        name="symptom_text_index",
        default_language="none",  # Disable stemming for Vietnamese
    )
except Exception:
    pass  # Index already exists
