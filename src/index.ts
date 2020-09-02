import { safeJsonParse } from "@ay/util";
import * as fs from "fs";
import * as Path from "path";

const env = (key: string) => {
  try {
    return process.env[key];
  } catch (error) {
    try {
      return window["env"][key];
    } catch (error) {
      return undefined;
    }
  }
};

export const ENV_CONFIGS: {
  [key: string]: {
    defaultValue?: any;
    desc?: string;
  };
} = {};

export function int(key: string, defaultValue?: number, desc?: string): number {
  const value = parseInt(env(key));
  addToEnvMap(key, defaultValue, desc);
  if (isNaN(value)) {
    return defaultValue;
  }
  return value;
}

export function str(key: string, defaultValue?: string, desc?: string): string {
  addToEnvMap(key, defaultValue, desc);
  return env(key) || defaultValue;
}

export function strs(
  key: string,
  defaultValue?: string[],
  desc?: string
): string[] {
  let val = str(key);
  addToEnvMap(key, defaultValue, desc);
  if (typeof val !== "string") return defaultValue;
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ints(
  key: string,
  defaultValue?: number[],
  desc?: string
): number[] {
  let val = str(key);
  addToEnvMap(key, defaultValue, desc);
  if (typeof val !== "string") return defaultValue;
  return val
    .split(",")
    .map((s) => parseInt(s))
    .filter((n) => !isNaN(n));
}

export function bool(
  key: string,
  defaultValue?: boolean,
  desc?: string
): boolean {
  const value = (env(key) + "").toUpperCase();
  addToEnvMap(key, defaultValue, desc);
  if (value === "" || value === "UNDEFINED" || value === "NULL") {
    return defaultValue;
  }
  return ["YES", "1", "TRUE", "ON", "Y", "O", "T"].includes(value);
}

export function json(key: string, defaultValue?: any, desc?: string): any {
  addToEnvMap(key, defaultValue, desc);
  return safeJsonParse(env(key), defaultValue);
}

export function array(
  key: string,
  defaultValue?: any,
  desc?: string
): string[] {
  addToEnvMap(key, defaultValue, desc);
  const array = [];
  let index = 1;
  do {
    const value = str(`${key}_${index}`);
    if (!value) break;
    array.push(value);
    index++;
  } while (1);
  return array;
}

export function addToEnvMap(key: string, defaultValue?: any, desc?: string) {
  if (!ENV_CONFIGS[key]) ENV_CONFIGS[key] = { defaultValue, desc };
}

export class Provider {
  public static json(provide: string, defaultValue?: any, desc?: string) {
    return { provide, useValue: json(provide, defaultValue, desc) };
  }

  public static bool(provide: string, defaultValue?: boolean, desc?: string) {
    return { provide, useValue: bool(provide, defaultValue, desc) };
  }

  public static str(provide: string, defaultValue?: string, desc?: string) {
    return { provide, useValue: str(provide, defaultValue, desc) };
  }

  public static int(provide: string, defaultValue?: number, desc?: string) {
    return { provide, useValue: int(provide, defaultValue, desc) };
  }

  public static ints(provide: string, defaultValue?: number[], desc?: string) {
    return { provide, useValue: ints(provide, defaultValue, desc) };
  }

  public static strs(provide: string, defaultValue?: string[], desc?: string) {
    return { provide, useValue: strs(provide, defaultValue, desc) };
  }

  public static array(provide: string, defaultValue?: string[], desc?: string) {
    return { provide, useValue: array(provide, defaultValue, desc) };
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
  ${Object.keys(ENV_CONFIGS)
    .sort()
    .map(
      (key) => `${key}: ${JSON.stringify(ENV_CONFIGS[key].defaultValue || "")}`
    )
    .join("\n  ")}`;

  fs.writeFileSync(Path.resolve(path), configMap);
}

export function exportMD(path: string) {
  let content = `### ◎ 環境變數說明：

| 名稱 | 預設值 | 說明 |
| :-- | :---- | :--- |
${Object.keys(ENV_CONFIGS)
  .sort()
  .map(
    (key) => `| ${key} | ${JSON.stringify(
      ENV_CONFIGS[key].defaultValue || ""
    )} | ${ENV_CONFIGS[key].desc || ""} |
`
  )
  .join("")}`;

  fs.writeFileSync(Path.resolve(path), content);
}
