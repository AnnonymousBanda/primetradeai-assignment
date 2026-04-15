const router = require('express').Router()

const { welcomeMessage } = require('../controllers/api.controller')

router.get('/', welcomeMessage)

module.exports = router
