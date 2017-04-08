const articles = { articles: [ 
     {
          _id: 1,
          author: "seq1",
          text: "post 1",
          date: new Date(),
          comments: []
     },
     {
          _id: 2,
          author: "seq2",
          text: "post 2",
          date: new Date(),
          comments: []
     },
     {
          _id: 3,
          author: "seq3",
          text: "post 3",
          date: new Date(),
          comments: []
     }
]};



const addArticle = (req, res) => { 
     const newArticle = {
          _id: articles.articles.length+1,
          author: "qw13",
          text: req.body.text,
          date: new Date(),
          comments:[]
     }  
     articles.articles.push(newArticle)
     res.status(200).send({articles:[newArticle]})
}

const getArticles= (req,res)=>{
     if(req.params.id){
          let target = articles.articles.filter((e)=>{return e.author == req.params.id})
          if (target.length===0){
               target=articles.articles.filter((e)=>{return e._id == req.params.id})
          }
          res.status(200).send({articles:target})  
     }   
     else{
          res.status(200).send(articles)
     }
}
const putArticle = (req, res) => {

     if(req.params.id > articles.articles.length || req.params.id <= 0){
          res.status(401).send("Forbidden!")
          return
     }
     if(!req.body.commentId){
          articles.articles[req.params.id-1].text = req.body.text
     }
     else{
          if(req.body.commentId> articles.articles[req.params.id-1].comments.length
               || req.body.commentId <=-2){
               res.status(401).send("Forbidden!")
               return
          }
          if(req.body.commentId == -1){
               articles.articles[req.params.id-1].comments.push({
                    id:articles.articles[req.params.id-1].comments.length+1,
                    text:req.body.text
               })
          }
          else{
               articles.articles[req.params.id-1].comments.forEach(e=>{
                    if(e.id == req.body.commentId){
                         e.text = req.body.text 
                    }
               })
          }
     }
     res.status(200).send({articles: [articles.articles[req.params.id-1]]})  
}

module.exports = (app) => {
     app.post('/article', addArticle)
     app.get('/articles/:id*?', getArticles)
     app.put('/articles/:id', putArticle)
}