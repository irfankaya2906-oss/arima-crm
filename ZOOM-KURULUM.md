# Zoom Entegrasyonu Kurulum Rehberi

## Gereksinimler

Zoom entegrasyonu için Zoom API credentials'larına ihtiyacınız var.

## Adımlar

### 1. Zoom Developer Console'dan API Bilgilerini Alın

1. [Zoom Marketplace](https://marketplace.zoom.us/) adresine gidin
2. "Develop" > "Build App" seçin
3. "Server-to-Server OAuth" app tipini seçin
4. App bilgilerini doldurun ve oluşturun
5. App'in "Basic Information" sayfasından şu bilgileri alın:
   - **Account ID** (ZOOM_ACCOUNT_ID)
   - **Client ID** (ZOOM_CLIENT_ID)
   - **Client Secret** (ZOOM_CLIENT_SECRET)

### 2. .env Dosyasını Güncelleyin

Proje kök dizinindeki `.env` dosyasına şu satırları ekleyin:

```env
ZOOM_ACCOUNT_ID="your_account_id_here"
ZOOM_CLIENT_ID="your_client_id_here"
ZOOM_CLIENT_SECRET="your_client_secret_here"
```

### 3. Veritabanı Migration'ını Uygulayın

Migration zaten oluşturuldu. Eğer uygulanmadıysa:

```bash
npx prisma migrate dev
```

### 4. Kullanım

1. **Toplantılar** sayfasına gidin
2. **"Yeni Toplantı"** butonuna tıklayın
3. Firma ve tarih seçin
4. **"Zoom Toplantısı Oluştur"** butonuna tıklayın
5. Zoom toplantısı otomatik oluşturulacak ve link gösterilecek

## Özellikler

- ✅ Zoom toplantısı otomatik oluşturma
- ✅ Toplantı linki ve şifre kaydetme
- ✅ Toplantı listesinde Zoom linki görüntüleme
- ✅ Tek tıkla Zoom'a katılma

## Notlar

- Zoom API credentials olmadan "Zoom Toplantısı Oluştur" butonu çalışmaz
- Normal toplantı oluşturma (Zoom olmadan) hala çalışır
- Zoom toplantıları otomatik olarak "ONLINE" tipinde kaydedilir

