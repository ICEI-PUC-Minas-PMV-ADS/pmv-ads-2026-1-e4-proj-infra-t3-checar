# Testes de Performance — CHECAR

## Pré-requisitos
npm install -g k6  (ou usar Docker: docker run --rm -i grafana/k6)

## Execução
export BEARER_TOKEN="seu-token-firebase"
export BASE_URL="https://checarapp.azurewebsites.net"

# Smoke (validação básica)
k6 run tests/performance/smoke.js

# Load (carga normal — meta P95 < 2s)
k6 run tests/performance/load.js

# Stress (ponto de ruptura)
k6 run tests/performance/stress.js

## Targets
- P95 < 2000ms (RNF-003)
- Taxa de erros < 1%
- 200 VUs simultâneos sem crash
