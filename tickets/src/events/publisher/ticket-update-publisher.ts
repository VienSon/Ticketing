import { Publisher,Subjects, UpdatedTicketEvent } from "@know_nothing/common";


export class TicketUpdatedPublisher extends Publisher<UpdatedTicketEvent>{
    subject:Subjects.TicketUpdated = Subjects.TicketUpdated;
}