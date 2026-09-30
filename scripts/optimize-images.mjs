/**
 * Converts raster images (png/jpg) to WebP and caps their width.
 *
 * Usage: node scripts/optimize-images.mjs <inputDir> <outputDir> [maxWidth=1600] [quality=80]
 * Per-file width override: append `@<width>` to the base name, e.g. `keychain@500.png`
 * (the suffix is stripped from the output name).
 */
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const [inputDir, outputDir, maxWidthArg = '1600', qualityArg = '80'] = process.argv.slice(2);

if (!inputDir || !outputDir) {
  console.error(
    'Usage: node scripts/optimize-images.mjs <inputDir> <outputDir> [maxWidth] [quality]',
  );
  process.exit(1);
}

const defaultWidth = Number(maxWidthArg);
const quality = Number(qualityArg);

await mkdir(outputDir, { recursive: true });

for (const file of await readdir(inputDir)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue;

  const { name } = parse(file);
  const [baseName, widthOverride] = name.split('@');
  const width = widthOverride ? Number(widthOverride) : defaultWidth;
  const target = join(outputDir, `${baseName}.webp`);

  const info = await sharp(join(inputDir, file))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(target);

  const before = (await stat(join(inputDir, file))).size;
  console.log(
    `${file} -> ${baseName}.webp  ${info.width}x${info.height}  ${(before / 1024).toFixed(0)}KB -> ${(info.size / 1024).toFixed(0)}KB`,
  );
}
