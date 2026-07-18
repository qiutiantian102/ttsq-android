// Shared visual theme for the TTSQ React Native app.
export const theme = {
  accent: '#7c3aed',
  accentDark: '#5b21b6',
  bg: '#0f0f14',
  bgAlt: '#171722',
  card: '#1c1c28',
  border: '#2a2a3a',
  text: '#f4f4f8',
  textDim: '#a0a0b0',
  danger: '#ef4444',
  success: '#22c55e',
  radius: 14,
};

export const styles = {
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  input: {
    backgroundColor: theme.bgAlt,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 15,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 16,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800' as const,
  },
  subtitle: {
    color: theme.textDim,
    fontSize: 14,
  },
} as const;
