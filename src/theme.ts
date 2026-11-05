// Same palette as the Project I Android app so both versions look identical.
export const colors = {
  primary: '#6C5CE7',
  primaryDark: '#5849C2',
  primaryLight: '#EDEBFC',
  bgScreen: '#F7F7FB',
  bgCard: '#FFFFFF',
  textPrimary: '#1E1E2D',
  textSecondary: '#8A8A9E',
  textOnPrimary: '#FFFFFF',
  border: '#E5E5EF',
  success: '#1FA97A',
  successBg: '#E4F9F1',
  danger: '#E0483B',
  cardNavy: '#1E2749',
};

export const categoryStyles: Record<string, { bg: string; text: string }> = {
  Academic: { bg: '#E8F0FE', text: '#3B6FE0' },
  Facilities: { bg: '#FFF1E0', text: '#E08A2C' },
  'Student Life': { bg: '#FCE8F3', text: '#D6368E' },
  Events: { bg: '#E4F9F1', text: '#1FA97A' },
};

export const radius = { sm: 10, md: 12, lg: 16, pill: 20 };
