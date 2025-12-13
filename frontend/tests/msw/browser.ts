import { setupWorker } from 'msw';
import { handlers } from '../mockServer';

// Browser worker for Playwright/Cypress or local UI debugging in a browser.
export const worker = setupWorker(...handlers);

export async function startWorker() {
  if (typeof window === 'undefined') return;
  return worker.start({ onUnhandledRequest: 'warn' });
}

export async function stopWorker() {
  return worker.stop();
}

export default worker;
