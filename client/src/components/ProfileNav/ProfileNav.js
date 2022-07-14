import './ProfileNav.css'
import axios from 'axios'
import { CgProfile } from 'react-icons/cg'
import { Si1001Tracklists } from 'react-icons/si'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AddModal from '../Modal/AddModal/AddModal'
import { AiOutlineCaretDown } from 'react-icons/ai'

import { useContext } from 'react'
import { DataContext } from '../DataContext/DataContext'

const ProfileNav = () => {
  const [showDropDown, setShowDropDown] = useState(false)
  const [getImage, setGetImage] = useState();
  const { showImage, setShowImage, awsImage, setAwsImage, showModal, setShowModal } = useContext(DataContext)


  let nav = useNavigate()

  // Allows user to logout
  const logoutProfile = async () =>{
    try {
      await axios.post("/logout")
    } catch (error) {
      console.log(error)
    }
    nav("/")
    console.log("In the logout");
  }


  //Checks if the user has a profile image
  useEffect(() =>{
    const getProfileImage = async () => {
  
      try {
        const result = await axios.get("/user-profile-image")
        if(result.data){
            setAwsImage(result.data)
            setShowImage(true)
        }else{
          setShowImage(false)
        }
      } catch (error) {
        console.log(error)
      }


    }
    getProfileImage();
  }, [])



  return (
    <div className='navbar-wrapper'>
        <div className='profile-top-container'>
          <div className='profile-top-right-container'>
              <Si1001Tracklists className='top-left-logo'/>

              <div className='album-song-nav-container'>
                  <button className='album-btn-section' onClick={() => {nav('/album-list')}}>Albums</button>
                  <button className='song-btn-section' onClick={() => nav('/song-list')}>Songs</button>
              </div>

               <button className='start-btn' onClick={() => {nav('/search-artist')}}>Start</button>
               <div className='profile-svg-container'>
                  
                  { showImage ? 
                  <div className='profile-nav-container' onClick={()=> setShowDropDown(!showDropDown)}> 
                  <img src={awsImage}/> </div> 
                  : <CgProfile className='profile-svg' onClick={()=> setShowDropDown(!showDropDown)} />}

                  <AiOutlineCaretDown className='drop-down-arrow'   onClick={()=> setShowDropDown(!showDropDown)}/>
                  
                
               </div>
               
               
          </div>
        </div>

        <div className='navbar-lower-container'> 
          {showDropDown &&
              <div className='drop-down-menu'>
                  <button onClick={() => setShowModal(!showModal)}>Add Photo</button>
                  <button onClick={() => logoutProfile()}>Logout</button>
              </div>
          }
        </div>

        {showModal && <AddModal className="the-whole-modal"/> }
    </div>
  )
}

export default ProfileNav

/**
 *  <div className='form-container'>
          <form>
            <input className='artist-search-input'/>
          </form>
          <BsSearch className='search-artist-btn'/>
        </div>


        <AddModal />




        For profile image section
        { showImage ? <img src={awsImage}/> : 
                  <CgProfile className='profile-svg' onClick={()=> setShowModal(!showModal)} />}
 */