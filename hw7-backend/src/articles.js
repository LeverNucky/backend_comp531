const Article = require('./model.js').Article
const ObjectId = require('mongoose').Types.ObjectId; 
const md5=require('md5')

const addArticle = (req, res) => { 
	 if(!req.body.text){
	      return res.status(400).send("missing text input")    
	 }

	 const newArticle = {
	      author:req.username, 
	      text:req.body.text,
	      date:new Date(),
	      img:'',
	      comments:[]
	 }
	 const newArticleObj=new Article(newArticle)
	 newArticleObj.save()
	 res.status(200).send({articles:[newArticle]})
     
}

const getArticles= (req,res)=>{
    if(req.params.id){
        try{
            const id=ObjectId(req.params.id)
            Article.find({_id:id}).exec(function(err, articles) {
                if (err){
                    res.status(400).send(err);
                }
                else 
                    res.send({articles:articles})
            })
        }
        catch(e)
        {
            Article.find({author:req.params.id}).exec(function(err, articles) {
                if (err){
                    res.status(400).send(err);
                }
                else 
                    res.send({articles:articles})
            })

        }
    }
    else{
        Article.find().exec(function(err, articles){res.status(200).send({articles:articles})})
    }
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
    app.post('/article', addArticle)
    app.get('/articles/:id*?', getArticles)
    app.put('/articles/:id', putArticle)
}