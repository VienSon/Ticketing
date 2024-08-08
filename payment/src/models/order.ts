import mongoose from "mongoose";
import {OrderStatus} from "@know_nothing/common";
// import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
interface OrderAttrs {
  id: string;
  status: OrderStatus;
  userId: string;
  price: number;
  version: number;
}

interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(data: {id: string, version: number}): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        default: OrderStatus.Created
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status
    });
};

orderSchema.statics.findByEvent = (data: {id: string, version: number}) => {
    return Order.findOne({
        _id: data.id,
        version: data.version - 1
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order,OrderDoc };