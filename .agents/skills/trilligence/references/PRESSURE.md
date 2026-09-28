# Pressure and Adaptation

## Core mechanism

~~~text
environment
    ↓
pressure
    ↓
response / adaptation
    ↓
changed state
    ↓
new environment and pressures
    ↓
further change
~~~

Compressed:

~~~text
force -> change -> force -> change
~~~

## Pressure

Pressure is any condition that changes the relative viability, cost, reward, stability, or accessibility of possible responses.

Examples include:
- resource scarcity,
- reward signals,
- social incentives,
- uncertainty,
- repeated feedback,
- physical constraints,
- institutional rules,
- training objectives,
- runtime context,
- failure,
- success,
- environmental change.

## Plasticity

A system can only adapt within the change mechanisms available to it.

Different systems have different forms and degrees of plasticity. Human neurodevelopment, biological evolution, gradient-based model training, in-context adaptation, external memory, and software updates are not the same mechanism.

The useful comparison is structural:

~~~text
starting structure + environment + pressure + available adaptation mechanism -> changed expression
~~~

## AI application

For machine intelligence, possible pressure channels include:
- pretraining data distribution,
- optimization objectives,
- reinforcement or preference signals,
- post-training examples,
- system instructions,
- runtime context,
- tool results,
- memory,
- user feedback,
- deployment incentives,
- evaluation suites.

Do not assume every pressure updates model weights. Runtime context can change expression without permanently changing the underlying model.

## Trilligence question

When behavior changes, ask:

1. What pressure was applied?
2. Through what adaptation mechanism could the system change?
3. Which state actually changed?
4. Was the change temporary, persistent, or inherited?
5. What new pressures become possible because of the changed state?
