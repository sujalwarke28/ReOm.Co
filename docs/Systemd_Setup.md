# Linux Administration: Systemd Setup

This document outlines how to configure a Linux host (e.g., Ubuntu/Amazon Linux 2 on EC2) to automatically start the ReOm.Co Docker stack on system boot.

## 1. Prerequisites
- Docker and Docker Compose must be installed on the Linux host.
- The project repository must be cloned to `/opt/reomco`.

## 2. Create the Systemd Service File
Systemd will be used to manage the lifecycle of the Docker Compose stack.

1. Create a new service file:
   ```bash
   sudo nano /etc/systemd/system/reomco.service
   ```

2. Add the following configuration:
   ```ini
   [Unit]
   Description=ReOm.Co Docker Compose Stack
   Requires=docker.service
   After=docker.service

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/opt/reomco
   
   # Startup Command
   ExecStart=/usr/local/bin/docker-compose up -d
   
   # Shutdown Command
   ExecStop=/usr/local/bin/docker-compose down
   
   # Restart configuration is handled by docker-compose restart policies natively,
   # but we ensure the systemd service completes correctly.
   
   [Install]
   WantedBy=multi-user.target
   ```

## 3. Enable and Start the Service

Reload the systemd daemon to recognize the new file:
```bash
sudo systemctl daemon-reload
```

Enable the service to start automatically on system boot:
```bash
sudo systemctl enable reomco.service
```

Start the service immediately:
```bash
sudo systemctl start reomco.service
```

## 4. Monitoring the Service
To check the status of the service:
```bash
sudo systemctl status reomco.service
```

To view the service logs (stdout from docker-compose execution):
```bash
sudo journalctl -u reomco.service -f
```
