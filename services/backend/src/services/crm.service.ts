import { prisma } from '../config/prisma';
import { logAudit } from '../middleware/audit';
import {
  ProjectStatus,
  LeadStatus,
  LeadSource,
  QuotationStatus,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  FileType,
} from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export class CrmService {
  // ----------------------------------------------------
  // CLIENTS
  // ----------------------------------------------------
  public static async getClients(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }
    return prisma.client.findMany({
      where,
      include: {
        projects: { select: { id: true, project_name: true, status: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async createClient(data: { name: string; phone: string; email?: string; address?: string; notes?: string }, req?: AuthenticatedRequest) {
    const client = await prisma.client.create({ data });
    await logAudit({ action: 'CLIENT_CREATED', module: 'CLIENTS', referenceId: client.id, newValue: client, req });
    return client;
  }

  public static async updateClient(id: string, data: any, req?: AuthenticatedRequest) {
    const client = await prisma.client.update({ where: { id }, data });
    await logAudit({ action: 'CLIENT_UPDATED', module: 'CLIENTS', referenceId: id, newValue: data, req });
    return client;
  }

  // ----------------------------------------------------
  // PROJECTS
  // ----------------------------------------------------
  public static async getProjects(filters?: { status?: ProjectStatus; clientId?: string; search?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.clientId) where.client_id = filters.clientId;
    if (filters?.search) where.project_name = { contains: filters.search };

    return prisma.project.findMany({
      where,
      include: {
        client: true,
        tasks: {
          select: { id: true, title: true, status: true, priority: true, assigned_to: true },
        },
        shoots: true,
        deliveries: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        tasks: {
          include: {
            assignee: { select: { id: true, username: true, full_name: true } },
          },
        },
        quotations: true,
        invoices: true,
        payments: true,
        shoots: true,
        deliveries: true,
        files: true,
      },
    });
    if (!project) throw { statusCode: 404, message: 'Project not found', errorCode: 'PROJECT_NOT_FOUND' };
    return project;
  }

  public static async createProject(data: {
    project_name: string;
    client_id: string;
    status?: ProjectStatus;
    budget?: number;
    start_date?: Date | string;
    due_date?: Date | string;
    created_by?: string;
  }, req?: AuthenticatedRequest) {
    const project = await prisma.project.create({
      data: {
        project_name: data.project_name,
        client_id: data.client_id,
        status: data.status || ProjectStatus.UPCOMING,
        budget: data.budget || 0,
        start_date: data.start_date ? new Date(data.start_date) : null,
        due_date: data.due_date ? new Date(data.due_date) : null,
        created_by: data.created_by || req?.user?.id || null,
      },
      include: { client: true },
    });
    await logAudit({ action: 'PROJECT_CREATED', module: 'PROJECTS', referenceId: project.id, newValue: project, req });
    return project;
  }

  public static async updateProject(id: string, data: any, req?: AuthenticatedRequest) {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
      },
    });
    await logAudit({ action: 'PROJECT_UPDATED', module: 'PROJECTS', referenceId: id, newValue: data, req });
    return project;
  }

  // ----------------------------------------------------
  // LEADS
  // ----------------------------------------------------
  public static async getLeads(filters?: { status?: LeadStatus; source?: LeadSource; assignedTo?: string; search?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;
    if (filters?.assignedTo) where.assigned_to = filters.assignedTo;
    if (filters?.search) {
      where.OR = [{ name: { contains: filters.search } }, { phone: { contains: filters.search } }];
    }

    return prisma.lead.findMany({
      where,
      include: {
        assignee: { select: { id: true, username: true, full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async createLead(data: any, req?: AuthenticatedRequest) {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : null,
      },
    });
    await logAudit({ action: 'LEAD_CREATED', module: 'LEADS', referenceId: lead.id, newValue: lead, req });
    return lead;
  }

  public static async updateLead(id: string, data: any, req?: AuthenticatedRequest) {
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : undefined,
      },
    });
    await logAudit({ action: 'LEAD_UPDATED', module: 'LEADS', referenceId: id, newValue: data, req });
    return lead;
  }

  // ----------------------------------------------------
  // PAYMENTS, QUOTATIONS, INVOICES
  // ----------------------------------------------------
  public static async getPayments(filters?: { projectId?: string; clientId?: string }) {
    const where: any = {};
    if (filters?.projectId) where.project_id = filters.projectId;
    if (filters?.clientId) where.client_id = filters.clientId;

    return prisma.payment.findMany({
      where,
      include: { client: true, project: true },
      orderBy: { payment_date: 'desc' },
    });
  }

  public static async recordPayment(data: any, req?: AuthenticatedRequest) {
    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;
    const payment = await prisma.payment.create({
      data: {
        ...data,
        payment_number: paymentNumber,
        payment_date: data.payment_date ? new Date(data.payment_date) : new Date(),
        recorded_by: req?.user?.id || null,
      },
      include: { client: true, project: true },
    });

    // If linked to invoice, update invoice paid amount
    if (data.invoice_id) {
      const invoice = await prisma.invoice.findUnique({ where: { id: data.invoice_id } });
      if (invoice) {
        const newPaid = invoice.paid_amount + (data.amount || 0);
        const newBalance = Math.max(0, invoice.total_amount - newPaid);
        await prisma.invoice.update({
          where: { id: data.invoice_id },
          data: {
            paid_amount: newPaid,
            balance_amount: newBalance,
            status: newBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
          },
        });
      }
    }

    await logAudit({ action: 'PAYMENT_RECORDED', module: 'PAYMENTS', referenceId: payment.id, newValue: payment, req });
    return payment;
  }

  public static async getQuotations(filters?: { clientId?: string; projectId?: string }) {
    const where: any = {};
    if (filters?.clientId) where.client_id = filters.clientId;
    if (filters?.projectId) where.project_id = filters.projectId;

    return prisma.quotation.findMany({
      where,
      include: { client: true, project: true },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async createQuotation(data: any, req?: AuthenticatedRequest) {
    const quotationNumber = `QT-${Date.now().toString().slice(-6)}`;
    const quotation = await prisma.quotation.create({
      data: {
        ...data,
        quotation_number: quotationNumber,
        created_by: req?.user?.id || null,
      },
    });
    await logAudit({ action: 'QUOTATION_CREATED', module: 'QUOTATIONS', referenceId: quotation.id, newValue: quotation, req });
    return quotation;
  }

  public static async getInvoices(filters?: { clientId?: string; projectId?: string }) {
    const where: any = {};
    if (filters?.clientId) where.client_id = filters.clientId;
    if (filters?.projectId) where.project_id = filters.projectId;

    return prisma.invoice.findMany({
      where,
      include: { client: true, project: true, payments: true },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async createInvoice(data: any, req?: AuthenticatedRequest) {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        invoice_number: invoiceNumber,
        balance_amount: (data.total_amount || 0) - (data.paid_amount || 0),
        created_by: req?.user?.id || null,
      },
    });
    await logAudit({ action: 'INVOICE_CREATED', module: 'INVOICES', referenceId: invoice.id, newValue: invoice, req });
    return invoice;
  }

  // ----------------------------------------------------
  // FREELANCERS, SHOOTS, DELIVERIES
  // ----------------------------------------------------
  public static async getFreelancers() {
    return prisma.freelancer.findMany({
      include: { assignments: { include: { project: true } } },
      orderBy: { name: 'asc' },
    });
  }

  public static async createFreelancer(data: any, req?: AuthenticatedRequest) {
    const fl = await prisma.freelancer.create({ data });
    await logAudit({ action: 'FREELANCER_CREATED', module: 'FREELANCERS', referenceId: fl.id, newValue: fl, req });
    return fl;
  }

  public static async getShoots(projectId?: string) {
    return prisma.shoot.findMany({
      where: projectId ? { project_id: projectId } : undefined,
      include: {
        project: true,
        lead_member: { select: { id: true, username: true, full_name: true } },
      },
      orderBy: { shoot_date: 'asc' },
    });
  }

  public static async createShoot(data: any, req?: AuthenticatedRequest) {
    const shoot = await prisma.shoot.create({
      data: {
        ...data,
        shoot_date: new Date(data.shoot_date),
      },
    });
    await logAudit({ action: 'SHOOT_CREATED', module: 'SHOOTS', referenceId: shoot.id, newValue: shoot, req });
    return shoot;
  }

  public static async getDeliveries(projectId?: string) {
    return prisma.delivery.findMany({
      where: projectId ? { project_id: projectId } : undefined,
      include: { project: true },
      orderBy: { delivery_date: 'asc' },
    });
  }

  public static async createDelivery(data: any, req?: AuthenticatedRequest) {
    const delivery = await prisma.delivery.create({
      data: {
        ...data,
        delivery_date: data.delivery_date ? new Date(data.delivery_date) : null,
      },
    });
    await logAudit({ action: 'DELIVERY_CREATED', module: 'DELIVERIES', referenceId: delivery.id, newValue: delivery, req });
    return delivery;
  }

  // ----------------------------------------------------
  // FILES
  // ----------------------------------------------------
  public static async getFiles(filters?: { projectId?: string; taskId?: string; clientId?: string }) {
    const where: any = {};
    if (filters?.projectId) where.project_id = filters.projectId;
    if (filters?.taskId) where.task_id = filters.taskId;
    if (filters?.clientId) where.client_id = filters.clientId;

    return prisma.fileRecord.findMany({
      where,
      include: {
        uploader: { select: { id: true, username: true, full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async saveFileRecord(data: any, req?: AuthenticatedRequest) {
    const file = await prisma.fileRecord.create({
      data: {
        ...data,
        uploaded_by: req?.user?.id || null,
      },
    });
    await logAudit({ action: 'FILE_UPLOADED', module: 'FILES', referenceId: file.id, newValue: file, req });
    return file;
  }
}
