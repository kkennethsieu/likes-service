import request from "supertest";
import app from "../../src/app.js";
import db from "../../src/db/db.js";

// Helper function to create a review in DB
function createTestLikeReaction() {
  const info = db
    .prepare(
      `
      INSERT INTO reviewLikes (userId, reviewId, isLike)
      VALUES (?, ?, ?)
    `
    )
    .run(1, 1, 1);

  // Get the inserted row
  const reaction = db
    .prepare("SELECT * FROM reviewLikes WHERE likeId = ?")
    .get(info.lastInsertRowid);

  return reaction;
}

function createTestDislikeReaction() {
  const info = db
    .prepare(
      `
      INSERT INTO reviewLikes (userId, reviewId, isLike)
      VALUES (?, ?, ?)
    `
    )
    .run(2, 1, 0);

  // Get the inserted row
  const reaction = db
    .prepare("SELECT * FROM reviewLikes WHERE likeId = ?")
    .get(info.lastInsertRowid);

  return reaction;
}

beforeEach(() => {
  // Reset table before each test
  db.prepare("DELETE FROM reviewLikes").run();
});

afterAll(() => {
  db.close(); // close DB after all tests
});

// get total likes for a review
describe("GET /likes/review/:reviewId", () => {
  it("should return all the likes for a given reviewId", async () => {
    const like = createTestLikeReaction();
    const dislike = createTestDislikeReaction();
    const reviewId = like.reviewId;
    const res = await request(app).get(`/likes/review/${reviewId}`);

    expect(res.status).toBe(200);
    expect(res.body.likes).toBe(1);
    expect(res.body.dislikes).toBe(1);
  });
});

// liking a review
describe("POST /likes/:userId/:reviewId/:authorId", () => {
  it("should like a review", async () => {
    const res = await request(app).post(`/likes/like/1/1/1`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Successfully liked review");
  });

  it("should unlike if already liked", async () => {
    const like = createTestLikeReaction();
    const res = await request(app).post(
      `/likes/like/${like.userId}/${like.reviewId}/1`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Removed like");
  });

  it("should switch dislike -> like", async () => {
    const dislike = createTestDislikeReaction();
    const res = await request(app).post(
      `/likes/like/${dislike.userId}/${dislike.reviewId}/1`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Switched dislike → like");
  });
});

// disliking a review
describe("POST /dislikes/:userId/:reviewId/:authorId", () => {
  it("should dislike a review", async () => {
    const res = await request(app).post(`/likes/dislike/1/1/1`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Successfully disliked review");
  });

  it("should undislike if already disliked", async () => {
    const dislike = createTestDislikeReaction();
    const res = await request(app).post(
      `/likes/dislike/${dislike.userId}/${dislike.reviewId}/1`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Removed dislike");
  });

  it("should switch like -> dislike", async () => {
    const like = createTestLikeReaction();
    const res = await request(app).post(
      `/likes/dislike/${like.userId}/${like.reviewId}/1`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Switched like → dislike");
  });
});
