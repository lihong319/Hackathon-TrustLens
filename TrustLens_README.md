# TrustLens

> **AI-powered scam and misinformation verification with decentralized proof on Sui.**

TrustLens is a proposed project for the **MUBA Blockchain Hackathon 2026**, designed to compete in both:

- **Sui Track 02 — AI × Sui**
- **Gonka Track — AI for Society**

The project combines **multi-model AI verification through Gonka Router** with **tamper-resistant verification records on Sui**.

---

## 1. Problem

People regularly receive suspicious or misleading content through:

- WhatsApp
- SMS
- Social media
- News articles
- Websites
- Investment promotions
- Fake government or banking messages
- Online fundraising campaigns

Examples:

- “Your bank account will be suspended. Click this link immediately.”
- “You are eligible for RM500 government aid. Register here.”
- “This investment guarantees 30% monthly returns.”
- A viral social-media claim with no reliable supporting evidence.

Most users do not have an easy way to determine whether something is:

- Legitimate
- Misleading
- Suspicious
- Fraudulent
- Unverifiable

Even when an AI system checks a claim, users still need a transparent way to understand the result and prove what content was evaluated.

---

## 2. Proposed Solution

**TrustLens** is an AI-powered trust and verification platform.

A user submits suspicious content such as:

- Text
- A claim
- A URL
- A message
- A news statement

TrustLens sends the content through **Gonka Router**, where multiple AI models can independently analyze and cross-check it.

The system then produces:

- A **Trust Score**
- A risk level
- AI reasoning
- Key warning signals
- Model agreement / disagreement
- Gonka Request IDs
- A recommended action

The user can then create a **Verification Proof on Sui**.

The Sui record acts as tamper-resistant evidence that a specific piece of content was analyzed at a particular time.

---

## 3. One-Line Pitch

> **TrustLens uses multiple AI models through Gonka to detect scams and misinformation, then records tamper-resistant verification evidence on Sui.**

---

## 4. Why TrustLens Fits the Hackathon

### Sui Track 02 — AI × Sui

The MUBA hackathon asks participants to build AI applications powered by Sui and states that Sui can be used for:

- Ownership
- Identity
- Payments
- On-chain execution

The track specifically looks for:

- AI solving a real problem
- Sui being integral rather than an add-on
- Thoughtful UX
- A working live demo

Helpful Sui features listed by the organizers include:

- zkLogin
- Walrus / MemWal
- Programmable Transaction Blocks
- Sponsored transactions

### Gonka Track — AI for Society

The Gonka track asks teams to:

> Build AI tools with genuine public value using Gonka.

The organizers list possible directions including:

- AI fact checker
- Multilingual public assistant
- Accessibility tools
- Open knowledge engine

For a preferred fact-checker implementation, the hackathon specifically mentions:

- Input URL or text
- Multi-model cross-verification
- Truth Score from 0–100%
- Reasoning trace
- Gonka Request IDs

All AI reasoning and verification must run through **Gonka Router**.

TrustLens is intentionally designed around these requirements.

---

## 5. Core User Flow

```text
User submits suspicious content
            |
            v
       Gonka Router
            |
            v
   Multiple AI Models
      /      |      \
 Model A  Model B  Model C
      \      |      /
            v
     Cross-Verification
            |
            v
        Trust Engine
            |
    +-------+--------+
    |                |
    v                v
Trust Score      Risk Explanation
    |
    v
Verification Result
    |
    v
Create Sui Proof
    |
    v
Shareable Verification Record
```

---

## 6. Example User Experience

A user receives this message:

> “Congratulations! You have received RM3,000 government assistance. Click this link immediately to claim your payment.”

The user pastes it into TrustLens.

TrustLens returns:

```text
TRUSTLENS RESULT

Trust Score: 14 / 100

Risk Level: HIGH

Assessment:
Likely fraudulent or highly suspicious.

Warning Signals:
- Urgent call to action
- Financial incentive
- Suspicious or unverifiable URL
- No reliable supporting evidence
- Multiple AI models detect phishing characteristics

Model Consensus:
Model A: Likely Scam
Model B: Likely Scam
Model C: Suspicious

Recommended Action:
Do not click the link.
Do not provide personal information.
Verify through the organisation's official website or contact channel.

Gonka Request IDs:
#request-001
#request-002
#request-003
```

The user can then press:

**Create Verification Proof**

TrustLens writes the verification record to Sui.

---

## 7. Gonka Router's Role

Gonka should be a **core dependency**, not an optional AI API.

All TrustLens AI reasoning and verification should run through Gonka Router.

Possible process:

1. Receive user content.
2. Send the same content to multiple AI models using Gonka Router.
3. Ask each model to independently:
   - Determine claim credibility.
   - Identify scam indicators.
   - Identify unsupported statements.
   - Explain its reasoning.
4. Compare the model responses.
5. Produce a combined Trust Score.
6. Display model agreement and disagreement.
7. Display Gonka Request IDs for transparency.

Example:

```text
Model A -> Scam: 94%
Model B -> Scam: 89%
Model C -> Suspicious: 82%

Combined Trust Score:
12 / 100

Consensus:
Strong agreement that the message is suspicious.
```

---

## 8. Sui's Role

Sui should provide **verifiable trust infrastructure** rather than being added only for hackathon eligibility.

For each verification, TrustLens can create a Sui verification object containing information such as:

```text
Verification ID
Content Hash
Trust Score
Risk Level
Timestamp
Verification Result Hash
Gonka Request ID(s)
Reporter / Owner
Status
```

### Important Design Principle

Do **not** store sensitive user content directly on-chain.

Instead:

```text
Original Content
      |
      v
   Hash Content
      |
      v
Create Sui Verification Object
```

This allows TrustLens to prove that the analyzed content has not been changed while avoiding unnecessary exposure of private information.

---

## 9. Proposed Sui Verification Object

Conceptually:

```text
TrustLensVerification
|
+-- verification_id
+-- content_hash
+-- trust_score
+-- risk_level
+-- created_at
+-- gonka_request_ids
+-- result_hash
+-- owner
+-- status
```

Possible statuses:

- VERIFIED_SAFE
- LOW_RISK
- SUSPICIOUS
- HIGH_RISK
- UNVERIFIABLE

---

## 10. Community Scam Reputation

A strong extension is to let users report suspicious content.

Example:

```text
Suspicious URL
      |
      v
TrustLens Analysis
      |
      v
High-Risk Result
      |
      v
User Selects "Report Scam"
      |
      v
Sui Reputation Record
      |
      v
Community Scam Database
```

A domain or scam campaign might eventually show:

```text
example-scam-site.com

AI Risk Score: 96%

Community Reports: 582

First Detected:
29 Aug 2026

Most Recent Report:
3 Sep 2026

Verification History:
Available on Sui
```

This turns TrustLens from a simple AI checker into a:

> **Decentralized AI Trust Network**

---

## 11. MVP Scope

The hackathon MVP should remain small and reliable.

### Must Have

- [ ] User can enter text or a URL.
- [ ] Content is sent through Gonka Router.
- [ ] Multiple AI models analyze the content.
- [ ] TrustLens calculates a Trust Score.
- [ ] TrustLens displays a risk level.
- [ ] TrustLens displays understandable reasoning.
- [ ] Gonka Request IDs are shown.
- [ ] User can create a verification proof on Sui.
- [ ] User can view the Sui transaction / verification result.
- [ ] A clean and simple web interface.
- [ ] Working end-to-end live demo.

### Good to Have

- [ ] Shareable verification link.
- [ ] Verification history.
- [ ] Community report count.
- [ ] Multilingual analysis.
- [ ] URL/domain reputation.
- [ ] QR code for verification results.

### Only If Time Allows

- [ ] Screenshot / image text extraction.
- [ ] Browser extension.
- [ ] WhatsApp integration.
- [ ] Social-media integration.
- [ ] Wallet-address scam checking.
- [ ] Community reputation / voting.
- [ ] Public API.

---

## 12. Recommended MVP Screen Flow

### Screen 1 — Home

```text
TrustLens

Verify before you trust.

[ Paste a message, URL or claim... ]

[ Analyze ]
```

### Screen 2 — AI Analysis

```text
Trust Score

14 / 100

HIGH RISK

Warnings:
- Suspicious domain
- Urgency language
- Unsupported financial claim

Model Consensus:
3 / 3 models consider this suspicious.

[ View AI Reasoning ]

[ Create Sui Verification Proof ]
```

### Screen 3 — Blockchain Verification

```text
Verification Created Successfully

Verification ID:
0x8F3A...

Content Hash:
0x19AE...

Trust Score:
14 / 100

Network:
Sui

[ View Verification ]
[ Share Result ]
```

---

## 13. Demo Flow

The final demo should be extremely simple.

### Suggested Live Demo

1. Open TrustLens.
2. Paste a suspicious scam message.
3. Click **Analyze**.
4. Show Gonka processing.
5. Show multiple model responses.
6. Show the final Trust Score.
7. Show warning signs and reasoning.
8. Show Gonka Request IDs.
9. Click **Create Verification Proof**.
10. Sign / execute the Sui transaction.
11. Show the successfully created Sui verification.
12. Open the shareable verification page.

### Target Demo Time

Keep the main product demo around **60–90 seconds**.

---

## 14. The "WOW" Moment

A strong judge-facing moment would be:

```text
SCAM PROBABILITY / TRUST RESULT

Trust Score:
9 / 100

Risk:
HIGH

AI Consensus:
3 / 3 models agree

Warning Signals:
- Fake government claim
- Suspicious domain
- Urgent payment request
- No reliable supporting evidence

Gonka Verified
Sui Proof Created
```

The judge sees:

1. A real social problem.
2. AI working.
3. Multi-model reasoning.
4. Gonka integration.
5. Sui integration.
6. A completed end-to-end transaction.

---

## 15. Why Blockchain Is Necessary

A common hackathon mistake is using blockchain only because the competition requires it.

TrustLens should clearly explain why Sui is useful.

### Without Sui

A centralized TrustLens server could change:

- Previous results
- Scores
- Timestamps
- Verification history

Users would have to trust TrustLens itself.

### With Sui

TrustLens can produce a tamper-resistant verification record.

This gives users proof that:

> The analyzed content and verification result existed in this state at this time.

Blockchain therefore becomes part of the **trust layer**.

---

## 16. Why AI Is Necessary

Scam and misinformation detection is not a simple yes/no database lookup.

Users may submit:

- New scams
- Modified scams
- Different languages
- Manipulated claims
- Context-dependent misinformation
- Previously unseen content

AI allows TrustLens to reason about new content.

Using multiple models through Gonka improves transparency by showing whether different AI systems agree.

---

## 17. Suggested Technical Architecture

```text
                    FRONTEND
              React / Next.js / Vue
                       |
                       v
                    BACKEND
             API / Verification Engine
                       |
          +------------+-------------+
          |                          |
          v                          v
    Gonka Router                  Sui SDK
          |                          |
          v                          v
  Multiple AI Models        Verification Object
          |                          |
          v                          v
 AI Analysis Results             Sui Network
          |
          v
     Trust Engine
          |
          v
   Combined Result
```

The final technologies can be changed depending on team experience.

---

## 18. Suggested Team Roles

For a four-person team:

### Member 1 — AI / Gonka

Responsibilities:

- Gonka Router integration
- Multi-model prompts
- Verification pipeline
- Trust Score algorithm
- Model consensus

### Member 2 — Sui / Blockchain

Responsibilities:

- Sui SDK integration
- Verification object
- Wallet connection
- Transaction execution
- Blockchain verification page

### Member 3 — Frontend / UX

Responsibilities:

- Main interface
- Result dashboard
- Trust Score visualization
- Wallet interaction UX
- Shareable verification page

### Member 4 — Backend / Product / Integration

Responsibilities:

- API
- Hashing
- Database if needed
- Connecting Gonka + Sui + frontend
- Deployment
- Demo reliability

Everyone should help with:

- Testing
- README
- Demo video
- Pitch
- Q&A preparation

---

## 19. Suggested Development Priority

### Phase 1 — Prove Sponsor Integrations

Before building a beautiful UI:

1. Make one successful Gonka Router request.
2. Get responses from multiple models.
3. Make one successful Sui transaction.
4. Create / retrieve one verification record.

If these four things work, the core technical risk is reduced.

### Phase 2 — Build End-to-End Flow

```text
Input
  ->
Gonka
  ->
Trust Score
  ->
Result
  ->
Sui Verification
```

### Phase 3 — Improve UX

Only after the complete flow works:

- Better design
- Animations
- Charts
- Verification history
- Sharing

---

## 20. Suggested Pitch Structure

The physical pitching session is:

- **5-minute presentation**
- **5-minute Q&A**
- Live working demo required

Suggested structure:

### 0:00–0:30 — Problem

Explain how users receive scams and misinformation every day and often cannot easily verify them.

### 0:30–1:00 — Solution

Introduce TrustLens.

### 1:00–2:30 — Live Demo

Show:

```text
Suspicious message
        ->
Gonka multi-model analysis
        ->
Trust Score
        ->
Sui verification
```

### 2:30–3:20 — Technology

Explain why:

- Gonka is needed for AI reasoning.
- Sui is needed for tamper-resistant verification.

### 3:20–4:10 — Impact

Explain future possibilities:

- Scam reporting
- Fake investment detection
- News verification
- Public-service scam detection
- Community reputation network

### 4:10–5:00 — Vision

Finish with:

> TrustLens is not only an AI fact checker. Our goal is to create a decentralized AI trust layer that helps people verify digital information before they trust, share or act on it.

---

## 21. Hackathon Submission Requirements

According to the MUBA Hackathon opening materials, the submission deadline is:

**5 September 2026, 11:59 PM MYT**

The submission package must include:

- Public GitHub or equivalent repository
- Clear commit history
- README
- Project description
- Problem description
- Blockchain used
- Testnet contract addresses
- Setup / installation instructions
- Team members
- 3–5 minute demonstration video
- Declaration of every AI tool used
- Track-specific submission requirements

A live working demo is required during the physical pitching session on **6 September 2026**.

---

## 22. Important Hackathon Rules

The project must be:

- Conceived and developed during the official hacking period.
- Developed from scratch during the event.
- Not previously submitted to another hackathon, competition or accelerator.
- Stored in a repository whose commit history begins no earlier than **26 August 2026**.

The rules also state that pre-existing privately built proprietary frameworks, boilerplate templates or codebases developed before the event are prohibited.

Teams should keep the repository history clean and transparent.

---

## 23. Mainnet Warning

The hackathon rules state that:

> Mainnet deployment using real funds during the hacking period may result in immediate disqualification.

This should be confirmed with organizers if any sponsor-specific requirement appears to require mainnet execution.

For TrustLens, we should prefer the appropriate Sui test environment unless the organizers explicitly instruct otherwise.

---

## 24. Multi-Track Strategy

The hackathon rules allow:

> A project to compete in multiple tracks and potentially win multiple prizes.

TrustLens is designed specifically to target both:

### Gonka — AI for Society

Because:

- It provides public value.
- It performs multi-model AI verification.
- It produces a Trust Score.
- It exposes reasoning.
- It displays Gonka Request IDs.

### Sui — AI × Sui

Because:

- AI solves a real problem.
- Sui provides the verification and trust layer.
- The blockchain integration is part of the product rather than an add-on.
- The entire workflow can be demonstrated live.

---

## 25. Main Success Criteria

Before adding extra features, the team should make sure these six things are excellent:

1. **The problem is obvious.**
2. **The demo works reliably.**
3. **Gonka is clearly central to the AI system.**
4. **Sui has a meaningful purpose.**
5. **The UI is simple and understandable.**
6. **Judges can understand the entire project within one minute.**

---

## 26. Product Vision

The hackathon MVP begins with:

```text
Text / URL
   ->
AI Verification
   ->
Trust Score
   ->
Sui Proof
```

The long-term vision is:

# TrustLens — Decentralized AI Trust Network

Potential future verification categories:

- Scam messages
- Fake news
- Investment claims
- Government impersonation
- Fake fundraisers
- Suspicious websites
- Shopping scams
- Crypto wallet reputation
- AI-generated misinformation
- Social-media claims

The goal is simple:

> **Verify before you trust.**

---

## 27. Current Project Decision

**Project:** TrustLens  
**Primary Concept:** AI Scam & Misinformation Verification  
**Target Track 1:** Sui AI × Sui  
**Target Track 2:** Gonka AI for Society  
**Core AI Provider:** Gonka Router  
**Blockchain:** Sui  
**MVP:** Text/URL → Multi-model verification → Trust Score → Sui verification proof  
**Main Goal:** Deliver a polished, reliable, easy-to-understand live demonstration that meaningfully satisfies both sponsor tracks.

---

## Source

This project plan is based on the **MUBA Blockchain Hackathon 2026 Opening Ceremony** materials, particularly:

- Sui Track Reveal
- Sui Track 02 — AI × Sui
- Gonka Track — AI for Society
- Submission & Pitching Requirements
- Judging Criteria
- Prizes & Awards
- Project Authenticity & Technical Constraints
- Code of Conduct

The **TrustLens product concept, architecture, feature ideas and implementation strategy are our proposed approach**, rather than requirements stated by the organizers.
