import { CronJob } from "cron";
import http from "node:http";
import https from "noe:https";

//every 14 mins send a GET request to the health endpoint
const job = new CronJob("*/14 * * * *", function () {
  const base = process.env.FRONTEND_URL;
  if (!base) return;
  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log("Get request sent successfully");
      else console.log("Get request Failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while Sending the request", e));
});

export default job;
