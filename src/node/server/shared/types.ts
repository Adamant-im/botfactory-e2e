import {Request} from 'express';

export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithBody<T> = Request<{}, {}, T>;
