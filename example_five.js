/* 
Utilizando a API publica do k6
- Realizar consulta de listagem de crocodilos e também busca por id
Critérios:
- Esperado um RPS de 200 reqs/s para a api de listagem de crocodilos durante 30 segundos
- Para a busca por id, o sistema deve atender 50 usuários onde cada usuário realiza até 20 solicitações em até 1 min.
- Usuários para devem realizar a busca ao crocodilo de ID 2
- Usuário ímpar devem realizar a busca ao crocodilo de ID 1
- Ambos os testes devem ser executados simultaneamente.
*/

import http from "k6/http";

export const options = {
  scenarios: {
    list: {
      executor: "constant-arrival-rate",
      exec: "list",
      duration: "30s",
      rate: 200,
      timeUnit: "1s",
      preAllocatedVUs: 150,
      gracefulStop: "5s",
      tags: { test_type: "listagem_crocodilos" },
    },
    search: {
      executor: "per-vu-iterations",
      exec: "search",
      vus: 50,
      iterations: 20,
      maxDuration: "1m",
      tags: { test_type: "busca_crocodilos" },
      gracefulStop: "5s",
    },
  },
  discardResponseBodies: true,
};

export function list() {
  http.get(`${__ENV.URL}/crocodiles`);
}

export function search() {
  const evenVU = __VU % 2 === 0;

  const url = evenVU
    ? `${__ENV.URL}/crocodiles/2`
    : `${__ENV.URL}/crocodiles/1`;

  http.get(url);
}
