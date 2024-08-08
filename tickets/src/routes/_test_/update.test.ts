import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";    
import { natsWrapper } from "../../nats-wrapper";

it('return 404 if provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie',global.signin())
    .send({
        title: 'test',
        price: 10
    })
    .expect(404)
})
it('return 401 if user is not authenticated', async () => {
    const ticket = await request(app).post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title: 'test',
        price: 10
    })
    await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .send({
        title: 'test',
        price: 10
    })
    .expect(401)
})
it('return 401 if user does not own the ticket', async () => {
    const ticket = await request(app).post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title: 'test',
        price: 10
    })
    const cookie = global.signin();
    await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'test',
        price: 10
    })
    .expect(401)
})
it('return 400 if provided title or price are invalid', async () => {
    const cookie = global.signin();
    const ticket = await request(app).post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title: 'test',
        price: 10
    })
    await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: '',
        price: 10
    })
    .expect(400)
    await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'test',
        price: -10
    })
    .expect(400)
})
it('update the ticket providing valid inputs', async () => {
    const cookie = global.signin();
    const ticket = await request(app).post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title: 'test',
        price: 10
    }).expect(201);
    await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'test',
        price: 20
    })
    .expect(200)
    const response = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send()
    .expect(200)
    expect(response.body.title).toEqual('test')
    expect(response.body.price).toEqual(20)
})

it('publishes an event', async () => {
    const cookie = global.signin();
    const ticket = await request(app).post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title: 'test',
        price: 10
    }).expect(201);
    await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'test',
        price: 20
    })
    .expect(200)
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})