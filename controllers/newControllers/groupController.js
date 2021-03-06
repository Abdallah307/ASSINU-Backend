const Post = require("../../models/newModels/Post");
const Comment = require("../../models/newModels/Comment");
const Answer = require("../../models/newModels/Answer");
const Question = require("../../models/newModels/Question");
const Replay = require("../../models/newModels/Replay");
const errorCreator = require("../../errorCreator");
const Poll = require("../../models/newModels/Poll");
const GroupMessage = require("../../models/GroupMessage");
const io = require("../../socket");
const fileHelper = require("../../util/file");
const User = require("../../models/User");

const Notification = require("../../models/Notification");

const getPosts = async (groupId, groupType) => {
  return Post.find({ groupId: groupId, groupType: groupType })
    .populate("owner", "name imageUrl myAsk email")
    .exec();
};

const getQuestions = async (groupId, groupType) => {
  return Question.find({ groupId: groupId, groupType: groupType })
    .populate("owner", "name imageUrl myAsk email")
    .exec();
};

const getPolls = async (groupId, groupType) => {
  return Poll.find({ groupId: groupId, groupType: groupType })
    .populate("owner", "name imageUrl myAsk email")
    .populate("voters.voterId", "name imageUrl myAsk email")
    .exec();
};

const isNullResult = (result) => {
  if (!result) return true;
  return false;
};

exports.getGroupMembersInfo = async (req, res, next) => {
  try {
    const membersEmails = req.body.emails;

    let members = [];
    const fetchingFilter = "name imageUrl myAsk email";
    for (let i = 0; i < membersEmails.length; i++) {
      const member = await User.find(
        { email: membersEmails[i] },
        fetchingFilter
      );

      if (member.length !== 0) {
        members.push(member[0]);
      }
      if (i == membersEmails.length - 1) {
        return res.status(200).json({
          members: members,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

exports.getGroupTimeline = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const groupType = req.params.groupType;
    const posts = await getPosts(groupId, groupType);
    const questions = await getQuestions(groupId, groupType);
    const polls = await getPolls(groupId, groupType);

    if (isNullResult(posts)) posts = [];
    if (isNullResult(questions)) questions = [];
    if (isNullResult(polls)) polls = [];

    const timelineData = posts
      .concat(questions)
      .concat(polls)
      .sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

    return res.status(200).json({
      timeline: timelineData,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const { content, groupType, groupId, members, groupName, username } =
      req.body;

    const image = req.file;
    const userId = req.userId 
    let question;
    if (!image) {
      question = new Question({
        content: content,
        owner: req.userId,
        groupId: groupId,
        groupType: groupType,
        groupName : groupName 
      });
    } else {
      question = new Question({
        content: content,
        owner: req.userId,
        groupId: groupId,
        imageUrl: image.path,
        groupType: groupType,
        groupName : groupName
      });
    }

    const result = await question.save();

    const createdQuestion = await Question.findById(result._id)
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    res.status(201).json({
      question: createdQuestion,
    })

    const memberUsers = JSON.parse(members)
      .filter((member) => {
        return member != userId;
      })
      .map((member) => {
        return {
          member: member,
        };
      });
    console.log("The new members are : ", memberUsers);

    let notification = new Notification({
      To: memberUsers,
      NotificationType: "questionCreation",
      content: `${username} created a question in ${groupName}`,
      payload: {
        item: createdQuestion,
      },
    });

    const resultNotification = await notification.save();

    const createdNotification = await Notification.findById(
      resultNotification._id
    )
      .populate("payload.item.owner", "name imageUrl myAsk email")
      .exec();

    io.getIO().emit("createdQuestion", {
      emiter: userId,
      members: JSON.parse(members),
      notification: createdNotification,
    });

    
  } catch (err) {
    console.log(err.message)
    return next(err);
  }
};

exports.addAnswer = async (req, res, next) => {
  try {
    const { content, question, username } = req.body;

    const answer = new Answer({
      content: content,
      owner: req.userId,
      question: question,
    });

    const result = await answer.save();

    const createdAnswer = await Answer.findById(result._id)
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    res.status(201).json({
      answer: createdAnswer,
    });

    const targetQuestion = await Question.findById(question);
    targetQuestion.numberOfAnswers += 1;

    await targetQuestion.save();

    io.getIO().emit("answerAddedToQuestionFollowed", {
      emiter: req.userId,
      followers: targetQuestion.followers,
      username: username,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getQuestionAnswers = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const answers = await Answer.find({ question: questionId })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (isNullResult(answers)) {
      throw errorCreator("Answers Not Found", 404);
    }

    return res.status(200).json({
      answers: answers,
    });
  } catch (err) {
    return next(err);
  }
};

exports.upvoteAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.body;
    if (req.userId !== null) {
      const answer = await Answer.findById(answerId);

      if (isNullResult(answer)) {
        throw errorCreator("Answer not found", 404);
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
        answer.upvoters = [...answer.upvoters, req.userId];
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
    return next(err);
  }
};

exports.downvoteAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.body;

    const answer = await Answer.findById(answerId);

    if (isNullResult(answer)) {
      throw errorCreator("Answer not found", 404);
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
    return next(err);
  }
};

exports.toggleQuestionFollowingStatus = async (req, res, next) => {
  try {
    const questionId = req.body.questionId;

    const question = await Question.findById(questionId);

    const followers = question.followers;

    if (checkExistingQuestionFollower(followers, req.userId)) {
      const updatedFollwers = unFollowQuestion(question, req.userId);
      question.followers = [...updatedFollwers];
      question.numberOfFollowers -= 1;

      await question.save();

      return res.status(201).json({
        message: true,
        follower: null,
      });
    }

    const updatedFollowers = followQuestion(question.followers, req.userId);

    question.followers = [...updatedFollowers];
    question.numberOfFollowers += 1;

    await question.save();

    const follower = question.followers.find((follower) => {
      return follower == req.userId;
    });

    res.status(201).json({
      message: false,
      follower: follower,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { referedTo } = req.params;
    const comments = await Comment.find({ referedTo: referedTo })
      .sort({ _id: -1 })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (isNullResult(comments)) {
      throw errorCreator("Comments not found", 404);
    }

    return res.status(200).json({
      comments: comments,
    });
  } catch (err) {
    return next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { referedTo, content, type, username } = req.body;
    const comment = new Comment({
      content: content,
      referedTo: referedTo,
      owner: req.userId,
    });

    const result = await comment.save();

    const createdComment = await Comment.findById(result._id)
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    res.status(201).json({
      comment: createdComment,
    });

    let notification;

    if (type === "answer") {
      const answer = await Answer.findById(referedTo)
      .populate('owner','name imageUrl myAsk email')
      .exec()
      answer.numberOfComments += 1;
      await answer.save();
      notification = new Notification({
        To : [answer.owner],
        NotificationType : 'commentOnAnswer',
        content : `${username} created a comment on your answer`,
        payload : {
          item : answer 
        }
      })

      const result = await notification.save()
      const createdNotification = await Notification.findById(result._id)
      .populate("payload.item.owner", "name imageUrl myAsk email")
      .exec();

      io.getIO().emit("commentOnMyAnswer", {
        emiter: req.userId,
        answerOwner: answer.owner,
        notification : createdNotification
      });
    } else if (type === "post") {
      const post = await Post.findById(referedTo)
      .populate("payload.item.owner", "name imageUrl myAsk email")
      .exec();
      post.numberOfComments += 1;
      await post.save();

      notification = new Notification({
        To : [post.owner],
        NotificationType : 'commentOnPost',
        content : `${username} created a comment on your post`,
        payload : {
          item : post
        }
      })

      const result = await notification.save()
      const createdNotification = await Notification.findById(result._id)
      .populate("payload.item.owner", "name imageUrl myAsk email")
      .exec();


      io.getIO().emit("commentOnMyPost", {
        emiter: req.userId,
        postOwner: post.owner,
        notification : createdNotification
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.getReplays = async (req, res, next) => {
  try {
    const { referedTo } = req.params;
    const replays = await Replay.find({ referedTo: referedTo })
      .sort({ _id: -1 })
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    if (isNullResult(replays)) {
      throw errorCreator("Replays not found", 404);
    }

    return res.status(200).json({
      replays: replays,
    });
  } catch (err) {
    return next(err);
  }
};

exports.addReplay = async (req, res, next) => {
  try {
    const { referedTo, content, username } = req.body;
    const replay = new Replay({
      content: content,
      referedTo: referedTo,
      owner: req.userId,
    });

    const result = await replay.save();

    const createdReplay = await Replay.findById(result._id)
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    res.status(201).json({
      replay: createdReplay,
    });

    const targetComment = await Comment.findById(referedTo)
    .populate("owner", "name imageUrl myAsk email")
    .exec();
    
    targetComment.numberOfReplays += 1;
    await targetComment.save();

    const notification = new Notification({
      To: [targetComment.owner._id],
      NotificationType: "replayCreated",
      content: `${username} replayed to your comment`,
      payload: {
        item: targetComment,
      },
    });

    const resultedNotification = await notification.save()

    const createdNotification = await Notification.findById(resultedNotification._id)
    .populate("payload.item.owner", "name imageUrl myAsk email")
    .exec();


    io.getIO().emit("replayedToMyComment", {
      emiter: req.userId,
      commentOwner: targetComment.owner._id,
      notification : createdNotification
    });
  } catch (err) {
    return next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { content, groupType, groupId, members, groupName, username } =
      req.body;
    const image = req.file;
    console.log(members);
    let post;
    const userId = req.userId;
    if (!image) {
      post = new Post({
        content: content,
        groupId: groupId,
        owner: req.userId,
        groupType: groupType,
        groupName : groupName
      });
    } else {
      post = new Post({
        content: content,
        owner: req.userId,
        imageUrl: image.path,
        groupId: groupId,
        groupType: groupType,
        groupName : groupName
      });
    }

    const result = await post.save();

    const resul = await Post.findById(result._id)
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    res.status(201).json({
      post: resul,
    });

    const memberUsers = JSON.parse(members)
      .filter((member) => {
        return member != userId;
      })
      .map((member) => {
        return {
          member: member,
        };
      });
    console.log("The new members are : ", memberUsers);

    let notification = new Notification({
      To: memberUsers,
      NotificationType: "postCreation",
      content: `${username} created a post in ${groupName}`,
      payload: {
        item: resul,
      },
    });

    const resultNotification = await notification.save();

    const createdNotification = await Notification.findById(
      resultNotification._id
    )
      .populate("payload.item.owner", "name imageUrl myAsk email")
      .exec();

    io.getIO().emit("createdpost", {
      emiter: req.userId,
      members: JSON.parse(members),
      notification: createdNotification,
      // groupName: groupName,
      // username: username,
      // post: resul,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteGroupPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId });

    post.imageUrl ? fileHelper.deleteFile(post.imageUrl) : null;

    await Post.deleteOne({ _id: post._id });

    res.status(201).json({
      message: "removed post",
    });

    const postComments = await Comment.find({ referedTo: postId });
    if (postComments) {
      const commentsIds = postComments.map((comment) => {
        return comment._id;
      });

      await Comment.deleteMany({ referedTo: postId });
      commentsIds.forEach(async (id) => {
        await Replay.deleteMany({ referedTo: id });
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.deleteGroupPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findOne({ _id: pollId });

    //post.imageUrl ? fileHelper.deleteFile(post.imageUrl) : null;

    await Poll.deleteOne({ _id: poll._id });

    res.status(201).json({
      message: "removed poll",
    });

    
  } catch (err) {
    return next(err);
  }
}



exports.togglePostLikeStatus = async (req, res, next) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId);

    if (isNullResult(post)) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const likerIndex = post.likes.findIndex((liker) => {
      return liker == req.userId;
    });

    if (likerIndex > -1) {
      post.likes = [...post.likes].filter((liker) => {
        return liker !== req.userId;
      });
      post.numberOfLikes -= 1;
      await post.save();
      return res.status(201).json({
        message: "Removed existing like",
      });
    }
    console.log(req.userId);
    post.likes = [...post.likes, req.userId];
    post.numberOfLikes += 1;
    await post.save();

    return res.status(201).json({
      message: "added like",
    });
  } catch (err) {
    return next(err);
  }
};

exports.createPoll = async (req, res, next) => {
  try {
    let { groupId, groupType,groupName, choices, content } = req.body;

    choices = choices.map((choice) => {
      return {
        numberOfVotes: 0,
        choiceContent: choice,
      };
    });

    const newPoll = new Poll({
      owner: req.userId,
      groupId: groupId,
      choices: choices,
      content: content,
      groupType: groupType,
      groupName : groupName
    });

    const resul = await newPoll.save();

    const result = await Poll.findById(resul._id)
      .populate("owner", "name imageUrl myAsk email")
      .exec();

    return res.status(201).json({
      poll: result,
    });
  } catch (err) {
    return next(err);
  }
};

exports.postVotePoll = async (req, res, next) => {
  try {
    const { pollId, choiceId } = req.body;

    const poll = await Poll.findById(pollId);

    const voters = [...poll.voters];
    const choices = [...poll.choices];
    console.log(choices);
    const voterIndex = checkIfUserAlreadyVotedPoll(voters, req.userId);
    console.log("index is : ", voterIndex);

    if (voterIndex > -1) {
      const oldChoiceIndex = choices.findIndex((choice) => {
        return choice._id.toString() == voters[voterIndex].choiceId.toString();
      });

      console.log("old choice index : ", oldChoiceIndex);

      choices[oldChoiceIndex].numberOfVotes -= 1;

      voters[voterIndex].choiceId = choiceId;

      const newChoiceIndex = choices.findIndex((choice) => {
        return choice._id.toString() == choiceId.toString();
      });

      choices[newChoiceIndex].numberOfVotes += 1;

      poll.choices = [...choices];
      poll.voters = [...voters];
    } else {
      const choiceIndex = poll.choices.findIndex((choice) => {
        return choice._id.toString() == choiceId.toString();
      });

      poll.choices[choiceIndex].numberOfVotes += 1;
      poll.voters = [
        ...poll.voters,
        {
          voterId: req.userId,
          choiceId: choiceId,
        },
      ];
    }

    const result = await poll.save();

    const updatedPoll = await Poll.findById(result._id)
      .populate("voters.voterId", "name imageUrl myAsk email")
      .exec();

    res.status(201).json({
      choices: updatedPoll.choices,
      voters: updatedPoll.voters,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getGroupMessages = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;

    const messages = await GroupMessage.find({ groupId: groupId })
      .sort({ _id: 1 })
      .populate("ownerId", "name imageUrl myAsk email")
      .exec();

    if (!messages) {
      return res.json(404).json({
        message: "Messages not found",
      });
    }

    res.status(200).json({
      messages: messages,
    });
  } catch (err) {
    const error = errorCreator(err.message, 500);
    return next(error);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const groupId = req.body.groupId;
    const ownerId = req.body.ownerId;
    const content = req.body.content;

    const newMessage = new GroupMessage({
      groupId,
      content,
      ownerId,
    });

    const resul = await newMessage.save();

    const message = await GroupMessage.findById(resul._id)
      .populate("ownerId", "name imageUrl myAsk email")
      .exec();

    io.getIO().emit("message", {
      action: "addmessage",
      message: message,
    });

    res.status(201).json({
      message: message,
    });
  } catch (err) {
    console.log(err.message);
    const error = errorCreator(err.message, 500);
    return next(error);
  }
};

const checkExistingUpvoter = (upvoters, upvoterId) => {
  const upvoterIndex = upvoters.findIndex((upvoter) => upvoter == upvoterId);
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

const checkIfUserAlreadyVotedPoll = (voters, userId) => {
  const voterIndex = voters.findIndex((voter) => {
    return voter.voterId == userId;
  });
  return voterIndex;
};


