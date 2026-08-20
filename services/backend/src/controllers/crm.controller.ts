import { Response, NextFunction } from 'express';
import { CrmService } from '../services/crm.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { ProjectStatus, LeadStatus, LeadSource, FileType } from '@prisma/client';

export class CrmController {
  // CLIENTS
  public static async getClients(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clients = await CrmService.getClients(req.query.search as string);
      return sendSuccess(res, clients);
    } catch (error) {
      return next(error);
    }
  }

  public static async createClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await CrmService.createClient(req.body, req);
      return sendSuccess(res, client, 'Client created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  public static async updateClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await CrmService.updateClient(req.params.id, req.body, req);
      return sendSuccess(res, client, 'Client updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // PROJECTS
  public static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, clientId, search } = req.query;
      const projects = await CrmService.getProjects({
        status: status as ProjectStatus,
        clientId: clientId as string,
        search: search as string,
      });
      return sendSuccess(res, projects);
    } catch (error) {
      return next(error);
    }
  }

  public static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await CrmService.getProjectById(req.params.id);
      return sendSuccess(res, project);
    } catch (error) {
      return next(error);
    }
  }

  public static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await CrmService.createProject(req.body, req);
      return sendSuccess(res, project, 'Project created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  public static async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await CrmService.updateProject(req.params.id, req.body, req);
      return sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // LEADS
  public static async getLeads(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, source, assignedTo, search } = req.query;
      const leads = await CrmService.getLeads({
        status: status as LeadStatus,
        source: source as LeadSource,
        assignedTo: assignedTo as string,
        search: search as string,
      });
      return sendSuccess(res, leads);
    } catch (error) {
      return next(error);
    }
  }

  public static async createLead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lead = await CrmService.createLead(req.body, req);
      return sendSuccess(res, lead, 'Lead created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  public static async updateLead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lead = await CrmService.updateLead(req.params.id, req.body, req);
      return sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // PAYMENTS
  public static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, clientId } = req.query;
      const payments = await CrmService.getPayments({
        projectId: projectId as string,
        clientId: clientId as string,
      });
      return sendSuccess(res, payments);
    } catch (error) {
      return next(error);
    }
  }

  public static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await CrmService.recordPayment(req.body, req);
      return sendSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  // QUOTATIONS
  public static async getQuotations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { clientId, projectId } = req.query;
      const quotations = await CrmService.getQuotations({
        clientId: clientId as string,
        projectId: projectId as string,
      });
      return sendSuccess(res, quotations);
    } catch (error) {
      return next(error);
    }
  }

  public static async createQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quotation = await CrmService.createQuotation(req.body, req);
      return sendSuccess(res, quotation, 'Quotation created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  // INVOICES
  public static async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { clientId, projectId } = req.query;
      const invoices = await CrmService.getInvoices({
        clientId: clientId as string,
        projectId: projectId as string,
      });
      return sendSuccess(res, invoices);
    } catch (error) {
      return next(error);
    }
  }

  public static async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await CrmService.createInvoice(req.body, req);
      return sendSuccess(res, invoice, 'Invoice created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  // FREELANCERS
  public static async getFreelancers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const freelancers = await CrmService.getFreelancers();
      return sendSuccess(res, freelancers);
    } catch (error) {
      return next(error);
    }
  }

  public static async createFreelancer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const fl = await CrmService.createFreelancer(req.body, req);
      return sendSuccess(res, fl, 'Freelancer added successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  // SHOOTS & DELIVERIES
  public static async getShoots(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const shoots = await CrmService.getShoots(req.query.projectId as string);
      return sendSuccess(res, shoots);
    } catch (error) {
      return next(error);
    }
  }

  public static async createShoot(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const shoot = await CrmService.createShoot(req.body, req);
      return sendSuccess(res, shoot, 'Shoot scheduled successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  public static async getDeliveries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const deliveries = await CrmService.getDeliveries(req.query.projectId as string);
      return sendSuccess(res, deliveries);
    } catch (error) {
      return next(error);
    }
  }

  public static async createDelivery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const delivery = await CrmService.createDelivery(req.body, req);
      return sendSuccess(res, delivery, 'Delivery item logged successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  // FILES
  public static async getFiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, taskId, clientId } = req.query;
      const files = await CrmService.getFiles({
        projectId: projectId as string,
        taskId: taskId as string,
        clientId: clientId as string,
      });
      return sendSuccess(res, files);
    } catch (error) {
      return next(error);
    }
  }

  public static async saveFileRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const file = await CrmService.saveFileRecord(req.body, req);
      return sendSuccess(res, file, 'File logged successfully', 201);
    } catch (error) {
      return next(error);
    }
  }
}
