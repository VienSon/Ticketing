import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
   return await request(app)
      .post("/api/users/signup")
      .send({
         email: "n5k6b@example.com",
         password: "password",
      })
      .expect(201);
})


it("returns a 400 with an invalid email", async () => {
   return await request(app)
      .post("/api/users/signup")
      .send({
         email: "invalidemail",
         password: "password",
      })
      .expect(400);
})


it("returns a 400 with an invalid password", async () => {
   return await request(app)
      .post("/api/users/signup")
      .send({
         email: "n5k6b@example.com",
         password: "p",
      })
      .expect(400);
})


it("returns a 400 with missing email and password", async () => {
   return await request(app)
      .post("/api/users/signup")
      .send({
         email: "n5k6b@example.com",
      })
      .expect(400);
})

it("disallows duplicate emails", async () => {
   await global.signin();
   await request(app)
      .post("/api/users/signup")
      .send({
         email: "n5k6b@example.com",
         password: "password",
      })
      .expect(400);
})


it("sets a cookie after successful signup", async () => {
   const response = await request(app)
      .post("/api/users/signup")
      .send({
         email: "n5k6b@example.com",
         password: "password",
      })
      .expect(201);
   expect(response.get("Set-Cookie")).toBeDefined();
})

