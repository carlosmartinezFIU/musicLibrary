import './ArtistPage.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useContext } from 'react'
import { DataContext } from '../DataContext/DataContext'
import { useNavigate } from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SkeletonArtistSearch from '../SkeletonCard/SkeletonArtistSearch'
import SkeletonCardTrackList from '../SkeletonCard/SkeletonCardTrackList'


const ArtistPage = () => {
  const { dataArtistId, dataAlbums, setProfileTrack, isActiveSkeleton, profileTrack } = useContext(DataContext); 
  const [trackList, setTrackList] = useState([]);
  const [isActive, setIsActive] = useState([]);
  const [isActiveAlbum, setActiveAlbum] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const setTrackStorage = []
  const [cleanResult, setCleanResult] = useState([]);
  const [getCurrentPlaylist, setGetCurrentPlaylist] = useState([]);
  const nav = useNavigate()


// Getting track list from selected album
  const getTrackList = async (albumId) =>{
    setIsLoading(true)
    //getProfileTrack()
      const params = {
        album_id: albumId
      }

        try {
          const trackResult = await axios.get('/album-tracklist', {params});
          setIsLoading(false)
          let blahh = cleanList(trackResult.data, getCurrentPlaylist)
          setCleanResult(blahh)
        } catch (error) {
            console.log(error)
        }
  }

  // Api call to query user's track list
useEffect(() => {
  const getProfileTrack = async () => {
    try {
      const result = await axios.get('/profile-track-list')
      //add call to retrieve albums in database
      if(result.data)
      {
        setGetCurrentPlaylist(result.data)
      }
      //console.log(result.data)
    } catch (error) {
      console.log(error)
    }

}
  getProfileTrack()
}, [])



 // Sends the individual truck info to the database
  const handleAddTrack = async (data) =>{
    const { name } = data;
    const { duration_ms } = data;
    const artist = data.artists[0].name;
    const { track_number } = data;
    const { id } = data;

    let newDuration = convertMsToTime(duration_ms)

    const params ={
      track_name: name,
      track_duration: newDuration,
      track_artist: artist,
      track_track_number: track_number,
      track_spotify_id: id
    }

    try {
      const trackResult = await axios.post('/send-track-info', {params})
      setProfileTrack(trackResult.data);
    } catch (error) {
      console.log(error)
    }
  }


 // Sends the individual album info to the database
  const userProfileAlbum = async (data) => {
    const image = data.images[0].url
    const name = data.name
    const releaseDate = data.release_date
    const spotify_id = data.id
    const artist = data.artists[0].name

    const params = {
      album_image: image,
      album_name: name,
      album_release: releaseDate,
      album_spotify_id: spotify_id,
      album_artist: artist
    }

    try {
      const result = await axios.post('/send-album-info', {params})
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }


  // Shows the user an added notification 
  const addedItemNotification = () =>{
      toast.success('Added to Library',  {
        position: toast.POSITION.TOP_CENTER,
        theme: "colored"

      })
  }


  // pads the response 
  const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
  }


  // Converts the time in milliseconds to minutes and seconds
  const convertMsToTime = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
  
    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;

    return `${padTo2Digits(minutes)}:${padTo2Digits(seconds,)}`;
  }


  // Sends the new btn name to the new state(makes btn unclickable when user adds to library)
  const handleChange = (data) => {
    let btnSerial  = "btn-"+data
    setIsActive([...isActive, btnSerial])
  }

  // Sends the new btn name to the new state(makes btn unclickable when user adds to library)
  const handleAlbumChange = (data) => {
    let btnSerial  = "btn-"+data
    setActiveAlbum([...isActiveAlbum, btnSerial])
    
  }

  /**
   * Compares the user library songs with fetched api track list to
   * add the Data property as true or false. Used to show add btn if song
   * is not in user library
   */
  
  const cleanList = (listData, ownData) =>{
    for(let i = 0; i < listData.length; i++)
    {
      //setTrackStorage.push(listData[i])
      for(let k = 0; k < ownData.length; k++){
         if(listData[i].id === ownData[k].track_spotify_id){
          listData[i].Data = true
         }
         //else listData[i].Data = false
      }
      setTrackStorage.push(listData[i])
    }
    return setTrackStorage;
  }


  //Filters results to only albums
  const onlyAlbums = dataAlbums.filter(album => album.album_type === "album");

  //Filters results to only artist name
  const onlyArtist = onlyAlbums.filter(album => album.artists[0].name === dataArtistId);


  return (
    <div className='artist-page-wrapper'>
      <ToastContainer autoClose={2000}/>
        <div className='album-list-container-artist-page-title'>
          <div className="mini-nav-artist-page">
            <h2 className='albums-h1-title'>Albums</h2>
            <button className='return-search-btn'
            onClick={() => {nav('/search-artist')}}>Search</button>
          </div>
            <div className='album-list-container-artist-page'>
            {isActiveSkeleton && 
            <SkeletonArtistSearch artistSearchWrapper={"artist-wrapper-search"} count={5}
                    imageQueryContainer={"image-query-container"} bottomQueryContainer={"bottom-query-container"}/>}
                {onlyArtist && onlyArtist.map((item, i) =>{
                  return(
                    <div key={item.id} className='album-card-container-artist-page'>
                      <div className='image-container-artist-page'>
                          <img src={item.images[0].url} 
                          className='album-image-artist-page'
                          alt={item.id}
                          onClick={() => getTrackList(item.id)}/>
                      </div>
                        
                        <div className='album-description-artist-page'>
                          <p className='artist-page-album-name'>{item.name}</p>
                          <div className='release-date-add-btn-container'>
                            <p>{item.release_date}</p>
                            <button className={`add-album-btn-artist-pg btn-${item.name}-${i}`} 
                            onClick={() => {userProfileAlbum(item); 
                            addedItemNotification(); handleAlbumChange(`${item.name}-${i}`)}}
                            style={{
                              background: isActiveAlbum.includes(`btn-${item.name}-${i}`) ? 'red' : '',
                              color: isActiveAlbum.includes(`btn-${item.name}-${i}`) ? 'black' : '',
                              cursor: isActiveAlbum.includes(`btn-${item.name}-${i}`) ? 'unset' : '',
                              pointerEvents: isActiveAlbum.includes(`btn-${item.name}-${i}`) ? 'none' : ''
                            }}>+</button>
                          </div>
                        </div>
                    </div>
                  )
                })

                }
            </div>
        </div>

        <div className='album-tracklist-container'>
          <div className='song-track-list-skeleton'>
            { isLoading &&<SkeletonCardTrackList skeletonSongTrackList={"skeleton-song-track-list-wrapper"} 
              songTrackContainer={"skeleton-song-container"} count={10}/> }

          </div>
            {cleanResult.length ? cleanResult.map((track, i) => {
              let newTime = convertMsToTime(track.duration_ms);

                  return(
                    <div key={track.id} className='track-container'>

                      <div className='track-list-one-container'>
                        <p className='track-number'>{track.track_number}</p>
                        <p className='track-name'>{track.name}</p>
                      </div>

                      <div className='track-list-two-container'>
                        <p className='tracklist-time-duration'>{newTime}</p>

                        {track.Data !== true ?
                        <button className={`add-btn-profile  btn-${track.name}-${i}`}
                        onClick={() => {handleAddTrack(track); addedItemNotification(); handleChange(`${track.name}-${i}`)}}
                        style={{
                          background: isActive.includes(`btn-${track.name}-${i}`) ? 'red' : '',
                          color: isActive.includes(`btn-${track.name}-${i}`) ? 'black' : '',
                          cursor: isActive.includes(`btn-${track.name}-${i}`) ? 'unset' : '',
                          pointerEvents: isActive.includes(`btn-${track.name}-${i}`) ? 'none' : ''
                        }}>Add</button>
                        : null
                      }
                      </div>

                    </div>
                  )
                }): <p>No tracks available</p>

                }

                
            
        </div>
        
    </div>
    
  )
}

export default ArtistPage

