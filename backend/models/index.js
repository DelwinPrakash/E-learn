import Chat from "./Chat.js";
import Course from "./Course.js";
import Doubt from "./Doubt.js";
import Flashcard from "./Flashcard.js";
import FlashcardDeck from "./FlashcardDeck.js";
import FlashcardProgress from "./FlashcardProgress.js";
import Question from "./Question.js";
import Quiz from "./Quiz.js";
import QuizDuo from "./QuizDuo.js";
import QuizParticipant from "./QuizParticipant.js";
import QuizQuestion from "./QuizQuestion.js";
import Reply from "./Reply.js";
import Thread from "./Thread.js";
import Topic from "./Topic.js";
import User from "./User.js";
import UserAuth from "./UserAuth.js";
import UserPerformance from "./UserPerformance.js";
import UserSession from "./UserSession.js";
import Video from "./Video.js";

// DEFINE ASSOCIATIONS HERE
FlashcardDeck.hasMany(Flashcard, {
  foreignKey: "deck_id"
});

Flashcard.belongsTo(FlashcardDeck, {
  foreignKey: "deck_id"
});

export {
  Chat,
  Course,
  Doubt,
  Flashcard,
  FlashcardDeck,
  FlashcardProgress,
  Question,
  Quiz,
  QuizDuo,
  QuizParticipant,
  QuizQuestion,
  Reply,
  Thread,
  Topic,
  User,
  UserAuth,
  UserPerformance,
  UserSession,
  Video
};
