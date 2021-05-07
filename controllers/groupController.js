const Post = require('../models/post')
const User = require('../models/User')
const GroupMessage = require('../models/GroupMessage')
const GroupPoll = require('../models/GroupPolls')
const errorCreator = require('../errorCreator')
const io = require('../socket')

exports.createPost = async (req, res, next) => {
    try {
        const groupId = req.body.groupId
        const content = req.body.content
        const ownerId = req.body.ownerId
        const image = req.file

        let post;

        if (!image) {
            post = new Post({
                content: content,
                groupId: groupId,
                ownerId: ownerId,
            })
        }
        else {
            post = new Post({
                content: content,
                groupId: groupId,
                ownerId: ownerId,
                imageUrl: image.path
            })
        }

        const result = await post.save()

        const resul = await Post.findById(result._id)
            .populate('ownerId', 'name imageUrl')
            .exec()

        res.status(201).json({
            message: "Created Post Successfully",
            post: resul,
        })
    }
    catch (err) {
        console.log(err.message)
        const error = errorCreator(err.message, 500)
        return next(error)
    }


}

exports.getGroupPosts = async (req, res, next) => {

    try {
        const groupId = req.params.groupId
        const populationFieldsFilter = 'name imageUrl'
        const posts = await Post.find({ groupId: groupId })
            .sort({ _id: -1 })
            .populate('ownerId', populationFieldsFilter)
            .exec()


        if (!posts) {
            return res.status(404).json({
                message: "No posts found for this group"
            })
        }



        res.status(200).json({
            message: "fetched posts successfully",
            posts: posts
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

// to do 
exports.getGroupMembersInfo = async (req, res, next) => {
    try {
        const membersEmails = req.body.emails


        let members = []
        const fetchingFilter = 'name imageUrl'
        for (let i = 0; i < membersEmails.length; i++) {
            const member = await User.find({ email: membersEmails[i] }, fetchingFilter)

            if (member.length !== 0) {
                members.push(member[0])
            }
            if (i == (membersEmails.length - 1)) {
                return res.status(200).json({
                    members: members
                })
            }

        }
    }
    catch (err) {
        return res.status(500).json({
            error: err
        })
    }
}

exports.createComment = async (req, res, next) => {

    try {
        const postId = req.body.postId
        const content = req.body.content
        const ownerId = req.body.ownerId

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({
                message: "post not found"
            })
        }


        post.comments = [...post.comments, {
            content: content,
            ownerId: ownerId,
            createdAt: new Date()
        }]

        await post.save()

        return res.status(201).json({
            message: "Added comment successfully",
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }


}

exports.getPostComments = async (req, res, next) => {

    try {
        const postId = req.params.postId

        const populationFieldsFilter = 'name imageUrl'
        const post = await Post
            .findById(postId)
            .populate('comments.ownerId', populationFieldsFilter)
            .exec()


        if (!post) {
            return res.status(404).json({
                message: "post not found"
            })
        }

        return res.status(200).json({
            comments: post.comments
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.getGroupMessages = async (req, res, next) => {
    try {
        const groupId = req.params.groupId

        const messages = await GroupMessage.find({ groupId: groupId })
            .sort({ _id: 1 })
            .populate('ownerId', 'name imageUrl')
            .exec()

        if (!messages) {
            return res.json(404).json({
                message: "Messages not found"
            })
        }

        res.status(200).json({
            messages: messages
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}


exports.createMessage = async (req, res, next) => {
    try {
        const groupId = req.body.groupId
        const ownerId = req.body.ownerId
        const content = req.body.content

        const newMessage = new GroupMessage({
            groupId,
            content,
            ownerId
        })

        const resul = await newMessage.save()

        const message = await GroupMessage.findById(resul._id)
            .populate('ownerId', 'name imageUrl')
            .exec()

        io.getIO().emit('message', {
            action: 'addmessage',
            message: message
        })

        res.status(201).json({
            message: message
        })
    }
    catch (err) {
        console.log(err.message)
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.postCreateGroupPoll = async (req, res, next) => {
    try {
        const groupId = req.body.groupId
        const ownerId = req.body.ownerId
        let choices = req.body.choices
        const content = req.body.content

        choices = choices.map(choice => {
            return {
                numberOfVotes: 0,
                choiceContent: choice
            }
        })

        const newPoll = new GroupPoll({
            ownerId: ownerId,
            groupId: groupId,
            choices: choices,
            content: content
        })

        const resul = await newPoll.save()

        const result = await GroupPoll.findById(resul._id)
            .populate('ownerId', 'name imageUrl')
            .exec()


        return res.status(201).json({
            poll: result
        })

    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }


}


exports.getGroupPostsAndPolls = async (req, res , next) => {
    try {
        const groupId = req.params.groupId

        const polls = await GroupPoll.find({ groupId: groupId })
            .populate('ownerId', 'name imageUrl')
            .populate('voters.voterId', 'name imageUrl')
            .exec()

        const posts = await Post.find({ groupId: groupId })
        .populate('ownerId', 'name imageUrl')
        .exec()

        const data = posts.concat(polls).sort((a, b) => {
            return b.createdAt - a.createdAt
        })
        
        if (!polls && !posts) {
            return res.status(404).json({
                message: "no polls found"
            })
        }

        return res.status(200).json({
            posts: data
        })


    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}


exports.postVotePoll = async (req, res, next) => {
    try {
        const pollId = req.body.pollId
        const voterId = req.body.voterId
        const choiceId = req.body.choiceId

        const poll = await GroupPoll.findById(pollId)

        const choiceIndex = poll.choices.findIndex(choice => {
            return choice._id == choiceId
        })


        poll.choices[choiceIndex].numberOfVotes += 1
        poll.voters = [...poll.voters, {
            voterId: voterId,
            choiceId:choiceId
        }]

        await poll.save()


        res.status(201).json({
            poll: poll
        })
    }
    catch (err) {
        console.log(err)
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

