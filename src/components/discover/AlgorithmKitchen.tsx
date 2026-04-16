"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const INGREDIENTS = [
  "Get bread",
  "Spread mayo",
  "Add lettuce",
  "Add tomato",
  "Add cheese",
  "Close sandwich",
  "Cut in half",
] as const;

type Ingredient = (typeof INGREDIENTS)[number];

const TARGET_RECIPE: Ingredient[] = [
  "Get bread",
  "Spread mayo",
  "Add lettuce",
  "Add tomato",
  "Add cheese",
  "Close sandwich",
  "Cut in half",
];

/** Color for each ingredient layer in the sandwich stack. */
const LAYER_COLORS: Record<Ingredient, string> = {
  "Get bread": "#d4a574",
  "Spread mayo": "#fef9c3",
  "Add lettuce": "#86efac",
  "Add tomato": "#fca5a5",
  "Add cheese": "#fde047",
  "Close sandwich": "#d4a574",
  "Cut in half": "",
};

/** Height of each ingredient layer in the visualization. */
const LAYER_HEIGHTS: Record<Ingredient, number> = {
  "Get bread": 20,
  "Spread mayo": 6,
  "Add lettuce": 10,
  "Add tomato": 8,
  "Add cheese": 8,
  "Close sandwich": 20,
  "Cut in half": 0,
};

interface CookResult {
  isCorrect: boolean;
  hasError: boolean;
  errorMessage: string;
}

/** Validates the recipe against the target order. */
function validateRecipe(recipe: Ingredient[]): CookResult {
  if (recipe.length !== TARGET_RECIPE.length) {
    return {
      isCorrect: false,
      hasError: true,
      errorMessage: `You have ${recipe.length} steps — the recipe needs ${TARGET_RECIPE.length}.`,
    };
  }

  for (let i = 0; i < TARGET_RECIPE.length; i++) {
    if (recipe[i] !== TARGET_RECIPE[i]) {
      return {
        isCorrect: false,
        hasError: true,
        errorMessage: "Hmm, that doesn't look right. The order of steps matters!",
      };
    }
  }

  return { isCorrect: true, hasError: false, errorMessage: "" };
}

/**
 * Interactive algorithm discovery activity.
 *
 * Users arrange sandwich-making steps in the correct order to learn that
 * algorithms are step-by-step instructions where order matters.
 */
export function AlgorithmKitchen(): React.ReactElement {
  const [recipe, setRecipe] = useState<Ingredient[]>([]);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isCooking, setIsCooking] = useState(false);
  const [result, setResult] = useState<CookResult | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<number>(0);
  const [isCut, setIsCut] = useState(false);
  const cookingRef = useRef(false);

  const addIngredient = useCallback(
    (item: Ingredient): void => {
      if (isCooking) return;
      setResult(null);
      setRecipe((prev) => [...prev, item]);
    },
    [isCooking]
  );

  const removeIngredient = useCallback(
    (index: number): void => {
      if (isCooking) return;
      setResult(null);
      setRecipe((prev) => prev.filter((_, i) => i !== index));
    },
    [isCooking]
  );

  const cook = useCallback(async (): Promise<void> => {
    if (recipe.length === 0 || isCooking) return;

    setIsCooking(true);
    setResult(null);
    setVisibleLayers(0);
    setIsCut(false);
    cookingRef.current = true;

    const validation = validateRecipe(recipe);

    // Animate through each step
    for (let i = 0; i < recipe.length; i++) {
      if (!cookingRef.current) break;
      setActiveStep(i);

      // Build sandwich visualization progressively
      if (recipe[i] === "Cut in half") {
        setIsCut(true);
      } else {
        setVisibleLayers(i + 1);
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setActiveStep(-1);
    setResult(validation);
    setIsCooking(false);
    cookingRef.current = false;
  }, [recipe, isCooking]);

  const reset = useCallback((): void => {
    cookingRef.current = false;
    setRecipe([]);
    setActiveStep(-1);
    setIsCooking(false);
    setResult(null);
    setVisibleLayers(0);
    setIsCut(false);
  }, []);

  // Build the sandwich layer stack from the recipe (only ingredients with layers)
  const layerStack = recipe.slice(0, visibleLayers).filter((item) => LAYER_HEIGHTS[item] > 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Algorithm Kitchen
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Build a sandwich by putting the steps in the right order
      </p>

      <div className="flex w-full flex-col gap-6 sm:flex-row">
        {/* Left: Available ingredients */}
        <div className="flex-1">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">Ingredients</h3>
          <div className="flex flex-col gap-2">
            {INGREDIENTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => addIngredient(item)}
                disabled={isCooking}
                className={cn(
                  "min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-150",
                  isCooking
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-[var(--color-bg-surface-hover)]"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Recipe + Sandwich visualization */}
        <div className="flex-1">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">Your Recipe</h3>

          <div className="mb-4 flex min-h-[240px] flex-col gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 backdrop-blur-xl">
            {recipe.length === 0 ? (
              <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                Click ingredients to add steps
              </p>
            ) : (
              recipe.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  type="button"
                  onClick={() => removeIngredient(i)}
                  disabled={isCooking}
                  aria-label={`Remove step ${i + 1}: ${item}`}
                  className={cn(
                    "flex min-h-[40px] items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200",
                    activeStep === i
                      ? "bg-[var(--color-accent-emerald)]/20 text-[var(--color-accent-emerald)]"
                      : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-hover)]",
                    isCooking && "cursor-default"
                  )}
                >
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    {i + 1}.
                  </span>
                  {item}
                </button>
              ))
            )}
          </div>

          {/* Sandwich visualization */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex min-h-[120px] w-48 flex-col-reverse items-center justify-start gap-0.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 backdrop-blur-xl"
              role="img"
              aria-label="Sandwich visualization"
            >
              {layerStack.length === 0 ? (
                <span className="text-xs text-[var(--color-text-muted)]">Plate</span>
              ) : (
                <div
                  className={cn(
                    "flex w-full flex-col-reverse gap-0.5 transition-all duration-300",
                    isCut && "gap-3"
                  )}
                >
                  {isCut ? (
                    // Show two halves
                    <div className="flex gap-2">
                      {[0, 1].map((half) => (
                        <div key={half} className="flex flex-1 flex-col-reverse gap-0.5">
                          {layerStack.map((item, idx) => (
                            <div
                              key={`${half}-${idx}`}
                              className="rounded-sm transition-all duration-300"
                              style={{
                                backgroundColor: LAYER_COLORS[item],
                                height: `${LAYER_HEIGHTS[item]}px`,
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    layerStack.map((item, idx) => (
                      <div
                        key={idx}
                        className="w-full rounded-sm transition-all duration-300"
                        style={{
                          backgroundColor: LAYER_COLORS[item],
                          height: `${LAYER_HEIGHTS[item]}px`,
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={cook}
          disabled={recipe.length === 0 || isCooking}
          className={cn(
            "min-h-[48px] rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-150",
            recipe.length === 0 || isCooking
              ? "cursor-not-allowed bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]"
              : "bg-[var(--color-accent-emerald)] text-black hover:brightness-110"
          )}
        >
          {isCooking ? "Cooking..." : "Cook!"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isCooking}
          className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-surface-hover)]"
        >
          Reset
        </button>
      </div>

      {/* Result feedback */}
      {result && (
        <div
          className={cn(
            "w-full max-w-md rounded-xl border p-5 text-center text-sm transition-all duration-300",
            result.isCorrect
              ? "border-[var(--color-accent-emerald)]/30 bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)]"
              : "border-red-400/30 bg-red-400/10 text-red-400"
          )}
        >
          {result.isCorrect
            ? "Perfect sandwich! An algorithm is just a set of steps in the right order."
            : result.errorMessage}
        </div>
      )}

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          An algorithm is a recipe for a computer. The steps have to be in the right order, or the
          result is wrong. Every app, game, and website runs on algorithms.
        </p>
      </div>
    </div>
  );
}
