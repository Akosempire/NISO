'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  EquipmentOption,
  InterruptionEvent,
  InterruptionRecord,
  LoadImpact,
} from './types';

interface NewInterruptionDrawerProps {
  open: boolean;
  onClose: () => void;
  availableEquipment: EquipmentOption[];
  stationName: string;
  currentUserName: string;
  onSave: (event: InterruptionEvent) => void;
}

interface InterruptionRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  record: InterruptionRecord | null;
  stationName?: string;
  onRestore: (
    recordId: string,
    payload: {
      restorationDateTime: string;
      restorationNotes?: string;
      restorationState?: string;
    }
  ) => void;
}

type RecordDraft = {
  tripDate: string;
  tripTime: string;
  relayIndication: string;
  loadImpact: LoadImpact;
  loadLostMw: string;
  divertedLoadMw: string;
  divertedTo: string;
  remarks: string;
  causeClassification: string;
  coordinatedBy: string;
  informedParty: string;
  protectionDetails: string;
  switchingAction: string;
  operationalReference: string;
  relatedEvent: string;
};

const loadImpactOptions: Array<{ value: LoadImpact; label: string }> = [
  { value: 'LOAD_LOST', label: 'Load Lost' },
  { value: 'LOAD_DIVERTED', label: 'Load Diverted' },
  { value: 'PARTIALLY_DIVERTED', label: 'Partially Diverted' },
  { value: 'NO_LOAD_IMPACT', label: 'No Load Impact' },
  { value: 'OTHER', label: 'Other' },
];

const fieldClassName =
  'mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[color:rgba(67,106,109,0.14)]';

const textareaClassName =
  'mt-1 min-h-24 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[color:rgba(67,106,109,0.14)]';

function getNowParts() {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  };
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatLoadImpact(value: LoadImpact) {
  return loadImpactOptions.find((option) => option.value === value)?.label ?? value;
}

function buildDefaultDraft(): RecordDraft {
  const now = getNowParts();
  return {
    tripDate: now.date,
    tripTime: now.time,
    relayIndication: '',
    loadImpact: 'LOAD_LOST',
    loadLostMw: '',
    divertedLoadMw: '',
    divertedTo: '',
    remarks: '',
    causeClassification: '',
    coordinatedBy: '',
    informedParty: '',
    protectionDetails: '',
    switchingAction: '',
    operationalReference: '',
    relatedEvent: '',
  };
}

export function NewInterruptionDrawer({
  open,
  onClose,
  availableEquipment,
  stationName,
  currentUserName,
  onSave,
}: NewInterruptionDrawerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RecordDraft>>({});
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    setDrafts({});
    setExpandedIds({});
    setError(null);
  }, [open]);

  const selectedEquipment = useMemo(
    () => availableEquipment.filter((equipment) => selectedIds.includes(equipment.id)),
    [availableEquipment, selectedIds]
  );

  const updateDraft = (equipmentId: string, patch: Partial<RecordDraft>) => {
    setDrafts((current) => ({
      ...current,
      [equipmentId]: {
        ...(current[equipmentId] ?? buildDefaultDraft()),
        ...patch,
      },
    }));
  };

  const toggleEquipment = (equipment: EquipmentOption) => {
    setError(null);
    setSelectedIds((current) => {
      if (current.includes(equipment.id)) {
        return current.filter((id) => id !== equipment.id);
      }
      return [...current, equipment.id];
    });
    setDrafts((current) => ({
      ...current,
      [equipment.id]: current[equipment.id] ?? buildDefaultDraft(),
    }));
    setExpandedIds((current) => ({
      ...current,
      [equipment.id]: true,
    }));
  };

  const handleSave = () => {
    if (selectedEquipment.length === 0) {
      setError('Select at least one equipment item before saving.');
      return;
    }

    for (const equipment of selectedEquipment) {
      const draft = drafts[equipment.id] ?? buildDefaultDraft();
      if (!draft.tripDate || !draft.tripTime || !draft.relayIndication.trim()) {
        setError(`Complete the trip date, time, and relay indication for ${equipment.name}.`);
        return;
      }

      if (draft.loadImpact === 'LOAD_LOST' && !draft.loadLostMw.trim()) {
        setError(`Enter load lost for ${equipment.name}.`);
        return;
      }

      if (
        (draft.loadImpact === 'LOAD_DIVERTED' || draft.loadImpact === 'PARTIALLY_DIVERTED') &&
        (!draft.divertedLoadMw.trim() || !draft.divertedTo.trim())
      ) {
        setError(`Enter diverted load and destination for ${equipment.name}.`);
        return;
      }
    }

    const eventId = `evt-${Date.now()}`;
    const createdAt = new Date().toISOString();

    onSave({
      id: eventId,
      stationName,
      createdBy: currentUserName,
      createdAt,
      records: selectedEquipment.map((equipment, index) => {
        const draft = drafts[equipment.id] ?? buildDefaultDraft();
        return {
          id: `${eventId}-${index + 1}`,
          equipment,
          tripDateTime: new Date(`${draft.tripDate}T${draft.tripTime}:00`).toISOString(),
          relayIndication: draft.relayIndication.trim(),
          loadImpact: draft.loadImpact,
          loadLostMw: draft.loadLostMw.trim() || undefined,
          divertedLoadMw: draft.divertedLoadMw.trim() || undefined,
          divertedTo: draft.divertedTo.trim() || undefined,
          remarks: draft.remarks.trim() || undefined,
          moreDetails: {
            causeClassification: draft.causeClassification.trim() || undefined,
            coordinatedBy: draft.coordinatedBy.trim() || undefined,
            informedParty: draft.informedParty.trim() || undefined,
            protectionDetails: draft.protectionDetails.trim() || undefined,
            switchingAction: draft.switchingAction.trim() || undefined,
            operationalReference: draft.operationalReference.trim() || undefined,
            relatedEvent: draft.relatedEvent.trim() || undefined,
          },
          status: 'ACTIVE',
        };
      }),
    });

    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="inset-y-0 right-0 flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_36px_rgba(27,36,36,0.12)] md:w-[540px]">
        <DrawerHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle>New Interruption</DrawerTitle>
              <DrawerDescription>
                Select one or more equipment items and capture the interruption details for each
                record.
              </DrawerDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)]"
              aria-label="Close interruption drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Equipment</h3>
                <p className="text-xs text-[var(--text-secondary)]">{stationName}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand-teal)]">
                {selectedIds.length} selected
              </span>
            </div>
            <div className="space-y-2">
              {availableEquipment.map((equipment) => {
                const checked = selectedIds.includes(equipment.id);
                return (
                  <label
                    key={equipment.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors ${
                      checked
                        ? 'border-[var(--brand-teal)] bg-[var(--brand-mint-soft)]'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEquipment(equipment)}
                      className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--brand-teal)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{equipment.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {equipment.type}
                        {equipment.voltageLevel ? ` | ${equipment.voltageLevel}` : ''}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {selectedEquipment.map((equipment) => {
            const draft = drafts[equipment.id] ?? buildDefaultDraft();
            const isExpanded = expandedIds[equipment.id] ?? true;
            const showDiversion =
              draft.loadImpact === 'LOAD_DIVERTED' || draft.loadImpact === 'PARTIALLY_DIVERTED';

            return (
              <section key={equipment.id} className="rounded-lg border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIds((current) => ({
                      ...current,
                      [equipment.id]: !isExpanded,
                    }))
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{equipment.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {equipment.type}
                      {equipment.voltageLevel ? ` | ${equipment.voltageLevel}` : ''}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                  )}
                </button>

                {isExpanded ? (
                  <div className="border-t border-[var(--border)] px-4 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`${equipment.id}-trip-date`}>Trip Date</Label>
                        <Input
                          id={`${equipment.id}-trip-date`}
                          type="date"
                          value={draft.tripDate}
                          onChange={(event) => updateDraft(equipment.id, { tripDate: event.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${equipment.id}-trip-time`}>Trip Time</Label>
                        <Input
                          id={`${equipment.id}-trip-time`}
                          type="time"
                          value={draft.tripTime}
                          onChange={(event) => updateDraft(equipment.id, { tripTime: event.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`${equipment.id}-relay`}>Relay Indication</Label>
                      <Input
                        id={`${equipment.id}-relay`}
                        placeholder="Distance Relay"
                        value={draft.relayIndication}
                        onChange={(event) =>
                          updateDraft(equipment.id, { relayIndication: event.target.value })
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`${equipment.id}-impact`}>Load Impact</Label>
                      <select
                        id={`${equipment.id}-impact`}
                        value={draft.loadImpact}
                        onChange={(event) =>
                          updateDraft(equipment.id, { loadImpact: event.target.value as LoadImpact })
                        }
                        className={fieldClassName}
                      >
                        {loadImpactOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {draft.loadImpact === 'LOAD_LOST' ? (
                      <div className="mt-4">
                        <Label htmlFor={`${equipment.id}-load-lost`}>Load Lost (MW)</Label>
                        <Input
                          id={`${equipment.id}-load-lost`}
                          type="number"
                          inputMode="decimal"
                          placeholder="82"
                          value={draft.loadLostMw}
                          onChange={(event) => updateDraft(equipment.id, { loadLostMw: event.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                    ) : null}

                    {showDiversion ? (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`${equipment.id}-diverted-load`}>Diverted Load (MW)</Label>
                          <Input
                            id={`${equipment.id}-diverted-load`}
                            type="number"
                            inputMode="decimal"
                            placeholder="65"
                            value={draft.divertedLoadMw}
                            onChange={(event) =>
                              updateDraft(equipment.id, { divertedLoadMw: event.target.value })
                            }
                            className={fieldClassName}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${equipment.id}-diverted-to`}>Diverted To</Label>
                          <Input
                            id={`${equipment.id}-diverted-to`}
                            placeholder="2JEB-SGB2"
                            value={draft.divertedTo}
                            onChange={(event) => updateDraft(equipment.id, { divertedTo: event.target.value })}
                            className={fieldClassName}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <Label htmlFor={`${equipment.id}-remarks`}>Remarks</Label>
                      <textarea
                        id={`${equipment.id}-remarks`}
                        value={draft.remarks}
                        onChange={(event) => updateDraft(equipment.id, { remarks: event.target.value })}
                        placeholder="Breaker opened following relay operation..."
                        className={textareaClassName}
                      />
                    </div>

                    <div className="mt-5 rounded-md border border-dashed border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedIds((current) => ({
                            ...current,
                            [`${equipment.id}-details`]: !current[`${equipment.id}-details`],
                          }))
                        }
                        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--brand-teal)]"
                      >
                        <span>More Details</span>
                        {expandedIds[`${equipment.id}-details`] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {expandedIds[`${equipment.id}-details`] ? (
                        <div className="grid gap-4 border-t border-[var(--border)] px-4 py-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor={`${equipment.id}-cause`}>Cause Classification</Label>
                            <Input
                              id={`${equipment.id}-cause`}
                              value={draft.causeClassification}
                              onChange={(event) =>
                                updateDraft(equipment.id, { causeClassification: event.target.value })
                              }
                              className={fieldClassName}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${equipment.id}-coordinated-by`}>Coordinated By</Label>
                            <Input
                              id={`${equipment.id}-coordinated-by`}
                              value={draft.coordinatedBy}
                              onChange={(event) =>
                                updateDraft(equipment.id, { coordinatedBy: event.target.value })
                              }
                              className={fieldClassName}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${equipment.id}-informed-party`}>Informed Party</Label>
                            <Input
                              id={`${equipment.id}-informed-party`}
                              value={draft.informedParty}
                              onChange={(event) =>
                                updateDraft(equipment.id, { informedParty: event.target.value })
                              }
                              className={fieldClassName}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${equipment.id}-reference`}>Operational Reference</Label>
                            <Input
                              id={`${equipment.id}-reference`}
                              value={draft.operationalReference}
                              onChange={(event) =>
                                updateDraft(equipment.id, { operationalReference: event.target.value })
                              }
                              className={fieldClassName}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${equipment.id}-protection`}>Protection Details</Label>
                            <Input
                              id={`${equipment.id}-protection`}
                              value={draft.protectionDetails}
                              onChange={(event) =>
                                updateDraft(equipment.id, { protectionDetails: event.target.value })
                              }
                              className={fieldClassName}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${equipment.id}-related-event`}>Related Event</Label>
                            <Input
                              id={`${equipment.id}-related-event`}
                              value={draft.relatedEvent}
                              onChange={(event) =>
                                updateDraft(equipment.id, { relatedEvent: event.target.value })
                              }
                              className={fieldClassName}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`${equipment.id}-switching`}>Switching Action</Label>
                            <textarea
                              id={`${equipment.id}-switching`}
                              value={draft.switchingAction}
                              onChange={(event) =>
                                updateDraft(equipment.id, { switchingAction: event.target.value })
                              }
                              className={textareaClassName}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}

          {error ? (
            <div className="rounded-md border border-[var(--danger)] bg-[color:rgba(199,68,68,0.08)] px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Each selected equipment is saved as its own interruption record.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Interruption</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function InterruptionRecordDrawer({
  open,
  onClose,
  record,
  stationName,
  onRestore,
}: InterruptionRecordDrawerProps) {
  const [restorationDate, setRestorationDate] = useState('');
  const [restorationTime, setRestorationTime] = useState('');
  const [restorationNotes, setRestorationNotes] = useState('');
  const [restorationState, setRestorationState] = useState('Fully Restored');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const now = getNowParts();
    setRestorationDate(now.date);
    setRestorationTime(now.time);
    setRestorationNotes('');
    setRestorationState('Fully Restored');
    setError(null);
  }, [open, record?.id]);

  if (!record) return null;

  const handleRestore = () => {
    if (!restorationDate || !restorationTime) {
      setError('Enter restoration date and time.');
      return;
    }

    onRestore(record.id, {
      restorationDateTime: new Date(`${restorationDate}T${restorationTime}:00`).toISOString(),
      restorationNotes: restorationNotes.trim() || undefined,
      restorationState,
    });
    onClose();
  };

  const loadSummary =
    record.loadImpact === 'LOAD_LOST'
      ? `${record.loadLostMw ?? '-'} MW lost`
      : record.loadImpact === 'LOAD_DIVERTED' || record.loadImpact === 'PARTIALLY_DIVERTED'
      ? `${record.divertedLoadMw ?? '-'} MW diverted to ${record.divertedTo ?? '-'}`
      : formatLoadImpact(record.loadImpact);

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="inset-y-0 right-0 flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_36px_rgba(27,36,36,0.12)] md:w-[520px]">
        <DrawerHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle>{record.equipment.name}</DrawerTitle>
              <DrawerDescription>
                {record.equipment.type}
                {record.equipment.voltageLevel ? ` | ${record.equipment.voltageLevel}` : ''}
                {stationName ? ` | ${stationName}` : ''}
              </DrawerDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)]"
              aria-label="Close interruption record drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Status</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{record.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Trip</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {formatDateTime(record.tripDateTime)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                Relay Indication
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {record.relayIndication}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Load Impact</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{loadSummary}</p>
            </div>
          </section>

          {record.remarks ? (
            <section>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Remarks</h3>
              <p className="mt-2 rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm text-[var(--text-secondary)]">
                {record.remarks}
              </p>
            </section>
          ) : null}

          {record.moreDetails && Object.values(record.moreDetails).some(Boolean) ? (
            <section>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">More Details</h3>
              <div className="mt-2 grid gap-3 rounded-md border border-[var(--border)] bg-white p-4 sm:grid-cols-2">
                {record.moreDetails.causeClassification ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      Cause
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                      {record.moreDetails.causeClassification}
                    </p>
                  </div>
                ) : null}
                {record.moreDetails.coordinatedBy ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      Coordinated By
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                      {record.moreDetails.coordinatedBy}
                    </p>
                  </div>
                ) : null}
                {record.moreDetails.informedParty ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      Informed Party
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                      {record.moreDetails.informedParty}
                    </p>
                  </div>
                ) : null}
                {record.moreDetails.operationalReference ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      Reference
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                      {record.moreDetails.operationalReference}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {record.status === 'RESTORED' ? (
            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Restoration</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    Restoration Time
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">
                    {formatDateTime(record.restorationDateTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    Restoration State
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">
                    {record.restorationState ?? 'Restored'}
                  </p>
                </div>
              </div>
              {record.restorationNotes ? (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">{record.restorationNotes}</p>
              ) : null}
            </section>
          ) : (
            <section className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Restore Equipment</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="restoration-date">Restoration Date</Label>
                  <Input
                    id="restoration-date"
                    type="date"
                    value={restorationDate}
                    onChange={(event) => setRestorationDate(event.target.value)}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <Label htmlFor="restoration-time">Restoration Time</Label>
                  <Input
                    id="restoration-time"
                    type="time"
                    value={restorationTime}
                    onChange={(event) => setRestorationTime(event.target.value)}
                    className={fieldClassName}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="restoration-state">Load Restoration</Label>
                <select
                  id="restoration-state"
                  value={restorationState}
                  onChange={(event) => setRestorationState(event.target.value)}
                  className={fieldClassName}
                >
                  <option>Fully Restored</option>
                  <option>Partially Restored</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="mt-4">
                <Label htmlFor="restoration-notes">Restoration Notes</Label>
                <textarea
                  id="restoration-notes"
                  value={restorationNotes}
                  onChange={(event) => setRestorationNotes(event.target.value)}
                  placeholder="Restoration steps or switching notes"
                  className={textareaClassName}
                />
              </div>
              {error ? (
                <div className="mt-4 rounded-md border border-[var(--danger)] bg-[color:rgba(199,68,68,0.08)] px-3 py-2 text-sm text-[var(--danger)]">
                  {error}
                </div>
              ) : null}
            </section>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {record.status === 'ACTIVE' ? <Button onClick={handleRestore}>Restore Equipment</Button> : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
