import {Message} from 'node-nats-streaming';
import {Listener, OrderCancelledEvent, Subjects} from "@know_nothing/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publisher/ticket-update-publisher";
import {natsWrapper} from "../../nats-wrapper";



export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket){
            throw new Error('Ticket not found');
        }
        ticket.set({orderId: undefined});
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        })
        msg.ack();
    }
}