import { Request, Response } from 'express';
import { UserActivityModel } from '../../models/user-activity.model';
import { successResponse, errorResponse } from '../../utils/response';

export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, userId, activityType } = req.query;
    const query: any = {};

    if (userId) query.userId = userId;
    if (activityType) query.activityType = activityType;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      UserActivityModel.find(query)
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      UserActivityModel.countDocuments(query)
    ]);

    return successResponse(res, {
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      UserActivityModel.find({ userId })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      UserActivityModel.countDocuments({ userId })
    ]);

    return successResponse(res, {
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const stats = await UserActivityModel.aggregate([
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalActivities = await UserActivityModel.countDocuments();

    return successResponse(res, {
      stats,
      totalActivities
    });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
