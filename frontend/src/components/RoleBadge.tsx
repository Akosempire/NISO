import './RoleBadge.css';

type RoleKey =
  | 'OPERATOR'
  | 'SUPERVISOR'
  | 'STATION_ADMIN'
  | 'REGIONAL_ADMIN'
  | 'HQ_ADMIN'
  | 'ICT_ADMIN'
  | 'KNOWLEDGE_ADMIN'
  | 'VIEWER';

interface RoleConfig {
  label: string;
  glyph: string;
  bg: string;
  fg: string;
  border: string;
}

export const ROLE_CONFIG: Record<RoleKey, RoleConfig> = {
  OPERATOR: {
    label: 'Operator',
    glyph: '⚡',
    bg: '#fffbeb',
    fg: '#7a5b00',
    border: '#fef3c7'
  },
  SUPERVISOR: {
    label: 'Supervisor',
    glyph: '◆',
    bg: '#e1ede4',
    fg: '#2c4a39',
    border: '#c3dbc9'
  },
  STATION_ADMIN: {
    label: 'Station Admin',
    glyph: '⌂',
    bg: '#d9e6e7',
    fg: '#264244',
    border: '#b3cdcf'
  },
  REGIONAL_ADMIN: {
    label: 'Regional Admin',
    glyph: '◉',
    bg: '#3d6b6e',
    fg: '#ffffff',
    border: '#325759'
  },
  HQ_ADMIN: {
    label: 'HQ Admin',
    glyph: '★',
    bg: '#11191a',
    fg: '#8fbba0',
    border: '#1b2e30'
  },
  ICT_ADMIN: {
    label: 'ICT Admin',
    glyph: '⌘',
    bg: '#374151',
    fg: '#e5e7eb',
    border: '#1f2937'
  },
  KNOWLEDGE_ADMIN: {
    label: 'Knowledge Admin',
    glyph: '✦',
    bg: '#f3f8f4',
    fg: '#426a52',
    border: '#a6c9af'
  },
  VIEWER: {
    label: 'Viewer',
    glyph: '◎',
    bg: '#f3f4f6',
    fg: '#4b5563',
    border: '#e5e7eb'
  }
};

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function RoleBadge({
  role,
  size = 'md',
  showLabel = true,
  className
}: RoleBadgeProps) {
  const normalized = String(role || '').toUpperCase().replace(/\s+/g, '_') as RoleKey;
  const config = ROLE_CONFIG[normalized] || ROLE_CONFIG.VIEWER;

  return (
    <span
      className={`role-badge role-badge--${size} ${className || ''}`}
      style={{
        background: config.bg,
        color: config.fg,
        borderColor: config.border
      }}
      title={config.label}
    >
      <span className="role-badge__glyph" aria-hidden="true">
        {config.glyph}
      </span>
      {showLabel && <span className="role-badge__label">{config.label}</span>}
    </span>
  );
}
