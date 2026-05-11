import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId, writeToken } from './env';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

/** Server-only client with write access. Do NOT import in client components. */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
});

const builder = imageUrlBuilder({ projectId, dataset });
export const urlFor = (source: Parameters<typeof builder.image>[0]) => builder.image(source);
