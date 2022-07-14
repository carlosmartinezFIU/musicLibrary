import './SearchPage.css'
import axios from 'axios'
import { BsSearch, BsFillPersonBadgeFill } from 'react-icons/bs'
import { useState } from 'react'
import { useContext } from 'react'
import { DataContext } from '../DataContext/DataContext'
import { Link } from 'react-router-dom'
import { AiFillHome } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import SkeletonSearch from '../SkeletonCard/SkeletonSearch'

const SearchPage = () => {
    const {dataToken, setDataArtistId, setDataAlbums, setIsActiveSkeleton} = useContext(DataContext)
    const [artist, setArtist] = useState('');
    const [queryResult, setQueryResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    let nav = useNavigate()
    axios.defaults.withCredentials = true

    // Makes api call to spotify with artist name
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!artist){
            return;
        }
        setIsLoading(true)

        try{
            const result = await axios.get('/get-artist', {
                    params: {
                        artist_name: artist
                    }
                });
            setQueryResult(result.data.artists.items);
            setIsLoading(false);
        } catch (error) {
                console.log(error)
        }
        setArtist("");
     }

    // Gets all of the album artist 
    const handleArtistId = async (data) => {
        setIsActiveSkeleton(true);
       setDataArtistId(data);

       const params = {
        artist_name: data
      }

       try {
            const result = await axios.get('/artist-album', {params})
            setDataAlbums(result.data.albums.items)
            setIsActiveSkeleton(false)
        } catch (error) {
            console.log(error)
    }
     }



  return (
    <div className='search-page-wrapper'>

    <div className='top-search-page-container'>

        <div className='form-wrapper'>
            <form className='form-container'>
                <input type='text' className='artist-search-input' value={artist} onChange={(e) => setArtist(e.target.value)}/>
            </form>
            <BsSearch className='search-artist-btn' onClick={handleSubmit}/>
        </div>

        <div className='search-page-home-container'>
            <div className='search-page-home-logo'>
                <AiFillHome className='home-logo' onClick={() => nav('/song-list')}/>
            </div>
        </div>

    </div>

        <div className='music-cards-display'>
        
        { isLoading && <SkeletonSearch skeletonSearchWrapper={"search-skeleton-wrapper"} count={6} 
        imageSearchContainer={"image-search-container"} bottomSearchContainer={"bottom-search-container"}/> }
        {queryResult && queryResult.map(item =>{
            let musicImage = item.images && item.images[0] && item.images[0].url
            
            return(
                <div key={item.id} className='photo-card-container'>
                    <div className='artist-image-cover-container'>
                        {musicImage ?
                            <Link to='/artist-page'>
                                <img 
                                className='artist-image-cover'
                                    alt={item.name}
                                    src={musicImage}
                                    onClick={() => handleArtistId(item.name)}>
                                </img>
                            </Link>
                            :
                            <Link to='/artist-page'>
                                <BsFillPersonBadgeFill className='no-image-logo' onClick={() => handleArtistId(item.name)}/>
                            </Link>
                        }
                    </div>
                        <p className='artist-name'>{item.name}</p>
                        <p className='query-type'>Artist</p>
                </div>
            )})
        }
        </div>
    </div>
  )
}

export default SearchPage
