import 'process/browser'; // This will import the browser-specific polyfill for process
import 'zone.js';  // Default Angular polyfill

(window as any).process = require('process/browser');