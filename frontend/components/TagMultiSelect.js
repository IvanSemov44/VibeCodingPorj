import { useState, useEffect, useRef } from 'react';
import { getTags } from '../lib/api';

export default function TagMultiSelect({ value = [], onChange, allowCreate = true, placeholder = 'Add tags...', options: externalOptions = null }) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const listId = 'tag-suggestions';

  useEffect(() => {
    // If parent provided options, use them (centralized fetching).
    if (externalOptions && Array.isArray(externalOptions)) {
      const names = externalOptions.map(o => (typeof o === 'string' ? o : (o.name || ''))).filter(Boolean);
      setOptions(names);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await getTags();
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          // data may be paginated or raw array
          const list = Array.isArray(data) ? data : (data.data || []);
          setOptions(list.map(t => t.name));
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [externalOptions]);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const filtered = () => {
    const q = input.trim().toLowerCase();
    if (q === '') return options.filter(o => !value.includes(o)).slice(0, 10);
    return options.filter(o => o.toLowerCase().includes(q) && !value.includes(o)).slice(0, 10);
  };

  const addTag = (tag) => {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) { setInput(''); setOpen(false); setActiveIndex(-1); return; }
    onChange([...value, t]);
    setInput('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const removeTag = (tag) => {
    onChange(value.filter(v => v !== tag));
  };

  const handleKey = (e) => {
    const list = filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(prev => Math.min(prev + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && activeIndex >= 0 && activeIndex < list.length) {
        addTag(list[activeIndex]);
      } else {
        const tok = input.replace(/,$/, '');
        if (tok) addTag(tok);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === ',' ) {
      e.preventDefault();
      const tok = input.replace(/,$/, '');
      if (tok) addTag(tok);
    } else if (e.key === 'Backspace' && input === '') {
      // remove last
      if (value.length > 0) removeTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    // keep activeIndex within bounds when filtered changes
    const list = filtered();
    if (list.length === 0) setActiveIndex(-1);
    else if (activeIndex >= list.length) setActiveIndex(list.length - 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options, value]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        aria-haspopup="listbox"
      >
        {value.map(tag => (
          <div key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#f3f4f6', borderRadius: 20 }}>
            <span style={{ fontSize: 13 }}>{tag}</span>
            <button type="button" aria-label={`Remove ${tag}`} onClick={(e) => { e.stopPropagation(); removeTag(tag); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        ))}

        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          role="combobox"
          style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none' }}
        />
      </div>

      {open && (filtered().length > 0 || (allowCreate && input.trim() !== '')) && (
        <div role="listbox" id={listId} style={{ position: 'absolute', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, marginTop: 6, zIndex: 40, maxHeight: 220, overflow: 'auto' }}>
          {filtered().map((s, idx) => (
            <div
              key={s}
              id={`${listId}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => { e.preventDefault(); /* prevent blur before click */ }}
              onClick={() => addTag(s)}
              style={{ padding: '8px 12px', cursor: 'pointer', background: activeIndex === idx ? '#eef2ff' : 'transparent' }}
            >
              {s}
            </div>
          ))}
          {allowCreate && input.trim() !== '' && !options.map(o => o.toLowerCase()).includes(input.trim().toLowerCase()) && (
            <div
              role="option"
              aria-selected={activeIndex === filtered().length}
              onMouseEnter={() => setActiveIndex(filtered().length)}
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={() => addTag(input.trim())}
              style={{ padding: '8px 12px', cursor: 'pointer', borderTop: '1px dashed #e5e7eb', background: activeIndex === filtered().length ? '#eef2ff' : 'transparent' }}
            >
              Create "{input.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
