const express = require('express')

const {
    registerUser,
    loginUser,
    getMe,
} = require('../controllers/auth.controller.js')
const { protect } = require('../middlewares/auth.middleware.js')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

module.exports = router
