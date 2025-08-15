# Hướng Dẫn Deploy NeuraPix lên Google Cloud Platform

## 📋 Tổng quan
Hướng dẫn deploy ứng dụng NeuraPix (Spring Boot + MySQL) lên Google Cloud Platform sử dụng Cloud Run và Cloud SQL.

## 🛠️ Prerequisites

### 1. Cài đặt Google Cloud CLI
```bash
# Windows
# Download từ: https://cloud.google.com/sdk/docs/install

# macOS
brew install --cask google-cloud-sdk

# Ubuntu/Debian
sudo apt-get install google-cloud-cli
```

### 2. Cài đặt Docker
```bash
# Verify Docker installation
docker --version
```

### 3. Đăng nhập và cấu hình Google Cloud
```bash
# Đăng nhập
gcloud auth login

# Cấu hình Docker để sử dụng gcloud
gcloud auth configure-docker

# Set project (thay YOUR_PROJECT_ID bằng project ID thực tế)
gcloud config set project credible-nation-469011-e6
```

## 🗄️ Bước 1: Setup Cloud SQL Database

### 1.1 Tạo Cloud SQL Instance
```bash
# Tạo MySQL instance
gcloud sql instances create neuralpix \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=asia-southeast1 \
    --root-password="Khahuynh@0204" \
    --storage-type=SSD \
    --storage-size=20GB \
    --backup-start-time=03:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04
```

### 1.2 Tạo Database và User
```bash
# Tạo database
gcloud sql databases create neuralpix \
    --instance=neuralpix

# Kiểm tra kết nối
gcloud sql connect neuralpix --user=root
```

### 1.3 Import Database Schema (nếu có)
```sql
-- Kết nối vào database và tạo tables
-- Hoặc import từ file SQL có sẵn
```

## 🚀 Bước 2: Deploy Backend

### 2.1 Kiểm tra cấu hình
Đảm bảo file `backend/deploy.sh` có thông tin chính xác:

```bash
PROJECT_ID="credible-nation-469011-e6"
SERVICE_NAME="neuralpix-backend"
REGION="asia-southeast1"
INSTANCE_NAME="neuralpix"
DB_NAME="neuralpix"
DB_USERNAME="root"
DB_PASSWORD="Khahuynh@0204"
```

### 2.2 Enable APIs cần thiết
```bash
# Enable các APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2.3 Chạy deployment script
```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

### 2.4 Verify deployment
```bash
# Kiểm tra service
gcloud run services list --region=asia-southeast1

# Kiểm tra logs
gcloud run services logs read neuralpix-backend --region=asia-southeast1

# Test health endpoint
curl https://YOUR_SERVICE_URL/actuator/health
```

## 🌐 Bước 3: Deploy Frontend (nếu cần)

### 3.1 Build production
```bash
cd frontend
npm run build
```

### 3.2 Deploy lên hosting service (Vercel/Netlify)
Frontend hiện tại đang deploy trên Vercel: `https://neura-pix-chi.vercel.app`

## 🔧 Bước 4: Cấu hình Domain và SSL

### 4.1 Map custom domain (optional)
```bash
# Map domain
gcloud run domain-mappings create \
    --service neuralpix-backend \
    --domain your-domain.com \
    --region asia-southeast1
```

## 📊 Monitoring và Troubleshooting

### Xem logs real-time
```bash
gcloud run services logs tail neuralpix-backend --region=asia-southeast1
```

### Kiểm tra database connection
```bash
gcloud sql connect neuralpix --user=root
```

### Debug deployment issues
```bash
# Xem chi tiết service
gcloud run services describe neuralpix-backend --region=asia-southeast1

# Xem revisions
gcloud run revisions list --service=neuralpix-backend --region=asia-southeast1
```

## 🔐 Security Checklist

- [ ] Database có password mạnh
- [ ] Environment variables không bị expose
- [ ] CORS được cấu hình đúng
- [ ] JWT secret được generate an toàn
- [ ] API keys được bảo vệ

## 💰 Cost Management

### Ước tính chi phí hàng tháng:
- **Cloud SQL (db-f1-micro)**: ~$7-15
- **Cloud Run**: ~$0-10 (depending on traffic)
- **Container Registry**: ~$0.10/GB
- **Total**: ~$10-30/month

### Optimize costs:
```bash
# Set min instances to 0 để tránh phí khi không sử dụng
gcloud run services update neuralpix-backend \
    --region=asia-southeast1 \
    --min-instances=0 \
    --max-instances=10
```

## 🔄 Update và Redeploy

### Quick redeploy
```bash
cd backend
./deploy.sh
```

### Update environment variables
```bash
gcloud run services update neuralpix-backend \
    --region=asia-southeast1 \
    --set-env-vars="NEW_VAR=new_value"
```

### Rollback to previous version
```bash
# List revisions
gcloud run revisions list --service=neuralpix-backend --region=asia-southeast1

# Rollback
gcloud run services update-traffic neuralpix-backend \
    --to-revisions=REVISION_NAME=100 \
    --region=asia-southeast1
```

## 📱 Health Checks và Endpoints

Sau khi deploy thành công, các endpoints sau sẽ available:

- **Health Check**: `https://your-service-url/actuator/health`
- **API Documentation**: `https://your-service-url/swagger-ui.html`
- **PayOS Webhook**: `https://your-service-url/api/v2/payments/payos/webhook`

## 🚨 Troubleshooting Common Issues

### 1. Database connection timeout
```bash
# Kiểm tra Cloud SQL instance status
gcloud sql instances describe neuralpix

# Restart instance nếu cần
gcloud sql instances restart neuralpix
```

### 2. Container build failed
```bash
# Clean Docker cache
docker system prune -a

# Rebuild manually
docker build -t gcr.io/credible-nation-469011-e6/neuralpix-backend .
```

### 3. Memory issues
```bash
# Increase memory limit
gcloud run services update neuralpix-backend \
    --region=asia-southeast1 \
    --memory=2Gi
```

### 4. Cold start issues
```bash
# Set minimum instances
gcloud run services update neuralpix-backend \
    --region=asia-southeast1 \
    --min-instances=1
```

## 🔗 Useful Commands

```bash
# Get service URL
gcloud run services describe neuralpix-backend \
    --region=asia-southeast1 \
    --format='value(status.url)'

# Scale service
gcloud run services update neuralpix-backend \
    --region=asia-southeast1 \
    --concurrency=80 \
    --max-instances=20

# Update traffic splitting (A/B testing)
gcloud run services update-traffic neuralpix-backend \
    --to-revisions=REVISION1=50,REVISION2=50 \
    --region=asia-southeast1
```

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Google Cloud Console logs
2. Cloud Run service logs
3. Cloud SQL instance status
4. Network connectivity

---

**🎉 Chúc mừng! Ứng dụng NeuraPix đã được deploy thành công lên Google Cloud Platform!**