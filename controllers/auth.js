const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const errorCreator = require('../errorCreator')
const axios = require('axios')

exports.signUp = async (req, res, next) => {

    try {
        
        const name = req.body.name 
        const email = req.body.email
        const password = req.body.password
        
        if (await checkExistingEmail(email)) {
            return res.status(422).json({
                message: "Email is Already registerd!"
            })
        }

        const userType = getUserType(email)
    
        const hashedPassword = await bcrypt.hash(password, 12)
    
        const user = new User({
            name,
            email,
            password:hashedPassword,
            userType:userType
            
        })

        await user.save()
        return res.status(201).json({
            message: 'Signed up successfully',
        })

    }
    catch(err) {
        const error = errorCreator("Server error please try again!", 500)
        console.log(err.message)
        return next(error) 
    }
  
    
}

const checkExistingEmail = async (email) => {
    const user = await User.findOne({email:email})
    if (!user)
        return false 
    return true    
}

const getUserType = (email) => {
    const emailDomain = email.split("@")[1]
    if (emailDomain === 'najah.edu') return 'teacher'
    else if (emailDomain === 'stu.najah.edu') return 'student'
}


exports.signIn = async (req, res, next) => {
    const email = req.body.email 
    const password = req.body.password

    const user = await User.findOne({email:email})

    if (!user) {
        return res.status(403).json({
            message:"This email is not registered!!"
        })
    }
    const userPassword = user.password
    
    const isPasswordOk = await bcrypt.compare(password, userPassword)

    if (!isPasswordOk) {
        return res.status(403).json({
            message:'password is not correct'
        })
    }
    
    const token = createToken(user)
    user.token = token 

    await user.save()

    

    if (user.userType === 'teacher') {
        const response = await axios.get(`http://localhost:9002/teacher/info/${user.email}`)
        if (response.status === 200) {
            const resul = await axios.get(`http://localhost:9002/student/departmentgroup/${response.data.departmentId._id}`)
            
            return res.status(200).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                imageUrl:user.imageUrl,
                token:user.token,
                courses: response.data.courses,
                departmentName: response.data.departmentId.name,
                departmentId:response.data.departmentId._id,
                userType: user.userType,
                numberOfMembers : resul.data.numberOfMembers,
                notifications : user.notifications,
                myAsk : user.myAsk 
            })
        }
    }
    else if (user.userType === 'student') {
        const response = await axios.get(`http://localhost:9002/student/info/${user.email}`)
        if (response.status === 200) {
            const resul = await axios.get(`http://localhost:9002/student/departmentgroup/${response.data.departmentId._id}`)
           
            return res.status(200).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                imageUrl:user.imageUrl,
                token:user.token,
                courses: response.data.courses,
                departmentName: response.data.departmentId.name,
                departmentId:response.data.departmentId._id,
                userType: user.userType,
                numberOfMembers: resul.data.numberOfMembers,
                notifications : user.notifications,
                myAsk : user.myAsk
            })
        }
    }


    return res.status(200).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        imageUrl:user.imageUrl,
        token:user.token,
    })
    
}

exports.signOut = async (req,res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({
                message:'Error No User found'
            })
        }

        user.token = ''

        await user.save()

        req.userId = null

        res.status(200).json({
            message:'Signed out successfully'
        })
    }
    catch (err) {
        console.log(err)
    }
    
}


const createToken = (user) => {
    const token = jwt.sign({
        userId: user._id.toString(),
        email:user.email, 
    }, "iamabdallahdereiaiamacomputerengineer")

    return token 
}