const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

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