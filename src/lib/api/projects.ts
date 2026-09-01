import { apiRequest, ApiMeta } from './client';
export type BackendProjectStatus='LEAD'|'CONFIRMED'|'PLANNING'|'SHOOTING'|'EDITING'|'DELIVERY'|'COMPLETED'|'CANCELLED';
export type BackendProjectType='ROKA'|'ENGAGEMENT'|'PRE_WEDDING'|'WEDDING'|'COMPLETE_WEDDING_SERVICES'|'HALDI_MEHENDI'|'SANGEET'|'RECEPTION'|'ANNIVERSARY'|'CORPORATE'|'OTHER';
export interface ProjectClient { id:string; clientCode:string; displayName:string; primaryPhone:string; }
export interface Project { id:string; projectNumber:string; name:string; type:BackendProjectType; status:BackendProjectStatus; weddingDate:string|null; deliveryDueDate:string|null; venueName:string|null; venueAddress:string|null; venueCity:string|null; totalQuotation:string; customServiceType:string|null; otherClientDetails:string|null; notes:string|null; client:ProjectClient; createdAt:string; updatedAt:string; _count?:{events:number;shoots:number;tasks:number;deliveries:number}; }
export interface CreateProjectEventInput {name:string;eventDate:string;venueName?:string;address?:string;city?:string;notes?:string;}
export interface CreateProjectTaskInput {title:string;quantity?:number;unit?:string;assigneeId?:string;}
export interface CreateProjectInput {clientId:string;name:string;type?:BackendProjectType;weddingDate?:string;deliveryDueDate?:string;venueName?:string;venueAddress?:string;venueCity?:string;totalQuotation?:string;customServiceType?:string;otherClientDetails?:string;notes?:string;managerId?:string;branchId?:string;events?:CreateProjectEventInput[];tasks?:CreateProjectTaskInput[];}
export type UpdateProjectInput=Partial<Omit<CreateProjectInput,'clientId'|'events'|'tasks'>>;
export interface ProjectListQuery {page?:number;limit?:number;search?:string;status?:BackendProjectStatus;type?:BackendProjectType;clientId?:string;managerId?:string;branchId?:string;from?:string;to?:string;sortBy?:string;sortOrder?:'asc'|'desc';}
const query=(q:ProjectListQuery={})=>{const p=new URLSearchParams();Object.entries(q).forEach(([k,v])=>{if(v!==undefined)p.set(k,String(v));});return p.toString()?`?${p}`:'';};
export const projectsApi={
  list:async(q?:ProjectListQuery)=>apiRequest<Project[]>(`/projects${query(q)}`),
  get:async(id:string)=>(await apiRequest<Project>(`/projects/${encodeURIComponent(id)}`)).data,
  create:async(input:CreateProjectInput)=>(await apiRequest<Project>('/projects',{method:'POST',body:JSON.stringify(input)})).data,
  update:async(id:string,input:UpdateProjectInput)=>(await apiRequest<Project>(`/projects/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)})).data,
  updateDataBackup:async(id:string,dataBackup:unknown)=>(await apiRequest<Project>(`/projects/${encodeURIComponent(id)}/data-backup`,{method:'PATCH',body:JSON.stringify(dataBackup)})).data,
  updateDeliveries:async(id:string,deliveryStatus:unknown)=>(await apiRequest<Project>(`/projects/${encodeURIComponent(id)}/deliveries`,{method:'PATCH',body:JSON.stringify(deliveryStatus)})).data,
  changeStatus:async(id:string,input:{status:BackendProjectStatus;reason?:string})=>(await apiRequest<Project>(`/projects/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify(input)})).data,
  remove:async(id:string)=>apiRequest<void>(`/projects/${encodeURIComponent(id)}`,{method:'DELETE'}),
  listPaymentMilestones:async(projectId:string)=>(await apiRequest<any[]>(`/projects/${encodeURIComponent(projectId)}/payment-milestones`)).data,
  removePaymentMilestone:async(projectId:string,milestoneId:string,milestones?:unknown[])=>apiRequest<void>(`/projects/${encodeURIComponent(projectId)}/payment-milestones/${encodeURIComponent(milestoneId)}`,{method:'DELETE',body:JSON.stringify({milestones})})
};
export type ProjectListResult={data:Project[];meta:ApiMeta};

