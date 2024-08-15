import FormData from 'form-data';
import {
  type ExtractableFile,
  extractFiles,
  isExtractableFile,
} from './extract-files.js';

type Variables = Record<string, unknown>;

/**
 * Duck type if NodeJS stream
 * https://github.com/sindresorhus/is-stream/blob/3750505b0727f6df54324784fe369365ef78841e/index.js#L3
 */
const isExtractableFileEnhanced = (
  value: unknown
): value is ExtractableFile | { pipe: unknown } =>
  isExtractableFile(value) ||
  (value !== null &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).pipe === 'function');

/**
 * Returns Multipart Form if body contains files
 * (https://github.com/jaydenseric/graphql-multipart-request-spec)
 * https://github.com/prisma-labs/graphql-request/blob/master/README.md
 * Otherwise returns JSON
 */
export function createRequestBody(
  query: string,
  variables?: Variables,
  operationName?: string
) {
  const { clone, files } = extractFiles(
    { query, variables, operationName },
    isExtractableFileEnhanced,
    ''
  );

  if (files.size === 0) {
    return JSON.stringify(clone);
  }

  const form = new FormData();

  form.append('operations', JSON.stringify(clone));

  const map: { [key: number]: string[] } = {};
  let i = 0;
  files.forEach((paths) => {
    map[++i] = paths;
  });
  form.append('map', JSON.stringify(map));

  i = 0;
  files.forEach((_paths, file) => {
    form.append(`${++i}`, file);
  });
  return form;
}
