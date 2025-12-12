import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteTool } from '../lib/api';
import type { Tool } from '../lib/types';
import { cx } from '../lib/classNames';
import styles from './ToolEntry.module.css';

interface Props {
  tool: Tool;
  onDeleted?: (id: string | number) => void;
}

export default function ToolEntry({ tool, onDeleted }: Props): React.ReactElement {
  // router not used here

  const handleDelete = async () => {
    if (!confirm('Delete this tool?')) return;
    try {
      await deleteTool(tool.id);
      if (onDeleted) onDeleted(tool.id);
    } catch (err) {
       
      console.error(err);
       
      alert('Failed to delete');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.left}>
          {tool.screenshots && tool.screenshots[0] ? (
            // next/image accepts className for styling
            <Image src={tool.screenshots[0]} alt="thumb" width={96} height={64} className={styles.thumb} />
          ) : null}
          <div className={styles.meta}>
            <div className={styles.title}>
              <Link href={`/tools/${tool.id}`}>{tool.name ?? `Tool ${tool.id}`}</Link>
            </div>
            <div className={styles.desc}>{tool.description ?? ''}</div>
          </div>
        </div>
        <div className={styles.actions}>
          {tool.url ? (
            <a className={styles.visitLink} href={tool.url} target="_blank" rel="noreferrer">Visit</a>
          ) : (
            <span style={{ color: 'var(--text-tertiary)' }}>Visit</span>
          )}
          <Link href={`/tools/${tool.id}/edit`}><button className={styles.button}>Edit</button></Link>
          <button onClick={handleDelete} className={cx(styles.button, styles.delete)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
