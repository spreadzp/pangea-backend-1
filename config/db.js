'use strict'

// creating a base name for the mongodb
// REPLACE THE STRING WITH YOUR OWN DATABASE NAME
const mongooseBaseName = 'Medics-App'
const uri = process.env.MONGODB_URI
console.log("🚀 ~ file: db.js:7 ~ uri:", uri)
// create the mongodb uri for development and test
const database = {
	prod: `${uri}/${mongooseBaseName}`,
	development: `mongodb://127.0.0.1/${mongooseBaseName}-development`,
	test: `mongodb://127.0.0.1/${mongooseBaseName}-test`,
}

// Identify if development environment is test or development
// select DB based on whether a test file was executed before `server.js`
const localDb = process.env.TESTENV ? database.test : database.development

// Environment variable MONGODB_URI will be available in
// heroku production evironment otherwise use test or development db
const currentDb = process.env.MONGODB_URI || localDb
console.log("🚀 ~ file: db.js:22 ~ currentDb:", currentDb)

module.exports = currentDb

