export type RoleKey =
  | 'operator'
  | 'station_admin'
  | 'supervisor'
  | 'regional_admin'
  | 'headquarters_admin'
  | 'ict_admin'
  | 'viewer'
  | 'knowledge_admin';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ROLE_LABEL: Record<RoleKey, string> = {
  operator: 'Operator',
  station_admin: 'Station Admin',
  supervisor: 'Supervisor',
  regional_admin: 'Regional Admin',
  headquarters_admin: 'Headquarters Admin',
  ict_admin: 'ICT Admin',
  viewer: 'Viewer',
  knowledge_admin: 'Knowledge Admin',
};

// Mirrors NISO.html prototype + system-context.md spec.
// Each role exposes only the modules it is authorized for.
export const ROLE_NAV: Record<RoleKey, NavSection[]> = {
  operator: [
    { title: 'Dashboard', items: [
      { label: 'Current Shift', href: '/dashboard' },
      { label: 'Active Interruptions', href: '/interruptions' },
    ]},
    { title: 'Operations', items: [
      { label: 'Hourly Readings', href: '/readings' },
      { label: 'SLA Inputs', href: '/sla' },
      { label: 'Inspections', href: '/inspections' },
      { label: 'Interruptions', href: '/interruptions' },
    ]},
    { title: 'Knowledge', items: [
      { label: 'Knowledge Center', href: '/knowledge' },
      { label: 'AI Assistant', href: '/knowledge?ai=1' },
    ]},
    { title: 'Reports', items: [
      { label: 'My Reports', href: '/reports' },
      { label: 'Exports', href: '/reports?view=exports' },
    ]},
  ],

  station_admin: [
    { title: 'Dashboard', items: [
      { label: 'Station Overview', href: '/dashboard' },
      { label: 'Active Interruptions', href: '/interruptions' },
    ]},
    { title: 'Operations', items: [
      { label: 'Hourly Readings', href: '/readings' },
      { label: 'SLA Inputs', href: '/sla' },
      { label: 'Inspections', href: '/inspections' },
      { label: 'Interruptions', href: '/interruptions' },
    ]},
    { title: 'Management', items: [
      { label: 'Operators', href: '/admin?tab=users' },
      { label: 'Devices', href: '/admin?tab=devices' },
      { label: 'Templates', href: '/admin?tab=templates' },
    ]},
    { title: 'Reports', items: [
      { label: 'Station Reports', href: '/reports' },
      { label: 'SLA Reports', href: '/reports?cat=sla' },
    ]},
    { title: 'System', items: [
      { label: 'Audit Logs', href: '/admin?tab=audit' },
    ]},
  ],

  supervisor: [
    { title: 'Dashboard', items: [
      { label: 'Operational Overview', href: '/dashboard' },
      { label: 'Active Interruptions', href: '/interruptions' },
    ]},
    { title: 'Operations', items: [
      { label: 'Hourly Readings', href: '/readings' },
      { label: 'SLA Inputs', href: '/sla' },
      { label: 'Inspections', href: '/inspections' },
      { label: 'Interruptions', href: '/interruptions' },
    ]},
    { title: 'Review', items: [
      { label: 'Corrections Queue', href: '/admin?tab=corrections' },
      { label: 'Pending Reviews', href: '/admin?tab=reviews' },
    ]},
    { title: 'Reports', items: [
      { label: 'Station Reports', href: '/reports' },
      { label: 'SLA Reports', href: '/reports?cat=sla' },
    ]},
  ],

  regional_admin: [
    { title: 'Dashboard', items: [
      { label: 'Regional Overview', href: '/dashboard' },
      { label: 'Active Interruptions', href: '/interruptions' },
    ]},
    { title: 'Operations', items: [
      { label: 'Hourly Readings', href: '/readings' },
      { label: 'SLA Inputs', href: '/sla' },
      { label: 'Inspections', href: '/inspections' },
      { label: 'Interruptions', href: '/interruptions' },
    ]},
    { title: 'Reports', items: [
      { label: 'Regional Reports', href: '/reports' },
      { label: 'SLA Reports', href: '/reports?cat=sla' },
    ]},
    { title: 'Region Management', items: [
      { label: 'Stations', href: '/admin?tab=stations' },
      { label: 'Devices', href: '/admin?tab=devices' },
      { label: 'Templates', href: '/admin?tab=templates' },
    ]},
    { title: 'System', items: [
      { label: 'Audit Logs', href: '/admin?tab=audit' },
    ]},
  ],

  headquarters_admin: [
    { title: 'Dashboard', items: [
      { label: 'National Overview', href: '/dashboard' },
    ]},
    { title: 'Operations', items: [
      { label: 'Active Interruptions', href: '/interruptions' },
      { label: 'SLA Monitoring', href: '/sla' },
    ]},
    { title: 'Reports', items: [
      { label: 'National Reports', href: '/reports' },
      { label: 'Monthly Reports', href: '/reports?cat=monthly' },
    ]},
    { title: 'Management', items: [
      { label: 'Regions & Stations', href: '/admin?tab=regions' },
      { label: 'Templates & Formulas', href: '/admin?tab=templates' },
      { label: 'Users & Access', href: '/admin?tab=users' },
    ]},
    { title: 'System', items: [
      { label: 'Audit Logs', href: '/admin?tab=audit' },
    ]},
  ],

  ict_admin: [
    { title: 'Dashboard', items: [
      { label: 'System Overview', href: '/dashboard' },
    ]},
    { title: 'System Management', items: [
      { label: 'Devices', href: '/admin?tab=devices' },
      { label: 'Templates', href: '/admin?tab=templates' },
      { label: 'Formula Engine', href: '/admin?tab=formulas' },
    ]},
    { title: 'Users & Access', items: [
      { label: 'Users', href: '/admin?tab=users' },
      { label: 'Roles', href: '/admin?tab=roles' },
    ]},
    { title: 'System', items: [
      { label: 'Audit Logs', href: '/admin?tab=audit' },
      { label: 'Integrations', href: '/admin?tab=integrations' },
    ]},
  ],

  viewer: [
    { title: 'Dashboard', items: [
      { label: 'Shared Dashboard', href: '/dashboard' },
    ]},
    { title: 'Reports', items: [
      { label: 'Shared Reports', href: '/reports' },
    ]},
    { title: 'Knowledge', items: [
      { label: 'Knowledge Center', href: '/knowledge' },
    ]},
  ],

  knowledge_admin: [
    { title: 'Dashboard', items: [
      { label: 'Knowledge Analytics', href: '/dashboard' },
    ]},
    { title: 'Knowledge Management', items: [
      { label: 'Articles', href: '/knowledge' },
      { label: 'AI Assistant', href: '/knowledge?ai=1' },
    ]},
  ],
};
