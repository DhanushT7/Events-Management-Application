// src/pages/TeamMembers.jsx
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Avatar,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import { Groups, PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/* --- Paste your teamMembers array here or import from a shared file --- */
const teamMembers = [
  { name: 'Siva Sankar S', rollNo: '2023103082', batch: '2023-27', photo: '' },
  { name: 'Dhanush T', rollNo: '2023103507', batch: '2023-27', photo: '' },
  { name: 'Viswa S', rollNo: '2023103564', batch: '2023-27', photo: '' },
  { name: 'Kathir Kalidass B', rollNo: '2023103546', batch: '2023-27', photo: '' },
  { name: 'Magesh Gumar M', rollNo: '2023103612', batch: '2023-27', photo: '' },
];

const TeamMembers = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#120707', color: '#fff', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Groups sx={{ fontSize: 36, color: '#e9c46a' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Team Members
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/')}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            Back to Home
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {teamMembers.map((m) => (
            <Grid item key={m.rollNo} xs={12} sm={6} md={4} lg={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Avatar
                      sx={{ width: 88, height: 88, boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}
                      src={m.photo || undefined}
                      alt={m.name}
                    >
                      {!m.photo && <PhotoCamera />}
                    </Avatar>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {m.name}
                  </Typography>

                  <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                    Roll: {m.rollNo}
                  </Typography>

                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Batch: {m.batch}
                  </Typography>

                  <Stack direction="row" justifyContent="center" spacing={1} mt={2}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                      onClick={() => {
                        // Example placeholder: open a modal with details or link to profile
                        // Replace blocking alert with non-blocking notification via notistack
                        // Assumes a SnackbarProvider is present at app root
                        // If this component lacks access to notistack, consider lifting to a parent handler
                        window.dispatchEvent(new CustomEvent('app:notify', {
                          detail: {
                            message: `${m.name}\nRoll: ${m.rollNo}\nBatch: ${m.batch}`,
                            options: { variant: 'info' }
                          }
                        }));
                      }}
                    >
                      View
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TeamMembers;
