'use client';

/**
 * Embedded Sanity Studio mounted at /studio.
 * Client-only — Studio's React internals need a browser runtime.
 */
import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
