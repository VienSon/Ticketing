import { MongoMemoryServer } from "mongodb-memory-server";
import {app} from "../app";
import mongoose from "mongoose";
import Request from "supertest";

declare global {
   function signin():  Promise<string[]>
}
global.signin = async (): Promise<string[]> => {
   const email = "n5k6b@example.com";
   const password = "password";
   const response = await Request(app)
      .post("/api/users/signup")
      .send({
         email,
         password
      })
      .expect(201);
   const cookie = response.get("Set-Cookie");
   if (!cookie) {
      throw new Error("No cookie returned from signup");
   }
   return cookie;
}

let mongo:any;
beforeAll(async () => {
   process.env.JWT_KEY = "asdfasdf";
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
   mongo = await MongoMemoryServer.create();
   const mongoUri =await mongo.getUri();
   await mongoose.connect(mongoUri);
});
beforeEach(async () => {
   const collections = await mongoose.connection.db.collections();
   for (let collection of collections) {
      await collection.deleteMany({});
   }
})
afterAll(async () => {
   await mongo.stop();
   await mongoose.connection.close();
})


