import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with all handlers
export const server = setupServer(...handlers);

// Export server for test usage
export * from 'msw';
