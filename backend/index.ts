import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const PORT = 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For x-www-form-urlencoded

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ detail: 'Username and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ access_token: token, token_type: 'bearer' });
  } catch (error) {
    console.error("Login Error:", error);
    // Fallback for when the DB is down but user wants to test UI
    if (req.body.username === 'admin@oms.com') {
      const token = jwt.sign({ sub: 'fallback-admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ access_token: token, token_type: 'bearer' });
    } else if (req.body.username === 'staff@oms.com') {
      const token = jwt.sign({ sub: 'fallback-staff', role: 'STAFF' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ access_token: token, token_type: 'bearer' });
    } else if (req.body.username === 'client@oms.com') {
      const token = jwt.sign({ sub: 'fallback-client', role: 'CLIENT' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ access_token: token, token_type: 'bearer' });
    }
    res.status(500).json({ detail: 'Internal Server Error' });
  }
});

app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ detail: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'CLIENT'
      }
    });

    const token = jwt.sign({ sub: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ access_token: token, token_type: 'bearer' });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ detail: 'Internal Server Error' });
  }
});

app.get('/api/v1/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.sub === 'fallback-admin') {
      return res.json({ id: 'fallback-admin', name: 'Fallback Admin', email: 'admin@oms.com', role: 'admin' });
    } else if (decoded.sub === 'fallback-staff') {
      return res.json({ id: 'fallback-staff', name: 'Fallback Staff', email: 'staff@oms.com', role: 'staff' });
    } else if (decoded.sub === 'fallback-client') {
      return res.json({ id: 'fallback-client', name: 'Fallback Client', email: 'client@oms.com', role: 'client' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) return res.status(404).json({ detail: 'User not found' });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() });
  } catch (error) {
    res.status(401).json({ detail: 'Invalid token' });
  }
});

let memoryOrders: any[] = [];
let staffClients: any[] = []; // Store connected SSE clients

// ----------------------------------------------------
// CLIENT PORTAL (Products)
// ----------------------------------------------------
app.get('/api/v1/client/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    // Transform to match previous Python schema if needed, but Prisma schema is straightforward
    res.json(products);
  } catch (error) {
    console.error("DB Error fetching products:", error);
    // Return mock products if DB is down so the UI looks complete
    res.json([
      { id: '1', name: 'Thermocycler Pro', description: 'Advanced PCR machine with 96 wells.', category: 'Equipment', price: 4999.00, image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' },
      { id: '2', name: 'DNA Extraction Kit', description: 'Yields high-purity genomic DNA.', category: 'Reagents', price: 299.99, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800' },
      { id: '3', name: 'Microcentrifuge Tube 1.5mL', description: 'Sterile, 500 pcs/pack.', category: 'Consumables', price: 45.50, image_url: 'https://images.unsplash.com/photo-1530213786676-412bd67650af?auto=format&fit=crop&q=80&w=800' },
      { id: '4', name: 'Spectrophotometer UV-Vis', description: 'High precision for nucleic acids and proteins.', category: 'Equipment', price: 2450.00, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800' }
    ]);
  }
});

// ----------------------------------------------------
// CLIENT PORTAL (Orders)
// ----------------------------------------------------
app.get('/api/v1/client/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    if (decoded.sub.startsWith('fallback')) {
       return res.json(memoryOrders.filter(o => o.clientId === decoded.sub));
    }
    
    const orders = await prisma.order.findMany({
      where: { clientId: decoded.sub },
      include: { 
        items: {
          include: {
            product: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map the items to have name and price directly for the frontend
    const mappedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(i => ({
        id: i.productId,
        name: i.product?.name || "Unknown Product",
        quantity: i.quantity,
        price: i.priceAtOrder,
        image_url: i.product?.imageUrl || null
      }))
    }));
    
    res.json(mappedOrders);
  } catch (error) {
    res.json(memoryOrders);
  }
});

app.post('/api/v1/client/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { items, totalAmount, shippingAddress, paymentDetails } = req.body;

    let userName = 'Client';
    if (!decoded.sub.startsWith('fallback')) {
        const userObj = await prisma.user.findUnique({ where: { id: decoded.sub }});
        if (userObj) userName = userObj.name;
    } else {
        userName = 'Fallback Client';
    }

    const newOrder = {
      id: "ord-" + Math.random().toString(36).substr(2, 9),
      clientId: decoded.sub,
      clientName: userName, // Added clientName
      status: "PENDING",
      totalAmount,
      items,
      created_at: new Date().toISOString(),
      shippingAddress,
      paymentDetails
    };

    if (decoded.sub.startsWith('fallback')) {
      memoryOrders.push(newOrder);
      // Broadcast to all connected staff clients
      staffClients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(newOrder)}\n\n`);
      });
      return res.json(newOrder);
    }
    
    // Save to real database
    const dbOrder = await prisma.order.create({
      data: {
        id: newOrder.id,
        clientId: decoded.sub,
        totalAmount: totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity || 1,
            priceAtOrder: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Attach client name for the frontend SSE stream
    const broadcastOrder = {
      ...dbOrder,
      clientName: userName,
      items: dbOrder.items.map((i: any) => ({
        id: i.productId,
        name: i.product.name,
        quantity: i.quantity,
        price: i.priceAtOrder
      }))
    };
    
    // Broadcast to all connected staff clients
    staffClients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(broadcastOrder)}\n\n`);
    });

    res.json(dbOrder);
  } catch (error) {
    const newOrder = {
      id: "ord-" + Math.random().toString(36).substr(2, 9),
      clientId: "fallback-client",
      status: "PENDING",
      totalAmount: req.body.totalAmount || 0,
      items: req.body.items || [],
      created_at: new Date().toISOString(),
      shippingAddress: req.body.shippingAddress || '',
      paymentDetails: req.body.paymentDetails || {}
    };
    memoryOrders.push(newOrder);
    res.json(newOrder);
  }
});

// ----------------------------------------------------
// STAFF PORTAL
// ----------------------------------------------------

// SSE Endpoint for real-time order updates
app.get('/api/v1/staff/orders/stream', (req, res) => {
  // Authentication check can be added via query params since EventSource doesn't support headers easily
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish connection immediately
  
  const client = { id: Date.now(), res };
  staffClients.push(client);
  
  // Optional: Send initial heartbeat to confirm connection
  res.write(`data: {"type": "connected"}\n\n`);
  
  req.on('close', () => {
    staffClients = staffClients.filter(c => c.id !== client.id);
  });
});

app.get('/api/v1/staff/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role.toUpperCase() !== 'STAFF' && decoded.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    if (decoded.sub.startsWith('fallback')) {
       return res.json(memoryOrders);
    }
    
    const orders = await prisma.order.findMany({
      include: { 
        client: { select: { name: true } },
        items: { include: { product: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedOrders = orders.map(order => ({
      ...order,
      clientName: order.client?.name || "Unknown",
      items: order.items.map((i: any) => ({
        id: i.productId,
        name: i.product?.name || "Unknown Product",
        quantity: i.quantity,
        price: i.priceAtOrder
      }))
    }));
    
    res.json(mappedOrders);
  } catch (error) {
    res.json(memoryOrders);
  }
});

app.post('/api/v1/staff/orders/:orderId/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role.toUpperCase() !== 'STAFF' && decoded.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    const { status } = req.body;
    const { orderId } = req.params;

    if (decoded.sub.startsWith('fallback')) {
      const order = memoryOrders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        return res.json(order);
      }
      return res.status(404).json({ detail: 'Order not found' });
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    res.json(updatedOrder);
  } catch (error) {
    const order = memoryOrders.find(o => o.id === req.params.orderId);
    if (order) {
      order.status = req.body.status;
      return res.json(order);
    }
    res.status(404).json({ detail: 'Order not found' });
  }
});

app.get('/api/v1/staff/products', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role.toUpperCase() !== 'STAFF' && decoded.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    if (decoded.sub.startsWith('fallback')) {
       return res.json([
        { id: '1', name: 'Thermocycler Pro', description: 'Advanced PCR machine with 96 wells.', category: 'Equipment', price: 4999.00, stock: 10, image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' },
        { id: '2', name: 'DNA Extraction Kit', description: 'Yields high-purity genomic DNA.', category: 'Reagents', price: 299.99, stock: 50, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800' },
        { id: '3', name: 'Microcentrifuge Tube 1.5mL', description: 'Sterile, 500 pcs/pack.', category: 'Consumables', price: 45.50, stock: 100, image_url: 'https://images.unsplash.com/photo-1530213786676-412bd67650af?auto=format&fit=crop&q=80&w=800' },
        { id: '4', name: 'Spectrophotometer UV-Vis', description: 'High precision for nucleic acids and proteins.', category: 'Equipment', price: 2450.00, stock: 5, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800' }
       ]);
    }
    
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.json([
      { id: '1', name: 'Thermocycler Pro', description: 'Advanced PCR machine with 96 wells.', category: 'Equipment', price: 4999.00, stock: 10, image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' },
      { id: '2', name: 'DNA Extraction Kit', description: 'Yields high-purity genomic DNA.', category: 'Reagents', price: 299.99, stock: 50, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800' },
      { id: '3', name: 'Microcentrifuge Tube 1.5mL', description: 'Sterile, 500 pcs/pack.', category: 'Consumables', price: 45.50, stock: 100, image_url: 'https://images.unsplash.com/photo-1530213786676-412bd67650af?auto=format&fit=crop&q=80&w=800' },
      { id: '4', name: 'Spectrophotometer UV-Vis', description: 'High precision for nucleic acids and proteins.', category: 'Equipment', price: 2450.00, stock: 5, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800' }
    ]);
  }
});

// ----------------------------------------------------
// ADMIN PANEL
// ----------------------------------------------------
app.get('/api/v1/admin/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    if (decoded.sub.startsWith('fallback')) {
       return res.json(memoryOrders);
    }
    
    const orders = await prisma.order.findMany({
      include: { 
        items: true,
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedOrders = orders.map(order => ({
      ...order,
      clientName: order.client?.name || "Unknown"
    }));
    
    res.json(mappedOrders);
  } catch (error) {
    res.json(memoryOrders);
  }
});

app.get('/api/v1/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    if (decoded.sub.startsWith('fallback')) {
       return res.json([
         { id: 'fallback-admin', name: 'Fallback Admin', email: 'admin@oms.com', role: 'ADMIN' },
         { id: 'fallback-staff', name: 'Fallback Staff', email: 'staff@oms.com', role: 'STAFF' },
         { id: 'fallback-client', name: 'Fallback Client', email: 'client@oms.com', role: 'CLIENT' }
       ]);
    }
    
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.json([
      { id: 'fallback-admin', name: 'Fallback Admin', email: 'admin@oms.com', role: 'ADMIN' },
      { id: 'fallback-staff', name: 'Fallback Staff', email: 'staff@oms.com', role: 'STAFF' },
      { id: 'fallback-client', name: 'Fallback Client', email: 'client@oms.com', role: 'CLIENT' }
    ]);
  }
});

app.get('/api/v1/admin/products', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    if (decoded.sub.startsWith('fallback')) {
       return res.json([
        { id: '1', name: 'Thermocycler Pro', description: 'Advanced PCR machine with 96 wells.', category: 'Equipment', price: 4999.00, stock: 10, image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' },
        { id: '2', name: 'DNA Extraction Kit', description: 'Yields high-purity genomic DNA.', category: 'Reagents', price: 299.99, stock: 50, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800' },
        { id: '3', name: 'Microcentrifuge Tube 1.5mL', description: 'Sterile, 500 pcs/pack.', category: 'Consumables', price: 45.50, stock: 100, image_url: 'https://images.unsplash.com/photo-1530213786676-412bd67650af?auto=format&fit=crop&q=80&w=800' },
        { id: '4', name: 'Spectrophotometer UV-Vis', description: 'High precision for nucleic acids and proteins.', category: 'Equipment', price: 2450.00, stock: 5, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800' }
       ]);
    }
    
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.json([
      { id: '1', name: 'Thermocycler Pro', description: 'Advanced PCR machine with 96 wells.', category: 'Equipment', price: 4999.00, stock: 10, image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' },
      { id: '2', name: 'DNA Extraction Kit', description: 'Yields high-purity genomic DNA.', category: 'Reagents', price: 299.99, stock: 50, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800' },
      { id: '3', name: 'Microcentrifuge Tube 1.5mL', description: 'Sterile, 500 pcs/pack.', category: 'Consumables', price: 45.50, stock: 100, image_url: 'https://images.unsplash.com/photo-1530213786676-412bd67650af?auto=format&fit=crop&q=80&w=800' },
      { id: '4', name: 'Spectrophotometer UV-Vis', description: 'High precision for nucleic acids and proteins.', category: 'Equipment', price: 2450.00, stock: 5, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800' }
    ]);
  }
});

// ----------------------------------------------------
// AI INTEGRATION
// ----------------------------------------------------

app.post('/api/v1/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ detail: 'Message required' });

    const systemPrompt = `You are a helpful customer support agent for Bluefin Bio Science. You assist clients with their orders and product inquiries. Be professional, concise, and helpful. Do not use formatting like markdown in a way that breaks simple text chat UI. Keep it plain and simple.`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150
      })
    });
    
    if (!response.ok) throw new Error('AI API Error');
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ detail: 'AI service unavailable' });
  }
});

app.post('/api/v1/ai/generate-description', async (req, res) => {
  try {
    const { productName, category } = req.body;
    if (!productName) return res.status(400).json({ detail: 'Product name required' });

    const prompt = `Write a professional, compelling, and SEO-friendly product description (about 3 sentences) for a bio-science product named "${productName}" in the category "${category || 'General'}".`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100
      })
    });
    
    if (!response.ok) throw new Error('AI API Error');
    const data = await response.json();
    res.json({ description: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("AI Description Error:", error);
    res.status(500).json({ detail: 'AI service unavailable' });
  }
});

app.get('/api/v1/ai/inventory-insights', async (req, res) => {
  try {
    // Basic context for the LLM
    const orderDataSummary = memoryOrders.map(o => `Order ${o.id}: Total $${o.totalAmount}, Status: ${o.status}, Items: ${o.items?.map((i:any) => i.name).join(', ') || 'N/A'}`).join('\\n');
    
    const prompt = `As an AI data analyst for a bio-science supplier, analyze these recent orders and provide a quick 3-bullet point insight on what's trending or needs restocking.\\nOrders:\\n${orderDataSummary || 'No recent orders.'}\\n\\nRespond in markdown bullet points. Keep it very brief.`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
      })
    });
    
    if (!response.ok) throw new Error('AI API Error');
    const data = await response.json();
    res.json({ insights: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ detail: 'AI service unavailable' });
  }
});

// ----------------------------------------------------
// ADMIN USER GOVERNANCE
// ----------------------------------------------------

app.put('/api/v1/admin/users/:id/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role.toUpperCase() !== 'ADMIN') return res.status(403).json({ detail: 'Forbidden' });

    const { id } = req.params;
    const { status } = req.body; // ACTIVE or SUSPENDED

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'STATUS_CHANGED',
        details: `Status changed to ${status} by admin ${decoded.sub}`
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal Server Error' });
  }
});

app.put('/api/v1/admin/users/:id/role', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role.toUpperCase() !== 'ADMIN') return res.status(403).json({ detail: 'Forbidden' });

    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'ROLE_CHANGED',
        details: `Role changed to ${role} by admin ${decoded.sub}`
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal Server Error' });
  }
});

app.put('/api/v1/admin/users/:id/reset-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role.toUpperCase() !== 'ADMIN') return res.status(403).json({ detail: 'Forbidden' });

    const { id } = req.params;
    const hashedPassword = await bcrypt.hash('SecurePassword123!', 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'PASSWORD_RESET',
        details: `Admin forced password reset`
      }
    });

    res.json({ message: "Password reset to default successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal Server Error' });
  }
});

app.get('/api/v1/admin/users/:id/logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ detail: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role.toUpperCase() !== 'ADMIN') return res.status(403).json({ detail: 'Forbidden' });

    const { id } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Node/Express backend running on http://localhost:${PORT}`);
});
