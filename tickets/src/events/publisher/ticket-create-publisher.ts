import { Publisher,Subjects, CreatedTicketEvent } from "@know_nothing/common";


export class TicketCreatedPublisher extends Publisher<CreatedTicketEvent>{
    subject:Subjects.TicketCreated = Subjects.TicketCreated;
}