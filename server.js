const http = require('http')
require('dotenv').config()

const { connectDB } = require('./database')
const { unhandledRejection, uncaughtException } = require('./utils/error.util')
const app = require('./app')

const server = http.createServer(app)

uncaughtException()
unhandledRejection(server)

server.listen(process.env.PORT, async () => {
	await connectDB()

	console.log(`Server is running at http://localhost:${process.env.PORT}`)
})
