import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: { http_req_duration: ['p(95)<2000'] },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN    = __ENV.BEARER_TOKEN || '';

export default function () {
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'health ok': (r) => r.status === 200 });
  sleep(1);
}
