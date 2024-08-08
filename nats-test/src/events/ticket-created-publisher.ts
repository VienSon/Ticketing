import { Publisher,Subjects,TicketCreatedEvent } from "@know_nothing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}