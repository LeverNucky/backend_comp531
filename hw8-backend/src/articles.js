const cloudinary = require('cloudinary');
const Article = require('./model.js').Article
const User = require('./model.js').User
const Profile = require('./model.js').Profile
const ObjectId = require('mongoose').Types.ObjectId; 
const md5=require('md5')
const uploadImage = require('./uploadCloudinary');


const addArticle = (req, res) => { 
	if(!req.body.text){
	   return res.status(400).send("missing text input")    
	}
    const newArticle = {
            author:req.username,
            text:req.body.text,
            date: new Date(),
            img: '',
            comments:[]
    }
    if (req.fileurl) {
        newArticle.img = req.fileurl
    }
	const newArticleObj=new Article(newArticle)
	newArticleObj.save()
	res.status(200).send({articles:[newArticle]})
     
}



const getArticles = (req, res) => {
    const id = req.params.id
    if (id) {
        User.find({ username: id }).exec((err, username) => {
            if (username.length !== 0) { getArticlesByAuthor(req, res, id) }
            else { getArticlesById(req, res, id) }
        })
    } 
    else {   
        Profile.findOne({ username: req.username }, 'following').exec((err, item) => {
            if (item) {
                let users = [req.username, ...item.following]
                getArticlesByAuthors(req, res, users)
            }
            else 
                res.status(403).send("No match")
            
        })
    }
}


const getArticlesByAuthor = (req, res, username) => {
    Article.find({ author: username }).exec((err, items) => {
        if (items)
            res.status(200).send({ articles: items }) 
        else 
            res.status(403).send("No match item for author")
    })
}


const getArticlesById = (req, res, id) => {
    Article.findById(id, (err, item) => {
        if (item) 
            res.status(200).send({ articles: [item] })
        else 
            res.status(403).send("No match item for id")
    })
}

const getArticlesByAuthors = (req, res, users) => {
    Article.find({ author: { $in: users } }).sort({ date: -1 }).limit(10).exec((err, items) => {
        if (items) 
            res.status(200).send({ articles: items })
        else 
            res.status(404).send("No match")
    })
}
const putArticle = (req, res) => {
    const id=ObjectId(req.params.id)
    Article.findOne({_id:id}).exec(function(err, article) {
        if (err) res.status(401).send("No match")
        else{
     
            if (req.body.commentId==undefined && article.author==req.username){
                article.text=req.body.text
            }
            else if (req.body.commentId==-1){
                const commentId = md5(req.username + new Date().getTime())
                article.comments.push({author:req.username,date:new Date(),commentId:commentId,text:req.body.text})
            }
            else {
	            article.comments.forEach((x)=>{
	                if (x.commentId==req.body.commentId && x.author==req.username){
	                    x.text=req.body.text
	                }
	            })
            }
            article.save(function(e,d){
                if (e) res.status(401).send("Error saving modified article")
                else res.send({articles:[article]}) 
            })
        }
    })
}

module.exports = (app) => {
    app.post('/article', uploadImage('img'), addArticle)
    app.get('/articles/:id*?', getArticles)
    app.put('/articles/:id', putArticle)
}