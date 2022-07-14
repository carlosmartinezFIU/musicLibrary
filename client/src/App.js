import './App.css';
import HomePage from './components/HomePage/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SignUp from './components/SignUp/SignUp';
import SearchPage from './components/SearchPage/SearchPage';
import ArtistPage from './components/ArtistPage/ArtistPage';
import 'react-toastify/dist/ReactToastify.css';

import { DataProvider } from './components/DataContext/DataContext';
import AlbumList from './components/ProfileList/AlbumList/AlbumList';
import { SkeletonTheme } from 'react-loading-skeleton'

function App() {
  return (
    <DataProvider>
      <SkeletonTheme baseColor='#313131' highlightColor='#525252'>
        <div className="App">
          <Router>
              <Routes>
                <Route path='/' element={<SignUp />} />
                <Route path='/song-list' element={<HomePage />} />
                <Route path='/search-artist' element={<SearchPage />}/>
                <Route path='/artist-page' element={<ArtistPage />}/>
                <Route path='/album-list' element={<AlbumList />}/>
              </Routes>
          </Router>
        </div>
        </SkeletonTheme>
    </DataProvider>
  );
}

export default App;
