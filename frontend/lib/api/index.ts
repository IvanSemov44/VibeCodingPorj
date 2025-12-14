// Directory entry for lib/api — re-export modular API surface
export * from './fetch';
export * from './auth';
export * from './public';
export * from './journal';
export * from './twofactor';
export * from './tools';
export * from './admin';

// Provide a default export to support imports that expect a module default
const apiDefault = {
  // named exports available individually
};

export default apiDefault;
