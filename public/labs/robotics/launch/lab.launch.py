"""Simulator-only fixed address; never substitute a physical robot address."""
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory
import os


def generate_launch_description():
    def include(package, filename, arguments):
        return IncludeLaunchDescription(PythonLaunchDescriptionSource(os.path.join(
            get_package_share_directory(package), 'launch', filename)), launch_arguments=arguments.items())
    return LaunchDescription([
        include('ur_robot_driver', 'ur_control.launch.py', {
            'ur_type': 'ur5e', 'robot_ip': '192.168.56.101',
            'initial_joint_controller': 'joint_trajectory_controller', 'launch_rviz': 'false'}),
        include('ur_moveit_config', 'ur_moveit.launch.py', {'ur_type': 'ur5e', 'launch_rviz': 'true'}),
    ])
