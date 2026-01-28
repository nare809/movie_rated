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
        
        {/* SEO Friendly Modal Routes - Render Home in background */}
        <Route path="movie/:id" element={<Home />} />
        <Route path="movie/:id/:slug" element={<Home />} />
        <Route path="tv/:id" element={<Home />} />
        <Route path="tv/:id/:slug" element={<Home />} />
      </Route>
      <Route path="watch/:type/:id" element={<Player />}>
         <Route path=":slug" element={<Player />} />
      </Route>
      {/* React Router v6 optional param syntax is often handled by separate routes or just :slug? but v6 doesn't support ? syntax in path like v5. 
          Actually v6 supports optional params via separate route definitions or nested keys, but easiest is to just add a separate route matching the pattern. 
          WAIT: v6 does NOT support regex-like optional params directly in one string easily without newer features.
          The cleanest way in v6 is often just adding the extra route.
      */}
      <Route path="watch/:type/:id/:slug" element={<Player />} />
      <Route path="watch/:type/:id" element={<Player />} />
      
      <Route path="watch/:type/:id/:season/:episode/:slug" element={<Player />} />
      <Route path="watch/:type/:id/:season/:episode" element={<Player />} />
    </Routes>
  );
}

export default App;
