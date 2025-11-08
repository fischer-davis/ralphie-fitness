import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const healthRouter = router({
  check: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
      return {
        message: input.message,
        timestamp: new Date().toISOString(),
      };
    }),
});
