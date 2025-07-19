import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to ensure connection before queries
export async function ensureConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('Failed to connect to database:', error)
    return false
  }
}

// Graceful disconnect on process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})