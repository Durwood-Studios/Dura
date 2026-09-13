"""Plan a small joint-space transfer, optionally execute in the isolated simulator."""
import argparse
import time
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from sensor_msgs.msg import JointState
from moveit_msgs.action import MoveGroup
from moveit_msgs.msg import Constraints, JointConstraint
from control_msgs.action import FollowJointTrajectory
from .contract import JOINTS, RunGate, validate


def wait(node, future, seconds=30):
    rclpy.spin_until_future_complete(node, future, timeout_sec=seconds)
    if not future.done():
        raise TimeoutError("No acknowledgement: robot state is unknown; do not retry motion")
    return future.result()


def action(node, client, request):
    if not client.wait_for_server(timeout_sec=10):
        raise RuntimeError("Action server unavailable")
    handle = wait(node, client.send_goal_async(request))
    if not handle.accepted:
        raise RuntimeError("Goal rejected")
    try:
        result = wait(node, handle.get_result_async())
    except TimeoutError:
        wait(node, handle.cancel_goal_async(), 5)
        raise
    if result.status != 4:
        raise RuntimeError(f"Action did not succeed: {result.status}")
    return result.result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--execute-simulator', action='store_true')
    args = parser.parse_args()
    rclpy.init()
    node = Node('dura_transfer_lab')
    state = {}
    def received(message):
        values = dict(zip(message.name, message.position))
        if all(name in values for name in JOINTS):
            state.update(positions=[values[name] for name in JOINTS], observed=time.monotonic())
    subscription = node.create_subscription(JointState, '/joint_states', received, 10)
    gate = RunGate()
    try:
        deadline = time.monotonic() + 10
        while not state and time.monotonic() < deadline:
            rclpy.spin_once(node, timeout_sec=0.1)
        if not state:
            raise RuntimeError('No joint state')
        initial = list(state['positions'])
        for offset in (0.05, -0.05, 0.0):
            gate.check(time.monotonic()-state['observed'], True)
            start = list(state['positions'])
            target = list(initial)
            target[0] += offset
            goal = MoveGroup.Goal()
            goal.request.group_name = 'ur_manipulator'
            goal.request.start_state.is_diff = True
            goal.request.allowed_planning_time = 5.0
            goal.request.num_planning_attempts = 1
            goal.request.max_velocity_scaling_factor = 0.05
            goal.request.max_acceleration_scaling_factor = 0.05
            constraints = Constraints()
            for name, position in zip(JOINTS, target):
                constraints.joint_constraints.append(JointConstraint(
                    joint_name=name, position=position, tolerance_above=0.001,
                    tolerance_below=0.001, weight=1.0))
            goal.request.goal_constraints = [constraints]
            goal.planning_options.plan_only = True
            planned = action(node, ActionClient(node, MoveGroup, '/move_action'), goal)
            gate.check(time.monotonic()-state['observed'], planned.error_code.val == 1)
            trajectory = planned.planned_trajectory.joint_trajectory
            points = [(list(p.positions), p.time_from_start.sec+p.time_from_start.nanosec/1e9)
                      for p in trajectory.points]
            validate(trajectory.joint_names, points, start)
            print(f'Validated plan: offset={offset}, points={len(points)}', flush=True)
            if args.execute_simulator:
                request = FollowJointTrajectory.Goal(trajectory=trajectory)
                result = action(node, ActionClient(node, FollowJointTrajectory,
                    '/joint_trajectory_controller/follow_joint_trajectory'), request)
                if result.error_code != 0:
                    raise RuntimeError(f'Controller error: {result.error_string}')
                print('Simulator controller reported success', flush=True)
    finally:
        node.destroy_subscription(subscription)
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
