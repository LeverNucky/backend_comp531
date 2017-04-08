const profile = [
    {
        user: 'qw13',
        headline: 'headline 1',
        email: 'a@bc.com',
        dob: Date.parse('1994-01-01'),
        zipcode: 12345,
        avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg',
    },
    {
        user: 'seq1',
        headline: 'headline 2',
        email: 'b@cd.com',
        dob: Date.parse('1994-02-02'),
        zipcode: 23456,
        avatar: 'pic1.jpg',
    },
    {
        user: 'seq2',
        headline: 'headline 3',
        email: 'c@de.com',
        dob: Date.parse('1994-03-03'),
        zipcode: 34567,
        avatar: 'pic2.jpg',
    },
    {
        user: 'seq3',
        headline: 'headline 3',
        email: 'd@ef.com',
        dob: Date.parse('1994-04-04'),
        zipcode: 45678,
        avatar: 'pic3.jpg',
    }
]

const getHeadlines = (req, res) => {
	if (!req.user) req.user = 'qw13'
    const users = req.params.users ? req.params.users.split(',') : [req.user]
	let result = []

	users.forEach((element)=>{
		let record = profile.filter((r) => {return r.user == element})[0]
		result.push({username:record.user, headline:record.headline})
	})
	res.status(200).send({headlines:result})
}

const putHeadline = (req, res) => {
    if (!req.user) req.user = 'qw13'
    profile.forEach((element)=>{
        if(element.user === req.user){
            element.headline = req.body.headline
            res.status(200).send({username: element.user, headline: element.headline})
        }
    })
}

const getEmail = (req, res) => {
    let username=req.params.user?req.params.user:'qw13'
    const result = profile.filter((r) => {return r.user == username})[0]
	res.status(200).send({username: result.user, email: result.email})
}

const putEmail = (req, res) => {
    if (!req.user) req.user = 'qw13'
    profile.forEach((element)=>{
        if(element.user === req.user){
            element.email = req.body.email
            res.status(200).send({username: element.user, email: element.email})
        }
    })
}

const getZipcode = (req, res) => {
    let username=req.params.user?req.params.user:'qw13'
    const result = profile.filter((r) => {return r.user == username})[0]
    res.status(200).send({username: result.user, zipcode: result.zipcode})
}

const putZipcode = (req, res) => {
    if (!req.user) req.user = 'qw13'
    profile.forEach((element)=>{
        if(element.user === req.user){
            element.zipcode = req.body.zipcode
            res.status(200).send({username: element.user, zipcode: element.zipcode})
        }
    })
}

const getAvatars = (req, res) => {
    if (!req.user) req.user = 'qw13'
    const users = req.params.users ? req.params.users.split(',') : [req.user]
    let result = []
    users.forEach(function(element){
        let record = profile.filter((r) => {return r.user == element})[0]
        result.push({username:record.user, avatar:record.avatar})
    })
    res.status(200).send({avatar:result})
}

const putAvatar = (req, res) => {
    if (!req.user) req.user = 'qw13'
    profile.forEach((element)=>{
        if(element.user === req.user){
            element.avatar = req.body.avatar
            res.status(200).send({username: element.user, avatar: element.avatar})
        }
    })
}

const getDob = (req, res) => {
    let username=req.params.user?req.params.user:'qw13'
    const result = profile.filter((r) => {return r.user == username})[0]
    res.status(200).send({username: result.user, dob: result.dob})
}

module.exports = (app) => {
     app.get('/headlines/:users?', getHeadlines)
     app.put('/headline', putHeadline)
     app.get('/email/:user?', getEmail)
     app.put('/email', putEmail)
     app.get('/zipcode/:user?', getZipcode)
     app.put('/zipcode', putZipcode)
     app.get('/avatars/:users?', getAvatars)
     app.put('/avatar', putAvatar)
     app.get('/dob', getDob)
}