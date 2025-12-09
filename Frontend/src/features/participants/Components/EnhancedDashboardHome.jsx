import React, { useState, useEffect, useMemo } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Grid,
	Button,
	Avatar,
	Chip,
	LinearProgress,
	Paper,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Alert,
	CircularProgress,
	Badge
} from '@mui/material';
import {
	TrendingUp as TrendingUpIcon,
	Event as EventIcon,
	EmojiEvents as CertificateIcon,
	Feedback as FeedbackIcon,
	CheckCircle as CheckCircleIcon,
	Star as StarIcon,
	CalendarToday as CalendarIcon,
	Assignment as AssignmentIcon,
	Refresh as RefreshIcon,
	ArrowForward as ArrowForwardIcon,
	Timeline as TimelineIcon,
	Analytics as AnalyticsIcon
} from '@mui/icons-material';
import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	LineChart,
	Line
} from 'recharts';
import eventLogo from '/event_logo.png';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#6366F1'];

const EnhancedDashboardHome = ({ userStats, onRefresh, onNavigate }) => {
	const [recentActivity, setRecentActivity] = useState([]);
	const [upcomingEvents, setUpcomingEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
	const participantId = userInfo._id;
	const userName = userInfo.name || 'Participant';

	const stats = useMemo(() => ({
		totalEvents: userStats?.totalEvents ?? 0,
		attendedEvents: userStats?.attendedEvents ?? 0,
		certificates: userStats?.certificates ?? 0,
		pendingFeedback: userStats?.pendingFeedback ?? 0
	}), [userStats]);

	const achievements = useMemo(() => {
		const earned = [];

		if (stats.totalEvents >= 1) {
			earned.push({
				title: 'Event Participant',
				description: 'Registered for your first event',
				icon: <EventIcon />,
				color: 'primary'
			});
		}

		if (stats.attendedEvents >= 1) {
			earned.push({
				title: 'Active Attendee',
				description: 'Attended your first event',
				icon: <CheckCircleIcon />,
				color: 'success'
			});
		}

		if (stats.certificates >= 1) {
			earned.push({
				title: 'Certificate Holder',
				description: 'Earned your first certificate',
				icon: <CertificateIcon />,
				color: 'warning'
			});
		}

		if (stats.attendedEvents >= 5) {
			earned.push({
				title: 'Dedicated Learner',
				description: 'Attended 5 or more events',
				icon: <StarIcon />,
				color: 'secondary'
			});
		}

		if (stats.certificates >= 3) {
			earned.push({
				title: 'Certificate Collector',
				description: 'Earned 3 or more certificates',
				icon: <TrendingUpIcon />,
				color: 'info'
			});
		}

		return earned;
	}, [stats]);

	const progressData = useMemo(() => ([
		{ name: 'Registered', value: stats.totalEvents },
		{ name: 'Attended', value: stats.attendedEvents },
		{ name: 'Certificates', value: stats.certificates },
		{ name: 'Pending Feedback', value: stats.pendingFeedback }
	]), [stats]);

	const hasProgressData = useMemo(() => progressData.some((item) => item.value > 0), [progressData]);

	const metricCards = useMemo(() => ([
		{
			id: 'totalEvents',
			label: 'Total Events',
			value: stats.totalEvents,
			icon: EventIcon,
			color: 'primary.main',
			helper: 'All registrations'
		},
		{
			id: 'attendedEvents',
			label: 'Attended',
			value: stats.attendedEvents,
			icon: CheckCircleIcon,
			color: 'success.main',
			helper: 'Verified attendance'
		},
		{
			id: 'certificates',
			label: 'Certificates',
			value: stats.certificates,
			icon: CertificateIcon,
			color: 'warning.main',
			helper: 'Downloads ready'
		},
		{
			id: 'pendingFeedback',
			label: 'Pending Feedback',
			value: stats.pendingFeedback,
			icon: FeedbackIcon,
			color: 'info.main',
			helper: 'Action required'
		}
	]), [stats]);

	const fetchDashboardData = async () => {
		if (!participantId) return;
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

			const activityResponse = await fetch(`${baseUrl}/participant/recent-activity/${participantId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (activityResponse.ok) {
				const activityData = await activityResponse.json();
				setRecentActivity(activityData.slice(0, 7));
			}

			const eventsResponse = await fetch(`${baseUrl}/participant/events`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (eventsResponse.ok) {
				const eventsData = await eventsResponse.json();
				const upcoming = eventsData
					.filter((event) => new Date(event.startDate) > new Date())
					.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
					.slice(0, 3);
				setUpcomingEvents(upcoming);
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [participantId]);

	const completionRate = stats.totalEvents > 0
		? Math.round((stats.certificates / stats.totalEvents) * 100)
		: 0;

	const attendanceRate = stats.totalEvents > 0
		? Math.round((stats.attendedEvents / stats.totalEvents) * 100)
		: 0;

	const heroHighlights = useMemo(() => ([
		{
			id: 'attendanceRate',
			label: 'Attendance Rate',
			value: `${attendanceRate}%`,
			helper: 'Consistent presence',
			icon: <TimelineIcon fontSize="small" />
		},
		{
			id: 'completionRate',
			label: 'Certificate Completion',
			value: `${completionRate}%`,
			helper: 'Certificates unlocked',
			icon: <CertificateIcon fontSize="small" />
		},
		{
			id: 'feedback',
			label: 'Pending Feedback',
			value: stats.pendingFeedback,
			helper: 'Complete to unlock rewards',
			icon: <FeedbackIcon fontSize="small" />
		}
	]), [attendanceRate, completionRate, stats.pendingFeedback]);

	const activityTimeline = useMemo(() => {
		if (!recentActivity.length) return [];
		const buckets = recentActivity.reduce((acc, activity) => {
			if (!activity?.date) return acc;
			const day = new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
			acc[day] = (acc[day] || 0) + 1;
			return acc;
		}, {});
		return Object.entries(buckets).map(([name, value]) => ({ name, value }));
	}, [recentActivity]);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto' }}>
			<Box
				sx={{
					mb: 3,
					borderRadius: 4,
					p: { xs: 3, md: 5 },
					position: 'relative',
					overflow: 'hidden',
					color: '#fff',
					background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #9333ea 100%)'
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						inset: 0,
						background: 'radial-gradient(circle at top right, rgba(255,255,255,0.35), transparent 55%)',
						opacity: 0.4
					}}
				/>
				<Grid container spacing={4} alignItems="center" sx={{ position: 'relative' }}>
					<Grid item xs={12} md={8}>
						<Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
							<Box
								component="img"
								src={eventLogo}
								alt="Event logo"
								sx={{ width: 120, maxWidth: '45%', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))' }}
							/>
							<Box>
								<Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
									Participants Hub
								</Typography>
								<Typography variant="h4" fontWeight={700} gutterBottom>
									Welcome back, {userName}!
								</Typography>
								<Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
									Track your learning journey, certificates, and upcoming milestones in one place.
								</Typography>
							</Box>
						</Box>
						<Box display="flex" flexWrap="wrap" gap={2} mt={3}>
							{heroHighlights.map((highlight) => (
								<Paper
									key={highlight.id}
									elevation={0}
									sx={{
										px: 2.5,
										py: 1.5,
										borderRadius: 3,
										bgcolor: 'rgba(15,23,42,0.45)',
										backdropFilter: 'blur(8px)',
										color: '#fff',
										minWidth: 150
									}}
								>
									<Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.85 }}>
										{highlight.icon}
										{highlight.label}
									</Typography>
									<Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
										{highlight.value}
									</Typography>
									<Typography variant="caption" sx={{ opacity: 0.75 }}>
										{highlight.helper}
									</Typography>
								</Paper>
							))}
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', md: 'flex-end' }} gap={1.5}>
							<Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.25)', fontSize: '2rem' }}>
								{userName.charAt(0).toUpperCase()}
							</Avatar>
							<Button
								variant="contained"
								startIcon={<RefreshIcon />}
								onClick={onRefresh}
								sx={{ bgcolor: '#fff', color: '#0f172a', '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' } }}
							>
								Refresh Data
							</Button>
							<Button
								variant="outlined"
								color="inherit"
								startIcon={<AnalyticsIcon />}
								onClick={() => onNavigate('events')}
								sx={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}
							>
								Explore Events
							</Button>
						</Box>
					</Grid>
				</Grid>
			</Box>

			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Grid container spacing={2}>
						{metricCards.map((card) => {
							const Icon = card.icon;
							return (
								<Grid item xs={6} sm={3} key={card.id}>
									<Card sx={{ textAlign: 'center', p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
										<Avatar sx={{ mx: 'auto', mb: 1, bgcolor: card.color, color: '#fff' }}>
											<Icon />
										</Avatar>
										<Typography variant="h4" fontWeight="bold">
											{card.value}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{card.label}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{card.helper}
										</Typography>
									</Card>
								</Grid>
							);
						})}
					</Grid>

					<Card sx={{ mt: 3 }}>
						<CardContent>
							<Box display="flex" alignItems="center" gap={1} mb={2}>
								<AnalyticsIcon color="primary" />
								<Typography variant="h6">Learning Insights</Typography>
							</Box>
							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
									<Typography variant="subtitle2" gutterBottom>
										Completion Rates
									</Typography>
									<Box sx={{ mb: 2 }}>
										<Box display="flex" justifyContent="space-between" mb={1}>
											<Typography variant="body2">Attendance Rate</Typography>
											<Typography variant="body2">{attendanceRate}%</Typography>
										</Box>
										<LinearProgress variant="determinate" value={attendanceRate} sx={{ height: 8, borderRadius: 4 }} />
									</Box>
									<Box sx={{ mb: 3 }}>
										<Box display="flex" justifyContent="space-between" mb={1}>
											<Typography variant="body2">Certificate Completion</Typography>
											<Typography variant="body2">{completionRate}%</Typography>
										</Box>
										<LinearProgress variant="determinate" value={completionRate} color="success" sx={{ height: 8, borderRadius: 4 }} />
									</Box>
									<ResponsiveContainer width="100%" height={160}>
										<BarChart data={progressData}>
											<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
											<XAxis dataKey="name" stroke="#94a3b8" />
											<YAxis allowDecimals={false} stroke="#94a3b8" />
											<RechartsTooltip />
											<Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								</Grid>
								<Grid item xs={12} md={6}>
									<Typography variant="subtitle2" gutterBottom>
										Journey Breakdown
									</Typography>
									{hasProgressData ? (
										<ResponsiveContainer width="100%" height={220}>
											<PieChart>
												<Pie data={progressData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
													{progressData.map((entry, index) => (
														<Cell key={`progress-${entry.name}`} fill={COLORS[index % COLORS.length]} />
													))}
												</Pie>
												<RechartsTooltip />
											</PieChart>
										</ResponsiveContainer>
									) : (
										<Typography color="text.secondary">Participate in more events to unlock visual insights.</Typography>
									)}
								</Grid>
							</Grid>
						</CardContent>
					</Card>

					<Card sx={{ mt: 3 }}>
						<CardContent>
							<Box display="flex" alignItems="center" gap={1} mb={2}>
								<TimelineIcon color="primary" />
								<Typography variant="h6">Engagement Timeline</Typography>
							</Box>
							{activityTimeline.length ? (
								<ResponsiveContainer width="100%" height={240}>
									<LineChart data={activityTimeline}>
										<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
										<XAxis dataKey="name" stroke="#94a3b8" />
										<YAxis allowDecimals={false} stroke="#94a3b8" />
										<RechartsTooltip />
										<Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
									</LineChart>
								</ResponsiveContainer>
							) : (
								<Typography color="text.secondary">Recent activity will appear here once you attend or register for events.</Typography>
							)}
						</CardContent>
					</Card>

					<Card sx={{ mt: 3 }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Quick Actions
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6} md={3}>
									<Button fullWidth variant="contained" startIcon={<EventIcon />} onClick={() => onNavigate('events')} sx={{ py: 1.5 }}>
										Browse Events
									</Button>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Button fullWidth variant="outlined" startIcon={<FeedbackIcon />} onClick={() => onNavigate('feedback')} sx={{ py: 1.5 }}>
										<Badge badgeContent={stats.pendingFeedback} color="error" overlap="rectangular">
											Submit Feedback
										</Badge>
									</Button>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Button fullWidth variant="outlined" startIcon={<CertificateIcon />} onClick={() => onNavigate('certificates')} sx={{ py: 1.5 }}>
										My Certificates
									</Button>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Button fullWidth variant="outlined" startIcon={<AssignmentIcon />} onClick={() => onNavigate('myevents')} sx={{ py: 1.5 }}>
										My Events
									</Button>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ mb: 3 }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Achievements
							</Typography>
							{achievements.length === 0 ? (
								<Typography color="text.secondary">Start participating in events to earn achievements!</Typography>
							) : (
								<List dense>
									{achievements.map((achievement, index) => (
										<ListItem key={index} sx={{ px: 0 }}>
											<ListItemIcon>
												<Avatar sx={{ bgcolor: `${achievement.color}.main`, width: 32, height: 32 }}>
													{achievement.icon}
												</Avatar>
											</ListItemIcon>
											<ListItemText primary={achievement.title} secondary={achievement.description} />
										</ListItem>
									))}
								</List>
							)}
						</CardContent>
					</Card>

					<Card sx={{ mb: 3 }}>
						<CardContent>
							<Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
								<Typography variant="h6">Upcoming Events</Typography>
								<Chip label={`${upcomingEvents.length} scheduled`} size="small" color="primary" />
							</Box>
							{upcomingEvents.length === 0 ? (
								<Typography color="text.secondary">No upcoming events. Check the events page for new opportunities!</Typography>
							) : (
								<List dense>
									{upcomingEvents.map((event) => (
										<ListItem key={event._id} sx={{ px: 0 }}>
											<ListItemIcon>
												<CalendarIcon color="primary" />
											</ListItemIcon>
											<ListItemText
												primary={event.title}
												secondary={new Date(event.startDate).toLocaleDateString()}
											/>
										</ListItem>
									))}
								</List>
							)}
							<Button fullWidth variant="text" endIcon={<ArrowForwardIcon />} onClick={() => onNavigate('events')} sx={{ mt: 1 }}>
								View All Events
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Recent Activity
							</Typography>
							{recentActivity.length === 0 ? (
								<Typography color="text.secondary">No recent activity to show.</Typography>
							) : (
								<List dense>
									{recentActivity.map((activity, index) => (
										<ListItem key={index} sx={{ px: 0 }}>
											<ListItemIcon>
												<Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
													{activity.type === 'registration' && <EventIcon sx={{ fontSize: 16 }} />}
													{activity.type === 'attendance' && <CheckCircleIcon sx={{ fontSize: 16 }} />}
													{activity.type === 'feedback' && <FeedbackIcon sx={{ fontSize: 16 }} />}
													{activity.type === 'certificate' && <CertificateIcon sx={{ fontSize: 16 }} />}
												</Avatar>
											</ListItemIcon>
											<ListItemText
												primary={activity.description}
												secondary={new Date(activity.date).toLocaleDateString()}
											/>
										</ListItem>
									))}
								</List>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{stats.pendingFeedback > 0 && (
				<Alert
					severity="warning"
					sx={{ mt: 3 }}
					action={
						<Button color="inherit" size="small" onClick={() => onNavigate('feedback')}>
							Submit Now
						</Button>
					}
				>
					You have {stats.pendingFeedback} pending feedback(s). Submit them to earn your certificates!
				</Alert>
			)}
		</Box>
	);
};

export default EnhancedDashboardHome;
