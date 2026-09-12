import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import { getDb, getDbStatus } from './server/db';
import { authenticateUser, requireAuth } from './server/middleware/auth';
import { authRouter } from './server/routes/auth';
import { problemsRouter } from './server/routes/problems';
import { publicRouter } from './server/routes/public';
import { innovationsRouter } from './server/routes/innovations';
import { consultationsRouter } from './server/routes/consultations';
import { uploadRouter } from './server/routes/upload';
import { notificationsRouter } from './server/routes/notifications';
import { adminRouter } from './server/routes/admin';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Static uploads folder for evidence files
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Attach user authentication state to every incoming request
app.use(authenticateUser);

// Initialize lazy Gemini client
let genAI: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'healthy',
    name: 'CivicBridge API',
    version: '2.0.0',
    database: dbStatus,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. MOUNT CORE BUSINESS ROUTERS
// ==========================================
app.use('/api/auth', authRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/public', publicRouter);
app.use('/api/innovations', innovationsRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// ==========================================
// 3. AI SERVICES (FREE TIER ONLY WITH ROBUST FALLBACK)
// ==========================================

// Deterministic fallback classifier for high reliability without paid APIs
function deterministicCivicClassifier(title: string, description: string, address: string = '') {
  const text = `${title} ${description} ${address}`.toLowerCase();

  let category = 'Roads & Infrastructure';
  let suggestedDepartment = 'Municipal Road Maintenance & Civil Infrastructure';
  let suggestedPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let priorityScore = 65;
  const reasoning: string[] = [];
  const keyEntities: string[] = [];

  if (/(water|leak|pipe|burst|drain|sewage|gutter|nalah|drinking water|pipeline)/.test(text)) {
    category = 'Water & Drainage';
    suggestedDepartment = 'Water Supply & Sewerage Board';
    reasoning.push('Detected keywords related to water supply, drainage, or sewage networks.');
    keyEntities.push('Water Pipeline/Drainage Infrastructure');
  } else if (/(garbage|waste|trash|dump|sanitation|kachra|smell|dead animal|litter)/.test(text)) {
    category = 'Sanitation & Solid Waste';
    suggestedDepartment = 'Solid Waste Management & Public Sanitation';
    reasoning.push('Contains terms referencing waste accumulation or sanitary hazards.');
    keyEntities.push('Solid Waste / Sanitation');
  } else if (/(light|dark|streetlight|lamp|pole|blackout|high mast|wire|electric)/.test(text)) {
    category = 'Public Safety & Streetlighting';
    suggestedDepartment = 'Electrical Works & Streetlighting Department';
    reasoning.push('Identified issues with illumination or electrical street infrastructure.');
    keyEntities.push('Streetlighting');
  } else if (/(mosquito|dengue|malaria|clinic|hospital|doctor|epidemic|fogging)/.test(text)) {
    category = 'Healthcare & Sanitation';
    suggestedDepartment = 'Public Health & Vector Control';
    reasoning.push('Mentions public health hazards, disease vectors, or medical facilities.');
    keyEntities.push('Public Health');
  } else if (/(traffic|signal|jam|bus|stop|auto|crossing|footpath|zebra)/.test(text)) {
    category = 'Public Transport & Traffic';
    suggestedDepartment = 'Town Planning & Traffic Engineering';
    reasoning.push('Pertains to urban mobility, signals, or traffic congestion.');
    keyEntities.push('Traffic & Mobility');
  } else {
    reasoning.push('Defaulted to civil roads and municipal infrastructure based on general civic patterns.');
    keyEntities.push('Civil Infrastructure');
  }

  // Priority scoring
  if (/(danger|emergency|collapse|burst|accident|spark|electrocution|death|flood|critical|severe|life)/.test(text)) {
    suggestedPriority = 'Critical';
    priorityScore = 95;
    reasoning.push('Elevated to Critical: Contains terms indicating imminent public safety or infrastructure hazards.');
  } else if (/(huge|blocked|broken|major|urgent|hospital|school|deep)/.test(text)) {
    suggestedPriority = 'High';
    priorityScore = 82;
    reasoning.push('Elevated to High: Indicates substantial public disruption or proximity to essential services.');
  } else if (/(minor|small|slow|request)/.test(text)) {
    suggestedPriority = 'Low';
    priorityScore = 40;
    reasoning.push('Set to Low: Expresses routine or non-disruptive civic maintenance.');
  }

  return {
    category,
    suggestedDepartment,
    suggestedPriority,
    priorityScore,
    reasoning,
    keyIdentifiedEntities: keyEntities,
    tags: [category.toLowerCase().replace(/[^a-z0-9]/g, '-')],
    summaryForOfficers: `${category} issue: ${title.slice(0, 100)}`,
    isPreliminary: true,
    generatedAt: new Date().toISOString(),
  };
}

// POST /api/ai/classify - Gemini 2.5 Flash Free Tier with Deterministic Fallback
app.post('/api/ai/classify', requireAuth, async (req: Request, res: Response) => {
  const { title = '', description = '', location = '' } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: 'Title or description is required for classification.' });
  }

  const fallback = deterministicCivicClassifier(title, description, location);
  const ai = getGemini();

  if (!ai) {
    return res.json({
      success: true,
      data: fallback,
      source: 'deterministic_engine',
    });
  }

  try {
    const prompt = `You are CivicBridge AI, an intelligent municipal triage engine for Indian local government administrations.
Analyze the following civic complaint submitted by a citizen and produce a structured classification:

Complaint Title: "${title}"
Complaint Details: "${description}"
Location: "${location}"

Departments:
1. "Municipal Road Maintenance & Civil Infrastructure"
2. "Water Supply & Sewerage Board"
3. "Solid Waste Management & Public Sanitation"
4. "Electrical Works & Streetlighting Department"
5. "Public Health & Vector Control"
6. "Town Planning & Traffic Engineering"

Return strictly valid JSON with this exact schema:
{
  "category": "Roads & Infrastructure" | "Water & Drainage" | "Sanitation & Solid Waste" | "Public Transport & Traffic" | "Education & Facilities" | "Healthcare & Sanitation" | "Public Safety & Streetlighting" | "Environment & Green Spaces" | "Civic & Revenue Services" | "Other Civic Issues",
  "suggestedDepartment": string,
  "suggestedPriority": "Low" | "Medium" | "High" | "Critical",
  "priorityScore": number (0-100),
  "reasoning": string[],
  "keyIdentifiedEntities": string[],
  "tags": string[],
  "summaryForOfficers": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: {
        category: parsed.category || fallback.category,
        suggestedDepartment: parsed.suggestedDepartment || fallback.suggestedDepartment,
        suggestedPriority: parsed.suggestedPriority || fallback.suggestedPriority,
        priorityScore: typeof parsed.priorityScore === 'number' ? parsed.priorityScore : fallback.priorityScore,
        reasoning: Array.isArray(parsed.reasoning) && parsed.reasoning.length > 0 ? parsed.reasoning : fallback.reasoning,
        keyIdentifiedEntities: Array.isArray(parsed.keyIdentifiedEntities) ? parsed.keyIdentifiedEntities : fallback.keyIdentifiedEntities,
        tags: Array.isArray(parsed.tags) ? parsed.tags : fallback.tags,
        summaryForOfficers: parsed.summaryForOfficers || fallback.summaryForOfficers,
        isPreliminary: true,
        generatedAt: new Date().toISOString(),
      },
      source: 'gemini-2.5-flash',
    });
  } catch (err) {
    console.warn('Gemini triage fallback triggered:', err);
    return res.json({
      success: true,
      data: fallback,
      source: 'deterministic_engine',
    });
  }
});

// POST /api/ai/summarize - Summarize for Field Engineers
app.post('/api/ai/summarize', requireAuth, async (req: Request, res: Response) => {
  const { title = '', description = '' } = req.body;

  const ai = getGemini();
  if (!ai) {
    return res.json({
      success: true,
      summary: `${title}: ${description.slice(0, 180)}...`,
      actionPlan: ['Dispatch ward inspection engineer', 'Verify photographic evidence', 'Procure repair materials and execute works'],
    });
  }

  try {
    const prompt = `Summarize this civic problem for field engineers in 2 concise sentences, with 3 bulleted action steps:
Title: ${title}
Details: ${description}

Return JSON:
{
  "summary": string,
  "actionPlan": string[]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      summary: parsed.summary || `${title}: ${description.slice(0, 180)}...`,
      actionPlan: parsed.actionPlan || ['Dispatch inspection engineer', 'Assess site condition', 'Execute repair'],
    });
  } catch (err) {
    console.warn('Gemini summarize fallback:', err);
    return res.json({
      success: true,
      summary: `${title}: ${description.slice(0, 180)}...`,
      actionPlan: ['Inspect site', 'Verify scope of repair', 'Execute resolution'],
    });
  }
});

// POST /api/ai/duplicate-check - Fast Jaccard similarity & keyword overlap
app.post('/api/ai/duplicate-check', requireAuth, (req: Request, res: Response) => {
  const { title = '', description = '', existingComplaints = [] } = req.body;
  const currentWords = new Set(`${title} ${description}`.toLowerCase().split(/\W+/).filter((w) => w.length > 3));

  let bestMatch: { id: string; title: string; score: number } | null = null;

  for (const item of existingComplaints) {
    const otherWords = new Set(`${item.title} ${item.description || ''}`.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
    let intersection = 0;
    currentWords.forEach((w) => {
      if (otherWords.has(w)) intersection++;
    });

    const union = new Set([...currentWords, ...otherWords]).size;
    const jaccard = union > 0 ? intersection / union : 0;

    if (jaccard > 0.45 && (!bestMatch || jaccard > bestMatch.score)) {
      bestMatch = {
        id: item.id || item.tracking_id,
        title: item.title,
        score: Math.round(jaccard * 100),
      };
    }
  }

  res.json({
    isDuplicate: !!bestMatch && bestMatch.score > 55,
    matchedComplaint: bestMatch,
  });
});

// ==========================================
// VITE INTEGRATION / SPA SERVING
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicBridge full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

start();
