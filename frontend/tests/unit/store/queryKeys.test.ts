import { describe, it, expect } from 'vitest';
import { QUERY_KEYS, getDomainKeyPrefix } from '@/store/queryKeys';

describe('QUERY_KEYS', () => {
  describe('user domain', () => {
    it('should return correct key for all users', () => {
      expect(QUERY_KEYS.user.all).toEqual(['user']);
    });

    it('should return correct key for user profile', () => {
      expect(QUERY_KEYS.user.profile()).toEqual(['user', 'profile']);
    });

    it('should return correct key for current user (me)', () => {
      expect(QUERY_KEYS.user.me()).toEqual(['user', 'me']);
    });
  });

  describe('tools domain', () => {
    it('should return correct key for all tools', () => {
      expect(QUERY_KEYS.tools.all).toEqual(['tools']);
    });

    it('should return correct key for tools lists', () => {
      expect(QUERY_KEYS.tools.lists()).toEqual(['tools', 'list']);
    });

    it('should return correct key for tools list without filters', () => {
      expect(QUERY_KEYS.tools.list()).toEqual(['tools', 'list', { filters: undefined }]);
    });

    it('should return correct key for tools list with filters', () => {
      const filters = { category: 'ai', status: 'approved' };
      expect(QUERY_KEYS.tools.list(filters)).toEqual(['tools', 'list', { filters }]);
    });

    it('should return correct key for tools details', () => {
      expect(QUERY_KEYS.tools.details()).toEqual(['tools', 'detail']);
    });

    it('should return correct key for tool detail with numeric id', () => {
      expect(QUERY_KEYS.tools.detail(123)).toEqual(['tools', 'detail', 123]);
    });

    it('should return correct key for tool detail with string id', () => {
      expect(QUERY_KEYS.tools.detail('abc-123')).toEqual(['tools', 'detail', 'abc-123']);
    });

    it('should return correct key for tool search', () => {
      expect(QUERY_KEYS.tools.search('react')).toEqual(['tools', 'search', 'react']);
    });
  });

  describe('categories domain', () => {
    it('should return correct key for all categories', () => {
      expect(QUERY_KEYS.categories.all).toEqual(['categories']);
    });

    it('should return correct key for categories list', () => {
      expect(QUERY_KEYS.categories.lists()).toEqual(['categories', 'list']);
    });

    it('should return correct key for categories list with filters', () => {
      const filters = { tools_count: { gt: 5 } };
      expect(QUERY_KEYS.categories.list(filters)).toEqual(['categories', 'list', { filters }]);
    });

    it('should return correct key for category detail', () => {
      expect(QUERY_KEYS.categories.detail(1)).toEqual(['categories', 'detail', 1]);
    });
  });

  describe('tags domain', () => {
    it('should return correct key for all tags', () => {
      expect(QUERY_KEYS.tags.all).toEqual(['tags']);
    });

    it('should return correct key for tags list', () => {
      expect(QUERY_KEYS.tags.lists()).toEqual(['tags', 'list']);
    });

    it('should return correct key for tag detail', () => {
      expect(QUERY_KEYS.tags.detail('ai')).toEqual(['tags', 'detail', 'ai']);
    });
  });

  describe('entries domain', () => {
    it('should return correct key for all entries', () => {
      expect(QUERY_KEYS.entries.all).toEqual(['entries']);
    });

    it('should return correct key for entries list with filters', () => {
      const filters = { mood: 'happy', page: 1 };
      expect(QUERY_KEYS.entries.list(filters)).toEqual(['entries', 'list', { filters }]);
    });

    it('should return correct key for entry detail', () => {
      expect(QUERY_KEYS.entries.detail(42)).toEqual(['entries', 'detail', 42]);
    });
  });

  describe('admin domain', () => {
    it('should return correct key for all admin queries', () => {
      expect(QUERY_KEYS.admin.all).toEqual(['admin']);
    });

    it('should return correct key for admin activities', () => {
      expect(QUERY_KEYS.admin.activities()).toEqual(['admin', 'activities']);
    });

    it('should return correct key for admin activity with filters', () => {
      const filters = { action: 'created', limit: 10 };
      expect(QUERY_KEYS.admin.activity(filters)).toEqual(['admin', 'activities', { filters }]);
    });

    it('should return correct key for admin analytics', () => {
      expect(QUERY_KEYS.admin.analytics()).toEqual(['admin', 'analytics']);
    });

    it('should return correct key for admin stats', () => {
      expect(QUERY_KEYS.admin.stats()).toEqual(['admin', 'stats']);
    });

    it('should return correct key for admin users', () => {
      expect(QUERY_KEYS.admin.users()).toEqual(['admin', 'users']);
    });

    it('should return correct key for admin user detail', () => {
      expect(QUERY_KEYS.admin.user(123)).toEqual(['admin', 'users', 123]);
    });
  });

  describe('auth domain', () => {
    it('should return correct key for all auth queries', () => {
      expect(QUERY_KEYS.auth.all).toEqual(['auth']);
    });

    it('should return correct key for two-factor queries', () => {
      expect(QUERY_KEYS.auth.twoFactor()).toEqual(['auth', '2fa']);
    });

    it('should return correct key for two-factor status', () => {
      expect(QUERY_KEYS.auth.twoFactorStatus()).toEqual(['auth', '2fa', 'status']);
    });
  });

  describe('roles domain', () => {
    it('should return correct key for all roles', () => {
      expect(QUERY_KEYS.roles.all).toEqual(['roles']);
    });

    it('should return correct key for roles list', () => {
      expect(QUERY_KEYS.roles.list()).toEqual(['roles', 'list']);
    });
  });
});

describe('getDomainKeyPrefix', () => {
  it('should return correct prefix for user domain', () => {
    expect(getDomainKeyPrefix('user')).toEqual(['user']);
  });

  it('should return correct prefix for tools domain', () => {
    expect(getDomainKeyPrefix('tools')).toEqual(['tools']);
  });

  it('should return correct prefix for categories domain', () => {
    expect(getDomainKeyPrefix('categories')).toEqual(['categories']);
  });

  it('should return correct prefix for tags domain', () => {
    expect(getDomainKeyPrefix('tags')).toEqual(['tags']);
  });

  it('should return correct prefix for entries domain', () => {
    expect(getDomainKeyPrefix('entries')).toEqual(['entries']);
  });

  it('should return correct prefix for admin domain', () => {
    expect(getDomainKeyPrefix('admin')).toEqual(['admin']);
  });

  it('should return correct prefix for auth domain', () => {
    expect(getDomainKeyPrefix('auth')).toEqual(['auth']);
  });

  it('should return correct prefix for roles domain', () => {
    expect(getDomainKeyPrefix('roles')).toEqual(['roles']);
  });
});

describe('query key composition', () => {
  it('should create unique keys for different tool queries', () => {
    const allTools = QUERY_KEYS.tools.all;
    const toolsList = QUERY_KEYS.tools.lists();
    const toolDetail = QUERY_KEYS.tools.detail(1);
    const toolSearch = QUERY_KEYS.tools.search('test');

    // All should be unique
    expect(allTools).not.toEqual(toolsList);
    expect(toolsList).not.toEqual(toolDetail);
    expect(toolDetail).not.toEqual(toolSearch);
  });

  it('should create different keys for same domain with different filters', () => {
    const list1 = QUERY_KEYS.tools.list({ category: 'ai' });
    const list2 = QUERY_KEYS.tools.list({ category: 'ml' });

    expect(list1).not.toEqual(list2);
  });

  it('should create different keys for different detail IDs', () => {
    const detail1 = QUERY_KEYS.tools.detail(1);
    const detail2 = QUERY_KEYS.tools.detail(2);

    expect(detail1).not.toEqual(detail2);
  });

  it('should maintain referential equality for static keys', () => {
    const key1 = QUERY_KEYS.tools.all;
    const key2 = QUERY_KEYS.tools.all;

    expect(key1).toBe(key2);
  });

  it('should create hierarchical key structure', () => {
    const toolsList = QUERY_KEYS.tools.lists();
    const toolsListWithFilter = QUERY_KEYS.tools.list({ status: 'approved' });

    // toolsListWithFilter should start with toolsList
    expect(toolsListWithFilter[0]).toBe(toolsList[0]);
    expect(toolsListWithFilter[1]).toBe(toolsList[1]);
    expect(toolsListWithFilter.length).toBe(3); // ['tools', 'list', { filters }]
  });
});
