import { Hono } from 'hono';
import { auth } from '../auth/config';

const authApp = new Hono();

// Better Auth handles all authentication routes
authApp.all('/*', async (c) => {
  return auth.handler(c.req.raw);
});

export default authApp;
