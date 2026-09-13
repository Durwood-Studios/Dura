"""Educational trajectory checks. These are not a certified safety function."""
import math

JOINTS = tuple(f"{name}_joint" for name in (
    "shoulder_pan", "shoulder_lift", "elbow", "wrist_1", "wrist_2", "wrist_3"))


def validate(names, points, initial):
    """Reject malformed plans and plans exceeding this lab's conservative limits."""
    if tuple(names) != JOINTS or len(initial) != 6 or not all(math.isfinite(v) for v in initial) or not points:
        raise ValueError("Expected six ordered UR joints and a nonempty trajectory")
    previous, previous_time = initial, 0.0
    for positions, seconds in points:
        if len(positions) != 6 or not all(math.isfinite(v) for v in positions):
            raise ValueError("Invalid joint positions")
        if not math.isfinite(seconds) or seconds < 0 or any(abs(v) > 2 * math.pi for v in positions):
            raise ValueError("Invalid time or lab joint limit exceeded")
        delta = seconds - previous_time
        if delta < 0 or (delta == 0 and (previous_time != 0 or positions != list(initial))):
            raise ValueError("Trajectory time must increase; only initial point may be at zero")
        if delta and any(abs(a-b)/delta > 0.25 for a, b in zip(positions, previous)):
            raise ValueError("Segment average speed exceeds lab limit")
        previous, previous_time = positions, seconds
    if previous_time <= 0:
        raise ValueError("Trajectory has no duration")


class RunGate:
    """A failed operation latches this process until an explicit new run."""
    def __init__(self):
        self.faulted = False

    def check(self, state_age, planner_ok):
        if self.faulted or not math.isfinite(state_age) or not 0 <= state_age <= 1 or not planner_ok:
            self.faulted = True
            raise ValueError("Stale state or failed planning; start a reviewed new run")
