const express = require('express')

const { updateUserRole } = require('../controllers/users.controller')
const { protect, mustBeAdmin } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(protect)

router.patch('/:id/role', mustBeAdmin, updateUserRole)

module.exports = router
