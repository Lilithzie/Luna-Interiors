const User = require('../models/user');
const crypto = require('crypto')
const validator = require('validator')
const { requireCloudinary } = require('../config/cloudinary')
const sendEmail = require('../utils/sendEmail')
const sendToken = require('../utils/jwtToken');

let firebaseAdmin;
try { firebaseAdmin = require('firebase-admin') } catch { firebaseAdmin = null }
let firebaseAdminApp;
let firebaseAdminAuth;
let firebaseAuth;

const getFirebaseAuth = () => {
    if (!firebaseAdmin) return null;
    if (!firebaseAuth) {
        const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
        if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return null;
        const { cert, getApps, initializeApp } = require('firebase-admin/app');
        const { getAuth } = require('firebase-admin/auth');
        const apps = getApps();
        firebaseAdminApp = apps.length ? apps[0] : initializeApp({
                credential: cert({
                    projectId: FIREBASE_PROJECT_ID,
                    clientEmail: FIREBASE_CLIENT_EMAIL,
                    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        firebaseAdminAuth = getAuth(firebaseAdminApp);
        firebaseAuth = firebaseAdminAuth;
    }
    return firebaseAuth;
}

exports.registerUser = async (req, res, next) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 30) return res.status(400).json({ success: false, message: 'Name must be between 2 and 30 characters' });
    if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    if (!req.body.avatar) return res.status(400).json({ success: false, message: 'Please choose an avatar image' });
    const result = await requireCloudinary().uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
    }, (err, res) => {
        console.log(err, res);
    });
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        },
    })

    sendToken(user, 200, res)
}

exports.loginUser = async (req, res, next) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    // require email and password
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' })
    }

    let user = await User.findOne({ email }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    // check password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    user = await User.findOne({ email })
    sendToken(user, 200, res)
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })

    }
    // reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Luna Interiors Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })

    }
}

exports.resetPassword = async (req, res, next) => {
    // hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })

    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })

    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    // JWT stays in the httpOnly cookie
    return res.status(201).json({
        success: true,
        user
    });

}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== '') {
        let user = await User.findById(req.user.id)
        const image_id = user.avatar.public_id;
        const res = await requireCloudinary().uploader.destroy(image_id);
        const result = await requireCloudinary().uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updatePassword = async (req, res, next) => {
    if (!req.body.oldPassword || String(req.body.password || '').length < 8) {
        return res.status(400).json({ message: 'Current password is required and the new password must be at least 8 characters long' })
    }
    const user = await User.findById(req.user.id).select('+password');
    // check old password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res)

}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
}

exports.deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(401).json({ message: `User does not found with id: ${req.params.id}` })
    }

    if (req.user._id.equals(user._id)) {
        return res.status(400).json({ message: "You can't delete your own account." })
    }

    if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
        return res.status(400).json({ message: "You are the last admin. You can't delete this account." })
    }

    // remove old avatar
    const image_id = user.avatar.public_id;
    await requireCloudinary().uploader.destroy(image_id);
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
        success: true,
    })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    // admins change the role only
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Please select a valid role' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(404).json({ message: `User does not found with id: ${req.params.id}` })
    }

    if (req.user._id.equals(user._id) && role !== user.role) {
        return res.status(400).json({ message: "You can't change your own role." })
    }

    if (user.role === 'admin' && role !== 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
        return res.status(400).json({ message: "You are the last admin. You can't change your role." })
    }

    await User.findByIdAndUpdate(req.params.id, { role }, {
        new: true,
        runValidators: true,
    })

    return res.status(200).json({
        success: true
    })
}

exports.logout = async (req, res, next) => {
    // attributes must match the ones used in sendToken, or the browser keeps the original cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    })

    return res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}

exports.googleLogin = async (req, res) => {
    const auth = getFirebaseAuth();
    if (!auth) return res.status(503).json({ success: false, message: 'Google login is not configured on the backend' });
    if (!req.body.idToken) return res.status(400).json({ success: false, message: 'Firebase ID token is required' });

    try {
        const decoded = await auth.verifyIdToken(req.body.idToken);
        if (!decoded.email || decoded.email_verified === false) return res.status(401).json({ success: false, message: 'Google account email is not verified' });
        let user = await User.findOne({ email: decoded.email });
        if (!user) {
            user = await User.create({
                name: decoded.name || decoded.email.split('@')[0],
                email: decoded.email,
                password: crypto.randomBytes(32).toString('hex'),
                avatar: { public_id: `firebase/${decoded.uid}`, url: decoded.picture || '/images/default_avatar.svg' },
            });
        }
        return sendToken(user, 200, res);
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Google sign-in token is invalid or expired' });
    }
};