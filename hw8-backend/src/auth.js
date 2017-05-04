const md5=require('md5')
const cookieParser = require('cookie-parser')
const User = require('./model.js').User
const Profile= require('./model.js').Profile

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy


if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = "redis://h:p774270abc433456aa919c166cb1799c8c8e1e328597fdfbcef6fcc9b0279c599@ec2-34-206-162-178.compute-1.amazonaws.com:25519"
}

const redis = require('redis').createClient(process.env.REDIS_URL)
const config={
    clientID: '1936523119901144',
    clientSecret: '1150cdda4ebd0599d4832139aa630f61' ,
    callbackURL: 'https://ricebookfinal.heroku.com/auth/facebook/callback',
    passReqToCallback: true
}
const cookieKey = 'sid'
const secretMessage = "Just some random strings haha"
let users = []
let hostUrl=''


passport.serializeUser(function(user, done){
    users[user.id] = user
    done(null, user.id)
})

passport.deserializeUser(function(id, done){
    var user = users[id]
    done(null, user)
})
passport.use(new FacebookStrategy(config,
    function(req, token, refreshToken, profile, done){
        process.nextTick(function(){
            User.find({username: profile.displayName+'@facebook'}).exec(function(e, o) {
                if(o.length === 0){
                    new Profile({
                        username: profile.displayName+'@facebook',
                        headline: "",
                        dob: null,
                        following: [],
                        email: profile.displayName+'@facebook.com',
                        zipcode: "",
                        avatar: ""
                    }).save()
                    new User({
                        username: profile.displayName+'@facebook',
                        auth: [{
                            username: profile.displayName,
                            auth: 'facebook'
                        }]
                    }).save()
                }
            })
            return done(null, profile)
        })
    })
)

const hello = (req, res) => {
     res.send({ hello: 'world' })
}

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
        const newUser = new User({username: username, salt:salt, hash:hash ,auth:[{username: username,auth: 'rice'}]})
        newUser.save()
        const newProfile=new Profile({
            username: username,
            headline: 'Welcome to Ricebook',
            following: [],
            email: req.body.email,
            zipcode: req.body.zipcode,
            dob: req.body.dob,
            avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg' 
        })
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

const successLogin=(req, res)=>{
    res.redirect(hostUrl)
}
const failLogin = (err, req, res, next) => {
    if (err) {
        res.status(400);
        res.send({ err: err.message });
    }
}

const getUrl = (req, res, next) => {
    if (hostUrl === '') {
        hostUrl = req.headers.referer
    }
    next()
}

module.exports=function(app){
    app.use(cookieParser())
    app.use(getUrl)
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/login/facebook', passport.authenticate('facebook', {scope:'email'}))
    app.use('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect:'/fail'}),successLogin,failLogin)
    app.get('/', hello)
    app.post('/register',register)
    app.post('/login',login)
    app.use(isLoggedIn)
    app.put('/password', putPassword)
    app.put('/logout', logout)
    
}
