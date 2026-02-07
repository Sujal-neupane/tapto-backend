import { UserActivityModel, IUserActivity } from '../models/user-activity.model';

export class UserActivityService {
  async logActivity(
    userId: string,
    action: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUserActivity> {
    const activity = new UserActivityModel({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
    });

    return await activity.save();
  }

  async getUserActivities(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ activities: IUserActivity[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      UserActivityModel.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email'),
      UserActivityModel.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      activities,
      total,
      totalPages,
    };
  }

  async getAllActivities(
    page: number = 1,
    limit: number = 20,
    userId?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ activities: IUserActivity[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (action) {
      filter.action = action;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    const [activities, total] = await Promise.all([
      UserActivityModel.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email'),
      UserActivityModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      activities,
      total,
      totalPages,
    };
  }

  async getActivityStats(): Promise<{
    totalActivities: number;
    activitiesByAction: { [key: string]: number };
    recentActivities: IUserActivity[];
  }> {
    const [totalActivities, activitiesByAction, recentActivities] = await Promise.all([
      UserActivityModel.countDocuments(),
      UserActivityModel.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      UserActivityModel.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'fullName email')
    ]);

    const actionStats: { [key: string]: number } = {};
    activitiesByAction.forEach((item: any) => {
      actionStats[item._id] = item.count;
    });

    return {
      totalActivities,
      activitiesByAction: actionStats,
      recentActivities,
    };
  }
}