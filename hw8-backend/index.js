const express = require('express')
const bodyParser = require('body-parser')


//Middleware used to connect local client and server
const enableCORS = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With')
    if(req.method === 'OPTIONS'){
        res.sendStatus(200)
        return
    }
    else {
        next()
    }
}

//load .env 
if (process.env.NODE_ENV !== "production") {
    require('dotenv').load()
}

const app = express()
app.use(bodyParser.json())
app.use(enableCORS)

require('./src/auth.js')(app)
require('./src/profile.js')(app)
require('./src/articles.js')(app)
require('./src/following.js')(app)



// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})