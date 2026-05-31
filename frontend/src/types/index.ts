export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  stationId?: string;
  regionId?: string;
}

export interface Reading {
  id: string;
  equipmentId: string;
  stationId: string;
  date: string;
  hour: number;
  rawInput: string;
  numericValue?: number;
  codeReference?: string;
  valueType: 'number' | 'code' | 'text';
  remarks?: string;
  sealedAt?: string;
  createdAt: string;
  createdBy: { id: string; email: string };
}

export interface SLAEntry {
  id: string;
  stationId: string;
  date: string;
  hour: number;
  forecastMw: number;
  actualMw?: number;
  meterReadingKwh?: number;
  differenceMw?: number;
  remarks?: string;
  approvedAt?: string;
  createdAt: string;
  createdBy: { id: string; email: string };
}

export interface Interruption {
  id: string;
  equipmentId: string;
  tripTime: string;
  restorationTime?: string;
  causeCode: string;
  durationSeconds?: number;
  notes?: string;
  status: 'Active' | 'Resolved' | 'Cleared';
  createdAt: string;
  createdBy: { id: string; email: string };
  equipment: { id: string; name: string };
}

export interface Equipment {
  id: string;
  name: string;
  stationId: string;
  type: string;
}

export interface Station {
  id: string;
  name: string;
  region: { id: string; name: string };
}
