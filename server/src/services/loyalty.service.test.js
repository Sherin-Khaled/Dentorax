import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLoyaltyPricing,
  awardDeliveredOrderLoyalty,
  calculateEarnedPoints,
  createAdminPointsAdjustment,
  createAdminWalletAdjustment,
  debitOrderLoyalty,
  expirePointsForUser,
  getLoyaltyProgramSettings,
  initializeNewCustomerLoyalty,
  LoyaltyError,
  parseRequestedWalletCents,
  restoreOrderLoyalty,
} from "./loyalty.service.js";
import { endOfWeeklyRecurringWindow } from "./scheduledPromotion.service.js";

const settings = {
  id: "default",
  enabled: true,
  standardPointsPerEgp10: 1,
  vipPointsPerEgp10: 2,
  pointsPerRedemptionUnit: 100,
  redemptionValueEgp: 10,
  welcomePoints: 5_000,
  welcomeMinimumSubtotalEgp: 5_000,
  welcomeExpiryDays: 30,
  minimumRedemptionPoints: 100,
  maximumRedemptionPercent: 20,
  expiryMonths: 12,
};

function basePricing({ subtotalCents = 1_000_000, monetaryDiscountCents = 100_000, shippingCents = 5_000 } = {}) {
  return {
    subtotalCents,
    monetaryDiscountCents,
    shippingCents,
    totalCents: subtotalCents - monetaryDiscountCents + shippingCents,
    pricingBreakdown: { pricingVersion: "phase5-v1" },
  };
}

function pricingDatabase({
  tier = "STANDARD",
  availablePoints = 1_000,
  pendingPoints = 0,
  walletBalance = 100,
  transactions,
} = {}) {
  const account = {
    userId: "customer-1",
    availablePoints,
    pendingPoints,
    lifetimeEarnedPoints: 0,
    lifetimeRedeemedPoints: 0,
    walletBalance,
  };
  const pointTransactions = transactions ?? (availablePoints > 0 ? [{
    id: "earned-balance",
    type: "ORDER_EARN",
    points: availablePoints,
    status: "ACTIVE",
    expiresAt: new Date("2027-08-01T00:00:00Z"),
    createdAt: new Date("2026-08-01T00:00:00Z"),
  }] : []);
  return {
    account,
    loyaltyProgramSettings: {
      upsert: async () => settings,
    },
    user: {
      findUnique: async ({ where }) => where.id === "customer-1" ? { customerTier: tier } : null,
    },
    loyaltyAccount: {
      upsert: async ({ where }) => {
        assert.equal(where.userId, "customer-1");
        return account;
      },
      findUnique: async () => account,
    },
    loyaltyPointTransaction: {
      findMany: async ({ where }) => {
        assert.equal(where.userId, "customer-1");
        return pointTransactions;
      },
    },
  };
}

test("checkout exposes real balances and enforces 100-point increments plus the 20% product cap", async () => {
  const database = pricingDatabase();
  const preview = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: basePricing(),
    requestedPoints: 100,
    requestedWalletAmount: "20.00",
  });
  assert.equal(preview.loyalty.availablePoints, 1_000);
  assert.equal(preview.loyalty.maximumRedeemablePoints, 1_000);
  assert.equal(preview.pointsRedemptionValueCents, 1_000);
  assert.equal(preview.walletCreditUsedCents, 2_000);
  assert.equal(preview.totalCents, 904_000);
  assert.equal(preview.remainingCodCents, 902_000);

  await assert.rejects(
    applyLoyaltyPricing(database, {
      userId: "customer-1",
      pricing: basePricing(),
      requestedPoints: 150,
    }),
    (error) => error instanceof LoyaltyError && error.code === "INVALID_POINTS_INCREMENT"
  );

  const cappedDatabase = pricingDatabase({ availablePoints: 100_000 });
  await assert.rejects(
    applyLoyaltyPricing(cappedDatabase, {
      userId: "customer-1",
      pricing: basePricing({ subtotalCents: 500_000, monetaryDiscountCents: 0, shippingCents: 5_000 }),
      requestedPoints: 10_100,
    }),
    (error) => error instanceof LoyaltyError && error.code === "POINTS_REDEMPTION_LIMIT"
  );
});

test("points never pay shipping and wallet-funded product value does not earn points", async () => {
  const database = pricingDatabase();
  const preview = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: basePricing(),
    requestedPoints: 100,
    requestedWalletAmount: "60.00",
  });
  assert.equal(preview.loyalty.eligibleProductSubtotalCents, 900_000);
  assert.equal(preview.loyalty.eligibleEarningCents, 898_000);
  assert.equal(preview.remainingCodCents, 898_000);
});

test("standard earns 1% and VIP earns 2% using complete EGP 10 blocks rounded down", () => {
  const order = {
    pricingBreakdown: {
      loyalty: {
        eligibleEarningAmount: 99.99,
        earningRatePointsPerEgp10: 1,
      },
    },
  };
  assert.equal(calculateEarnedPoints(order), 9);
  assert.equal(calculateEarnedPoints({
    ...order,
    pricingBreakdown: {
      loyalty: { ...order.pricingBreakdown.loyalty, earningRatePointsPerEgp10: 2 },
    },
  }), 18);
  assert.equal(calculateEarnedPoints({ pricingBreakdown: null }), 0);
});

test("wallet amount parsing is exact to cents and rejects malformed values", () => {
  assert.equal(parseRequestedWalletCents("10"), 1_000);
  assert.equal(parseRequestedWalletCents("10.05"), 1_005);
  assert.throws(() => parseRequestedWalletCents("10.005"), LoyaltyError);
  assert.throws(() => parseRequestedWalletCents("-1"), LoyaltyError);
});

const RASHAD500 = {
  code: "Rashad500",
  points: 5_000,
  weekdays: [5, 6],
  timezone: "Africa/Cairo",
  isActive: true,
};
const GOLD300 = {
  code: "Gold300",
  points: 3_000,
  weekdays: [5, 6],
  timezone: "Africa/Cairo",
  isActive: true,
};
const FRIDAY_IN_CAIRO = new Date("2026-08-14T10:00:00Z");
const SUNDAY_IN_CAIRO = new Date("2026-08-16T10:00:00Z");

function welcomePromoDatabase({ promos = [RASHAD500, GOLD300] } = {}) {
  const calls = { point: 0, notification: 0 };
  const pointRows = new Map();
  const notifications = [];
  const account = {
    userId: "new-customer",
    availablePoints: 0,
    pendingPoints: 0,
    lifetimeEarnedPoints: 0,
  };
  const database = {
    welcomePromoCode: {
      findFirst: async ({ where }) => {
        const code = String(where.code.equals).toLowerCase();
        return promos.find((promo) => promo.code.toLowerCase() === code) ?? null;
      },
    },
    loyaltyAccount: {
      upsert: async () => account,
      update: async ({ data }) => {
        account.availablePoints += data.availablePoints.increment;
        account.lifetimeEarnedPoints += data.lifetimeEarnedPoints.increment;
        return { ...account };
      },
    },
    loyaltyPointTransaction: {
      findUnique: async ({ where }) => pointRows.get(where.idempotencyKey) ?? null,
      create: async ({ data }) => {
        calls.point += 1;
        assert.equal(data.status, "ACTIVE");
        assert.equal(data.type, "WELCOME_GRANTED");
        pointRows.set(data.idempotencyKey, data);
        return { id: `row-${calls.point}`, ...data };
      },
    },
    notification: {
      findUnique: async () => null,
      create: async ({ data }) => {
        calls.notification += 1;
        notifications.push(data);
        return data;
      },
    },
  };
  return { database, account, calls, notifications };
}

test("registering without a promo code grants zero promotional points", async () => {
  const { database, account, calls } = welcomePromoDatabase();
  const result = await initializeNewCustomerLoyalty(database, "new-customer", {
    now: FRIDAY_IN_CAIRO,
  });
  assert.equal(account.availablePoints, 0);
  assert.equal(result.granted, false);
  assert.deepEqual(result.promo, { status: "none" });
  assert.deepEqual(calls, { point: 0, notification: 0 });
});

test("registering with an unknown promo code grants zero points with an invalid result, not a thrown error", async () => {
  const { database, account, calls } = welcomePromoDatabase();
  const result = await initializeNewCustomerLoyalty(database, "new-customer", {
    now: FRIDAY_IN_CAIRO,
    promoCode: "NotARealCode",
  });
  assert.equal(account.availablePoints, 0);
  assert.equal(result.granted, false);
  assert.equal(result.promo.status, "invalid");
  assert.equal(result.promo.reason, "unknown");
  assert.deepEqual(calls, { point: 0, notification: 0 });
});

test("Gold300 grants exactly 3,000 points during the Friday/Saturday campaign window", async () => {
  const { database, account, notifications } = welcomePromoDatabase();
  const result = await initializeNewCustomerLoyalty(database, "new-customer", {
    now: FRIDAY_IN_CAIRO,
    promoCode: "Gold300",
  });
  assert.equal(account.availablePoints, 3_000);
  assert.equal(result.granted, true);
  assert.equal(result.promo.status, "granted");
  assert.equal(result.promo.points, 3_000);
  assert.equal(notifications.length, 1);
  assert.match(notifications[0].body, /3000 promotional points added/);
  assert.doesNotMatch(notifications[0].body, /30 days/);
});

test("Rashad500 grants exactly 5,000 points during the Friday/Saturday campaign window, case-insensitively", async () => {
  const { database, account, notifications } = welcomePromoDatabase();
  const result = await initializeNewCustomerLoyalty(database, "new-customer", {
    now: FRIDAY_IN_CAIRO,
    promoCode: "rashad500",
  });
  assert.equal(account.availablePoints, 5_000);
  assert.equal(result.promo.status, "granted");
  assert.equal(result.promo.points, 5_000);
  assert.equal(result.promo.code, "Rashad500");
  assert.match(notifications[0].body, /5000 promotional points added/);
  assert.doesNotMatch(notifications[0].body, /30 days/);
});

test("a valid promo code outside the Friday/Saturday window grants zero points", async () => {
  const { database, account, calls } = welcomePromoDatabase();
  const result = await initializeNewCustomerLoyalty(database, "new-customer", {
    now: SUNDAY_IN_CAIRO,
    promoCode: "Rashad500",
  });
  assert.equal(account.availablePoints, 0);
  assert.equal(result.granted, false);
  assert.equal(result.promo.status, "invalid");
  assert.equal(result.promo.reason, "outside_campaign");
  assert.deepEqual(calls, { point: 0, notification: 0 });
});

test("promo code grant is idempotent across repeated registration attempts", async () => {
  const { database, account, calls } = welcomePromoDatabase();
  await initializeNewCustomerLoyalty(database, "new-customer", {
    now: FRIDAY_IN_CAIRO,
    promoCode: "Rashad500",
  });
  const second = await initializeNewCustomerLoyalty(database, "new-customer", {
    now: FRIDAY_IN_CAIRO,
    promoCode: "Rashad500",
  });
  assert.equal(account.availablePoints, 5_000);
  assert.equal(second.granted, false);
  assert.equal(second.promo.status, "already_granted");
  assert.deepEqual(calls, { point: 1, notification: 1 });
});

test("promo point expiry is the end of the current Friday/Saturday campaign window, not a fixed duration", () => {
  const fridayExpiry = endOfWeeklyRecurringWindow(RASHAD500, FRIDAY_IN_CAIRO);
  const saturdayExpiry = endOfWeeklyRecurringWindow(
    RASHAD500,
    new Date("2026-08-15T20:00:00Z")
  );
  assert.equal(
    fridayExpiry.toLocaleString("en-US", { timeZone: "Africa/Cairo", hour12: false }),
    "8/16/2026, 00:00:00"
  );
  assert.equal(fridayExpiry.getTime(), saturdayExpiry.getTime());
  assert.equal(
    endOfWeeklyRecurringWindow(RASHAD500, SUNDAY_IN_CAIRO).toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      hour12: false,
    }),
    "8/17/2026, 00:00:00"
  );
});

test("enabling launch loyalty settings does not automatically credit existing customers", async () => {
  let accountWrites = 0;
  let transactionWrites = 0;
  const database = {
    loyaltyProgramSettings: {
      upsert: async ({ create }) => {
        assert.equal(create.enabled, true);
        assert.equal(create.welcomePoints, 5_000);
        assert.equal(create.welcomeMinimumSubtotalEgp, "5000");
        return settings;
      },
    },
    loyaltyAccount: { update: async () => { accountWrites += 1; } },
    loyaltyPointTransaction: { create: async () => { transactionWrites += 1; } },
  };

  await getLoyaltyProgramSettings(database);
  assert.equal(accountWrites, 0);
  assert.equal(transactionWrites, 0);
});

test("delivery leaves legacy pending welcome untouched and awards normal order points once", async () => {
  const pointRows = new Map();
  const account = {
    availablePoints: 0,
    pendingPoints: 200,
    lifetimeEarnedPoints: 0,
    walletBalance: 0,
  };
  let updates = 0;
  const database = {
    loyaltyProgramSettings: { upsert: async () => settings },
    loyaltyAccount: {
      upsert: async () => account,
      update: async ({ data }) => {
        updates += 1;
        account.availablePoints += data.availablePoints.increment;
        account.pendingPoints -= data.pendingPoints?.decrement ?? 0;
        account.lifetimeEarnedPoints += data.lifetimeEarnedPoints.increment;
        return { ...account };
      },
    },
    loyaltyPointTransaction: {
      findUnique: async ({ where }) => pointRows.get(where.idempotencyKey) ?? null,
      create: async ({ data }) => {
        pointRows.set(data.idempotencyKey, data);
        return data;
      },
    },
    notification: {
      findUnique: async () => null,
      create: async ({ data }) => data,
    },
  };
  const order = {
    id: "order-1",
    userId: "customer-1",
    orderNumber: "ORD-1",
    status: "DELIVERED",
    pricingBreakdown: {
      loyalty: {
        eligibleEarningAmount: 250,
        earningRatePointsPerEgp10: 1,
        expiryMonths: 12,
      },
    },
  };
  await awardDeliveredOrderLoyalty(database, order, new Date("2026-08-02T10:00:00Z"));
  assert.equal(account.availablePoints, 25);
  assert.equal(account.pendingPoints, 200);
  assert.equal(updates, 1);
  await awardDeliveredOrderLoyalty(database, order, new Date("2026-08-02T10:00:01Z"));
  assert.equal(account.availablePoints, 25);
  assert.equal(updates, 1);
});

test("signup points enforce EGP 5,000 and are usable on the first order without a prior purchase", async () => {
  const welcome = {
    id: "welcome-1",
    type: "WELCOME_GRANTED",
    points: 5_000,
    status: "ACTIVE",
    expiresAt: new Date("2026-09-01T10:00:00Z"),
    idempotencyKey: "welcome:customer-1:granted",
    createdAt: new Date("2026-08-02T10:00:00Z"),
  };
  const database = pricingDatabase({ availablePoints: 5_000, transactions: [welcome] });

  await assert.rejects(
    applyLoyaltyPricing(database, {
      userId: "customer-1",
      pricing: basePricing({ subtotalCents: 499_900, monetaryDiscountCents: 0 }),
      useWelcomeReward: true,
      now: new Date("2026-08-02T11:00:00Z"),
    }),
    (error) => error instanceof LoyaltyError
      && error.code === "WELCOME_REWARD_MINIMUM_SUBTOTAL"
      && error.message === "The welcome reward is available on eligible orders of EGP 5,000 or more."
  );

  const eligible = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: basePricing({ subtotalCents: 500_000, monetaryDiscountCents: 0 }),
    useWelcomeReward: true,
    now: new Date("2026-08-02T11:00:00Z"),
  });
  assert.equal(eligible.pointsRedemptionValueCents, 50_000);
  assert.equal(eligible.shippingCents, 5_000);
  assert.equal(eligible.totalCents, 455_000);
  assert.equal(eligible.pricingBreakdown.loyalty.welcomePointsRedeemed, 5_000);
  assert.equal(eligible.pricingBreakdown.loyalty.earnedOrAdjustedPointsRedeemed, 0);
});

test("partial welcome redemption is rejected while mixed earned points remain flexible", async () => {
  const transactions = [
    {
      id: "welcome-atomic",
      type: "WELCOME_GRANTED",
      points: 5_000,
      status: "ACTIVE",
      expiresAt: new Date("2026-09-01T10:00:00Z"),
      createdAt: new Date("2026-08-01T10:00:00Z"),
    },
    {
      id: "earned-800",
      type: "ORDER_EARN",
      points: 800,
      status: "ACTIVE",
      expiresAt: new Date("2027-08-01T10:00:00Z"),
      createdAt: new Date("2026-08-02T10:00:00Z"),
    },
  ];
  const database = pricingDatabase({ availablePoints: 5_800, transactions });
  await assert.rejects(
    applyLoyaltyPricing(database, {
      userId: "customer-1",
      pricing: basePricing({ subtotalCents: 500_000, monetaryDiscountCents: 0 }),
      requestedPoints: 1_000,
    }),
    (error) => error instanceof LoyaltyError && error.code === "INSUFFICIENT_EARNED_POINTS"
  );
  const mixed = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: basePricing({ subtotalCents: 1_000_000, monetaryDiscountCents: 0 }),
    useWelcomeReward: true,
    requestedPoints: 800,
  });
  assert.equal(mixed.pointsRedeemed, 5_800);
  assert.equal(mixed.pricingBreakdown.loyalty.welcomePointsRedeemed, 5_000);
  assert.equal(mixed.pricingBreakdown.loyalty.earnedOrAdjustedPointsRedeemed, 800);
});

test("the EGP 5,000 minimum blocks welcome/promo points but never blocks normal earned points", async () => {
  const transactions = [
    {
      id: "welcome-1",
      type: "WELCOME_GRANTED",
      points: 5_000,
      status: "ACTIVE",
      expiresAt: new Date("2026-09-01T10:00:00Z"),
      createdAt: new Date("2026-08-01T10:00:00Z"),
    },
    {
      id: "earned-1",
      type: "ORDER_EARN",
      points: 100,
      status: "ACTIVE",
      expiresAt: new Date("2027-08-01T10:00:00Z"),
      createdAt: new Date("2026-08-02T10:00:00Z"),
    },
  ];
  const database = pricingDatabase({ availablePoints: 5_100, transactions });
  const belowMinimum = basePricing({ subtotalCents: 499_900, monetaryDiscountCents: 0 });
  const now = new Date("2026-08-02T11:00:00Z");

  // Welcome/promo points remain gated by the EGP 5,000 minimum.
  await assert.rejects(
    applyLoyaltyPricing(database, {
      userId: "customer-1",
      pricing: belowMinimum,
      useWelcomeReward: true,
      now,
    }),
    (error) => error instanceof LoyaltyError && error.code === "WELCOME_REWARD_MINIMUM_SUBTOTAL"
  );

  // Regular earned points must NOT be subject to the same EGP 5,000 gate.
  const earnedBelowMinimum = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: belowMinimum,
    requestedPoints: 100,
    now,
  });
  assert.equal(earnedBelowMinimum.pricingBreakdown.loyalty.earnedOrAdjustedPointsRedeemed, 100);
  assert.equal(earnedBelowMinimum.pointsRedemptionValueCents, 1_000);
});

test("exactly EGP 5,000 is eligible for the welcome/promo reward; a cent under is not", async () => {
  const transactions = [{
    id: "welcome-1",
    type: "WELCOME_GRANTED",
    points: 5_000,
    status: "ACTIVE",
    expiresAt: new Date("2026-09-01T10:00:00Z"),
    createdAt: new Date("2026-08-01T10:00:00Z"),
  }];
  const database = pricingDatabase({ availablePoints: 5_000, transactions });
  const now = new Date("2026-08-02T11:00:00Z");

  await assert.rejects(
    applyLoyaltyPricing(database, {
      userId: "customer-1",
      pricing: basePricing({ subtotalCents: 499_999, monetaryDiscountCents: 0 }),
      useWelcomeReward: true,
      now,
    }),
    (error) => error instanceof LoyaltyError && error.code === "WELCOME_REWARD_MINIMUM_SUBTOTAL"
  );

  const exact = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: basePricing({ subtotalCents: 500_000, monetaryDiscountCents: 0 }),
    useWelcomeReward: true,
    now,
  });
  assert.equal(exact.pricingBreakdown.loyalty.welcomePointsRedeemed, 5_000);

  const above = await applyLoyaltyPricing(database, {
    userId: "customer-1",
    pricing: basePricing({ subtotalCents: 500_001, monetaryDiscountCents: 0 }),
    useWelcomeReward: true,
    now,
  });
  assert.equal(above.pricingBreakdown.loyalty.welcomePointsRedeemed, 5_000);
});

test("welcome and order points cannot activate before delivery", async () => {
  let settingsReads = 0;
  const database = {
    loyaltyProgramSettings: { upsert: async () => { settingsReads += 1; return settings; } },
  };
  const notifications = await awardDeliveredOrderLoyalty(database, {
    id: "order-pending",
    userId: "customer-1",
    orderNumber: "ORD-PENDING",
    status: "OUT_FOR_DELIVERY",
  });
  assert.deepEqual(notifications, []);
  assert.equal(settingsReads, 0);
});

test("transactional redemption rejects concurrent balance loss before creating any ledger debit", async () => {
  let pointCreates = 0;
  const database = {
    loyaltyAccount: {
      updateMany: async () => ({ count: 0 }),
    },
    loyaltyPointTransaction: { create: async () => { pointCreates += 1; } },
    walletTransaction: { create: async () => undefined },
  };
  await assert.rejects(
    debitOrderLoyalty(
      database,
      { id: "order-1", userId: "customer-1", orderNumber: "ORD-1" },
      { pointsRedeemed: 100, walletCreditUsedCents: 0 }
    ),
    (error) => error instanceof LoyaltyError && error.code === "LOYALTY_BALANCE_CHANGED"
  );
  assert.equal(pointCreates, 0);
});

test("atomic welcome reward consumption is unique per source grant", async () => {
  const markers = new Set();
  let accountDebits = 0;
  const database = {
    loyaltyPointTransaction: {
      findUnique: async ({ where }) =>
        where.id === "welcome-source-1"
          ? { id: "welcome-source-1", userId: "customer-1", type: "WELCOME_GRANTED", points: 5_000 }
          : null,
      createMany: async ({ data }) => {
        const key = data[0].idempotencyKey;
        if (markers.has(key)) return { count: 0 };
        markers.add(key);
        return { count: 1 };
      },
      create: async () => undefined,
    },
    loyaltyAccount: {
      updateMany: async () => { accountDebits += 1; return { count: 1 }; },
      findUnique: async () => ({ availablePoints: 0, walletBalance: 0 }),
    },
    notification: { findUnique: async () => null, create: async ({ data }) => data },
  };
  const pricing = {
    pointsRedeemed: 5_000,
    walletCreditUsedCents: 0,
    loyalty: { availablePoints: 5_000 },
    pricingBreakdown: {
      loyalty: { welcomePointsRedeemed: 5_000, welcomeRewardSourceId: "welcome-source-1" },
    },
  };
  await debitOrderLoyalty(
    database,
    { id: "order-1", userId: "customer-1", orderNumber: "ORD-1" },
    pricing
  );
  await assert.rejects(
    debitOrderLoyalty(
      database,
      { id: "order-2", userId: "customer-1", orderNumber: "ORD-2" },
      pricing
    ),
    (error) => error instanceof LoyaltyError && error.code === "WELCOME_REWARD_ALREADY_USED"
  );
  assert.equal(accountDebits, 1);
});

test("welcome/promo redemption is rejected when the claimed points do not match the source grant (e.g. Gold300's 3,000)", async () => {
  const database = {
    loyaltyPointTransaction: {
      findUnique: async ({ where }) =>
        where.id === "gold300-source"
          ? { id: "gold300-source", userId: "customer-1", type: "WELCOME_GRANTED", points: 3_000 }
          : null,
      createMany: async () => ({ count: 1 }),
      create: async () => undefined,
    },
    loyaltyAccount: {
      updateMany: async () => ({ count: 1 }),
      findUnique: async () => ({ availablePoints: 0, walletBalance: 0 }),
    },
    notification: { findUnique: async () => null, create: async ({ data }) => data },
  };
  await assert.rejects(
    debitOrderLoyalty(
      database,
      { id: "order-1", userId: "customer-1", orderNumber: "ORD-1" },
      {
        pointsRedeemed: 5_000,
        walletCreditUsedCents: 0,
        loyalty: { availablePoints: 5_000 },
        pricingBreakdown: {
          loyalty: { welcomePointsRedeemed: 5_000, welcomeRewardSourceId: "gold300-source" },
        },
      }
    ),
    (error) => error instanceof LoyaltyError && error.code === "INVALID_WELCOME_REWARD_REDEMPTION"
  );
});

test("cancellation restoration returns points and wallet only once", async () => {
  const pointRows = new Map();
  const walletRows = new Map();
  const account = {
    availablePoints: 0,
    lifetimeRedeemedPoints: 100,
    walletBalance: 0,
  };
  const database = {
    loyaltyProgramSettings: { upsert: async () => settings },
    loyaltyAccount: {
      upsert: async () => account,
      update: async ({ data }) => {
        if (data.availablePoints) account.availablePoints += data.availablePoints.increment;
        if (data.lifetimeRedeemedPoints) account.lifetimeRedeemedPoints -= data.lifetimeRedeemedPoints.decrement;
        if (data.walletBalance) account.walletBalance += data.walletBalance.increment;
        return { ...account };
      },
    },
    loyaltyPointTransaction: {
      findUnique: async ({ where }) => pointRows.get(where.idempotencyKey) ?? null,
      create: async ({ data }) => { pointRows.set(data.idempotencyKey, data); return data; },
    },
    walletTransaction: {
      findUnique: async ({ where }) => walletRows.get(where.idempotencyKey) ?? null,
      create: async ({ data }) => { walletRows.set(data.idempotencyKey, data); return data; },
    },
    notification: {
      findUnique: async () => null,
      create: async ({ data }) => data,
    },
  };
  const order = {
    id: "order-1",
    userId: "customer-1",
    orderNumber: "ORD-1",
    pointsRedeemed: 100,
    walletCreditUsed: 25,
  };
  await restoreOrderLoyalty(database, order);
  await restoreOrderLoyalty(database, order);
  assert.equal(account.availablePoints, 100);
  assert.equal(account.lifetimeRedeemedPoints, 0);
  assert.equal(account.walletBalance, 25);
});

test("expired unused points create one compensating immutable ledger row", async () => {
  const account = {
    availablePoints: 100,
    pendingPoints: 0,
    lifetimeEarnedPoints: 100,
    lifetimeRedeemedPoints: 0,
    walletBalance: 0,
  };
  const transactions = [{
    id: "credit-1",
    type: "ORDER_EARN",
    points: 100,
    status: "ACTIVE",
    expiresAt: new Date("2026-07-01T00:00:00Z"),
    createdAt: new Date("2025-07-01T00:00:00Z"),
  }];
  const created = [];
  const database = {
    loyaltyAccount: {
      upsert: async () => account,
      updateMany: async ({ where, data }) => {
        if (account.availablePoints < where.availablePoints.gte) return { count: 0 };
        account.availablePoints -= data.availablePoints.decrement;
        return { count: 1 };
      },
    },
    loyaltyPointTransaction: {
      findMany: async () => transactions,
      createMany: async ({ data }) => {
        const row = data[0];
        if (created.some((item) => item.idempotencyKey === row.idempotencyKey)) {
          return { count: 0 };
        }
        created.push(row);
        transactions.push({ id: `expiration-${created.length}`, createdAt: new Date(), ...row });
        return { count: 1 };
      },
    },
  };
  await expirePointsForUser(database, "customer-1", new Date("2026-08-02T00:00:00Z"));
  await expirePointsForUser(database, "customer-1", new Date("2026-08-02T00:00:01Z"));
  assert.equal(account.availablePoints, 0);
  assert.equal(created.length, 1);
  assert.equal(created[0].type, "EXPIRATION");
  assert.equal(created[0].points, -100);
});

test("admin +100 and -100 adjustments record exact signed values without allowing overdraft", async () => {
  const account = { availablePoints: 25 };
  const ledgers = new Map();
  const database = {
    loyaltyProgramSettings: { upsert: async () => settings },
    loyaltyAccount: {
      upsert: async () => account,
      updateMany: async ({ where, data }) => {
        if (where.availablePoints?.gte > account.availablePoints) return { count: 0 };
        account.availablePoints += data.availablePoints.increment
          ?? -(data.availablePoints.decrement ?? 0);
        return { count: 1 };
      },
      findUnique: async () => account,
    },
    loyaltyPointTransaction: {
      findUnique: async ({ where }) => ledgers.get(where.idempotencyKey) ?? null,
      create: async ({ data }) => {
        const ledger = { ...data, id: `tx-${ledgers.size + 1}`, actor: { id: data.actorUserId, name: "Admin", role: "ADMIN" }, createdAt: new Date() };
        ledgers.set(data.idempotencyKey, ledger);
        return ledger;
      },
    },
    notification: {
      findUnique: async () => null,
      create: async ({ data }) => data,
    },
  };
  const credit = await createAdminPointsAdjustment(database, {
    userId: "customer-1",
    actorUserId: "admin-1",
    points: 100,
    reason: "Approved support correction",
    idempotencyKey: "12345678-1234-1234-1234-123456789012",
  });
  assert.equal(account.availablePoints, 125);
  assert.equal(credit.transaction.points, 100);
  assert.equal(credit.transaction.actor.id, "admin-1");

  const debit = await createAdminPointsAdjustment(database, {
    userId: "customer-1",
    actorUserId: "admin-1",
    points: -100,
    reason: "Approved points deduction",
    idempotencyKey: "87654321-4321-4321-4321-210987654321",
  });
  assert.equal(account.availablePoints, 25);
  assert.equal(debit.transaction.points, -100);
  assert.equal(debit.transaction.description, "Approved points deduction");

  await assert.rejects(
    createAdminPointsAdjustment(database, {
      userId: "customer-1",
      actorUserId: "admin-1",
      points: -100,
      reason: "Disallowed overdraft",
      idempotencyKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    }),
    (error) => error instanceof LoyaltyError && error.code === "INSUFFICIENT_POINTS"
  );
  assert.equal(account.availablePoints, 25);
});

test("admin wallet credit and debit are ledger-only, actor-audited and idempotent", async () => {
  const account = { walletBalance: 50 };
  const ledgers = new Map();
  const database = {
    loyaltyAccount: {
      upsert: async () => account,
      updateMany: async ({ data }) => {
        account.walletBalance += data.walletBalance.increment
          ?? -(data.walletBalance.decrement ?? 0);
        return { count: 1 };
      },
      findUnique: async () => account,
    },
    walletTransaction: {
      findUnique: async ({ where }) => ledgers.get(where.idempotencyKey) ?? null,
      create: async ({ data }) => {
        const row = {
          ...data,
          id: `wallet-${ledgers.size + 1}`,
          actor: { id: data.actorUserId, name: "Admin", role: "ADMIN" },
          createdAt: new Date(),
        };
        ledgers.set(data.idempotencyKey, row);
        return row;
      },
    },
    notification: {
      findUnique: async () => null,
      create: async ({ data }) => data,
    },
  };

  const creditInput = {
    userId: "customer-1",
    actorUserId: "admin-1",
    amount: "25.00",
    adjustmentType: "PROMOTIONAL_CREDIT",
    reason: "Approved summer credit",
    idempotencyKey: "12345678-1234-1234-1234-123456789012",
  };
  const credit = await createAdminWalletAdjustment(database, creditInput);
  const replay = await createAdminWalletAdjustment(database, creditInput);
  assert.equal(credit.created, true);
  assert.equal(replay.created, false);
  assert.equal(account.walletBalance, 75);
  assert.equal(ledgers.size, 1);
  assert.equal(credit.transaction.actor.id, "admin-1");

  await createAdminWalletAdjustment(database, {
    ...creditInput,
    amount: "20.00",
    adjustmentType: "ADMIN_DEBIT",
    reason: "Approved correction",
    idempotencyKey: "87654321-4321-4321-4321-210987654321",
  });
  assert.equal(account.walletBalance, 55);
  assert.equal(ledgers.size, 2);
});

test("loyalty pricing is isolated to the authenticated customer id and VIP tier", async () => {
  const vipDatabase = pricingDatabase({ tier: "VIP" });
  const vip = await applyLoyaltyPricing(vipDatabase, {
    userId: "customer-1",
    pricing: basePricing(),
  });
  assert.equal(vip.loyalty.earningRatePointsPerEgp10, 2);
  await assert.rejects(
    applyLoyaltyPricing(vipDatabase, {
      userId: "another-customer",
      pricing: basePricing(),
    }),
    (error) => error instanceof LoyaltyError && error.code === "LOYALTY_ACCOUNT_NOT_FOUND"
  );
});
