import {Request,Response,Router} from 'express';
import {NotAuthorizedError, NotFoundError, OrderStatus, requireAuth} from '@know_nothing/common';

import { Order } from '../models/order';
import { CancelledOrderPublisher } from '../events/publisher/cancelled-order-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = Router();

router.delete('/api/orders/:id',requireAuth,async(req:Request,res:Response)=>{
    const order = await Order.findById(req.params.id).populate('ticket');
    if(!order){
        throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishing an event saying this was cancelled
    
    new CancelledOrderPublisher(natsWrapper.client).publish({
        id:order.id,
        // version:order.version,
        ticket:{
            id:order.ticket.id
        },
        version:order.version
    })
    res.status(204).send({});
});

export {router as deleteOrderRouter}