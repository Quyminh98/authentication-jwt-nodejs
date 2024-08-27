const user = require('../models/user.model')
const createError = require('http-errors')
const { userValidate } = require('../helpers/validation')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_service')
const client = require('../helpers/connections_redis')
module.exports = {
    register: async (req, res, next) => {
        try {
            const { email, password } = req.body
            const { error } = userValidate(req.body)
            if (error) {
                throw createError(error.details[0].message)
            }
            // if (!email || !password) {
            //     throw createError.BadRequest()
            // }

            const isExist = await user.findOne({
                email
            })
            if (isExist) {
                throw createError.Conflict(`${email} is ready been registered`)
            }
            const newUser = new user({
                email,
                password
            })
            const savedUser = await newUser.save()

            return res.json({
                status: 'okay',
                elements: savedUser
            })
        } catch (error) {
            next(error)
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();
            const { userId } = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(userId)
            const newRefreshToken = await signRefreshToken(userId)
            res.json({
                accessToken,
                refreshToken: newRefreshToken
            })
            // console.log("payload: ", payload);
        } catch (error) {
            next(error)
        }

    },
    login: async (req, res, next) => {
        try {
            const { error } = userValidate(req.body)
            if (error) {
                throw createError(error.details[0].message)
            }
            const { email, password } = req.body
            const foundUser = await user.findOne({
                email
            })
            if (!foundUser) {
                throw createError.NotFound('User not registered')
            }
            const isValid = await foundUser.isCheckPassword(password)
            if (!isValid) {
                throw createError.Unauthorized()
            }
            const accessToken = await signAccessToken(foundUser._id)
            const refreshToken = await signRefreshToken(foundUser._id)

            res.json({ accessToken, refreshToken })
        } catch (error) {
            next(error)
        }

    },
    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) {
                throw createError.BadRequest()
            }
            const { userId } = await verifyRefreshToken(refreshToken)
            client.del(userId.toString(), (err, reply) => {
                if (err) {
                    throw createError.InternalServerError()
                }
                res.json({
                    message: 'Logout'
                })
            })
        } catch (err) {

        }
    },
    getlists: (req, res, next) => {
        console.log((req.headers));
        const listUsers = [
            {
                email: 'abc@gmail.com'
            },
            {
                email: 'def@gmail.com'
            }
        ]
        res.json({
            listUsers
        })
    }

}