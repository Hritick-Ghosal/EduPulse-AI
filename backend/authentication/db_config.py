import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

# Look for the .env file in the repository root directory (EduPulse-AI/.env) with fallback to backend
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
env_path = ROOT_DIR / '.env' if (ROOT_DIR / '.env').exists() else (BASE_DIR / '.env')

# Explicitly pass the strict absolute path parameters to load_dotenv
load_dotenv(dotenv_path=env_path)

_mongo_client = None

def get_db_credentials():
    """Extracts credentials safely from environment variables with fallbacks."""
    user = os.getenv("MONGO_DB_USER")
    passwd = os.getenv("MONGO_DB_PASSWORD")
    cluster = os.getenv("MONGO_DB_CLUSTER")
    db_name = os.getenv("MONGO_DB_NAME")

    # Safety Check: Warn early before passing bad variables to PyMongo
    if not all([user, passwd, cluster, db_name]):
        raise RuntimeError(
            f"Environment Loading Failure: Double check your .env file is present at '{env_path}' "
            f"and contains all variables. Currently loaded: USER={user}, CLUSTER={cluster}"
        )

    return {
        "user": user,
        "pass": passwd,
        "cluster": cluster,
        "name": db_name,
    }

def get_mongo_client():
    """Initializes and caches the MongoDB client with sensible timeouts."""
    global _mongo_client
    if _mongo_client is None:
        creds = get_db_credentials()
        uri = f"mongodb+srv://{creds['user']}:{creds['pass']}@{creds['cluster']}/{creds['name']}?retryWrites=true&w=majority"
        _mongo_client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _mongo_client

def get_mongo_collection(collection_name):
    """Establishes connection to the target MongoDB Atlas cluster collection."""
    creds = get_db_credentials()
    client = get_mongo_client()
    db = client[creds['name']]
    return db[collection_name]
