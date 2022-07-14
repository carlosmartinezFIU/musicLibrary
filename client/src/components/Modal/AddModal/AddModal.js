import './AddModal.css'
import { useState } from 'react'
import axios from 'axios'
import { useContext } from 'react'
import { DataContext } from '../../DataContext/DataContext'
import { IoCloseSharp } from 'react-icons/io5' 

const AddModal = () => {
  const [file, setFile] = useState();
  const { setShowImage, setAwsImage, setShowModal } = useContext(DataContext)


  // Grabs the files selected by user
  const handleFile = e =>{
      setFile(e.target.files[0])
  }


  //Sets the profile image as viewable for the user
  const showProfileImage = () =>{
    setShowImage(true)
  }

  //Hides the Modal
  const hideModal = () =>{
    setShowModal(false)
  }

  //If there are no files inserted add btn will reject user
  const handleHideModal = () =>{
    if(file){
      setShowModal(false)
    }
    else{
      alert("No image selected")
      return
    }
  }


  // Allows the user to send image to s3 bucket
  const addImage = async (e) =>{
      e.preventDefault();

      const data = new FormData()
      data.append("image", file)

      try {
        const result = await axios.post("/images", data, { headers: {'Content-Type': 'multipart/form-data'}})
        console.log(result.data)
        setAwsImage(result.data)
        //console.log(result.image)
        //setAwsmage()
      } catch (error) {
        
      }
  }




  return (
    <div className='add-modal-wrapper'>
        <div className='add-modal-container'>
          <IoCloseSharp className='close-modal-btn' onClick={() => hideModal()}/>
            <form>
              <input type='file' accept='image/*'
              filename={file} onChange={handleFile}/>

            </form>
            <button onClick={(e) => {addImage(e); showProfileImage(e); handleHideModal()}}>add</button>
        </div>
    </div>
  )
}

export default AddModal