import { browser } from "k6/browser";
import { sleep, check } from "k6";

export const options = {
  scenarios: {
    ui: {
      executor: "constant-vus",
      vus: 5,
      duration: "10s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
  thresholds: {
    checks: ["rate==1.0"],
    browser_web_vital_fid: ["p(75) <= 100"],
    browser_web_vital_lcp: ["p(75) <= 2500"],
  },
  summaryTrendStats: ["min", "med", "avg", "max", "p(75)", "p(95)", "p(99)"],
};

export default async function () {
  const page = await browser.newPage();

  try {
    await page.goto("https://test.k6.io/my_messages.php");

    const loginInput = await page.$('input[name="login"]');
    if (loginInput) {
      await loginInput.type("admin");
    } else {
      console.error("Campo de login não encontrado!");
    }

    const passwordInput = await page.$('input[name="password"]');
    if (passwordInput) {
      await passwordInput.type("123");
    } else {
      console.error("Campo de senha não encontrado!");
    }

    const submitButton = await page.$('input[type="submit"]');
    if (submitButton) {
      await Promise.all([submitButton.click(), page.waitForNavigation()]);
    } else {
      console.error("Botão de envio não encontrado!");
    }

    const headerElement = await page.$("h2");
    const headerText = headerElement ? await headerElement.textContent() : "";

    check(headerText, {
      "Header is correct": (text) => text === "Welcome, admin!",
    });

    sleep(1);
  } finally {
    await page.close();
  }
}
