import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import CollectionDetails from './pages/CollectionDetails';
import FeaturedCollections from './pages/FeaturedCollections';
import UserListPage from './pages/UserListPage';
import Player from './pages/Player';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="collections" element={<FeaturedCollections />} />
        <Route path="my-favourites" element={<UserListPage mode="favorites" />} />
        <Route path="my-list" element={<UserListPage mode="watchlist" />} />
        <Route path="collection/:id" element={<CollectionDetails />} />
        
        {/* SEO Friendly Discovery Routes */}
        <Route path="movies" element={<Home />} />
        <Route path="movies/:genre" element={<Home />} />
        <Route path="tv" element={<Home />} />
        <Route path="tv/:genre" element={<Home />} />

        {/* SEO Friendly Modal Routes - Render Home in background */}
        <Route path="movie/:id" element={<Home />} />
        <Route path="movie/:id/:slug" element={<Home />} />
        <Route path="tv/:id" element={<Home />} />
        <Route path="tv/:id/:slug" element={<Home />} />
      </Route>
      <Route path="watch/:type/:id" element={<Player />} />
      <Route path="watch/:type/:id/:slug" element={<Player />} />
      <Route path="watch/:type/:id/:season/:episode" element={<Player />} />
      <Route path="watch/:type/:id/:season/:episode/:slug" element={<Player />} />
    </Routes>
  );
}

export default App;
