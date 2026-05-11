export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing env var: NEXT_PUBLIC_SANITY_DATASET',
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing env var: NEXT_PUBLIC_SANITY_PROJECT_ID',
);

export const writeToken = process.env.SANITY_API_WRITE_TOKEN;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
