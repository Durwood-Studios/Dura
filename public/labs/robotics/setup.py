from setuptools import setup
from glob import glob
setup(name='dura_robotics_lab', version='1.0.0', packages=['dura_robotics_lab'],
      data_files=[('share/ament_index/resource_index/packages', ['resource/dura_robotics_lab']),
                  ('share/dura_robotics_lab', ['package.xml']),
                  ('share/dura_robotics_lab/launch', glob('launch/*.launch.py'))],
      entry_points={'console_scripts': ['transfer = dura_robotics_lab.client:main']})
