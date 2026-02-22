import OrderModel, { IOrder } from '../models/order.model';
import { OrderFilter } from '../types/order.types';

export interface IOrderRepository {
    createOrder(orderData: Partial<IOrder>): Promise<IOrder>;
    getOrderById(id: string): Promise<IOrder | null>;
    getOrdersByUserId(userId: string): Promise<IOrder[]>;
    getAllOrders(filter?: OrderFilter): Promise<IOrder[]>;
    updateOrder(id: string, updateData: Partial<IOrder>): Promise<IOrder | null>;
    updateOrderStatus(id: string, status: string): Promise<IOrder | null>;
    deleteOrder(id: string): Promise<boolean>;
    getOrdersByStatus(status: string): Promise<IOrder[]>;
    assignDriver(orderId: string, driverData: any): Promise<IOrder | null>;
    updateLiveLocation(orderId: string, location: { lat: number; lng: number }): Promise<IOrder | null>;
}

export class OrderRepository implements IOrderRepository {
    async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
        const order = new OrderModel(orderData);
        return await order.save();
    }

    async getOrderById(id: string): Promise<IOrder | null> {
        return await OrderModel.findById(id)
            .populate('userId', 'name email')
            .populate('items.productId');
    }

    async getOrdersByUserId(userId: string): Promise<IOrder[]> {
        return await OrderModel.find({ userId })
            .sort({ createdAt: -1 })
            .populate('items.productId');
    }

    async getAllOrders(filter?: OrderFilter): Promise<IOrder[]> {
        const query: any = {};
        
        if (filter?.status) query.status = filter.status;
        if (filter?.userId) query.userId = filter.userId;
        if (filter?.startDate || filter?.endDate) {
            query.createdAt = {};
            if (filter.startDate) query.createdAt.$gte = filter.startDate;
            if (filter.endDate) query.createdAt.$lte = filter.endDate;
        }

        return await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .limit(filter?.limit || 100)
            .skip((filter?.page || 0) * (filter?.limit || 100))
            .populate('userId', 'name email')
            .populate('items.productId');
    }

    async updateOrder(id: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
        return await OrderModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateOrderStatus(id: string, status: string): Promise<IOrder | null> {
        return await OrderModel.findByIdAndUpdate(
            id,
            { 
                status,
                $push: { 
                    tracking: { 
                        status, 
                        timestamp: new Date() 
                    } 
                } 
            },
            { new: true }
        );
    }

    async deleteOrder(id: string): Promise<boolean> {
        const result = await OrderModel.findByIdAndDelete(id);
        return result ? true : false;
    }

    async getOrdersByStatus(status: string): Promise<IOrder[]> {
        return await OrderModel.find({ status })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
    }

    async assignDriver(orderId: string, driverData: any): Promise<IOrder | null> {
        return await OrderModel.findByIdAndUpdate(
            orderId,
            { deliveryPerson: driverData },
            { new: true }
        );
    }

    async updateLiveLocation(orderId: string, location: { lat: number; lng: number }): Promise<IOrder | null> {
        return await OrderModel.findByIdAndUpdate(
            orderId,
            { liveLocation: { ...location, timestamp: new Date() } },
            { new: true }
        );
    }
}
