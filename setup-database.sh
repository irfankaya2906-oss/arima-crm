#!/bin/bash

# PostgreSQL Veritabanı Kurulum Scripti
# Bu script veritabanını ve kullanıcıyı oluşturur

echo "PostgreSQL Veritabanı Kurulumu"
echo "================================"
echo ""

# PostgreSQL kullanıcı adınızı girin (genellikle macOS'ta kullanıcı adınız)
read -p "PostgreSQL superuser adınızı girin (varsayılan: $(whoami)): " PG_USER
PG_USER=${PG_USER:-$(whoami)}

# Veritabanı adı
DB_NAME="arima_crm"
DB_USER="arima_user"
DB_PASSWORD="arima_password_123"

echo ""
echo "Veritabanı bilgileri:"
echo "  Veritabanı: $DB_NAME"
echo "  Kullanıcı: $DB_USER"
echo "  Şifre: $DB_PASSWORD"
echo ""

# Veritabanını oluştur
echo "1. Veritabanı oluşturuluyor..."
psql -U "$PG_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "  Veritabanı zaten mevcut veya oluşturulamadı"

# Kullanıcıyı oluştur
echo "2. Kullanıcı oluşturuluyor..."
psql -U "$PG_USER" -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "  Kullanıcı zaten mevcut"

# İzinleri ver
echo "3. İzinler veriliyor..."
psql -U "$PG_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
psql -U "$PG_USER" -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_USER;" 2>/dev/null
psql -U "$PG_USER" -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" 2>/dev/null
psql -U "$PG_USER" -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;" 2>/dev/null

echo ""
echo "4. .env dosyası güncelleniyor..."
cat > .env << EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"
NEXTAUTH_URL="http://localhost:3010"
NEXTAUTH_SECRET="arima-crm-secret-key-change-in-production-12345"
EOF

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "Şimdi şu komutları çalıştırın:"
echo "  npx prisma migrate dev"
echo "  npm run dev"
echo ""

