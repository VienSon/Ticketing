import { ExpirationCompleteEvent, Publisher, Subjects } from "@know_nothing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
   subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}