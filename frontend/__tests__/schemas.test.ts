import { ToolCreatePayloadSchema } from '../lib/schemas';

describe('schemas', () => {
  test('ToolCreatePayloadSchema rejects empty name and accepts basic payload', () => {
    const bad = { name: '' };
    const resBad = ToolCreatePayloadSchema.safeParse(bad);
    expect(resBad.success).toBe(false);

    const ok = { name: 'My Tool', categories: [1], tags: ['cli'] };
    const resOk = ToolCreatePayloadSchema.safeParse(ok);
    expect(resOk.success).toBe(true);
    if (resOk.success) {
      expect(resOk.data.name).toBe('My Tool');
    }
  });
});
