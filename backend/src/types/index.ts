import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  role: string;
  stationId?: string;
  regionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface CreateReadingInput {
  equipmentId: string;
  date: string;
  hour: number;
  rawInput: string;
  valueType: 'number' | 'code' | 'text';
  remarks?: string;
}

export interface CreateSLAEntryInput {
  stationId: string;
  date: string;
  hour: number;
  forecastMw: number;
  actualMw?: number;
  meterReadingKwh?: number;
  remarks?: string;
}

export interface CreateInterruptionInput {
  equipmentId: string;
  tripTime: string;
  restorationTime?: string;
  causeCode: string;
  notes?: string;
}

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string>;
  timestamp: string;
}
