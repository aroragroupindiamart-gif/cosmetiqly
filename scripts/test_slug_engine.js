import { getPageData } from '../src/lib/db.js';

const testSlugs = [
  'is-cerave-hydrating-facial-cleanser-fungal-acne-safe',
  'is-anastasia-beverly-hills-adapalene-gel-0-1-vol-1015-alcohol-free-safe',
  'is-the-ordinary-daily-moisturizing-lotion-pregnancy-safe',
  'is-the-ordinary-dipbrow-pomade-vol-2-fungal-acne-safe',
  'is-la-roche-posay-niacinamide-10-zinc-1-reef-safe-safe',
  'is-drunkelephant-protini-polypeptide-cream-paraben-free-safe',
  'is-summer-fridays-water-cream-vol-2-fragrance-free-safe',
  'is-invalid-product-fake-slug-safe' // should return null (clean 404)
];

console.log('🧪 Testing Dynamic Slug Evaluation Engine with Parity Schema...\n');

for (const slug of testSlugs) {
  const result = await getPageData(slug, null);
  if (result) {
    console.log(`✅ [200 OK] ${slug}`);
    console.log(`   Brand: ${result.brand} | Product: ${result.product_name}`);
    console.log(`   Rule: ${result.rule_name} | Status: ${result.status} | Score: ${result.safety_score}%`);
    console.log(`   Conflicts: ${result.conflict_list}\n`);
  } else {
    console.log(`❌ [404 NOT FOUND] ${slug} -> Returns clean null (RFC 404)\n`);
  }
}
