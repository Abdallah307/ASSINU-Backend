const AskQuestion = require("../models/askQuestion");
const errorCreator = require("../errorCreator");
const User = require('../models/User')
const io = require("../socket");

exports.askQuestion = async (req, res, next) => {

  try {
    const { question, receiver } = req.body;

    const receiverUser = await User.findById(receiver)
  
    if (!receiverUser.myAsk) {
      throw errorCreator('Error occured', 403)
    }
  
    const newQuestion = new AskQuestion({
      question: question,
      sender: req.userId,
      receiver: receiver,
    });
    const result = await newQuestion.save();
    
  
    io.getIO().emit("askQuestion", {
      receiver : receiver,
      question : result 
    });
  
    return res.status(201).json({
      question: newQuestion,
    });
  }
  catch(err) {
    return next (err)
  }
  
};

exports.getReceivedQuestions = async (req, res, next) => {
  const userId = req.params.userId;
  const questions = await AskQuestion.find({
    receiver: userId,
    isAnswered: false,
  })
  .sort({_id : -1})

  if (!questions) {
    return res.status(404).json({
      message: "no questions found",
    });
  }

  return res.status(200).json({
    questions: questions,
  });
};

exports.getAskedQuestions = async (req, res, next) => {
  const userId = req.params.userId;
  const questions = await AskQuestion.find({ sender: userId }).sort({_id : -1});

  if (!questions) {
    return res.status(404).json({
      message: "no questions found",
    });
  }

  return res.status(200).json({
    questions: questions,
  });
};

exports.getAnsweredQuestions = async (req, res, next) => {
  const userId = req.params.userId;
  const questions = await AskQuestion.find({
    receiver: userId,
    isAnswered: true,
  }).sort({_id : -1});

  if (!questions) {
    return res.status(404).json({
      message: "no questions found",
    });
  }

  return res.status(200).json({
    questions: questions,
  });
};

exports.answerQuestion = async (req, res, next) => {
  try {
    const questionId = req.body.questionId;
    const answer = req.body.answer;
    const username = req.body.username

    const question = await AskQuestion.findById(questionId);

    question.answer = answer;
    question.isAnswered = true;

    await question.save();
    io.getIO().emit("myAskQuestionAnswered", {
        emiterName : username ,
        receiver : question.sender,
        questionId : questionId,
        answer : answer  
    }); 

    return res.status(201).json({
      question: question,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getQuestionAnswer = async (req, res, next) => {
  try {
    const questionId = req.params.questionId;
    const questionAnswer = await AskQuestion.findById(questionId).select(
      "answer"
    );

    return res.status(200).json({
      answer: questionAnswer,
    });
  } catch (err) {
    return next(err);
  }
};
