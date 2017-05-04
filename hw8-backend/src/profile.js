const uploadImage = require('./uploadCloudinary')
const Profile= require('./model.js').Profile

const getHeadlines = (req, res) => {
    const users = req.params.users ? req.params.users.split(',') : [req.username]
	let result = []

    Profile.find({username: {$in: users}}).exec(function(err, profiles){
        if (!profiles || profiles.length==0){
            res.status(400).send("Invalid user")          
        }
        profiles.forEach(profile => {
            result.push({username: profile.username, headline: profile.headline})
        })
        res.send({headlines:result})
    })
}

const putHeadline = (req, res) => {
    const user=req.username
    const headline=req.body.headline
    if(!headline){
        res.status(400).send("headline can't be empty")
        return
    }
    Profile.update({username:user},{$set:{headline:headline}},{new: true},function(err,profiles){
        res.status(200).send({username:user,headline:headline})
    })
}

const getEmail = (req, res) => {
    let user=req.params.user?req.params.user:req.username
    Profile.find({username:user}).exec(function(err,profiles){
        if(!profiles || profiles.length === 0){
            res.status(400).send("Invalid user")
        }
        else{
            res.status(200).send({username: user, email: profiles[0].email})
        }
    })
}

const putEmail = (req, res) => {
    const user=req.username
    const email=req.body.email
    if(!email){
        res.status(400).send("Email can't be empty")
        return
    }
    Profile.update({username:user},{$set:{email:email}},{new: true},function(err,profiles){
        res.status(200).send({username:user,email:email})
    })
}

const getZipcode = (req, res) => {
    let user=req.params.user?req.params.user:req.username
    Profile.find({username:user}).exec(function(err,profiles){
        if(!profiles || profiles.length === 0){
            res.status(400).send("Invalid user")
        }
        else{
            res.status(200).send({username: user, zipcode: profiles[0].zipcode})
        }
    })
}

const putZipcode = (req, res) => {
    const user=req.username
    const zipcode=req.body.zipcode
    if(!zipcode){
        res.status(400).send("zipcode can't be empty")
        return
    }
    Profile.update({username:user},{$set:{zipcode:zipcode}},{new: true},function(err,profiles){
        res.status(200).send({username:user,zipcode:zipcode})
    })
}

const getAvatars = (req, res) => {
    const users = req.params.users ? req.params.users.split(',') : [req.username]
    let result = []

    Profile.find({username: {$in: users}}).exec(function(err, profiles){
        if (!profiles || profiles.length==0){
            res.status(400).send("Invalid user")          
        }
        profiles.forEach(profile => {
            result.push({username: profile.username, avatar: profile.avatar})
        })
        res.send({avatars:result})
    })
}

const putAvatar = (req, res) => {
    const username = req.username;
    if (!req.fileurl) 
        return res.status(401).send("Error uploading avatar");
    Profile.update({username: username}, {avatar: req.fileurl}, (error, doc) => {
        if (error) return res.status(500).send("Error updateing avatar");
        return res.status(200).send({username: req.username, avatar: req.fileurl});
    });
}

const getDob = (req, res) => {
    let user=req.params.user?req.params.user:req.username
    Profile.find({username:user}).exec(function(err,profiles){
        if(!profiles || profiles.length === 0){
            res.status(400).send("Invalid user")
        }
        else{
            res.status(200).send({username: user, dob: profiles[0].dob})
        }
    })
}

module.exports = (app) => {
     app.get('/headlines/:users?', getHeadlines)
     app.put('/headline', putHeadline)
     app.get('/email/:user?', getEmail)
     app.put('/email', putEmail)
     app.get('/zipcode/:user?', getZipcode)
     app.put('/zipcode', putZipcode)
     app.get('/avatars/:users?', getAvatars)
     app.put('/avatar', uploadImage('avatar'), putAvatar)
     app.get('/dob', getDob)
}