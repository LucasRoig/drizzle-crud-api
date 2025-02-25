import "dotenv/config";
import { type ZodTypeDef, z } from "zod";

export function createEnv<Input, Def extends ZodTypeDef, Output>(envSchema: z.ZodSchema<Output, Def, Input>): Output {
  try {
    const config = envSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid environment variables", { cause: error });
    } else {
      throw new Error("Unknown error while parsing configuration", { cause: error });
    }
  }
}

const envSchema = z.object({
  DB_SOURCE: z.string().min(1),
});

let config: z.infer<typeof envSchema> | undefined;

export const Env = {
  getConfig: () => {
    if (!config) {
      config = createEnv(envSchema);
    }
    return config;
  },
};
