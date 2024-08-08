import { Listener ,UpdatedTicketEvent,Subjects, NotFoundError} from "@know_nothing/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
export class UpdatedTicketListener extends Listener<UpdatedTicketEvent>{
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: UpdatedTicketEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if(!ticket){
            throw new NotFoundError();
        }
        const {title,price} = data;
        ticket.set({title,price});
        
        await ticket.save();
        msg.ack();
    }
}