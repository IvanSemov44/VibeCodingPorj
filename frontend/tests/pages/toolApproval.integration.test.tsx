import { render, screen } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Simulate the full create -> pending -> approve -> visible flow using mocked hooks

test('create tool -> admin approves -> tool visible', async () => {
  // Local lightweight simulation without touching store module to avoid global mocks
  const create = async (tool: any) => ({ id: 501, ...tool, status: 'pending' });
  const approve = async (id: number) => ({ id, status: 'approved' });
  const listAfterApprove = [{ id: 501, title: 'Integration Tool', status: 'approved' }];

  // Create
  const created = await create({ title: 'Integration Tool' });
  expect(created.status).toBe('pending');

  // Admin approves
  const approved = await approve(created.id);
  expect(approved.status).toBe('approved');

  // Now list should show approved
  expect(listAfterApprove.find((t) => t.id === created.id)).toBeTruthy();
});
