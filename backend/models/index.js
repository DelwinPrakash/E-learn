import Chat from "./Chat.js";
import Flashcard from "./Flashcard.js";
import FlashcardDeck from "./FlashcardDeck.js";
import Question from "./Question.js";
import QuizDuo from "./QuizDuo.js";
import PlayerQuizData from "./PlayerQuizData.js";
import Reply from "./Reply.js";
import Thread from "./Thread.js";
import Topic from "./Topic.js";
import User from "./User.js";
import UserAuth from "./UserAuth.js";
import UserSession from "./UserSession.js";
import Video from "./Video.js";
import Note from "./Note.js";

// DEFINE ASSOCIATIONS HERE
FlashcardDeck.hasMany(Flashcard, {
  foreignKey: "deck_id"
});

Flashcard.belongsTo(FlashcardDeck, {
  foreignKey: "deck_id"
});

export {
  Chat,
  Flashcard,
  FlashcardDeck,
  Question,
  QuizDuo,
  PlayerQuizData,
  Reply,
  Thread,
  Topic,
  User,
  UserAuth,
  UserSession,
  Video,
  Note
};
