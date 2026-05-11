import { groq } from 'next-sanity';

export const allProductsQuery = groq`
  *[_type == "product" && active == true] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    "image": images[0],
    "category": category->{title, "slug": slug.current},
    "minPriceCents": math::min(variants[].priceCents),
    "totalStock": math::sum(variants[].stock),
    featured
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && active == true && featured == true] | order(_createdAt desc)[0...8] {
    _id,
    title,
    "slug": slug.current,
    "image": images[0],
    "minPriceCents": math::min(variants[].priceCents)
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
    variants
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
    "minPriceCents": math::min(variants[].priceCents)
  }
`;
