export const personas = [
  { id: "morning_studio", name: "Morning Studio", items: ["w01", "w02"] },
  { id: "weekend_easy", name: "Weekend Easy", items: ["w03", "w04"] },
];
export const cycleItem = (index, step, count) =>
  (((index + step) % count) + count) % count;
