import React from 'react';
// Make React available globally for tests that use JSX without explicit imports
// (some tests rely on the JSX runtime or classic runtime; this ensures `React` is defined)
((globalThis as unknown) as { React?: typeof React }).React = React;
