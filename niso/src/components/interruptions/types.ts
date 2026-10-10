export type LoadImpact =
  | 'LOAD_LOST'
  | 'LOAD_DIVERTED'
  | 'PARTIALLY_DIVERTED'
  | 'NO_LOAD_IMPACT'
  | 'OTHER';

export interface EquipmentOption {
  id: string;
  name: string;
  type: string;
  voltageLevel?: string;
}

export interface InterruptionMoreDetails {
  causeClassification?: string;
  coordinatedBy?: string;
  informedParty?: string;
  protectionDetails?: string;
  switchingAction?: string;
  operationalReference?: string;
  relatedEvent?: string;
}

export interface InterruptionRecord {
  id: string;
  equipment: EquipmentOption;
  tripDateTime: string;
  relayIndication: string;
  loadImpact: LoadImpact;
  loadLostMw?: string;
  divertedLoadMw?: string;
  divertedTo?: string;
  remarks?: string;
  moreDetails?: InterruptionMoreDetails;
  status: 'ACTIVE' | 'RESTORED';
  restorationDateTime?: string;
  restorationNotes?: string;
  restorationState?: string;
}

export interface InterruptionEvent {
  id: string;
  stationName: string;
  createdBy: string;
  createdAt: string;
  records: InterruptionRecord[];
}
