import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Building2,
  Cpu,
  FileEdit,
  Users,
  Bell,
  BookOpen,
  Settings,
  ListChecks,
  Inbox,
  Share2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type NavNode = {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavNode[];
};

export type RoleKey =
  | 'HEADQUARTERS_ADMIN'
  | 'ICT_ADMIN'
  | 'REGIONAL_ADMIN'
  | 'STATION_ADMIN'
  | 'SUPERVISOR'
  | 'OPERATOR'
  | 'VIEWER'
  | 'KNOWLEDGE_ADMIN';

export const roleNavigation: Record<RoleKey, NavNode[]> = {
  HEADQUARTERS_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Operations',
      icon: Activity,
      children: [
        { label: 'Live Grid Overview', href: '/operations/grid' },
        { label: 'Regional Overview', href: '/operations/regional' },
        { label: 'Active Interruptions', href: '/operations/interruptions' },
        { label: 'Event Logbook', href: '/operations/logbook' },
        { label: 'SLA Monitoring', href: '/operations/sla' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'National Reports', href: '/reports/national' },
        { label: 'Regional Reports', href: '/reports/regional' },
        { label: 'SLA Reports', href: '/reports/sla' },
        { label: 'Interruption Reports', href: '/reports/interruption' },
        { label: 'Inspection Reports', href: '/reports/inspection' },
        { label: 'Monthly Reports', href: '/reports/monthly' },
        { label: 'Shared Reports', href: '/reports/shared' },
      ],
    },
    {
      label: 'Regions & Stations',
      icon: Building2,
      children: [
        { label: 'Regions', href: '/regions' },
        { label: 'Stations', href: '/stations' },
        { label: 'Device Registry', href: '/devices' },
      ],
    },
    {
      label: 'Templates & Formulas',
      icon: FileEdit,
      children: [
        { label: 'Input Templates', href: '/templates' },
        { label: 'Formula Engine', href: '/formulas' },
        { label: 'Report Builder', href: '/report-builder' },
        { label: 'SLA Configurations', href: '/sla-config' },
      ],
    },
    {
      label: 'Users & Access',
      icon: Users,
      children: [
        { label: 'Users', href: '/users' },
        { label: 'Roles & Permissions', href: '/roles' },
        { label: 'Access Control', href: '/access-control' },
        { label: 'Sharing Policies', href: '/sharing/policies' },
      ],
    },
    {
      label: 'Notifications',
      icon: Bell,
      children: [
        { label: 'Notification Center', href: '/notifications' },
        { label: 'WhatsApp Routing', href: '/notifications/whatsapp' },
        { label: 'Email Routing', href: '/notifications/email' },
        { label: 'Broadcasts', href: '/notifications/broadcasts' },
      ],
    },
    {
      label: 'Knowledge & AI',
      icon: BookOpen,
      children: [
        { label: 'Knowledge Center', href: '/knowledge' },
        { label: 'AI Knowledge Assistant', href: '/knowledge/ai' },
        { label: 'AI Configuration', href: '/knowledge/ai-config' },
      ],
    },
    {
      label: 'System',
      icon: Settings,
      children: [
        { label: 'Audit Logs', href: '/system/audit' },
        { label: 'System Settings', href: '/system/settings' },
        { label: 'Integrations', href: '/system/integrations' },
        { label: 'SCADA Mapping', href: '/system/scada' },
        { label: 'Backup & Recovery', href: '/system/backup' },
      ],
    },
  ],

  ICT_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Operations',
      icon: Activity,
      children: [
        { label: 'Active Interruptions', href: '/operations/interruptions' },
        { label: 'Event Logbook', href: '/operations/logbook' },
        { label: 'SLA Monitoring', href: '/operations/sla' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Regional Reports', href: '/reports/regional' },
        { label: 'SLA Reports', href: '/reports/sla' },
        { label: 'Monthly Reports', href: '/reports/monthly' },
        { label: 'Shared Reports', href: '/reports/shared' },
      ],
    },
    {
      label: 'System Management',
      icon: Cpu,
      children: [
        { label: 'Regions', href: '/regions' },
        { label: 'Stations', href: '/stations' },
        { label: 'Devices & Equipment', href: '/devices' },
        { label: 'Parameter Definitions', href: '/devices/parameters' },
        { label: 'Templates', href: '/templates' },
        { label: 'Formula Engine', href: '/formulas' },
        { label: 'Report Builder', href: '/report-builder' },
      ],
    },
    {
      label: 'Users & Access',
      icon: Users,
      children: [
        { label: 'Users', href: '/users' },
        { label: 'Roles & Permissions', href: '/roles' },
        { label: 'Sharing Controls', href: '/sharing' },
      ],
    },
    {
      label: 'Notifications',
      icon: Bell,
      children: [
        { label: 'Notification Rules', href: '/notifications/rules' },
        { label: 'WhatsApp Config', href: '/notifications/whatsapp' },
        { label: 'Email Config', href: '/notifications/email' },
      ],
    },
    {
      label: 'Knowledge & AI',
      icon: BookOpen,
      children: [
        { label: 'Knowledge Center', href: '/knowledge' },
        { label: 'AI Knowledge Configuration', href: '/knowledge/ai-config' },
      ],
    },
    {
      label: 'System',
      icon: Settings,
      children: [
        { label: 'Audit Logs', href: '/system/audit' },
        { label: 'Integrations', href: '/system/integrations' },
        { label: 'SCADA Config', href: '/system/scada' },
        { label: 'System Settings', href: '/system/settings' },
      ],
    },
  ],

  REGIONAL_ADMIN: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      children: [
        { label: 'Regional Overview', href: '/dashboard/regional' },
        { label: 'Active Interruptions', href: '/dashboard/interruptions' },
        { label: 'SLA Overview', href: '/dashboard/sla' },
      ],
    },
    {
      label: 'Operations',
      icon: Activity,
      children: [
        { label: 'Hourly Readings', href: '/readings' },
        { label: 'SLA Inputs', href: '/sla' },
        { label: 'Inspections', href: '/inspections' },
        { label: 'Interruptions', href: '/interruptions' },
        { label: 'Event Logbook', href: '/operations/logbook' },
        { label: 'Planned Operations', href: '/operations/planned' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Regional Reports', href: '/reports/regional' },
        { label: 'Station Reports', href: '/reports/station' },
        { label: 'SLA Reports', href: '/reports/sla' },
        { label: 'Interruption Reports', href: '/reports/interruption' },
        { label: 'Inspection Reports', href: '/reports/inspection' },
        { label: 'Monthly Reports', href: '/reports/monthly' },
        { label: 'Shared Reports', href: '/reports/shared' },
      ],
    },
    {
      label: 'Region Management',
      icon: Building2,
      children: [
        { label: 'Stations', href: '/stations' },
        { label: 'Devices', href: '/devices' },
        { label: 'Templates', href: '/templates' },
        { label: 'Formula Engine', href: '/formulas' },
        { label: 'Regional Forecasts', href: '/forecasts' },
      ],
    },
    {
      label: 'Users & Access',
      icon: Users,
      children: [
        { label: 'Regional Users', href: '/users/regional' },
        { label: 'Station Access', href: '/users/station-access' },
        { label: 'Sharing Management', href: '/sharing' },
      ],
    },
    {
      label: 'Notifications',
      icon: Bell,
      children: [
        { label: 'Regional Notifications', href: '/notifications/regional' },
        { label: 'Broadcast Messages', href: '/notifications/broadcasts' },
      ],
    },
    {
      label: 'Knowledge & AI',
      icon: BookOpen,
      children: [
        { label: 'Knowledge Center', href: '/knowledge' },
        { label: 'AI Assistant', href: '/knowledge/ai' },
      ],
    },
    {
      label: 'System',
      icon: Settings,
      children: [
        { label: 'Audit Logs', href: '/system/audit' },
      ],
    },
  ],

  STATION_ADMIN: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      children: [
        { label: 'Station Overview', href: '/dashboard/station' },
        { label: 'Active Interruptions', href: '/dashboard/interruptions' },
        { label: 'SLA Status', href: '/dashboard/sla' },
      ],
    },
    {
      label: 'Operations',
      icon: Activity,
      children: [
        { label: 'Hourly Readings', href: '/readings' },
        { label: 'SLA Inputs', href: '/sla' },
        { label: 'Inspections', href: '/inspections' },
        { label: 'Interruptions', href: '/interruptions' },
        { label: 'Event Logbook', href: '/operations/logbook' },
        { label: 'Planned Operations', href: '/operations/planned' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Station Reports', href: '/reports/station' },
        { label: 'SLA Reports', href: '/reports/sla' },
        { label: 'Interruption Reports', href: '/reports/interruption' },
        { label: 'Monthly Reports', href: '/reports/monthly' },
        { label: 'Shared Reports', href: '/reports/shared' },
      ],
    },
    {
      label: 'Station Management',
      icon: Building2,
      children: [
        { label: 'Operators', href: '/users/operators' },
        { label: 'Devices', href: '/devices' },
        { label: 'Templates', href: '/templates' },
        { label: 'Formula Configurations', href: '/formulas' },
      ],
    },
    {
      label: 'Notifications',
      icon: Bell,
      children: [
        { label: 'Station Notifications', href: '/notifications/station' },
        { label: 'Messages', href: '/notifications/messages' },
      ],
    },
    {
      label: 'Knowledge & AI',
      icon: BookOpen,
      children: [
        { label: 'Knowledge Center', href: '/knowledge' },
        { label: 'AI Assistant', href: '/knowledge/ai' },
      ],
    },
    {
      label: 'System',
      icon: Settings,
      children: [
        { label: 'Audit Logs', href: '/system/audit' },
      ],
    },
  ],

  SUPERVISOR: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      children: [
        { label: 'Operational Overview', href: '/dashboard/operational' },
        { label: 'Active Interruptions', href: '/dashboard/interruptions' },
      ],
    },
    {
      label: 'Operations',
      icon: Activity,
      children: [
        { label: 'Hourly Readings', href: '/readings' },
        { label: 'SLA Inputs', href: '/sla' },
        { label: 'Inspections', href: '/inspections' },
        { label: 'Interruptions', href: '/interruptions' },
        { label: 'Event Logbook', href: '/operations/logbook' },
      ],
    },
    {
      label: 'Review & Approval',
      icon: ListChecks,
      children: [
        { label: 'Corrections Queue', href: '/review/corrections' },
        { label: 'Pending Reviews', href: '/review/pending' },
        { label: 'Restoration Queue', href: '/review/restoration' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Station Reports', href: '/reports/station' },
        { label: 'SLA Reports', href: '/reports/sla' },
        { label: 'Interruption Reports', href: '/reports/interruption' },
        { label: 'Shared Reports', href: '/reports/shared' },
      ],
    },
    {
      label: 'Notifications',
      icon: Bell,
      children: [
        { label: 'Broadcast Messages', href: '/notifications/broadcasts' },
        { label: 'Alerts', href: '/notifications/alerts' },
      ],
    },
    {
      label: 'Knowledge & AI',
      icon: BookOpen,
      children: [
        { label: 'Knowledge Center', href: '/knowledge' },
        { label: 'AI Assistant', href: '/knowledge/ai' },
      ],
    },
  ],

  OPERATOR: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      children: [
        { label: 'Current Shift', href: '/dashboard/shift' },
        { label: 'Active Interruptions', href: '/dashboard/interruptions' },
      ],
    },
    {
      label: 'Operations',
      icon: Activity,
      children: [
        { label: 'Hourly Readings', href: '/readings' },
        { label: 'SLA Inputs', href: '/sla' },
        { label: 'Inspections', href: '/inspections' },
        { label: 'Interruptions', href: '/interruptions' },
        { label: 'Event Logbook', href: '/operations/logbook' },
      ],
    },
    {
      label: 'Messages',
      icon: Inbox,
      children: [
        { label: 'Inbox', href: '/messages/inbox' },
        { label: 'Station Messages', href: '/messages/station' },
      ],
    },
    {
      label: 'Knowledge & AI',
      icon: BookOpen,
      children: [
        { label: 'Knowledge Center', href: '/knowledge' },
        { label: 'Ask NISO Assistant', href: '/knowledge/ai' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'My Reports', href: '/reports/my' },
        { label: 'Exports', href: '/reports/exports' },
      ],
    },
  ],

  VIEWER: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      children: [
        { label: 'Shared Dashboard', href: '/dashboard/shared' },
        { label: 'Operational Overview', href: '/dashboard/operational' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Shared Reports', href: '/reports/shared' },
        { label: 'SLA Reports', href: '/reports/sla' },
        { label: 'Monthly Reports', href: '/reports/monthly' },
      ],
    },
    {
      label: 'Shared Views',
      icon: Share2,
      children: [
        { label: 'Shared Data Access', href: '/shared/data' },
        { label: 'Downloads', href: '/shared/downloads' },
      ],
    },
    { label: 'Knowledge', href: '/knowledge', icon: BookOpen },
  ],

  KNOWLEDGE_ADMIN: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      children: [
        { label: 'Knowledge Analytics', href: '/knowledge/analytics' },
        { label: 'Recent Uploads', href: '/knowledge/recent' },
      ],
    },
    {
      label: 'Knowledge Management',
      icon: BookOpen,
      children: [
        { label: 'Articles', href: '/knowledge/articles' },
        { label: 'Procedures', href: '/knowledge/procedures' },
        { label: 'PDFs', href: '/knowledge/pdfs' },
        { label: 'Categories', href: '/knowledge/categories' },
        { label: 'Tags', href: '/knowledge/tags' },
        { label: 'Versions', href: '/knowledge/versions' },
      ],
    },
    {
      label: 'AI Knowledge',
      icon: Sparkles,
      children: [
        { label: 'AI Sources', href: '/knowledge/ai-sources' },
        { label: 'AI Indexing', href: '/knowledge/ai-indexing' },
        { label: 'AI Context Management', href: '/knowledge/ai-context' },
      ],
    },
    {
      label: 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Knowledge Usage', href: '/knowledge/usage' },
        { label: 'Search Analytics', href: '/knowledge/search-analytics' },
      ],
    },
  ],
};
