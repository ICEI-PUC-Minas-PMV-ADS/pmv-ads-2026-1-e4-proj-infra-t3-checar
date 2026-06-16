import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m',  target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN    = __ENV.BEARER_TOKEN || 'test-token';

const ENDPOINTS = [
  '/vehicles?page=1&limit=20',
  '/modelochecklists?ativo=true',
  '/checklists/historico?page=1&limit=20',
  '/inspecoes?page=1&limit=20',
];

export default function () {
  const url = BASE_URL + ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const res = http.get(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const ok = check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'duration < 2s': (r) => r.timings.duration < 2000,
  });
  errorRate.add(!ok);
  sleep(0.5);
}
