PROJECT_ID="credible-nation-469011-e6"
SERVICE_NAME="neuralpix-backend"
REGION="asia-southeast1"
INSTANCE_NAME="neuralpix"
DB_NAME="neuralpix"
DB_USERNAME="root"
DB_PASSWORD="Khahuynh@0204"

IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Building Docker image..."
docker build -t $IMAGE_NAME .

echo "Pushing to Google Container Registry..."
docker push $IMAGE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars="
    SPRING_PROFILES_ACTIVE=prod,
    CLOUD_SQL_INSTANCE=$PROJECT_ID:$REGION:$INSTANCE_NAME,
    DB_NAME=$DB_NAME,
    DB_USERNAME=$DB_USERNAME,
    DB_PASSWORD=$DB_PASSWORD,
    JWT_SECRET=89f0edb525fcbdedc7bfa4b33d93050968f4807ec142dd3fddef8cabe825a3395bf8830e8ee837414958e5274a3bf1ced5871ee9c9d9cb5d241233b224252f7a2e479d024d08ab99dc0fa5d29b22f9218d04ab296d87b283820ef5d4b6257ab218e65dce6638a36c55efcd9708bb74d2af1eb346a8022ef56dfcb2ad191f3ddc80389046ba48d94836d107aa0fe37444031b5aea03e6e7af8faee3e58a41419897fb11a3648e7fe4debaebf841f240f731f391c4b3b53f590def43fb98cb7f177f9cccb6d8f234f875d21f06693a126ed6dc7fcd634a11e92e8d17664ddab1da57640e68547f5ae33947ae53faec69aa81c8cfff4b6475297766c38c550e8f12,
    MAIL_USERNAME=neurapixai@gmail.com,
    MAIL_PASSWORD=iobnifuhifqdlcoj,
    PAYOS_CLIENT_ID=b3349c0c-c6fd-4fb7-826d-e8554b26a1a4,
    PAYOS_API_KEY=fbcefcea-d048-4f5a-bec5-5112666eb61b,
    PAYOS_CHECKSUM_KEY=dbd3d5c856b5df174fec189e9d607599ff1447ea14da58f67d77b8984e274100,
    PIXELCUT_API_KEY=sk_09928c84cb804af0881a62712db3917b,
    CLOUDINARY_CLOUD_NAME=dydufgnoz,
    CLOUDINARY_API_KEY=374916146639466,
    CLOUDINARY_API_SECRET=s0pxHlN5pDfApux1g49EXobKHPY,
    APP_FRONTEND_URL=https://neura-pix-chi.vercel.app,
    CORS_ALLOWED_ORIGINS=https://neura-pix-chi.vercel.app,
    APP_WEBHOOK_BASE_URL=https://neuralpix-backend-43628620908.asia-southeast1.run.app
  " \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:$INSTANCE_NAME

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "Deployment complete!"
echo "Service URL: $SERVICE_URL"

# Update webhook URL env variable
echo "Updating webhook URL..."
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --update-env-vars="APP_WEBHOOK_BASE_URL=$SERVICE_URL"

echo "Backend deployed successfully!"
echo "Health check: $SERVICE_URL/actuator/health"
echo "Update your PayOS webhook to: $SERVICE_URL/api/v2/payments/payos/webhook"