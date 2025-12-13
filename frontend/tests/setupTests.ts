// test setup: jest-dom + MSW server lifecycle
import '@testing-library/jest-dom';
import { server } from './mockServer';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
