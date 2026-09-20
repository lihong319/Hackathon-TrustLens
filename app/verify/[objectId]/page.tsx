import { SuiGrpcClient } from "@mysten/sui/grpc";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

const client = new SuiGrpcClient({
  network: "testnet",
  baseUrl: "https://fullnode.testnet.sui.io:443",
});

const RISK_LABELS = ["LOW", "MEDIUM", "HIGH", "UNVERIFIABLE"] as const;

function readField(
  fields: Record<string, unknown>,
  ...names: string[]
): unknown {
  for (const name of names) {
    if (name in fields) return fields[name];
  }
  return undefined;
}

function asText(value: unknown, fallback = "Unavailable") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function asHash(value: unknown) {
  if (Array.isArray(value) && value.every((byte) => typeof byte === "number")) {
    return `0x${value
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
  }
  return asText(value);
}

function ownerAddress(owner: { $kind: string; AddressOwner?: string }) {
  return owner.$kind === "AddressOwner"
    ? owner.AddressOwner ?? "Unavailable"
    : owner.$kind;
}

function shortId(value: string) {
  return value.length > 24
    ? `${value.slice(0, 14)}…${value.slice(-8)}`
    : value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ objectId: string }>;
}): Promise<Metadata> {
  const { objectId } = await params;
  return {
    title: `Verification ${shortId(objectId)} — TrustLens`,
    description:
      "A privacy-safe TrustLens verification record anchored on Sui Testnet.",
  };
}

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = await params;
  let record:
    | {
        verificationId: string;
        contentHash: string;
        resultHash: string;
        trustScore: number;
        riskLevel: string;
        createdAt: string;
        requestCount: number;
        owner: string;
        digest: string | null;
      }
    | undefined;
  let errorMessage = "";

  if (!isValidSuiObjectId(objectId)) {
    errorMessage = "This is not a valid Sui object ID.";
  } else {
    try {
      const response = await client.getObject({
        objectId,
        include: { json: true, previousTransaction: true },
      });
      const object = response.object;
      const expectedPackage = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID?.trim();
      const expectedType = expectedPackage
        ? `${expectedPackage}::verification::Verification`
        : "::verification::Verification";
      const isTrustLensRecord = expectedPackage
        ? object.type === expectedType
        : object.type.endsWith(expectedType);

      if (!isTrustLensRecord || !object.json) {
        throw new Error(
          "This Sui object is not a TrustLens verification record.",
        );
      }

      const fields = object.json;
      const riskCode = Number(readField(fields, "riskLevel", "risk_level"));
      const createdAtMs = Number(
        readField(fields, "createdAtMs", "created_at_ms"),
      );
      const requestIds = readField(
        fields,
        "gonkaRequestIds",
        "gonka_request_ids",
      );

      record = {
        verificationId: asText(
          readField(fields, "verificationId", "verification_id"),
        ),
        contentHash: asHash(
          readField(fields, "contentHash", "content_hash"),
        ),
        resultHash: asHash(readField(fields, "resultHash", "result_hash")),
        trustScore: Number(readField(fields, "trustScore", "trust_score")),
        riskLevel: RISK_LABELS[riskCode] ?? "UNKNOWN",
        createdAt: Number.isFinite(createdAtMs)
          ? new Date(createdAtMs).toLocaleString("en-MY", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Kuala_Lumpur",
            })
          : "Unavailable",
        requestCount: Array.isArray(requestIds) ? requestIds.length : 0,
        owner: ownerAddress(object.owner),
        digest: object.previousTransaction,
      };
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "This verification could not be loaded from Sui Testnet.";
    }
  }

  return (
    <main className="verification-page">
      <header className="site-header shell">
        <a className="brand" href="/" aria-label="TrustLens home">
          <span className="brand-mark">
            <ShieldCheck size={19} strokeWidth={2.3} />
          </span>
          <span>TrustLens</span>
        </a>
        <span className="network-pill"><i /> Sui Testnet</span>
      </header>

      <section className="verification-shell shell">
        <a className="back-link" href="/">
          <ArrowLeft size={15} /> Back to TrustLens
        </a>

        {record ? (
          <article className="public-proof">
            <div className="success-seal">
              <CheckCircle2 size={34} />
            </div>
            <span className="overline">PUBLIC ON-CHAIN RECORD</span>
            <h1>TrustLens verification confirmed</h1>
            <p>
              This assessment metadata was read directly from a Sui Testnet
              object. The original submitted content was never placed on-chain.
            </p>

            <div className="public-score">
              <strong>{record.trustScore}</strong>
              <span>/100</span>
              <em>{record.riskLevel} RISK</em>
            </div>

            <dl className="verification-details">
              <div><dt>Verification ID</dt><dd>{record.verificationId}</dd></div>
              <div><dt>Created</dt><dd>{record.createdAt}</dd></div>
              <div><dt>AI assessments</dt><dd>{record.requestCount} Gonka model responses</dd></div>
              <div><dt>Owner</dt><dd><code>{shortId(record.owner)}</code></dd></div>
              <div className="wide"><dt>Content fingerprint</dt><dd><code>{record.contentHash}</code></dd></div>
              <div className="wide"><dt>Result fingerprint</dt><dd><code>{record.resultHash}</code></dd></div>
              <div className="wide"><dt>Sui object ID</dt><dd><code>{objectId}</code></dd></div>
            </dl>

            <div className="verification-actions">
              {record.digest && (
                <a
                  className="button button-dark"
                  href={`https://suivision.xyz/txblock/${record.digest}?network=testnet`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Sui transaction <ExternalLink size={15} />
                </a>
              )}
              <a
                className="outline-button"
                href={`https://suivision.xyz/object/${objectId}?network=testnet`}
                target="_blank"
                rel="noreferrer"
              >
                View Sui object <ExternalLink size={15} />
              </a>
            </div>
            <div className="record-foot public-foot">
              <LockKeyhole size={12} /> Cryptographic fingerprints verify
              integrity without exposing the submitted content
            </div>
          </article>
        ) : (
          <article className="public-proof proof-not-found">
            <span className="record-mark danger">
              <AlertTriangle size={22} />
            </span>
            <h1>Verification not found</h1>
            <p>{errorMessage}</p>
            <a className="button button-dark" href="/">
              <FileCheck2 size={15} /> Run a TrustLens check
            </a>
          </article>
        )}
      </section>
    </main>
  );
}
