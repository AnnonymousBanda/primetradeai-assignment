const express = require('express')

const {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist,
} = require('../controllers/watchlist.controller')
const { protect } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(protect)

router.post('/', addToWatchlist)
router.get('/', getWatchlist)
router.delete('/:id', removeFromWatchlist)

module.exports = router
