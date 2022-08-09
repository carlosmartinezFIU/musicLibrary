import axios from 'axios'
import { useEffect, useState } from 'react'
import ProfileNav from '../../ProfileNav/ProfileNav'
import SkeletonCard from '../../SkeletonCard/SkeletonCard'
import './AlbumList.css'

const AlbumList = () => {
    const [albumList, setAlbumList] = useState([]);
    const [getAlbumTrackList, setGetAlbumTrackList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSong, setIsLoadingSong] = useState(false);
    
    // Grabs the users albums from database
    useEffect(() =>{
        const getProfileAlbums = async () => {
            try {
                const result = await axios.get('/profile-album-list')
                setAlbumList(result.data)
                setIsLoading(false)
            } catch (error) {
                console.log(error)
            }
        }
        getProfileAlbums();
    },[])

// Getting track -list of user album
    const getTrackList = async (albumId) =>{
        setIsLoadingSong(true)
        const params = {
          album_id: albumId
        }
  
          try {
            const trackResult = await axios.get('/album-tracklist', {params});
            setGetAlbumTrackList(trackResult.data);
            setIsLoadingSong(false)
          } catch (error) {
              console.log(error)
          }
          
    }

    //Pads the api number
    const padTo2Digits = (num) => {
        return num.toString().padStart(2, '0');
      }

    // converts the milliseconds to minutes and seconds
    const convertMsToTime = (milliseconds) => {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
      
        seconds = seconds % 60;
        minutes = minutes % 60;
        hours = hours % 24;

        return `${padTo2Digits(minutes)}:${padTo2Digits(seconds,)}`;
    }

     // Delete album from user playlist
     const deleteUserAlbum = async (id) =>{
        try {
            const result = await axios.delete(`/delete-album/${id}`);
            setAlbumList(albumList.filter(item => item.album_id !== id))
        } catch (error) {
            console.log(error)
        }
    }




  return (
    <div className='album-list-wrapper'>
        <ProfileNav />

        <div className='album-list-wrapper-container'>
            <div className='album-list-container-one'>
                <div className='skeleton-two-wrapper'>  
                { isLoading && <SkeletonCard count={8} albumWidth={200} albumHeight={'100%'} songHeightAlbum={'100%'}
                albumWrapper={'album-wrapper'} imgSkeleton='img-skeleton' btnCount={2}
                bottomSkeleton='bottom-skeleton'/> }
                </div> 
                {albumList && albumList.map((item, i) => {
                    return(
                        <div className='album-card-container-album-list' key={i}>
                            <div className='album-img-container-album-list'>
                                <img className="album-img-album-list" 
                                alt={item.album_name}
                                src={item.album_image}
                                onClick={() => {getTrackList(item.album_spotify_id)}}/>
                            </div>

                            <div className='album-list-info'>
                                <p>{item.album_name}</p>
                                <p>{item.album_artist}</p>
                            </div>
                            <button className='delete-btn-album-list' onClick={() => deleteUserAlbum(item.album_id)} >Delete</button>
                        </div>
                    )
                })

                }


            </div>
            <div className='album-list-container-two'>
                <h2 className='h2-title-list'>Song List</h2>
                <div className='album-list-track-container'>

                    <div className='song-list-skeleton-wrapper'>
                    {isLoadingSong && 
                    <SkeletonCard  
                    songWrapper={'song-wrapper'} 
                    count={9} trackLine={'track-line'}/> }
                    </div>


                    {getAlbumTrackList && getAlbumTrackList.map(track => {
                        let time = convertMsToTime(track.duration_ms)
                        return(
                            <div className='album-list-track-wrapper' key={track.id}>
                                <p className='album-list-song-list-track-number'>{track.track_number}</p>

                                <div className='album-list-track-name-artist'>
                                    <p className='album-list-song-list-track-name'>{track.name}</p>
                                    <p className='album-list-song-list-artist'>{track.artists[0].name}</p>
                                </div>

                                <div className='album-list-duration-track'>
                                    <p>{time}</p>
                                </div>

                            </div>
                        )
                    })

                    }
                </div>
            </div>

        </div>

    </div>
  )
}

export default AlbumList