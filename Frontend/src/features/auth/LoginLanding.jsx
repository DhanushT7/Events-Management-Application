import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
  Tooltip,
  useTheme,
  SvgIcon,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Groups,
  School,
  EmojiEvents,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
} from '@mui/icons-material';

/**
 * Enhanced LoginLanding
 * - Role-specific gradients, ribbons and badges
 * - Equal card heights and consistent layout
 * - Hover/focus micro-interactions
 * - Accessibility: aria attributes, keyboard focus styles
 * - Tooltips for actions and roles
 * - Optional "Learn more" expansion per card (compact by default)
 *
 * Drop into your project — requires @mui/material and react-router-dom.
 */

/* --- Styled helpers --- */
const AccentStrip = styled('div')(({ theme, accent }) => ({
  height: 6,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  background: `linear-gradient(90deg, ${accent}22, ${accent}66)`,
  margin: '0 -16px 12px -16px',
}));

/* subtle floating animation used on mount */
const floatKeyframes = {
  '@keyframes floatUp': {
    '0%': { transform: 'translateY(6px)', opacity: 0 },
    '60%': { transform: 'translateY(0)', opacity: 1 },
    '100%': { transform: 'translateY(0)', opacity: 1 },
  },
};

/* small watermark svg (university / dept vibe) */
const UniversityWatermark = (props) => (
  <SvgIcon viewBox="0 0 200 200" sx={{ width: 120, height: 120, opacity: 0.06 }} {...props}>
    <circle cx="100" cy="70" r="42" />
    <path d="M48 150c22-28 60-36 104 0v10H48v-10z" />
  </SvgIcon>
);

/* Roles definition (accent used for color & gradient) */
const roleCards = [
  {
    title: 'Administrator',
    role: 'admin',
    blurb: 'Full system control — users, policies, and security.',
    accent: '#f7c948',
    icon: <Shield fontSize="large" />,
    allowRegister: false,
    ribbon: 'SYSTEM',
  },
  {
    title: 'Head of Department',
    role: 'hod',
    blurb: 'Approve proposals, oversee budgets, and review department events.',
    accent: '#7ad7f0',
    icon: <School fontSize="large" />,
    allowRegister: false,
    ribbon: 'HOD',
  },
  {
    title: 'Coordinator',
    role: 'coordinator',
    blurb: 'Create events, publish brochures, manage certificates, and participants.',
    accent: '#8de28f',
    icon: <Groups fontSize="large" />,
    allowRegister: false,
    ribbon: 'COORD',
  },
  {
    title: 'Participant',
    role: 'participant',
    blurb: 'Join events, submit feedback, and download your certificates.',
    accent: '#f48fb1',
    icon: <EmojiEvents fontSize="large" />,
    allowRegister: false,
    ribbon: 'USER',
  },
];

const LoginLanding = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  /* compute readable text color over accent */
  const getContrastText = (hex) => {
    // simple luminance calc to pick black/white contrast
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#fff';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        ...floatKeyframes,
        background:
          'radial-gradient(circle at 10% 10%, rgba(89,109,185,0.08), transparent 25%), radial-gradient(circle at 92% 8%, rgba(255,168,88,0.08), transparent 28%), linear-gradient(135deg, #f7fafc 0%, #eef2f7 40%, #e8eef7 100%)',
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4 },
      }}
      aria-label="Login landing page"
    >
      {/* Watermark decorative element (visually subtle) */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: -20, md: 32 },
          top: { xs: -20, md: 40 },
          transform: 'rotate(-12deg)',
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <UniversityWatermark />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
          <Chip
            label="Choose your workspace"
            sx={{
              bgcolor: '#eef2ff',
              color: '#4338ca',
              border: '1px solid #c7d2fe',
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
            aria-hidden
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: 0.2,
              color: '#0b1220',
            }}
          >
            Sign in to your role
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 760, opacity: 0.9 }}>
            Pick the portal that matches your responsibility. Each role gets a tailored dashboard with
            the tools you need.
          </Typography>
        </Stack>

        <Grid
          container
          columnSpacing={{ xs: 2, sm: 3, md: 4 }}
          rowSpacing={{ xs: 2.5, sm: 3 }}
          justifyContent="center"
          alignItems="stretch"
          sx={{ maxWidth: 1100, mx: 'auto' }}
        >
          {roleCards.map((card, idx) => {
            const contrast = getContrastText(card.accent);
            const accentGradient = `linear-gradient(135deg, ${card.accent}, ${card.accent}88)`;

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={card.role}
                sx={{
                  display: 'flex',
                }}
              >
                <Card
                  elevation={0}
                  role="group"
                  aria-labelledby={`role-${card.role}-title`}
                  sx={{
                    width: '100%',
                    borderRadius: 3,
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#fff',
                    border: `1px solid ${card.accent}20`,
                    boxShadow: '0 10px 28px rgba(2,6,23,0.06)',
                    transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',
                    '&:hover, &:focus-within': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 22px 48px rgba(2,6,23,0.12)',
                      borderColor: `${card.accent}aa`,
                    },
                    /* accessible focus outline for keyboard users */
                    '&:focus-within': { outline: `3px solid ${card.accent}18`, outlineOffset: 6 },
                  }}
                >
                  {/* top accent strip */}
                  <AccentStrip accent={card.accent} />

                  {/* ribbon / corner label */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 18,
                      top: { xs: 86, sm: 92 },
                      transform: 'skewX(-12deg)',
                      px: 1.25,
                      py: 0.5,
                      bgcolor: `${card.accent}14`,
                      color: card.accent,
                      border: `1px solid ${card.accent}33`,
                      fontWeight: 800,
                      borderRadius: 1,
                      display: 'inline-block',
                      fontSize: 11,
                      pointerEvents: 'none',
                    }}
                    aria-hidden
                  >
                    {card.ribbon}
                  </Box>

                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: 200, // keeps cards equal height
                    }}
                  >
                    <Box
                      sx={{
                        width: 76,
                        height: 76,
                        borderRadius: 2.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: `${card.accent}14`,
                        color: card.accent,
                        border: `1px solid ${card.accent}44`,
                        flexShrink: 0,
                        boxShadow: `inset 0 -6px 18px ${card.accent}10`,
                        transition: 'transform .22s ease',
                        '& svg': { fontSize: 34 },
                      }}
                      aria-hidden
                    >
                      {card.icon}
                    </Box>

                    <Stack spacing={0.4} alignItems="center">
                      <Typography
                        id={`role-${card.role}-title`}
                        variant="h6"
                        sx={{ fontWeight: 900, letterSpacing: 0.2 }}
                      >
                        {card.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 260 }}>
                        {card.blurb}
                      </Typography>
                    </Stack>

                    {/* subtle role details / hint */}
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, color: 'text.secondary', opacity: 0.9 }}
                      aria-hidden
                    >
                      {card.allowRegister ? 'Self-registration allowed' : 'Managed by admin only'}
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1,
                      p: { xs: 1.25, sm: 1.5 },
                    }}
                  >
                    <Tooltip title={`Sign in as ${card.title}`} arrow>
                      <Button
                        startIcon={<LoginIcon />}
                        onClick={() => navigate(`/login/${card.role}`)}
                        variant="contained"
                        aria-label={`Login as ${card.title}`}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 800,
                          borderRadius: 999,
                          bgcolor: card.accent,
                          color: contrast,
                          px: 2.2,
                          py: 0.8,
                          minWidth: 96,
                          boxShadow: `0 6px 18px ${card.accent}22`,
                          '&:hover': { bgcolor: `${card.accent}dd` },
                        }}
                      >
                        Login
                      </Button>
                    </Tooltip>

                    {card.allowRegister ? (
                      <Tooltip title={`Create an account as ${card.title}`} arrow>
                        <Button
                          startIcon={<RegisterIcon />}
                          onClick={() => navigate(`/register/${card.role}`)}
                          variant="outlined"
                          aria-label={`Register as ${card.title}`}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            borderRadius: 999,
                            color: '#0f172a',
                            borderColor: '#e6eef7',
                            px: 2.2,
                            py: 0.78,
                            minWidth: 110,
                            '&:hover': {
                              borderColor: card.accent,
                              color: card.accent,
                              background: `${card.accent}12`,
                            },
                          }}
                        >
                          Register
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Registration disabled for this role" arrow>
                        <span>
                          {/* wrap disabled button in span to make Tooltip work with disabled */}
                          <Button
                            startIcon={<RegisterIcon />}
                            disabled
                            variant="outlined"
                            aria-label={`Register disabled for ${card.title}`}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 800,
                              borderRadius: 999,
                              color: '#94a3b8',
                              borderColor: '#f1f5f9',
                              px: 2.2,
                              py: 0.78,
                              minWidth: 110,
                              cursor: 'not-allowed',
                            }}
                          >
                            Register
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* small footer hint area */}
        <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Having trouble? Contact the department event admin or use the "Forgot password" link on the login page.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginLanding;
