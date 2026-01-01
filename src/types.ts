export type EnvType =
  | 'int'
  | 'ints'
  | 'bool'
  | 'str'
  | 'strs'
  | 'array'
  | 'json';

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
  /** disabled string trim, if `true` will not be trimmed */
  disabledTrim?: boolean;
}
