const Student = require('../models/student');
const Post = require('../models/post')
const GroupMessage = require('../models/GroupMessage')
const Question = require('../models/Question')
const ObjectId = require('mongodb').ObjectId
const io = require('../socket')
const errorCreator = require('../errorCreator')
const {PublicSharedItem, DepartmentSharedItem} = require('../models/SharedItem');
const { restart } = require('nodemon');


exports.getStudentInfo = async (req, res, next) => {

    try {
        const student = await Student.findById(req.userId)

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
        console.log(groupId, "content: " + content, ownerId)
        const post = new Post({
            content: content,
            groupId: groupId,
            ownerId: ownerId,
        })

        await post.save()

        res.status(201).json({
            message: "Created Post Successfully",
            post: post,
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }


}

exports.getGroupPosts = async (req, res, next) => {

    try {
        const groupId = req.params.groupId
        const posts = await Post.find({ groupId: groupId })
            .sort({ _id: -1 })
            .populate('ownerId')
            .exec()


        if (!posts) {
            return res.status(404).json({
                message: "No posts found for this group"
            })
        }

        const filteredPosts = posts.map(post => {
            return {
                postId: post._id,
                groupId: post.groupId,
                content: post.content,
                numberOfComments: post.comments.length,
                owner: {
                    imageUrl: post.ownerId.imageUrl,
                    id: post.ownerId._id,
                    name: post.ownerId.name
                },

                createdAt: post.createdAt,
            }
        })

        res.status(200).json({
            message: "fetched posts successfully",
            posts: filteredPosts
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
        const post = await Post.findById(postId).populate('comments.ownerId').exec()

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

        await newMessage.save()

        io.getIO().emit('message', {
            action: 'addmessage',
            message: newMessage
        })

        res.status(201).json({
            message: "Created message successfully",
            content: newMessage.content
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.getUniversityQuestions = async (req, res, next) => {

    try {
        const questions = await Question.find().sort({ _id: -1 }).populate('ownerId').populate('answers.ownerId').exec()

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
        
        const ques = await Question.findById(resul._id).populate('ownerId').exec()

        
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

        const question = await Question.findById(questionId)

        const newAnswer = {
            content: content,
            ownerId: answerOwnerId,
            votes: 0,
            createdAt: new Date(),
            bestAnswer: false
        }

        question.answers = [...question.answers, newAnswer]

        await question.save()
        

        res.status(201).json({
            answers: question.answers
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

        const question = await Question.findById(questionId).sort({ _id: -1 })
            .populate('answers.ownerId')
            .exec()

        res.status(200).json({
            answers: question.answers
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}


exports.upvoteAnswer = async (req, res, next) => {

    try {
        const questionId = req.params.questionId
        const answerId = req.body.answerId
        const upvoterId = req.body.upvoterId

        const question = await Question.findById(questionId)

        if (!question) {
            return res.status(404).json({
                message: "Question not found in the database"
            })
        }

        const answerIndex = question.answers.findIndex(answer => {
            return answer._id.toString() === answerId.toString()
        })

        if (answerIndex > -1) {
            const upvoters = question.answers[answerIndex].upvoters
            const downvoters = question.answers[answerIndex].downvoters
            console.log("The upvoters is : ", upvoters)
            const upvoterIndex = checkExistingUpvoter(upvoters, upvoterId)

            if (upvoterIndex > -1) {
                const updatedUpvoters = removeUpvoter(upvoters, upvoterIndex)
                question.answers[answerIndex].upvoters = [...updatedUpvoters]
                question.answers[answerIndex].votes -= 1
                await question.save()

                return res.status(201).json({
                    message: "removed upvoter",
                    upvoters: question.answers[answerIndex].upvoters,
                    downvoters: question.answers[answerIndex].downvoters,
                    answerIndex: answerIndex,
                    votes:question.answers[answerIndex].votes
                })
            }
            else {
                const downvoterIndex = checkExistingDownVoter(downvoters, upvoterId)

                if (downvoterIndex > -1) {
                    const updatedDownvoters = removeDownVoter(downvoters, downvoterIndex)
                    question.answers[answerIndex].downvoters = [...updatedDownvoters]

                    const updatedUpvoters = addUpvoter(upvoters, upvoterId)

                    question.answers[answerIndex].upvoters = [...updatedUpvoters]

                    question.answers[answerIndex].votes += 2

                    await question.save()

                    return res.status(201).json({
                        message: 'removed downvoter and added upvoter',
                        upvoters: question.answers[answerIndex].upvoters,
                        downvoters: question.answers[answerIndex].downvoters,
                        answerIndex: answerIndex,
                        votes:question.answers[answerIndex].votes
                    })
                }
                else {
                    question.answers[answerIndex].upvoters = [...upvoters, upvoterId]
                    question.answers[answerIndex].votes += 1
                    await question.save()

                    return res.status(201).json({
                        message: "added upvoter",
                        upvoters: question.answers[answerIndex].upvoters,
                        downvoters: question.answers[answerIndex].downvoters,
                        answerIndex: answerIndex,
                        votes:question.answers[answerIndex].votes
                    })
                }





            }


        }



    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next(error)
    }

}

exports.downvoteAnswer = async (req, res, next) => {


    try {
        const questionId = req.params.questionId
        const answerId = req.body.answerId
        const downvoterId = req.body.downvoterId

        const question = await Question.findById(questionId)

        if (!question) {
            return res.status(404).json({
                message: "Question not found in the database"
            })
        }

        const answerIndex = question.answers.findIndex(answer => {
            return answer._id.toString() === answerId.toString()
        })

        if (answerIndex > -1) {
            const upvoters = question.answers[answerIndex].upvoters
            const downvoters = question.answers[answerIndex].downvoters
            console.log("The downvoters is : ", downvoters)

            const downvoterIndex = checkExistingDownVoter(downvoters, downvoterId)

            if (downvoterIndex > -1) {
                const updatedDownvoters = removeDownVoter(downvoters, downvoterIndex)
                question.answers[answerIndex].downvoters = [...updatedDownvoters]
                question.answers[answerIndex].votes += 1
                await question.save()

                return res.status(201).json({
                    message: "removed downvoter",
                    upvoters: question.answers[answerIndex].upvoters,
                    downvoters: question.answers[answerIndex].downvoters,
                    answerIndex: answerIndex,
                    votes:question.answers[answerIndex].votes
                })
            }
            else {
                const upvoterIndex = checkExistingUpvoter(upvoters, downvoterId)

                if (upvoterIndex > -1) {
                    const updatedUpvoters = removeUpvoter(upvoters, upvoterIndex)
                    question.answers[answerIndex].upvoters = [...updatedUpvoters]

                    const updatedDownvoters = addDownVoter(downvoters, downvoterId)

                    question.answers[answerIndex].downvoters = [...updatedDownvoters]

                    question.answers[answerIndex].votes -= 2

                    await question.save()

                    return res.status(201).json({
                        message: 'removed upvoter and added downvoter',
                        upvoters: question.answers[answerIndex].upvoters,
                        downvoters: question.answers[answerIndex].downvoters,
                        answerIndex: answerIndex,
                        votes:question.answers[answerIndex].votes
                    })
                }
                else {
                    question.answers[answerIndex].downvoters = [...downvoters, downvoterId]
                    question.answers[answerIndex].votes -= 1
                    await question.save()

                    return res.status(201).json({
                        message: "added downvoter",
                        upvoters: question.answers[answerIndex].upvoters,
                        downvoters: question.answers[answerIndex].downvoters,
                        answerIndex: answerIndex,
                        votes:question.answers[answerIndex].votes
                    })
                }





            }


        }



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
    .find( { $text: { $search: searchQuery } } ).populate('ownerId').exec()

    res.status(200).json({
        results: searchResults
    })
}

exports.getPublicSharingItems = async (req, res, next) => {
    try {
        const items = await PublicSharedItem.find()

        if (!items) {
            return res.status(404).json({
                message:'no items found'
            })
        }

        res.status(200).json({
            items:items
        })
    }
    catch(err) {
        const error = errorCreator(err.message, 500)
        return next (error)
    }
}

exports.postPublicShareditem = async (req, res, next) => {
    try {

        const {name, details, ownerId} = req.body
        const imageUrl = req.file.path 

        const newItem = new PublicSharedItem({
            name:name,
            imageUrl:imageUrl,
            details:details,
            ownerId:ownerId,
        })

        await newItem.save()

        res.status(201).json({
            item:newItem
        })
    }
    catch (err) {
        console.log(err)
        const error = errorCreator(err.message, 500)
        return next (error)
    }
}

exports.getDepartmentSharingItems = async (req, res, next) => {
    try {
        const items = await DepartmentSharedItem.find()

        if (!items) {
            return res.status(404).json({
                message:'no items found'
            })
        }

        res.status(200).json({
            items:items
        })
    }
    catch(err) {
        const error = errorCreator(err.message, 500)
        return next (error)
    }
}

exports.postDepartmentShareditem = async (req, res, next) => {
    try {

        const {name, details, ownerId} = req.body
        const imageUrl = req.file.path 

        const newItem = new DepartmentSharedItem({
            name:name,
            imageUrl:imageUrl,
            details:details,
            ownerId:ownerId,
        })

        await newItem.save()

        res.status(201).json({
            item:newItem
        })
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next (error)
    }
}

exports.searchPublicItems = async (req, res, next) => {
    try {
        const itemName = req.query.name
        const items = await PublicSharedItem
        .find( { $text: { $search: itemName } } )
    
        res.status(200).json({
            items: items
        }) 
    }
    catch (err) {
        const error = errorCreator(err.message, 500)
        return next (error)
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