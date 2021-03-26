const express = require('express')
const app = express()
const studentRouter = require('./routes/student')
const authRouter = require('./routes/auth')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const DATABASE_URI = require('./configs/mongodb')
const cors = require('cors')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else 
        cb(null, false)
}

app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use(multer({
    storage:fileStorage,
    fileFilter: fileFilter
}).single('imageUrl'))

app.use(bodyParser.json())



app.use('/images', express.static(path.join(__dirname, 'images')))



app.use('/student', studentRouter)
app.use('/auth', authRouter)

app.use((error, req, res, next) => {
    return res.status(error.statusCode).json({
        message:error.message
    })
})

mongoose.connect(DATABASE_URI)
.then(result=> {
    app.listen(4200)
    console.log('connected to database')
})
.catch(err=> {
    console.log(err)
})
