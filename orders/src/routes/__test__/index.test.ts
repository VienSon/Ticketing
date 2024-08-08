import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("can only be accessed if the user is signed in", async () => {
    await request(app).get("/api/orders").send({}).expect(401);
})


it("returns a status other than 401 if the user is signed in", async () => {
    const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({});
    expect(response.status).not.toEqual(401);
})

it("returns an empty array if user has no orders", async () => {
    const response = await request(app)
    .get("/api/orders")
    .set("Cookie", global.signin())
    .send({});
    expect(response.body.length).toEqual(0);
})

it("returns orders for a particular user", async () => {
    const cookie = global.signin();
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
        ticketId: ticket.id
    }).expect(201);
   
    const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie)
    .send({});
    // console.log(response.body);
    expect(response.body.length).toEqual(1);
})