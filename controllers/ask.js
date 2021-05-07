const AskQuestion = require('../models/askQuestion')
const errorCreator = require('../errorCreator')

exports.askQuestion = async (req,res,next) => {
    
    const {question, sender, receiver} = req.body 

    const newQuestion = new AskQuestion({
        question:question,
        sender:sender,
        receiver:receiver
    })

    await newQuestion.save()

    return res.status(201).json({
        q:newQuestion
    })
}

exports.getReceivedQuestions = async (req,res,next) => {

    const userId = req.params.userId 
    const questions = await AskQuestion.find({receiver:userId, isAnswered:false})

    if (!questions) {

        return res.status(404).json({
            message:'no questions found'
        })
    }

    return res.status(200).json({
        questions:questions
    })
}

exports.getAskedQuestions = async (req,res,next) => {
    const userId = req.params.userId 
    const questions = await AskQuestion.find({sender:userId})

    if (!questions) {

        return res.status(404).json({
            message:'no questions found'
        })
    }

    return res.status(200).json({
        questions:questions
    })
}

exports.getAnsweredQuestions = async (req,res,next) => {
    const userId = req.params.userId 
    const questions = await AskQuestion.find({receiver:userId, isAnswered:true})

    if (!questions) {

        return res.status(404).json({
            message:'no questions found'
        })
    }

    return res.status(200).json({
        questions:questions
    })
}

exports.answerQuestion = async (req,res,next) => {
    try {
        const questionId = req.body.questionId
        const answer = req.body.answer 

        const question = await AskQuestion.findById(questionId)

        question.answer = answer
        question.isAnswered = true

        await question.save()

        return res.status(201).json({
            question:question
        })
    }
    catch(err) {
        return next(err)
    }
}

exports.getQuestionAnswer = async (req,res,next) => {
    try {
        const questionId = req.params.questionId 
        const questionAnswer = await AskQuestion.findById(questionId)
        .select('answer')

        return res.status(200).json({
            answer:questionAnswer
        })
    }
    catch(err) {
        return next(err)
    }
}