import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const salt = process.env.OWNER_KEY_SALT ?? "dev_salt_change_me";

const hashOwnerKey = (ownerKey: string) =>
  crypto.createHash("sha256").update(`${salt}:${ownerKey}`).digest("hex");

const slotRange = (startIso: string, count: number) => {
  const start = new Date(startIso).getTime();
  return Array.from({ length: count }, (_, i) => new Date(start + i * 15 * 60 * 1000));
};

const addAvailability = async (participantId: string, slots: Date[]) => {
  if (slots.length === 0) {
    return;
  }

  await prisma.availabilitySlot.createMany({
    data: slots.map((slotTime) => ({ participantId, slotTime })),
    skipDuplicates: true,
  });
};

async function main() {
  await prisma.availabilitySlot.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.plan.deleteMany();

  const owner1Key = "OwnerKeyOne123456789012";
  const plan1 = await prisma.plan.create({
    data: {
      title: "Weekend Hangout",
      ownerName: "Arjun",
      ownerKeyHash: hashOwnerKey(owner1Key),
      token: "Ab3K9xL2",
      durationMinutes: 120,
      rangeStart: new Date("2026-02-21T16:00:00.000Z"),
      rangeEnd: new Date("2026-02-22T00:00:00.000Z"),
    },
  });

  const participants1 = await Promise.all(
    ["Arjun", "Priya", "Rahul", "Sneha", "Vikram", "You"].map((name) =>
      prisma.participant.create({ data: { planId: plan1.id, name } }),
    ),
  );
  await addAvailability(participants1[0].id, slotRange("2026-02-21T18:00:00.000Z", 8));
  await addAvailability(participants1[1].id, slotRange("2026-02-21T18:30:00.000Z", 8));
  await addAvailability(participants1[2].id, slotRange("2026-02-21T19:00:00.000Z", 8));
  await addAvailability(participants1[3].id, slotRange("2026-02-21T18:00:00.000Z", 10));
  await addAvailability(participants1[4].id, slotRange("2026-02-21T20:30:00.000Z", 4));
  await addAvailability(participants1[5].id, slotRange("2026-02-21T18:45:00.000Z", 8));

  const owner2Key = "OwnerKeyTwo123456789012";
  const plan2 = await prisma.plan.create({
    data: {
      title: "No Overlap Session",
      ownerName: "Mina",
      ownerKeyHash: hashOwnerKey(owner2Key),
      token: "Zz91LmN0",
      durationMinutes: 60,
      rangeStart: new Date("2026-03-01T09:00:00.000Z"),
      rangeEnd: new Date("2026-03-01T13:00:00.000Z"),
    },
  });
  const [mina, leo] = await Promise.all([
    prisma.participant.create({ data: { planId: plan2.id, name: "Mina" } }),
    prisma.participant.create({ data: { planId: plan2.id, name: "Leo" } }),
  ]);
  await addAvailability(mina.id, slotRange("2026-03-01T09:00:00.000Z", 4));
  await addAvailability(leo.id, slotRange("2026-03-01T12:00:00.000Z", 4));

  const owner3Key = "OwnerKeyThree1234567890";
  const finalizedStart = new Date("2026-03-05T17:00:00.000Z");
  const finalizedEnd = new Date("2026-03-05T18:30:00.000Z");
  const plan3 = await prisma.plan.create({
    data: {
      title: "Already Finalized",
      ownerName: "Nora",
      ownerKeyHash: hashOwnerKey(owner3Key),
      token: "Qw8Er7Ty",
      durationMinutes: 90,
      rangeStart: new Date("2026-03-05T16:00:00.000Z"),
      rangeEnd: new Date("2026-03-05T21:00:00.000Z"),
      finalizedStart,
      finalizedEnd,
      finalizedAt: new Date("2026-03-01T12:00:00.000Z"),
    },
  });
  const [nora, sam, jules] = await Promise.all([
    prisma.participant.create({ data: { planId: plan3.id, name: "Nora" } }),
    prisma.participant.create({ data: { planId: plan3.id, name: "Sam" } }),
    prisma.participant.create({ data: { planId: plan3.id, name: "Jules" } }),
  ]);
  await addAvailability(nora.id, slotRange("2026-03-05T17:00:00.000Z", 6));
  await addAvailability(sam.id, slotRange("2026-03-05T17:00:00.000Z", 6));
  await addAvailability(jules.id, slotRange("2026-03-05T16:00:00.000Z", 4));

  // eslint-disable-next-line no-console
  console.log("Seed complete:");
  // eslint-disable-next-line no-console
  console.log(`- ${plan1.title}: token=${plan1.token}, ownerKey=${owner1Key}`);
  // eslint-disable-next-line no-console
  console.log(`- ${plan2.title}: token=${plan2.token}, ownerKey=${owner2Key}`);
  // eslint-disable-next-line no-console
  console.log(`- ${plan3.title}: token=${plan3.token}, ownerKey=${owner3Key}`);
}

main()
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
