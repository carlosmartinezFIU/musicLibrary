import './SignUp.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

import { useContext } from 'react'
import { DataContext } from '../DataContext/DataContext'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
    let nav = useNavigate()
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [incorrectSign, setIncorrectSign] = useState(false)
    const { setShowImage, setAwsImage } = useContext(DataContext)

    // Sends users info and saves it to the database
    const handleSignUp = async e => {
        e.preventDefault();

        if(!userEmail){
            setIncorrectSign(true)
        }
        else if(!emailVarification())
        {
            setIncorrectSign(true)
        }

        if(!userPassword){
            setIncorrectSign(true)
        }

        const params ={
            user_email: userEmail,
            user_password: userPassword
        }

            
        try {
            const result = await axios.post('/sign-up', {params})
            console.log(result.data)
            
            if(result.data === "False")
            {
                nav('/song-list')
            }
        } catch (error) {
            console.log(error)
        }

    }

    /**
     * Sends email and password to be varified
     */

    const handleLogin = async e => {
        e.preventDefault();

        if(!userEmail){
            setIncorrectSign(true)
        }
        else if(!emailVarification())
        {
            setIncorrectSign(true)
        }

        if(!userPassword){
            setIncorrectSign(true)
        }

        const params ={
            user_email: userEmail,
            user_password: userPassword
        }


        try {
            const result = await axios.post('/login', 
            {params}, {withCredentials: true, credentials: 'include'}) // Third Parameters are needed to set cookie sid in browser
            //console.log("In the login data", result.data.Person[0].profile_image)
            if(result.data.Status === true)
            {
                nav('/song-list')

                if(result.data.Person[0].profile_image){
                    setAwsImage(result.data.Person[0].profile_image)
                    setShowImage(true)
                }
                else{
                    setShowImage(false)
                }
                
            }
            else return;
            
        } catch (error) {
            console.log(error)
        }

    }

    // Varification of email structure
    const emailVarification = () => {
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        if(regex.test(userEmail) === false){
            return false;
        }
        else
            return true
    }

  return (
    <div className='sign-up-wrapper'>
    <ToastContainer autoClose={2000}/>
        <div className='right-div-container'>
                <div className='top-sign-up-container'>
                    <div className='title-container'>
                        <h1 className='create-account-title'>Create Account</h1>
                    </div>
                </div>

                <div className='sign-up-container'>

                    <form className='user-signup-form'>
                    {incorrectSign && <p className='error-message-sign'>Incorrect email/password</p> }
                        <input className='input-username' 
                        placeholder='Email' value={userEmail} onChange={(e) => setUserEmail(e.target.value)}/>


                        <input className='input-password'
                        placeholder='Password' value={userPassword} onChange={(e) => setUserPassword(e.target.value)}/>
                    
                    </form>
                    <div className='sign-up-login-btn-container'>
                        <button onClick={handleSignUp} 
                        className='sign-up-btn'>Sign Up</button>

                        <button onClick={handleLogin}
                        className='sign-up-btn'>Login</button>

                    </div>
                    
                </div>
        </div>
    </div>
  )
}

export default SignUp
