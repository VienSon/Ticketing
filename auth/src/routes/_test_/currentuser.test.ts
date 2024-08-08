import request from "supertest";
import { app } from "../../app";

it("details the current user", async () => {
  const cookie=await global.signin();
  if(!cookie) return expect(cookie).toBeDefined();
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual("n5k6b@example.com");
});

it("returns null if not authenticated", async () => {
  const response=await request(app).get("/api/users/currentuser").send({}).expect(200);
  expect(response.body.currentUser).toEqual(null);
});
