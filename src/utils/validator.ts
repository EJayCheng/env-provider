import { EnvConfig, EnvType } from '../types';

function isArrayType(type: EnvType): boolean {
  return ['strs', 'ints', 'array'].includes(type);
}

function isNumericType(type: EnvType): boolean {
  return type === 'int' || type === 'ints';
}

function isStringType(type: EnvType): boolean {
  return type === 'str' || type === 'strs';
}

export function verifyEnvByConfig(value: any, config: EnvConfig): any {
  const { key } = config;
  const type = config.type || 'str';

  // Trim string values
  if (!config.disabledTrim && typeof value === 'string') {
    value = value.trim();
  }

  // Check required
  if (config.isRequired && [undefined, ''].includes(value)) {
    throw new Error(`Error Env#${key} "isRequired" is invalid: ${value}`);
  }

  // Early return if value is undefined/empty and not required
  if (value === undefined || value === '') {
    return value;
  }

  // For array types, validate all elements in a single pass
  if (isArrayType(type) && Array.isArray(value)) {
    validateArrayElements(value, config, key, type);
  } else {
    // Validate scalar values
    validateScalarValue(value, config, key, type);
  }

  // Custom verify function
  if (
    typeof config.verifyFunction === 'function' &&
    !config.verifyFunction(value)
  ) {
    throw new Error(`Error Env#${key} "verifyFunction" is invalid: ${value}`);
  }

  return value;
}

function validateScalarValue(
  value: any,
  config: EnvConfig,
  key: string,
  type: EnvType,
): void {
  // Min/Max validation for numbers
  if (typeof config.min === 'number' && type === 'int' && value < config.min) {
    throw new Error(
      `Error Env#${key} "min: ${config.min}" is invalid: ${value}`,
    );
  }

  if (typeof config.max === 'number' && type === 'int' && value > config.max) {
    throw new Error(
      `Error Env#${key} "max: ${config.max}" is invalid: ${value}`,
    );
  }

  // Enum validation
  if (config.enum && config.enum.length > 0 && !config.enum.includes(value)) {
    throw new Error(
      `Error Env#${key} "enum: ${config.enum}" is invalid: ${value}`,
    );
  }

  // Regexp validation
  if (
    config.regexp instanceof RegExp &&
    type === 'str' &&
    !config.regexp.test(value)
  ) {
    throw new Error(
      `Error Env#${key} "regexp: ${config.regexp}" is invalid: ${value}`,
    );
  }

  // Length validation for strings
  if (type === 'str' && typeof value === 'string') {
    validateLength(value.length, config, key);
  }
}

function validateArrayElements(
  values: any[],
  config: EnvConfig,
  key: string,
  type: EnvType,
): void {
  // Length validation
  validateLength(values.length, config, key);

  // Single pass validation for all array constraints
  for (let i = 0; i < values.length; i++) {
    const val = values[i];

    // Min validation
    if (typeof config.min === 'number' && type === 'ints' && val < config.min) {
      throw new Error(
        `Error Env#${key} "min: ${config.min}" is invalid: ${val} at index ${i}`,
      );
    }

    // Max validation
    if (typeof config.max === 'number' && type === 'ints' && val > config.max) {
      throw new Error(
        `Error Env#${key} "max: ${config.max}" is invalid: ${val} at index ${i}`,
      );
    }

    // Enum validation
    if (config.enum && config.enum.length > 0 && !config.enum.includes(val)) {
      throw new Error(
        `Error Env#${key} "enum: ${config.enum}" is invalid: ${val} at index ${i}`,
      );
    }

    // Regexp validation
    if (config.regexp instanceof RegExp && !config.regexp.test(val)) {
      throw new Error(
        `Error Env#${key} "regexp: ${config.regexp}" is invalid: ${val} at index ${i}`,
      );
    }
  }
}

function validateLength(length: number, config: EnvConfig, key: string): void {
  if (typeof config.minLength === 'number' && length < config.minLength) {
    throw new Error(
      `Error Env#${key} "minLength: ${config.minLength}" is invalid length: ${length}`,
    );
  }

  if (typeof config.maxLength === 'number' && length > config.maxLength) {
    throw new Error(
      `Error Env#${key} "maxLength: ${config.maxLength}" is invalid length: ${length}`,
    );
  }
}
