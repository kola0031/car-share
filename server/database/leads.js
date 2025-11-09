import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEADS_FILE = path.join(__dirname, '../data/leads.json');

const dataDir = path.dirname(LEADS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

export const getLeads = () => {
  try {
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading leads:', error);
    return [];
  }
};

export const saveLeads = (leads) => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Error saving leads:', error);
    throw error;
  }
};

export const createLead = (leadData) => {
  const leads = getLeads();
  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: leadData.email,
    name: leadData.name || '',
    phone: leadData.phone || '',
    type: leadData.type || 'host', // host, driver
    source: leadData.source || 'website', // website, social, referral, etc.
    status: leadData.status || 'new', // new, contacted, converted, lost
    notes: leadData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...leadData,
  };
  leads.push(newLead);
  saveLeads(leads);
  return newLead;
};

export const getLeadById = (leadId) => {
  const leads = getLeads();
  return leads.find(l => l.id === leadId);
};

export const getLeadsByType = (type) => {
  const leads = getLeads();
  return leads.filter(l => l.type === type);
};

export const updateLead = (leadId, updates) => {
  const leads = getLeads();
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    leads[index] = { 
      ...leads[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveLeads(leads);
    return leads[index];
  }
  return null;
};

export const deleteLead = (leadId) => {
  const leads = getLeads();
  const filtered = leads.filter(l => l.id !== leadId);
  saveLeads(filtered);
  return filtered.length !== leads.length;
};

