import unittest
from dura_robotics_lab.contract import JOINTS, RunGate, validate

class ContractTests(unittest.TestCase):
    def test_good(self):
        validate(JOINTS, [([0.0]*6, 0), ([0.05]*6, 1)], [0.0]*6)
    def test_bad_plans(self):
        for points in ([([float('nan')]*6, 1)], [([0]*5, 1)],
                       [([0]*6, 2), ([0]*6, 1)], [([1]*6, 1)], [([0]*6, 0)]):
            with self.subTest(points=points), self.assertRaises(ValueError):
                validate(JOINTS, points, [0]*6)
    def test_wrong_joint_names(self):
        with self.assertRaises(ValueError):
            validate(list(reversed(JOINTS)), [([0]*6, 1)], [0]*6)
    def test_fault_is_latched(self):
        for age, success in ((2, True), (0, False), (float('nan'), True)):
            gate = RunGate()
            with self.assertRaises(ValueError): gate.check(age, success)
            with self.assertRaises(ValueError): gate.check(0, True)

if __name__ == '__main__': unittest.main()
