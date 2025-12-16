import React from 'react';
import TagMultiSelect from '../TagMultiSelect';

export default {
  title: 'Components/TagMultiSelect',
  component: TagMultiSelect,
};

export const Default = () => <TagMultiSelect value={[]} onChange={() => {}} />;

export const Compound = () => (
  <TagMultiSelect value={['alpha']} onChange={() => {}}>
    <TagMultiSelect.Input />
    <TagMultiSelect.Dropdown />
  </TagMultiSelect>
);

export const RenderPropCustomization = () => (
  <TagMultiSelect value={['custom']} onChange={() => {}}>
    <TagMultiSelect.Input>
      {(tag: string, idx: number, remove: (t: string) => void) => (
        <div key={tag} style={{ padding: 6, borderRadius: 6, background: '#eef' }}>
          <span style={{ marginRight: 8 }}>{tag.toUpperCase()}</span>
          <button onClick={() => remove(tag)}>✕</button>
        </div>
      )}
    </TagMultiSelect.Input>
    <TagMultiSelect.Dropdown>
      {(option: string, idx: number, active: boolean, select: () => void) => (
        <div
          onClick={select}
          style={{ padding: 8, background: active ? '#def' : 'transparent', cursor: 'pointer' }}
        >
          {option} {active ? '←' : ''}
        </div>
      )}
    </TagMultiSelect.Dropdown>
  </TagMultiSelect>
);

export const LargeListVirtualized = () => {
  const largeOptions = Array.from({ length: 300 }).map((_, i) => `option-${i}`);
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <div style={{ width: 400 }}>
      <TagMultiSelect value={value} onChange={setValue} options={largeOptions} />
    </div>
  );
};

// Audit-safe variant: avoid using hooks in the story function to keep
// server-side rendering / static audits simple and deterministic.
export const LargeListVirtualizedAudit = () => {
  const largeOptions = Array.from({ length: 300 }).map((_, i) => `option-${i}`);
  return (
    <div style={{ width: 400 }}>
      <TagMultiSelect value={[]} onChange={() => {}} options={largeOptions} />
    </div>
  );
};
