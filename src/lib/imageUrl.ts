type ImageSize = 'thumb' | 'card' | 'full';

const WIDTH: Record<ImageSize, number> = {
  thumb: 200,
  card: 350,
  full: 600,
};

const STORAGE_OBJECT = '/storage/v1/object/public/';
const STORAGE_RENDER = '/storage/v1/render/image/public/';

export function getCardImageUrl(
  url: string | null | undefined,
  size: ImageSize,
): string | null | undefined {
  if (!url) return url;
  const idx = url.indexOf(STORAGE_OBJECT);
  if (idx === -1) return url;
  const base = url.slice(0, idx);
  const path = url.slice(idx + STORAGE_OBJECT.length);
  return `${base}${STORAGE_RENDER}${path}?width=${WIDTH[size]}&quality=75&resize=contain`;
}
