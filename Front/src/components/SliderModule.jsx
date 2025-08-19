import { useState, useEffect } from "react";
import NavBar from "./NavBar";
import { useFavorites } from "../context/FavoritesContext";
import { SlLike } from "react-icons/sl";
import { Link } from "react-router-dom";

const SliderModule = ({ movies }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  // Calcula el orden rotativo de miniaturas (sin incluir la actual)
  const getRotatingThumbnails = () => {
    return movies
      .slice(currentIndex + 1)
      .concat(movies.slice(0, currentIndex))
      .slice(0, 5); // máximo 5 miniaturas visibles
  };

  

  return (
    <div className="relative max-w-full h-screen overflow-hidden bg-black">
      <NavBar showSearch={true} customClasses="" />
      {/* Fondo con transiciones */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Link to={`/movie/${movie.id}`}>
          <img
            src={`https://image.tmdb.org/t/p/original${
              movie.backdrop_path || movie.poster_path
            }`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          
          {/* Sombra radial */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_80%)]" />
          </Link>
          {/* Texto */}
          <div className="absolute top-[30%] left-[5%] max-w-[80%] md:top-[40%] md:left-[5%] md:max-w-[40%] text-white z-20">
            <h2 className="text-4xl md:text-7xl font-bold md:break-words">
              {movie.title}
            </h2>
            <div className="flex flex-row gap-4 my-5">
            <p className="text-green-400 text-xl md:text-2xl font-semibold mt-2">
              ⭐ {movie.vote_average}
            </p>
            <SlLike
              key={movie.id}
              onClick={() => toggleFavorite(movie)}
              className={`mt-2 py-1 rounded-3xl w-8 h-8 ${
                favorites.some((fav) => fav.id === movie.id) ? "bg-green-500" : "bg-transparent"
              } text-white`}
            />
            </div>
            <p className="max-w-2xl mt-4">{movie.overview?.slice(0, 600)}...</p>
            
          </div>
        </div>
      ))}

      {/* Miniaturas (sin la actual, rotativas) */}
      <div className="absolute top-[70%] left-[90%] -translate-x-1/2 z-30 w-full flex justify-center">
        <div className="flex gap-3 overflow-hidden max-w-[90vw] px-4">
          {getRotatingThumbnails().map((movie, i) => (
            <div
              key={movie.id}
              className="w-48 h-72 shrink-0 rounded-lg overflow-hidden hover:scale-105 transition cursor-pointer"
              onClick={() =>
                setCurrentIndex((currentIndex + i + 1) % movies.length)
              }
            >
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botones navegación */}
      <div className="absolute top-[85%] left-1/2 -translate-x-1/2 flex gap-4 z-30">
        <button
          onClick={goToPrev}
          className="w-10 h-10 rounded-full bg-green-500 text-white font-bold hover:bg-white hover:text-black transition"
        >
          &lt;
        </button>
        <button
          onClick={goToNext}
          className="w-10 h-10 rounded-full bg-green-500 text-white font-bold hover:bg-white hover:text-black transition"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default SliderModule;
