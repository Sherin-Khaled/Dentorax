import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const container = read("../components/dental/Container.tsx");
const dashboard = read("../pages/account-dashboard.tsx");
const sidebar = read("../components/dental/AccountSidebar.tsx");

const accountPages = [
  "account.tsx",
  "account-address.tsx",
  "account-clinic-branches.tsx",
  "account-dashboard.tsx",
  "account-notifications.tsx",
  "account-order-detail.tsx",
  "account-orders.tsx",
  "account-product-request-detail.tsx",
  "account-product-requests.tsx",
  "account-quote-detail.tsx",
  "account-quotes.tsx",
  "account-settings.tsx",
  "account-supply-list-detail.tsx",
  "account-supply-lists.tsx",
  "account-support-tickets.tsx",
  "account-wallet.tsx",
  "account-wishlist.tsx",
];

test("shared Container exposes the bounded responsive account width", () => {
  assert.match(container, /account\?: boolean/);
  assert.match(container, /max-w-\[1680px\]/);
  assert.match(container, /lg:px-\[clamp\(1\.5rem,2\.5vw,3rem\)\]/);
  assert.match(container, /max-w-\[1344px\]/);
});

test("every customer account surface opts into the shared wide container", () => {
  for (const page of accountPages) {
    const source = read(`../pages/${page}`);
    const containers = source.match(/<Container(?:\s+account|\s+className|>)/g) ?? [];
    assert.ok(containers.length > 0, `${page} has no Container`);
    assert.equal(
      (source.match(/<Container\s+account/g) ?? []).length,
      containers.length,
      `${page} has a non-account Container`
    );
  }
});

test("sidebar remains controlled while the dashboard main track receives remaining width", () => {
  assert.match(sidebar, /lg:w-\[260px\]/);
  assert.match(dashboard, /lg:grid-cols-\[260px_minmax\(0,1fr\)\]/);
  assert.match(dashboard, /<main className="min-w-0/);
  assert.match(dashboard, /grid gap-5 sm:grid-cols-2 xl:grid-cols-4/);
  assert.match(dashboard, /min-h-\[106px\]/);
});
