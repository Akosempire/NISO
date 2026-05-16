import { UserRole } from '@prisma/client';

export interface Scope {
  regionId?: string;
  stationId?: string;
}

export class PermissionService {
  static getUserScope(userRole: UserRole, regionId?: string | null, stationId?: string | null): Scope {
    switch (userRole) {
      case 'HEADQUARTERS_ADMIN':
      case 'ICT_ADMIN':
        return {}; // Full access
      
      case 'REGIONAL_ADMIN':
        if (!regionId) throw new Error('Regional admin requires region ID');
        return { regionId };
      
      case 'STATION_ADMIN':
      case 'SUPERVISOR':
      case 'OPERATOR':
      case 'VIEWER':
        if (!stationId) throw new Error('Station-level user requires station ID');
        return { stationId };
      
      default:
        return {};
    }
  }

  static canAccessEquipment(
    userRole: UserRole,
    userScope: Scope,
    equipmentStationId: string,
    equipmentRegionId: string
  ): boolean {
    if (userRole === 'HEADQUARTERS_ADMIN' || userRole === 'ICT_ADMIN') {
      return true;
    }
    
    if (userScope.regionId && userScope.regionId === equipmentRegionId) {
      return true;
    }
    
    if (userScope.stationId && userScope.stationId === equipmentStationId) {
      return true;
    }
    
    return false;
  }

  static canEditReadings(userRole: UserRole): boolean {
    return ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN'].includes(userRole);
  }

  static canSealMonth(userRole: UserRole): boolean {
    return ['HEADQUARTERS_ADMIN', 'REGIONAL_ADMIN'].includes(userRole);
  }

  static canManageTemplates(userRole: UserRole): boolean {
    return ['ICT_ADMIN', 'HEADQUARTERS_ADMIN'].includes(userRole);
  }
}
