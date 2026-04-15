const express = require('express')
const morgan = require('morgan')

const { apiRouter } = require('./routes')
const {
	notFound,
	globalErrorHandler,
} = require('./controllers/error.controller')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(morgan('dev'))

app.use('/api', apiRouter)

app.all('*', notFound)

app.use(globalErrorHandler)

module.exports = app
