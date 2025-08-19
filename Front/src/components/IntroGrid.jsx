import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../context/FavoritesContext";
import SearchBar from "./SearchBar";
const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function IntroGrid({ movies, onContinue, showSearch = true }) {
  const [introMovies, setIntroMovies] = useState([]);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenIntro");
    if (!seen) {
      // Traer películas del backend
      fetch(`${API_URL}/intro-movies`)
        .then((res) => res.json())
        .then((data) => setIntroMovies(data.slice(0, 100)))
        .catch((err) => console.error(err));
    }
  }, []);

  return (
    <div className="bg-black text-white p-4">
      {/* comentario random */}
      <div className="m-auto max-w-[80vw] ">
        <div className="min-w-[192px] flex justify-end items-center">
          {showSearch && <SearchBar />}
        </div>
        <h1 className="text-3xl font-bold mb-4">Películas Destacadas</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 m-auto">
          {introMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={favorites.some((fav) => fav.id === movie.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onContinue}
        className="mt-4 px-6 py-2 bg-green-500 rounded text-white"
      >
        Ver Recomendaciones
      </button>
    </div>
  );
}
