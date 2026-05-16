import { db } from '@/lib/db';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class InterruptionService {
  static async createInterruption(data: {
    title: string;
    description?: string;
    equipmentIds: string[];
    relayFault?: string;
    tripTime: Date;
    reportedBy: string;
  }) {
    // Create interruption session
    const sessionId = `INT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const interruption = await db.interruption.create({
      data: {
        sessionId,
        title: data.title,
        description: data.description,
        reportedBy: data.reportedBy,
        status: 'ACTIVE'
      }
    });
    
    // Create records for each equipment
    const records = await Promise.all(
      data.equipmentIds.map(equipmentId =>
        db.interruptionRecord.create({
          data: {
            interruptionId: interruption.id,
            equipmentId,
            relayFault: data.relayFault,
            tripTime: data.tripTime,
            status: 'ACTIVE'
          }
        })
      )
    );
    
    // Send notifications
    await NotificationService.sendInterruptionAlert({
      interruptionId: interruption.id,
      equipmentIds: data.equipmentIds,
      tripTime: data.tripTime
    });
    
    // Audit
    await AuditService.log({
      userId: data.reportedBy,
      action: 'CREATE_INTERRUPTION',
      entityType: 'interruption',
      entityId: interruption.id,
      newValues: data
    });
    
    return { interruption, records };
  }

  static async restoreInterruption(
    recordId: string,
    restorationTime: Date,
    userId: string
  ) {
    const record = await db.interruptionRecord.update({
      where: { id: recordId },
      data: {
        restorationTime,
        status: 'RESTORED',
        totalTimeOut: Math.floor(
          (restorationTime.getTime() - (await this.getTripTime(recordId)).getTime()) / 1000
        )
      },
      include: { interruption: true, equipment: true }
    });
    
    // Check if all records in session are restored
    const allRecords = await db.interruptionRecord.findMany({
      where: { interruptionId: record.interruptionId }
    });
    
    const allRestored = allRecords.every(r => r.status === 'RESTORED');
    
    if (allRestored) {
      await db.interruption.update({
        where: { id: record.interruptionId },
        data: { status: 'RESTORED' }
      });
      
      await NotificationService.sendRestorationAlert({
        interruptionId: record.interruptionId,
        equipmentName: record.equipment.name
      });
    }
    
    await AuditService.log({
      userId,
      action: 'RESTORE_INTERRUPTION',
      entityType: 'interruption_record',
      entityId: recordId,
      newValues: { restorationTime }
    });
    
    return record;
  }

  private static async getTripTime(recordId: string): Promise<Date> {
    const record = await db.interruptionRecord.findUnique({
      where: { id: recordId },
      select: { tripTime: true }
    });
    return record!.tripTime;
  }

  static async getActiveInterruptions() {
    return db.interruptionRecord.findMany({
      where: { status: 'ACTIVE' },
      include: {
        equipment: {
          include: { station: { include: { region: true } } }
        },
        interruption: true
      },
      orderBy: { tripTime: 'desc' }
    });
  }
}
