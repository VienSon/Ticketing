import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({}).expect(401);
  // console.log(response.body);
  expect(response.body.errors[0].message).toEqual("Not authorized");
});

it("return other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("return error if invalid title is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    });

  expect(response.status).toEqual(400);
});

it("return error if invalid price is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "test",
      price: -10,
    });

  expect(response.status).toEqual(400);
});

it("create a ticket with valid inputs", async () => {
    //add in a check to make sure a ticket was saved 

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
        title: "test",
        price: 10
    }).expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);

    expect(tickets[0].price).toEqual(10);
    expect(tickets[0].title).toEqual("test");
    
});

it('publishes an event', async () => {
    await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
        title: "test",
        price: 10
    }).expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})