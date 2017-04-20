/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate Headline functionality', () => {

	it('should get headlines', (done) => {
		fetch(url("/headlines"))
		.then( res => {
			expect(res.status).to.eql(200)	
		})
		.then(done)
		.catch(done)
 	}, 500)


	it('should return at least a value for the sample user', (done) => {
		fetch(url("/headlines/seq1"))
		.then( res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body=>{
			expect(body.headlines.length>=1).to.be.true
		})
		.then(done)
		.catch(done)
 	}, 500)


	it('should update value in memory for default user, so a GET call returns new value', (done) => {
		
		fetch(url("/headline"), {
			method: "PUT",
			headers: {'Content-Type': 'application/json'},
    		body: JSON.stringify({"headline": "sad"})
    	})
		.then(res => {
			expect(res.status).to.eql(200)	
			return res.json()
		})
		.then(body => {
			expect(body.username).to.exist
			expect(body.headline).to.eql("sad")
		}).then (
			fetch(url("/headlines/qw13"))
			.then(res => {
				expect(res.status).to.eql(200)	
				return res.json()
			})
			.then(body => {
				
				expect(body.headlines[0].username).to.exist
				expect(body.headlines[0].headline).to.eql("sad")
			})
		)
		.then(done)
		.catch(done)
 	}, 500)

});