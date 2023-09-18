// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for researchs 
const Research = require('../models/research')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /researchs
router.get('/researches', requireToken, (req, res, next) => {
	Research.find()
        .populate('doctors')
		.then((researches) => {
			// `researchs` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return researches.map((research) => research.toObject())
		})
		// respond with status 200 and JSON of the researchs
		.then((researches) => {
			console.log("**** research Record Accessed ****")
			res.status(200).json({ researches: researches })
		})
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /researchs/5a7db6c74d55bc51bdf39793
router.get('/researches/selected', requireToken, (req, res, next) => { 
	const { bloodTypes, currCon, minAge, maxAge } = req.query;
	const bloodTypesArray = bloodTypes ? bloodTypes.split(',') : [];
	const currConArray = currCon ? currCon.split(',') : [];
  
	const query = {};
  
	if (bloodTypesArray.length > 0) {
	  query.bloodType = { $in: bloodTypesArray };
	}
  
	if (currConArray.length > 0) {
	  query.currCon = { $in: currConArray };
	}
  
	if (minAge && maxAge) {
	  query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
	}
	  console.log("🚀 ~ file: research_routes.js:77 ~ router.get ~ query:", query)
	  Research.find(query)
	  .then(handle404)
	  .then((researches) => {
	  console.log("🚀 ~ file: research_routes.js:65 ~ .then ~ researchs:", researches)
		console.log("**** research Record Accessed ****")
		res.status(200).json(  researches)
	})
	// if an error occurs, pass it to the handler
	.catch(next) 
})

// SHOW
// GET /researchs/5a7db6c74d55bc51bdf39793
router.get('/researches/:id', requireToken, (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Research.findById(req.params.id)
        .populate('doctors')
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "research" JSON
		.then((researches) => {
			console.log("**** research Record Accessed ****")
			res.status(200).json({ researches: researches.toObject() })
	})
		// if an error occurs, pass it to the handler
		.catch(next)
})



// CREATE
// POST /researchs
router.post('/researches', requireToken, (req, res, next) => {
	// set owner of new research to be current user
	req.body.research.owner = req.user.id
console.log('req.body.research', req.body.research)
	Research.create(req.body.research)
        // also add owner to the list of attending doctors
        .then(research => {
            // research.doctors.push(req.body.research.owner)
            return research.save()
        })
		// respond to succesful `create` with status 201 and JSON of new "research"
		.then((research) => {
			console.log("**** research Record Created ****")
			res.status(201).json({ research: research.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE - general update route for most research fields
// PATCH /pets/5a7db6c74d55bc51bdf39793
router.patch('/researches/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.research.owner

	Research.findById(req.params.id)
		.then(handle404)
		.then((research) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			// requireOwnership(req, research)
			console.log("**** research Record Updated ****")
			// pass the result of Mongoose's `.update` to the next `.then`
			return research.updateOne(req.body.research)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// ATTEND to research - append/remove user to the "doctors" array to enable a button for "attend" on the frontend
// PATCH /pets/5a7db6c74d55bc51bdf39793
router.patch('/researches/:id/attend', requireToken, removeBlanks, (req, res, next) => {
	Research.findById(req.params.id)
		.then(handle404)
		.then((research) => {
			// get current user id
            const newDoctor = req.user.id
            // if doctors array doesn't contain user id, push it in, if it does, pull it out
            if (research.doctors.includes(newDoctor)) {
                research.doctors.splice(research.doctors.indexOf(newDoctor), 1)
            } else {
                research.doctors.push(newDoctor)
            }
						console.log("**** research Record Updated ****")
            // return saved research
            return research.save()
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /researchs/5a7db6c74d55bc51bdf39793
router.delete('/researches/:id', requireToken, (req, res, next) => {
	Research.findById(req.params.id)
		.then(handle404)
		.then((research) => {
			// throw an error if current user doesn't own `research`
			// requireOwnership(req, research)
			// delete the research ONLY IF the above didn't throw
			console.log(research);
			research.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => {
			console.log("**** research Record Deleted ****")
			res.sendStatus(204)
		})
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
