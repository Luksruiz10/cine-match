import { Link } from "react-router-dom";

function ActorMovieCard({ movie, isFavorite, onToggleFavorite }) {
  return (
    <div className=" rounded-lg overflow-hidden shadow-md px-2">
      <Link to={`/movie/${movie.id}`}>
      {/* 🎬 Carátula de la película */}
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="rounded mt-2 w-68 h-92"
      />
      </Link>

      {/* 📝 Título de la película */}
      <div>
        {/* 👥 Actores compartidos */}
        {movie.shared_actors && movie.shared_actors.length > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            {movie.shared_actors.slice(0, 5).map((actor, index) => (
              <div
                key={index}
                className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  title={actor.name}
                />
              </div>
            ))}
          </div>
        )}

        {/* ⭐ Botón de favorito */}
        <button
          onClick={() => onToggleFavorite(movie)}
          className={`mt-3 w-full py-1 rounded ${
            isFavorite ? "bg-red-500" : "bg-green-500"
          } hover:opacity-90`}
        >
          {isFavorite ? "❤️ Quitar" : "⭐ Favorito"}
        </button>
      </div>
    </div>
  );
}

export default ActorMovieCard;
