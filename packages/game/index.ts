import "./ui/globalStyle";
import "./controls";
import { render } from "./renderer";
import { mat4, quat, vec3 } from "gl-matrix";
import { geometryPromise } from "./renderer/geometries/model/model";
import { setEntityColorSchema } from "./renderer/geometries/model/colorSchema";
import { hslToRgb } from "./utils/color";
import { triceratops } from "./entities/triceratops";
import {
  MAX_ENTITY,
  Skeleton,
  createSkeleton,
} from "./renderer/geometries/model/skeleton";
import { canvas } from "./renderer/canvas";
import { getRayFromScreen, getScreenX, getScreenY } from "./systems/raycast";
import { sphereRayCollision } from "./systems/capsuleCollision";
import { triceratopsRayCollision } from "./systems/triceratopsCollisions";
import { fruits } from "./entities/fruits";
import { raycastScene } from "./systems/raycastScene";

let t = 0;

const loop = () => {
  t += 1 / 60;

  const e = triceratops[0];

  for (const [
    i,
    { eye0_direction, eye1_direction, head_direction, tail_direction },
  ] of triceratops.entries()) {
    quat.fromEuler(
      eye0_direction,
      0,
      Math.sin(t * 2) * 30,
      Math.sin(t * 2.6 + 1) * 20
    );
    quat.fromEuler(
      eye1_direction,
      0,
      Math.sin(-t * 3) * 36,
      Math.sin(t * 2.3 + 1) * 28
    );

    quat.fromEuler(head_direction, 0, Math.sin(t * 3 + i) * 20, 0);
    quat.fromEuler(tail_direction, 0, Math.sin(t * 3.3 + i) * 20, 0);
  }

  e.feet[0] = Math.sin(t * 4);
  e.feet[1] = Math.sin(t * 4 + Math.PI);
  e.feet[2] = Math.sin(t * 4 + Math.PI);
  e.feet[3] = Math.sin(t * 4);

  update();

  render();
  requestAnimationFrame(loop);
};

geometryPromise.then(() => requestAnimationFrame(loop));

for (let i = MAX_ENTITY; i--; ) {
  const h = i / MAX_ENTITY;

  const base: [number, number, number] = [0, 0, 0];
  hslToRgb(base, h, 0.7, 0.61);

  const baseDot: [number, number, number] = [1, 1, 0];
  hslToRgb(baseDot, (h + 0.02) % 1, 0.73, 0.45);

  const stripe = base.slice() as [number, number, number];
  const stripeDot = baseDot.slice() as [number, number, number];

  if (i % 2) {
    hslToRgb(stripe, (h + 0.4) % 1, 0.7, 0.61);
    hslToRgb(stripeDot, (h + 0.404) % 1, 0.73, 0.45);
  }

  const belly: [number, number, number] = [0, 0, 0];
  hslToRgb(belly, (h + 0.1) % 1, 1, 0.89);

  setEntityColorSchema(
    i,
    [
      //
      base, // 0
      baseDot, // 1

      belly, // 2

      stripe, // 3
      stripeDot, // 4

      [0.9, 0.9, 0.8], // 5
      [0.4, 0.4, 0.5], // 6
    ].flat()
  );
}

for (let k = 50; k--; ) {
  const t = { ...createSkeleton(), target: [0, 0] as [number, number] };

  let d = 0;
  while (d < 3 || d > 10) {
    t.origin[0] = (Math.random() - 0.5) * 20;
    t.origin[2] = (Math.random() - 0.5) * 20;

    d = Math.hypot(t.origin[0], t.origin[2]);
  }

  quat.fromEuler(t.direction, 0, Math.random() * 360, 0);

  triceratops.push(t);
}

quat.fromEuler(triceratops[0].direction, 0, 145, 0);
triceratops[0].origin[0] = 0;
triceratops[0].origin[2] = 0;

const c = document.createElement("canvas");
c.width = canvas.width;
c.height = canvas.height;
c.style.position = "absolute";
c.style.top = "0";
c.style.left = "0";
c.style.zIndex = "10";
c.style.pointerEvents = "none";
document.body.appendChild(c);

const ctx = c.getContext("2d")!;

const o = [] as any as vec3;
const v = [] as any as vec3;

canvas.addEventListener("mousemove", ({ pageX, pageY }) => {
  getRayFromScreen(o, v, getScreenX(pageX), getScreenY(pageY));

  const tri = triceratops[0];
  sphereRayCollision(tri.origin, 1.5, o, v);
});

const update = () => {
  return;

  ctx.clearRect(0, 0, 99999, 99999);

  const h = 3;

  for (let x = 0; x < c.width; x += h)
    for (let y = 0; y < c.height; y += h) {
      getRayFromScreen(o, v, getScreenX(x), getScreenY(y));
      const s = raycastScene(o, v);

      if (!s) continue;

      ctx.beginPath();
      ctx.fillStyle = `hsla( ${s.i * 13 * 30},80%,60%,0.93 )`;
      const l = h;
      ctx.fillRect(x - l / 2, y - l / 2, l, l);
    }
};
