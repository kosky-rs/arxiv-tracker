import { prisma } from '../lib/db';

async function clearPapers() {
  console.log('Deleting all papers from database...');
  const result = await prisma.paper.deleteMany({});
  console.log(`Deleted ${result.count} papers`);
  await prisma.$disconnect();
}

clearPapers().catch((error) => {
  console.error('Error clearing papers:', error);
  process.exit(1);
});
