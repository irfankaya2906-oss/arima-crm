# 🚀 Arima CRM - Yayına Alma Rehberi (Güvenli Yöntem)

Bu rehber, **mevcut çalışan sisteminizi bozmadan** yayına almak için adım adım talimatlar içerir.

## ⚠️ ÖNEMLİ: Mevcut Sistem Korunacak

- ✅ Yerel geliştirme ortamınız (`localhost:3010`) çalışmaya devam edecek
- ✅ Veritabanınız (`arima_crm`) korunacak
- ✅ Tüm verileriniz güvende kalacak
- ✅ Production ayrı bir ortam olacak

---

## 📋 ADIM 1: Git Repository Hazırlığı (İlk Kez İse)

### Git Kontrolü
```bash
cd "/Users/irfan/Desktop/arima crm"
git status
```

### Eğer Git Repo Yoksa
```bash
# Git başlat
git init

# Dosyaları ekle (önemli: .env dosyası eklenmeyecek - zaten .gitignore'da)
git add .

# İlk commit
git commit -m "Initial commit - Arima CRM"
```

### Eğer Git Repo Varsa
```bash
# Mevcut değişiklikleri commit et
git add .
git commit -m "Production ready - deployment hazırlığı"
```

---

## 📋 ADIM 2: GitHub Repository Oluşturma

1. **GitHub'a gidin**: [github.com](https://github.com)
2. **Yeni repository oluşturun**:
   - "New" butonuna tıklayın
   - Repository adı: `arima-crm` (veya istediğiniz isim)
   - Public veya Private seçin
   - **"Initialize with README" seçmeyin** (zaten dosyalarınız var)
   - "Create repository" tıklayın

3. **Local repo'yu GitHub'a bağlayın**:
```bash
cd "/Users/irfan/Desktop/arima crm"

# GitHub'dan aldığınız URL'i kullanın (örnek)
git remote add origin https://github.com/KULLANICI_ADINIZ/arima-crm.git

# Dosyaları yükle
git branch -M main
git push -u origin main
```

---

## 📋 ADIM 3: Production PostgreSQL Veritabanı Oluşturma

**ÖNEMLİ:** Bu, yerel veritabanınızdan **AYRI** bir veritabanı olacak.

### Seçenek 1: Supabase (Önerilen - Ücretsiz)

1. [supabase.com](https://supabase.com) → Sign Up
2. "New Project" → Proje adı: `arima-crm-prod`
3. Database Password belirleyin (güçlü bir şifre)
4. Region seçin (en yakın: `Europe West`)
5. "Create new project" tıklayın
6. **2-3 dakika bekleyin** (veritabanı oluşturuluyor)
7. Settings → Database → Connection String → **URI** kopyalayın
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Seçenek 2: Neon (Ücretsiz)

1. [neon.tech](https://neon.tech) → Sign Up
2. "Create Project" → Proje adı: `arima-crm-prod`
3. "Create" tıklayın
4. Connection String kopyalayın

### Seçenek 3: Vercel Postgres

1. Vercel Dashboard → Storage → Create Database
2. PostgreSQL seçin
3. Connection String otomatik oluşur

---

## 📋 ADIM 4: Vercel Hesabı ve Deployment

### 4.1 Vercel Hesabı
1. [vercel.com](https://vercel.com) → Sign Up
2. GitHub hesabınızla giriş yapın (önerilen)

### 4.2 Proje Ekleme
1. Vercel Dashboard → "Add New..." → "Project"
2. GitHub repository'nizi seçin (`arima-crm`)
3. "Import" tıklayın

### 4.3 Build Ayarları (Otomatik Algılanır)
- Framework Preset: **Next.js** ✅
- Root Directory: `./` ✅
- Build Command: `prisma generate && prisma migrate deploy && next build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

---

## 📋 ADIM 5: Environment Variables (ÇOK ÖNEMLİ!)

Vercel Dashboard → Project → Settings → Environment Variables

### 5.1 DATABASE_URL
```
postgresql://user:password@host:5432/database?schema=public
```
**Yukarıda oluşturduğunuz PRODUCTION veritabanından alın**

**ÖNEMLİ:** Yerel `.env` dosyanızdaki DATABASE_URL'i **KULLANMAYIN** - bu production için ayrı olmalı!

### 5.2 NEXTAUTH_URL
**ÖNCE DEPLOY EDİN, SONRA GÜNCELLEYİN**

İlk deployment sonrası Vercel size bir URL verecek:
```
https://arima-crm-xxxxx.vercel.app
```

Bu URL'i kopyalayın ve `NEXTAUTH_URL` olarak ekleyin.

### 5.3 NEXTAUTH_SECRET
Terminal'de çalıştırın:
```bash
openssl rand -base64 32
```

Çıkan değeri kopyalayın (örnek: `M0dgi/b8ApNXQMv7Uz439DNBnh3NP3PE6f5VZYx9N3E=`)

### Environment Variables Ekleme
Vercel Dashboard'da:
- **Name:** `DATABASE_URL`
- **Value:** (Production veritabanı connection string)
- **Environment:** Production, Preview, Development (hepsini seçin) ✅

Aynı şekilde:
- `NEXTAUTH_URL` → Production URL (deploy sonrası)
- `NEXTAUTH_SECRET` → Oluşturduğunuz secret

---

## 📋 ADIM 6: İlk Deployment

1. Vercel Dashboard'da "Deploy" butonuna tıklayın
2. Build sürecini izleyin (2-5 dakika)
3. ✅ Başarılı olursa URL'iniz hazır: `https://your-app.vercel.app`

---

## 📋 ADIM 7: Veritabanı Migration (Production)

Deployment sonrası production veritabanına şema oluşturmanız gerekiyor.

### Yöntem 1: Prisma Migrate (Önerilen)

```bash
# Production environment variables'ı çek
cd "/Users/irfan/Desktop/arima crm"
vercel env pull .env.production

# Production veritabanına migration çalıştır
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
```

### Yöntem 2: Supabase/Neon Dashboard

1. Veritabanı dashboard'una gidin
2. SQL Editor'ü açın
3. `prisma/migrations/20251125064139_init/migration.sql` dosyasını açın
4. İçeriğini kopyalayıp SQL Editor'de çalıştırın
5. Diğer migration dosyalarını da sırayla çalıştırın:
   - `20251125071945_add_zoom_fields/migration.sql`
   - `20251125093214_add_notes_and_files/migration.sql`
   - `20251125093509_add_file_uploaded_activity/migration.sql`

### Yöntem 3: Prisma Studio (Kolay)

```bash
# Production DATABASE_URL'i geçici olarak .env'e ekleyin
# (Sadece migration için, sonra silin)

# Prisma Studio'yu açın
DATABASE_URL="production-connection-string" npx prisma studio

# Tarayıcıda açılacak, tabloları görebilirsiniz
```

---

## 📋 ADIM 8: NEXTAUTH_URL Güncelleme

1. Deployment sonrası aldığınız URL'i kopyalayın
2. Vercel Dashboard → Settings → Environment Variables
3. `NEXTAUTH_URL` değişkenini bulun
4. Değeri güncelleyin: `https://your-app.vercel.app`
5. **Redeploy yapın** (Deployments → ... → Redeploy)

---

## 📋 ADIM 9: İlk Kullanıcı Oluşturma

Production'da kullanıcı oluşturmak için:

### Yöntem 1: Register Sayfası
1. `https://your-app.vercel.app/register` adresine gidin
2. İlk admin kullanıcısını oluşturun

### Yöntem 2: Veritabanına Direkt Ekleme

Supabase/Neon SQL Editor'de:
```sql
-- Şifre: 123456 (bcrypt hash)
INSERT INTO users (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-prod-001',
  'Admin',
  'admin@yourdomain.com',
  '$2a$10$rOzJ8Z8Z8Z8Z8Z8Z8Z8ZuZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Not:** Gerçek bcrypt hash oluşturmak için:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('123456', 10).then(h => console.log(h))"
```

---

## ✅ Kontrol Listesi

- [ ] Git repository oluşturuldu ve GitHub'a yüklendi
- [ ] Production PostgreSQL veritabanı oluşturuldu
- [ ] Vercel hesabı oluşturuldu
- [ ] Vercel'e proje eklendi
- [ ] Environment Variables eklendi (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET)
- [ ] İlk deployment yapıldı
- [ ] Production veritabanına migration çalıştırıldı
- [ ] NEXTAUTH_URL güncellendi ve redeploy yapıldı
- [ ] İlk kullanıcı oluşturuldu
- [ ] Uygulama test edildi

---

## 🔄 Güncelleme Süreci (Gelecekte)

### Yeni Özellik Ekleme
```bash
# 1. Yerel olarak geliştir
# 2. Test et (localhost:3010)
# 3. Commit ve push
git add .
git commit -m "Yeni özellik eklendi"
git push

# 4. Vercel otomatik deploy eder
```

### Veritabanı Değişikliği
```bash
# 1. Prisma schema'yı güncelle
# 2. Migration oluştur
npx prisma migrate dev --name migration_name

# 3. Commit ve push
git add .
git commit -m "Database migration"
git push

# 4. Production'da migration çalıştır
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
```

---

## 🆘 Sorun Giderme

### Build Hatası
- Vercel Dashboard → Deployments → Logs kontrol edin
- Environment variables eksik olabilir
- `npm run build` lokal olarak test edin

### Veritabanı Bağlantı Hatası
- DATABASE_URL doğru mu?
- SSL bağlantısı aktif mi? (`?sslmode=require`)
- Firewall ayarları kontrol edin

### 500 Error
- Vercel logs kontrol edin
- NEXTAUTH_SECRET eksik olabilir
- Migration'lar çalıştırıldı mı?

---

## 📞 Önemli Notlar

1. **Yerel sisteminiz çalışmaya devam edecek** - hiçbir şey bozulmayacak
2. **Production ayrı bir ortam** - verileriniz karışmayacak
3. **Her deployment otomatik** - GitHub'a push yaptığınızda Vercel otomatik deploy eder
4. **Environment variables güvenli** - Vercel'de şifreli saklanır

---

## 🎉 Başarılı Deployment!

Tüm adımlar tamamlandığında:
- ✅ Production URL'iniz: `https://your-app.vercel.app`
- ✅ Yerel sistem: `http://localhost:3010` (çalışmaya devam ediyor)
- ✅ Otomatik SSL aktif
- ✅ Her push'ta otomatik deploy

**Artık uygulamanız canlıda! 🚀**

