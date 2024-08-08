import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@know_nothing/common';
import mongoose from 'mongoose';

it('returns an error if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/orders/${id}`).send().expect(401);
})

it('returns an error if order is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/orders/${id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(404);
})

it('returns an error if user tries to fetch another users order', async () => {
    const ticket1 = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket1.save();
    const ticket2 = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket2.save();
    const userOne = global.signin();
    const userTwo = global.signin();
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket1.id })
        .expect(201);
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticket2.id })
        .expect(201);
    await request(app)
        .get(`/api/orders/${orderOne.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
})

it('fetches the order', async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    const user = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
    expect(fetchedOrder.id).toEqual(order.id);
})