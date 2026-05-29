"use client";

import { useCallback, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

interface GateResult {
  inputs: boolean[];
  output: boolean;
}

function evalAND(a: boolean, b: boolean): boolean {
  return a && b;
}

function evalOR(a: boolean, b: boolean): boolean {
  return a || b;
}

function evalNOT(a: boolean): boolean {
  return !a;
}

/** A toggle switch for gate inputs. */
function InputToggle({
  label,
  isOn,
  onToggle,
}: {
  label: string;
  isOn: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <button
      onClick={onToggle}
      aria-label={`${label}: ${isOn ? "on" : "off"}`}
      className="flex min-h-12 min-w-16 items-center justify-center rounded-xl border-2 px-4 text-lg font-bold transition-colors"
      style={{
        backgroundColor: isOn ? "#22c55e" : "var(--color-bg-surface)",
        borderColor: isOn ? "#22c55e" : "var(--color-border)",
        color: isOn ? "#fff" : "var(--color-text-muted)",
      }}
    >
      {label}: {isOn ? "1" : "0"}
    </button>
  );
}

/** An output light indicator. */
function OutputLight({ isOn }: { isOn: boolean }): React.ReactElement {
  return (
    <div
      className="flex size-14 items-center justify-center rounded-full text-lg font-bold"
      style={{
        backgroundColor: isOn ? "#22c55e" : "var(--color-bg-surface)",
        color: isOn ? "#fff" : "var(--color-text-muted)",
        boxShadow: isOn ? "0 0 20px rgba(34,197,94,0.4)" : "none",
      }}
    >
      {isOn ? "1" : "0"}
    </div>
  );
}

/** A truth table for a gate. */
function TruthTable({
  rows,
  inputCount,
}: {
  rows: GateResult[];
  inputCount: number;
}): React.ReactElement {
  return (
    <table className="text-base">
      <thead>
        <tr className="text-[var(--color-text-muted)]">
          {inputCount === 2 ? (
            <>
              <th className="px-3 py-1">A</th>
              <th className="px-3 py-1">B</th>
            </>
          ) : (
            <th className="px-3 py-1">A</th>
          )}
          <th className="px-3 py-1">Out</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="text-center text-[var(--color-text-primary)]">
            {row.inputs.map((inp, j) => (
              <td key={j} className="px-3 py-0.5">
                {inp ? "1" : "0"}
              </td>
            ))}
            <td
              className="px-3 py-0.5 font-bold"
              style={{ color: row.output ? "#22c55e" : "var(--color-text-muted)" }}
            >
              {row.output ? "1" : "0"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Interactive AND, OR, NOT logic gates with truth tables. */
export function LogicGates(): React.ReactElement {
  const [andA, setAndA] = useState(false);
  const [andB, setAndB] = useState(false);
  const [orA, setOrA] = useState(false);
  const [orB, setOrB] = useState(false);
  const [notA, setNotA] = useState(false);

  // Challenge: AND gate with NOT on B — make light green when A=on, B=off
  const [chalA, setChalA] = useState(false);
  const [chalB, setChalB] = useState(false);
  const challengeOutput = evalAND(chalA, evalNOT(chalB));

  const [hasCompleted, setHasCompleted] = useState(false);
  const [toggleCount, setToggleCount] = useState(0);

  const trackToggle = useCallback((): void => {
    const next = toggleCount + 1;
    setToggleCount(next);
    if (next >= 4 && !hasCompleted) {
      setHasCompleted(true);
      markActivityComplete("logic-gates");
    }
  }, [toggleCount, hasCompleted]);

  const andTruth: GateResult[] = [
    { inputs: [false, false], output: false },
    { inputs: [false, true], output: false },
    { inputs: [true, false], output: false },
    { inputs: [true, true], output: true },
  ];

  const orTruth: GateResult[] = [
    { inputs: [false, false], output: false },
    { inputs: [false, true], output: true },
    { inputs: [true, false], output: true },
    { inputs: [true, true], output: true },
  ];

  const notTruth: GateResult[] = [
    { inputs: [false], output: true },
    { inputs: [true], output: false },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* AND Gate */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h3 className="mb-3 text-center text-xl font-bold text-[var(--color-text-primary)]">
          AND Gate <span className="text-[var(--color-text-muted)]">&amp;</span>
        </h3>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col gap-2">
            <InputToggle
              label="A"
              isOn={andA}
              onToggle={() => {
                setAndA(!andA);
                trackToggle();
              }}
            />
            <InputToggle
              label="B"
              isOn={andB}
              onToggle={() => {
                setAndB(!andB);
                trackToggle();
              }}
            />
          </div>
          <span className="text-2xl text-[var(--color-text-muted)]">&rarr;</span>
          <OutputLight isOn={evalAND(andA, andB)} />
          <div className="ml-4">
            <TruthTable rows={andTruth} inputCount={2} />
          </div>
        </div>
        <p className="mt-2 text-center text-base text-[var(--color-text-secondary)]">
          Output is 1 only when <strong>both</strong> inputs are 1
        </p>
      </div>

      {/* OR Gate */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h3 className="mb-3 text-center text-xl font-bold text-[var(--color-text-primary)]">
          OR Gate <span className="text-[var(--color-text-muted)]">|</span>
        </h3>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col gap-2">
            <InputToggle
              label="A"
              isOn={orA}
              onToggle={() => {
                setOrA(!orA);
                trackToggle();
              }}
            />
            <InputToggle
              label="B"
              isOn={orB}
              onToggle={() => {
                setOrB(!orB);
                trackToggle();
              }}
            />
          </div>
          <span className="text-2xl text-[var(--color-text-muted)]">&rarr;</span>
          <OutputLight isOn={evalOR(orA, orB)} />
          <div className="ml-4">
            <TruthTable rows={orTruth} inputCount={2} />
          </div>
        </div>
        <p className="mt-2 text-center text-base text-[var(--color-text-secondary)]">
          Output is 1 when <strong>either</strong> input is 1
        </p>
      </div>

      {/* NOT Gate */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h3 className="mb-3 text-center text-xl font-bold text-[var(--color-text-primary)]">
          NOT Gate <span className="text-[var(--color-text-muted)]">!</span>
        </h3>
        <div className="flex items-center justify-center gap-4">
          <InputToggle
            label="A"
            isOn={notA}
            onToggle={() => {
              setNotA(!notA);
              trackToggle();
            }}
          />
          <span className="text-2xl text-[var(--color-text-muted)]">&rarr;</span>
          <OutputLight isOn={evalNOT(notA)} />
          <div className="ml-4">
            <TruthTable rows={notTruth} inputCount={1} />
          </div>
        </div>
        <p className="mt-2 text-center text-base text-[var(--color-text-secondary)]">
          Output is the <strong>opposite</strong> of the input
        </p>
      </div>

      {/* Challenge */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h3 className="mb-2 text-center text-xl font-bold text-[var(--color-text-primary)]">
          Challenge
        </h3>
        <p className="mb-3 text-center text-lg text-[var(--color-text-secondary)]">
          Make the light turn green! The rule is: A AND (NOT B).
          <br />
          <span className="text-base text-[var(--color-text-muted)]">
            Turn on A and turn off B.
          </span>
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col gap-2">
            <InputToggle
              label="A"
              isOn={chalA}
              onToggle={() => {
                setChalA(!chalA);
                trackToggle();
              }}
            />
            <InputToggle
              label="B"
              isOn={chalB}
              onToggle={() => {
                setChalB(!chalB);
                trackToggle();
              }}
            />
          </div>
          <span className="text-2xl text-[var(--color-text-muted)]">&rarr;</span>
          <span className="text-[var(--color-text-muted)]">NOT B &rarr;</span>
          <span className="text-[var(--color-text-muted)]">AND &rarr;</span>
          <OutputLight isOn={challengeOutput} />
        </div>
        {challengeOutput && (
          <p className="mt-3 text-center text-lg font-bold text-[var(--color-accent-emerald)]">
            You got it!
          </p>
        )}
      </div>

      {/* What you just learned */}
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Every computer is made of billions of tiny logic gates &mdash; switches that decide yes or
          no based on simple rules. AND, OR, and NOT are the building blocks of everything a
          computer does.
        </p>
      </div>
    </div>
  );
}
