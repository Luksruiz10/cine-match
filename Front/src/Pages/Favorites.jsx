import MovieCard from "../components/MovieCard";
import NavBar from "../components/NavBar";
import { useFavorites } from "../context/FavoritesContext";

function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div className="bg-neutral-950 w-screen min-h-screen">
      <NavBar showSearch={true} customClasses="bg-black shadow-lg text-white" />
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 pt-20">
        {favorites.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={true}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

export default Favorites;
