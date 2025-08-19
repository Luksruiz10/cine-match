import { Link } from "react-router-dom";

function MovieCard({ movie, isFavorite, onToggleFavorite }) {
  return (
    <div className="rounded items-center flex flex-col px-2">
      <Link to={`/movie/${movie.id}`}>
      {/* <h2 className="text-lg font-semibold">{movie.title}</h2> */}
      {movie.poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
          alt={movie.title}
          className="rounded mt-2 w-68 h-92"
        />
      )}</Link>
      <button
        onClick={() => onToggleFavorite(movie)}
        className={`mt-2 w-full py-1 rounded ${
          isFavorite ? "bg-red-500" : "bg-green-500"
        } text-white`}
      >
        {isFavorite ? "Quitar de favoritos ❤️" : "Agregar a favoritos 💚"}
      </button>
    </div>
  );
}

export default MovieCard;
