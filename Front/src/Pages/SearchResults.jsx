import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { searchMovies } from "../api";
import { useFavorites } from "../context/FavoritesContext";
import NavBar from "../components/NavBar";

function SearchResults() {
  const { favorites, toggleFavorite } = useFavorites();
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        const movies = await searchMovies(query);
        setResults(movies);
      }
    };
    fetchResults();
  }, [query]);

  const hasSeenIntro = localStorage.getItem("hasSeenIntro");

  const handleBack = () => {
    navigate("/"); // vuelve al IntroGrid
  };

  if (!hasSeenIntro) {
    // Usuario todavía no pasó al Home, mostrar botón para volver
    return (
      <div className="p-4 bg-neutral-950 text-white min-h-screen">
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-2 bg-green-500 rounded text-white"
        >
          Volver
        </button>
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4 pt-4">
            {results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.some((fav) => fav.id === movie.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>
    );
  }

  // Usuario ya pasó al Home, mostrar normalmente con navbar
  return (
    <div className="p-4 bg-neutral-950 text-white min-h-screen">
      <NavBar />
      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 pt-4">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={favorites.some((fav) => fav.id === movie.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <p>No se encontraron resultados.</p>
      )}
    </div>
  );
}

export default SearchResults;
