"""Regression checks against the executable Python printed in robotics lessons.

Run from any directory: python3 tests/curriculum/robotics-examples.py.
ROS-dependent examples are syntax checked, not represented as executed on hardware.
"""
import ast
import contextlib
import io
import math
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]
PHASE = ROOT / 'src/content/phases/13-robotics'
SCIENCE = PHASE / '13-9-robotics-science-fundamentals'


def python_blocks(path: Path) -> list[str]:
    return re.findall(r'```python\n(.*?)```', path.read_text(), re.S)


def load_examples(name: str) -> dict[str, object]:
    namespace = {}
    with contextlib.redirect_stdout(io.StringIO()):
        for block in python_blocks(SCIENCE / name):
            exec(compile(block, name, 'exec'), namespace)
    return namespace


class RoboticsExamples(unittest.TestCase):
    def test_all_python_fences_parse(self) -> None:
        for path in PHASE.rglob('*.mdx'):
            for index, block in enumerate(python_blocks(path)):
                with self.subTest(path=path.name, block=index):
                    ast.parse(block)

    def test_forward_inverse_round_trip_and_boundary(self) -> None:
        ns = load_examples('01-forward-and-inverse-kinematics.mdx')
        fk, ik = ns['forward_kinematics_2dof'], ns['inverse_kinematics_2dof']
        x, y, phi = fk(math.radians(45), math.radians(-30), .5, .4)
        self.assertAlmostEqual(x, .7399237211)
        self.assertAlmostEqual(y, .4570810086)
        self.assertAlmostEqual(phi, math.radians(15))
        for target in [(.6, .4), (.9, 0), (.1, 0)]:
            for angles in ik(*target, .5, .4):
                actual = fk(*angles, .5, .4)
                self.assertAlmostEqual(actual[0], target[0])
                self.assertAlmostEqual(actual[1], target[1])
        self.assertEqual(len(ik(.9, 0, .5, .4)), 1)
        self.assertEqual(ik(2, 0, .5, .4), [])
        for args in [(0, 0, .5, .5), (.1, .2, 0, .4), (float('nan'), 0, .5, .4)]:
            with self.assertRaises(ValueError):
                ik(*args)

    def test_point_mass_dynamics_and_gravity(self) -> None:
        ns = load_examples('02-robot-dynamics-and-torque.mdx')
        inertia = ns['inertia_matrix_2dof']
        extended = inertia(0, 0, 2, 1.5, .4, .35)
        folded = inertia(0, math.pi, 2, 1.5, .4, .35)
        self.assertAlmostEqual(extended[0][0], .5759375)
        self.assertAlmostEqual(folded[0][0], .1559375)
        self.assertEqual(extended[0][1], extended[1][0])
        self.assertGreater(extended[0][0]*extended[1][1]-extended[0][1]**2, 0)
        link = ns['Link'](mass_kg=3, length_m=.6)
        self.assertAlmostEqual(ns['gravity_torque_1dof'](0, link), 8.829)

    def test_pid_first_sample_reset_and_saturation_unwinding(self) -> None:
        ns = load_examples('03-pid-control-tuning-and-implementation.mdx')
        controller = ns['PIDController']
        derivative_only = controller(0, 0, 1, .1)
        self.assertEqual(derivative_only.compute(2, 2), 0)
        derivative_only.reset()
        self.assertEqual(derivative_only.compute(3, 3), 0)
        for dt in [0, -1, float('nan')]:
            with self.assertRaises(ValueError):
                controller(1, 1, 1, dt)
        integral = controller(0, 1, 0, .1, output_min=-1, output_max=1)
        integral._integral = 5
        integral.compute(0, 1)
        self.assertLess(integral._integral, 5)
        before = integral._integral
        integral.compute(1, 0)
        self.assertEqual(integral._integral, before)
        gains = ns['ziegler_nichols_pid'](12, .4)
        self.assertAlmostEqual(gains['kd'], .36)


if __name__ == '__main__':
    unittest.main()
