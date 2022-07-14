import './SongList.css'
import axios from 'axios';
import { useContext, useEffect, useState } from 'react'
import { DataContext } from '../../DataContext/DataContext'

const SongList = ({ track }) => {
    const { profileTrack,  setProfileTrack } = useContext(DataContext)
    

    // Delete songs from user playlist
    const deleteUserSong = async (id) =>{
        try {
            const result = await axios.delete(`/delete-song/${id}`);
            setProfileTrack(profileTrack.filter(item => item.track_id !== id))
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='song-list-container' key={track.track_number}>
        <div className='number-name-one-container-song'>
            <div className='track-list-number-container'>
                <p className='track-number-song-list'>{track.track_number}</p>
            </div>
            <div className='track-name-artist-song-list-container'>
                <p className='track-name-song-list'>{track.track_name}</p>
                <p className='track-artist-song-list'>{track.track_artist}</p>
            </div>
        </div>

        <div className='duration-two-container-song'>
            <p className='track-duration-song-list'>{track.track_duration}</p>
            <button className='delete-btn-song-list' onClick={() => deleteUserSong(track.track_id)}>Delete</button>
        </div>
    </div>
    
  )
}

export default SongList