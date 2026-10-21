"""Trilligence Harness — model-neutral, evidence-first agent execution."""
from .core import Capability, Harness, Intent, Receipt, Plan
__all__ = ["Capability", "Harness", "Intent", "Receipt", "Plan"]
__version__ = "0.1.0"
from .orchestrator import Agent, RuleBrain, RunReport, Brain
__all__ += ["Agent", "RuleBrain", "RunReport", "Brain"]
