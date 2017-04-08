const following = {
	username: 'qw13',
	following: ['seq1', 'sep2', 'seq3']
}

const getFollowing = (req, res) => {
	res.send(following)
}

const addFollowing = (req, res) => {
	const user = req.params.user
	following.following.push(user)
	res.status(200).send(following)
}

const removeFollowing = (req, res) => {
	const user = req.params.user
	following = following.filter((e)=>{
		return e!==user
	})
	res.status(200).send(following)
}

module.exports = app => {
	app.get('/following/:user?', getFollowing)
	app.put('/following/:user', addFollowing)
	app.delete('/following/:user', removeFollowing)
}