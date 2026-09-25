# Causal Reactivation

**John Brajer — Possibility Reserve mechanism**

## Principle

A possibility should be reconsidered when a state change affects the conditions that caused it to become dormant.

Reactivation should therefore be **causal**, not merely periodic.

## Example

A branch was dormant because:

```
required_budget > available_budget
```

Later:

```
available_budget increases
```

That state change is relevant to the recorded failure condition, so the branch becomes eligible for re-evaluation.

A change in an unrelated variable should not automatically wake it.

## Minimal loop

```
failure memory
     ↓
causal conditions
     ↓
state change event
     ↓
dependency match?
  /        \
no        yes
|          |
sleep    re-evaluate
```

## Benefit

This directs attention toward possibilities whose feasibility has actually changed instead of repeatedly reconsidering everything.
