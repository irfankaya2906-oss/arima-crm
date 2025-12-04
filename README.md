# Arima CRM

Modern, hızlı ve profesyonel bir CRM uygulaması.

## Teknolojiler

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/UI**
- **Prisma** + **PostgreSQL**
- **Zustand** (State Management)
- **NextAuth** (Authentication)
- **React Beautiful DnD** (Drag & Drop)

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. PostgreSQL veritabanını hazırlayın ve `.env` dosyası oluşturun:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/arima_crm?schema=public"
NEXTAUTH_URL="http://localhost:3010"
NEXTAUTH_SECRET="your-secret-key-here"
```

3. Prisma veritabanını oluşturun:
```bash
npx prisma generate
npx prisma db push
```

4. Demo verileri yükleyin:
```bash
npm run db:seed
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Demo Kullanıcılar

- **Admin**: admin@arima.com / 123456
- **Satış**: satis@arima.com / 123456
- **Operasyon**: operasyon@arima.com / 123456

## Özellikler

### Dashboard
- Toplam firma ve müşteri sayıları
- Aylık satış fırsatı değeri
- Bugünkü görevler
- Yaklaşan toplantılar
- Son aktiviteler timeline
- Risk uyarıları (30+ gün iletişim kurulmamış firmalar)

### Firma Yönetimi
- Firma listesi (filtreleme, arama, sıralama)
- Firma detay sayfası (sekme yapısı):
  - Genel bilgiler
  - Yetkililer
  - Görüşmeler
  - Satış fırsatları
  - Görevler
  - Aktivite log
- WhatsApp ve Email hızlı erişim

### Satış Hunisi (Pipeline)
- Kanban board görünümü
- Drag & drop ile aşama değiştirme
- Aşama bazlı toplam değer hesaplama
- Fırsat olasılık göstergesi

### Toplantılar
- Bugün yapılacak toplantılar widget'ı
- Yaklaşan toplantılar listesi
- Toplantı ekleme ve yönetimi

### Görev Yönetimi
- Görev listesi ve filtreleme
- Geciken görevler uyarısı
- Bugünkü görevler
- Görev durumu yönetimi

## Rol Bazlı Erişim

- **ADMIN**: Tüm yetkiler
- **SALES**: Satış ve müşteri yönetimi
- **OPERATIONS**: Operasyonel görevler

## UI Tasarım

- Sade ve kurumsal tasarım
- Arima ERP'ye uygun renk paleti:
  - Beyaz
  - Gri
  - Lacivert (Primary)
  - Turkuaz (Secondary)
- Mobil uyumlu

## Veritabanı Modelleri

- User (Kullanıcı)
- Company (Firma)
- Contact (Yetkili)
- Opportunity (Satış Fırsatı)
- Meeting (Görüşme)
- Task (Görev)
- Activity (Aktivite Log)

## API Routes

Tüm CRUD işlemleri için RESTful API endpoint'leri:
- `/api/companies`
- `/api/opportunities`
- `/api/contacts`
- `/api/meetings`
- `/api/tasks`
- `/api/dashboard`

## Geliştirme

```bash
# Veritabanı değişikliklerini uygula
npm run db:push

# Prisma Client'ı yeniden oluştur
npm run db:generate

# Seeding
npm run db:seed
```

## Deployment (Yayınlama)

### Vercel ile Deployment (Önerilen)

1. **Vercel hesabı oluşturun**: [vercel.com](https://vercel.com) adresinden ücretsiz hesap oluşturun

2. **Vercel CLI ile deployment**:
```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Projeyi deploy edin
vercel

# Production'a deploy edin
vercel --prod
```

3. **Vercel Dashboard üzerinden**:
   - [vercel.com/new](https://vercel.com/new) adresine gidin
   - GitHub/GitLab/Bitbucket repo'nuzu bağlayın
   - Environment Variables ekleyin:
     - `DATABASE_URL`: PostgreSQL veritabanı bağlantı string'i
     - `NEXTAUTH_URL`: Production URL'iniz (örn: `https://your-app.vercel.app`)
     - `NEXTAUTH_SECRET`: Güvenli bir secret key (rastgele string)
   - Deploy butonuna tıklayın

4. **PostgreSQL Veritabanı**:
   - Vercel Postgres, Supabase, Neon, veya Railway gibi servislerden PostgreSQL veritabanı oluşturun
   - Veritabanı bağlantı URL'ini `DATABASE_URL` environment variable olarak ekleyin

5. **Prisma Migration**:
   - Vercel deployment sonrası, veritabanı migration'larını çalıştırın:
   ```bash
   npx prisma migrate deploy
   ```
   - Veya Vercel Build Command'a ekleyin:
   ```json
   {
     "buildCommand": "prisma generate && prisma migrate deploy && next build"
   }
   ```

### Diğer Platformlar

**Netlify**:
- Netlify Next.js plugin'i ile otomatik deployment
- Environment variables'ı Netlify dashboard'dan ekleyin

**Railway/Render**:
- Git repo'yu bağlayın
- PostgreSQL addon ekleyin
- Environment variables'ı ayarlayın
- Build command: `npm run build`
- Start command: `npm start`

### Production Environment Variables

Production ortamında şu environment variables'ları ayarlayın:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"
```

### Build Test

Deployment öncesi build'i test edin:

```bash
npm run build
npm start
```

## Lisans

Bu proje özel bir projedir.


