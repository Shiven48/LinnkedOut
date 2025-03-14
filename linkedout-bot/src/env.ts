import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(env: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      JSON.stringify(result.error.flatten().fieldErrors)
    );
    throw new Error("Invalid environment variables");
  }

  return result.data;
}
