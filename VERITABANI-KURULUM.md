# Veritabanı Kurulum Rehberi

## Hızlı Kurulum (Otomatik)

Terminal'de proje dizinine gidin ve scripti çalıştırın:

```bash
cd "/Users/irfan/Desktop/arima crm"
./setup-database.sh
```

Script çalıştıktan sonra:

```bash
npx prisma migrate dev
npm run dev
```

## Manuel Kurulum

Eğer script çalışmazsa, aşağıdaki adımları manuel olarak takip edin:

### 1. PostgreSQL'e bağlanın

```bash
psql -U irfan -d postgres
```

### 2. Veritabanını oluşturun

```sql
CREATE DATABASE arima_crm;
```

### 3. Kullanıcı oluşturun (opsiyonel)

Eğer özel bir kullanıcı istiyorsanız:

```sql
CREATE USER arima_user WITH PASSWORD 'arima_password_123';
GRANT ALL PRIVILEGES ON DATABASE arima_crm TO arima_user;
```

### 4. Mevcut kullanıcınıza izin verin

Eğer mevcut kullanıcınızı (irfan) kullanacaksanız:

```sql
GRANT ALL PRIVILEGES ON DATABASE arima_crm TO irfan;
```

### 5. Veritabanına bağlanıp schema izinlerini verin

```sql
\c arima_crm
GRANT ALL PRIVILEGES ON SCHEMA public TO irfan;
-- veya arima_user kullanıyorsanız:
-- GRANT ALL PRIVILEGES ON SCHEMA public TO arima_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO irfan;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO irfan;
```

### 6. .env dosyasını güncelleyin

`.env` dosyasını açın ve `DATABASE_URL`'i güncelleyin:

**Eğer irfan kullanıcısını kullanıyorsanız:**
```env
DATABASE_URL="postgresql://irfan@localhost:5432/arima_crm?schema=public"
```

**Eğer arima_user kullanıyorsanız:**
```env
DATABASE_URL="postgresql://arima_user:arima_password_123@localhost:5432/arima_crm?schema=public"
```

**Eğer şifre gerekiyorsa:**
```env
DATABASE_URL="postgresql://irfan:ŞİFRENİZ@localhost:5432/arima_crm?schema=public"
```

### 7. Prisma migration çalıştırın

```bash
npx prisma migrate dev
```

### 8. Uygulamayı başlatın

```bash
npm run dev
```

## Sorun Giderme

### "role does not exist" hatası

PostgreSQL'de kullanıcı adınızı kontrol edin:

```bash
psql -U irfan -d postgres -c "\du"
```

### "database does not exist" hatası

Veritabanını oluşturun:

```bash
psql -U irfan -d postgres -c "CREATE DATABASE arima_crm;"
```

### "permission denied" hatası

İzinleri verin:

```bash
psql -U irfan -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE arima_crm TO irfan;"
psql -U irfan -d arima_crm -c "GRANT ALL PRIVILEGES ON SCHEMA public TO irfan;"
```

### PostgreSQL çalışmıyor

PostgreSQL'i başlatın:

```bash
# macOS (Homebrew)
brew services start postgresql@14
# veya
pg_ctl -D /usr/local/var/postgres start
```

