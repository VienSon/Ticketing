import { Listener, OrderCreatedEvent, Subjects } from "@know_nothing/common";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-update-publisher";
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        console.log('Event data!', data);
        //update ticket with order id
        // const {ticket, id, version} = data;
        const ticketUpdated = await Ticket.findById(data.ticket.id);
        if(!ticketUpdated){
            throw new Error('Ticket not found');
        }
        // console.log("data id>>>",data.id)
        ticketUpdated.set({orderId: data.id});
        await ticketUpdated.save();
        console.log("ticket updated>>>",ticketUpdated.orderId)
        //publish ticket updated event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticketUpdated.id,
            title: ticketUpdated.title,
            price: ticketUpdated.price,
            userId: ticketUpdated.userId,
            orderId: ticketUpdated.orderId,
            version: ticketUpdated.version
        })
        //ack the message
        msg.ack();
    }
}