# Sunucuyu Yeniden Başlatma

Next.js sunucusu durduruldu. Şimdi yeniden başlatmanız gerekiyor.

## Adımlar:

1. **Terminal'de şu komutu çalıştırın:**

```bash
npm run dev
```

2. **Tarayıcıyı tamamen kapatıp yeniden açın** (veya Ctrl+Shift+R / Cmd+Shift+R ile hard refresh yapın)

3. **Firma kaydetmeyi tekrar deneyin**

## Sorun Devam Ederse:

Eğer hala "User `user` was denied access" hatası alıyorsanız:

1. `.env` dosyasını kontrol edin:
```bash
cat .env
```

2. `DATABASE_URL` şu şekilde olmalı:
```env
DATABASE_URL="postgresql://irfan@localhost:5432/arima_crm?schema=public"
```

3. Eğer farklıysa, düzeltin ve sunucuyu yeniden başlatın.

4. Prisma Client'ı yeniden oluşturun:
```bash
npx prisma generate
```

5. Sunucuyu yeniden başlatın:
```bash
npm run dev
```

