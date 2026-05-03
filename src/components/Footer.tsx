export function Footer() {
  return (
    <footer className="mt-12 border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
      <p>
        Pack Planner · Powered by{" "}
        <a
          className="underline-offset-4 hover:underline"
          href="https://groq.com"
          target="_blank"
          rel="noreferrer"
        >
          Groq
        </a>{" "}
        +{" "}
        <a
          className="underline-offset-4 hover:underline"
          href="https://upstash.com"
          target="_blank"
          rel="noreferrer"
        >
          Upstash
        </a>
        . Limited to 3 generations / day per IP.
      </p>
    </footer>
  );
}
