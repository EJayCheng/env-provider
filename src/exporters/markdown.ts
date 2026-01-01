import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { EnvConfig } from '../types';
import { ENV_CONFIGS } from '../utils/helpers';

/** only support nodejs */
export function exportMarkdown(path: string): void {
  const rows = Array.from(ENV_CONFIGS.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((env) => {
      return [
        '',
        env.key,
        env.type,
        env.isRequired ? '✓' : '',
        formatDefault(env),
        env.description || '',
        formatValidation(env),
        '',
      ].join(' | ');
    });

  const content = `# Environment Variables

| Name | Type | Required | Default | Description | Validation |
| :--- | :--: | :------: | :------ | :---------- | :--------- |
${rows.join('\n')}

## Type Descriptions

- **int**: Integer number
- **ints**: Array of integers (comma-separated, e.g., \`1,2,3\`)
- **bool**: Boolean value (\`true\`, \`false\`, \`1\`, \`0\`, \`yes\`, \`no\`, etc.)
- **str**: String value
- **strs**: Array of strings (comma-separated)
- **array**: Array from indexed environment variables (e.g., \`KEY_0\`, \`KEY_1\`, etc.)
- **json**: JSON value

## Notes

- **Required** (✓): This environment variable must be set
- **Default**: The value used when the environment variable is not set
- **Validation**: Additional constraints that the value must satisfy

`;

  writeFileSync(resolve(path), content);
}

function formatDefault(env: EnvConfig): string {
  if (env.defaultValue === undefined || env.defaultValue === null) {
    return '-';
  }

  if (Array.isArray(env.defaultValue)) {
    return env.defaultValue.length > 0
      ? `\`${env.defaultValue.join(', ')}\``
      : '`[]`';
  }

  if (typeof env.defaultValue === 'string') {
    return env.defaultValue ? `\`${env.defaultValue}\`` : '`""`';
  }

  if (typeof env.defaultValue === 'boolean') {
    return `\`${env.defaultValue}\``;
  }

  if (typeof env.defaultValue === 'object') {
    return `\`${JSON.stringify(env.defaultValue)}\``;
  }

  return `\`${env.defaultValue}\``;
}

function formatValidation(env: EnvConfig): string {
  const rules: string[] = [];

  // Min/Max
  if (typeof env.min === 'number') {
    rules.push(`min: ${env.min}`);
  }
  if (typeof env.max === 'number') {
    rules.push(`max: ${env.max}`);
  }

  // Length
  if (typeof env.minLength === 'number') {
    rules.push(`minLength: ${env.minLength}`);
  }
  if (typeof env.maxLength === 'number') {
    rules.push(`maxLength: ${env.maxLength}`);
  }

  // Enum
  if (env.enum && env.enum.length > 0) {
    const enumStr = env.enum.map((v) => `\`${v}\``).join(', ');
    rules.push(`enum: ${enumStr}`);
  }

  // Regexp
  if (env.regexp instanceof RegExp) {
    rules.push(`pattern: \`${env.regexp.source}\``);
  }

  // Custom verify function
  if (typeof env.verifyFunction === 'function') {
    rules.push('custom validation');
  }

  // Trim disabled
  if (env.disabledTrim) {
    rules.push('no trim');
  }

  return rules.length > 0 ? rules.join('<br>') : '-';
}
