import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  useGetToolQuery,
  useGetCategoriesQuery,
  useGetRolesQuery,
  useGetCsrfMutation,
  useGetTagsQuery,
} from '../../../store/domains';
import ToolForm from '../../../components/ToolForm';
import { Tool } from '../../../lib/types';

export default function EditToolPage(): React.ReactElement | null {
  const router = useRouter();
  const { id } = router.query;
  const [tool, setTool] = useState<Tool | null>(null);
  const [csrfTrigger] = useGetCsrfMutation();
  const { data: toolData } = useGetToolQuery(id as string | number, { enabled: !!id });
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: roles = [] } = useGetRolesQuery();
  const { data: tags = [] } = useGetTagsQuery();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await csrfTrigger().unwrap();
      } catch {
        // ignore
      }
    })();
  }, [id, csrfTrigger]);

  useEffect(() => {
    if (toolData) setTool(toolData as Tool);
  }, [toolData]);

  if (!tool) return <div>Loading...</div>;

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <h1>Edit Tool</h1>
      <ToolForm
        categories={categories}
        roles={roles}
        allTags={tags.map((t) => t.name)}
        tags={Array.isArray(tool.tags) ? tool.tags : []}
        onSaved={() => router.push('/tools')}
        initial={tool}
      />
    </div>
  );
}
