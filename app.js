const express = require('express')
const app = express()
const askRouter = require('./routes/ask')
const groupRouter = require('./routes/group')
const sharingCenterRouter = require('./routes/newRoutes/sharingCenter')
const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')
const najahApiRouter = require('./routes/najahApi')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const DATABASE_URI = require('./configs/mongodb')
const cors = require('cors')
const {sIO} = require('./middleware/socketMiddleware')


const testGroupRouter = require('./routes/newRoutes/group')

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

app.use('/group',testGroupRouter)

app.use('/ask', askRouter)


//app.use('/group', groupRouter)

app.use('/sharingcenter', sharingCenterRouter)


app.use('/user', userRouter)

app.use('/auth', authRouter)

app.use('/api/najah',najahApiRouter)

app.use((error, req, res, next) => {
    !error.statusCode ? error.statusCode = 500 : null
    
    return res.status(error.statusCode).json({
        error :error.message
    })
})

mongoose.connect(DATABASE_URI)
.then(result=> {
    const server = app.listen(4200)
    const io = require('./socket').init(server)
    sIO(io)
    console.log('connected to database')
})
.catch(err=> {
    console.log(err)
})
