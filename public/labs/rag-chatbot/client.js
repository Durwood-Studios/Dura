const form = document.querySelector("form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  const status = document.querySelector('[role="status"]');
  button.disabled = true;
  status.textContent = "Retrieving evidence…";
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: new FormData(form).get("question") }),
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    document.querySelector("#answer").textContent = data.answer;
    document.querySelector("#sources").replaceChildren(
      ...data.sources.map((source) => {
        const passage = document.createElement("p");
        passage.textContent = `${source.id} · cosine ${source.score.toFixed(3)}\n${source.text}`;
        return passage;
      })
    );
    status.textContent = data.mode;
  } catch (error) {
    status.textContent = `${error.message}. Retry after checking the server.`;
  } finally {
    button.disabled = false;
  }
});
