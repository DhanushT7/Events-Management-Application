# 🚀 Department Lab Server Deployment Guide

<div align="center">

![Deployment](https://img.shields.io/badge/Deployment-Lab_Server-green?style=for-the-badge)
![DCSE](https://img.shields.io/badge/DCSE-Anna_University-blue?style=for-the-badge)

**Complete guide for deploying Events Management Application on Department Lab Server**

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [📋 Prerequisites](#-prerequisites)
- [🔧 Server Setup](#-server-setup)
- [📦 Application Deployment](#-application-deployment)
- [🗄️ Database Configuration](#️-database-configuration)
- [🌐 Web Server Configuration](#-web-server-configuration)
- [🔐 Security Configuration](#-security-configuration)
- [📊 Monitoring & Maintenance](#-monitoring--maintenance)
- [🔧 Troubleshooting](#-troubleshooting)
- [📞 Support](#-support)

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying the Events Management Application on the Department of Computer Science and Engineering (DCSE) lab server at Anna University.

### **Deployment Architecture**

```
┌──��──────────────────────────────────────────────────────────┐
│                    Lab Server (Ubuntu/CentOS)               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Nginx     │  │   Node.js   │  │      MongoDB        │  │
│  │ (Port 80)   │  │ (Port 4000) │  │   (Port 27017)     │  │
│  │             │  │             │  │                     │  │
│  │ Static      │  │ Backend     │  │ Database            │  │
│  │ Frontend    │  │ API Server  │  │ Storage             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **Access Points**
- **Frontend**: `http://lab-server-ip/` or `http://dcse-events.local/`
- **Backend API**: `http://lab-server-ip:4000/api/`
- **Database**: `mongodb://localhost:27017/events_management`

---

## 📋 Prerequisites

### **Server Requirements**
- **Operating System**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB (Recommended 8GB)
- **Storage**: Minimum 20GB free space
- **Network**: Static IP address or domain name
- **Ports**: 80, 443, 4000, 27017 available

### **Software Requirements**
- **Node.js**: Version 16.x or higher
- **MongoDB**: Version 4.4 or higher
- **Nginx**: Latest stable version
- **Git**: For code deployment
- **PM2**: Process manager for Node.js

### **Access Requirements**
- **SSH Access**: To the lab server
- **Sudo Privileges**: For system configuration
- **Firewall Access**: To configure ports
- **Domain/IP**: Server IP address or domain name

---

## 🔧 Server Setup

### **Step 1: Connect to Lab Server**

```bash
# Connect via SSH (replace with actual server details)
ssh username@lab-server-ip
# OR
ssh username@dcse-lab-server.annauniv.edu

# Switch to root or use sudo for administrative tasks
sudo su -
```

### **Step 2: Update System Packages**

```bash
# For Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# For CentOS/RHEL
sudo yum update -y
# OR for newer versions
sudo dnf update -y
```

### **Step 3: Install Node.js**

```bash
# Method 1: Using NodeSource repository (Recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Method 2: Using package manager
sudo apt install nodejs npm -y

# Verify installation
node --version  # Should show v16.x or higher
npm --version   # Should show 8.x or higher

# Install global packages
sudo npm install -g pm2 nodemon
```

### **Step 4: Install MongoDB**

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create MongoDB repository file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB installation
sudo systemctl status mongod
mongo --version
```

### **Step 5: Install Nginx**

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx installation
sudo systemctl status nginx
nginx -v
```

### **Step 6: Install Git**

```bash
# Install Git
sudo apt install git -y

# Verify installation
git --version
```

---

## 📦 Application Deployment

### **Step 1: Create Application Directory**

```bash
# Create application directory
sudo mkdir -p /var/www/events-management
sudo chown $USER:$USER /var/www/events-management
cd /var/www/events-management
```

### **Step 2: Clone Repository**

```bash
# Clone the repository
git clone https://github.com/your-username/Events-Management-Application.git .

# OR if using department GitLab/local repository
git clone http://dcse-git.local/events-management.git .

# Verify files
ls -la
```

### **Step 3: Backend Deployment**

```bash
# Navigate to backend directory
cd /var/www/events-management/Backend

# Install dependencies
npm install --production

# Create environment file
sudo nano .env
```

**Backend Environment Configuration (.env):**
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/events_management

# Security Configuration
JWT_SECRET=dcse_events_super_secret_key_2024_anna_university
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_USER=dcse.events@annauniv.edu
EMAIL_PASS=your_email_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/events-management/uploads

# Application Configuration
APP_NAME=DCSE Events Management
APP_URL=http://your-server-ip
FRONTEND_URL=http://your-server-ip

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/events-management/app.log
```

```bash
# Create uploads directory
mkdir -p /var/www/events-management/uploads
mkdir -p /var/log/events-management

# Set permissions
sudo chown -R $USER:$USER /var/www/events-management
sudo chmod -R 755 /var/www/events-management
```

### **Step 4: Frontend Deployment**

```bash
# Navigate to frontend directory
cd /var/www/events-management/Frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

**Frontend Environment Configuration (.env.production):**
```env
VITE_API_BASE_URL=http://your-server-ip:4000/api
VITE_APP_NAME=DCSE Events Management System
VITE_APP_VERSION=1.0.0
VITE_UNIVERSITY_NAME=Anna University
VITE_DEPARTMENT_NAME=Department of Computer Science and Engineering
```

```bash
# Build for production
npm run build

# Copy build files to web directory
sudo cp -r dist/* /var/www/html/
# OR create separate directory
sudo mkdir -p /var/www/events-frontend
sudo cp -r dist/* /var/www/events-frontend/
```

### **Step 5: Start Backend with PM2**

```bash
# Navigate to backend directory
cd /var/www/events-management/Backend

# Start application with PM2
pm2 start server.js --name "events-backend" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above

# Check application status
pm2 status
pm2 logs events-backend
```

---

## 🗄️ Database Configuration

### **Step 1: MongoDB Security Setup**

```bash
# Connect to MongoDB
mongo

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure_admin_password_2024",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application database and user
use events_management
db.createUser({
  user: "events_app",
  pwd: "events_app_password_2024",
  roles: ["readWrite"]
})

# Exit MongoDB shell
exit
```

### **Step 2: Enable MongoDB Authentication**

```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf
```

**Add/Update the following in mongod.conf:**
```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Security
security:
  authorization: enabled

# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
```

```bash
# Restart MongoDB
sudo systemctl restart mongod

# Update backend .env with authentication
cd /var/www/events-management/Backend
nano .env
```

**Update MongoDB URI in .env:**
```env
MONGO_URI=mongodb://events_app:events_app_password_2024@localhost:27017/events_management
```

### **Step 3: Database Initialization**

```bash
# Restart backend application
pm2 restart events-backend

# Check logs for successful database connection
pm2 logs events-backend

# Optional: Import sample data
mongo events_management -u events_app -p events_app_password_2024 < sample_data.js
```

---

## 🌐 Web Server Configuration

### **Step 1: Nginx Configuration**

```bash
# Create Nginx configuration for the application
sudo nano /etc/nginx/sites-available/events-management
```

**Nginx Configuration File:**
```nginx
server {
    listen 80;
    server_name your-server-ip dcse-events.local;
    
    # Frontend static files
    location / {
        root /var/www/events-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File uploads
    location /uploads/ {
        alias /var/www/events-management/uploads/;
        expires 1d;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

### **Step 2: Enable Nginx Site**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/events-management /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **Step 3: Configure Firewall**

```bash
# Check current firewall status
sudo ufw status

# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (for future SSL)
sudo ufw allow 4000  # Backend API (optional, for direct access)

# Enable firewall (if not already enabled)
sudo ufw enable

# Check status
sudo ufw status verbose
```

---

## 🔐 Security Configuration

### **Step 1: SSL Certificate Setup (Optional but Recommended)**

```bash
# Install Certbot for Let's Encrypt (if domain is available)
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d dcse-events.yourdomain.com

# OR create self-signed certificate for internal use
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/events-management.key \
    -out /etc/ssl/certs/events-management.crt
```

### **Step 2: System Security**

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Install fail2ban for SSH protection
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **Step 3: Application Security**

```bash
# Set proper file permissions
sudo chown -R www-data:www-data /var/www/events-frontend
sudo chmod -R 755 /var/www/events-frontend
sudo chown -R $USER:$USER /var/www/events-management
sudo chmod -R 755 /var/www/events-management

# Secure sensitive files
sudo chmod 600 /var/www/events-management/Backend/.env
sudo chown $USER:$USER /var/www/events-management/Backend/.env
```

---

## 📊 Monitoring & Maintenance

### **Step 1: Setup Logging**

```bash
# Create log rotation for application logs
sudo nano /etc/logrotate.d/events-management
```

**Log Rotation Configuration:**
```
/var/log/events-management/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload events-backend
    endscript
}
```

### **Step 2: Monitoring Scripts**

```bash
# Create monitoring script
sudo nano /usr/local/bin/events-monitor.sh
```

**Monitoring Script:**
```bash
#!/bin/bash

# Events Management Application Monitor
LOG_FILE="/var/log/events-management/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting health check..." >> $LOG_FILE

# Check if backend is running
if pm2 list | grep -q "events-backend.*online"; then
    echo "[$DATE] Backend: OK" >> $LOG_FILE
else
    echo "[$DATE] Backend: FAILED - Restarting..." >> $LOG_FILE
    pm2 restart events-backend
fi

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    echo "[$DATE] Nginx: OK" >> $LOG_FILE
else
    echo "[$DATE] Nginx: FAILED - Restarting..." >> $LOG_FILE
    sudo systemctl restart nginx
fi

# Check if MongoDB is running
if systemctl is-active --quiet mongod; then
    echo "[$DATE] MongoDB: OK" >> $LOG_FILE
else
    echo "[$DATE] MongoDB: FAILED - Restarting..." >> $LOG_FILE
    sudo systemctl restart mongod
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

echo "[$DATE] Health check completed." >> $LOG_FILE
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/events-monitor.sh

# Add to crontab for regular monitoring
sudo crontab -e
```

**Add to crontab:**
```
# Monitor Events Management Application every 5 minutes
*/5 * * * * /usr/local/bin/events-monitor.sh

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/events-backup.sh
```

### **Step 3: Backup Script**

```bash
# Create backup script
sudo nano /usr/local/bin/events-backup.sh
```

**Backup Script:**
```bash
#!/bin/bash

# Events Management Backup Script
BACKUP_DIR="/var/backups/events-management"
DATE=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="/var/log/events-management/backup.log"

echo "[$DATE] Starting backup..." >> $LOG_FILE

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB database
mongodump --db events_management --out $BACKUP_DIR/db_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/events-management

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/events-management/uploads

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "db_*" -mtime +30 -exec rm -rf {} \;

echo "[$DATE] Backup completed." >> $LOG_FILE
```

```bash
# Make backup script executable
sudo chmod +x /usr/local/bin/events-backup.sh
```

---

## 🔧 Troubleshooting

### **Common Issues and Solutions**

#### **Issue 1: Backend Not Starting**

```bash
# Check PM2 logs
pm2 logs events-backend

# Check if port 4000 is in use
sudo netstat -tulpn | grep 4000

# Restart backend
pm2 restart events-backend

# Check environment variables
cd /var/www/events-management/Backend
cat .env
```

#### **Issue 2: Database Connection Failed**

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test database connection
mongo events_management -u events_app -p

# Restart MongoDB
sudo systemctl restart mongod
```

#### **Issue 3: Frontend Not Loading**

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### **Issue 4: File Upload Issues**

```bash
# Check upload directory permissions
ls -la /var/www/events-management/uploads

# Fix permissions
sudo chown -R $USER:$USER /var/www/events-management/uploads
sudo chmod -R 755 /var/www/events-management/uploads

# Check disk space
df -h
```

### **Performance Optimization**

```bash
# Monitor system resources
htop
# OR
top

# Check memory usage
free -h

# Check disk usage
df -h

# Monitor network connections
sudo netstat -tulpn

# Check application performance
pm2 monit
```

### **Log Analysis**

```bash
# Application logs
pm2 logs events-backend --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u mongod -f
```

---

## 📞 Support

### **Emergency Contacts**

- **System Administrator**: Contact lab administrator
- **Development Team**: 
  - Kathir Kalidass B: kathirkalidass.b2023cse@smail.ssn.edu.in
  - Dhanush T: dhanush.t2023cse@smail.ssn.edu.in
- **Department IT Support**: DCSE IT Support Team

### **Useful Commands Reference**

```bash
# Application Management
pm2 status                    # Check application status
pm2 restart events-backend    # Restart backend
pm2 logs events-backend       # View logs
pm2 monit                     # Monitor resources

# Web Server Management
sudo systemctl status nginx   # Check Nginx status
sudo systemctl reload nginx   # Reload Nginx config
sudo nginx -t                 # Test Nginx config

# Database Management
sudo systemctl status mongod  # Check MongoDB status
mongo events_management       # Connect to database
mongodump --db events_management  # Backup database

# System Management
sudo systemctl status         # Check all services
htop                         # Monitor system resources
df -h                        # Check disk space
free -h                      # Check memory usage
```

### **Maintenance Schedule**

| Task | Frequency | Command |
|------|-----------|---------|
| **System Updates** | Weekly | `sudo apt update && sudo apt upgrade` |
| **Log Rotation** | Daily | Automatic via logrotate |
| **Database Backup** | Daily | `/usr/local/bin/events-backup.sh` |
| **Health Check** | Every 5 min | `/usr/local/bin/events-monitor.sh` |
| **Security Updates** | Automatic | unattended-upgrades |

---

## 🎯 Post-Deployment Checklist

### **Verification Steps**

- [ ] **Frontend Access**: Can access application at `http://server-ip/`
- [ ] **Backend API**: Can access API at `http://server-ip:4000/api/`
- [ ] **Database Connection**: Backend connects to MongoDB successfully
- [ ] **User Registration**: Can create new user accounts
- [ ] **User Login**: Can login with different user roles
- [ ] **Event Creation**: Can create and manage events
- [ ] **Document Generation**: Can generate brochures and certificates
- [ ] **File Upload**: Can upload files and documents
- [ ] **Email Functionality**: Email notifications work (if configured)
- [ ] **Responsive Design**: Application works on mobile devices

### **Performance Tests**

- [ ] **Load Time**: Frontend loads within 3 seconds
- [ ] **API Response**: API responses within 1 second
- [ ] **Database Queries**: Database queries execute efficiently
- [ ] **File Upload**: File uploads complete successfully
- [ ] **Concurrent Users**: Application handles multiple users

### **Security Verification**

- [ ] **HTTPS**: SSL certificate installed and working
- [ ] **Authentication**: JWT tokens work correctly
- [ ] **Authorization**: Role-based access control functions
- [ ] **Input Validation**: Forms validate input properly
- [ ] **File Security**: Uploaded files are secure
- [ ] **Database Security**: MongoDB authentication enabled

---

<div align="center">

**🎓 Deployment Guide for DCSE Events Management System**

**College of Engineering Guindy, Anna University**

---

*For technical support, contact the development team or department IT support.*

</div>