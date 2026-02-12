from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
import pandas as pd # type: ignore
from typing import List, Dict, Optional

# -----------------------------
# Constants
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TMDB_BASE_URL = "https://image.tmdb.org/t/p/w500"
PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750?text=No+Image"

MOVIES_PKL = os.path.join(BASE_DIR, "movies.pkl")
SIMILARITY_PKL = os.path.join(BASE_DIR, "similarity.pkl")
VECTORIZER_PKL = os.path.join(BASE_DIR, "vectorizer.pkl")

# -----------------------------
# Load Data
# -----------------------------
with open(MOVIES_PKL, "rb") as f:
    movies: pd.DataFrame = pickle.load(f)

with open(SIMILARITY_PKL, "rb") as f:
    similarity: list = pickle.load(f)

with open(VECTORIZER_PKL, "rb") as f:
    vectorizer = pickle.load(f)

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(
    title="Movie Recommendation API",
    version="1.0",
    description="A simple movie recommendation system using FastAPI and similarity matrix."
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Model
# -----------------------------
class MovieRequest(BaseModel):
    movie_name: str

# -----------------------------
# Utility Functions
# -----------------------------
def get_poster_url(index: int) -> str:
    """Return full poster URL or placeholder."""
    if "poster_path" in movies.columns:
        poster_path = movies.iloc[index].poster_path
        if poster_path and poster_path.strip():
            return TMDB_BASE_URL + poster_path
    return PLACEHOLDER_POSTER

def recommend_movies(movie_name: str, top_n: int = 6) -> Optional[List[Dict[str, str]]]:
    """Return top N recommended movies for a given movie name."""
    movie_name_lower = movie_name.lower()
    if movie_name_lower not in movies['title'].str.lower().values:
        return None

    movie_index = movies[movies['title'].str.lower() == movie_name_lower].index[0]
    distances = similarity[movie_index]
    top_indices = sorted(
        list(enumerate(distances)), 
        reverse=True, 
        key=lambda x: x[1]
    )[1:top_n + 1]

    return [
        {
            "title": movies.iloc[i[0]].title,
            "poster": get_poster_url(i[0])
        }
        for i in top_indices
    ]

# -----------------------------
# API Endpoints
# -----------------------------
@app.get("/", tags=["Home"])
def home():
    return {"message": "Movie Recommendation API is running 🚀"}

@app.post("/recommend", tags=["Recommendations"])
def get_recommendation(request: MovieRequest):
    recommendations = recommend_movies(request.movie_name)
    if recommendations is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {
        "input_movie": request.movie_name,
        "recommendations": recommendations
    }

@app.get("/movies", tags=["Movies"])
def get_movies() -> Dict[str, List[str]]:
    """Return all movie titles."""
    return {"movies": movies['title'].tolist()}
