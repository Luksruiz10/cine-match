import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [showInput, setShowInput] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
      <button
        type="button"
        onClick={() => setShowInput((prev) => !prev)}
        className="text-white hover:text-blue-400 transition"
        title="Buscar"
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {showInput && (
        <>
          <input
            type="text"
            placeholder="Buscar películas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 rounded text-white transition-all duration-300 w-56"
          />
        </>
      )}
    </form>
  );
}

export default SearchBar;

