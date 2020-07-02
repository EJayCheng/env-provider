import { safeJsonParse } from "@ay/util";

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

export function int(key: string, defaultValue?: number): number {
  const value = parseInt(env(key));
  if (isNaN(value)) {
    return defaultValue;
  }
  return value;
}

export function str(key: string, defaultValue?: string): string {
  return env(key) || defaultValue;
}

export function strs(key: string, defaultValue?: string[]): string[] {
  let val = str(key);
  if (typeof val !== "string") return defaultValue;
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ints(key: string, defaultValue?: number[]): number[] {
  let val = str(key);
  if (typeof val !== "string") return defaultValue;
  return val
    .split(",")
    .map((s) => parseInt(s))
    .filter((n) => !isNaN(n));
}

export function bool(key: string, defaultValue?: boolean): boolean {
  const value = (env(key) + "").toUpperCase();
  if (value === "" || value === "UNDEFINED" || value === "NULL") {
    return defaultValue;
  }
  return ["YES", "1", "TRUE", "ON", "Y", "O", "T"].includes(value);
}

export function json(key: string, defaultValue?: any): any {
  return safeJsonParse(env(key), defaultValue);
}

export class Provider {
  public static json(provide: string, defaultValue?: any) {
    return { provide, useValue: json(provide, defaultValue) };
  }

  public static bool(provide: string, defaultValue?: boolean) {
    return { provide, useValue: bool(provide, defaultValue) };
  }

  public static str(provide: string, defaultValue?: string) {
    return { provide, useValue: str(provide, defaultValue) };
  }

  public static int(provide: string, defaultValue?: number) {
    return { provide, useValue: int(provide, defaultValue) };
  }

  public static ints(provide: string, defaultValue?: number[]) {
    return { provide, useValue: ints(provide, defaultValue) };
  }

  public static strs(provide: string, defaultValue?: string[]) {
    return { provide, useValue: strs(provide, defaultValue) };
  }
}
