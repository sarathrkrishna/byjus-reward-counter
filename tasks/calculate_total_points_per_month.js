const { getTimestamp, delayMs, epocToTimestamp } = require("../utils/utils");
const {
  startDate,
  endDate,
  fetchSize,
  fetchDelay,
  currentAccount,
} = require("../consts/constants");
const network = require("../network/network");
const {
  [currentAccount]: solvedQuestionsIds,
} = require("../question_ids.json");

exports.calculateTotalPoints = async () => {
  const fromStamp = getTimestamp(startDate);
  const toStamp = getTimestamp(endDate);

  let done = 0;
  let pageNo = 1;
  const totalPostHistory = [];
  const invalidPostHistory = []; // posts with zero points
  const negetivePosts = []; // posts with -ve points
  const otherUserSolvedPosts = [];
  const unResolvedPostAfterMonth = []; // posts that are closed after the boundary time

  while (!done) {
    let postHistory;
    try {
      postHistory = await network.getPostHistory(fetchSize, pageNo);
    } catch (error) {
      console.log(error);
      continue; // redo the fetch with the same pageNo
    }

    const postList = postHistory.posts
      .map((post) => ({
        questionId: post.id,
        description: post.description,
        isClosed: post.status === "CLOSED",
        isCompleted: post.doubt_rewards[0].type === "CompletedDoubtReward",
        points: post.doubt_rewards[0].points,
        createdAt: epocToTimestamp(post.created_at),
        updatedAt: epocToTimestamp(post.updated_at),
      }))
      .filter((post) => {
        if (post.updatedAt >= fromStamp && post.updatedAt < toStamp) {
          return true;
        } else if (post.updatedAt < fromStamp) {
          done = 1; // end process, when updated_at is less than fromStamp
        } else {
          unResolvedPostAfterMonth.push(post);
          return false;
        }
      });
    totalPostHistory.push(...postList);
    pageNo++;
    await delayMs(fetchDelay);
  }

  const userSolvedPosts = totalPostHistory.filter((post) => {
    if (
      solvedQuestionsIds.findIndex((id) => id === post.questionId) !== -1 ||
      solvedQuestionsIds[0] === "ALL"
    ) {
      return true;
    } else {
      otherUserSolvedPosts.push(post);
      return false;
    }
  });

  const validUserSolvedPosts = userSolvedPosts
    .filter((post) => post.isCompleted && post.isClosed)
    .filter((post) => {
      if (post.points > 0) {
        return true;
      } else if (post.points === 0) {
        invalidPostHistory.push(post);
        return false;
      } else if (post.points < 0) {
        negetivePosts.push(post);
      }
    });

  const postivePoints = validUserSolvedPosts.reduce((sum, post) => {
    return sum + post.points;
  }, 0);

  const negativePoints = negetivePosts.reduce(
    (sum, post) => sum + post.points,
    0
  );

  const aggregatePoints = postivePoints + negativePoints;

  // .filter((post) => {
  //   if (post.isCompleted && post.isClosed) {
  //     return true;
  //   } else {
  //     invalidPostHistory.push(post);
  //     return false;
  //   }
  // })
  //   .reduce((sum, post) => {
  //     return sum + post.points;
  //   }, 0);
};
