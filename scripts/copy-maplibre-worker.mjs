// MapLibre 6 tải web worker bằng đường dẫn tương đối mà Turbopack không đóng gói được,
// nên chép file worker vào public/ và chỉ đường cho MapLibre bằng setWorkerUrl().
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/maplibre", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre/maplibre-gl-worker.mjs");
