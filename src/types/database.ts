import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Customer = Tables<'customers'>;
export type Bike = Tables<'bikes'>;
export type Job = Tables<'jobs'>;
export type JobInsert = TablesInsert<'jobs'>;
export type JobUpdate = TablesUpdate<'jobs'>;
export type GarageSettings = Tables<'garage_settings'>;
export type GarageSettingsInsert = TablesInsert<'garage_settings'>;
export type GarageSettingsUpdate = TablesUpdate<'garage_settings'>;
export type CommunicationTemplate = Tables<'communication_templates'>;
export type CommunicationTemplateInsert = TablesInsert<'communication_templates'>;
export type CommunicationTemplateUpdate = TablesUpdate<'communication_templates'>;
export type CommunicationLog = Tables<'communication_logs'>;
export type CommunicationLogInsert = TablesInsert<'communication_logs'>;

export type InventoryItem = Tables<'inventory_items'>;
export type InventoryItemInsert = TablesInsert<'inventory_items'>;
export type InventoryItemUpdate = TablesUpdate<'inventory_items'>;

export type JobPart = Tables<'job_parts'>;
export type JobPartInsert = TablesInsert<'job_parts'>;
export type JobPartUpdate = TablesUpdate<'job_parts'>;

export type ServicePackage = Tables<'service_packages'> & {
  checklist_items: string[] | null;
};
export type ServicePackageInsert = TablesInsert<'service_packages'>;
export type ServicePackageUpdate = TablesUpdate<'service_packages'>;

export type ServicePackageItem = Tables<'service_package_items'>;
export type ServicePackageItemInsert = TablesInsert<'service_package_items'>;
export type ServicePackageItemUpdate = TablesUpdate<'service_package_items'>;

export interface ServicePackageWithItems extends ServicePackage {
  items: ServicePackageItem[];
}

export type JobStatus = 'pending' | 'in_progress' | 'ready_for_delivery' | 'delivered';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'upi' | 'credit_card' | 'debit_card' | 'bank_transfer';

export interface CustomerWithBikes extends Customer {
  bikes: Bike[];
}

export interface BikeWithCustomer extends Bike {
  customer: Customer;
}

export interface JobWithDetails extends Job {
  bike: BikeWithCustomer;
}

export interface DashboardStats {
  totalCustomers: number;
  activeJobs: number;
  pendingPayments: number;
  upcomingReminders: number;
}
