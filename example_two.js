/* 
Utilizando a API publica do k6
- Busca crocodilo por id
Critérios:
- Performance test
  - Ramp up 10 VU em 10s
  - Carga 10 VU por 10s
  - Ramp down 0 VU em 10s

- Limites
  - Requisições com sucesso > 95%
  - Tempo requisição p(95) < 200
*/

import http from "k6/http";
import { sleep, check } from "k6";
import { SharedArray } from "k6/data";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "10s", target: 10 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    checks: ["rate > 0.95"],
    http_req_duration: ["p(95) < 220"],
  },
};

const data = new SharedArray("ler dados", function () {
  return JSON.parse(open("./data.json")).crocodiles;
});

export default function () {
  const crocodileId = data[Math.floor(Math.random() * data.length)].id;
  const BASE_URL = `https://test-api.k6.io/public/crocodiles/${crocodileId}`;
  const res = http.get(BASE_URL);

  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(1);
}
