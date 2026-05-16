import { db } from '@/lib/db';
import { PermissionService } from '@/lib/auth/permissions';
import { FormulaEngine } from '@/lib/formula/engine';
import { AuditService } from './audit.service';

export class ReadingService {
  static async createReading(data: {
    equipmentId: string;
    readingHour: Date;
    values: Record<string, any>;
    userId: string;
  }) {
    // Verify permissions
    const equipment = await db.equipment.findUnique({
      where: { id: data.equipmentId },
      include: { station: { include: { region: true } } }
    });
    
    if (!equipment) throw new Error('Equipment not found');
    
    const user = await db.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new Error('User not found');
    
    const scope = PermissionService.getUserScope(user.role, user.regionId, user.stationId);
    const canAccess = PermissionService.canAccessEquipment(
      user.role,
      scope,
      equipment.stationId,
      equipment.station.regionId
    );
    
    if (!canAccess) throw new Error('Access denied');
    
    // Check month status
    const monthCheck = await this.checkMonthStatus(data.readingHour);
    if (!monthCheck.canEdit) throw new Error(monthCheck.message);
    
    // Process values through formula engine
    const template = await db.template.findUnique({
      where: { id: equipment.templateId },
      include: { formulas: true }
    });
    
    const processedValues = { ...data.values };
    
    if (template?.formulas) {
      for (const formula of template.formulas) {
        if (formula.isValid) {
          const context = {
            row: processedValues,
            allRows: await this.getRelatedReadings(equipment.id, data.readingHour)
          };
          const computedValue = FormulaEngine.evaluate(formula.expression, context);
          if (computedValue !== null) {
            processedValues[formula.targetField] = computedValue;
          }
        }
      }
    }
    
    // Store raw input separately
    const reading = await db.reading.upsert({
      where: {
        equipmentId_readingHour: {
          equipmentId: data.equipmentId,
          readingHour: data.readingHour
        }
      },
      update: {
        values: processedValues,
        rawInput: data.values,
        sourceUser: data.userId,
        updatedAt: new Date()
      },
      create: {
        equipmentId: data.equipmentId,
        readingHour: data.readingHour,
        values: processedValues,
        rawInput: data.values,
        source: 'MANUAL',
        sourceUser: data.userId
      }
    });
    
    // Audit log
    await AuditService.log({
      userId: data.userId,
      action: 'CREATE_READING',
      entityType: 'reading',
      entityId: reading.id,
      newValues: processedValues
    });
    
    return reading;
  }

  private static async checkMonthStatus(date: Date): Promise<{ canEdit: boolean; message?: string }> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const lifecycle = await db.monthLifecycle.findUnique({
      where: { year_month: { year, month } }
    });
    
    if (!lifecycle) return { canEdit: true };
    
    if (lifecycle.status === 'SEALED') {
      return { canEdit: false, message: 'Month is sealed, cannot edit readings' };
    }
    
    if (lifecycle.status === 'REVIEW' && date < new Date()) {
      return { canEdit: false, message: 'Month is under review, past readings locked' };
    }
    
    return { canEdit: true };
  }

  private static async getRelatedReadings(equipmentId: string, readingHour: Date) {
    // Get readings for related equipment (e.g., all feeders in station)
    const equipment = await db.equipment.findUnique({
      where: { id: equipmentId },
      include: { station: { include: { equipment: true } } }
    });
    
    if (!equipment) return {};
    
    const readings = await db.reading.findMany({
      where: {
        equipmentId: { in: equipment.station.equipment.map(e => e.id) },
        readingHour: {
          gte: new Date(readingHour.setHours(0, 0, 0, 0)),
          lt: new Date(readingHour.setHours(23, 59, 59, 999))
        }
      }
    });
    
    return {
      feeders: readings.filter(r => 
        r.equipmentId.includes('FEEDER')
      ).map(r => r.values)
    };
  }
}
