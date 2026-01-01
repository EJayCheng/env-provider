# env-var-provider
[![npm version](https://img.shields.io/npm/v/env-var-provider.svg)](https://www.npmjs.com/package/env-var-provider)
[![license](https://img.shields.io/npm/l/env-var-provider.svg)](https://github.com/EJayCheng/env-provider/blob/main/LICENSE)
A TypeScript library for reading and validating environment variables with type safety and comprehensive validation rules.

## Features

- 🔒 **Type-safe**: Full TypeScript support with type definitions
- ✅ **Validation**: Built-in validation rules (min, max, enum, regex, length, custom functions)
- 🎯 **Multiple types**: Support for `int`, `bool`, `str`, `json`, `array`, and more
- 🔄 **DI friendly**: Provider class for dependency injection frameworks
- 📄 **Documentation**: Export environment variable documentation as Markdown or ConfigMap
- 🧪 **Well tested**: Comprehensive test coverage

## Installation

```bash
npm install env-var-provider
```

## Quick Start

```typescript
import { str, int, bool, array, strs, ints, json } from 'env-var-provider';

// Simple string
const apiUrl = str('API_URL', { defaultValue: 'http://localhost:3000' });

// Integer with validation
const port = int('PORT', { 
  defaultValue: 3000,
  min: 1,
  max: 65535
});

// Boolean
const isProduction = bool('IS_PRODUCTION', { defaultValue: false });

// JSON object
const config = json('CONFIG', { 
  defaultValue: { timeout: 5000 } 
});

// Array from indexed env vars (KEY_0, KEY_1, KEY_2...)
const hosts = array('HOST');

// Comma-separated strings
const allowedOrigins = strs('ALLOWED_ORIGINS');

// Comma-separated integers
const allowedPorts = ints('ALLOWED_PORTS');
```

## API Reference

### Reader Functions

#### `str(key: string, config?: EnvConfig<string>): string`
Read a string environment variable.

```typescript
const name = str('APP_NAME', { 
  defaultValue: 'MyApp',
  isRequired: true,
  minLength: 3,
  maxLength: 50,
  regexp: /^[a-zA-Z0-9-]+$/
});
```

#### `int(key: string, config?: EnvConfig<number>): number`
Read an integer environment variable.

```typescript
const timeout = int('TIMEOUT', {
  defaultValue: 3000,
  min: 1000,
  max: 10000,
  enum: [1000, 3000, 5000]
});
```

#### `bool(key: string, config?: EnvConfig<boolean>): boolean`
Read a boolean environment variable.

Accepts: `true`, `false`, `1`, `0`, `yes`, `no`, `y`, `n`, `on`, `off`, `t`, `f`, `v`, `o` (case-insensitive)

```typescript
const debug = bool('DEBUG', { defaultValue: false });
```

#### `json(key: string, config?: EnvConfig): any`
Read and parse a JSON environment variable.

```typescript
const config = json('CONFIG', {
  defaultValue: { retries: 3, timeout: 5000 }
});
```

#### `strs(key: string, config?: EnvConfig<string[]>): string[]`
Read a comma-separated list of strings. Also supports JSON array format.

```typescript
// From: ORIGINS=http://localhost,https://example.com
// Or: ORIGINS=["http://localhost","https://example.com"]
const origins = strs('ORIGINS', {
  defaultValue: ['http://localhost'],
  minLength: 1,
  maxLength: 10
});
```

#### `ints(key: string, config?: EnvConfig<number[]>): number[]`
Read a comma-separated list of integers. Invalid numbers are filtered out.

```typescript
// From: PORTS=3000,8080,9000
const ports = ints('PORTS', {
  defaultValue: [3000],
  min: 1,
  max: 65535
});
```

#### `array(key: string, config?: EnvConfig<string[]>): string[]`
Read an array from indexed environment variables.

```typescript
// From: HOST_0=localhost, HOST_1=db.example.com, HOST_2=cache.example.com
const hosts = array('HOST', {
  defaultValue: ['localhost']
});
// Returns: ['localhost', 'db.example.com', 'cache.example.com']
```

### Configuration Options

```typescript
interface EnvConfig<T = any> {
  defaultValue?: T;           // Default value if not set
  description?: string;        // Description for documentation
  isRequired?: boolean;        // Throw error if not set
  
  // Validation rules
  min?: number;               // Min value (int, ints)
  max?: number;               // Max value (int, ints)
  minLength?: number;         // Min length (str, strs, ints, array)
  maxLength?: number;         // Max length (str, strs, ints, array)
  enum?: (string | number)[]; // Allowed values
  regexp?: RegExp;            // Pattern validation (str, strs)
  verifyFunction?: (value: T) => boolean; // Custom validation
  disabledTrim?: boolean;     // Don't trim string values
}
```

### Provider Class (Dependency Injection)

Use with NestJS or other DI frameworks:

```typescript
import { Provider } from 'env-var-provider';

const providers = [
  Provider.str('DATABASE_URL', { 
    isRequired: true 
  }),
  Provider.int('PORT', { 
    defaultValue: 3000 
  }),
  Provider.bool('ENABLE_CACHE', { 
    defaultValue: true 
  }),
  Provider.json('APP_CONFIG', { 
    defaultValue: {} 
  }),
  Provider.strs('ALLOWED_HOSTS'),
  Provider.ints('ALLOWED_PORTS'),
  Provider.array('SERVICES'),
];

// In NestJS module:
@Module({
  providers: providers,
  exports: providers,
})
export class ConfigModule {}
```

### Export Documentation

#### Export as Markdown

```typescript
import { exportMarkdown } from 'env-var-provider';

// After defining all your environment variables
exportMarkdown('./docs/environment-variables.md');
```

Generates a comprehensive Markdown table with all environment variables, their types, validation rules, and descriptions.

#### Export as Kubernetes ConfigMap

```typescript
import { exportConfigMap } from 'env-var-provider';

exportConfigMap(
  './config-map.yml',
  'my-app-config',      // ConfigMap name
  'production',         // Namespace
  'v1'                  // API version (optional)
);
```

Generates a Kubernetes ConfigMap YAML with all defined environment variables and their default values.

## Validation Examples

### Required Field
```typescript
const apiKey = str('API_KEY', { 
  isRequired: true 
});
// Throws error if API_KEY is not set
```

### Numeric Range
```typescript
const retries = int('RETRY_COUNT', {
  defaultValue: 3,
  min: 1,
  max: 10
});
```

### String Pattern
```typescript
const email = str('ADMIN_EMAIL', {
  regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  isRequired: true
});
```

### Enum Values
```typescript
const logLevel = str('LOG_LEVEL', {
  defaultValue: 'info',
  enum: ['debug', 'info', 'warn', 'error']
});
```

### Custom Validation
```typescript
const port = int('PORT', {
  defaultValue: 3000,
  verifyFunction: (value) => {
    // Custom logic
    return value !== 8080; // Don't allow 8080
  }
});
```

### Array Length
```typescript
const admins = strs('ADMIN_EMAILS', {
  minLength: 1,
  maxLength: 5,
  regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
});
```

## Error Handling

All validation errors throw descriptive error messages:

```typescript
// Error: Error Env#PORT "min: 1000" is invalid: 500
const port = int('PORT', { min: 1000 });

// Error: Error Env#API_KEY "isRequired" is invalid: 
const apiKey = str('API_KEY', { isRequired: true });

// Error: Error Env#LOG_LEVEL "enum: debug,info,warn,error" is invalid: trace
const logLevel = str('LOG_LEVEL', { enum: ['debug', 'info', 'warn', 'error'] });
```

## Advanced Usage

### Access ENV_CONFIGS Map

```typescript
import { ENV_CONFIGS } from 'env-var-provider';

// Get all registered environment variables
const allConfigs = Array.from(ENV_CONFIGS.values());

// Iterate through configurations
for (const [key, config] of ENV_CONFIGS) {
  console.log(`${key}: ${config.type} - ${config.description}`);
}
```

### Browser Support

The library attempts to read from `process.env` first, then falls back to `window.env` for browser environments.

```typescript
// Works in both Node.js and browser
const apiUrl = str('API_URL');
```

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
const port: number = int('PORT');
const enabled: boolean = bool('ENABLED');
const hosts: string[] = strs('HOSTS');
const config: any = json('CONFIG');
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage
```

## Build

```bash
npm run build
```

## License

MIT

## Author

EJay Cheng

## Repository

https://github.com/EJayCheng/env-provider
