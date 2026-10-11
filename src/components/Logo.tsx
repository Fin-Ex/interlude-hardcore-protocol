import Box from '@mui/material/Box';

// Логотип подхватывается сам: достаточно положить файл src/assets/logo.(svg|png|webp|jpg).
const logos = import.meta.glob<string>('../assets/logo.{svg,png,webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const logoUrl = Object.values(logos)[0];

const HEIGHT = 44;
const ASPECT_RATIO = 0.86;

export function Logo() {
  const size = { height: HEIGHT, width: Math.round(HEIGHT * ASPECT_RATIO), flexShrink: 0 };
  if (logoUrl) {
    return <Box component="img" src={logoUrl} alt="Interlude Hardcore" sx={{ ...size, objectFit: 'contain' }} />;
  }
  return <Box aria-hidden sx={{ ...size, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }} />;
}
