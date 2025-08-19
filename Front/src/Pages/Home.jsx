import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import ActorMovieCard from "../components/ActorMovieCard";
import { useFavorites } from "../context/FavoritesContext";
import { searchMovies, popularMovies, upcomingMovies } from "../api";
import Slider from "react-slick";
import SliderModule from "../components/SliderModule";
import IntroGrid from "../components/IntroGrid"; 
const API_URL = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const [movies, setMovies] = useState([]);
  const [popular, setPopular] = useState([]);
  const { favorites, toggleFavorite } = useFavorites();
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsByActor, setRecommendationsByActor] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [recommendationsByGenres, setRecommendationsByGenres] = useState({});
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(false); // <-- loader
  const [backendAlertShown, setBackendAlertShown] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenIntro");
    if (seen) setShowIntro(false);
  }, []);

  const handleContinue = () => {
    localStorage.setItem("hasSeenIntro", "true");
    setShowIntro(false);
  };

  // Cargar populares y próximos lanzamientos
  useEffect(() => {
    const loadPopular = async () => {
      try {
        const results = await popularMovies();
        setPopular(results.slice(0, 10));
      } catch (error) {
        console.error("Error al cargar películas populares:", error);
        setPopular([]);
      }
    };

    const loadUpcoming = async () => {
      try {
        const results = await upcomingMovies();
        setUpcoming(results);
      } catch (error) {
        console.error("Error al cargar próximos estrenos:", error);
        setUpcoming([]);
      }
    };

    loadPopular();
    loadUpcoming();
  }, []);

  const handleSearch = async (query) => {
    const results = await searchMovies(query);
    setMovies(results);
    setRecommendations([]);
  };

  const fetchWithLoader = async (url, body, setter) => {
    if (favorites.length === 0) {
      setter([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setter(data.recommendations);
    } catch (error) {
      console.error("❌ Error al obtener recomendaciones:", error);
      setter([]);
    } finally {
      setLoading(false);
      clearTimeout(alertTimeout);
    }
  };

  const getRecommendations = () => fetchWithLoader("/recommend", { favorites }, setRecommendations);
  const getRecommendationsByActor = () => fetchWithLoader("/recommend-by-actors", { favorites }, setRecommendationsByActor);
  const getRecommendationsByGenres = () => fetchWithLoader("/recommend-by-genres", { favorites }, setRecommendationsByGenres);

  useEffect(() => {
    getRecommendations();
    getRecommendationsByActor();
    getRecommendationsByGenres();
  }, []);

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 8,
    arrows: true,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 3 } },
    ],
  };

  if (showIntro) return <IntroGrid movies={movies} onContinue={handleContinue} />;

  return (
    <div className="bg-neutral-950 text-white min-h-full w-full pb-5">
      {popular.length > 0 && <SliderModule movies={popular} />}

      {loading && (
        <div className="text-center mt-10 text-xl bg-neutral-950">
          🔄 Cargando recomendaciones...
        </div>
      )}
      {recommendations.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">🎯 Recomendaciones segun tus gustos</h2>
          <Slider {...sliderSettings} className="mx-8">
            {recommendations.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.some((fav) => fav.id === movie.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </Slider>
        </>
      )}

      {recommendationsByActor.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">🎯 Recomendaciones por tus actores favoritos</h2>
          <Slider {...sliderSettings} className="mx-8">
            {recommendationsByActor.map((movie) => (
              <ActorMovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.some((fav) => fav.id === movie.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </Slider>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">🚀 Próximos lanzamientos destacados</h2>
          <Slider {...sliderSettings} className="mx-8">
            {upcoming.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={false}
                onToggleFavorite={() => {}}
              />
            ))}
          </Slider>
        </>
      )}

      {Object.entries(recommendationsByGenres).map(([genre, movies]) => (
        <div key={genre}>
          <h2 className="text-2xl font-bold mt-6 mb-2">🎬 {genre}</h2>
          <Slider {...sliderSettings} className="mx-8">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.some((fav) => fav.id === movie.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </Slider>
        </div>
      ))}
    </div>
  );
}

export default Home;
