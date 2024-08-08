import express, { Request, Response } from "express";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it('returns a 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404);
})

it('return the ticket', async () => {
    const title="test";
    const price=10;
    const response = await request(app).post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title,
        price
    }).expect(201);
    const id = response.body.id;
    const ticketResponse = await request(app).get(`/api/tickets/${id}`).send().expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
})