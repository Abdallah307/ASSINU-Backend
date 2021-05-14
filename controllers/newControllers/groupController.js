const Post = require("../../models/newModels/Post");
const Comment = require("../../models/newModels/Comment");
const Answer = require("../../models/newModels/Answer");
const Question = require("../../models/newModels/Question");
const Replay = require("../../models/newModels/Replay");
const errorCreator = require("../../errorCreator");
const Poll = require("../../models/newModels/Poll");

const getPosts = async (groupId) => {
  return Post.find({ groupId: groupId })
    .populate("owner", "name imageUrl")
    .exec();
};

const getQuestions = async (groupId) => {
  return Question.find({ groupId: groupId })
    .populate("owner", "name imageUrl")
    .exec();
};

const getPolls = async (groupId) => {
  return Poll.find({ groupId: groupId })
    .populate("owner", "name imageUrl")
    .exec();
};

const isNullResult = (result) => {
  if (!result) return true;
  return false;
};

exports.getGroupTimeline = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const posts = await getPosts(groupId);
    const questions = await getQuestions(groupId);
    const polls = await getPolls(groupId);

    if (isNullResult(posts)) posts = [];
    if (isNullResult(questions)) questions = [];
    if (isNullResult(polls)) polls = [];

    const timelineData = posts.concat(questions).concat(polls);

    return res.status(200).json({
      timeline: timelineData,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createQuestion = async (req, res, next) => {
    try {
        const { content, groupId } = req.body;
        const image = req.file 
        let question;
        if (!image) {
           question = new Question({
            content: content,
            owner: req.userId,
            groupId: groupId,
          });
        }
        else {
           question = new Question({
            content: content,
            owner: req.userId,
            groupId: groupId,
            imageUrl : image.path 
          });
        }
        
    
        const result = await question.save();
    
        const createdQuestion = await Question.findById(result._id)
          .populate("owner", "name imageUrl")
          .exec();
    
        return res.status(201).json({
          data: createdQuestion,
        });
    }
    catch(err) {
        return next (err)
    }
}

exports.addAnswer = async (req, res, next) => {
    try {
        const { content, question } = req.body;

        const answer = new Answer({
          content: content,
          owner: req.userId,
          question: question,
        });
    
        const result = await answer.save();
    
        const createdAnswer = await Answer.findById(result._id)
          .populate("owner", "name imageUrl")
          .exec();
    
        res.status(201).json({
          answer: createdAnswer,
        });
    
        const targetQuestion = await Question.findById(question);
        targetQuestion.numberOfAnswers += 1;
    
        targetQuestion.save();
    }
    catch(err) {
        return next (err)
    }
}

exports.getQuestionAnswers = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const answers = await Answer.find({ question: questionId})
        .populate('owner', 'name imageUrl')
        .exec()
        
        if (isNullResult(answers)) {
          throw errorCreator('Answers Not Found', 404)
        }
    
        return res.status(200).json({
          answers: answers,
        });
    }
    catch(err) {
        return next (err)
    }
}

exports.upvoteAnswer = async (req, res, next) => {
    try {
        const { answerId } = req.body;
        if (req.userId !== null) {
          const answer = await Answer.findById(answerId);
    
          if (isNullResult(answer)) {
            throw errorCreator('Answer not found', 404)
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
    }
    catch(err) {
        return next (err)
    }
}

exports.downvoteAnswer = async (req, res, next) => {
    try {
        const { answerId } = req.body;

        const answer = await Answer.findById(answerId);
    
        if (isNullResult(answer)) {
            throw errorCreator('Answer not found', 404)
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
    }
    catch(err) {
        return next (err)
    }
}

exports.toggleQuestionFollowingStatus = async (req, res, next) => {
    try {
        const questionId = req.body.questionId;
       

    
        const question = await Question.findById(questionId);
    
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
    }
    catch(err) {
        return next (err)
    }
}

exports.getComments = async (req, res, next) => {
    try {
        const {referedTo} = req.params
        const comments = await Comment
        .find({referedTo : referedTo})
        .sort({_id : -1})
        .populate('owner', 'name imageUrl')
        .exec()

        if (isNullResult(comments)) {
            throw errorCreator('Comments not found', 404)
        }

        return res.status(200).json({
            comments : comments
        })
    }
    catch(err) {
        return next (err)
    }
}

exports.addComment = async (req, res, next) => {
    try {
        const {referedTo, content, type} = req.body 
        const comment = new Comment({
            content : content ,
            referedTo : referedTo,
            owner : req.userId 
        })

        const result = await comment.save()

        const createdComment = await Comment.findById(result._id)
        .populate('owner', 'name imageUrl')
        .exec()

        res.status(201).json({
            comment : createdComment
        })

        if (type === 'answer') {
            const answer = await Answer.findById(referedTo)
            answer.numberOfComments += 1
            answer.save()
        }
        else if (type === 'post') {
            const post = await Post.findById(referedTo)
            post.numberOfComments += 1
            post.save()
        }
    }
    catch(err) {
        return next (err)
    }
}

exports.getReplays = async (req, res, next) => {
    try {
        const {referedTo} = req.params
        const replays = await Replay
        .find({referedTo : referedTo})
        .sort({_id : -1})
        .populate('owner', 'name imageUrl')
        .exec()

        if (isNullResult(replays)) {
            throw errorCreator('Replays not found', 404)
        }

        return res.status(200).json({
            replays : replays
        })
        
    }
    catch(err) {
        return next (err)
    }
}

exports.addReplay = async (req, res, next) => {
    try {
        const {referedTo, content} = req.body 
        const replay = new Replay({
            content : content ,
            referedTo : referedTo,
            owner : req.userId 
        })

        const result = await replay.save()

        const createdReplay = await Replay.findById(result._id)
        .populate('owner', 'name imageUrl')
        .exec()

        res.status(201).json({
            replay : createdReplay
        })

        const targetComment = await Comment.findById(referedTo)
        targetComment.numberOfReplays += 1
        targetComment.save() 

    }
    catch(err) {
        return next (err)
    }
}

exports.createPost = async (req, res, next) => {
    try {

    const {content, groupId} = req.body

    const image = req.file

    let post;

    if (!image) {
        post = new Post({
            content: content,
            groupId : groupId,
            owner: req.userId,
        })
    }
    else {
        post = new Post({
            content: content,
            owner: req.userId,
            imageUrl: image.path,
            groupId : groupId
        })
    }

    const result = await post.save()

    const resul = await Post.findById(result._id)
        .populate('owner', 'name imageUrl')
        .exec()

    res.status(201).json({
        message: "Created Post Successfully",
        post: resul,
    })
    }
    catch(err) {
        return next (err)
    }
}

exports.togglePostLikeStatus = async (req, res, next) => {
    try {
        const {postId} = req.body
        const post = await Post.findById(postId)
    
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
    catch(err) {
        return next (err)
    }
}

exports.createPoll = async (req, res, next) => {
    try {
        let {groupId , choices , content} = req.body

        choices = choices.map(choice => {
            return {
                numberOfVotes: 0,
                choiceContent: choice
            }
        })

        const newPoll = new Poll({
            owner: req.userId,
            groupId: groupId,
            choices: choices,
            content: content
        })

        const resul = await newPoll.save()

        const result = await Poll.findById(resul._id)
            .populate('owner', 'name imageUrl')
            .exec()


        return res.status(201).json({
            poll: result
        })
    }
    catch(err) {
        return next (err)
    }
}

exports.postVotePoll = async (req, res, next) => {
    try {
        const {pollId , choiceId} = req.body

        const poll = await Poll.findById(pollId)

        const choiceIndex = poll.choices.findIndex(choice => {
            return choice._id == choiceId
        })


        poll.choices[choiceIndex].numberOfVotes += 1
        poll.voters = [...poll.voters, {
            voterId: req.userId,
            choiceId:choiceId
        }]

        await poll.save()


        res.status(201).json({
            poll: poll
        })
    }
    catch(err) {
        return next (err)
    }
}




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

