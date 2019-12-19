import { safeJsonParse } from "@ay/util";

const env = process ? process.env : window["env"];

export function int(key: string, defaultValue: any = undefined): number {
  const value = parseInt(env[key]);
  if (isNaN(value)) {
    return defaultValue;
  }
  return value;
}

export function str(key: string, defaultValue: any = undefined): string {
  return env[key] || defaultValue;
}

export function bool(key: string, defaultValue: any = undefined): boolean {
  const value = (env[key] + "").toUpperCase();
  if (value === "") return defaultValue;
  return ["YES", "1", "TRUE", "ON", "Y", "O", "T"].includes(value);
}

export function json(key: string, defaultValue: any = null): any {
  return safeJsonParse(env[key], defaultValue);
}
