import { z } from 'zod';

export const ID = z.number().int().positive();

export const RoleSchema = z.object({ id: ID, name: z.string() }).optional();

export const TagSchema = z.object({ id: ID, name: z.string(), slug: z.string().optional().nullable() });

export const CategorySchema = z.object({ id: ID, name: z.string(), slug: z.string().optional().nullable() });

export const ToolCreatePayloadSchema = z.object({
  name: z.string().min(1, 'Tool name is required').max(255),
  url: z.string().url().max(500).optional().nullable(),
  docs_url: z.string().url().max(500).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  usage: z.string().max(5000).optional().nullable(),
  examples: z.string().max(5000).optional().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional().or(z.string()).optional(),
  categories: z.array(ID).optional(),
  roles: z.array(ID).optional(),
  tags: z.array(z.string().max(50)).optional(),
  screenshots: z.array(z.string().url()).optional(),
});

export type ToolCreatePayloadType = z.infer<typeof ToolCreatePayloadSchema>;

// simple schema for tool (partial, used lightly in UI)
export const ToolSchema = z.object({
  id: ID,
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  screenshots: z.array(z.string()).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;
