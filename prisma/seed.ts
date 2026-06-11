import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.eventLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.valuation.deleteMany();
  await prisma.item.deleteMany();
  await prisma.storefront.deleteMany();

  // Storefronts
  const soleVault = await prisma.storefront.create({
    data: { name: "SoleVault", slug: "solevault", category: "SNEAKERS" },
  });
  const waxStack = await prisma.storefront.create({
    data: { name: "WaxStack", slug: "waxstack", category: "VINYL" },
  });
  const cardHouse = await prisma.storefront.create({
    data: { name: "CardHouse", slug: "cardhouse", category: "TRADING_CARDS" },
  });

  // SoleVault items
  const jordan1 = await prisma.item.create({
    data: {
      storefrontId: soleVault.id,
      sku: "SV-001",
      name: "Air Jordan 1 Retro High OG Chicago",
      category: "SNEAKERS",
      brand: "Nike",
      model: "Air Jordan 1 Retro High OG",
      condition: "9/10",
      size: "US 10",
      purchasePrice: 180,
      listedPrice: 420,
      status: "IN_STOCK",
    },
  });

  await prisma.item.create({
    data: {
      storefrontId: soleVault.id,
      sku: "SV-002",
      name: "Nike Dunk Low Panda",
      category: "SNEAKERS",
      brand: "Nike",
      model: "Dunk Low",
      condition: "10/10",
      size: "US 9",
      purchasePrice: 110,
      status: "PENDING_VALUATION",
    },
  });

  await prisma.item.create({
    data: {
      storefrontId: soleVault.id,
      sku: "SV-003",
      name: "Adidas Yeezy Boost 350 V2 Zebra",
      category: "SNEAKERS",
      brand: "Adidas",
      model: "Yeezy Boost 350 V2",
      condition: "8/10",
      size: "US 11",
      purchasePrice: 220,
      listedPrice: 340,
      status: "LISTED",
    },
  });

  // WaxStack items
  await prisma.item.create({
    data: {
      storefrontId: waxStack.id,
      sku: "WX-001",
      name: "Pink Floyd – The Dark Side of the Moon (1973 UK 1st Press)",
      category: "VINYL",
      brand: "Harvest Records",
      model: "The Dark Side of the Moon",
      condition: "VG+",
      purchasePrice: 85,
      listedPrice: 220,
      status: "IN_STOCK",
    },
  });

  await prisma.item.create({
    data: {
      storefrontId: waxStack.id,
      sku: "WX-002",
      name: "Kendrick Lamar – To Pimp a Butterfly (2015 US 1st Press)",
      category: "VINYL",
      brand: "Interscope",
      model: "To Pimp a Butterfly",
      condition: "NM",
      purchasePrice: 60,
      status: "AWAITING_APPROVAL",
    },
  });

  // CardHouse items
  const charizard = await prisma.item.create({
    data: {
      storefrontId: cardHouse.id,
      sku: "CH-001",
      name: "Charizard Base Set Holo (PSA 9)",
      category: "TRADING_CARDS",
      subCategory: "Pokémon",
      brand: "Wizards of the Coast",
      model: "Charizard Base Set",
      condition: "PSA 9",
      purchasePrice: 800,
      listedPrice: 1400,
      status: "IN_STOCK",
    },
  });

  await prisma.item.create({
    data: {
      storefrontId: cardHouse.id,
      sku: "CH-002",
      name: "Michael Jordan 1986 Fleer Rookie #57 (BGS 8)",
      category: "TRADING_CARDS",
      subCategory: "Basketball",
      brand: "Fleer",
      model: "1986 Fleer #57",
      condition: "BGS 8",
      purchasePrice: 1200,
      listedPrice: 2200,
      status: "LISTED",
    },
  });

  // Sample valuation for jordan1
  await prisma.valuation.create({
    data: {
      itemId: jordan1.id,
      inputSnapshot: {
        brand: "Nike",
        model: "Air Jordan 1 Retro High OG",
        condition: "9/10",
        size: "US 10",
        withBox: true,
      },
      aiPrompt: "Value this sneaker: Nike Air Jordan 1 Retro High OG Chicago, Size US 10, condition 9/10, with box.",
      aiResponse: "Based on recent StockX sales, this pair ranges $380–$460 in this condition and size.",
      suggestedLow: 380,
      suggestedHigh: 460,
      acceptedValue: 420,
      appraiserNote: "Good condition, slight creasing on toe box.",
      inngestRunId: "seed-run-001",
      modelUsed: "claude-sonnet-4-6",
    },
  });

  // Sample valuation for charizard
  await prisma.valuation.create({
    data: {
      itemId: charizard.id,
      inputSnapshot: {
        card: "Charizard Base Set Holo",
        grade: "PSA 9",
        set: "Base Set",
        year: 1999,
      },
      aiPrompt: "Value this trading card: Pokémon Charizard Base Set Holo, PSA 9.",
      aiResponse: "PSA 9 Charizard Base Set Holo typically sells between $1,200–$1,600 based on recent auction comparables.",
      suggestedLow: 1200,
      suggestedHigh: 1600,
      acceptedValue: 1400,
      inngestRunId: "seed-run-002",
      modelUsed: "claude-sonnet-4-6",
    },
  });

  // Sample event log entries
  await prisma.eventLog.createMany({
    data: [
      { eventName: "item/intake.submitted", payload: { itemId: jordan1.id, sku: "SV-001" } },
      { eventName: "valuation/completed", payload: { itemId: jordan1.id, suggestedLow: 380, suggestedHigh: 460 } },
      { eventName: "item/valuation.accepted", payload: { itemId: jordan1.id, acceptedValue: 420 } },
      { eventName: "item/intake.submitted", payload: { itemId: charizard.id, sku: "CH-001" } },
      { eventName: "valuation/completed", payload: { itemId: charizard.id, suggestedLow: 1200, suggestedHigh: 1600 } },
    ],
  });

  console.log("✓ 3 storefronts");
  console.log("✓ 7 items");
  console.log("✓ 2 valuations");
  console.log("✓ 5 event log entries");
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
