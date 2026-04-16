const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const {
    authRouter,
    signalRouter,
    watchlistRouter,
    usersRouter,
} = require('./routes')
const {
    notFound,
    globalErrorHandler,
} = require('./controllers/error.controller')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    }),
)

app.use(morgan('dev'))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/signal', signalRouter)
app.use('/api/v1/watchlist', watchlistRouter)
app.use('/api/v1/users', usersRouter)

app.all('*', notFound)

app.use(globalErrorHandler)

module.exports = app
