import { ZodTypeAny } from 'zod';

function setPath(obj: Record<string, unknown>, path: Array<PropertyKey>, value: unknown) {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = String(path[i]);
    if (cur[key] == null) cur[key] = {} as Record<string, unknown>;
    cur = cur[key] as Record<string, unknown>;
  }
  cur[String(path[path.length - 1])] = value;
}

export const zodToFormikValidate =
  <T extends ZodTypeAny>(schema: T) =>
  (values: unknown) => {
    const res = schema.safeParse(values);
    if (res.success) return {} as Record<string, unknown>;
    const errors: Record<string, unknown> = {};
    for (const issue of res.error.issues) {
      const path = issue.path.length ? issue.path : ['_'];
      setPath(errors, path, issue.message);
    }
    return errors;
  };
