const Student = require('../models/student');
const Post = require('../models/post')
const GroupMessage = require('../models/GroupMessage')
const ObjectId = require('mongodb').ObjectId
const io = require('../socket')


exports.getStudentInfo = async (req, res, next) => {
    const student = await Student.findById(req.userId)
    
    if (!student) {
        return res.status(401).json({
            message: "student not found in the database"
        })
    }

    return res.status(200).json({
        name: student.name,
        imageUrl:student.imageUrl,
        bio:student.bio 
    })
}

exports.getImageAndName = async (req, res, next) => {
    const studentId = req.params.studentId
    const student = await Student.findById(ObjectId(studentId))
    
    if (!student) {
        return res.status(404).json({
            message:"student not found"
        })
    }

    return res.status(200).json({
        name: student.name,
        imageUrl: student.imageUrl,
    })
}


exports.createPost = async (req, res, next) => {
    const groupId = req.body.groupId
    const content = req.body.content 
    const ownerId = req.body.ownerId
    
    const post = new Post({
        content:content,
        groupId: groupId,
        ownerId: ownerId,
    })

    await post.save()

    io.getIO().emit('posts', {
        action: 'createdPost',
        post:post
    })

    res.status(201).json({
        message:"Created Post Successfully",
        post:post,
    })
    
}

exports.getGroupPosts = async (req, res, next) => {
    const groupId = req.params.groupId
    const posts = await Post.find({groupId: groupId})

    if  (!posts) {
        return res.status(404).json({
            message:"No posts found for this group"
        })
    }

    res.status(200).json({
        message:"fetched posts successfully",
        posts:posts 
    })
}

exports.createComment = async (req, res, next) => {
    const postId = req.params.postId
    const comment = req.body.comment

    const post = await Post.findById(postId)

    if (!post) {
        return res.status(404).json({
            message:"post not found"
        })
    }

     
    post.comments = [...post.comments, comment]
    await post.save()

    return res.status(201).json({
        message:"Added comment successfully",
    })
    
}

exports.getPostComments = async (req, res, next) => {
    const postId = req.params.postId
    const post = await Post.findById(postId).populate('comments.ownerId')
    
    if (!post) {
        return res.status(404).json({
            message:"post not found"
        })
    }
 
    return res.status(200).json({
        comments:post.comments
    })
}


exports.getGroupMessages = async (req, res, next) => {
    const groupId = req.params.groupId

    const messages = await GroupMessage.find({groupId: groupId})

    if (!messages) {
        return res.json(404).json({
            message:"Messages not found man"
        })
    }

    res.status(200).json({
        messages:messages
    })
}

exports.createMessage = async (req, res, next) => {
    const groupId = req.body.groupId
    const ownerId = req.body.ownerId
    const content = req.body.content

    const newMessage = new GroupMessage({
        groupId,
        content,
        ownerId
    })

    await newMessage.save()

    io.getIO().emit('posts', {
        action: 'addmessage',
        message:newMessage
    })

    res.status(201).json({
        message:"Created message successfully man",
        content:newMessage.content
    })
}