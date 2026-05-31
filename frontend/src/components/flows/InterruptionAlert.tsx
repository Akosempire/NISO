import './InterruptionAlert.css';

interface InterruptionAlertProps {
  interruption: any;
  onOpen: () => void;
}

export default function InterruptionAlert({
  interruption,
  onOpen
}: InterruptionAlertProps) {
  const tripTime = new Date(interruption.tripTime);
  const durationMinutes = interruption.durationSeconds
    ? Math.round(interruption.durationSeconds / 60)
    : Math.round((Date.now() - tripTime.getTime()) / 60000);

  return (
    <div className="interruption-alert">
      <div className="alert-icon">⚠</div>
      <div className="alert-content">
        <h3>Active Interruption</h3>
        <p>
          <strong>{interruption.equipment?.name}</strong> tripped {durationMinutes}m ago
        </p>
        <p className="cause-code">{interruption.causeCode}</p>
      </div>
      <button onClick={onOpen} className="btn-alert-action">
        Restore →
      </button>
    </div>
  );
}
