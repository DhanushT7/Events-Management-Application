import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, XAxis, YAxis, Bar, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#8884D8','#82ca9d','#a4de6c'];

export default function TemplateAnalysis({ eventId, token }) {
  const [analysis, setAnalysis] = useState(null);
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchAnalysis = async () => {
    const res = await fetch(`${API}/coordinator/template-analysis/${eventId}`, { headers: authHeader });
    const data = await res.json();
    setAnalysis(data.questionAnalysis || {});
  };

  useEffect(() => { if (eventId) fetchAnalysis(); }, [eventId]);

  if (!analysis) return <div>Loading...</div>;

  return (
    <Box>
      {Object.keys(analysis).map((qid) => {
        const q = analysis[qid];
        if (q.type === 'rating') {
          const distData = Object.keys(q.distribution).map(k => ({ name: k, value: q.distribution[k] }));
          return (
            <Card key={qid} sx={{ mb:2 }}>
              <CardContent>
                <Typography variant="h6">{q.questionText} — Avg: {Number(q.average).toFixed(2)}</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={distData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {distData.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        }
        if (q.type === 'radio' || q.type === 'dropdown' || q.type === 'checkbox') {
          const pieData = Object.keys(q.distribution).map(k => ({ name: k, value: q.distribution[k] }));
          return (
            <Card key={qid} sx={{ mb:2 }}>
              <CardContent>
                <Typography variant="h6">{q.questionText}</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                      {pieData.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        }
        if (q.type === 'text') {
          return (
            <Card key={qid} sx={{ mb:2 }}>
              <CardContent>
                <Typography variant="h6">{q.questionText} — {q.count} responses</Typography>
                {(q.responses || []).slice(0, 10).map((r, i) => (
                  <Typography key={i} variant="body2">• {r}</Typography>
                ))}
              </CardContent>
            </Card>
          );
        }
        return null;
      })}
    </Box>
  );
}
