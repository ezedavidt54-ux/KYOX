import Link from "next/link";

const stages = [
  ["01", "Observe", "KYOX watches the trader's analysis and decisions without executing."],
  ["02", "Shadow", "The personal intelligence proposes trades and the user compares them with real decisions."],
  ["03", "Paper", "The intelligence executes simulated trades against live market conditions."],
  ["04", "Autonomous", "The intelligence can execute within the user's explicit risk and protocol limits."],
];

export default function IntelligencePage() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 5vw" }}>
      <Link href="/" style={{ opacity: 0.65 }}>← KYOX</Link>
      <div style={{ maxWidth: 900, margin: "80px auto" }}>
        <div style={{ letterSpacing: ".18em", fontSize: 11, opacity: 0.55 }}>KYOX / PERSONAL INTELLIGENCE</div>
        <h1 style={{ fontSize: "clamp(42px, 8vw, 88px)", lineHeight: 0.95, margin: "18px 0" }}>
          BUILD YOUR<br />TRADING INTELLIGENCE.
        </h1>
        <p style={{ maxWidth: 650, opacity: 0.7, lineHeight: 1.8 }}>
          KYOX will learn how each trader analyses, decides, manages and executes.
          Every user gets an independent intelligence, memory and risk profile.
        </p>
        <div style={{ display: "grid", gap: 12, marginTop: 48 }}>
          {stages.map(([number, title, text]) => (
            <div key={number} style={{ display: "grid", gridTemplateColumns: "60px 140px 1fr", gap: 16, padding: 22, border: "1px solid rgba(255,255,255,.1)", borderRadius: 14 }}>
              <span style={{ opacity: 0.4 }}>{number}</span>
              <strong>{title}</strong>
              <span style={{ opacity: 0.6 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
