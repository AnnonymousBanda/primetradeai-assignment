const { catchAsync } = require('../utils/error.util')

const welcomeMessage = catchAsync(async (req, res) => {
	res.status(200).json({
		message: 'Welcome to the API!',
	})
})

module.exports = { welcomeMessage }
