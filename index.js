/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Log every API response to console
const originalFetch = global.fetch;
global.fetch = async function (...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? 'unknown';
  const res = await originalFetch.apply(this, args);
  const clone = res.clone();
  try {
    const text = await clone.text();
    const preview = text.length > 800 ? text.substring(0, 800) + '...' : text;
    console.log('[API Response]', url, 'Status:', res.status, 'Body:', preview);
  } catch (e) {
    console.log('[API Response]', url, 'Status:', res.status, '(body read failed:', e?.message, ')');
  }
  return res;
};

AppRegistry.registerComponent(appName, () => App);
