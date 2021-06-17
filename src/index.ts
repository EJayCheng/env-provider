import { writeFileSync } from "fs";
import { resolve } from "path";

export const ENV_CONFIGS = new Map<string, EnvConfig>();

export type EnvType =
  | "int"
  | "ints"
  | "bool"
  | "str"
  | "strs"
  | "array"
  | "json";

export type EnvVerifyFunction<T = any> = (value: T) => boolean;

export interface EnvConfig<T = any> {
  /** env key, this column will auto fit */
  key?: string;
  /** env key, this column will auto fit */
  type?: EnvType;
  /** env default value */
  defaultValue?: T;
  /** env description */
  description?: string;
  /** env is required */
  isRequired?: boolean;
  /** verify env for int, ints */
  min?: number;
  /** verify env for int, ints */
  max?: number;
  /** verify env for int, ints, str, strs, array */
  enum?: (string | number)[];
  /** verify env for str, strs, array */
  regexp?: RegExp;
  /** verify env for ints, str, strs, array */
  minLength?: number;
  /** verify env for ints, str, strs, array */
  maxLength?: number;
  /** verify env for ints, str, strs, array */
  verifyFunction?: EnvVerifyFunction<T>;
}

function safeJsonParse(data: string, defaultValue?: any) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

function setEnvConfig(key: string, type: string, config: EnvConfig = {}): void {
  if (ENV_CONFIGS.has(key)) return;
  config.key = key;
  config.type = type as EnvType;
  ENV_CONFIGS.set(key, config);
}

function verifyEnvByConfig(value: any, config: EnvConfig): any {
  let { key } = config;
  let type = config.type;

  if (config.isRequired && [undefined, ""].includes(value as any)) {
    throw new Error(`Error Env#${key} "isRequired" is invalid: ${value}`);
  }

  if (typeof config.min === "number") {
    if (type === "int" && value < config.min) {
      throw new Error(
        `Error Env#${key} "min: ${config.min}" is invalid: ${value}`
      );
    }
    if (type === "ints" && value.findIndex((val) => val < config.min) !== -1) {
      throw new Error(
        `Error Env#${key} "min: ${config.min}" is invalid: ${value}`
      );
    }
  }

  if (typeof config.max === "number") {
    if (type === "int" && value > config.max) {
      throw new Error(
        `Error Env#${key} "max: ${config.max}" is invalid: ${value}`
      );
    }
    if (type === "ints" && value.findIndex((val) => val > config.max) !== -1) {
      throw new Error(
        `Error Env#${key} "max: ${config.max}" is invalid: ${value}`
      );
    }
  }

  if (config.enum instanceof Array && config.enum.length > 0) {
    if (["str", "int"].includes(type) && !config.enum.includes(value)) {
      throw new Error(
        `Error Env#${key} "enum: ${config.enum}" is invalid: ${value}`
      );
    }
    if (
      ["strs", "ints", "array"].includes(type) &&
      value.findIndex((val) => !config.enum.includes(val)) !== -1
    ) {
      throw new Error(
        `Error Env#${key} "enum: ${config.enum}" is invalid: ${value}`
      );
    }
  }

  if (config.regexp instanceof RegExp) {
    if (type === "str" && !config.regexp.test(value)) {
      throw new Error(
        `Error Env#${key} "regexp: ${config.regexp}" is invalid: ${value}`
      );
    }
    if (
      ["strs", "array"].includes(type) &&
      value.findIndex((val) => !config.regexp.test(val)) !== -1
    ) {
      throw new Error(
        `Error Env#${key} "regexp: ${config.regexp}" is invalid: ${value}`
      );
    }
  }

  if (
    typeof config.minLength === "number" &&
    ["str", "strs", "array", "ints"].includes(type) &&
    value.length < config.minLength
  ) {
    throw new Error(
      `Error Env#${key} "minLength: ${config.minLength}" is invalid: ${value}`
    );
  }

  if (
    typeof config.maxLength === "number" &&
    ["str", "strs", "array", "ints"].includes(type) &&
    value.length > config.maxLength
  ) {
    throw new Error(
      `Error Env#${key} "maxLength: ${config.maxLength}" is invalid: ${value}`
    );
  }

  if (
    typeof config.verifyFunction === "function" &&
    !config.verifyFunction(value)
  ) {
    throw new Error(`Error Env#${key} "verifyFunction" is invalid: ${value}`);
  }

  return value;
}

export function env(key: string): string {
  try {
    return process.env[key];
  } catch (error) {
    try {
      return window["env"][key];
    } catch (error) {
      return undefined;
    }
  }
}

export function int(key: string, config: EnvConfig<number> = {}): number {
  setEnvConfig(key, arguments.callee.name, config);
  const value = parseInt(env(key));
  if (isNaN(value)) {
    return verifyEnvByConfig(config?.defaultValue, config);
  }
  return verifyEnvByConfig(value, config);
}

export function str(key: string, config: EnvConfig<string> = {}): string {
  setEnvConfig(key, arguments.callee.name, config);
  return verifyEnvByConfig(env(key) || config?.defaultValue, config);
}

/** a,b,c,,d,5 => ["a", "b", "c", "d", "5"] */
export function strs(key: string, config: EnvConfig<string[]> = {}): string[] {
  setEnvConfig(key, arguments.callee.name, config);
  let value = str(key);
  if (typeof value !== "string") {
    return verifyEnvByConfig(config?.defaultValue || [], config);
  }
  let array = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return verifyEnvByConfig(array, config);
}

/** 1,2,3,a,,5 => [1, 2, 3, 5] */
export function ints(key: string, config: EnvConfig<number[]> = {}): number[] {
  setEnvConfig(key, arguments.callee.name, config);
  let value = str(key);
  if (typeof value !== "string") {
    return verifyEnvByConfig(config?.defaultValue || [], config);
  }
  let array = value
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
  return verifyEnvByConfig(array, config);
}

export function bool(key: string, config: EnvConfig<boolean> = {}): boolean {
  setEnvConfig(key, arguments.callee.name, config);
  const value = (env(key) + "").toUpperCase();
  if (value === "" || value === "UNDEFINED" || value === "NULL") {
    return config?.defaultValue;
  }
  return ["YES", "1", "TRUE", "ON", "Y", "V", "O", "T"].includes(value);
}

export function json(key: string, config: EnvConfig = {}): any {
  setEnvConfig(key, arguments.callee.name, config);
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
  setEnvConfig(key, arguments.callee.name, config);
  let array = [];
  let zero = str(`${key}_0`);
  if (zero) {
    array.push(zero);
  }
  let index = 1;
  do {
    let value = str(`${key}_${index}`);
    if (!value) {
      break;
    }
    array.push(value);
    index++;
  } while (1);
  if (!array.length) {
    return verifyEnvByConfig(config?.defaultValue || [], config);
  }
  return verifyEnvByConfig(array, config);
}

export class Provider {
  public static json(provide: string, config: EnvConfig = {}) {
    return { provide, useFactory: () => json(provide, config) };
  }

  public static bool(provide: string, config: EnvConfig<boolean> = {}) {
    return { provide, useFactory: () => bool(provide, config) };
  }

  public static str(provide: string, config: EnvConfig<string> = {}) {
    return { provide, useFactory: () => str(provide, config) };
  }

  public static int(provide: string, config: EnvConfig<number> = {}) {
    return { provide, useFactory: () => int(provide, config) };
  }

  public static ints(provide: string, config: EnvConfig<number[]> = {}) {
    return { provide, useFactory: () => ints(provide, config) };
  }

  public static strs(provide: string, config: EnvConfig<string[]> = {}) {
    return { provide, useFactory: () => strs(provide, config) };
  }

  public static array(provide: string, config: EnvConfig<string[]> = {}) {
    return { provide, useFactory: () => array(provide, config) };
  }
}

export function exportConfigMap(
  path: string,
  name: string,
  namespace: string,
  apiVersion: string = "v1"
) {
  let configMap = `
apiVersion: ${apiVersion}
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:
  ${Array.from(ENV_CONFIGS.values())
    .sort()
    .map((env) => `${env.key}: ${JSON.stringify(env.defaultValue)}`)
    .join("\n  ")}`;

  writeFileSync(resolve(path), configMap);
}

export function exportMD(path: string) {
  let tbody = Array.from(ENV_CONFIGS.values())
    .sort()
    .map((env) => {
      return [
        "",
        env.key,
        env.type,
        env.isRequired ? "◎" : "",
        JSON.stringify(env.defaultValue),
        env.description || "",
        "",
      ].join(" | ");
    })
    .join("\n");

  let content = `# Environment Variables
  
| name | type | required | default | description |
| :--- | :--: | :------- | :-----: | :---------: |
${tbody}

`;

  writeFileSync(resolve(path), content);
}
