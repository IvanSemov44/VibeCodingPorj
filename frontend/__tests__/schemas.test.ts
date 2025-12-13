import { ToolCreatePayloadSchema, ToolSchema } from '../lib/schemas';

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

  test('ToolSchema accepts minimal tool and rejects invalid id', () => {
    const ok = { id: 3, name: 'T' };
    const parsed = ToolSchema.safeParse(ok);
    expect(parsed.success).toBe(true);

    const bad = { id: -1 };
    const parsedBad = ToolSchema.safeParse(bad);
    expect(parsedBad.success).toBe(false);
  });
});
