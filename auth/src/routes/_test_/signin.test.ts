import request from "supertest";
import { app } from "../../app";

it("fails when an email that does not exist is supplied", async () => {
   await global.signin();
   return await request(app)
      .post("/api/users/signin")
      .send({
         email: "n5k6b323@example.com",
         password: "password",
      })
      .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
   await global.signin();
   return await request(app)
      .post("/api/users/signin")
      .send({
         email:  "n5k6b@example.com",
         password: "password1",
      })
      .expect(400);
});

it("responds with a cookie when given valid credentials", async () => {
   const cookie=await global.signin();
   expect(cookie).toBeDefined();
})

