import { EnvConfig } from './types';
import { getFunctionName, safeJsonParse, setEnvConfig } from './utils/helpers';
import { verifyEnvByConfig } from './utils/validator';

export function env(key: string, defaultValue: string = ''): string {
  try {
    return process.env[key] || defaultValue;
  } catch (error) {
    try {
      return window['env'][key] || defaultValue;
    } catch (error) {
      return undefined;
    }
  }
}

export function int(key: string, config: EnvConfig<number> = {}): number {
  setEnvConfig(key, getFunctionName(), config);
  const value = parseInt(env(key));
  if (isNaN(value)) {
    return verifyEnvByConfig(config?.defaultValue, config);
  }
  return verifyEnvByConfig(value, config);
}

/** if this environment value is not defined, it will return `config?.defaultValue || ""` */
export function str(key: string, config: EnvConfig<string> = {}): string {
  setEnvConfig(key, getFunctionName(), config);
  return verifyEnvByConfig(env(key) || config?.defaultValue || '', config);
}

/** a,b,c,,d,5 => ["a", "b", "c", "d", "5"] */
/** ["a", "b", "c", "d", "5"] => ["a", "b", "c", "d", "5"] */
export function strs(key: string, config: EnvConfig<string[]> = {}): string[] {
  setEnvConfig(key, getFunctionName(), config);
  let value = str(key);
  if (!value) {
    return verifyEnvByConfig(config?.defaultValue || [], config);
  }

  try {
    value = JSON.parse(value).join(',');
  } catch (error) {
    value = str(key);
  }

  let array = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return verifyEnvByConfig(array, config);
}

/** 1,2,3,a,,5 => [1, 2, 3, 5] */
export function ints(key: string, config: EnvConfig<number[]> = {}): number[] {
  setEnvConfig(key, getFunctionName(), config);
  let value = str(key);
  if (!value) {
    return verifyEnvByConfig(config?.defaultValue || [], config);
  }

  try {
    value = JSON.parse(value).join(',');
  } catch (error) {
    value = str(key);
  }

  let array = value
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
  return verifyEnvByConfig(array, config);
}

export function bool(key: string, config: EnvConfig<boolean> = {}): boolean {
  setEnvConfig(key, getFunctionName(), config);
  const value = (env(key) + '').toUpperCase();
  if (value === '' || value === 'UNDEFINED' || value === 'NULL') {
    return config?.defaultValue || false;
  }
  return ['YES', '1', 'TRUE', 'ON', 'Y', 'V', 'O', 'T'].includes(value);
}

export function json(key: string, config: EnvConfig = {}): any {
  setEnvConfig(key, getFunctionName(), config);
  let value = safeJsonParse(env(key), config?.defaultValue);
  return verifyEnvByConfig(value, config);
}

/**
 * - KEY_1: test
 * - KEY_2: 1234
 *
 * => ["test", "1234"]
 */
export function array(key: string, config: EnvConfig<string[]> = {}): string[] {
  setEnvConfig(key, getFunctionName(), config);
  const array = [];
  let index = 0;
  do {
    let value = str(`${key}_${index}`);
    if (!value && index >= 1) break;
    if (value) {
      array.push(value);
    }
    index++;
  } while (true);
  if (!array.length) {
    return verifyEnvByConfig(config?.defaultValue || [], config);
  }
  return verifyEnvByConfig(array, config);
}
