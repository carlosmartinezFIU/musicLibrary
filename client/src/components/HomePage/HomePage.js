import './HomePage.css'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { DataContext } from '../DataContext/DataContext'
import ProfileNav from '../ProfileNav/ProfileNav'
import UserGuide from '../UserGuide/UserGuide'
import SongList from '../ProfileList/SongList/SongList'
import AddModal from '../Modal/AddModal/AddModal'

const HomePage = () => {
    const { profileTrack, setProfileTrack } = useContext(DataContext);
    axios.defaults.withCredentials = true

    // Grab the saved track list for each user
    useEffect(() => {
        const getProfileTrack = async () => {
            try {
              const result = await axios.get('/profile-track-list')
              //add call to retrieve albums in database
              if(result.data)
              {
                setProfileTrack(result.data)
              }
              //console.log(result.data)
            } catch (error) {
              console.log(error)
            }
    
        }
        getProfileTrack();
      },[])

  return (
    <div>
        <ProfileNav />
        <div className='song-album-list-wrapper'>
            
            <div className='data-wrapper-home-page'>
                {profileTrack.length ? profileTrack.map((track, i) => <SongList track={track} key={i}/>) 
                : <UserGuide />}
            </div>
        </div>
    </div>
    )

        
  
  
}

export default HomePage