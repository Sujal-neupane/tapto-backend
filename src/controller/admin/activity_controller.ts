import { Request, Response } from 'express';
import { UserActivityService } from '../../services/user-activity.service';

const userActivityService = new UserActivityService();

// User Activity Management
export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, userId, action, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const result = await userActivityService.getAllActivities(
      pageNum,
      limitNum,
      userId as string,
      action as string,
      start,
      end
    );

    const totalPages = Math.ceil(result.total / limitNum);

    res.json({
      success: true,
      data: result.activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message,
    });
  }
};

export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await userActivityService.getUserActivities(userId, pageNum, limitNum);

    const totalPages = Math.ceil(result.total / limitNum);

    res.json({
      success: true,
      data: result.activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error.message,
    });
  }
};

export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const stats = await userActivityService.getActivityStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity stats',
      error: error.message,
    });
  }
};