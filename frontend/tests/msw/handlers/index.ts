// Combine all MSW handlers

import { authHandlers } from './auth';
import { toolsHandlers } from './tools';
import { categoriesHandlers } from './categories';
import { tagsHandlers } from './tags';
import { usersHandlers } from './users';
import { adminHandlers } from './admin';

export const handlers = [
  ...authHandlers,
  ...toolsHandlers,
  ...categoriesHandlers,
  ...tagsHandlers,
  ...usersHandlers,
  ...adminHandlers,
];

// Re-export individual handler groups for selective use
export { authHandlers, toolsHandlers, categoriesHandlers, tagsHandlers, usersHandlers, adminHandlers };

// Export reset functions
export { resetTools } from './tools';
export { resetCategories } from './categories';
export { resetTags } from './tags';
export { resetUsers } from './users';
