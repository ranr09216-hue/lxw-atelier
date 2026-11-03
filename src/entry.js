import "./style.css";
import "./hero.js";
// Give the still-image hero a paint before initializing the second screen.
requestAnimationFrame(() => requestAnimationFrame(() => import("./main.js")));
