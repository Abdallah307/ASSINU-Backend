const Student = require('../models/student');
const Post = require('../models/post')
const GroupMessage = require('../models/GroupMessage')
const Question = require('../models/Question')
const ObjectId = require('mongodb').ObjectId
const io = require('../socket')
const errorCreator = require('../errorCreator')
const { PublicSharedItem, DepartmentSharedItem } = require('../models/SharedItem');
const Answer = require('../models/answer')
const AnswerComment = require('../models/answerComment')
const Replay = require('../models/replay')
const GroupPoll = require('../models/GroupPolls')
const mongoose = require('mongoose')
const Message = require('../models/Message')

exports.getStudentInfo = async (req, res, next) => {

    try {

        // if (!req.userId) {
        //     return res.status(403).json({
        //         message:'Please sign in first'
        //     })
        // }
        const student = await Student.findById('60451e36dcceee7e311cc508')

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            })
        }

        return res.status(200).json({
            name: student.name,
            imageUrl: student.imageUrl,
            bio: student.bio
        })
    }
    catch (err) {
        const error = errorCreator("Error occured in the server", 500)
        return next(error)
    }

}

exports.getGroupMembersInfo = async (req, res, next) => {
    try {
        const membersEmails = req.body.emails


        let members = []
        const fetchingFilter = 'name imageUrl'
        for (let i = 0; i < membersEmails.length; i++) {
            const member = await Student.find({ email: membersEmails[i] }, fetchingFilter)

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

exports.getImageAndName = async (req, res, next) => {

    try {
        const studentId = req.params.studentId
        const student = await Student.findById(ObjectId(studentId))

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            })
        }

        return res.status(200).json({
            name: student.name,
            imageUrl: student.imageUrl,
        })
    }
    catch (err) {
        const error = errorCreator('Error occured in the server', 500)
        return next(error)
    }

}


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
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.getUniversityQuestions = async (req, res, next) => {

    try {
        const questions = await Question
            .find()
            .sort({ _id: -1 })
            .populate('ownerId', 'imageUrl name')
            .populate('answers.ownerId', 'imageUrl name')
            .exec()

        if (!questions) {
            return res.status(404).json({
                message: "questions Not found"
            })
        }

        return res.status(200).json({
            questions: questions
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }


}

exports.addUniversityQuestion = async (req, res, next) => {

    try {
        const content = req.body.content
        const ownerId = req.body.ownerId

        const question = new Question({
            content: content,
            ownerId: ownerId,
        })

        const resul = await question.save()

        const ques = await Question.findById(resul._id)
            .populate('ownerId', 'name imageUrl').exec()

        res.status(201).json({
            message: "Created Question Successfully",
            question: ques
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.answerQuestion = async (req, res, next) => {

    try {
        const content = req.body.content
        const answerOwnerId = req.body.answerOwnerId
        const questionId = req.params.questionId


        const newAnswer = new Answer({
            content: content,
            ownerId: answerOwnerId,
            votes: 0,
            createdAt: new Date(),
            bestAnswer: false,
            questionId: questionId
        })

        const result = await newAnswer.save()
        const answerId = result._id

        const answer = await Answer.findById(answerId)
            .populate('ownerId', 'name imageUrl')
            .exec()

        res.status(201).json({
            answer: answer
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.getQuestionAnswers = async (req, res, next) => {
    try {
        const questionId = req.params.questionId

        const answers = await Answer.find({ questionId: questionId })
            .populate('ownerId', 'imageUrl name')
            .exec()

        if (!answers) {
            return res.status(404).json({})
        }

        res.status(200).json({
            answers: answers
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}


exports.upvoteAnswer = async (req, res, next) => {

    try {
        const answerId = req.body.answerId
        const upvoterId = req.body.upvoterId

        const answer = await Answer.findById(answerId)

        if (!answer) {
            return res.status(404).json({
                message: 'answer not found'
            })
        }
        const upvoterIndex = checkExistingUpvoter(answer.upvoters, upvoterId)

        if (upvoterIndex > -1) {
            const updatedUpvoters = removeUpvoter(answer.upvoters, upvoterId)
            answer.upvoters = [...updatedUpvoters]
            answer.numberOfUpvotes -= 1
            await answer.save()

            return res.status(201).json({
                message: 'removed existing upvoter',
                answer: answer
            })
        }


        const existingDownVoterIndex = checkExistingDownVoter(answer.downvoters, upvoterId)

        if (existingDownVoterIndex > -1) {
            const updatedDownVoters = removeDownVoter(answer.downvoters, upvoterId)
            answer.downvoters = [...updatedDownVoters]
            answer.numberOfDownvotes -= 1
            answer.upvoters = [...answer.upvoters, upvoterId]
            answer.numberOfUpvotes += 1
            await answer.save()

            return res.status(201).json({
                message: 'removed downvoter and added upvoter',
                answer: answer
            })
        }

        answer.upvoters = [...answer.upvoters, upvoterId]
        answer.numberOfUpvotes += 1
        await answer.save()

        return res.status(201).json({
            message: 'added upvoter',
            answer: answer
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.downvoteAnswer = async (req, res, next) => {


    try {
        const answerId = req.body.answerId
        const downvoterId = req.body.downvoterId

        const answer = await Answer.findById(answerId)

        if (!answer) {
            return res.status(404).json({
                message: 'answer not found'
            })
        }

        const downvoterIndex = checkExistingDownVoter(answer.downvoters, downvoterId)

        if (downvoterIndex > -1) {
            const updatedDownvoters = removeDownVoter(answer.downvoters, downvoterId)
            answer.downvoters = [...updatedDownvoters]
            answer.numberOfDownvotes -= 1
            await answer.save()

            return res.status(201).json({
                message: 'removed existing downvoter',
                answer: answer
            })
        }

        const existingUpvoterIndex = checkExistingUpvoter(answer.upvoters, downvoterId)

        if (existingUpvoterIndex > -1) {
            const updatedUpVoters = removeUpvoter(answer.upvoters, downvoterId)
            answer.upvoters = [...updatedUpVoters]
            answer.numberOfUpvotes -= 1
            answer.downvoters = [...answer.downvoters, downvoterId]
            answer.numberOfDownvotes += 1
            await answer.save()

            return res.status(201).json({
                message: 'removed upvoter and added downvoter',
                answer: answer
            })
        }

        answer.downvoters = [...answer.downvoters, downvoterId]
        answer.numberOfDownvotes += 1
        await answer.save()

        return res.status(201).json({
            message: 'added downvoter',
            answer: answer
        })

    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

const checkExistingUpvoter = (upvoters, upvoterId) => {
    const upvoterIndex = upvoters.findIndex(upvoter => upvoter == upvoterId)
    return upvoterIndex
}

const removeUpvoter = (upvoters, upvoterIndex) => {
    const updatedUpvoters = upvoters.splice(upvoterIndex, 0)
    return updatedUpvoters
}

const checkExistingDownVoter = (downvoters, downvoterId) => {
    const downvoterIndex = downvoters.findIndex(downvoter => downvoter == downvoterId)
    return downvoterIndex
}

const removeDownVoter = (downvoters, downvoterIndex) => {
    const updatedDownvoters = downvoters.splice(downvoterIndex, 0)
    return updatedDownvoters
}

const addDownVoter = (downvoters, downvoterId) => {
    const updatedDownvoters = [...downvoters, downvoterId]
    return updatedDownvoters;
}

const addUpvoter = (upvoters, upvoterId) => {
    const updatedUpvoters = [...upvoters, upvoterId]
    return updatedUpvoters;
}

exports.postAddAnswerComment = async (req, res, next) => {
    const answerId = req.body.answerId
    const commentOwnerId = req.body.commentOwnerId
    const content = req.body.content

    try {


        const newComment = new AnswerComment({
            answerId: answerId,
            ownerId: commentOwnerId,
            content: content
        })



        const resul = await newComment.save()

        const resultComment = await AnswerComment.findById(resul._id)
            .populate('ownerId', 'name imageUrl')
            .exec()



        return res.status(201).json({
            message: 'added a new comment',
            comment: resultComment
        })

    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.getAnswerComments = async (req, res, next) => {
    try {
        const answerId = req.params.answerId



        const comments = await AnswerComment.find({ answerId: answerId })
            .populate('ownerId', 'name imageUrl')
            .exec()

        return res.status(200).json({
            comments: comments
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}


exports.switchQuestionFollowingStatus = async (req, res, next) => {

    try {
        const questionId = req.params.questionId
        const followerId = req.body.followerId

        const question = await Question.findById(questionId)



        const followers = question.followers
        if (checkExistingQuestionFollower(followers, followerId)) {
            const updatedFollwers = unFollowQuestion(question, followerId)
            question.followers = [...updatedFollwers]

            await question.save()


            return res.status(201).json({
                message: true,
                follower: null
            })
        }

        const updatedFollowers = followQuestion(question.followers, followerId)

        question.followers = [...updatedFollowers]

        await question.save()

        const follower = question.followers.find(follower => {
            return follower.followerId == followerId
        })



        res.status(201).json({
            message: false,
            follower: follower
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}


exports.searchQuestion = async (req, res, next) => {
    const searchQuery = req.query.questionText
    const searchResults = await Question
        .find({ $text: { $search: searchQuery } }).populate('ownerId').exec()

    res.status(200).json({
        results: searchResults
    })
}

exports.getPublicSharingItems = async (req, res, next) => {
    try {
        const items = await PublicSharedItem.find()

        if (!items) {
            return res.status(404).json({
                message: 'no items found'
            })
        }

        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.postPublicShareditem = async (req, res, next) => {
    try {

        const { name, details, ownerId } = req.body
        const imageUrl = req.file.path

        const newItem = new PublicSharedItem({
            name: name,
            imageUrl: imageUrl,
            details: details,
            ownerId: ownerId,
        })

        await newItem.save()

        res.status(201).json({
            item: newItem
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.getDepartmentSharingItems = async (req, res, next) => {
    try {
        const departmentId = req.params.departmentId
        const items = await DepartmentSharedItem.find({ departmentId: departmentId })

        if (!items) {
            return res.status(404).json({
                message: 'no items found'
            })
        }
        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.postDepartmentShareditem = async (req, res, next) => {
    try {

        const { name, details, ownerId, departmentId } = req.body
        const imageUrl = req.file.path

        const newItem = new DepartmentSharedItem({
            name: name,
            imageUrl: imageUrl,
            details: details,
            ownerId: ownerId,
            departmentId: departmentId
        })


        await newItem.save()

        res.status(201).json({
            item: newItem
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.searchPublicItems = async (req, res, next) => {
    try {
        const itemName = req.query.name
        const items = await PublicSharedItem
            .find({ $text: { $search: itemName } })

        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.searchDepartmentItems = async (req, res, next) => {
    try {
        const itemName = req.query.name
        const items = await DepartmentSharedItem
            .find({ $text: { $search: itemName } })


        res.status(200).json({
            items: items
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}


exports.fetchUserItems = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const items1 = await DepartmentSharedItem.find({ ownerId: userId })
        const items2 = await PublicSharedItem.find({ ownerId: userId })

        const items = items1.concat(items2)

        return res.status(200).json({
            items: items
        })

    }
    catch (err) {
        res.status(500).json({
            error: error
        })
    }

}

exports.getCommentReplays = async (req, res, next) => {
    try {
        const commentId = req.params.commentId

        const replays = await Replay.find({ commentId: commentId })
            .populate('ownerId', 'name imageUrl')
            .exec()

        if (!replays) {
            return res.status(404).json({
                message: 'No replays found'
            })
        }

        return res.status(200).json({
            replays: replays
        })
        // const comment = await AnswerComment.findById(commentId)
        // .populate('ownerId', 'name imageUrl')
        // .populate('replays.ownerId', 'name imageUrl')
        // .exec()

        // if (!comment) {
        //     return res.status(404).json({
        //         message:'comment not found'
        //     })
        // }


        // const replays = comment.replays

        // return res.status(200).json({
        //     replays:replays 
        // })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.addCommentReplay = async (req, res, next) => {
    try {
        const commentId = req.params.commentId
        const ownerId = req.body.ownerId
        const content = req.body.content

        const newReplay = new Replay({
            ownerId: ownerId,
            content: content,
            commentId: commentId,
        })

        const resul = await newReplay.save()

        const replay = await Replay.findById(resul._id)
            .populate('ownerId', 'name imageUrl')

        return res.status(201).json({
            replay: replay
        })

    } catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }
}

exports.getGroupPolls = async (req, res, next) => {
    try {
        const groupId = req.params.groupId

        const polls = await GroupPoll.find({ groupId: groupId })
            .populate('ownerId', 'name imageUrl')
            .exec()
        const posts = await Post.find({ groupId: groupId })

        const data = posts.concat(polls)

        const modi =
            console.log(modi)
        if (!polls) {
            return res.status(404).json({
                message: "no polls found"
            })
        }

        return res.status(200).json({
            data: modi
        })


    }
    catch (err) {
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

//not completed
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
        poll.choices[choiceIndex].voters = [...poll.choices[choiceIndex].voters, {
            voterId: voterId
        }]

        await poll.save()


        res.status(201).json({
            poll: poll
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
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

        const msg = await Message.findOne({_id:resul._id})
        .populate('sender', 'imageUrl name')
        .populate('receiver', 'imageUrl name')
        .exec()

        io.getIO().emit('messageP', {
            action:'addmessageP',
            message:msg 
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
            chatUsers.push(await Student.findOne({ _id: item }).select('name imageUrl'))
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
        const {sender, receiver} = req.body

        const mss = await Message
        .find({$or:[{sender:sender, receiver:receiver},{sender:receiver, receiver:sender}]})
        .sort({_id:1})
        .populate('receiver', 'name imageUrl')
        .populate('sender', 'name imageUrl')
        .exec()

        return res.status(200).json({
            messages:mss 
        })
    }
    catch(err) {}
}







const checkExistingQuestionFollower = (followers, followerId) => {
    if (followers.length === 0) {
        return false

    }
    const existingFollowerIndex = followers.findIndex(follower => {
        return follower.followerId.toString() === followerId.toString()
    })

    if (existingFollowerIndex > -1)
        return true

    return false
}

const followQuestion = (followers, followerId) => {

    const updatedFollwers = [...followers, { followerId: followerId }]
    return updatedFollwers
}

const unFollowQuestion = (question, followerId) => {
    const updatedFollwers = [...question.followers].filter(follower => {
        return follower.followerId.toString() !== followerId.toString()
    })

    return updatedFollwers
}


