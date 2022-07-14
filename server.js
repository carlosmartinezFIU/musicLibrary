const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db')
const multer = require('multer');
const bcrypt = require('bcrypt')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const Pool = require('pg').Pool
const fs = require('fs-extra');
const util = require('util');
const path = require('path');

const unlinkFile = util.promisify(fs.unlink)

// Functions used to upload / retrieve and delete an image from S3
const { getToken, cleanCookie, checkEmail } = require('./spotify')

const user_key = process.env.USER_SPOT_KEY
const user_secret = process.env.USER_SPOT_SECRET

/**uses the multer middleware to set uploads when image is uploaded */
const upload = multer({dest: 'uploads/'});

/** Using function from s3.js to upload from multer upload folder to s3 */
const { uploadImage, getImageS3, deleteImage } = require('./s3');
const { unlink } = require('fs-extra');


const app = express();
app.use(express.json());
app.use(cors({ 
    origin: [process.env.PORT, 'https://musiclibrary99.herokuapp.com'], 
    credentials: true,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'DELETE']
}))
app.use(express.urlencoded({ extended: true }));

// used to connect a new session to he postgresdatabase
const newPool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE
})

 
// Session needed to track user 
const sessionConfig = {
    store: new pgSession({
        pool: newPool,
        createTableIfMissing: true,
    }),
    secret: process.env.COOKIE_SECRET, //used to encrypt the cookie 
    resave: false,                     // set to flase - forces session to be saved back to the session store
    key: "test.cookie",
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000},
    saveUninitialized: false,          // Chooisng false wil help with login sessions
                                       // naming the cookie sent to the client side
}

app.use(session(sessionConfig))


// Checks if the user has a unique email, if so saves email/password to postgresql
app.post('/sign-up', async (req,res) => {
    const { user_email } = req.body.params
    const { user_password } = req.body.params

    // Check if email is unique will return matching email if found
    const result = await checkEmail(user_email);
    
    // If result is empty, email is unique and user email saved to database, as well as hashed password
    if(!result.length)
    {
       const hash = await bcrypt.hash(user_password,10)
       await pool.query('INSERT INTO profiles (profile_email, profile_password) VALUES($1, $2)', [user_email, hash]);
       req.session.user = resultUser[0].profile_id;

       return res.json("False")
    }
    else
        return res.json("True")

})


// Checks if the users email matches and email from the database, 
// if so checks the password entered. If both match then creates a session ID for the user
app.post('/login', async (req,res) => {

    const { user_email, user_password} = req.body.params

    const resultUser = await checkEmail(user_email);

    // If the user is not found respond with no user found
    if(!resultUser.length)
    {
        res.json("There is no account") 
    }
    
    //Checks if the password matches with database password
    if(resultUser.length > 0){
        const answer = await bcrypt.compare(user_password, resultUser[0].profile_password)
        if(answer){
            //res.set("Set Cookie", req.sessionID)
            req.session.user = resultUser[0].profile_id;
            let userInDataBase = req.session.user
            res.status(200).json({Status: true, Person: resultUser})
        }
        else console.log("Wrong password")
    }
    else
        console.log("The email or password do not match")


})


//Logs out the user and deletes the session ID stored in the cookie from the client and session table
app.post('/logout', async (req,res) => {

    if (req.headers.cookie) {
        
        let browserCookie = cleanCookie(req.headers.cookie)
        let deletedeCookie = await pool.query('DELETE FROM session WHERE sid = $1', [browserCookie])
        res.clearCookie('test.cookie')
        res.set({ 'Content-Type': 'text/plain'})
        res.end();
    }else{
        res.status(500).json({message: "Already logged out"})
    }

    
    

})


// Spotify Calls *****************************************************

//Get artist from spotify api
app.get('/get-artist', async (req,res) => {
    const { artist_name } = req.query

    if(req.headers.cookie){
        let finalCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [finalCookie])

        // if the cookie in database matches cookie in client then validates user
        if(finalCookie === cookieInDataBase.rows[0].sid)
        {
            const key = await getToken(user_key, user_secret);

            try {
                const artistResult = await axios.get(`https://api.spotify.com/v1/search?q=${artist_name}&type=artist`, {
                    headers: {
                        Authorization: `Bearer ${key.data.access_token}`
                    }
                }, {withCredentials: true, credentials: 'include'});
        
                res.json(artistResult.data)
            
            } catch (error) {
                console.log(error)
            }  
        }
    }
    else
        res.status(403).json({message: "There is no token :/ "})
})


//Get artist album from spotify
app.get('/artist-album', async (req,res) => {
    const key = await getToken(user_key, user_secret);
    
    
    const { artist_name } = req.query

    try {
        const albumsResults = await axios.get(`https://api.spotify.com/v1/search?q=${artist_name}&type=album`, {
            headers: {
                Authorization: `Bearer ${key.data.access_token}`
            }
        })
        res.json(albumsResults.data)
    } catch (error) {
        console.log(error)
    }
    

})

//Get track-list from album from spotify
app.get('/album-tracklist', async (req,res) => {
    const key = await getToken(user_key, user_secret);
    const {album_id} = req.query

    try {
      const trackList = await axios.get(`https://api.spotify.com/v1/albums/${album_id}/tracks`, {
        headers: {
            Authorization: `Bearer ${key.data.access_token}`
        }
      }) 
      res.json(trackList.data.items) 
    } catch (error) {
        console.log(error)
    }

})

// Postgres Query *******************************************************************************


//Save song info into database
app.post('/send-track-info', async (req,res) => {
    const { track_name } = req.body.params
    const { track_duration } = req.body.params
    const { track_artist } = req.body.params
    const { track_track_number } = req.body.params
    const { track_spotify_id } = req.body.params

    //validates user with matching cookies
    if(req.headers.cookie)
    {
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)
        console.log(userId)


        try {
            const result = await pool.query("INSERT INTO track (track_name, track_duration, track_artist, track_number, track_spotify_id, profile_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", 
            [track_name, track_duration, track_artist, track_track_number, track_spotify_id, userIntId])
            res.json(result.rows[0])
        } catch (error) {
            console.log(error)
        }

    }else{
        res.status(500)
    }


 
})


//Get all profile songs from database
app.get('/profile-track-list', async (req,res) => {

    if (req.headers.cookie) {
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            const allSongs = await pool.query('SELECT * FROM track WHERE profile_id = $1', [userIntId])
            res.json(allSongs.rows)
        } catch (error) {
            console.log(error)
        }

        
    } else {
        res.status(403).json({Message: "No token found"})
    }
})



//deletes a song from user database
app.delete('/delete-song/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM track WHERE track_id  = $1 RETURNING *', [id])
        res.json(result.rows[0]);
    } catch (error) {
        console.log(error)
    }
})

//deletes an album from user database
app.delete('/delete-album/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query('DELETE FROM album WHERE album_id  = $1 RETURNING *', [id])
        res.json(result.rows[0]);
    } catch (error) {
        console.log(error)
    }
})


//saves an album info
app.post('/send-album-info', async (req,res) => {
    const { album_image } = req.body.params
    const { album_name } = req.body.params
    const { album_release } = req.body.params
    const { album_spotify_id } = req.body.params
    const { album_artist } = req.body.params

    if (req.headers.cookie){
        
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)
        


        try {
            const result = await pool.query("INSERT INTO album (album_image, album_name, album_release_date, album_spotify_id, album_artist, profile_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", 
            [album_image, album_name, album_release, album_spotify_id, album_artist, userIntId])
            res.status(200).json(result.rows[0])
        } catch (error) {
            console.log(error)
        }
    } else {
        res.status(500)
    }
})

//get all albums for profile
app.get('/profile-album-list', async (req,res) =>{


    if (req.headers.cookie) {
        
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            const result = await pool.query("SELECT * FROM album WHERE profile_id = $1", [userIntId])
            res.json(result.rows);
        } catch (error) {
           console.log(error) 
        }



    } else {
        res.status(403).json({Message: "No token found"})
    }



    
})




/***********************    AWS        *************** */

// Post images from user to s3 bucket 
app.post("/images", upload.single("image"), async (req,res) => {

    
        if(req.headers.cookie)
        {
            let browserCookie = cleanCookie(req.headers.cookie)
            let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
            let userId = cookieInDataBase.rows[0].sess.user; // outputs id
            let userIntId = parseInt(userId)


            const filePathFolder = req.file.path; // Needed to unlike file from back end "/uploads" folder
            const { filename } = req.file // Name to store in AWS
            const newFileName = `/images/${filename}` 

            const awsResult = await uploadImage(req.file)

            try {
                let checkUserImage = await pool.query('SELECT * FROM profiles WHERE profile_id = $1', [userIntId])

                
                
                if(checkUserImage.rows[0].profile_image){
                    let userDataImage = checkUserImage.rows[0].profile_image;
                    let newUserDataImage = userDataImage.slice(8)
                    deleteImage(newUserDataImage)
                }

                let resultAwsImage = await pool.query('UPDATE profiles SET profile_image = $1 WHERE profile_id = $2 RETURNING *', [newFileName, userIntId])
                await unlinkFile(filePathFolder); // deletes files from the upload folder in server side

                res.status(200).json(resultAwsImage.rows[0].profile_image)

            } catch (error) {
                console.log(error)
            }

        }else{
            console.log("There was an error")
        }

        

        
});


// Retrieves images from S3 with corresponding image key 
app.get('/images/:key', (req,res) =>{
    const keys = req.params.key
    const readFile = getImageS3(keys)
    readFile.pipe(res)
})



// Gets the image names saved from the database
app.get('/user-profile-image', async (req,res) =>{

    if(req.headers.cookie){

        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        const result = await pool.query("SELECT * FROM profiles WHERE profile_id = $1", [userIntId])
        //res.json(result.rows[0].profile_image)
        res.json(result.rows[0].profile_image)

    }
    else{
        return null
    }
})


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "client/build")));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "client/build/index.html"))
    })
}



const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Running on PORT ${PORT}`);
})
 



