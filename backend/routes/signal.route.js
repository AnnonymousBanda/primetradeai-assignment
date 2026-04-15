const express = require('express')

const {
    createSignal,
    getSignalsUsingQuery,
    getSignalById,
    updateSignal,
    deleteSignal,
} = require('../controllers/signal.controller')
const { protect, mustBeAdmin } = require('../middlewares/auth.middleware.js')

const router = express.Router()

router.use(protect)

router.post('/', mustBeAdmin, createSignal)
router.get('/', getSignalsUsingQuery)
router.get('/:id', getSignalById)
router.put('/:id', mustBeAdmin, updateSignal)
router.delete('/:id', mustBeAdmin, deleteSignal)

module.exports = router
