
export const colors = {
  red: '#E8533A',
  gold: '#C47F17',
  green: '#2D9E6B',
  blue: '#3B7DD8',
  purple: '#8B5CF6',
  bg: '#08090A',
  bg2: '#0E0F11',
  bg3: '#141618',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.09)',
  border2: 'rgba(255,255,255,0.15)',
  text: '#F0EDE8',
  textMuted: 'rgba(240,237,232,0.5)',
  textDim: 'rgba(240,237,232,0.28)',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8, color: colors.text },
  h2: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: colors.text },
  h3: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, color: colors.text },
  body: { fontSize: 14, fontWeight: '400', color: colors.text },
  bodyMd: { fontSize: 14, fontWeight: '600', color: colors.text },
  small: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '600', color: colors.textDim },
  label: { fontSize: 10, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.6 },
  price: { fontSize: 18, fontWeight: '900', color: colors.red, letterSpacing: -0.4 },
  mono: { fontFamily: 'monospace', fontSize: 12 },
};
