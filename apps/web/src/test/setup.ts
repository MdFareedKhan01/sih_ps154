// Runs before every web test file.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom has no layout engine, so it lacks scrollIntoView. SourcePane calls it on every selection.
Element.prototype.scrollIntoView = () => {};
