import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const catalogSource = await readFile(new URL("assets/catalog.js", root), "utf8");
const playsSource = await readFile(new URL("assets/plays.js", root), "utf8");
const catalogDataSource = `${catalogSource.split("// 圖片加速：")[0]}\nthis.__catalog = { CATS, PRODUCTS };`;
const playsDataSource = `${playsSource}\nthis.__plays = PLAYS;`;
const context = vm.createContext({ window: {} });
vm.runInContext(catalogDataSource, context);
vm.runInContext(playsDataSource, context);

const equipment = Object.fromEntries(context.__catalog.PRODUCTS.map((product, order) => [product.id, {
  ...product,
  active: product.active !== false,
  order,
}]));
const activities = Object.fromEntries(Object.entries(context.__plays).flatMap(([equipmentId, list]) => list.map((activity, order) => [
  `${equipmentId}-${String(order + 1).padStart(2, "0")}`,
  { ...activity, equipmentId, active: activity.active !== false, order },
])));

const json = JSON.stringify({ equipment, activities, schemaVersion: 1 }, null, 2);
const outputIndex = process.argv.indexOf("--out");
if (outputIndex >= 0 && process.argv[outputIndex + 1]) {
  await writeFile(process.argv[outputIndex + 1], json, "utf8");
} else {
  process.stdout.write(json);
}
