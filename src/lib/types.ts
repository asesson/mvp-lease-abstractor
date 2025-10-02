export type LeaseAbstract = {
  meta: {
    documents_reviewed: string[];
    prepared_by?: string;
    generated_on: string; // ISO date
    confidence_overall?: number;
  };
  parties: {
    tenant: string;
    landlord: string;
    guarantor?: string | null;
    notice_addresses?: { party: string; address: string }[];
  };
  property: {
    address: string;
    suites: string[];
    premises_rsf: number;
    building_rsf?: number | null;
    tenant_share_pct?: number | null;
    measurement_standard?: string | null;
  };
  term: {
    effective_date?: string | null;
    commencement_date: string;
    rent_commencement_date?: string | null;
    expiration_date: string;
    length_months: number;
    holdover?: {
      rate_schedule?: {
        months: string;
        percent_of_rent: number;
        notes?: string;
      }[];
    };
    renewal_options?: {
      count?: number;
      term_months_each?: number;
      notice_window?: { earliest?: string; latest?: string };
      rent_basis?: 'FMV' | 'Fixed % Increase' | 'Other';
    };
  };
  economics: {
    currency?: string;
    security_deposit?: number;
    free_rent?: { start?: string; end?: string; notes?: string }[];
    base_rent_steps: {
      period_label: string;
      start_month_index?: number | null;
      end_month_index?: number | null;
      psf_rate: number;
      monthly_rent: number;
      notes?: string;
    }[];
    opex?: {
      base_year?: string | null;
      tenant_pays_operating_expenses?: boolean;
      cap_on_controllables_pct?: number | null;
      gross_up_pct?: number | null;
      management_fee_cap_pct?: number | null;
      taxes?: boolean;
      insurance?: boolean;
      capital_improvements_amortized?: boolean;
    };
  };
  rights: {
    expansion?: 'None' | 'ROFR' | 'ROFO' | 'Must-Take' | 'Other';
    termination?: string;
    assignment_subletting?: {
      consent_required?: boolean;
      permitted_transferee?: boolean;
      recapture_right?: boolean;
      transfer_premium_share_pct?: number | null;
    };
  };
  services: {
    permitted_use?: string;
    utilities?: string;
    generator_access?: string | null;
  };
  legal: {
    environmental?: string;
    maintenance_obligations?: string;
    audit_rights?: string | null;
    insurance_requirements?: string | null;
    warranties?: string | null;
  };
  parking_signage: {
    parking?: string;
    signage?: string;
  };
  critical_dates: {
    label: string;
    date: string;
    window_start?: string | null;
    window_end?: string | null;
    notes?: string | null;
    ics_download_url?: string | null;
  }[];
  comments?: string | null;
};
