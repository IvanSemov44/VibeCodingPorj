test('simulated create -> approve flow (integration smoke)', async () => {
  const create = async (tool: any) => ({ id: 99, ...tool });
  const approve = async (id: number) => ({ id, status: 'approved' });

  const created = await create({ title: 'Integration Tool' });
  expect(created.id).toBeDefined();

  const approved = await approve(created.id);
  expect(approved.status).toBe('approved');
});
