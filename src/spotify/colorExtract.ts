import { AlbumColors } from "../store";

interface Bucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.round(Math.max(0, Math.min(255, v)))
    .toString(16)
    .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function luminance(r: number, g: number, b: number): number {
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) {
      console.warn("[Osutify] image fetch HTTP", res.status, url);
      return null;
    }
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("[Osutify] image fetch threw", e);
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function extractColorsFromImage(
  imageUrl: string,
): Promise<AlbumColors | null> {
  console.log("[Osutify] extract start", imageUrl);

  let src: string = imageUrl;
  const dataUrl = await fetchAsDataUrl(imageUrl);
  if (dataUrl) {
    src = dataUrl;
    console.log("[Osutify] image fetched as dataUrl");
  } else {
    console.warn("[Osutify] dataUrl fetch failed, trying direct img load");
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(src);
  } catch (e) {
    console.warn("[Osutify] img load failed", e);
    return null;
  }
  console.log("[Osutify] img loaded", img.naturalWidth, "x", img.naturalHeight);

  const size = 60;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    console.warn("[Osutify] no 2d ctx");
    return null;
  }
  try {
    ctx.drawImage(img, 0, 0, size, size);
  } catch (e) {
    console.warn("[Osutify] drawImage failed", e);
    return null;
  }

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch (e) {
    console.warn("[Osutify] getImageData failed (CORS taint?)", e);
    return null;
  }

  const buckets = new Map<number, Bucket>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 15) continue;
    if (min > 245) continue;

    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const ex = buckets.get(key);
    if (ex) {
      ex.r += r;
      ex.g += g;
      ex.b += b;
      ex.count++;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  console.log("[Osutify] palette buckets", buckets.size);
  if (buckets.size === 0) return null;

  const palette = Array.from(buckets.values())
    .map((b) => ({
      r: b.r / b.count,
      g: b.g / b.count,
      b: b.b / b.count,
      count: b.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);

  const scored = palette.map((c) => ({
    ...c,
    lum: luminance(c.r, c.g, c.b),
    sat: saturation(c.r, c.g, c.b),
  }));

  const vibrant =
    [...scored]
      .filter((c) => c.lum > 40 && c.lum < 220)
      .sort((a, b) => b.sat * Math.sqrt(b.count) - a.sat * Math.sqrt(a.count))[0] ??
    scored[0];

  const dark =
    [...scored]
      .filter((c) => c.sat > 0.1)
      .sort((a, b) => a.lum - b.lum)[0] ?? scored[scored.length - 1];

  const light =
    [...scored]
      .filter((c) => c.sat > 0.1)
      .sort((a, b) => b.lum - a.lum)[0] ?? scored[0];

  const prominent = scored[0];

  const desaturated = [...scored].sort((a, b) => a.sat - b.sat)[0] ?? scored[0];

  const result: AlbumColors = {
    vibrant: rgbToHex(vibrant.r, vibrant.g, vibrant.b),
    darkVibrant: rgbToHex(dark.r, dark.g, dark.b),
    lightVibrant: rgbToHex(light.r, light.g, light.b),
    prominent: rgbToHex(prominent.r, prominent.g, prominent.b),
    desaturated: rgbToHex(desaturated.r, desaturated.g, desaturated.b),
  };
  console.log("[Osutify] extracted colors", result);
  return result;
}
