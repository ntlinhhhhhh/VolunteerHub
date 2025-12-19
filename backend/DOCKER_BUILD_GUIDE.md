# Hướng dẫn Build và Chạy Backend với Docker

## Yêu cầu trước khi bắt đầu

1. **Docker Desktop** đã được cài đặt và đang chạy
2. **Docker Compose** (thường đi kèm với Docker Desktop)
3. Các file `.env` đã được tạo cho tất cả services (xem `ENV_SETUP_GUIDE.md`)

## Bước 1: Kiểm tra file .env

Đảm bảo tất cả các file `.env` đã được tạo:

```powershell
cd backend
Get-ChildItem -Path . -Filter ".env" -Recurse | Select-Object FullName
```

Bạn cần có 6 file `.env`:
- `auth-service/.env`
- `user-service/.env`
- `event-service/.env`
- `notification-service/.env`
- `event-registration-service/.env`
- `communication-service/.env`

## Bước 2: Cập nhật các giá trị quan trọng

Trước khi build, cập nhật các giá trị sau trong file `.env`:

### JWT Secrets (BẮT BUỘC)

Tạo JWT secrets mạnh:

```powershell
# Tạo JWT_ACCESS_SECRET
$jwtAccess = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "JWT_ACCESS_SECRET=$jwtAccess"

# Tạo JWT_REFRESH_SECRET
$jwtRefresh = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "JWT_REFRESH_SECRET=$jwtRefresh"
```

Cập nhật các giá trị này trong:
- `auth-service/.env` (cả ACCESS và REFRESH)
- `user-service/.env` (chỉ ACCESS - phải giống auth-service)

### SMTP Configuration (Cho notification-service)

Cập nhật trong `notification-service/.env`:
- `SMTP_USER`: Email của bạn
- `SMTP_PASS`: App Password từ Gmail

## Bước 3: Kiểm tra docker-compose.yml

Đảm bảo file `docker-compose.yml` đã được cấu hình đúng. Kiểm tra các volumes cho media storage:

```yaml
volumes:
  - D:/volunteer_hub/volunteerhub/media-storage:/app/uploads
```

**Lưu ý**: Nếu đường dẫn khác, cập nhật trong `docker-compose.yml` hoặc tạo thư mục tương ứng.

## Bước 4: Build và chạy với Docker Compose

### Option 1: Build và chạy cùng lúc

```powershell
cd backend
docker-compose up --build
```

### Option 2: Build trước, chạy sau

```powershell
# Build tất cả images
docker-compose build

# Chạy các containers
docker-compose up
```

### Option 3: Chạy ở chế độ background (detached)

```powershell
docker-compose up --build -d
```

## Bước 5: Kiểm tra các services đã chạy

### Kiểm tra containers đang chạy

```powershell
docker-compose ps
```

Bạn sẽ thấy các services sau:
- `volunteer-mongo` (MongoDB)
- `redis` (Redis)
- `rabbitmq` (RabbitMQ)
- `auth-service` (Port 4000)
- `user-service` (Port 4002)
- `notification-service` (Port 4004)
- `event-service` (Port 4006)
- `event-registration-service` (Port 4008)
- `communication-service` (Port 4010)
- `kong` (API Gateway - Port 8000, 8001)

### Kiểm tra logs

Xem logs của tất cả services:

```powershell
docker-compose logs -f
```

Xem logs của một service cụ thể:

```powershell
# Auth service
docker-compose logs -f auth-service

# User service
docker-compose logs -f user-service

# Event service
docker-compose logs -f event-service
```

## Bước 6: Kiểm tra health của services

### Kiểm tra MongoDB

```powershell
docker exec -it volunteer-mongo mongosh
```

### Kiểm tra Redis

```powershell
docker exec -it redis redis-cli ping
# Kết quả mong đợi: PONG
```

### Kiểm tra RabbitMQ

Mở trình duyệt và truy cập: http://localhost:15672
- Username: `guest`
- Password: `guest`

### Kiểm tra API Gateway (Kong)

```powershell
# Kiểm tra Kong admin API
curl http://localhost:8001/services
```

### Kiểm tra các services

```powershell
# Auth service
curl http://localhost:4000

# User service
curl http://localhost:4002

# Event service
curl http://localhost:4006
```

## Các lệnh Docker hữu ích

### Dừng tất cả services

```powershell
docker-compose down
```

### Dừng và xóa volumes (xóa dữ liệu)

```powershell
docker-compose down -v
```

### Rebuild một service cụ thể

```powershell
docker-compose build auth-service
docker-compose up -d auth-service
```

### Xem logs real-time

```powershell
docker-compose logs -f --tail=100
```

### Restart một service

```powershell
docker-compose restart auth-service
```

### Xem resource usage

```powershell
docker stats
```

## Troubleshooting

### Lỗi: Port đã được sử dụng

Nếu port đã được sử dụng, bạn có thể:
1. Dừng service đang sử dụng port đó
2. Hoặc thay đổi port trong `docker-compose.yml`

### Lỗi: Cannot connect to MongoDB

Kiểm tra:
1. Container `volunteer-mongo` đã chạy: `docker-compose ps`
2. MongoDB URI trong `.env` đúng: `mongodb://volunteer-mongo:27017/...`
3. Xem logs: `docker-compose logs mongo`

### Lỗi: Cannot connect to Redis

Kiểm tra:
1. Container `redis` đã chạy
2. `REDIS_HOST=redis` trong `.env` (không phải `localhost`)
3. Xem logs: `docker-compose logs redis`

### Lỗi: JWT verification failed

Đảm bảo:
1. `JWT_ACCESS_SECRET` giống nhau trong `auth-service/.env` và `user-service/.env`
2. Đã cập nhật giá trị thực (không dùng giá trị mặc định)

### Lỗi: SMTP connection failed

Kiểm tra:
1. `SMTP_USER` và `SMTP_PASS` đã được cập nhật
2. Đang dùng App Password (không phải mật khẩu thường)
3. Port đúng (587 cho TLS, 465 cho SSL)

### Xóa và build lại từ đầu

```powershell
# Dừng và xóa tất cả
docker-compose down -v

# Xóa tất cả images
docker-compose down --rmi all

# Build lại
docker-compose build --no-cache

# Chạy lại
docker-compose up -d
```

## Cấu trúc Ports

| Service | Port | Description |
|---------|------|-------------|
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache & Message Queue |
| RabbitMQ | 5672 | Message Broker |
| RabbitMQ Management | 15672 | Web UI |
| Auth Service | 4000 | Authentication API |
| User Service | 4002 | User Management API |
| Notification Service | 4004 | Notification API |
| Event Service | 4006 | Event Management API |
| Event Registration | 4008 | Registration API |
| Communication Service | 4010 | Posts & Comments API |
| Kong Proxy | 8000 | API Gateway (Public) |
| Kong Admin | 8001 | API Gateway (Admin) |

## Kết nối từ Frontend

Khi frontend kết nối đến backend, sử dụng:
- **API Gateway (Kong)**: `http://localhost:8000`
- **Hoặc trực tiếp**: `http://localhost:4000` (auth), `http://localhost:4002` (user), etc.

## Production Deployment

Khi deploy lên production:
1. Thay đổi tất cả JWT secrets thành giá trị mạnh
2. Cập nhật CORS_ORIGIN thành domain production
3. Sử dụng MongoDB URI production
4. Cấu hình SMTP production
5. Sử dụng Docker secrets hoặc environment variables an toàn
6. Bật HTTPS/TLS
7. Cấu hình firewall và security groups

## Tài liệu tham khảo

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [RabbitMQ Docker Image](https://hub.docker.com/_/rabbitmq)
- [Kong Gateway](https://docs.konghq.com/)

