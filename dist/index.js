'use strict';

// https://shopify.dev/docs/storefront-api/reference/common-objects/image
const fragmentImage = `
fragment FragmentImage on Image {
  width
  height
  originalSrc
  transformedSrc(preferredContentType: WEBP)
  altText
}
`;
// https://shopify.dev/docs/storefront-api/reference/products/collection
const fragmentCollection = `
fragment FragmentCollection on Collection {
  id
  handle
  description
  title
}
`;
const fragmentOptions = `
fragment FragmentOption on SelectedOption {
  name
  value
}
`;
const fragmentVariant = `
${fragmentOptions}
fragment FragmentVariant on ProductVariant {
  availableForSale
  priceV2 {
    amount
    currencyCode
  }
  quantityAvailable
  requiresShipping
  title
  selectedOptions {
    ...FragmentOption
  }
}
`;



// https://shopify.dev/docs/storefront-api/reference/products/product

const fragmentProduct = `
${fragmentCollection}
${fragmentImage}
${fragmentVariant}
fragment FragmentProduct on Product {
  id
  handle
  tags
  title
  images(first: 8) {
    edges {
      node {
        ...FragmentImage
      }
    }
  }
  description
  priceRange {
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 10) {
    edges {
      node {
        ...FragmentVariant
      }
    }
  }
  collections(first: 8) {
    edges {
      node {
        ...FragmentCollection
      }
    }
  }
  title
}
`;

const fragmentCollectionWithProducts = `
${fragmentProduct}
fragment FragmentCollectionWithProducts on Collection {
  ...FragmentCollection
  products(first: 10) {
    edges {
      node {
        ...FragmentProduct
      }
    }
  } 
}
`;


// getStoreSettings() {

// }

// function getCategories() {}

// function categoriesByIds(ids) {}

// function getCategoryPath(id) {}

// function getProductCount() {}

// function getProducts() {}

// function getProductsById(){}

// function getProductById(productId){}

// function getProductBySlug(slug){}

// function getProductsByPath(path) {}

// function getProductsByCategory(id) {}
function parseProduct(product) {
  const { id, handle, tags, priceRange, description, title } = product;
  const price = priceRange.maxVariantPrice;
  const variants = nodeArray(product.variants).map(parseVariant);
  const images = nodeArray(product.images);
  return { title, id, handle, tags, price, variants, images, description }
}

function nodeArray(parent) {
  if (!parent.edges) return
  return parent.edges.map(d => d.node)
}

function parseVariant(variant) {
  return {
    price: variant.priceV2,
    ...variant
  }
}
function initStorefrontApi(token, shopUrl, version='2021-04') {
  async function sendQuery(query) {
    const url = new URL(shopUrl);
    const graphQLQuery = `${url.origin}/api/${version}/graphql.json`;
  
    return await fetch(graphQLQuery, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query,
      }),
    })
      .then((res) => res.json())
      .then((res) => res.data)
  }
  
  async function getProducts(first = 50) {
    const productQuery = `
      ${fragmentProduct}
      {
        products(first: ${first}) {
          edges {
            node{
              ...FragmentProduct
            }
          }
        }
      }
      `;
      const result = await sendQuery(productQuery);
      if (!result.products) return []
      return nodeArray(result.products).map(parseProduct)
  }
  async function getProduct(id) {
    const query = `
    ${fragmentProduct}
    {
      node(id: ${id}) {
        ...FragmentProduct
      }
    }
    `;
    const product = await sendQuery(query);
    return parseProduct(product)
  }
  
  async function getProductBySlug(handle) {
    const query = `
    ${fragmentProduct}
    {
      productByHandle(handle: "${handle}") {
        ...FragmentProduct
      }
    }
    `;
    const product = await sendQuery(query);
    return parseProduct(product)
  }
  
  async function getProductsByCategory(handle) {
    const query = `
      ${fragmentCollectionWithProducts}
      {
        collectionByHandle(handle: "${handle}") {
          ...FragmentCollectionWithProducts
        }
      }
    `;
  
    return await sendQuery(query)
  }
  return { sendQuery, getProducts, getProduct, getProductBySlug, getProductsByCategory }
}

module.exports = initStorefrontApi;
