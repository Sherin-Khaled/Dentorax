import { prisma } from "./src/config/db.js";

const USER_ID = "cmsscckst0007u0bgkmt4ulxw";
const TXN_ID = "cmssccmph000du0bgele67ytw";
const NOTIF_IDS = [
  "loyalty_5b6ff0328ef8f4cae17ba30c7d2503eaf82f5222c1b52c96",
  "loyalty_445e5817acd531be40adb59ab04dd1690f1cfa70a0128cb0",
];

async function main() {
  const user = await prisma.user.findUnique({ where: { id: USER_ID }, select: { email: true, name: true } });
  if (!user || user.email !== "sherin199413@gmail.com") {
    throw new Error("Safety check failed: user id/email mismatch, aborting.");
  }
  const txn = await prisma.loyaltyPointTransaction.findUnique({ where: { id: TXN_ID } });
  if (!txn || txn.userId !== USER_ID || txn.type !== "WELCOME_GRANTED" || txn.points !== 5000) {
    throw new Error("Safety check failed: transaction mismatch, aborting.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.loyaltyAccount.update({
      where: { userId: USER_ID },
      data: {
        availablePoints: { decrement: 5000 },
        lifetimeEarnedPoints: { decrement: 5000 },
      },
    });
    const deletedTxn = await tx.loyaltyPointTransaction.delete({ where: { id: TXN_ID } });
    const deletedNotifs = await tx.notification.deleteMany({ where: { id: { in: NOTIF_IDS }, userId: USER_ID } });
    return { account, deletedTxn, deletedNotifs };
  });

  console.log("Reversed. Account after:", JSON.stringify({
    availablePoints: result.account.availablePoints,
    lifetimeEarnedPoints: result.account.lifetimeEarnedPoints,
  }, null, 2));
  console.log("Deleted transaction id:", result.deletedTxn.id);
  console.log("Deleted notifications count:", result.deletedNotifs.count);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
