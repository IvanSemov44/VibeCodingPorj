export const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-blue-100 text-blue-800',
  deleted: 'bg-red-100 text-red-800',
  approved: 'bg-purple-100 text-purple-800',
  rejected: 'bg-orange-100 text-orange-800',
  login: 'bg-cyan-100 text-cyan-800',
  logout: 'bg-gray-100 text-gray-800',
};

export const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
];

export const SUBJECT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'Tool', label: 'Tool' },
  { value: 'User', label: 'User' },
  { value: 'Category', label: 'Category' },
  { value: 'Tag', label: 'Tag' },
];

export const CSV_HEADERS = ['ID', 'Date', 'User', 'Action', 'Subject Type', 'Subject ID', 'Details'];
export const PER_PAGE = 20;
export const CHUNK_SIZE = 1000;
