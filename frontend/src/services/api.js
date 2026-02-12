import axios from "axios";

// -----------------------------
// Axios instance for backend
// -----------------------------
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend
  timeout: 5000,                     // 5-second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------
// Get movie recommendations
// -----------------------------
export const getRecommendations = async (movieName) => {
  if (!movieName) return [];

  try {
    const response = await api.post("/recommend", { movie_name: movieName });
    return response?.data?.recommendations || [];
  } catch (error) {
    console.error(
      "Error fetching recommendations:",
      error.response?.data || error.message
    );
    return [];
  }
};

// -----------------------------
// Get all movie titles for dropdown
// -----------------------------
export const getMovies = async () => {
  try {
    const response = await api.get("/movies");
    return response?.data?.movies || [];
  } catch (error) {
    console.error("Error fetching movies:", error.response?.data || error.message);
    return [];
  }
};

// -----------------------------
// Optional: export axios instance
// -----------------------------
export default api;
