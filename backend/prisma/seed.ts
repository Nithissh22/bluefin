import { PrismaClient } from '@prisma/client';
const Role = { CLIENT: 'CLIENT', STAFF: 'STAFF', ADMIN: 'ADMIN' };
const OrderStatus = { PENDING: 'PENDING', CONFIRMED: 'CONFIRMED', PROCESSING: 'PROCESSING', PACKING: 'PACKING', READY_TO_SHIP: 'READY_TO_SHIP', SHIPPED: 'SHIPPED', DELIVERED: 'DELIVERED', CANCELLED: 'CANCELLED' };
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic Coimbatore/TN Bio-Science data...');

  // --- Clean existing data ---
  await prisma.notificationLog.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // --- 1. SEED ADMINS ---
  console.log('Seeding Admins...');
  const admin1 = await prisma.user.create({
    data: {
      name: 'Dr. Srinivasan R',
      email: 'admin@bluefin.com',
      password: passwordHash,
      role: Role.ADMIN,
      phone: '+91 9876543210',
      address: 'Bluefin HQ, RS Puram, Coimbatore',
    },
  });

  // --- 2. SEED STAFF ---
  console.log('Seeding Staff...');
  const staffNames = [
    'Karthik N', 'Priya M', 'Suresh Kumar', 'Deepa S', 'Manoj T',
    'Arun Prakash', 'Divya Ramachandran', 'Vignesh K', 'Saranya P', 'Prabhu V'
  ];
  
  const staffIds: string[] = [];
  for (let i = 0; i < staffNames.length; i++) {
    const staff = await prisma.user.create({
      data: {
        name: staffNames[i],
        email: `staff${i + 1}@bluefin.com`,
        password: passwordHash,
        role: Role.STAFF,
        phone: `+91 980000000${i}`,
      }
    });
    staffIds.push(staff.id);
  }

  // --- 3. SEED CLIENTS ---
  console.log('Seeding Clients...');
  const clientsData = [
    { name: 'Kovai Medical Center & Hospital (KMCH)', address: 'Avinashi Road, Coimbatore' },
    { name: 'Ganga Hospital Diagnostics', address: 'Mettupalayam Road, Coimbatore' },
    { name: 'PSG Institute of Medical Sciences', address: 'Peelamedu, Coimbatore' },
    { name: 'Ramakrishna Hospital Lab', address: 'Avarampalayam, Coimbatore' },
    { name: 'Aarthi Scans & Labs', address: 'RS Puram, Coimbatore' },
    { name: 'Micro Labs Diagnostics', address: 'Gandhipuram, Coimbatore' },
    { name: 'Gem Hospital Research Center', address: 'Pankaja Mill Road, Coimbatore' },
    { name: 'Royal Care Super Speciality Lab', address: 'Neelambur, Coimbatore' },
    { name: 'KG Hospital Blood Bank', address: 'Arts College Road, Coimbatore' },
    { name: 'Neuberg Diagnostics Coimbatore', address: 'Trichy Road, Coimbatore' },
  ];

  const clientIds: string[] = [];
  for (let i = 0; i < clientsData.length; i++) {
    const client = await prisma.user.create({
      data: {
        name: clientsData[i].name,
        email: `purchase@client${i + 1}.com`,
        password: passwordHash,
        role: Role.CLIENT,
        phone: `+91 970000000${i}`,
        address: clientsData[i].address,
      }
    });
    clientIds.push(client.id);
  }

  // --- 4. SEED PRODUCTS ---
  console.log('Seeding Products...');
  const productsData = [
    // Reagents & Chemicals
    { name: 'Phosphate Buffered Saline (PBS) 1X', category: 'Laboratory Reagents', unit: 'Litre', price: 450, stock: 120, desc: 'Sterile, pH 7.4 buffer solution for cell culture and molecular biology.' },
    { name: 'Tris-HCl Buffer (pH 8.0)', category: 'Laboratory Reagents', unit: '500ml', price: 850, stock: 45, desc: 'Pre-mixed buffer for DNA/RNA extraction.' },
    { name: 'Gram Staining Kit', category: 'Laboratory Reagents', unit: 'Kit', price: 1200, stock: 30, desc: 'Complete set for differential staining of bacteria.' },
    // Diagnostic Kits
    { name: 'Dengue NS1 Ag Rapid Test', category: 'Diagnostic Kits', unit: 'Box of 25', price: 3500, stock: 200, desc: 'Rapid immunochromatographic test for Dengue NS1 antigen.' },
    { name: 'HbA1c Direct Enzymatic Kit', category: 'Diagnostic Kits', unit: 'Pack', price: 4200, stock: 80, desc: 'Quantitative determination of glycated hemoglobin.' },
    { name: 'Typhoid IgG/IgM Rapid Combo', category: 'Diagnostic Kits', unit: 'Box of 30', price: 2800, stock: 150, desc: 'Rapid diagnostic test for Typhoid fever.' },
    // Consumables
    { name: 'Eppendorf Tubes 1.5ml (Sterile)', category: 'Lab Consumables', unit: 'Pack of 500', price: 650, stock: 500, desc: 'DNase/RNase free microcentrifuge tubes.' },
    { name: 'Nitrile Examination Gloves (Powder Free)', category: 'Lab Consumables', unit: 'Box of 100', price: 480, stock: 1000, desc: 'Medical grade nitrile gloves, blue.' },
    { name: 'Petri Dishes 90mm (Sterile)', category: 'Lab Consumables', unit: 'Sleeve of 20', price: 320, stock: 400, desc: 'Polystyrene petri dishes for bacterial culture.' },
    { name: 'Filter Pipette Tips 200µl', category: 'Lab Consumables', unit: 'Rack of 96', price: 850, stock: 150, desc: 'Low retention, sterile filter tips.' },
    // Equipment
    { name: 'Binocular Light Microscope', category: 'Lab Equipment', unit: 'Unit', price: 24500, stock: 12, desc: 'LED illumination, 1000x magnification, oil immersion.' },
    { name: 'Clinical Microcentrifuge (14000 RPM)', category: 'Lab Equipment', unit: 'Unit', price: 32000, stock: 5, desc: 'High-speed compact centrifuge with 24-place rotor.' },
    { name: 'BOD Incubator 150L', category: 'Lab Equipment', unit: 'Unit', price: 65000, stock: 3, desc: 'Digital temperature control for biochemical oxygen demand testing.' },
    { name: 'Semi-Auto Biochemistry Analyzer', category: 'Lab Equipment', unit: 'Unit', price: 125000, stock: 2, desc: 'Touch screen analyzer with built-in incubator and printer.' },
    // PPE
    { name: 'Reusable Cotton Lab Coat', category: 'PPE & Safety', unit: 'Unit', price: 850, stock: 250, desc: 'White lab coat, full sleeves, heavy duty.' },
    { name: 'Biohazard Waste Bags (Red, Large)', category: 'PPE & Safety', unit: 'Pack of 50', price: 550, stock: 300, desc: 'Autoclavable biohazard disposal bags.' }
  ];

  const products: any[] = [];
  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        category: p.category,
        unit: p.unit,
        price: p.price,
        stock: p.stock,
      }
    });
    products.push(product);
  }

  // --- 5. SEED ORDERS ---
  console.log('Seeding Orders...');
  const orderStatuses = Object.values(OrderStatus);
  
  for (let i = 0; i < 20; i++) {
    // Pick a random client and staff
    const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
    const staffId = staffIds[Math.floor(Math.random() * staffIds.length)];
    
    // Pick a targeted status to ensure we cover all 7 states
    const status = orderStatuses[i % orderStatuses.length];

    // Pick 1-3 random products
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 5) + 1;
      items.push({
        productId: product.id,
        quantity: qty,
        priceAtOrder: product.price
      });
      totalAmount += product.price * qty;
    }

    // Past date for realistic timeline
    const daysAgo = Math.floor(Math.random() * 14);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const order = await prisma.order.create({
      data: {
        id: `BBS-2026-${(i + 1).toString().padStart(4, '0')}`,
        clientId,
        assignedStaffId: status !== OrderStatus.PENDING ? staffId : null,
        status,
        totalAmount,
        createdAt,
        items: {
          create: items
        },
        statusHistory: {
          create: [
            {
              status: OrderStatus.PENDING,
              changedBy: clientId, // Client placed order
              createdAt: createdAt
            }
          ]
        }
      }
    });

    // If order has progressed past PENDING, add more history records
    if (status !== OrderStatus.PENDING) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: status,
          changedBy: staffId,
          notes: `Updated to ${status}`,
          createdAt: new Date(createdAt.getTime() + 86400000) // 1 day later
        }
      });
    }
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
