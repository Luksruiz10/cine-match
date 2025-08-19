import Home from './Pages/Home';
import { FavoritesProvider } from "./context/FavoritesContext";
import Favorites from './Pages/Favorites';
import SearchResults from './Pages/SearchResults';
import { Routes, Route } from 'react-router-dom';
import MovieDetail from "./Pages/MovieDetail"; // 👈 nuevo componente

function App() {
  return (
    <FavoritesProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/movie/:id" element={<MovieDetail />} /> {/* 👈 RUTA DINÁMICA */}
      </Routes>
    </FavoritesProvider>
  );
}

export default App;

