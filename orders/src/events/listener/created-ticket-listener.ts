import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Listener,CreatedTicketEvent, Subjects } from '@know_nothing/common';
import { Ticket } from '../../models/ticket';
export class CreatedTicketListener extends Listener<CreatedTicketEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: CreatedTicketEvent['data'], msg: Message) {
        console.log('Event data!', data);
        const {title,price,id} = data;
        const ticket = Ticket.build({
            title,
            price,
            id
        });
        ticket.save();
        msg.ack();
    }
}