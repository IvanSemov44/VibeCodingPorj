import React, { useEffect } from 'react';
import ToolForm from '../../components/ToolForm';
import {
  useGetCsrfMutation,
  useGetCategoriesQuery,
  useGetRolesQuery,
  useGetTagsQuery,
} from '../../store/api';
import { Category, Tag, Role } from '../../lib/types';

export default function NewToolPage(): React.ReactElement {
  const [csrfTrigger] = useGetCsrfMutation();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: roles = [] } = useGetRolesQuery();
  const { data: tags = [] } = useGetTagsQuery();

  useEffect(() => {
    // ensure CSRF is initialized for forms
    (async () => {
      try {
        await csrfTrigger().unwrap();
      } catch {
        // ignore
      }
    })();
  }, [csrfTrigger]);

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <h1 className="mb-4">Add New AI Tool</h1>
      <ToolForm
        categories={categories}
        roles={roles}
        allTags={Array.isArray(tags) ? tags.map((t) => t.name) : []}
        onSaved={() => (window.location.href = '/tools')}
      />
    </div>
  );
}
