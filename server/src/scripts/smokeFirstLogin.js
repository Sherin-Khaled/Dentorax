#!/usr/bin/env node
import "dotenv/config";
import bcrypt from "bcrypt";
import { createApp } from "../app.js";
import { connectDatabase, disconnectDatabase, prisma } from "../config/db.js";
import { listenForRequests } from "../serverRuntime.js";

const PASSWORD = "FirstLogin!2026";
const email = `first-login-${Date.now()}@x-dental.test`;
let server;
let userId;

function cookieFrom(response) {
  return response.headers.getSetCookie?.()[0]?.split(";", 1)[0]
    ?? response.headers.get("set-cookie")?.split(";", 1)[0]
    ?? "";
}

async function request(baseUrl, path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });
}

function expectStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, received ${response.status}.`);
  }
}

try {
  await connectDatabase();
  const user = await prisma.user.create({
    data: {
      name: "First Login Regression",
      email,
      passwordHash: await bcrypt.hash(PASSWORD, 12),
      clinicSpecialty: "General Dentistry",
    },
    select: { id: true },
  });
  userId = user.id;

  server = await listenForRequests(createApp(), 0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  const freshSession = await request(baseUrl, "/auth/me");
  expectStatus(freshSession, 401, "fresh-session auth initialization");

  const firstLogin = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  expectStatus(firstLogin, 200, "first valid login attempt");
  let cookie = cookieFrom(firstLogin);
  if (!cookie) throw new Error("first valid login did not set the auth cookie");

  const refresh = await request(baseUrl, "/auth/me", { headers: { Cookie: cookie } });
  expectStatus(refresh, 200, "authenticated refresh");

  const logout = await request(baseUrl, "/auth/logout", {
    method: "POST",
    headers: { Cookie: cookie },
  });
  expectStatus(logout, 200, "logout");

  const invalid = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: `${PASSWORD}-wrong` }),
  });
  expectStatus(invalid, 401, "invalid password");

  const loginAgain = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  expectStatus(loginAgain, 200, "login after logout");
  cookie = cookieFrom(loginAgain);
  const repeatedRefresh = await request(baseUrl, "/auth/me", { headers: { Cookie: cookie } });
  expectStatus(repeatedRefresh, 200, "repeated authenticated refresh");

  console.log("First-login regression smoke passed: fresh init 401, first valid login 200, refresh 200, invalid password 401, logout/login 200.");
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (userId) await prisma.user.deleteMany({ where: { id: userId } });
  await disconnectDatabase();
}
