---
name: feature-planner
description: Turns a feature or idea into a visual flow, a short plan file, and test-first specs before any code is written. Use whenever the user describes something to build, improve or change ("I want to add...", "let's improve...", "how should we build...", "plan this", "spec this", "design this feature"), even if they never say "plan". Also use when the user says the plan is too text-heavy, asks "where are we?", or wants to hand a feature to Claude Code or Codex. Reads the existing code first, shows the flow before any detail, names the domain (entities, value objects, rules, boundaries) in plain words, always asks the user 2 to 3 clarifying questions before committing to a design, then writes PLAN.md and red tests.
---

# Feature planner

Goal: the user never reads a wall of text and never reviews code they can't judge.
They review three small things instead: a **diagram**, a **short list of decisions**, and **tests**.

Order matters. Do the steps in order. Do not skip ahead.

## 1. Read the code first

Before asking anything:
- Read `AGENTS.md` / `CLAUDE.md` (rules, commands, module map).
- Find the folder the feature lives in. Read it. Read existing types, interfaces and any `PLAN.md`.
- Note what is **built**, what is a **skeleton** (empty or abstract), and what is **missing**.
- If a `PLAN.md` already exists, read it, report status in 5 lines, and continue from there.

If you cannot read the code (no access), say so in one line and ask the user to paste the key files.

## 2. Say the idea back in 3 sentences

Use the user's words. Add one line: "Today the code does X. This idea changes Y."
Do not ask permission to continue. Move on.

## 3. Draw the flow before any detail

This is the most important step. Users lose trust when they see tests before they see the flow.

Draw one diagram (mermaid, or the inline visual tool if the chat has one):
- Left or top: **inputs** (who or what starts it, what data goes in).
- Middle: **stages**, each with a 3 to 5 word label.
- End: **outputs** (response, saved state, background work).
- Colour or mark each box: built / skeleton / to build.

Then walk through the diagram once with a **worked example** (a real person doing a real thing, 6 to 8 short lines).

While drawing, look for **gaps**: a stage whose output type does not match the next stage's input type.
Example: sources return only ids, but the next stage needs genres, so a "details" stage is missing.
Call gaps out. They are the best value of this step.

Stop here if the user pushes back on the flow. Fix the diagram before going on.

## 4. Name the domain (light DDD)

Users want to know **what the things in the feature are**. Write this down before asking questions,
because unclear words and unclear rules are where the best questions come from.

Keep it light. This is a thinking tool, not a reason to add classes. Follow the repo's existing structure.

Produce, in this order:

1. **Glossary (ubiquitous language).** 5 to 10 words the feature uses, one plain line each.
   Use the same words in code, tests, the plan and chat. If the code says "seed" and you say "starting title", fix one.
2. **Entities.** Things with an identity that lives over time. For each: its id, who owns it, how it changes.
   (Example: a user's saved pool: id = user + media type, grows, expires.)
3. **Value objects.** Things defined only by their values, never changed, no id of their own.
   (Example: a candidate = id + media type. A cursor. A taste profile.)
4. **Rules (invariants).** What must always be true, as short sentences.
   (Example: "A pool never holds the same title twice." "Earlier pages never change.")
   Every rule becomes at least one test. Say which test.
5. **Boundaries.** Which parts belong to this feature and which belong to other modules or outside services.
   Say how this feature reads from them. If the code already has an adapter or "input" layer for that,
   name it as the boundary. Never reach across it.
6. **Aggregate root (only if there is one).** The single entity that guards the rules above, and the only door in.

Show it as a small table plus a mermaid class or ER diagram. Mark each item: exists in code / new.
Look for **mismatches**: a rule with no owner, an entity with two owners, a word used for two things.
Report them. They are real design bugs.

## 5. Ask the user questions (this step is a gate)

Do not write the plan or any test until the user has answered a round of questions.
This is not politeness. It is the cheapest moment to be wrong.

Why this matters:
- A wrong guess costs one tap now. After the code exists, it costs a rewrite and a code review.
- The user knows things the code cannot tell you: who uses it, what "good" means, what they already tried.
- Users forgive a question. They do not forgive a confident plan built on a guess.
- "The request seems clear" is the most common reason for a wrong build. Clear requests still hide choices.

**You must ask at least 2 questions, and at most 3, in one round.**
If you think you have zero questions, you have not looked hard enough. Look again at the flow
and find the 2 places where two reasonable engineers would build it differently.

Where good questions hide (check each, ask the ones that matter):
- **Scope:** what is explicitly NOT part of this? What is the smallest useful version?
- **Rules:** what should happen at the edges? (empty data, new user, duplicates, deleted items, limits)
- **Meaning:** what does a vague word in the request actually mean? ("better", "personalized", "fast", "recent")
- **Cost:** is there a choice between cheap-and-simple and smart-and-expensive?
- **Storage and lifetime:** where does state live, and how long?
- **Failure:** what should the user see when a dependency is down or slow?
- **Who:** every user, logged-in users only, a test group?
- **Domain gaps:** any rule with no owner, any word with two meanings, any entity whose lifetime is unclear.

How to ask:
- Use the tappable-options tool if the chat has one. Otherwise a numbered list with short options.
- Each question has 2 to 4 mutually exclusive options. **Always add "Not sure, recommend one"** as the last option.
- Put your recommendation first and say why in 5 words ("cheapest, easy to test").
- Write each question so a tired person can answer it in 3 seconds. No essays.
- Say what you will assume for everything you did NOT ask, so the user can veto it later.
- Never ask what the code already answers. Read it again before asking.
- After sending the questions, **stop and wait**. Do not keep writing. Do not answer your own questions.

If the user says "just decide":
- Pick the recommended option for each question, write them into the Decisions list marked "(assumed)",
  and carry on. Never skip the step silently.

If the answers change the flow, update the diagram before going on.

## 6. Write the plan file

Copy `assets/PLAN-TEMPLATE.md` to `<feature-folder>/PLAN.md` and fill it in:
goal, flow, domain (glossary, entities, value objects, rules, boundaries), stage table (takes / gives / file / status), decisions, tests, next steps.
Keep it under 120 lines. Tables and short bullets, no paragraphs.

Tell the user to add one line to `AGENTS.md` (and `CLAUDE.md` if it does not import it):
`For anything in <folder>, read <folder>/PLAN.md first.`

## 7. Tests in two layers

Respect the repo's test rules (file names, runner, import style). If the repo says "no tests unless asked", ask once.

**Layer 1: one flow-level test.** Fake the external services (HTTP, Redis, DB). Write it as a story:
"You liked X and disliked Y. Page 1 contains A, never B. Page 2 repeats nothing."
The user must understand it in 10 seconds. Write this before the detailed ones.

**Layer 2: detailed tests per stage.** Pure functions first, because they need no setup.
One behaviour per test. Test names are plain sentences with a number, so the user can say "change 4".
Use glossary words in test names. Every rule from step 4 has a test; list the rule next to it in the plan.
Add empty stubs that `throw new Error('not implemented')` so everything compiles and fails for the right reason.

Run the tests. Report "N of N red" and nothing else about the run.

Always show test names as a short list in chat. Do not rely on file cards alone.

## 8. Stop and wait

Do not implement until the user says go. When they do:
- Implement stage by stage until its tests are green. Never weaken a test to make it pass.
- If a test is wrong, say so, ask, then change it.
- After each stage, update the **Status** column in `PLAN.md`.
- Run the whole suite and the linter before saying done.

## How to talk

- Short sentences, one idea each. Speak to "you".
- Lead with an example, then the rule.
- Diagram and lists beat paragraphs. No jargon unless the user used it first.
- Match the user's tone. If they want emojis and jokes, use them.
- If the user's English has mistakes and they asked for corrections, correct first, answer second.
- One recommendation, not a menu of five.

## Don't

- Don't show detailed tests before the flow is agreed.
- Don't skip the questions because the request looks clear. Clear-looking requests hide the most expensive wrong guesses.
- Don't invent decisions silently. Every default goes in the Decisions list.
- Don't touch unrelated code, or add dependencies or tables without asking.
- Don't force DDD words onto simple code. No new classes, folders or patterns only to look like DDD.
- Don't write a plan longer than the feature deserves.