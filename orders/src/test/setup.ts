import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../app";
import mongoose from "mongoose";
import Request from "supertest";
import jwt from "jsonwebtoken";
import { Ticket, TicketDoc } from "../models/ticket";
import { Order, OrderDoc } from "../models/order";
import { OrderStatus } from "@know_nothing/common";
declare global {
  function signin(): string[];
}
jest.mock("../nats-wrapper");

global.signin = (): string[] => {
  // build a JWT payload. { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "n5k6b@example.com",
  };

  // create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  const cookie = [`session=${base64}`];

  return cookie;
};

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri);
});
beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
