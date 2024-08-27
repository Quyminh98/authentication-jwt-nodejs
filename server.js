const express = require('express')
const app = express()
const createError = require('http-errors')
const userRoute = require('./routes/user.route')
require('dotenv').config()
const client = require('./helpers/connections_redis')

// require('./helpers/connections_mongdb')
app.get('/', (req, res, next) => {
    res.send('HOME PAGE')
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/user', userRoute)

app.use((req, res, next) => {
    // const error = new Error('Not Found')
    // error.status = 500
    // next(error)
    next(createError.NotFound('This route does not exist'))
})

app.use((err, req, res, next) => {
    res.json({
        status: err.status || 500,
        message: err.message
    })
})

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})