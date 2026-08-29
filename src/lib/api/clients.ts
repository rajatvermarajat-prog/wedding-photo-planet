import { apiRequest, ApiMeta } from './client';

export interface ClientContact { id?: string; name: string; relationship?: string; phone?: string; email?: string; isPrimary?: boolean; }
export interface ClientAddress { id?: string; type?: 'HOME'|'OFFICE'|'VENUE'|'BILLING'|'OTHER'; label?: string; addressLine: string; city?: string; state?: string; postalCode?: string; isPrimary?: boolean; }
export interface Client { id: string; clientCode: string; displayName: string; primaryPhone: string; primaryEmail: string | null; brideName: string | null; groomName: string | null; gstNumber: string | null; isActive: boolean; createdAt: string; updatedAt: string; contacts?: ClientContact[]; addresses?: ClientAddress[]; }
export interface CreateClientInput { displayName: string; primaryPhone: string; primaryEmail?: string; brideName?: string; groomName?: string; gstNumber?: string; contacts?: ClientContact[]; addresses?: ClientAddress[]; }
export type UpdateClientInput = Partial<Omit<CreateClientInput, 'contacts'|'addresses'>>;
export interface ClientListQuery { page?: number; limit?: number; search?: string; isActive?: boolean; sortBy?: 'createdAt'|'displayName'|'clientCode'; sortOrder?: 'asc'|'desc'; }
const query=(q:ClientListQuery={})=>{const p=new URLSearchParams(); Object.entries(q).forEach(([k,v])=>{if(v!==undefined)p.set(k,String(v));}); return p.toString()?`?${p}`:'';};
export const clientsApi={
 list: async(q?:ClientListQuery)=>apiRequest<Client[]>(`/clients${query(q)}`),
 get: async(id:string)=>(await apiRequest<Client>(`/clients/${encodeURIComponent(id)}`)).data,
 create: async(input:CreateClientInput)=>(await apiRequest<Client>('/clients',{method:'POST',body:JSON.stringify(input)})).data,
 update: async(id:string,input:UpdateClientInput)=>(await apiRequest<Client>(`/clients/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)})).data,
 remove: async(id:string)=>apiRequest<void>(`/clients/${encodeURIComponent(id)}`,{method:'DELETE'}),
 addNote: async(id:string,input:{body:string;isPinned?:boolean})=>(await apiRequest<unknown>(`/clients/${encodeURIComponent(id)}/notes`,{method:'POST',body:JSON.stringify(input)})).data,
};
export type ClientListResult={data:Client[];meta:ApiMeta};
