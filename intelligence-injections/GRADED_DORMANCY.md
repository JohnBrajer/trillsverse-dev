# Graded Dormancy

**John Brajer — Possibility Reserve mechanism**

## Principle

`DORMANT != DEAD`

Possibilities do not need to be represented as a binary active/rejected state.

A system can preserve unavailable or currently unattractive branches at different dormancy levels.

## Example state family

```
ACTIVE
WATCH
DORMANT
DEEP_DORMANT
REJECTED_UNDER_CURRENT_MODEL
DEAD_BY_HARD_CONSTRAINT
```

The exact labels are implementation-dependent. The mechanism is the important part.

## Why

Binary rejection destroys information.

Graded dormancy lets a system reduce attention or compute without pretending that temporary infeasibility is permanent impossibility.

## Requirement

Dormancy should carry a reason and, where possible, reactivation conditions.
