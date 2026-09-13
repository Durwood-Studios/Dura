"""Select one RTOS port and allocator from the pinned Cube package."""
from pathlib import Path
Import("env", "projenv")
source = Path(env.PioPlatform().get_package_dir("framework-stm32cubef4")) / "Middlewares/Third_Party/FreeRTOS/Source"
includes = [str(source / "include"), str(source / "portable/GCC/ARM_CM4F")]
env.Append(CPPPATH=includes)
projenv.Append(CPPPATH=includes)
env.Append(LIBS=[env.BuildLibrary("$BUILD_DIR/FreeRTOS", str(source), src_filter=[
    "+<tasks.c>", "+<queue.c>", "+<list.c>", "+<timers.c>", "+<event_groups.c>",
    "+<portable/GCC/ARM_CM4F/port.c>", "+<portable/MemMang/heap_4.c>",
])])
