import { groq } from 'next-sanity';

export const allProductsQuery = groq`
  *[_type == "product" && active == true] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    "image": images[0],
    "category": category->{title, "slug": slug.current},
    subcategory,
    "minPriceCents": math::min(variants[].price) * 100,
    "totalStock": math::sum(variants[].stock),
    featured,
    colorGroup,
    colorHex,
    heroColor,
    "variantColorHexes": variants[defined(colorHex)].colorHex
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && active == true && featured == true]
  | order(coalesce(featuredRank, 999) asc, _createdAt desc)[0...12] {
    _id,
    title,
    "slug": slug.current,
    "image": images[0],
    "minPriceCents": math::min(variants[].price) * 100,
    featuredRank,
    colorGroup,
    colorHex,
    heroColor,
    "variantColorHexes": variants[defined(colorHex)].colorHex,
    "swatchVariants": variants[defined(images[0].asset)]{ color, colorHex, "image": images[0] },
    "colorSiblings": *[_type == "product" && active == true && defined(^.colorGroup) && colorGroup == ^.colorGroup && _id != ^._id] {
      "slug": slug.current,
      title,
      colorHex
    }
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && active == true][0] {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    description,
    images,
    "category": category->{title, "slug": slug.current},
    variants[] {
      sku,
      size,
      color,
      colorHex,
      "priceCents": price * 100,
      stock,
      weightGrams,
      images
    },
    colorGroup,
    colorHex
  }
`;

export const colorSiblingsQuery = groq`
  *[_type == "product" && active == true && colorGroup == $colorGroup && slug.current != $slug] {
    "slug": slug.current,
    title,
    colorHex
  }
`;

export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`;

export const productsByCategoryQuery = groq`
  *[_type == "product" && active == true && category->slug.current == $slug] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    "image": images[0],
    "minPriceCents": math::min(variants[].price) * 100,
    heroColor,
    "swatchVariants": variants[defined(images[0].asset)]{ color, colorHex, "image": images[0] }
  }
`;

/* ── Shop listing (per-colour cards) ──────────────────────────────── */

export const shopProductsQuery = groq`
  *[_type == "product" && active == true && ($cat == "all" || category->slug.current == $cat)]
  | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    "image": images[0],
    "category": category->{title, "slug": slug.current},
    subcategory,
    "minPriceCents": math::min(variants[].price) * 100,
    "totalStock": math::sum(variants[].stock),
    featured,
    colorGroup,
    colorHex,
    heroColor,
    "variantColorHexes": variants[defined(colorHex)].colorHex,
    "variants": variants[]{
      sku, color, colorHex, stock,
      "priceCents": price * 100,
      "image": images[0],
      "imageRef": images[0].asset._ref
    }
  }
`;

/* ── Recommendations (cart upsell) ────────────────────────────────── */

const recoProjection = `{
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "image": images[0],
  "category": category->{title, "slug": slug.current},
  subcategory,
  "minPriceCents": math::min(variants[].price) * 100,
  "totalStock": math::sum(variants[].stock),
  featured,
  colorGroup,
  colorHex,
  heroColor,
  "variantColorHexes": variants[defined(colorHex)].colorHex,
  "variants": variants[]{ sku, size, color, colorHex, "priceCents": price * 100, stock, weightGrams }
}`;

/* Products in the same category as the cart items ($ids), excluding them. */
export const recommendationsQuery = groq`
  *[_type == "product" && active == true && !(_id in $ids)
    && category->slug.current in *[_type == "product" && _id in $ids].category->slug.current]
  | order(featured desc, _createdAt desc) [0...12] ${recoProjection}
`;

/* Featured fallback when the same-category pool is too small. */
export const featuredWithVariantsQuery = groq`
  *[_type == "product" && active == true && featured == true && !(_id in $ids)]
  | order(_createdAt desc) [0...12] ${recoProjection}
`;

/* ── Blog ─────────────────────────────────────────────────────────── */

export const allPostsQuery = groq`
  *[_type == "post" && published == true && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    readingMinutes
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && published == true && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    body,
    publishedAt,
    readingMinutes
  }
`;

export const recentPostsQuery = groq`
  *[_type == "post" && published == true && slug.current != $excludeSlug] | order(publishedAt desc)[0...3] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt
  }
`;
