const Question = require('../models/Question')
const Answer = require('../models/answer')
const AnswerComment = require('../models/answerComment')
const Replay = require('../models/replay')
const errorCreator = require('../errorCreator')

exports.searchQuestion = async (req, res, next) => {
    const searchQuery = req.query.questionText
    const searchResults = await Question
        .find({ $text: { $search: searchQuery } }).populate('ownerId').exec()

    res.status(200).json({
        results: searchResults
    })
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
