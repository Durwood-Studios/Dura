# Robotics integration: planned joint transfer

Build and inspect a UR5e simulator integration. The three goals move shoulder-pan by +0.05, -0.05, then 0 radians relative to the initial pose. This is a joint-space transfer exercise, not a demonstrated pick-and-place: URsim does not establish gripper, object-contact, perception, or physical collision behavior.

## Local checks first

From this directory, run `python3 -m unittest -v test_contract.py`. These standard-library tests reject malformed trajectories, wrong joints, non-finite values, excessive segment-average speed, stale state, and retries after a fault. They do not validate ROS connectivity or continuous-time velocity/acceleration bounds.

**Validation status:** the four local test methods pass. ROS 2, MoveIt, Docker URsim, and the end-to-end controller run have not been executed by the authoring environment. Record those results in `EVIDENCE.md` before accepting the integration.

## Reproduce the ROS environment

Use an isolated Ubuntu 24.04 machine/VM with ROS 2 Jazzy and Docker installed according to their official installation documentation. Keep it disconnected from physical robot networks. Do not change the launch file's fixed simulator address to a physical robot. This package is not a safety controller, commissioning procedure, risk assessment, or physical safety approval.

```sh
sudo apt-get update
sudo apt-get install ros-jazzy-ur python3-colcon-common-extensions
source /opt/ros/jazzy/setup.bash
mkdir -p ~/dura_ws/src/dura_robotics_lab
# Copy this entire directory into ~/dura_ws/src/dura_robotics_lab.
cd ~/dura_ws
colcon build --packages-select dura_robotics_lab
source install/setup.bash
```

The distro packages are compatible-family inputs, not immutable version pins. Capture the installed package versions and source/image identifiers below; replay with those exact versions in a snapshot of the VM. A fresh apt install on another date is not a bit-for-bit reproduction.

```sh
dpkg-query -W 'ros-jazzy-ur*' 'ros-jazzy-moveit*' > package-versions.txt
ros2 launch ur_robot_driver ur_control.launch.py --show-args
ros2 launch ur_moveit_config ur_moveit.launch.py --show-args
ros2 run ur_client_library start_ursim.sh -h
```

Select and record an available explicit PolyScope 5 URsim version supported by the installed driver, then start it (replace the placeholder; do not use an unrecorded `latest`):

```sh
ros2 run ur_client_library start_ursim.sh -m ur5e -v YOUR_RECORDED_VERSION
```

The official script creates the simulator at `192.168.56.101`, installs External Control, and mounts persistent programs. Inspect `docker ps` and `docker inspect` to record the actual image ID/digest, ports, network, and container version. If that address is already occupied, stop and resolve the network conflict rather than changing the lab to another endpoint. Open the local URsim web interface per the script output, load the External Control program, then start the driver in another sourced terminal:

```sh
ros2 launch dura_robotics_lab lab.launch.py
ros2 control list_controllers
ros2 action list -t
```

Verify `joint_trajectory_controller` is active and `/move_action` plus `/joint_trajectory_controller/follow_joint_trajectory` exist. Press Play on the simulator's External Control program as documented by the driver. The driver must be connected before testing motion. If MoveIt has not connected on first startup, restart its launch after the driver is ready; do not treat a missing action server as a successful test.

## Plan, inspect, then execute in the simulator

```sh
ros2 run dura_robotics_lab transfer
```

The default only requests plans. Each goal is based on the same observed initial pose; without execution this is three independent plans, not a continuous executed sequence. Inspect the planned trajectories in MoveIt and the printed point counts. The client validates names, finite positions, increasing timestamps, a lab position bound, and segment-average speed. It does not perform independent collision checking; that depends on the configured MoveIt planning scene and actual model.

Only in the isolated URsim environment:

```sh
ros2 run dura_robotics_lab transfer --execute-simulator
```

This sends each validated plan to the trajectory controller. An exception terminates the run. A timeout attempts cancellation but does **not** prove motion stopped; record cancellation/controller state, resolve the cause, and start a new reviewed run. Never automatically retry an uncertain motion command. The simulator may report success without proving any real-world safety property.

## Required acceptance evidence

1. Capture the exact environment/package/image manifest and available launch arguments.
2. Save the local test output and the plan-only output for all three goals.
3. Record controller availability, initial/final joint states, action status, and all three simulator results.
4. Run with the controller stopped: record rejection/unavailability and confirm no automatic retry. Restart explicitly for a separate run.
5. Stop joint-state publication or disconnect the simulator: record the failure path and any cancellation uncertainty. Never perform fault-injection on physical equipment.
6. Explain why discrete trajectory checks, planning-scene collision checks, and robot safety functions are different assurance mechanisms. Identify the untested gripper/contact/perception scope.

## Primary references

- [UR driver installation](https://docs.universal-robots.com/Universal_Robots_ROS2_Documentation/doc/ur_robot_driver/ur_robot_driver/doc/installation/installation.html)
- [UR driver startup and External Control](https://docs.universal-robots.com/Universal_Robots_ROS2_Documentation/doc/ur_robot_driver/ur_robot_driver/doc/usage/startup.html)
- [URsim Docker setup](https://docs.universal-robots.com/Universal_Robots_ROS_Documentation/rolling/doc/ur_client_library/doc/setup/ursim_docker.html)
- [UR simulation version selection](https://docs.universal-robots.com/Universal_Robots_ROS_Documentation/rolling/doc/ur_robot_driver/ur_robot_driver/doc/usage/simulation.html)
- [UR motion and MoveIt integration](https://docs.universal-robots.com/Universal_Robots_ROS_Documentation/doc/ur_robot_driver/ur_robot_driver/doc/usage/move.html)
- [MoveGroup action definition](https://github.com/moveit/moveit_msgs/blob/ros2/action/MoveGroup.action)
- [PlanningOptions, including plan_only](https://github.com/moveit/moveit_msgs/blob/ros2/msg/PlanningOptions.msg)
- [Jazzy trajectory-controller action interface](https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html)

Documentation reviewed September 2026; record the installed versions and resolve any API difference before executing.
