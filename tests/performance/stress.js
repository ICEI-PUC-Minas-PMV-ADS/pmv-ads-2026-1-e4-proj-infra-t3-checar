import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m',  target: 100 },
    { duration: '30s', target: 200 },
    { duration: '1m',  target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN    = __ENV.BEARER_TOKEN || 'test-token';

export default function () {
  const res = http.get(`${BASE_URL}/health`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  check(res, { 'not crashed': (r) => r.status < 500 });
}
