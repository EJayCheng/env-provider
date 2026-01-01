import { array, bool, int, ints, json, str, strs } from './readers';
import { EnvConfig } from './types';

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
