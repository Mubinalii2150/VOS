import { useState } from "react";

export default function TerminalApp() {
  const [lines, setLines] = useState([
    "Phoenix Terminal v1.0",
    "Type 'help' to begin.",
  ]);

  const [cmd, setCmd] = useState("");

  const run = () => {
    if (!cmd) return;

    let output = "";

    switch (cmd.trim()) {
      case "help":
        output = "Commands: help, ls, clear, vos";
        break;

      case "ls":
        output = "Documents  Downloads  Pictures  Projects";
        break;

      case "vos":
        output = "Phoenix OS • Rise Build Innovate";
        break;

      case "clear":
        setLines([]);
        setCmd("");
        return;

      default:
        output = `'${cmd}' is not recognized`;
    }

    setLines((prev) => [...prev, `> ${cmd}`, output]);
    setCmd("");
  };

  return (
    <div className="terminal">
      <div className="terminal-output">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      <div className="terminal-input">
        <span>VOS $</span>

        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
      </div>
    </div>
  );
}