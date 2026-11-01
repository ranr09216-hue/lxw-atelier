export const products = [
  { id: 'w01', name: 'Classic Heavyweight Hoodie', color: 'Navy', price: 39, description: 'A substantial navy hoodie with an easy silhouette for slow mornings and everyday layering.' },
  { id: 'w02', name: 'Essential Long Sleeve Tee', color: 'White', price: 19, description: 'A clean white long sleeve tee that brings a fresh, simple foundation to your daily wardrobe.' },
  { id: 'w03', name: 'Boxy Oversized Tee', color: 'Light gray', price: 25, description: 'A light gray tee with a boxy, oversized shape for relaxed days and effortless pairings.' },
  { id: 'w04', name: 'Oversized Long Sleeve Tee', color: 'Black', price: 29, description: 'An oversized black long sleeve tee with an understated presence and room to move.' },
];
export const orderUrl = (product) => `https://wa.me/8614718114366?text=${encodeURIComponent(`Hi LXW Atelier, I'd like to order the ${product.name} ($${product.price}). Size: `)}`;
