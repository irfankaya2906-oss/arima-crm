# Sayfa Açılmıyor - Çözüm

## Durum Kontrolü

✅ **Sunucu çalışıyor** - Port 3010'da Next.js sunucusu aktif
✅ **API çalışıyor** - Dashboard API'si yanıt veriyor
✅ **Veritabanı bağlantısı** - Prisma başarıyla bağlanıyor

## Çözüm Adımları

### 1. Tarayıcıyı Kontrol Edin

**Tarayıcıda şu adresi açın:**
```
http://localhost:3010
```

**Veya direkt dashboard:**
```
http://localhost:3010/dashboard
```

### 2. Tarayıcı Konsolunu Kontrol Edin

1. Tarayıcıda **F12** tuşuna basın (veya Cmd+Option+I Mac'te)
2. **Console** sekmesine gidin
3. Kırmızı hata mesajları var mı kontrol edin
4. Hata varsa, hata mesajını paylaşın

### 3. Hard Refresh Yapın

**Windows/Linux:**
- `Ctrl + Shift + R`
- veya `Ctrl + F5`

**Mac:**
- `Cmd + Shift + R`

### 4. Tarayıcı Cache'ini Temizleyin

1. Tarayıcı ayarlarına gidin
2. "Geliştirici araçları" veya "Developer Tools" açın
3. "Application" veya "Uygulama" sekmesine gidin
4. "Clear storage" veya "Depolamayı temizle" butonuna tıklayın
5. Sayfayı yenileyin

### 5. Farklı Tarayıcı Deneyin

- Chrome
- Firefox
- Safari
- Edge

### 6. Sunucu Loglarını Kontrol Edin

Terminal'de Next.js sunucusunun çalıştığı pencerede hata mesajları var mı kontrol edin.

### 7. Sunucuyu Yeniden Başlatın

Terminal'de:
```bash
# Sunucuyu durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

## Hala Çalışmıyorsa

1. **Tarayıcı konsolundaki hata mesajını** paylaşın
2. **Terminal'deki hata mesajını** paylaşın
3. **Hangi tarayıcı kullandığınızı** belirtin
4. **Sayfa tamamen beyaz mı yoksa bir şeyler görünüyor mu?** belirtin

## Beklenen Görünüm

Sayfa açıldığında şunları görmelisiniz:
- Sol tarafta menü (Dashboard, Firmalar, Satış Hunisi, vb.)
- Üstte arama çubuğu
- Ana alanda dashboard istatistikleri (firma sayısı, müşteri sayısı, vb.)

Eğer sadece "Yükleniyor..." yazısı görünüyorsa, API'den veri çekilirken bir sorun olabilir.

