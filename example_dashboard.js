import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "60s",
  thresholds: {
    checks: ["rate > 0.99"],
  },
};

export default function () {
  const BASE_URL = "https://test-api.k6.io/public/crocodiles/";

  const response = http.get(BASE_URL);

  check(response, {
    "status code 200": (r) => r.status === 200,
  });

  sleep(1);
}
