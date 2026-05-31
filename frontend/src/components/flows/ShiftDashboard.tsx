import { useMemo } from 'react';
import './ShiftDashboard.css';

interface ShiftDashboardProps {
  user: any;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onStartHour: (hour: number) => void;
  readings: any[];
  activeInterruptions?: number;
  equipmentOnline?: number;
  equipmentTotal?: number;
  slaPercent?: number;
}

const TOTAL_HOURS = 24;
const NOW = new Date();
const CURRENT_HOUR = NOW.getHours();

export default function ShiftDashboard({
  user,
  selectedDate,
  onDateChange,
  onStartHour,
  readings,
  activeInterruptions = 0,
  equipmentOnline,
  equipmentTotal = 0,
  slaPercent
}: ShiftDashboardProps) {
  const stats = useMemo(() => {
    const completed = readings.filter((r) => r.sealedAt).length;
    const pending = readings.filter((r) => !r.sealedAt && r.id).length;
    const empty = TOTAL_HOURS - completed - pending;
    return { completed, pending, empty };
  }, [readings]);

  const onlineCount = equipmentOnline ?? Math.max(equipmentTotal - activeInterruptions, 0);
  const slaDisplay = slaPercent != null ? `${slaPercent.toFixed(0)}%` : '—';

  const getHourStatus = (hour: number): 'complete' | 'pending' | 'empty' | 'current' => {
    const reading = readings.find((r) => r.hour === hour);
    if (reading?.sealedAt) return 'complete';
    if (reading) return 'pending';
    if (hour === CURRENT_HOUR && selectedDate === NOW.toISOString().split('T')[0]) return 'current';
    return 'empty';
  };

  return (
    <div className="shift-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Shift Dashboard</h2>
          <p className="dashboard-subtitle">
            {user?.station?.name || 'Station'} • Operator view
          </p>
        </div>
        <div className="header-controls">
          <label className="date-field">
            <span>Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Equipment Online</div>
          <div className="kpi-value">{onlineCount}{equipmentTotal ? `/${equipmentTotal}` : ''}</div>
          <div className="kpi-meta">Operational</div>
        </div>
        <div className={`kpi-card ${activeInterruptions > 0 ? 'kpi-alert' : 'kpi-ok'}`}>
          <div className="kpi-label">Active Interruptions</div>
          <div className="kpi-value">{activeInterruptions}</div>
          <div className="kpi-meta">
            {activeInterruptions === 0 ? 'All clear' : 'Awaiting restoration'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Readings Today</div>
          <div className="kpi-value">{stats.completed + stats.pending}</div>
          <div className="kpi-meta">{stats.completed} sealed • {stats.pending} draft</div>
        </div>
        <div className="kpi-card kpi-ok">
          <div className="kpi-label">SLA Status</div>
          <div className="kpi-value">{slaDisplay}</div>
          <div className="kpi-meta">On target</div>
        </div>
      </div>

      <div className="section-header">
        <h3>Hourly Progress</h3>
        <div className="legend">
          <span className="legend-dot legend-complete" /> Sealed
          <span className="legend-dot legend-pending" /> Draft
          <span className="legend-dot legend-current" /> Now
          <span className="legend-dot legend-empty" /> Empty
        </div>
      </div>

      <div className="hours-grid">
        {Array.from({ length: TOTAL_HOURS }, (_, i) => {
          const status = getHourStatus(i);
          return (
            <button
              key={i}
              onClick={() => onStartHour(i)}
              className={`hour-card status-${status}`}
              aria-label={`Hour ${i}:00 — ${status}`}
            >
              <span className="hour">{String(i).padStart(2, '0')}:00</span>
              <span className="status-icon" aria-hidden>
                {status === 'complete' && '✓'}
                {status === 'pending' && '◐'}
                {status === 'current' && '●'}
                {status === 'empty' && '+'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="dashboard-footer">
        Tap an hour to open the equipment queue.
      </div>
    </div>
  );
}
