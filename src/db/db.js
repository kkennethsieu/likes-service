import Database from "better-sqlite3";

let db;
try {
  if (process.env.NODE_ENV === "test") {
    db = new Database(":memory:"); // in-memory DB for tests
  } else {
    db = new Database("./src/db/likes.db");
  }
  // Likes/Dislikes table
  db.prepare(
    `
          CREATE TABLE IF NOT EXISTS reviewLikes (
            likeId INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            reviewId INTEGER NOT NULL,
            isLike BOOLEAN NOT NULL, -- true = like, false = dislike
            createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            UNIQUE(userId, reviewId)
          )
        `
  ).run();

  // To reset the table during development
  // db.exec("DROP TABLE IF EXISTS reviewLikes");
} catch (error) {
  console.log("Error creating likes table:", error);
}

export default db;
