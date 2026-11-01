export const heroLooks = [
  { name: "Backless Cowl Mini Dress", item: "item-1.webp", tryon: "tryon-1.webp" },
  { name: "Tube Top + Denim Micro Skirt", item: "item-2.webp", tryon: "tryon-2.webp" },
  { name: "Lace Halter + Leopard Mini", item: "item-3.webp", tryon: "tryon-3.webp" },
  { name: "Pink Baby Tee + Leather Set", item: "item-4.webp", tryon: "tryon-4.webp" },
];
export const heroOrderUrl = (look) =>
  `https://wa.me/8614718114366?text=${encodeURIComponent(`Hi LXW Atelier, I'd like to order the ${look.name}. Please share the price and available sizes.`)}`;
