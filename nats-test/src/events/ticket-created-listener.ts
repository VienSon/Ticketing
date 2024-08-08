import nats from "node-nats-streaming";
import { Listener,Subjects,TicketCreatedEvent } from "@know_nothing/common";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName= "payment-service";
    onMessage(data:TicketCreatedEvent["data"] , msg: nats.Message) {
        console.log(data);
        msg.ack();
    }
}