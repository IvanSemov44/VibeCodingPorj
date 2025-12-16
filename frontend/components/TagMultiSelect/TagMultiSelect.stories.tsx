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
      {(tag, idx, remove) => (
        <div key={tag} style={{ padding: 6, borderRadius: 6, background: '#eef' }}>
          <span style={{ marginRight: 8 }}>{tag.toUpperCase()}</span>
          <button onClick={() => remove(tag)}>✕</button>
        </div>
      )}
    </TagMultiSelect.Input>
    <TagMultiSelect.Dropdown>
      {(option, idx, active, select) => (
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

