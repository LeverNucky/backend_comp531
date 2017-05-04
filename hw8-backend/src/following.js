const Profile= require('./model.js').Profile

const getFollowing = (req, res) => {
	const user = req.params.user ? req.params.user : req.username
	Profile.find({username:user}).exec(function(err,profiles){
        if(!profiles || profiles.length === 0){
            res.status(400).send("Invalid user")
        }
        else{
            res.status(200).send({username:user,following:profiles[0].following})
        }
    })
}

const addFollowing = (req, res) => {
	Profile.find({username:req.params.user}).exec(function(err,users){
        if (err) res.status(400).send("Invalid user")
        else{
            Profile.find({username:req.username}).exec(function(err,profiles){
                if (users.length!=0){
                    profiles[0].following.push(req.params.user)
                    profiles[0].save(function(e,d){
                        if (e) res.status(400).send(e)
                        else res.send({username:req.username,following:profiles[0].following})
                    })
                }
                else res.sendStatus(400)       
            })
        }
    })
}

const removeFollowing = (req, res) => {
	const user = req.username
    const following = req.params.user
    if(!following){
        res.status(400).send("missing the input following user")
        return
    }
    Profile.update({username:user}, {$pull:{following:following}}, {new:true}, function(err,tank){
        Profile.find({username:user}).exec(function(err, profiles){
        	res.status(200).send({username:user,following:profiles[0].following})
        })
    })
}

module.exports = app => {
	app.get('/following/:user?', getFollowing)
	app.put('/following/:user', addFollowing)
	app.delete('/following/:user', removeFollowing)
}