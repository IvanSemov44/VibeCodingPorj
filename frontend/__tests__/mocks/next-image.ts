import React from 'react';

// Simple mock for next/image used in tests — renders standard <img>
export default function NextImage(props: any) {
  // keep required props like src and alt
  const { src, alt, width, height, ...rest } = props || {};
  return React.createElement('img', { src: String(src), alt: alt || '', width, height, ...rest });
}
