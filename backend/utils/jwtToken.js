const sendToken = (user, statusCode, res) => {

    // create JWT
    const token = user.getJwtToken();
    // cookie options
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
        sameSite: 'none',

    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user
    })

}

module.exports = sendToken;