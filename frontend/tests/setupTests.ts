// test setup: jest-dom + MSW server lifecycle
import '@testing-library/jest-dom';
import { server } from './mockServer';

// Provide a global React variable for tests that expect the classic JSX runtime
import * as React from 'react';
(globalThis as unknown as { React?: typeof React }).React = React;

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
