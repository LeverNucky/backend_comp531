/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate Article functionality', () => {

	it('should give me three or more articles', (done) => {
		// IMPLEMENT ME
		fetch(url("/articles"))
		.then( res => {
			expect(res.status).to.eql(200)	
			return res.json()
		})
		.then(body => {
			expect(body.articles.length>=3).to.be.true
		})
		.then(done)
		.catch(done)
 	}, 500)

	it('should add two articles with successive article ids, and return the article each time', (done) => {
		// add a new article
		// verify you get the article back with an id
		// verify the content of the article
		// add a second article
		// verify the article id increases by one
		// verify the second artice has the correct content
		let getId
		fetch(url("/article"), {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
    		body: JSON.stringify({"text": "New Article"})
    	})
		.then(res => {
			expect(res.status).to.eql(200)	
			return res.json()
		})
		.then(body => {
			expect(body.articles[0]._id).to.exist
			getId=body.articles[0]._id
			expect(body.articles[0].text).to.eql("New Article")
		}).then (
			fetch(url("/article"), {
				method: "POST",
				headers: new Headers({'Content-Type': 'application/json'}),
	    		body: JSON.stringify({"text": "Another New Article"})
	    	})
			.then(res => {
				expect(res.status).to.eql(200)	
				return res.json()
			})
			.then(body => {
				expect(body.articles[0]._id).to.eql(getId+1)
				expect(body.articles[0].text).to.eql("Another New Article")
			})
		)
		.then(done)
		.catch(done)
 	}, 500)


	it('should return an article with a specified id', (done) => {
		// call GET /articles first to find an id, perhaps one at random
		// then call GET /articles/id with the chosen id
		// validate that only one article is returned
		fetch(url("/articles"))
		.then(res => {
			expect(res.status).to.eql(200)	
			return res.json()
		})
		.then(body => {
			fetch(url("/articles/" + body.articles[0]._id))
			.then(res => {
				expect(res.status).to.eql(200)	
				return res.json()
			})
			.then(body => {
				expect(body.articles.length==1).to.be.true
			})
		})
		.then(done)
		.catch(done)
	}, 500)


	it('should return nothing for an invalid id', (done) => {
		// call GET /articles/id where id is not a valid article id, perhaps 0
		// confirm that you get no results
		fetch(url("/articles/0"))
		.then(res => {
			expect(res.status).to.eql(200)	
			return res.json()				
		})
		.then(body => {
			expect(body.articles.length).to.eql(0)
		})		
		.then(done)
		.catch(done)
	}, 500)

});