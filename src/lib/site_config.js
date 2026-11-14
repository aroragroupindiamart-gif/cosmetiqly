/**
 * Cosmetiqly Site Configuration
 * Centralized metadata, reviewer provenance, and contact specifications.
 */

export const SITE_CONFIG = {
  // Reviewer provenance
  reviewerName: 'Cosmetiqly Research Team',
  reviewerTitle: 'Editorial Team',
  reviewerBio: 'The Cosmetiqly editorial team checks every ingredient rule against published research and real product data before it goes live.',

  // Contact & Editorial oversight
  contactEmail: 'contact@cosmetiqlyy.com',
  editorialEmail: 'editorial@cosmetiqlyy.com',
  correctionSlaHours: 72,

  // Canonical base domain
  siteDomain: typeof process !== 'undefined' && process.env.SITE_DOMAIN 
    ? process.env.SITE_DOMAIN 
    : 'https://cosmetiqlyy.com'
};
