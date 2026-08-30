"use client";

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Copy,
  ExternalLink,
  FileCheck2,
  Globe2,
  Link2,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const examples = [
  "Government aid message",
  "Investment offer",
  "Suspicious link",
];

export default function Home() {
  const [mode, setMode] = useState<"text" | "url">("text");
  const [content, setContent] = useState("");
  const [view, setView] = useState<"input" | "analyzing" | "result" | "proof">("input");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (view !== "analyzing") return;
    const timer = window.setTimeout(() => setView("result"), 2200);
    return () => window.clearTimeout(timer);
  }, [view]);

  const loadExample = (example: string) => {
    setMode("text");
    setContent(
      example === "Government aid message"
        ? "Congratulations! You have received RM3,000 government assistance. Click this link immediately to claim your payment: bantuan-rakyat-claim.co"
        : example === "Investment offer"
          ? "Guaranteed 30% monthly returns. Limited spots only — transfer your deposit today to secure your profits."
          : "Your bank account has been suspended. Verify your identity now at my-securebank-login.com to restore access.",
    );
  };

  const resetCheck = () => {
    setView("input");
    setContent("");
    setCopied(false);
  };

  const copyProof = async () => {
    await navigator.clipboard?.writeText("trustlens.app/verify/0x8F3A71C2");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header shell">
        <a className="brand" href="#top" aria-label="TrustLens home">
          <span className="brand-mark"><ShieldCheck size={19} strokeWidth={2.3} /></span>
          <span>TrustLens</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#verifications">Verifications</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <span className="network-pill"><i /> Sui Testnet</span>
          <a className="button button-small button-dark" href="#verify">Launch app <ArrowRight size={15} /></a>
        </div>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> AI-powered verification, secured on Sui</div>
          <h1>See through the noise.<br /><span>Verify what’s real.</span></h1>
          <p className="hero-lede">
            TrustLens cross-checks suspicious messages, links and claims with multiple AI models—then anchors the result on-chain.
          </p>
          <div className="hero-points">
            <span><Check size={15} /> Multi-model consensus</span>
            <span><Check size={15} /> Tamper-resistant proof</span>
            <span><Check size={15} /> Privacy-first by design</span>
          </div>
        </div>

        <div className="verifier-wrap" id="verify">
          <div className={`verifier-card verifier-${view}`}>
            {view === "input" && <>
            <div className="verifier-heading">
              <div>
                <span className="overline">TRUSTLENS CHECK</span>
                <h2>What would you like to verify?</h2>
              </div>
              <span className="secure-badge"><LockKeyhole size={13} /> Private</span>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Verification type">
              <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")} role="tab" aria-selected={mode === "text"}>
                <MessageSquareText size={16} /> Paste text
              </button>
              <button className={mode === "url" ? "active" : ""} onClick={() => setMode("url")} role="tab" aria-selected={mode === "url"}>
                <Globe2 size={16} /> Check URL
              </button>
            </div>

            <label className="input-label" htmlFor="content-input">
              {mode === "text" ? "MESSAGE, CLAIM OR ARTICLE EXCERPT" : "WEBSITE OR ARTICLE URL"}
            </label>
            {mode === "text" ? (
              <div className="textarea-wrap">
                <textarea
                  id="content-input"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Paste something that doesn’t feel quite right…"
                  maxLength={2000}
                />
                <span className="character-count">{content.length} / 2,000</span>
              </div>
            ) : (
              <div className="url-wrap">
                <Globe2 size={18} />
                <input id="content-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="https://example.com/article" />
              </div>
            )}

            <div className="try-row">
              <span>Try an example</span>
              <div>
                {examples.map((example) => (
                  <button key={example} onClick={() => loadExample(example)}>{example}</button>
                ))}
              </div>
            </div>

            <button className="analyze-button" disabled={!content.trim()} onClick={() => setView("analyzing")}>
              <ScanSearch size={19} /> Analyze with TrustLens <ArrowRight size={17} />
            </button>
            <p className="privacy-note"><LockKeyhole size={12} /> Your original content is never stored on-chain. Only its cryptographic fingerprint is recorded.</p>
            </>}

            {view === "analyzing" && <div className="analysis-loading" aria-live="polite">
              <div className="scan-orbit"><ScanSearch size={29} /><i /><i /><i /></div>
              <span className="overline">MULTI-MODEL ANALYSIS</span>
              <h2>Cross-checking your content…</h2>
              <p>Independent models are reviewing language, source signals and known scam patterns.</p>
              <div className="progress-track"><span /></div>
              <div className="model-progress">
                <div><span className="model-symbol">A</span><p><strong>Gonka Model A</strong><small>Analyzing persuasion patterns</small></p><span className="working-dots"><i /><i /><i /></span></div>
                <div><span className="model-symbol coral-model">B</span><p><strong>Gonka Model B</strong><small>Checking claim credibility</small></p><Check size={16} /></div>
                <div><span className="model-symbol yellow-model">C</span><p><strong>Gonka Model C</strong><small>Scanning for phishing signals</small></p><span className="working-dots"><i /><i /><i /></span></div>
              </div>
              <p className="privacy-note"><LockKeyhole size={12} /> Analysis is routed privately through Gonka</p>
            </div>}

            {view === "result" && <div className="result-view" aria-live="polite">
              <div className="result-topline">
                <div><span className="overline">TRUSTLENS RESULT</span><h2>High-risk content detected</h2></div>
                <button className="icon-button" onClick={resetCheck} aria-label="Start a new check"><RotateCcw size={16} /></button>
              </div>
              <div className="score-summary">
                <div className="score-ring"><div><strong>14</strong><span>/ 100</span></div></div>
                <div className="score-copy"><span className="risk-pill"><AlertTriangle size={13} /> High risk</span><h3>Likely fraudulent</h3><p>Strong scam indicators found across all three AI assessments.</p></div>
              </div>
              <div className="warning-panel">
                <span className="panel-icon"><AlertTriangle size={17} /></span>
                <div><h4>Warning signals</h4><ul><li>Urgent call to action</li><li>Unverifiable financial incentive</li><li>Suspicious lookalike domain</li></ul></div>
              </div>
              <div className="consensus-heading"><span>MODEL CONSENSUS</span><strong><CheckCircle2 size={14} /> 3 of 3 agree</strong></div>
              <div className="model-verdicts">
                <div><span>A</span><p>Model A<small>Likely scam · 94%</small></p><AlertTriangle size={15} /></div>
                <div><span>B</span><p>Model B<small>Likely scam · 89%</small></p><AlertTriangle size={15} /></div>
                <div><span>C</span><p>Model C<small>Suspicious · 82%</small></p><AlertTriangle size={15} /></div>
              </div>
              <div className="recommendation"><BrainCircuit size={17} /><p><strong>Recommended action</strong><span>Do not click the link or share personal information. Verify using the organisation’s official channel.</span></p></div>
              <button className="analyze-button proof-button" onClick={() => setView("proof")}><ShieldCheck size={18} /> Create Sui verification proof <ArrowRight size={16} /></button>
              <button className="reasoning-button">View reasoning & Gonka Request IDs <ChevronRight size={14} /></button>
            </div>}

            {view === "proof" && <div className="proof-view" aria-live="polite">
              <div className="success-seal"><CheckCircle2 size={34} /></div>
              <span className="overline">VERIFICATION COMPLETE</span>
              <h2>Your proof is secured on Sui</h2>
              <p>The result’s cryptographic fingerprint is now tamper-resistant and ready to share.</p>
              <div className="proof-card">
                <div><span>VERIFICATION ID</span><strong>0x8F3A…71C2</strong></div>
                <div><span>TRUST SCORE</span><strong className="proof-risk">14 / 100 · HIGH RISK</strong></div>
                <div><span>CONTENT HASH</span><code>0x19ae74b8…d03f</code></div>
                <div><span>NETWORK</span><strong><i className="live-dot" /> Sui Testnet</strong></div>
              </div>
              <div className="proof-actions">
                <button className="analyze-button" onClick={copyProof}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Link copied" : "Share verification"}</button>
                <button className="outline-button">View on explorer <ExternalLink size={15} /></button>
              </div>
              <button className="reasoning-button" onClick={resetCheck}><RotateCcw size={13} /> Check something else</button>
            </div>}
          </div>
          <div className="card-shadow-label"><span>POWERED BY</span><strong>Gonka</strong><i /> <strong>Sui</strong></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Platform benefits">
        <div className="shell signal-grid">
          <div><span className="signal-icon coral"><Zap size={18} /></span><p><strong>3 independent models</strong><small>Cross-verified through Gonka</small></p></div>
          <div><span className="signal-icon aqua"><ShieldCheck size={18} /></span><p><strong>One clear trust score</strong><small>Evidence you can understand</small></p></div>
          <div><span className="signal-icon yellow"><FileCheck2 size={18} /></span><p><strong>Proof that can’t be altered</strong><small>Anchored securely on Sui</small></p></div>
        </div>
      </section>

      <section className="how-section shell" id="how-it-works">
        <div className="section-kicker">HOW IT WORKS <span /></div>
        <div className="section-heading">
          <h2>From uncertainty to<br /><em>verifiable clarity.</em></h2>
          <p>A transparent process that combines diverse AI perspectives with decentralized proof.</p>
        </div>
        <div className="steps-grid">
          <article><span className="step-number">01</span><div className="step-icon"><MessageSquareText /></div><h3>Submit anything suspicious</h3><p>Paste a message, claim, article excerpt or URL. Your content stays private.</p><span className="step-link">Text, links & claims <ChevronRight size={14} /></span></article>
          <article><span className="step-number">02</span><div className="step-icon"><CircleDot /></div><h3>AI models cross-check it</h3><p>Multiple independent models inspect the content for evidence, patterns and red flags.</p><span className="step-link">Powered by Gonka <ChevronRight size={14} /></span></article>
          <article><span className="step-number">03</span><div className="step-icon"><FileCheck2 /></div><h3>Get a proof you can share</h3><p>See a clear score and reasoning, then create a tamper-resistant verification record.</p><span className="step-link">Secured on Sui <ChevronRight size={14} /></span></article>
        </div>
      </section>

      <section className="records-section" id="verifications">
        <div className="shell records-inner">
          <div className="records-copy">
            <div className="section-kicker">PUBLIC PROOF <span /></div>
            <h2>Every check tells a<br />verifiable story.</h2>
            <p>TrustLens records the result—not your private content. Anyone can confirm when a verification happened and that it has not been altered.</p>
            <a href="#verify">Run your first check <ArrowRight size={15} /></a>
          </div>
          <div className="record-list">
            <div className="record-head"><span>RECENT TESTNET VERIFICATIONS</span><span><i /> Live</span></div>
            <article><span className="record-mark danger"><AlertTriangle size={17} /></span><div><strong>Government aid impersonation</strong><small>Verified 2 min ago · 0x8F3A…71C2</small></div><span className="record-score danger-text">14<small>/100</small></span></article>
            <article><span className="record-mark safe"><ShieldCheck size={17} /></span><div><strong>Official banking advisory</strong><small>Verified 18 min ago · 0x2C11…9B04</small></div><span className="record-score safe-text">92<small>/100</small></span></article>
            <article><span className="record-mark caution"><Link2 size={17} /></span><div><strong>Investment return claim</strong><small>Verified 41 min ago · 0x7DA0…E128</small></div><span className="record-score caution-text">31<small>/100</small></span></article>
            <div className="record-foot"><LockKeyhole size={12} /> Original submitted content remains private</div>
          </div>
        </div>
      </section>

      <section className="trust-band" id="about">
        <div className="shell trust-band-inner">
          <p><ShieldCheck size={19} /> BUILT FOR DIGITAL SELF-DEFENCE</p>
          <blockquote>“Don’t just trust the answer.<br /><span>Trust the evidence behind it.</span>”</blockquote>
          <div className="micro-marks"><span>GONKA<br /><small>DECENTRALIZED AI</small></span><i /><span>SUI<br /><small>VERIFIABLE PROOF</small></span></div>
        </div>
      </section>
    </main>
  );
}
