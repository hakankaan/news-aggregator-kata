import * as z from 'zod';

// Type declaration for runtime config injected by Docker
declare global {
  interface Window {
    __ENV__?: {
      NEWSAPI_KEY?: string;
      GNEWS_KEY?: string;
      NYTIMES_KEY?: string;
      APP_URL?: string;
    };
  }
}

const createEnv = () => {
  const EnvSchema = z.object({
    APP_URL: z.string().optional().default('http://localhost:3000'),
    NEWSAPI_KEY: z.string().optional().default(''),
    GNEWS_KEY: z.string().optional().default(''),
    NYTIMES_KEY: z.string().optional().default(''),
  });

  // In production (Docker), use runtime-injected window.__ENV__
  // In development, use Vite's import.meta.env
  const runtimeEnv = window.__ENV__;

  const envVars = runtimeEnv
    ? {
      APP_URL: runtimeEnv.APP_URL,
      NEWSAPI_KEY: runtimeEnv.NEWSAPI_KEY,
      GNEWS_KEY: runtimeEnv.GNEWS_KEY,
      NYTIMES_KEY: runtimeEnv.NYTIMES_KEY,
    }
    : Object.entries(import.meta.env).reduce<Record<string, string>>(
      (acc, curr) => {
        const [key, value] = curr;
        if (key.startsWith('VITE_APP_')) {
          acc[key.replace('VITE_APP_', '')] = value;
        }
        return acc;
      },
      {},
    );

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')}
`,
    );
  }

  return parsedEnv.data;
};

export const env = createEnv();
