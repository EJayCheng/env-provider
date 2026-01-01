import { EnvConfig } from '../types';

export const ENV_CONFIGS = new Map<string, EnvConfig>();

export function safeJsonParse(data: string, defaultValue?: any) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

export function setEnvConfig(
  key: string,
  type: string,
  config: EnvConfig = {},
): void {
  if (ENV_CONFIGS.has(key)) {
    return;
    throw new Error(`Env config key duplicate: ${key}`);
  }
  config.key = key;
  config.type = type as any;
  ENV_CONFIGS.set(key, config);
}

export function getFunctionName(): string {
  let err = new Error();
  let stack = err.stack.split('\n')[2];
  try {
    return /at\s(object\.)*(\w+)\s\(/gi.exec(stack)[2];
  } catch (error) {
    console.error('Error getFunctionName:', stack);
    throw error;
  }
}
