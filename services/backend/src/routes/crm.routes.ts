import { Router } from 'express';
import { z } from 'zod';
import { CrmController } from '../controllers/crm.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Role, ProjectStatus, LeadStatus, LeadSource, FileType, PaymentMethod, QuotationStatus, InvoiceStatus } from '@prisma/client';

const router = Router();

// Validation Schemas
const clientSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(6, 'Phone is required'),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const projectSchema = z.object({
  body: z.object({
    project_name: z.string().min(2, 'Project name is required'),
    client_id: z.string().min(1, 'Client ID is required'),
    status: z.nativeEnum(ProjectStatus).optional(),
    budget: z.number().optional(),
    start_date: z.string().optional(),
    due_date: z.string().optional(),
  }),
});

const leadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Lead name is required'),
    phone: z.string().min(6, 'Phone is required'),
    email: z.string().email().optional().or(z.literal('')),
    source: z.nativeEnum(LeadSource).optional(),
    assigned_to: z.string().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    follow_up_date: z.string().optional(),
    estimated_value: z.number().optional(),
    notes: z.string().optional(),
  }),
});

const paymentSchema = z.object({
  body: z.object({
    client_id: z.string().min(1, 'Client ID is required'),
    project_id: z.string().optional(),
    invoice_id: z.string().optional(),
    amount: z.number().positive('Amount must be greater than zero'),
    payment_method: z.nativeEnum(PaymentMethod).optional(),
    transaction_ref: z.string().optional(),
    payment_date: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const quotationSchema = z.object({
  body: z.object({
    client_id: z.string().min(1, 'Client ID is required'),
    project_id: z.string().optional(),
    total_amount: z.number().positive(),
    status: z.nativeEnum(QuotationStatus).optional(),
    valid_until: z.string().optional(),
    items: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const invoiceSchema = z.object({
  body: z.object({
    client_id: z.string().min(1, 'Client ID is required'),
    project_id: z.string().optional(),
    total_amount: z.number().positive(),
    paid_amount: z.number().optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    due_date: z.string().optional(),
    items: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const freelancerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(6, 'Phone is required'),
    email: z.string().email().optional().or(z.literal('')),
    skill_category: z.string().optional(),
    day_rate: z.number().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const shootSchema = z.object({
  body: z.object({
    project_id: z.string().min(1, 'Project ID is required'),
    title: z.string().min(2, 'Title is required'),
    shoot_type: z.string().optional(),
    shoot_date: z.string().min(1, 'Shoot date is required'),
    location: z.string().optional(),
    lead_member_id: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const deliverySchema = z.object({
  body: z.object({
    project_id: z.string().min(1, 'Project ID is required'),
    item_name: z.string().min(2, 'Item name is required'),
    delivery_type: z.string().optional(),
    delivery_date: z.string().optional(),
    download_link: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const fileSchema = z.object({
  body: z.object({
    project_id: z.string().optional(),
    task_id: z.string().optional(),
    client_id: z.string().optional(),
    file_name: z.string().min(1, 'File name is required'),
    file_url: z.string().min(1, 'File URL is required'),
    file_size: z.number().optional(),
    file_type: z.nativeEnum(FileType).optional(),
    mime_type: z.string().optional(),
  }),
});

// CLIENTS
router.get('/clients', authenticate, CrmController.getClients);
router.post('/clients', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(clientSchema), CrmController.createClient);
router.patch('/clients/:id', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), CrmController.updateClient);

// PROJECTS
router.get('/projects', authenticate, CrmController.getProjects);
router.get('/projects/:id', authenticate, CrmController.getProjectById);
router.post('/projects', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(projectSchema), CrmController.createProject);
router.patch('/projects/:id', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), CrmController.updateProject);

// LEADS
router.get('/leads', authenticate, CrmController.getLeads);
router.post('/leads', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(leadSchema), CrmController.createLead);
router.patch('/leads/:id', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), CrmController.updateLead);

// PAYMENTS
router.get('/payments', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), CrmController.getPayments);
router.post('/payments', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(paymentSchema), CrmController.recordPayment);

// QUOTATIONS
router.get('/quotations', authenticate, CrmController.getQuotations);
router.post('/quotations', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(quotationSchema), CrmController.createQuotation);

// INVOICES
router.get('/invoices', authenticate, CrmController.getInvoices);
router.post('/invoices', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(invoiceSchema), CrmController.createInvoice);

// FREELANCERS
router.get('/freelancers', authenticate, CrmController.getFreelancers);
router.post('/freelancers', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(freelancerSchema), CrmController.createFreelancer);

// SHOOTS & DELIVERIES
router.get('/shoots', authenticate, CrmController.getShoots);
router.post('/shoots', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(shootSchema), CrmController.createShoot);
router.get('/deliveries', authenticate, CrmController.getDeliveries);
router.post('/deliveries', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(deliverySchema), CrmController.createDelivery);

// FILES
router.get('/files', authenticate, CrmController.getFiles);
router.post('/files', authenticate, validateRequest(fileSchema), CrmController.saveFileRecord);

export default router;
