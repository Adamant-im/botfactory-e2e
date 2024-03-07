import {NextFunction, Request, Response} from 'express';

export const requireProperties = (properties: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const {query, node} = req;

    for (const property of properties) {
      if (!Object.prototype.hasOwnProperty.call(query, property)) {
        return res.json({
          success: false,
          nodeTimestamp: node.timestamp,
          error: `Missing required property: ${property}`,
        });
      }
    }

    next();
  };
};
