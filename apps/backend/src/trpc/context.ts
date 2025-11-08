import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '../db';

export async function createContext(opts: FetchCreateContextFnOptions) {
  return {
    db,
    req: opts.req,
    resHeaders: opts.resHeaders,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
