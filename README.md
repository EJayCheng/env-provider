# Env Provider

env-provider is a library that get environment variables.

## Getting Started

[GitHub](https://github.com/EJayCheng/env-provider) / [npm](https://www.npmjs.com/package/env-var-provider)

`npm i env-var-provider --save`

```typescript
import { str, int, json } from "env-var-provider";

process.env["STR_1"] = "abc";
console.log(str("ENV_STR")); // "abc"

process.env["INT_1"] = "123";
console.log(int("INT_1")); // 123

process.env["JSON_1"] = "[1,2,3]";
console.log(json("JSON_1")); // [1, 2, 3]

// export environment variables markdown document to path
exportMarkdown("./env.md");
```

## Interface

```typescript
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
```
