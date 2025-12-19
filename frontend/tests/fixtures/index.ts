// Barrel export for all test fixtures

// Users
export * from './users';

// Categories
export * from './categories';

// Tags
export * from './tags';

// Tools
export * from './tools';

// Re-export common combinations
export {
  mockUser,
  mockUser2,
  mockUser3,
  mockAdminUser,
  mockModeratorUser,
  mockUsers,
} from './users';

export {
  mockCategory1,
  mockCategory2,
  mockCategory3,
  mockCategories,
  mockCategoryStats,
} from './categories';

export { mockTag1, mockTag2, mockTag3, mockTag4, mockTags, mockTagStats } from './tags';

export {
  mockTool1,
  mockTool2,
  mockTool3,
  mockToolPending,
  mockToolRejected,
  mockTools,
  mockApprovedTools,
  mockPendingTools,
  mockToolCreatePayload,
  mockToolUpdatePayload,
} from './tools';
