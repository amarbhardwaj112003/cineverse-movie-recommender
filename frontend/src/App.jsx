import React, { useState, useEffect } from "react";
import { getRecommendations, getMovies } from "./services/api";

function App() {
  const [movieName, setMovieName] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);

  // Load movies once
  useEffect(() => {
    const fetchMovies = async () => {
      const data = await getMovies();
      setMovies(data);
    };
    fetchMovies();
  }, []);

  // Search filter
  const handleSearch = (value) => {
    setMovieName(value);

    if (!value) {
      setFilteredMovies([]);
      return;
    }

    const filtered = movies.filter((movie) =>
      movie.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredMovies(filtered.slice(0, 5));
  };

  // Get recommendations
  const handleRecommend = async (selectedMovie) => {
    const movieToSearch = selectedMovie || movieName;
    if (!movieToSearch) return;

    const recs = await getRecommendations(movieToSearch);
    setRecommendations(recs);
    setFilteredMovies([]);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-purple-900 to-indigo-900 text-white flex flex-col">

      {/* Header Section */}
      <div className="w-full text-center py-10 px-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-wide">
          🎬 CineVerse
        </h1>
        <p className="mt-3 text-gray-300 text-sm sm:text-base">
          Discover movies you’ll love
        </p>
      </div>

      {/* Search Section */}
      <div className="w-full flex flex-col items-center px-4">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search a movie..."
            value={movieName}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400 text-sm sm:text-base"
          />

          {/* Dropdown */}
          {filteredMovies.length > 0 && (
            <div className="absolute w-full bg-gray-900 border border-gray-700 rounded-xl mt-2 shadow-xl z-20">
              {filteredMovies.map((movie, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-gray-700 cursor-pointer transition-all"
                  onClick={() => handleRecommend(movie)}
                >
                  {movie}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleRecommend()}
          className="mt-6 bg-yellow-400 text-black px-10 py-3 rounded-full font-semibold hover:bg-yellow-500 transition duration-300 shadow-lg"
        >
          Get Recommendations
        </button>
      </div>

      {/* Recommendation Section */}
      <div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-10">
        {recommendations.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full">
            {recommendations.map((movie, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-tr from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300 flex items-center justify-center text-center min-h-[140px]"
              >
                <p className="font-semibold text-base sm:text-lg">
                  {movie.title}
                </p>
              </div>
            ))}
          </div>
        ) : (
          movieName && (
            <div className="text-center text-gray-400 mt-10">
              No recommendations found. Try another movie.
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
