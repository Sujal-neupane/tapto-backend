import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200,
  metadata?: any
) => {
  const response: any = {
    success: true,
    message,
    data,
  };
  
  if (metadata) {
    Object.assign(response, metadata);
  }
  
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
