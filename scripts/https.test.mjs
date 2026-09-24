import assert from 'node:assert/strict';
import {httpsRedirectUrl, effectiveProtocol} from '../lib/https-policy.ts';

assert.equal(httpsRedirectUrl('heritage.example', '/login', '?next=home', null, 'http:'), 'https://heritage.example/login?next=home');
assert.equal(httpsRedirectUrl('heritage.example', '/', '', 'https', 'http:'), null);
for (const host of ['localhost:5173', '127.0.0.1:5173', '[::1]:5173', '192.168.1.10:5173']) {
  assert.equal(httpsRedirectUrl(host, '/', '', null, 'http:'), null);
}
assert.equal(effectiveProtocol(null, 'https:'), 'https');
console.log('HTTPS redirects preserve paths and queries, respect TLS termination, and keep local previews working.');
