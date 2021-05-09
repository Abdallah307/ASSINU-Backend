const DepartmentGroupPost = require("../models/YeniModels/DepartmentGroup/DepartmentGroupPost");
const DepartmentGroupQuestion = require("../models/YeniModels/DepartmentGroup/DepartmentGroupQuestion");
const DepartmentGroupAnswer = require("../models/YeniModels/DepartmentGroup/DepartmentGroupAnswer");
const DepartmentGroupPostComment = require("../models/YeniModels/DepartmentGroup/DepartmentGroupPostComment");
const DepartmentGroupPostCommentReplay = require("../models/YeniModels/DepartmentGroup/DepartmentGroupPostCommentReplay");
const errorCreator = require("../errorCreator");
const DepartmentGroupAnswerComment = require("../models/YeniModels/DepartmentGroup/DepartmentGroupAnswerComment");
const DepartmentGroupAnswerCommentReplay = require("../models/YeniModels/DepartmentGroup/DepartmentGroupAnswerCommentReplay");

const getPosts = async (departmentId) => {
  return DepartmentGroupPost.find({ departmentId: departmentId })
    .populate("owner", "name imageUrl")
    .exec();
};

const getQuestions = async (departmentId) => {
  return DepartmentGroupQuestion.find({ departmentId: departmentId })
    .populate("owner", "name imageUrl")
    .exec();
};

const isNullResult = (result) => {
  if (!result) return true;
  return false;
};


exports.getPostsAndQuestions = async (req, res, next) => {
  try {
    
    const posts = await getPosts(req.params.departmentId);

    const questions = await getQuestions(req.params.departmentId);

    if (isNullResult(posts) && isNullResult(questions)) {
      return res.status(404).json({
        error: "Posts and questions not found",
      });
    }

    if (!isNullResult(posts) && !isNullResult(questions)) {
      const data = posts.concat(questions).sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

      return res.status(200).json({
        data : data,
      });
    }

    if (!isNullResult(posts)) {
      return res.status(200).json({
        data : data
      });
    }

    if (!isNullResult(questions)) {
      return res.status(200).json({
        data : data
      });
    }
  } catch (err) {
    const error = errorCreator(err.message, 500);
    return next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const { content, departmentId } = req.body;
    const image = req.file 
    let question;
    if (!image) {
       question = new DepartmentGroupQuestion({
        content: content,
        owner: req.userId,
        departmentId: departmentId,
      });
    }
    else {
       question = new DepartmentGroupQuestion({
        content: content,
        owner: req.userId,
        departmentId: departmentId,
        imageUrl : image.path 
      });
    }
    

    const result = await question.save();

    const createdQuestion = await DepartmentGroupQuestion.findById(result._id)
      .populate("owner", "name imageUrl")
      .exec();

    return res.status(201).json({
      data: createdQuestion,
    });
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.addAnswer = async (req, res, next) => {
  try {
    const { content, question } = req.body;

    const answer = new DepartmentGroupAnswer({
      content: content,
      owner: req.userId,
      question: question,
    });

    const result = await answer.save();

    const createdAnswer = await DepartmentGroupAnswer.findById(result._id)
      .populate("owner", "name imageUrl")
      .exec();

    res.status(201).json({
      answer: createdAnswer,
    });

    const targetQuestion = await DepartmentGroupQuestion.findById(question);
    targetQuestion.numberOfAnswers += 1;

    targetQuestion.save();
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.getQuestionAnswers = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const answers = await DepartmentGroupAnswer.find({ question: questionId})
    .populate('owner', 'name imageUrl')
    .exec()
    
    if (isNullResult(answers)) {
      return res.status(404).json({
        error: "No answers found",
      });
    }

    return res.status(200).json({
      answers: answers,
    });
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.getAnswerComments = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const comments = await DepartmentGroupAnswerComment.find({
      answer: answerId,
    });

    if (isNullResult(comments)) {
      return res.status(404).json({
        error: "No comments found",
      });
    }

    return res.status(200).json({
      comments: comments,
    });
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.addCommentToAnswer = async (req, res, next) => {
  try {
    const { answer, content } = req.body;

    const comment = new DepartmentGroupAnswerComment({
      answer: answer,
      owner: req.userId,
      content: content,
    });

    const result = await comment.save();

    const createdComment = await DepartmentGroupAnswerComment.findById(
      result._id
    ).populate("owner", "name imageUrl");
    res.status(201).json({
      comment: createdComment,
    });

    const targetAnswer = await DepartmentGroupAnswer.findById(answer);
    targetAnswer.numberOfComments += 1;

    await targetAnswer.save();
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.getAnswerCommentReplays = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const replays = await DepartmentGroupAnswerCommentReplay.find({
      comment: comment,
    });

    if (isNullResult(replays)) {
      return res.status(404).json({
        error: "replays not found",
      });
    }

    return res.status(200).json({
      replays: replays,
    });
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.addReplayToAnswerComment = async (req, res, next) => {
  try {
    const { comment, content } = req.body;
    const replay = new DepartmentGroupAnswerCommentReplay({
      comment: comment,
      content: content,
      owner: req.userId,
    });

    const result = await replay.save();

    const createdReplay = await DepartmentGroupAnswerCommentReplay.findById(
      result._id
    )
      .populate("owner", "name imageUrl")
      .exec();

      return res.status(201).json({
        replay : createdReplay
      })

  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.upvoteAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.body;
    if (req.userId !== null) {
      const answer = await DepartmentGroupAnswer.findById(answerId);

      if (isNullResult(answer)) {
        return res.status(404).json({
          error: "Answer not found",
        });
      }

      const upvoterIndex = checkExistingUpvoter(answer.upvoters, req.userId);

      if (upvoterIndex > -1) {
        const updatedUpvoters = removeUpvoter(answer.upvoters, upvoterIndex);
        answer.upvoters = [...updatedUpvoters];
        answer.numberOfUpvotes -= 1;
        await answer.save();

        return res.status(201).json({
          message: "removed existing upvoter",
          answer: answer,
        });
      }

      const existingDownVoterIndex = checkExistingDownVoter(
        answer.downvoters,
        req.userId
      );

      if (existingDownVoterIndex > -1) {
        const updatedDownVoters = removeDownVoter(
          answer.downvoters,
          existingDownVoterIndex
        );
        answer.downvoters = [...updatedDownVoters];
        answer.numberOfDownvotes -= 1;
        answer.upvoters = [...answer.upvoters,req.userId];
        answer.numberOfUpvotes += 1;
        await answer.save();

        return res.status(201).json({
          message: "removed downvoter and added upvoter",
          answer: answer,
        });
      }

      answer.upvoters = [...answer.upvoters, req.userId];
      answer.numberOfUpvotes += 1;
      await answer.save();

      return res.status(201).json({
        message: "added upvoter",
        answer: answer,
      });
    }
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.downvoteAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.body;

    const answer = await DepartmentGroupAnswer.findById(answerId);

    if (isNullResult(answer)) {
      return res.status(404).json({
        message: "answer not found",
      });
    }

    const downvoterIndex = checkExistingDownVoter(
      answer.downvoters,
      req.userId
    );

    if (downvoterIndex > -1) {
      const updatedDownvoters = removeDownVoter(
        answer.downvoters,
        downvoterIndex
      );
      answer.downvoters = [...updatedDownvoters];
      answer.numberOfDownvotes -= 1;
      await answer.save();

      return res.status(201).json({
        message: "removed existing downvoter",
        answer: answer,
      });
    }

    const existingUpvoterIndex = checkExistingUpvoter(
      answer.upvoters,
      req.userId
    );

    if (existingUpvoterIndex > -1) {
      const updatedUpVoters = removeUpvoter(
        answer.upvoters,
        existingUpvoterIndex
      );
      answer.upvoters = [...updatedUpVoters];
      answer.numberOfUpvotes -= 1;
      answer.downvoters = [...answer.downvoters, req.userId];
      answer.numberOfDownvotes += 1;
      await answer.save();

      return res.status(201).json({
        message: "removed upvoter and added downvoter",
        answer: answer,
      });
    }

    answer.downvoters = [...answer.downvoters, req.userId];
    answer.numberOfDownvotes += 1;
    await answer.save();

    return res.status(201).json({
      message: "added downvoter",
      answer: answer,
    });
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.toggleQuestionFollowingStatus = async (req, res, next) => {
  try {
    const questionId = req.body.questionId;
    console.log(req.userId)
    if (isNullResult(req.userId)) {
      return res.status(401).json({
        error: "Not Authenticated",
      });
    }

    const question = await DepartmentGroupQuestion.findById(questionId);

    const followers = question.followers;

    if (checkExistingQuestionFollower(followers, req.userId)) {
      const updatedFollwers = unFollowQuestion(question, req.userId);
      question.followers = [...updatedFollwers];
      question.numberOfFollowers -= 1

      await question.save();

      return res.status(201).json({
        message: true,
        follower: null,
      });
    }

    const updatedFollowers = followQuestion(question.followers, req.userId);

    question.followers = [...updatedFollowers];
    question.numberOfFollowers += 1

    await question.save();

    const follower = question.followers.find((follower) => {
      return follower == req.userId;
    });

    res.status(201).json({
      message: false,
      follower: follower,
    });
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.createPost = async (req, res, next) => {
  try {

    const {content, departmentId} = req.body

    const image = req.file

    let post;

    if (!image) {
        post = new DepartmentGroupPost({
            content: content,
            departmentId : departmentId,
            owner: req.userId,
        })
    }
    else {
        post = new DepartmentGroupPost({
            content: content,
            owner: req.userId,
            imageUrl: image.path,
            departmentId : departmentId
        })
    }

    const result = await post.save()

    const resul = await DepartmentGroupPost.findById(result._id)
        .populate('owner', 'name imageUrl')
        .exec()

    res.status(201).json({
        message: "Created Post Successfully",
        data: resul,
    })
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.togglePostLikeStatus = async (req, res, next) => {
  try {
    const {postId} = req.body
    const post = await DepartmentGroupPost.findById(postId)

    if (isNullResult(post)) {
      return res.status(404).json({
        error : 'Post not found'
      })
    }


    const likerIndex = post.likes.findIndex(liker => {
        return liker == req.userId
    })

    if (likerIndex > -1) {
        post.likes = [...post.likes].filter(liker => {
          return liker !== req.userId
        })
        post.numberOfLikes -= 1
        await post.save()
        return res.status(201).json({
          message : 'Removed existing like'
        })
    }
    console.log(req.userId)
    post.likes = [...post.likes, req.userId]
    post.numberOfLikes += 1
    await post.save()

    return res.status(201).json({
      message : 'added like'
    })
  } 
  catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.addPostComment = async (req, res, next) => {
  try {
    const {content , post} = req.body 

    const image = req.file 
    let comment;

    if (!image) {
      comment = new DepartmentGroupPostComment({
        content : content ,
        post : post,
        owner : req.userId
      })
    }
    else {
      comment = new DepartmentGroupPostComment({
        content : content,
        post : post,
        owner : req.userId,
        imageUrl : image.path
      })
    }

    await comment.save()

    return res.status(201).json({
      message : "Created Comment successfully",
      comment : comment
    })

    
  } 
  catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.addReplayToPostComment = async (req, res, next) => {
  try {
    const {comment, content} = req.body
    const replay = new DepartmentGroupPostCommentReplay({
      content : content ,
      comment : comment,
      owner : req.userId 
    })
    
    await replay.save()

    return res.status(201).json({
      message : "added replay successfully",
      replay : replay 
    })
    
  } catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.getPostComments = async (req, res, next) => {
  try {
    const {post} = req.body
    const comments = await DepartmentGroupPostComment.find({post: post}) 
    if (isNullResult(comments)) {
      return res.status(404).json({
        error : 'Comments not found'
      })
    }

    return res.status(200).json({
      comments : comments
    })
  } 
  catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

exports.getPostCommentReplays = async (req, res, next) => {
  try {
    const {comment} = req.body 
    const replays = await DepartmentGroupPostCommentReplay.find({comment : comment})

    if (isNullResult(replays)) {
      return res.status(404).json({
        error : 'Replays not found'
      })
    }

    return res.status(200).json({
      replays : replays 
    })
  } 
  catch (err) {
    return next(errorCreator(err.message, 500));
  }
};

const checkExistingUpvoter = (upvoters, upvoterId) => {
  const upvoterIndex = upvoters.findIndex(
    (upvoter) => upvoter == upvoterId
  );
  return upvoterIndex;
};

const removeUpvoter = (upvoters, upvoterIndex) => {
  const updatedUpvoters = upvoters.splice(upvoterIndex, 0);
  return updatedUpvoters;
};

const checkExistingDownVoter = (downvoters, downvoterId) => {
  const downvoterIndex = downvoters.findIndex(
    (downvoter) => downvoter == downvoterId
  );
  return downvoterIndex;
};

const removeDownVoter = (downvoters, downvoterIndex) => {
  const updatedDownvoters = downvoters.splice(downvoterIndex, 0);
  return updatedDownvoters;
};

const addDownVoter = (downvoters, downvoterId) => {
  const updatedDownvoters = [...downvoters, downvoterId];
  return updatedDownvoters;
};

const addUpvoter = (upvoters, upvoterId) => {
  const updatedUpvoters = [...upvoters, upvoterId];
  return updatedUpvoters;
};

const checkExistingQuestionFollower = (followers, followerId) => {
  if (followers.length === 0) {
    return false;
  }
  const existingFollowerIndex = followers.findIndex((follower) => {
    return follower.toString() === followerId.toString();
  });

  if (existingFollowerIndex > -1) return true;

  return false;
};

const followQuestion = (followers, followerId) => {
  const updatedFollwers = [...followers, followerId];
  return updatedFollwers;
};

const unFollowQuestion = (question, followerId) => {
  const updatedFollwers = [...question.followers].filter((follower) => {
    return follower.toString() !== followerId.toString();
  });

  return updatedFollwers;
};
