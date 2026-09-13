# STM32F407 sensor pipeline

Prerequisites: Phase10 drivers, interrupts/DMA and FreeRTOS; Python3.11+, PlatformIO6.2.0. Physical work requires STM32F4 Discovery with STM32F407VG and a3.3V USB-to-UART adapter. The firmware targets this board only. It samples PA1 at nominal1kHz using TIM2→ADC1→DMA, passes half-buffer copies through a FreeRTOS queue, reports16-sample averages through USART2 PA2, and refreshes an independent watchdog only after successful processing and transmission.

## Build and host fault checks

```sh
python3 -m venv .venv
.venv/bin/pip install platformio==6.2.0
.venv/bin/pio run
cc -std=c11 -Wall -Wextra -Werror test_health.c -o /tmp/dura-health
/tmp/dura-health
```

Platform, CubeF4 package and compiler are pinned in `platformio.ini`; FreeRTOS comes from that Cube package. PlatformIO supplies startup/linker/HAL sources. `freertos_build.py` selects the M4F port and heap allocator. The clock stays at reset16MHz HSI. The host test exercises the exact pure health policy used in firmware; it does not execute DMA, RTOS timing or an actual watchdog reset.

## Hardware acceptance (requires your board)

Connect ground and PA2 TX to the adapter's3.3V RX. Connect PA1 to a known in-range0–3.3V source; do not connect industrial signals or5V. Leave actuators disconnected and review the board schematic before wiring. With ST-Link connected, run `.venv/bin/pio run -t upload`, then read the adapter at115200baud. Expect increasing sequence numbers, averages0–4095 and zero drops. PD12 toggles after each successful block.

Measure actual sample period and processing/serial time. Stop TIM2 in a deliberate fault build; verify the lack of fresh blocks stops watchdog refresh and the board resets. Block the processing task until the queue fills; verify fault latching and reset. Test repeated power removal/startup and record recovery. Measure watchdog time on the board instead of assuming an exact nominal oscillator frequency.

## Evidence and extension

Retain compiler output, firmware digest, board revision, wiring, timing captures, normal UART output and fault/recovery results. A compile or host test is not evidence that flashing, electrical behavior or deadlines passed. Physical tests have not been performed in the authoring environment.

Extend with a digital sensor, bounded driver retries and a calibration record. Explain DMA buffer ownership and the IRQ priority permitted for `xQueueSendFromISR`. Add measured worst-case execution time and task/queue sizing before making real-time claims. This is a teaching project, not safety-certified or production-qualified firmware.

Primary references: [PlatformIO board](https://docs.platformio.org/en/stable/boards/ststm32/disco_f407vg.html), [STM32CubeF4](https://github.com/STMicroelectronics/STM32CubeF4), [FreeRTOS interrupt priorities](https://www.freertos.org/Documentation/02-Kernel/03-Supported-devices/04-Demos/ARM-Cortex/ARM-Cortex-M3).
