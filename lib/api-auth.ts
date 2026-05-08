import { NextRequest, NextResponse } from "next/server";

interface ApiKeyData {
  id: string | number;
  key: string;
  userId: string;
  requestCount: number;
  requestQuota: number;
  isActive: boolean;
  lastUsedAt: Date | null;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  keyData?: ApiKeyData;
}

export async function validateApiKey(
  _request: NextRequest
): Promise<ValidationResult> {
  // Public API mode: auth/db/quota checks are disabled.
  return {
    valid: true,
    keyData: {
      id: "public",
      key: "public-access",
      userId: "public-user",
      requestCount: 0,
      requestQuota: Number.MAX_SAFE_INTEGER,
      isActive: true,
      lastUsedAt: new Date(),
      message: "Public API mode is enabled",
    },
  };
}

export function createUnauthorizedResponse(error: string) {
  return NextResponse.json(
    {
      success: false,
      error,
      message: "API key authentication failed",
    },
    { status: 401 }
  );
}
