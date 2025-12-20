# Hướng dẫn thiết lập file .env cho các services

## Tự động tạo file .env

Chạy script PowerShell để tự động tạo tất cả các file .env:

```powershell
cd backend
.\setup-env.ps1
```

## Tạo thủ công

Nếu không dùng script, tạo file `.env` trong mỗi thư mục service với nội dung sau:

### 1. auth-service/.env

```env
# Auth Service Environment Variables

# Server Configuration
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb://volunteer-mongo:27017/auth-service

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
```

### 2. user-service/.env

```env
# User Service Environment Variables

# Server Configuration
PORT=4002
CORS_ORIGIN=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb://volunteer-mongo:27017/user-service

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration (must match auth-service)
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-this-in-production
```

### 3. event-service/.env

```env
# Event Service Environment Variables

# Server Configuration
PORT=4006
CORS_ORIGIN=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb://volunteer-mongo:27017/event-service

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
```

### 4. notification-service/.env

```env
# Notification Service Environment Variables

# Server Configuration
PORT=4004

# Database Configuration
MONGO_URI=mongodb://volunteer-mongo:27017/notification-service

# RabbitMQ Configuration
RABBITMQ_URL=amqp://rabbitmq:5672

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Note: For Gmail, you need to use an App Password, not your regular password
# Generate one at: https://myaccount.google.com/apppasswords
```

### 5. event-registration-service/.env

```env
# Event Registration Service Environment Variables

# Server Configuration
PORT=4008
CORS_ORIGIN=*

# Database Configuration
MONGO_URI=mongodb://volunteer-mongo:27017/event-registration-service

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
```

### 6. communication-service/.env

```env
# Communication Service Environment Variables

# Server Configuration
PORT=4010
CORS_ORIGIN=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb://volunteer-mongo:27017/communication-service
```

## Các giá trị cần cập nhật

Sau khi tạo các file .env, bạn **PHẢI** cập nhật các giá trị sau:

### 1. JWT Secrets (BẮT BUỘC)
- `JWT_ACCESS_SECRET`: Tạo một chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự)
- `JWT_REFRESH_SECRET`: Tạo một chuỗi ngẫu nhiên mạnh khác (ít nhất 32 ký tự)
- **Lưu ý**: `JWT_ACCESS_SECRET` phải giống nhau trong `auth-service` và `user-service`

**Cách tạo JWT Secret:**
```bash
# Trên Linux/Mac
openssl rand -base64 32

# Trên Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Google OAuth (Tùy chọn - nếu sử dụng đăng nhập Google)
- `GOOGLE_CLIENT_ID`: Lấy từ Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Lấy từ Google Cloud Console
- `GOOGLE_REDIRECT_URI`: URL callback (thường là `http://localhost:4000/auth/google/callback`)

### 3. SMTP Email (BẮT BUỘC cho notification-service)
- `SMTP_HOST`: Host SMTP (ví dụ: `smtp.gmail.com`)
- `SMTP_PORT`: Port SMTP (ví dụ: `587` cho TLS, `465` cho SSL)
- `SMTP_USER`: Email của bạn
- `SMTP_PASS`: App Password (không phải mật khẩu thường)

**Cách tạo Gmail App Password:**
1. Truy cập: https://myaccount.google.com/apppasswords
2. Chọn "Mail" và "Other (Custom name)"
3. Nhập tên (ví dụ: "VolunteerHub")
4. Copy mật khẩu 16 ký tự được tạo
5. Dán vào `SMTP_PASS`

## Kiểm tra file .env

Sau khi tạo, kiểm tra các file đã tồn tại:

```powershell
# Kiểm tra tất cả file .env
Get-ChildItem -Path . -Filter ".env" -Recurse | Select-Object FullName

# Hoặc kiểm tra từng service
Test-Path auth-service/.env
Test-Path user-service/.env
Test-Path event-service/.env
Test-Path notification-service/.env
Test-Path event-registration-service/.env
Test-Path communication-service/.env
```

## Lưu ý quan trọng

1. **KHÔNG commit file .env lên Git** - Các file này đã được thêm vào `.gitignore`
2. **JWT Secrets phải mạnh** - Không sử dụng giá trị mặc định trong production
3. **Các giá trị MongoDB URI** - Sử dụng tên service Docker (`volunteer-mongo`) khi chạy trong Docker
4. **CORS_ORIGIN** - Cập nhật theo domain frontend của bạn





