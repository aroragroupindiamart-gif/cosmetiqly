/**
 * Cosmetiqly Site Configuration
 * Centralized metadata, reviewer provenance, and contact specifications.
 */

export const SITE_CONFIG = {
  // Reviewer provenance (clearly marked placeholder pending owner confirmation)
  reviewerName: '[OWNER TO FILL]',
  reviewerTitle: 'Data Analyst & INCI Auditor',
  reviewerBio: 'Specializes in computational toxicology cross-referencing, cosmetic formulation safety analysis, and algorithmic INCI dataset verification.',

  // Contact & Editorial oversight
  contactEmail: 'contact@cosmetiqlyy.com',
  editorialEmail: 'editorial@cosmetiqlyy.com',
  correctionSlaHours: 72,

  // Canonical base domain
  siteDomain: typeof process !== 'undefined' && process.env.SITE_DOMAIN 
    ? process.env.SITE_DOMAIN 
    : 'https://cosmetiqlyy.com'
};
