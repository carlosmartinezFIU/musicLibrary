import './UserGuide.css'
import { BsFileMusic } from 'react-icons/bs'


// Instructions to guide user
const UserGuide = () => {
  return (
    <div className='user-guide-wrapper'>
      
        <div className='empty-card-logo-wrapper'>
          <div className='empty-card-logo'>
            <BsFileMusic className='music-svg'/>
          </div>

          <div className='user-guide-container'>
            <p className='album-title'>Album</p>
            <p className='artist-title'>Artist</p>
          </div>
        </div>

        <div className='intro-description'>
            <p>Click the Start button to search for Artist</p>
        </div>
    </div>
  )
}

export default UserGuide