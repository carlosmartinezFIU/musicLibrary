const axios = require('axios');
const qs = require('qs')
const pool = require('./db')


const getToken = async (userKey, userSecret) => {
    //you have to cnovert the parameters to strings -- axios will automatically send as 
    // application/json
    const data = qs.stringify({
        'grant_type': 'client_credentials'
    })

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', data , {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(userKey + ':' + userSecret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        })
        return response;
    }catch (error) {
        console.log(error);
    }
}

exports.getToken = getToken



// Used to split cookie from browser
const cleanCookie = (cookieData) =>{
    let cookieOne = cookieData.split('=')
    let cookieTwo = cookieOne[1].split('.')
    let finalCookie = cookieTwo[0].substring(4)

    return finalCookie;   
}
exports.cleanCookie = cleanCookie



const checkEmail = async (userEmail) => {
    try {
        const result = await pool.query('SELECT * FROM profiles WHERE profile_email = $1', [userEmail])
        return result.rows;
    } catch (error) {
        console.log(error)
    }
    return null;
}
exports.checkEmail = checkEmail
