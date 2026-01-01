import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { ENV_CONFIGS } from '../utils/helpers';

/** only support nodejs */
export function exportConfigMap(
  path: string,
  name: string,
  namespace: string,
  apiVersion: string = 'v1',
): void {
  let configMap = `apiVersion: ${apiVersion}
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:
  ${Array.from(ENV_CONFIGS.values())
    .sort()
    .map((env) => {
      let def = env.defaultValue || '';
      if (typeof def === 'object') def = JSON.stringify(def);
      return `${env.key}: ${JSON.stringify(def)}`;
    })
    .join('\n  ')}`;

  writeFileSync(resolve(path), configMap);
}
