const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student')
const Post = require('../models/post')
const Student = require('../models/student')
const isAuth = require('../middleware/is-auth')
const ObjectId = require('mongodb').ObjectId
const io = require('../socket')





router.get('/info',isAuth, studentController.getStudentInfo)
router.get('/:studentId', async (req, res, next) => {
    const studentId = req.params.studentId
    const student = await Student.findById(ObjectId(studentId))
    new Date().to
    if (!student) {
        return res.status(404).json({
            message:"student not found"
        })
    }

    return res.status(200).json({
        name: student.name,
        imageUrl: student.imageUrl,
    })
})
router.post('/createpost', async (req, res, next) => {
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
    
})

router.get('/group/posts/:groupId', async (req, res, next) => {
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
})

router.put('/group/posts/comment/:postId', async (req, res, next) => {
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
    
})

router.get('/group/posts/comments/:postId', async (req, res, next) => {
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
})

module.exports = router 
