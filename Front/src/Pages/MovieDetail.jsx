import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useFavorites } from "../context/FavoritesContext";
import { SlLike } from "react-icons/sl";
import { getMovieImages, getMovieProviders } from "../api";
const API_URL = import.meta.env.VITE_BACKEND_URL;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function MovieDetail() {
  const { id } = useParams(); // ID de la película
  const [movie, setMovie] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [images, setImages] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Obtener datos de la película desde TMDB
  useEffect(() => {
    const fetchMovie = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=es`
      );
      const data = await res.json();
      setMovie(data);
    };

    fetchMovie();
  }, [id]);

  // Obtener compatibilidad desde Flask
  useEffect(() => {
    const fetchCompatibility = async () => {
      if (favorites.length === 0) return;

      try {
        const res = await fetch(`${API_URL}/compatibility`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie_id: parseInt(id), favorites }),
        });

        const data = await res.json();
        setCompatibility(data.compatibility);
      } catch (error) {
        console.error("Error al calcular compatibilidad:", error);
      }
    };

    fetchCompatibility();
  }, [id, favorites]);

  useEffect(() => {
    const fetchImages = async () => {
      const data = await getMovieImages(id);
      setImages(data.backdrops.slice(0, 6));
    };
    fetchImages();
  }, [id]);

  useEffect(() => {
    const fetchProviders = async () => {
      const data = await getMovieProviders(id, "ES");
      setProviders(data);
    };
    fetchProviders();
  }, [id]);

  if (!movie) return <div className="text-white p-8">Cargando...</div>;

  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      <NavBar showSearch={true} />
      <div className="max-w-[1400px] mx-auto p-8 flex md:flex-col gap-8 pt-30">
        <div className="flex md:flex-row mx-auto gap-10">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-68 h-92 rounded-lg shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold">{movie.title}</h1>
            <div className="flex flex-row gap-3">
              <p className="text-green-400 text-2xl mt-2">
                ⭐ {movie.vote_average}
              </p>
              <SlLike
                key={movie.id}
                onClick={() => toggleFavorite(movie)}
                className={`mt-2 py-1 rounded-3xl w-8 h-8 ${
                  favorites.some((fav) => fav.id === movie.id)
                    ? "bg-green-500"
                    : "bg-transparent"
                } text-white`}
              />
            </div>
            <p className="mt-4 text-lg">{movie.overview}</p>
            {compatibility !== null && (
              <p className="text-green-400 text-xl mt-4">
                Compatibilidad con tus gustos:{" "}
                {(compatibility * 100).toFixed(1)}%
              </p>
            )}
            {providers.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">
                  Disponible en plataformas:
                </h2>
                <div className="flex flex-wrap gap-6 items-center">
                  {providers.map((prov) => (
                    <div
                      key={prov.provider_id}
                      className="flex flex-col items-center gap-2"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/original${prov.logo_path}`}
                        alt={prov.provider_name}
                        className="w-12 h-12 rounded-full shadow-md"
                      />
                      <span className="text-sm">{prov.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <img
            src={
              selectedImage
                ? `https://image.tmdb.org/t/p/original${selectedImage}`
                : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            }
            alt="Backdrop"
            className="rounded-lg shadow-md max-h-full object-contain w-full"
          />
        </div>

        <div className="mt-6 px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                alt={`Backdrop ${index}`}
                onClick={() => setSelectedImage(img.file_path)}
                className={`rounded-lg shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer ${
                  selectedImage === img.file_path ? "ring-4 ring-[#E07A5F]" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
