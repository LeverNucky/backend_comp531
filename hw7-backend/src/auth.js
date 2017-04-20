const md5=require('md5')
const cookieParser = require('cookie-parser')
const User = require('./model.js').User
const Profile= require('./model.js').Profile
const redis = require('redis').createClient("redis://h:p5ef65d42ba47eb19928e0cd5cee2262472740d3a6e6e12c94c8c160737790a22@ec2-34-206-56-122.compute-1.amazonaws.com:40189")

const cookieKey = 'sid'
const secretMessage = "Just some random strings haha"


const register=(req,res)=>{

    if (!req.body.username || !req.body.password){
        return res.status(400).send("Empty password or username is not allowed")
    }

    const username=req.body.username
    const password=req.body.password
    User.find({username:username}).exec(function(err, users){
        if (users.length!=0) {
            res.status(401).send("Username already exists")    
            return     
        }
        const salt = new Date().getTime() + username
        const hash = md5(salt + password)
        const newUser = new User({username: username, salt:salt, hash:hash})
        newUser.save()
        const newProfile=new Profile({
            username: username,
            headline: 'Welcome to Ricebook',
            following: [],
            email: req.body.email,
            zipcode: req.body.zipcode,
            dob: req.body.dob,
            avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg' })
        newProfile.save()
        res.status(200).send({result:'success', username:username})
    })  
    

}

const login=(req,res)=>{
    if (!req.body.username || !req.body.password){
        res.status(400).send("Empty password or username is not allowed")
        return
    }

    const username=req.body.username
    const password=req.body.password

    User.find({username:username}).exec(function(err,users) {
        if (users.length==0){
            res.status(401).send("Username hasn't been registered")  
            return 
        }
        const newSalt=users[0].salt
        const newHash=md5(newSalt+password)
        if (newHash!=users[0].hash){
            res.status(401).send("Incorrect password")   
            return     
        }
        else{
            const sid=md5(secretMessage + new Date().getTime() + username)
            const userObj={username:username,sid:sid}
            redis.hmset(sid,userObj);
            res.cookie(cookieKey,sid,{maxAge:3600*1000,httpOnly:true})  
        }
        res.status(200).send({result:'success', username:username})
    })
    
}

const logout=(req,res)=>{
    redis.del(req.cookies[cookieKey])
    res.clearCookie(cookieKey)
    res.status(200).send("OK")
}
//middleware to detect whether is logged in or not
const isLoggedIn = (req, res, next) => {
    const sid = req.cookies[cookieKey]
    if(!sid){
        res.status(401).send('Invalid Cookie')
        return
    }
    else{
        redis.hgetall(sid, function(err, userObj){
            if(userObj){
                req.username=userObj.username
                next()
            }
            else{
                res.status(401).send('Not authorized!')
                return
            }
        })
    }
}
//change password method
const putPassword=(req,res)=>{

    const username = req.username
    const password = req.body.password
    User.find({username: username}).exec(function(err,users) {
        const salt=users[0].salt
        const hash=md5(salt+password)
        if (hash===users[0].hash){
            res.status(401).send("New password is same as the old one") 
            return       
        }
        else{
            const newSalt = new Date().getTime() + username
            const newHash = md5(newSalt + password)
            User.update({username: username}, { $set: { salt: newSalt, hash: newHash }}, {}, function(err, user){
                res.status(200).send({username:username,status:'password changed'})
            })
        }
    }) 
}


module.exports=function(app){
    app.use(cookieParser())
    app.post('/register',register)
    app.post('/login',login)
    app.use(isLoggedIn)
    app.put('/password', putPassword)
    app.put('/logout', logout)
    
}
