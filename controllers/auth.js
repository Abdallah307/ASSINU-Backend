const Student = require('../models/student')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const errorCreator = require('../errorCreator')

exports.signUp = async (req, res, next) => {
    const name = req.body.name 
    const email = req.body.email
    const password = req.body.password

    if (await checkExistingEmail(email)) {
        return res.status(422).json({
            message: "Email is Already registerd!"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const student = new Student({
        name,
        email,
        password:hashedPassword,
    })

    try {
        await student.save()
        return res.status(200).json({
            message: 'Signed up successfully',
        })
    }
    catch(err) {
        const error = errorCreator("Server error please try again!", 500)
        return next(error) 
    }
}

const checkExistingEmail = async (email) => {
    const student = await Student.findOne({email:email})
    if (!student)
        return false 
    return true    
}


exports.signIn = async (req, res, next) => {

    const email = req.body.email 
    const password = req.body.password

    const student = await Student.findOne({email:email})

    if (!student) {
        return res.status(403).json({
            message:"This email is not registered!!"
        })
    }
    const studentPassword = student.password
    
    const isPasswordOk = await bcrypt.compare(password, studentPassword)

    if (!isPasswordOk) {
        return res.status(403).json({
            message:'password is not correct'
        })
    }
    
    const token = createToken(student)
    student.token = token 
    await student.save()
    return res.status(200).json(student)
    
}


const createToken = (student) => {
    const token = jwt.sign({
        userId: student._id.toString(),
        email:student.email 
    }, "iamabdallahdereiaiamacomputerengineer")

    return token 
}