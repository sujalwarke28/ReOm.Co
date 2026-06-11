import prisma from '../prisma';

export const logAudit = async (actorId: string, action: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: actorId,
        action: action,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};
