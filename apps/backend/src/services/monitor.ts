import si from 'systeminformation';
import prisma from '../prisma';
import { AlertSeverity } from '@prisma/client';

const CPU_THRESHOLD = 85;
const MEM_THRESHOLD = 90;

export const startMonitoringService = () => {
  console.log('Monitoring service started...');
  
  // Check every 30 seconds
  setInterval(async () => {
    try {
      const load = await si.currentLoad();
      const mem = await si.mem();
      
      const cpuUsage = load.currentLoad;
      const memUsage = (mem.active / mem.total) * 100;

      if (cpuUsage > CPU_THRESHOLD) {
        await prisma.alert.create({
          data: {
            alert_type: 'High CPU Usage',
            severity: AlertSeverity.Critical,
            status: 'Active',
          }
        });
        console.warn(`[ALERT] High CPU detected: ${cpuUsage.toFixed(2)}%`);
      }

      if (memUsage > MEM_THRESHOLD) {
        await prisma.alert.create({
          data: {
            alert_type: 'High Memory Usage',
            severity: AlertSeverity.High,
            status: 'Active',
          }
        });
        console.warn(`[ALERT] High Memory detected: ${memUsage.toFixed(2)}%`);
      }

    } catch (error) {
      console.error('Error in monitoring service:', error);
    }
  }, 30000);
};
