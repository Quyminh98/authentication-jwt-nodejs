const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const schema = mongoose.Schema()
const { testConnection } = require('../helpers/connections_multi_mongdb')
const userSchema = mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.pre('save', async function (next) {
    try {
        console.log(`Called before save on mongoose:::`, this.email, this.password);
        const salt = await bcrypt.genSalt(10);
        const hashPassword = bcrypt.hash(this.password, salt)
        this.password = hashPassword;
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.isCheckPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        next(error)
    }
}

// module.exports = mongoose.model('user', userSchema)
module.exports = testConnection.model('user', userSchema)