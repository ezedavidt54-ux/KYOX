import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeAddress(address: unknown) {
  if (typeof address !== "string") return null;
  const value = address.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(value) ? value : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = normalizeAddress(body.address);
    const chainId = Number(body.chainId);

    if (!address || !Number.isInteger(chainId) || chainId <= 0) {
      return NextResponse.json(
        { error: "A valid wallet address and chainId are required." },
        { status: 400 },
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { address_chainId: { address, chainId } },
      include: { user: { include: { tradingProfile: true, agents: true } } },
    });

    if (wallet) {
      return NextResponse.json({ user: wallet.user });
    }

    const user = await prisma.user.create({
      data: {
        wallets: {
          create: { address, chainId, isPrimary: true },
        },
        tradingProfile: {
          create: {
            markets: [],
            timeframes: [],
            riskRules: {},
            managementRules: {},
            invalidationRules: {},
            newsRules: {},
          },
        },
        agents: {
          create: {
            name: "My KYOX Intelligence",
            allowedAssets: [],
            allowedProtocols: [],
          },
        },
      },
      include: { tradingProfile: true, agents: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("KYOX profile creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create or load the KYOX profile." },
      { status: 500 },
    );
  }
}
