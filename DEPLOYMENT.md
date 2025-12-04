# 🚀 Arima CRM - Yayına Alma Rehberi

Bu rehber, Arima CRM uygulamasını production ortamına yayınlamak için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

### 1. Build Testi
```bash
npm run build
```
✅ Build başarılı olmalı (yukarıda test edildi)

### 2. Git Repository Hazırlığı
```bash
# Git repo kontrolü
git status

# Eğer repo yoksa
git init
git add .
git commit -m "Initial commit"
```

## 🌐 Vercel ile Deployment (Önerilen)

### Adım 1: Vercel Hesabı
1. [vercel.com](https://vercel.com) adresine gidin
2. Ücretsiz hesap oluşturun (GitHub ile giriş yapabilirsiniz)

### Adım 2: PostgreSQL Veritabanı Oluşturma

Production için bir PostgreSQL veritabanı servisi seçin:

#### Seçenek 1: Vercel Postgres (Önerilen)
1. Vercel Dashboard → Storage → Create Database
2. PostgreSQL seçin
3. Veritabanı oluşturulduktan sonra connection string'i kopyalayın

#### Seçenek 2: Supabase (Ücretsiz)
1. [supabase.com](https://supabase.com) → Create Project
2. Settings → Database → Connection String kopyalayın

#### Seçenek 3: Neon (Ücretsiz)
1. [neon.tech](https://neon.tech) → Create Project
2. Connection String kopyalayın

#### Seçenek 4: Railway
1. [railway.app](https://railway.app) → New Project → PostgreSQL
2. Connection String kopyalayın

### Adım 3: Vercel'e Proje Ekleme

#### Yöntem A: Vercel Dashboard (Kolay)
1. [vercel.com/new](https://vercel.com/new) adresine gidin
2. GitHub/GitLab/Bitbucket repo'nuzu bağlayın
3. Veya "Import Git Repository" ile repo URL'i girin

#### Yöntem B: Vercel CLI (Geliştiriciler için)
```bash
# Vercel CLI yükleme
npm i -g vercel

# Projeyi deploy etme
cd "/Users/irfan/Desktop/arima crm"
vercel

# Production'a deploy
vercel --prod
```

### Adım 4: Environment Variables Ayarlama

Vercel Dashboard → Project Settings → Environment Variables:

**Gerekli Değişkenler:**

1. **DATABASE_URL**
   ```
   postgresql://user:password@host:5432/database?schema=public
   ```
   (Yukarıda oluşturduğunuz veritabanından alın)

2. **NEXTAUTH_URL**
   ```
   https://your-app-name.vercel.app
   ```
   (Vercel deployment sonrası otomatik oluşan URL)

3. **NEXTAUTH_SECRET**
   ```bash
   # Terminal'de çalıştırın:
   openssl rand -base64 32
   ```
   (Çıkan değeri kopyalayın, minimum 32 karakter)

**Tüm Ortamlar İçin Ekle:**
- Production ✅
- Preview ✅
- Development ✅

### Adım 5: Build Ayarları

Vercel otomatik olarak Next.js'i algılar, ancak kontrol edin:

**Build Command:**
```
prisma generate && prisma migrate deploy && next build
```

**Output Directory:**
```
.next
```

**Install Command:**
```
npm install
```

### Adım 6: Deployment

1. "Deploy" butonuna tıklayın
2. Build sürecini izleyin (2-5 dakika)
3. Deployment tamamlandığında URL'iniz hazır olacak

### Adım 7: Veritabanı Migration

Deployment sonrası veritabanı şemasını oluşturun:

**Yöntem 1: Vercel CLI ile**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

**Yöntem 2: Manuel (Supabase/Neon Dashboard)**
1. Veritabanı dashboard'una gidin
2. SQL Editor'ü açın
3. `prisma/migrations` klasöründeki SQL dosyalarını çalıştırın

**Yöntem 3: Prisma Studio ile**
```bash
npx prisma studio
```

### Adım 8: İlk Kullanıcı Oluşturma

Production'da kullanıcı oluşturmak için:

1. `/register` sayfasından kayıt olun
2. Veya veritabanına direkt ekleyin:
```sql
-- Şifre: 123456 (bcrypt hash)
INSERT INTO users (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-id',
  'Admin',
  'admin@yourdomain.com',
  '$2a$10$...', -- bcrypt hash
  'ADMIN',
  NOW(),
  NOW()
);
```

## 🔧 Post-Deployment Kontrolleri

### ✅ Kontrol Listesi

- [ ] Uygulama açılıyor mu? (`https://your-app.vercel.app`)
- [ ] Login sayfası çalışıyor mu?
- [ ] Veritabanı bağlantısı çalışıyor mu?
- [ ] Firmalar listeleniyor mu?
- [ ] Yeni firma eklenebiliyor mu?
- [ ] Dashboard verileri görünüyor mu?

### 🔍 Hata Ayıklama

**Vercel Logs:**
```bash
vercel logs
```

**Veya Dashboard:**
- Vercel Dashboard → Project → Deployments → Logs

## 🔐 Güvenlik Ayarları

### 1. NEXTAUTH_SECRET
- Minimum 32 karakter
- Production'da mutlaka ayarlanmalı
- Her deployment için farklı olmalı

### 2. DATABASE_URL
- Güvenli bağlantı string kullanın
- SSL bağlantısı aktif olmalı (`?sslmode=require`)

### 3. Domain Ayarları
- Custom domain ekleyebilirsiniz
- SSL otomatik olarak aktif olur

## 📊 Monitoring

### Vercel Analytics
- Vercel Dashboard → Analytics
- Performans metrikleri
- Hata takibi

### Database Monitoring
- Veritabanı sağlayıcınızın dashboard'unu kullanın
- Connection pool ayarları
- Query performansı

## 🔄 Güncelleme Süreci

### Yeni Deployment
```bash
# Değişiklikleri commit edin
git add .
git commit -m "Update"
git push

# Vercel otomatik deploy eder
```

### Manuel Deployment
```bash
vercel --prod
```

## 🆘 Sorun Giderme

### Build Hatası
- Environment variables kontrol edin
- `npm run build` lokal olarak test edin
- Vercel logs'u kontrol edin

### Veritabanı Bağlantı Hatası
- DATABASE_URL doğru mu?
- Veritabanı erişilebilir mi?
- Firewall ayarları kontrol edin

### 500 Error
- Vercel logs kontrol edin
- Environment variables eksik olabilir
- Prisma migration'ları çalıştırıldı mı?

## 📞 Destek

Sorun yaşarsanız:
1. Vercel logs'u kontrol edin
2. Browser console'u kontrol edin
3. Veritabanı bağlantısını test edin

## 🎉 Başarılı Deployment!

Deployment tamamlandıktan sonra:
- ✅ Uygulamanız canlıda!
- ✅ URL: `https://your-app.vercel.app`
- ✅ Otomatik SSL aktif
- ✅ Her push'ta otomatik deploy

---

**Not:** İlk deployment sonrası veritabanı migration'larını çalıştırmayı unutmayın!

