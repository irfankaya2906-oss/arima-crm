import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding başlıyor...')

  // Kullanıcılar
  const hashedPassword = await bcrypt.hash('123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arima.com' },
    update: {},
    create: {
      email: 'admin@arima.com',
      name: 'Admin Kullanıcı',
      phone: '+90 555 000 0001',
      role: 'ADMIN',
      passwordHash: hashedPassword,
    },
  })

  const sales = await prisma.user.upsert({
    where: { email: 'satis@arima.com' },
    update: {},
    create: {
      email: 'satis@arima.com',
      name: 'Satış Temsilcisi',
      phone: '+90 555 000 0002',
      role: 'SALES',
      passwordHash: hashedPassword,
    },
  })

  const operations = await prisma.user.upsert({
    where: { email: 'operasyon@arima.com' },
    update: {},
    create: {
      email: 'operasyon@arima.com',
      name: 'Operasyon Uzmanı',
      phone: '+90 555 000 0003',
      role: 'OPERATIONS',
      passwordHash: hashedPassword,
    },
  })

  console.log('Kullanıcılar oluşturuldu')

  // Firmalar
  const companies = [
    {
      companyName: 'Teknoloji A.Ş.',
      sector: 'Teknoloji',
      region: 'İstanbul',
      size: '50-100',
      website: 'https://teknoloji.com',
      phone: '+90 212 555 0001',
      email: 'info@teknoloji.com',
      address: 'Maslak, İstanbul',
      status: 'MUSTERI' as const,
      lastContactDate: new Date(),
      description: 'Teknoloji sektöründe faaliyet gösteren müşteri firması',
      createdById: admin.id,
    },
    {
      companyName: 'Yazılım Bilişim Ltd.',
      sector: 'Yazılım',
      region: 'Ankara',
      size: '20-50',
      website: 'https://yazilim.com',
      phone: '+90 312 555 0002',
      email: 'info@yazilim.com',
      address: 'Çankaya, Ankara',
      status: 'SICAK' as const,
      lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'Yazılım geliştirme hizmeti veren sıcak aday',
      createdById: sales.id,
    },
    {
      companyName: 'Dijital Pazarlama A.Ş.',
      sector: 'Pazarlama',
      region: 'İzmir',
      size: '10-20',
      website: 'https://dijital.com',
      phone: '+90 232 555 0003',
      email: 'info@dijital.com',
      address: 'Konak, İzmir',
      status: 'ADAY' as const,
      lastContactDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      description: 'Dijital pazarlama hizmetleri',
      createdById: sales.id,
    },
    {
      companyName: 'E-Ticaret Çözümleri',
      sector: 'E-Ticaret',
      region: 'Bursa',
      size: '100+',
      website: 'https://eticaret.com',
      phone: '+90 224 555 0004',
      email: 'info@eticaret.com',
      address: 'Nilüfer, Bursa',
      status: 'MUSTERI' as const,
      lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: 'Büyük ölçekli e-ticaret platformu',
      createdById: admin.id,
    },
    {
      companyName: 'Danışmanlık Hizmetleri',
      sector: 'Danışmanlık',
      region: 'Antalya',
      size: '5-10',
      website: 'https://danismanlik.com',
      phone: '+90 242 555 0005',
      email: 'info@danismanlik.com',
      address: 'Muratpaşa, Antalya',
      status: 'SOGUK' as const,
      lastContactDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      description: 'İş danışmanlığı hizmetleri',
      createdById: sales.id,
    },
  ]

  const createdCompanies = []
  for (const companyData of companies) {
    const company = await prisma.company.create({
      data: companyData,
    })
    createdCompanies.push(company)

    // Activity log
    await prisma.activity.create({
      data: {
        companyId: company.id,
        userId: companyData.createdById,
        activityType: 'COMPANY_CREATED',
        description: `${company.companyName} firması oluşturuldu`,
      },
    })
  }

  console.log('Firmalar oluşturuldu')

  // Yetkililer
  const contacts = [
    {
      companyId: createdCompanies[0].id,
      fullName: 'Ahmet Yılmaz',
      position: 'Genel Müdür',
      phone: '+90 555 111 0001',
      email: 'ahmet@teknoloji.com',
      notes: 'Karar verici kişi',
    },
    {
      companyId: createdCompanies[0].id,
      fullName: 'Ayşe Demir',
      position: 'IT Müdürü',
      phone: '+90 555 111 0002',
      email: 'ayse@teknoloji.com',
    },
    {
      companyId: createdCompanies[1].id,
      fullName: 'Mehmet Kaya',
      position: 'Kurucu',
      phone: '+90 555 222 0001',
      email: 'mehmet@yazilim.com',
    },
  ]

  for (const contactData of contacts) {
    const contact = await prisma.contact.create({
      data: contactData,
    })

    await prisma.activity.create({
      data: {
        companyId: contactData.companyId,
        userId: sales.id,
        activityType: 'CONTACT_ADDED',
        description: `${contact.fullName} yetkilisi eklendi`,
      },
    })
  }

  console.log('Yetkililer oluşturuldu')

  // Satış Fırsatları
  const opportunities = [
    {
      companyId: createdCompanies[0].id,
      title: 'Yıllık Yazılım Lisansı',
      value: 50000,
      probability: 80,
      stage: 'TEKLIF' as const,
      nextAction: 'Teklif onayı bekleniyor',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Yıllık lisans anlaşması',
    },
    {
      companyId: createdCompanies[1].id,
      title: 'Özel Yazılım Geliştirme',
      value: 150000,
      probability: 60,
      stage: 'DEMO' as const,
      nextAction: 'Demo sunumu planlanıyor',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'Özel proje geliştirme',
    },
    {
      companyId: createdCompanies[2].id,
      title: 'Dijital Pazarlama Paketi',
      value: 30000,
      probability: 40,
      stage: 'NITELIKLI' as const,
      nextAction: 'İhtiyaç analizi',
      notes: 'Aylık pazarlama paketi',
    },
    {
      companyId: createdCompanies[3].id,
      title: 'E-Ticaret Platform Güncelleme',
      value: 200000,
      probability: 90,
      stage: 'PAZARLIK' as const,
      nextAction: 'Fiyat görüşmesi',
      notes: 'Platform modernizasyonu',
    },
  ]

  for (const oppData of opportunities) {
    const opportunity = await prisma.opportunity.create({
      data: oppData,
    })

    await prisma.activity.create({
      data: {
        companyId: oppData.companyId,
        userId: sales.id,
        activityType: 'OPPORTUNITY_CREATED',
        description: `${opportunity.title} fırsatı oluşturuldu (${opportunity.value} TL)`,
      },
    })
  }

  console.log('Satış fırsatları oluşturuldu')

  // Toplantılar
  const meetings = [
    {
      companyId: createdCompanies[0].id,
      contactId: (await prisma.contact.findFirst({ where: { companyId: createdCompanies[0].id } }))?.id,
      createdById: sales.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: 'YUZYUZE' as const,
      summary: 'Yıllık lisans görüşmesi',
      nextStep: 'Teklif hazırlama',
    },
    {
      companyId: createdCompanies[1].id,
      contactId: (await prisma.contact.findFirst({ where: { companyId: createdCompanies[1].id } }))?.id,
      createdById: sales.id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: 'ONLINE' as const,
      summary: 'Demo sunumu',
      nextStep: 'Teknik detaylar',
    },
  ]

  for (const meetingData of meetings) {
    if (meetingData.contactId) {
      const meeting = await prisma.meeting.create({
        data: meetingData,
      })

      await prisma.company.update({
        where: { id: meetingData.companyId },
        data: { lastContactDate: meeting.date },
      })

      await prisma.activity.create({
        data: {
          companyId: meetingData.companyId,
          userId: sales.id,
          activityType: 'MEETING_CREATED',
          description: `${meeting.type} görüşmesi oluşturuldu`,
        },
      })
    }
  }

  console.log('Toplantılar oluşturuldu')

  // Görevler
  const tasks = [
    {
      assignedToId: sales.id,
      createdById: admin.id,
      companyId: createdCompanies[0].id,
      title: 'Teklif hazırlama',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'TODO' as const,
      notes: 'Yıllık lisans teklifi hazırlanacak',
    },
    {
      assignedToId: sales.id,
      createdById: admin.id,
      companyId: createdCompanies[1].id,
      title: 'Demo sunumu hazırlığı',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS' as const,
      notes: 'Demo materyalleri hazırlanıyor',
    },
    {
      assignedToId: operations.id,
      createdById: admin.id,
      companyId: createdCompanies[2].id,
      title: 'İhtiyaç analizi',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'TODO' as const,
    },
  ]

  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: taskData,
    })

    if (taskData.companyId) {
      await prisma.activity.create({
        data: {
          companyId: taskData.companyId,
          userId: admin.id,
          activityType: 'TASK_CREATED',
          description: `${task.title} görevi oluşturuldu`,
        },
      })
    }
  }

  console.log('Görevler oluşturuldu')
  console.log('Seeding tamamlandı!')

  console.log('\nDemo kullanıcı bilgileri:')
  console.log('Admin: admin@arima.com / 123456')
  console.log('Satış: satis@arima.com / 123456')
  console.log('Operasyon: operasyon@arima.com / 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




