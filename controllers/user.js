const User = require('../models/User')
const Message = require('../models/Message')
const errorCreator = require('../errorCreator')

exports.getUserInfo = async (req, res, next) => {

    try {

        // if (!req.userId) {
        //     return res.status(403).json({
        //         message:'Please sign in first'
        //     })
        // }
        const user = await User.findById('60451e36dcceee7e311cc508')

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        return res.status(200).json({
            name: user.name,
            imageUrl: user.imageUrl,
            bio: user.bio
        })
    }
    catch (err) {
        const error = errorCreator("Error occured in the server", 500)
        return next(error)
    }

}

exports.createPersonalMessage = async (req, res, next) => {
    try {
        const { sender, receiver, content } = req.body
        const newMessage = new Message({
            content: content,
            sender: sender,
            receiver: receiver,
        })

        const resul = await newMessage.save()

        const msg = await Message.findOne({ _id: resul._id })
            .populate('sender', 'imageUrl name')
            .populate('receiver', 'imageUrl name')
            .exec()

        io.getIO().emit('messageP', {
            action: 'addmessageP',
            message: msg
        })

        return res.status(201).json({
            message: msg
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.getAllChats = async (req, res, next) => {
    try {
        const sender = req.params.sender

        const users = new Set()

        const chatss = await Message.find({ $or: [{ sender: sender }, { receiver: sender }] })

        const chats = await Message.find({ sender: sender })
            .populate('receiver', 'name imageUrl')
            .exec()

        const chats2 = await Message.find({ receiver: sender })
            .populate('sender', 'name imageUrl')
            .exec()


        chats.forEach(chat => {
            users.add(chat.receiver._id.toString())
        })

        chats2.forEach(chat => {
            users.add(chat.sender._id.toString())
        })



        let chatUsers = [];

        for (let item of users) {
            //  if (item !== sender) {
            const lastMessage = await Message.findOne({ $or: [{ sender: sender, receiver: item }, { sender: item, receiver: sender }] })
                .sort({ _id: -1 }).exec()
            chatUsers.push({
                user: await Student.findOne({ _id: item }).select('name imageUrl'),
                lastMessage: lastMessage.content
            })
            //}

        } 

        return res.status(200).json({
            chatUsers: chatUsers
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.getPersonalMessages = async (req, res, next) => {
    try {
        const { sender, receiver } = req.body

        const mss = await Message
            .find({ $or: [{ sender: sender, receiver: receiver }, { sender: receiver, receiver: sender }] })
            .sort({ _id: 1 })
            .populate('receiver', 'name imageUrl')
            .populate('sender', 'name imageUrl')
            .exec()

        if (!mss) {
            return res.status(404).json({
                message: 'no previous conversation before'
            })
        }

        return res.status(200).json({
            messages: mss
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}