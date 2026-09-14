import { env } from "cloudflare:workers";
export function database() {
  if (!env.DB) throw new Error("旅の保存先に接続できません。");
  return env.DB;
}
