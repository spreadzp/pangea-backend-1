// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config()

// require route files
const exampleRoutes = require('./app/routes/example_routes')
const userRoutes = require('./app/routes/user_routes')
const patientRoutes = require('./app/routes/patient_routes')
const medicineRoutes = require('./app/routes/medicine_routes')
const researchRoutes = require('./app/routes/research_routes')


// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 8000
const clientDevPort = 3000

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
	useNewUrlParser: true,
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
console.log('process.env.CLIENT_ORIGIN ', process.env.CLIENT_ORIGIN )
app.use(
	cors({
		origin: '*'
		// origin: ['https://med-privacy-spread.vercel.app', `http://localhost:${clientDevPort}` || process.env.CLIENT_ORIGIN  ] ,
		// methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		// credentials: true,
	})
)

// define port for API to run on
// adding PORT= to your env file will be necessary for deployment
const port = process.env.PORT || serverDevPort

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))
// app.use(express.static('public'))
// app.use((req, res, next) => {
// 	// Set headers here
// 	res.setHeader('Content-Type', 'text/html');
// 	res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
	
// 	// Continue to the next middleware or route handler
// 	next();
//   });
// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(exampleRoutes)
app.use(userRoutes)
app.use(patientRoutes)
app.use(medicineRoutes)
app.use(researchRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// run API on designated port (4741 in this case)
app.listen(port, () => {
	console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
