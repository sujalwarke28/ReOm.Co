import app from './app';
import { startMonitoringService } from './services/monitor';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startMonitoringService();
});
