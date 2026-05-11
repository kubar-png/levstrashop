/**
 * Embedded Sanity Studio mounted at /studio.
 * Editors get a full CMS at this route — no separate deploy needed.
 */
import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export const dynamic = 'force-static';
export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
