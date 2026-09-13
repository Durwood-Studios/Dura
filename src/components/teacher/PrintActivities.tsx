import type { QuizQuestion } from "@/components/lesson/Quiz";
import type { ParsonsBlock, ParsonsSolutionStep } from "@/components/lesson/ParsonsPanel";

interface PrintQuizProps {
  questions?: QuizQuestion[];
  question?: string;
  options?: string[];
  answer?: number;
  correct?: number;
  explanation?: string;
}
/** Print every question and an explicit answer key without interactive pagination. */
export function PrintQuiz(props: PrintQuizProps): React.ReactElement {
  const questions = props.questions ?? [
    {
      question: props.question ?? "",
      options: props.options ?? [],
      correct: props.answer ?? props.correct ?? 0,
      explanation: props.explanation,
    },
  ];
  return (
    <section className="my-6 space-y-4">
      <h3>Practice questions</h3>
      {questions.map((question, index) => (
        <div key={index} className="break-inside-avoid">
          <p>
            {index + 1}. {question.question}
          </p>
          <ol className="ml-6 list-[upper-alpha]">
            {question.options.map((option, choice) => (
              <li key={choice}>{option}</li>
            ))}
          </ol>
          <p className="mt-3">Your answer: ____________________</p>
        </div>
      ))}
      <section className="mt-6">
        <h4>Answer key</h4>
        {questions.map((question, index) => (
          <p key={index}>
            {index + 1}.{" "}
            {(Array.isArray(question.correct) ? question.correct : [question.correct])
              .map((choice) => String.fromCharCode(65 + choice))
              .join(", ")}{" "}
            — {question.explanation}
          </p>
        ))}
      </section>
    </section>
  );
}
/** Static blanks preserve all prompts, writing space, and keyed answers. */
export function PrintFillBlank(props: {
  prompt?: string;
  question?: string;
  answers?: string[];
  answer?: string;
}): React.ReactElement {
  const prompt = props.prompt ?? `${props.question ?? ""} ___`;
  return (
    <section className="my-6">
      <p>{prompt}</p>
      <p className="mt-4">Answer key: {(props.answers ?? [props.answer ?? ""]).join("; ")}</p>
    </section>
  );
}
/** A printable ordering task includes every block and the separately labeled solution. */
export function PrintParsons(props: {
  blocks: ParsonsBlock[];
  distractors?: ParsonsBlock[];
  solution: ParsonsSolutionStep[];
}): React.ReactElement {
  const blocks = [...props.blocks, ...(props.distractors ?? [])];
  return (
    <section className="my-6">
      <h3>Arrange the blocks and indentation</h3>
      <pre className="whitespace-pre-wrap">
        {blocks.map((block) => `${block.id}: ${block.content}`).join("\n")}
      </pre>
      <p>Your ordering: ____________________</p>
      <h4>Answer key</h4>
      <pre className="whitespace-pre-wrap">
        {props.solution
          .map(
            (step) =>
              `${"  ".repeat(step.indent)}${blocks.find((block) => block.id === step.id)?.content ?? step.id}`
          )
          .join("\n")}
      </pre>
    </section>
  );
}
/** Paper practice includes instructions, criteria, and the worked response. */
export function PrintWritten(props: {
  instructions: string;
  rubric: string[];
  modelAnswer: string;
  title?: string;
}): React.ReactElement {
  return (
    <section className="my-6">
      <h3>{props.title ?? "Written practice"}</h3>
      <p>{props.instructions}</p>
      <ul>
        {props.rubric.map((criterion) => (
          <li key={criterion}>□ {criterion}</li>
        ))}
      </ul>
      <p className="my-8">Response: ____________________________________________________</p>
      <h4>Worked response — self-review, not an independent grade</h4>
      <pre className="whitespace-pre-wrap">{props.modelAnswer}</pre>
    </section>
  );
}
/** Sandbox worksheets remain usable without loading the online runner. */
export function PrintSandbox(props: {
  instructions: string;
  initialCode: string;
  solution: string;
  testCases?: string[];
}): React.ReactElement {
  return (
    <section className="my-6">
      <h3>Code practice</h3>
      <p>{props.instructions}</p>
      <pre className="whitespace-pre-wrap">{props.initialCode}</pre>
      <ul>
        {props.testCases?.map((test) => (
          <li key={test}>{test}</li>
        ))}
      </ul>
      <h4>Reference solution</h4>
      <pre className="whitespace-pre-wrap">{props.solution}</pre>
    </section>
  );
}
