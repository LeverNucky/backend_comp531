const md5=require('md5')
const cookieParser = require('cookie-parser')

let arr=[]
let sid = 1
let currentUser=''
const cookieKey = 'sid'

const register=(req,res)=>{
	const username=req.body.username
	const password=req.body.password
	const salt = new Date().getTime() + username
	const hash = md5(salt + password)

	arr.push({username: username, salt: salt, hash: hash})
	res.status(200).send({result:'success', username:username})

}

const login=(req,res)=>{
	
	const username=req.body.username
	const password=req.body.password

	if (!username || !password){
		res.sendStatus(400)
		return
	}
	const userObj = getUser(username)
	
	if (!userObj || !isAuthorized(userObj, req)){
		res.sendStatus(401)
		return
	}

	res.cookie(cookieKey, generateCode(userObj), {maxAge: 3600*1000, httpOnly: true})
	currentUser=username
	res.status(200).send({username: username, result: 'success'})
}

const logout=(req,res)=>{
	currentUser = ''
	sid=0
	res.cookie(cookieKey, null, {maxAge: -1, httpOnly: true})
	res.status(200).send('OK')
	
}

const putPassword=(req,res)=>{
	res.status(200).send({username: currentUser,status: 'will not change'})
}

const getUser=(username)=>{
	return arr.filter(r=>{return r.username==username})[0]
}

const isAuthorized=(userObj, req)=>{
	const salt = userObj.salt
	const password = req.body.password
	const hash = md5(salt + password)
	return (hash === userObj.hash)
}

const generateCode=(userObj)=>{
	return sid++
}

module.exports=function(app){
	app.use(cookieParser())
	app.post('/register',register)
	app.post('/login',login)
	app.put('/password', putPassword)
	app.put('/logout', logout)
}


