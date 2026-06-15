import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import tasksRoutes from './routes/tasks';
import approvalsRoutes from './routes/approvals';
import analyticsRoutes from './routes/analytics';
import executiveRoutes from './routes/executive';
import monitoringRoutes from './routes/monitoring';
import auditRoutes from './routes/audit';
import pricingRoutes from './routes/pricing';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/executive', executiveRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
