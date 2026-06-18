import type { AssessmentQuestion } from "@/types/assessment";

/**
 * Phase 10 question bank — 64 questions across 8 modules (8 each).
 * Covers ARM Cortex-M toolchain, bare-metal GPIO, interrupts/DMA,
 * FreeRTOS, peripheral drivers, Rust embedded/RTIC, MISRA-C, and capstone.
 */

function q(
  id: string,
  moduleId: string,
  type: AssessmentQuestion["type"],
  question: string,
  options: string[],
  correct: number | number[],
  explanation: string,
  difficulty: AssessmentQuestion["difficulty"],
  tags: string[]
): AssessmentQuestion {
  return {
    id,
    phaseId: "10",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "understand" },
  };
}

export const PHASE_10_QUESTIONS: AssessmentQuestion[] = [
  // ── Module e-1: C Toolchain & ARM Architecture ────────────────────────────
  q(
    "e-1-q1",
    "e-1",
    "multiple-choice",
    "A linker script defines both a `.data` section and a `.bss` section. What is the key runtime difference between them?",
    [
      "`.data` holds read-only constants; `.bss` holds mutable globals.",
      "`.data` holds initialized globals whose initial values are copied from flash to RAM at startup; `.bss` holds zero-initialized globals that occupy no flash space.",
      "`.bss` is loaded first so it can back-initialize `.data`.",
      "They are identical — the distinction is a compiler optimization hint only.",
    ],
    1,
    "`.data` variables have explicit initial values stored in flash and copied to RAM by the startup code (usually via a loop in crt0/startup.s). `.bss` variables start at zero; the startup code only needs to zero the RAM range — no flash storage needed for the initial values.",
    "medium",
    ["linker", "arm", "c-toolchain", "memory-layout"]
  ),
  q(
    "e-1-q2",
    "e-1",
    "multiple-choice",
    "In an ARM Cortex-M bare-metal project, which tool converts the ELF output of the linker into a raw binary or Intel HEX file suitable for flashing?",
    ["arm-none-eabi-gcc", "arm-none-eabi-objcopy", "arm-none-eabi-nm", "arm-none-eabi-gdb"],
    1,
    "`objcopy` strips ELF metadata and emits flat binary or HEX. `nm` lists symbols; `gdb` debugs; `gcc` compiles.",
    "easy",
    ["arm", "toolchain", "elf", "objcopy"]
  ),
  q(
    "e-1-q3",
    "e-1",
    "multiple-choice",
    "What does the `-mcpu=cortex-m4` flag tell the ARM GCC compiler?",
    [
      "To generate Thumb-2 instructions tuned for the Cortex-M4 pipeline and enable FPU instructions if `-mfpu` is also set.",
      "To enable hardware floating-point ABI exclusively.",
      "To set the linker script path for a Cortex-M4 board.",
      "To disable all ARM (32-bit) instructions and use only 16-bit Thumb.",
    ],
    0,
    "`-mcpu` selects the target CPU architecture, enabling appropriate instruction scheduling and optionally floating-point extensions. The FPU ABI is further controlled by `-mfpu` and `-mfloat-abi`.",
    "medium",
    ["arm", "gcc", "cortex-m4", "toolchain"]
  ),
  q(
    "e-1-q4",
    "e-1",
    "true-false",
    "True or false: on an ARM Cortex-M device, the vector table is always located at address 0x00000000 and cannot be relocated.",
    ["True", "False"],
    1,
    "False. The VTOR (Vector Table Offset Register) allows the vector table to be relocated to any 512-byte-aligned address in flash or RAM, which is commonly done when using bootloaders.",
    "medium",
    ["arm", "vector-table", "vtor", "cortex-m"]
  ),
  q(
    "e-1-q5",
    "e-1",
    "multiple-choice",
    "What is the purpose of the `volatile` keyword when accessing a memory-mapped peripheral register in C?",
    [
      "It places the variable in flash instead of RAM.",
      "It tells the compiler the value can change at any time outside program flow, preventing it from caching the value in a register or eliminating seemingly redundant reads/writes.",
      "It makes the variable thread-safe by adding a hardware mutex.",
      "It forces the variable to be stored in the `.bss` section.",
    ],
    1,
    "Without `volatile`, the compiler may optimize away repeated reads (seeing no intervening write in the C source) or reorder accesses. Peripheral registers change due to hardware, so every access must actually reach the bus.",
    "medium",
    ["volatile", "c", "mmio", "compiler-optimization"]
  ),
  q(
    "e-1-q6",
    "e-1",
    "multiple-choice",
    "In a Makefile for a bare-metal ARM project, what is the role of the `-T linker_script.ld` flag passed to the linker?",
    [
      "It specifies the target CPU architecture for the linker.",
      "It provides the linker with the memory map: flash/RAM origin and size, and how to place each input section into output sections.",
      "It enables link-time optimization.",
      "It sets the entry point symbol to `main`.",
    ],
    1,
    "The linker script (`-T`) defines MEMORY regions (flash, RAM with base address and length) and SECTIONS directives that map input sections (.text, .data, .bss) to the physical memory regions of the specific microcontroller.",
    "hard",
    ["linker", "ld", "arm", "memory-map"]
  ),
  q(
    "e-1-q7",
    "e-1",
    "multiple-select",
    "Which of the following are part of the ARM Cortex-M4 programmer's model that differ from a generic 32-bit architecture? Select all that apply.",
    [
      "Thumb-2 instruction set (mixed 16/32-bit instructions)",
      "Hardware divide instruction (UDIV/SDIV)",
      "Single-precision FPU (optional, present on M4F)",
      "Hardware MMU for virtual memory",
    ],
    [0, 1, 2],
    "Cortex-M4 uses Thumb-2, has hardware divide, and optionally an FPU (the M4F variant). Cortex-M cores do NOT have an MMU — they use an MPU (Memory Protection Unit) instead. Virtual memory requires an MMU, which is found on Cortex-A class cores.",
    "hard",
    ["cortex-m4", "thumb2", "fpu", "mpu"]
  ),
  q(
    "e-1-q8",
    "e-1",
    "multiple-choice",
    "During startup on an ARM Cortex-M, before `main()` is called, which two memory operations does the C runtime startup code (`crt0` / `startup.s`) perform?",
    [
      "Initialize the heap and configure the MPU.",
      "Copy the `.data` section from flash to RAM, then zero the `.bss` section.",
      "Program the flash controller and enable the instruction cache.",
      "Configure the PLL and set the system clock frequency.",
    ],
    1,
    "The startup assembly copies initialized data (`.data`) from its LMA in flash to its VMA in RAM, then clears the `.bss` region to zero. Clock and peripheral configuration is application-level and happens after `main()` entry or in explicit init functions.",
    "hard",
    ["startup", "crt0", "arm", "data", "bss"]
  ),

  // ── Module e-2: Bare-Metal GPIO & Register Access ─────────────────────────
  q(
    "e-2-q1",
    "e-2",
    "multiple-choice",
    "On an STM32 microcontroller, why must the RCC (Reset and Clock Control) peripheral clock be enabled for a GPIO port before that port's registers are accessed?",
    [
      "GPIO registers are in a separate address space that requires an unlock key.",
      "Without the RCC clock enable, the peripheral's register file is not clocked and reads return undefined values while writes are silently discarded.",
      "The RCC holds the GPIO pin direction configuration until released.",
      "It is only required when using interrupts on the GPIO port, not for basic output.",
    ],
    1,
    "STM32 peripherals are gated off the bus clock by default to save power. Until the RCC clock enable bit is set, the peripheral logic is not powered and register access is undefined. This is a common beginner mistake that produces no-ops at runtime.",
    "easy",
    ["stm32", "rcc", "gpio", "clock"]
  ),
  q(
    "e-2-q2",
    "e-2",
    "multiple-choice",
    "To atomically set bit 5 of `GPIOA->ODR` without affecting other bits, which C expression is correct?",
    [
      "`GPIOA->ODR = (1U << 5);`",
      "`GPIOA->ODR |= (1U << 5);`",
      "`GPIOA->ODR &= ~(1U << 5);`",
      "`GPIOA->ODR ^= (1U << 5);`",
    ],
    1,
    "OR-assign sets only the target bit without disturbing others. The plain assignment overwrites all bits. AND-NOT clears the bit. XOR toggles it.",
    "easy",
    ["gpio", "bit-manipulation", "c"]
  ),
  q(
    "e-2-q3",
    "e-2",
    "true-false",
    "True or false: on most ARM Cortex-M microcontrollers, MMIO registers are declared as `volatile uint32_t` pointers to prevent the compiler from optimizing away repeated accesses.",
    ["True", "False"],
    0,
    "MMIO registers can change state independently of CPU writes (hardware events, DMA, interrupts). `volatile` prevents the compiler from caching reads or eliminating writes it deems redundant.",
    "easy",
    ["volatile", "mmio", "gpio", "cortex-m"]
  ),
  q(
    "e-2-q4",
    "e-2",
    "multiple-choice",
    "An STM32 GPIO pin is configured as output push-pull. What electrical behavior does this provide that open-drain does NOT?",
    [
      "The pin can sink current from an external pull-up resistor.",
      "The driver actively drives both logic high (VDD) and logic low (GND) without requiring an external resistor.",
      "The pin is protected against overvoltage by a built-in clamp.",
      "Open-drain and push-pull are identical in all operating conditions.",
    ],
    1,
    "Push-pull has both a pull-up transistor (drives VDD for logic 1) and a pull-down transistor (drives GND for logic 0). Open-drain only drives low — a pull-up resistor is needed to achieve logic 1, which is why I2C uses open-drain for wired-AND signaling.",
    "medium",
    ["gpio", "push-pull", "open-drain", "electrical"]
  ),
  q(
    "e-2-q5",
    "e-2",
    "multiple-choice",
    "On STM32 Cortex-M devices, the BSRR (Bit Set/Reset Register) is preferred over direct ODR manipulation for GPIO output changes. Why?",
    [
      "BSRR writes are faster because they bypass the APB bus.",
      "BSRR provides atomic bit-level set and reset in a single 32-bit write, eliminating the read-modify-write race condition present in ODR |= operations.",
      "BSRR automatically configures the pin direction as output.",
      "BSRR operations do not require the RCC clock to be enabled.",
    ],
    1,
    "A read-modify-write on ODR is a three-instruction sequence that can be interrupted. If an ISR modifies a different bit on the same port between the read and write, the ISR's change is lost. BSRR is a write-only register that the hardware applies atomically.",
    "medium",
    ["gpio", "bsrr", "atomic", "race-condition", "stm32"]
  ),
  q(
    "e-2-q6",
    "e-2",
    "multiple-choice",
    "What does configuring a GPIO pin with an internal pull-up resistor accomplish?",
    [
      "It increases the maximum sink current of the pin.",
      "It provides a defined idle state (logic high) on an input pin when no external signal is driving it, preventing the pin from floating.",
      "It converts the pin to open-drain output mode.",
      "It protects the pin from ESD by clamping to VDD.",
    ],
    1,
    "Floating inputs pick up noise and cause undefined readings. An internal pull-up (typically 20–50 kΩ) biases the pin to VDD when nothing drives it. A button connected to GND then produces a clear 0-to-1 transition when pressed.",
    "medium",
    ["gpio", "pull-up", "input", "floating"]
  ),
  q(
    "e-2-q7",
    "e-2",
    "multiple-choice",
    "In a bare-metal C program, you want a 1-second software delay on a 72 MHz CPU. What is the main problem with a busy-wait loop like `for(volatile uint32_t i = 0; i < N; i++);`?",
    [
      "The compiler will always optimize it away even with `volatile`.",
      "The loop count N is difficult to calibrate precisely, the delay changes with optimization levels and peripheral clock configuration, and the CPU cannot do other work during the delay.",
      "It only works when the FPU is disabled.",
      "Bare-metal C does not support 32-bit loop counters.",
    ],
    1,
    "Busy-wait consumes all CPU cycles, blocking everything else. The calibration of N is architecture- and clock-specific, breaks when the clock is changed, and is imprecise due to pipeline effects. Hardware timers are the correct solution.",
    "hard",
    ["delay", "busy-wait", "timer", "bare-metal"]
  ),
  q(
    "e-2-q8",
    "e-2",
    "multiple-choice",
    "A microcontroller's datasheet shows a GPIO register at base address 0x48000000. How do you declare a pointer to access it safely in C?",
    [
      "`uint32_t *reg = 0x48000000;`",
      "`volatile uint32_t *reg = (volatile uint32_t *)0x48000000U;`",
      "`const uint32_t *reg = (const uint32_t *)0x48000000;`",
      "`register uint32_t *reg = 0x48000000;`",
    ],
    1,
    "The cast converts the integer literal to a pointer. `volatile` is mandatory for MMIO to prevent the compiler from optimizing accesses. The `U` suffix avoids signed/unsigned mismatch on the literal.",
    "hard",
    ["mmio", "pointer", "volatile", "c", "gpio"]
  ),

  // ── Module e-3: Interrupts & DMA ──────────────────────────────────────────
  q(
    "e-3-q1",
    "e-3",
    "multiple-choice",
    "Which ARM Cortex-M register sets a threshold that prevents lower-priority interrupts from preempting the current execution context without disabling all interrupts globally?",
    ["PRIMASK", "FAULTMASK", "BASEPRI", "CONTROL"],
    2,
    "BASEPRI masks all exceptions whose priority number is equal to or greater than the value written to it (numerically higher = lower priority in ARM's scheme). PRIMASK disables all maskable exceptions. FAULTMASK disables faults. CONTROL selects the stack pointer and privilege level.",
    "hard",
    ["nvic", "basepri", "interrupt-priority", "cortex-m"]
  ),
  q(
    "e-3-q2",
    "e-3",
    "multiple-choice",
    "On an ARM Cortex-M, what is the required declaration for an interrupt service routine (ISR) function in C?",
    [
      "`int ISR_Handler(int priority)`",
      "`void EXTI0_IRQHandler(void)` — matching the weak symbol name in the vector table",
      "`__interrupt void handler(void)`",
      "`static void isr(void) __attribute__((naked))`",
    ],
    1,
    "The linker links ISRs by matching the function name to the weak symbol in the vector table defined in the startup file. The function must be `void` return with no parameters. Architecture-specific attributes like `__attribute__((interrupt))` are NOT needed on Cortex-M because the hardware saves/restores context automatically.",
    "medium",
    ["isr", "vector-table", "cortex-m", "interrupt"]
  ),
  q(
    "e-3-q3",
    "e-3",
    "true-false",
    "True or false: a variable shared between an ISR and main-loop code must be declared `volatile` to prevent the compiler from keeping a stale cached copy in a register.",
    ["True", "False"],
    0,
    "`volatile` forces the compiler to read/write the variable from memory on every access. Without it, the compiler may keep the value in a register and never see the update the ISR performed.",
    "medium",
    ["isr", "volatile", "shared-state", "interrupt"]
  ),
  q(
    "e-3-q4",
    "e-3",
    "multiple-choice",
    "In the ARM Cortex-M NVIC, what does a numerically smaller priority value represent?",
    [
      "Lower urgency — the interrupt runs last when multiple are pending.",
      "Higher urgency — the interrupt can preempt others with larger priority numbers.",
      "The interrupt is disabled.",
      "The interrupt has a fixed, non-configurable priority.",
    ],
    1,
    "ARM NVIC uses an inverted scale: priority 0 is the highest. An ISR with priority 1 can preempt an ISR running at priority 2, but not vice versa. The number of implemented priority bits varies by vendor (typically 3–8 bits).",
    "medium",
    ["nvic", "priority", "preemption", "cortex-m"]
  ),
  q(
    "e-3-q5",
    "e-3",
    "multiple-choice",
    "What is the primary purpose of using DMA (Direct Memory Access) for a UART receive operation instead of polling or interrupt-per-byte?",
    [
      "DMA guarantees data is received faster than UART hardware allows.",
      "DMA transfers data between peripheral and memory autonomously, freeing the CPU to execute other code while large blocks of data are received.",
      "DMA eliminates the need for a receive buffer.",
      "DMA encrypts the transferred data in hardware.",
    ],
    1,
    "With DMA, the CPU initiates the transfer and is notified only on completion (or half-transfer). The DMA controller handles each byte autonomously, avoiding the per-byte interrupt overhead that consumes CPU bandwidth at high baud rates.",
    "medium",
    ["dma", "uart", "cpu-offload"]
  ),
  q(
    "e-3-q6",
    "e-3",
    "multiple-choice",
    "When using DMA with a data buffer in C, why must the buffer NOT be declared as a local variable on the stack inside a function that returns before the DMA transfer completes?",
    [
      "DMA can only access buffers in flash memory.",
      "When the function returns, the stack frame is invalidated; the DMA controller will read/write a memory region that may be reused for other stack frames, causing corruption.",
      "Stack variables are always `const` and cannot be written by DMA.",
      "DMA requires 32-byte aligned buffers which the stack cannot guarantee.",
    ],
    1,
    "The DMA controller holds a pointer to the buffer address. If the function returns and the stack frame is reclaimed, that memory is now owned by whatever is next on the stack. The DMA write will silently corrupt it. Buffers for DMA must be static or globally allocated.",
    "hard",
    ["dma", "stack", "lifetime", "c", "memory"]
  ),
  q(
    "e-3-q7",
    "e-3",
    "multiple-choice",
    "What is the ARM Cortex-M PendSV exception typically used for in an RTOS?",
    [
      "Handling external hardware interrupts with the highest priority.",
      "Performing context switches at the lowest interrupt priority, ensuring all higher-priority ISRs complete before the scheduler runs.",
      "Triggering a software reset of the microcontroller.",
      "Providing a hardware watchdog timer interrupt.",
    ],
    1,
    "PendSV is a 'pendable service call' exception that can be pended by software and will execute when no other exception is active. Setting it to the lowest priority ensures hardware ISRs are not delayed by the context switch, making it the standard mechanism for RTOS context switching on Cortex-M.",
    "hard",
    ["pendsv", "rtos", "context-switch", "cortex-m"]
  ),
  q(
    "e-3-q8",
    "e-3",
    "multiple-select",
    "Which of the following actions must typically be performed in an ISR to clear the interrupt and prevent immediate re-entry? Select all that apply.",
    [
      "Clear the pending interrupt flag in the peripheral's status register.",
      "Call NVIC_DisableIRQ() to prevent all future interrupts.",
      "Acknowledge the interrupt in the NVIC (on Cortex-M this happens automatically by hardware).",
      "Clear the pending bit in NVIC_ICPR if manually set via software.",
    ],
    [0, 2],
    "Cortex-M hardware automatically clears the NVIC pending bit when the ISR is entered. However, the peripheral's own status/flag register must be cleared by software or the peripheral will re-assert the interrupt immediately after the ISR returns. Disabling the IRQ globally is usually wrong — only clear the specific flag.",
    "hard",
    ["isr", "interrupt", "nvic", "status-register"]
  ),

  // ── Module e-4: RTOS & FreeRTOS ───────────────────────────────────────────
  q(
    "e-4-q1",
    "e-4",
    "multiple-choice",
    "In FreeRTOS, what is the correct API call to create a task?",
    [
      "`xTaskCreate(taskFunction, name, stackSize, params, priority, &handle)`",
      "`vTaskCreate(taskFunction, stackSize, priority)`",
      "`osThreadNew(taskFunction, params, &attr)`",
      "`pthread_create(&tid, NULL, taskFunction, params)`",
    ],
    0,
    "`xTaskCreate` is the standard FreeRTOS API. It returns `pdPASS` on success or `errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY`. `osThreadNew` is the CMSIS-RTOS2 wrapper. `pthread_create` is POSIX.",
    "easy",
    ["freertos", "task", "rtos"]
  ),
  q(
    "e-4-q2",
    "e-4",
    "multiple-choice",
    "What is priority inversion, and why is it a critical problem in RTOS designs?",
    [
      "When a low-priority task holds a mutex needed by a high-priority task, and a medium-priority task preempts the low-priority task, the high-priority task is effectively blocked by the medium-priority task indefinitely.",
      "When two tasks have the same priority and neither can run.",
      "When a task's priority is raised above the scheduler's maximum allowed value.",
      "When the RTOS assigns a lower priority to a task than the programmer requested.",
    ],
    0,
    "Priority inversion violates the RTOS contract that high-priority tasks run promptly. The classic solution is Priority Inheritance Protocol: when a low-priority task holds a resource needed by a high-priority task, the low-priority task temporarily inherits the higher priority until it releases the resource.",
    "hard",
    ["priority-inversion", "mutex", "rtos", "freertos"]
  ),
  q(
    "e-4-q3",
    "e-4",
    "multiple-choice",
    "In FreeRTOS, what is the difference between a binary semaphore and a mutex?",
    [
      "A mutex can be taken and given by different tasks; a binary semaphore must be given only by the task that took it.",
      "A mutex includes priority inheritance; a binary semaphore does not. A mutex must be given by the same task that took it; a binary semaphore can be given from an ISR.",
      "They are functionally identical — the names are interchangeable in all contexts.",
      "A binary semaphore has higher maximum count than a mutex.",
    ],
    1,
    "FreeRTOS mutexes implement priority inheritance and enforce task ownership (the task that takes must give). Binary semaphores are used for signaling (e.g., from an ISR to a task) where the giver and taker are different execution contexts. Mutexes must NOT be given from ISRs.",
    "hard",
    ["freertos", "mutex", "semaphore", "priority-inheritance"]
  ),
  q(
    "e-4-q4",
    "e-4",
    "multiple-choice",
    "A FreeRTOS task calls `vTaskDelay(pdMS_TO_TICKS(100))`. What happens to the task during those 100 milliseconds?",
    [
      "The task busy-waits in a tight loop counting ticks.",
      "The task enters the Blocked state and is removed from the ready list; the scheduler runs other tasks until the delay expires.",
      "The task is deleted and must be recreated after 100ms.",
      "The task suspends all other tasks for 100ms then continues.",
    ],
    1,
    "`vTaskDelay` moves the task to the Blocked state for the specified number of ticks, freeing the CPU for other ready tasks. When the delay expires, the task moves to Ready and will be scheduled at its next opportunity. This is fundamentally different from a busy-wait.",
    "easy",
    ["freertos", "vtaskdelay", "blocked-state", "scheduling"]
  ),
  q(
    "e-4-q5",
    "e-4",
    "true-false",
    "True or false: in FreeRTOS, queues are safe to use between tasks and from ISRs without additional locking, because the queue implementation is internally thread-safe.",
    ["True", "False"],
    0,
    "FreeRTOS queues use internal critical sections (or interrupt-safe variants like `xQueueSendFromISR`) to ensure thread safety. However, ISR code must use the `FromISR` variants to avoid using blocking calls in interrupt context.",
    "medium",
    ["freertos", "queue", "thread-safety", "isr"]
  ),
  q(
    "e-4-q6",
    "e-4",
    "multiple-choice",
    "What does the FreeRTOS idle task do, and why must your application never starve it?",
    [
      "It configures hardware peripherals during low-load periods.",
      "It performs heap garbage collection and frees memory from deleted tasks; starving it causes memory leaks from tasks that were deleted but whose TCB and stack were never freed.",
      "It runs the TCP/IP stack at lowest priority.",
      "It has no defined purpose and can be safely blocked by application tasks.",
    ],
    1,
    "The idle task runs `vTaskDelete(NULL)` cleanup and calls `portSUPPRESS_TICKS_AND_SLEEP()` for tickless idle if configured. In many ports, deleted task memory is only freed inside the idle task. If application tasks never yield, memory from deleted tasks accumulates until the heap exhausts.",
    "hard",
    ["freertos", "idle-task", "memory", "heap"]
  ),
  q(
    "e-4-q7",
    "e-4",
    "multiple-choice",
    "Which FreeRTOS function should be used to yield the CPU from within a task without blocking, allowing other tasks of equal or higher priority to run?",
    ["`vTaskSuspend(NULL)`", "`taskYIELD()`", "`vTaskDelay(0)`", "`vTaskPrioritySet(NULL, 0)`"],
    1,
    "`taskYIELD()` triggers a context switch immediately. `vTaskDelay(0)` also yields (delay of zero) but has slightly different semantics in some ports. `vTaskSuspend(NULL)` suspends the task indefinitely until resumed by another task.",
    "medium",
    ["freertos", "yield", "scheduling", "context-switch"]
  ),
  q(
    "e-4-q8",
    "e-4",
    "multiple-choice",
    "In FreeRTOS configuration (`FreeRTOSConfig.h`), what does `configTICK_RATE_HZ` control?",
    [
      "The CPU clock frequency fed to the RTOS.",
      "How many times per second the SysTick interrupt fires to drive the RTOS scheduler tick, which determines the resolution of `vTaskDelay` and timeout calls.",
      "The maximum number of tasks that can be created.",
      "The baud rate of the RTOS debug output port.",
    ],
    1,
    "`configTICK_RATE_HZ` sets the SysTick rate. At 1000 Hz, one tick = 1 ms — common for embedded systems. Higher values give finer timing resolution but increase scheduling overhead. `pdMS_TO_TICKS()` uses this constant to convert milliseconds to ticks portably.",
    "medium",
    ["freertos", "systick", "tick-rate", "freertosconfig"]
  ),

  // ── Module e-5: UART / SPI / I2C / ADC Drivers ───────────────────────────
  q(
    "e-5-q1",
    "e-5",
    "multiple-choice",
    "UART communication is asynchronous. What mechanism do both transmitter and receiver use to stay synchronized without a shared clock signal?",
    [
      "A preamble byte that the receiver detects with a phase-locked loop.",
      "A pre-agreed baud rate and framing (start bit, data bits, optional parity, stop bit(s)) that both ends are configured to match.",
      "A CRC polynomial exchanged during a handshake phase.",
      "The RTS/CTS flow control lines carry the clock implicitly.",
    ],
    1,
    "UART has no clock line. Both ends must be configured with identical baud rate, data bits (typically 8), parity, and stop bits. The start bit (logic low) triggers receiver sampling at the agreed rate. Any mismatch causes framing errors.",
    "easy",
    ["uart", "baud-rate", "framing", "serial"]
  ),
  q(
    "e-5-q2",
    "e-5",
    "multiple-choice",
    "SPI uses four signals. Which signal determines which peripheral on the bus is addressed in a multi-device SPI configuration?",
    [
      "SCLK (Serial Clock)",
      "MOSI (Master Out Slave In)",
      "MISO (Master In Slave Out)",
      "CS/NSS (Chip Select / Slave Select) — one per device",
    ],
    3,
    "SPI does not have an address phase. Device selection is purely physical: the master drives the Chip Select (CS) line of the desired peripheral low before clocking data. Each device needs its own dedicated CS line.",
    "easy",
    ["spi", "chip-select", "bus-protocol"]
  ),
  q(
    "e-5-q3",
    "e-5",
    "multiple-choice",
    "I2C supports multiple masters and multiple slaves on two wires. What electrical characteristic of the bus enables this?",
    [
      "I2C uses differential signaling like RS-485.",
      "SDA and SCL are open-drain lines with pull-up resistors, implementing wired-AND logic where any device can pull a line low.",
      "I2C uses a token-passing arbitration scheme over a dedicated arbitration wire.",
      "The master drives SDA and SCL as push-pull outputs; slaves have high-impedance inputs only.",
    ],
    1,
    "Open-drain means devices can only pull low; pull-up resistors pull the line high when nobody drives it low. This allows multiple masters to perform clock stretching (pulling SCL low to stall) and bus arbitration (both see the SDA level and the loser detects collision).",
    "medium",
    ["i2c", "open-drain", "pull-up", "wired-and"]
  ),
  q(
    "e-5-q4",
    "e-5",
    "multiple-choice",
    "An I2C slave device has a 7-bit address of 0x68. When the master sends the address byte to start a read transaction, what byte is transmitted on the bus?",
    [
      "0x68",
      "0xD0 (0x68 << 1, R/W bit = 0 for write)",
      "0xD1 (0x68 << 1 | 1, R/W bit = 1 for read)",
      "0x34 (0x68 >> 1)",
    ],
    2,
    "The I2C address byte is 8 bits: the 7-bit address left-shifted by 1, with the LSB being the R/W bit (0=write, 1=read). For a read from 0x68: (0x68 << 1) | 1 = 0xD0 | 0x01 = 0xD1.",
    "medium",
    ["i2c", "address", "r/w-bit", "protocol"]
  ),
  q(
    "e-5-q5",
    "e-5",
    "multiple-choice",
    "A 12-bit ADC running at 3.3V reference reads the value 2048. What is the measured voltage?",
    ["1.65 V", "1.6 V", "2.048 V", "0.8 V"],
    0,
    "A 12-bit ADC has 4096 steps (0–4095). Full-scale (4095) maps to Vref (3.3V). At 2048: V = 2048/4096 × 3.3 = 0.5 × 3.3 = 1.65V. Note: 2048 is exactly mid-scale for a 12-bit ADC.",
    "medium",
    ["adc", "voltage", "resolution", "calculation"]
  ),
  q(
    "e-5-q6",
    "e-5",
    "multiple-choice",
    "Why is it important to add a software debounce delay or filter when reading a mechanical button connected to a GPIO input?",
    [
      "Mechanical switches draw too much current transiently and need a delay to protect the GPIO.",
      "Mechanical contacts bounce — the signal transitions rapidly between high and low for milliseconds before settling. Without debounce, software registers many false presses.",
      "GPIO inputs only sample at 1 kHz; the delay compensates for the sample rate.",
      "Debounce is only needed when the button is connected through SPI.",
    ],
    1,
    "Mechanical switch contacts are metallic springs that physically bounce on make/break, producing multiple signal transitions in the first ~5–20ms. A software debounce reads the pin state, waits (e.g., 20ms), and reads again — if consistent, the press is registered.",
    "easy",
    ["gpio", "debounce", "button", "digital-input"]
  ),
  q(
    "e-5-q7",
    "e-5",
    "multiple-choice",
    "In SPI Mode 0, what are the CPOL and CPHA settings and what do they mean?",
    [
      "CPOL=1, CPHA=1 — clock idles high, data sampled on falling edge.",
      "CPOL=0, CPHA=0 — clock idles low, data sampled on the leading (rising) edge.",
      "CPOL=0, CPHA=1 — clock idles low, data sampled on the trailing (falling) edge.",
      "CPOL=1, CPHA=0 — clock idles high, data sampled on the leading (falling) edge.",
    ],
    1,
    "SPI Mode 0 = CPOL=0 (idle low), CPHA=0 (data captured on first/leading edge = rising edge). The four modes arise from CPOL × CPHA combinations. Mode 0 and Mode 3 are most common in practice.",
    "hard",
    ["spi", "cpol", "cpha", "spi-modes"]
  ),
  q(
    "e-5-q8",
    "e-5",
    "multiple-choice",
    "What is the purpose of the UART RTS/CTS hardware flow control signals?",
    [
      "They carry the clock signal for synchronous UART modes.",
      "RTS (Request To Send) and CTS (Clear To Send) allow each side to signal when its receive buffer can accept data, preventing overrun when the receiver is slower than the transmitter.",
      "They implement RS-485 half-duplex bus direction switching.",
      "They are used only for error detection and have no flow control function.",
    ],
    1,
    "Hardware flow control prevents buffer overruns: the receiver drives RTS low when it is ready; the transmitter waits for CTS (connected to remote RTS) to be asserted before sending. This is essential at high baud rates where software interrupt latency cannot keep up.",
    "hard",
    ["uart", "rts", "cts", "flow-control"]
  ),

  // ── Module e-6: Rust Embedded & RTIC ─────────────────────────────────────
  q(
    "e-6-q1",
    "e-6",
    "multiple-choice",
    "How does Rust's ownership system benefit embedded systems compared to C, particularly regarding shared mutable peripheral access?",
    [
      "Rust's garbage collector automatically frees peripheral resources when they go out of scope.",
      "Ownership ensures at compile time that no two code paths can hold a mutable reference to the same peripheral simultaneously, eliminating a whole class of aliasing bugs without runtime overhead.",
      "Rust uses reference counting (Rc) for all peripheral handles to track usage.",
      "Rust's ownership system only applies to heap-allocated objects, not MMIO registers.",
    ],
    1,
    "In C, two ISRs or tasks can both write to a peripheral register with no compile-time check — the bug only appears at runtime. Rust's borrow checker enforces exclusive mutable access at compile time. In embedded-hal, singleton patterns give each peripheral a unique owner.",
    "medium",
    ["rust", "ownership", "embedded", "safety"]
  ),
  q(
    "e-6-q2",
    "e-6",
    "multiple-choice",
    "In Rust embedded projects, what does `#![no_std]` do, and why is it necessary for bare-metal targets?",
    [
      "It disables the Rust type system for performance-critical sections.",
      "It removes the dependency on Rust's standard library (`std`), which requires an OS for heap allocation, file I/O, and threading — none of which exist on bare metal. Only `core` (no-alloc primitives) is available.",
      "It enables LLVM's unsafe optimizations for embedded targets.",
      "It switches from dynamic to static linking of all crates.",
    ],
    1,
    "`std` depends on OS syscalls for allocation, I/O, and threads. Bare-metal has none of these. `#![no_std]` opts out of `std`, leaving only `core` (language primitives, no OS dependencies) and optionally `alloc` (with a custom allocator).",
    "easy",
    ["rust", "no-std", "embedded", "core"]
  ),
  q(
    "e-6-q3",
    "e-6",
    "multiple-choice",
    "The `embedded-hal` crate defines traits like `OutputPin` and `SpiDevice`. What problem does this abstraction solve?",
    [
      "It provides a faster hardware abstraction than writing directly to MMIO registers.",
      "It allows driver crates (sensor libraries, display drivers) to be written generically against traits rather than for specific MCU families, enabling reuse across any HAL implementation.",
      "It adds runtime type checking for peripheral register accesses.",
      "It implements async I/O for embedded peripherals using `tokio`.",
    ],
    1,
    "`embedded-hal` traits decouple drivers from hardware. A BME280 driver crate that depends on `embedded-hal::i2c::I2c` works on STM32, nRF52, RP2040, or any other MCU whose HAL crate implements that trait.",
    "medium",
    ["rust", "embedded-hal", "traits", "abstraction"]
  ),
  q(
    "e-6-q4",
    "e-6",
    "multiple-choice",
    "What does RTIC (Real-Time Interrupt-driven Concurrency) provide that FreeRTOS does not?",
    [
      "A preemptive scheduler with time-slicing between tasks of equal priority.",
      "Data race freedom guaranteed at compile time via Rust's type system, with zero-cost task and resource scheduling based on interrupt priorities — no dynamic scheduler or OS kernel needed.",
      "A POSIX-compatible thread API for easy porting of Linux drivers.",
      "A graphical debugger for visualizing task state transitions.",
    ],
    1,
    "RTIC uses Rust's ownership and type system to prove at compile time that shared resources are only accessed with proper critical sections. Tasks are hardware interrupt handlers — there is no kernel, no heap required for scheduling, and the priority ceiling protocol eliminates priority inversion by construction.",
    "hard",
    ["rtic", "rust", "compile-time-safety", "interrupt-driven"]
  ),
  q(
    "e-6-q5",
    "e-6",
    "true-false",
    "True or false: Rust's `unsafe` keyword in embedded code always indicates a bug and should be eliminated.",
    ["True", "False"],
    1,
    "False. `unsafe` is necessary to interface with MMIO registers, define interrupt vectors, and call C FFI functions. The Rust embedded ecosystem uses `unsafe` in carefully audited HAL layers so that safe application code can build on top of it. The goal is to minimize and isolate `unsafe`, not eliminate it entirely.",
    "medium",
    ["rust", "unsafe", "embedded", "ffi"]
  ),
  q(
    "e-6-q6",
    "e-6",
    "multiple-choice",
    "In a Rust `#![no_std]` embedded program, what is `#[entry]` and why is it needed?",
    [
      "It marks a function as an interrupt handler in the vector table.",
      "It specifies the program entry point (`main` equivalent) and is provided by the `cortex-m-rt` crate, which also sets up the stack pointer and calls startup code before entering it.",
      "It enables the Rust runtime to perform heap initialization.",
      "It is a compiler hint to inline the function at every call site.",
    ],
    1,
    "Without an OS, there is no `main()` convention. `cortex-m-rt` provides the `#[entry]` attribute macro that places your function as the reset handler in the vector table and ensures startup (`.data` copy, `.bss` zero-init) runs first.",
    "medium",
    ["rust", "cortex-m-rt", "entry", "no-std"]
  ),
  q(
    "e-6-q7",
    "e-6",
    "multiple-choice",
    "When writing an async embedded application with `embassy-rs`, what replaces the blocking delay of `vTaskDelay(100)` from FreeRTOS?",
    [
      "`std::thread::sleep(Duration::from_millis(100))`",
      "`Timer::after_millis(100).await`",
      "`cortex_m::asm::delay(100)`",
      "`embassy_time::block_for(Duration::from_millis(100))`",
    ],
    1,
    "Embassy's `Timer::after_millis(100).await` suspends the current async task cooperatively, allowing other tasks to run. This is the async equivalent of `vTaskDelay`: the hardware timer fires after 100ms and the executor resumes the task.",
    "hard",
    ["rust", "embassy", "async", "timer"]
  ),
  q(
    "e-6-q8",
    "e-6",
    "multiple-choice",
    "In RTIC v2, what is a 'software task' and how does it differ from a 'hardware task'?",
    [
      "Software tasks run in privileged mode; hardware tasks run in unprivileged mode.",
      "Hardware tasks are directly bound to hardware interrupt handlers. Software tasks are spawned by application code and dispatched via a software-generated interrupt (SWI/pending interrupt), with priority assigned at compile time.",
      "Software tasks use dynamic memory allocation; hardware tasks use static allocation.",
      "They are identical — the naming is a legacy distinction from RTIC v1.",
    ],
    1,
    "RTIC hardware tasks bind 1:1 to ISRs. Software tasks are queued work items dispatched via a dedicated interrupt at their compile-time priority level, allowing the application to spawn deferred work from any context without a heap-based task queue.",
    "hard",
    ["rtic", "software-task", "hardware-task", "interrupt"]
  ),

  // ── Module e-7: MISRA-C ───────────────────────────────────────────────────
  q(
    "e-7-q1",
    "e-7",
    "multiple-choice",
    "Under MISRA-C:2012 Rule 10.1, which operation is explicitly prohibited on a variable of essentially signed integer type?",
    [
      "Addition and subtraction",
      "Bitwise operations (AND, OR, XOR, NOT, shifts)",
      "Comparison with a constant",
      "Assignment from a wider signed type",
    ],
    1,
    "MISRA-C Rule 10.1 prohibits bitwise operations on signed integers because the behavior of bit-level manipulation of the sign bit is implementation-defined in C. Bitwise ops should be performed only on unsigned types.",
    "hard",
    ["misra-c", "rule-10-1", "signed", "bitwise"]
  ),
  q(
    "e-7-q2",
    "e-7",
    "multiple-choice",
    "MISRA-C rules are classified into three categories. Which category represents a rule that must never be violated and has no deviation process?",
    ["Advisory", "Required", "Mandatory"],
    2,
    "Mandatory rules cannot be deviated from — violation is an absolute prohibition. Required rules can be deviated from with a documented justification and project-level deviation approval. Advisory rules are recommendations.",
    "medium",
    ["misra-c", "rule-categories", "mandatory", "deviation"]
  ),
  q(
    "e-7-q3",
    "e-7",
    "true-false",
    "True or false: MISRA-C:2012 Rule 15.5 prohibits a function from having more than one return statement.",
    ["True", "False"],
    0,
    "Rule 15.5 states that a function shall have a single point of exit — exactly one `return` statement at the end of the function. This makes control flow easier to audit for safety-critical code.",
    "medium",
    ["misra-c", "rule-15-5", "single-exit", "control-flow"]
  ),
  q(
    "e-7-q4",
    "e-7",
    "multiple-choice",
    "MISRA-C:2012 Rule 14.4 requires that the expression in an `if`, `while`, `do-while`, or `for` statement be 'essentially Boolean.' What does this prohibit?",
    [
      "Using comparison operators in loop conditions.",
      "Using integer or pointer expressions directly as conditions (e.g., `if (ptr)` or `if (count)`) instead of explicit comparisons like `if (ptr != NULL)` or `if (count != 0u)`.",
      "Using Boolean literals `true` and `false`.",
      "Using compound conditions with `&&` and `||`.",
    ],
    1,
    "Rule 14.4 prevents implicit conversion of integers and pointers to Boolean, which is a common source of subtle bugs. Explicit comparisons make intent clear: `if (flag != 0u)` rather than `if (flag)`.",
    "medium",
    ["misra-c", "rule-14-4", "boolean", "control-flow"]
  ),
  q(
    "e-7-q5",
    "e-7",
    "multiple-choice",
    "Why does MISRA-C prohibit the use of dynamic memory allocation functions (`malloc`, `calloc`, `free`) in Rule 21.3?",
    [
      "Dynamic allocation is too slow for real-time systems.",
      "Heap fragmentation and non-deterministic allocation time make behavior unpredictable; allocation failure can occur at any time and is hard to handle safely in safety-critical code.",
      "ANSI C does not define `malloc` — it is a compiler extension.",
      "Dynamic memory corrupts the `.bss` section.",
    ],
    1,
    "In safety-critical embedded systems, determinism is essential. `malloc` may fail non-deterministically (heap fragmentation), and `free` introduces fragmentation over time. MISRA-C requires static or stack allocation to guarantee predictable memory behavior.",
    "hard",
    ["misra-c", "rule-21-3", "dynamic-memory", "malloc"]
  ),
  q(
    "e-7-q6",
    "e-7",
    "multiple-choice",
    "MISRA-C:2012 Rule 2.2 states that no project shall contain unreachable code. Which of the following is an example of a violation?",
    [
      "`if (x > 0) { return x; } else { return -x; }`",
      "`return result; x = 5;` — assignment after an unconditional return.",
      "`while (1) { process(); vTaskDelay(10); }` — an infinite loop.",
      "`assert(ptr != NULL);` — defensive assertion.",
    ],
    1,
    "Code after an unconditional `return`, `break`, `continue`, or `goto` is unreachable and dead. MISRA-C Rule 2.2 prohibits this as it suggests a logic error and creates confusion during code review.",
    "medium",
    ["misra-c", "rule-2-2", "unreachable-code", "dead-code"]
  ),
  q(
    "e-7-q7",
    "e-7",
    "multiple-choice",
    "Under MISRA-C, why are C99 `//` single-line comments classified as a potential risk (addressed by Rule 3.1)?",
    [
      "Single-line comments cannot contain multi-line documentation.",
      "A URL like `http://example.com` in a `//` comment causes the second `//` to start a new comment, which may confuse tools that do not fully parse C99.",
      "They are not valid ISO C90, which some safety-critical toolchains require.",
      "Single-line comments cannot contain preprocessor directives.",
    ],
    1,
    "Rule 3.1 (Required) prohibits sequences of `/*` within comments and `//` within `/*...*/` block comments to avoid comment-within-comment ambiguity. The URL example is the canonical case: `http://example.com` in a `//' comment has a second `//` which some analyzers misparse.",
    "hard",
    ["misra-c", "rule-3-1", "comments", "c99"]
  ),
  q(
    "e-7-q8",
    "e-7",
    "multiple-select",
    "Which of the following practices are required by MISRA-C:2012 to improve code traceability and safety? Select all that apply.",
    [
      "Every `switch` statement shall have a `default` clause (Rule 16.4).",
      "Identifiers declared in an inner scope shall not hide identifiers in an outer scope (Rule 5.3).",
      "All variables must be initialized with a constant expression at declaration.",
      "Header files shall contain only declarations, not definitions of objects or functions (Rule 8.5).",
    ],
    [0, 1, 3],
    "Rule 16.4 requires a `default` in every `switch`. Rule 5.3 prevents shadowing. Rule 8.5 enforces one-definition discipline across translation units. MISRA-C does not require all variables to be initialized with constant expressions — it does require that objects are initialized before use (Rule 9.1), which can be satisfied at runtime.",
    "hard",
    ["misra-c", "rule-16-4", "rule-5-3", "rule-8-5"]
  ),

  // ── Module e-8: Capstone ──────────────────────────────────────────────────
  q(
    "e-8-q1",
    "e-8",
    "multiple-choice",
    "You are designing a battery-powered IoT sensor that must run for 5 years on a coin cell. Which combination of techniques most effectively reduces average current consumption?",
    [
      "Use the highest CPU clock and process all data quickly, then sleep for long periods.",
      "Run the CPU at maximum frequency, disable the FPU, and use polling instead of interrupts.",
      "Use tickless idle (suppress SysTick when idle), put peripherals in low-power mode, use DMA for sensor reads, and wake only on events via EXTI or RTC alarm.",
      "Use a high baud rate UART to transmit data quickly and return to sleep.",
    ],
    2,
    "Energy is integral of power over time. Tickless idle stops the SysTick interrupt during sleep, reducing wake frequency. Peripheral low-power modes cut static currents. DMA avoids keeping the CPU awake during transfers. Event-driven wake (EXTI/RTC) minimizes active time. Fast transmission on wakeup also helps, but the fundamental lever is minimizing active time.",
    "hard",
    ["power-management", "low-power", "dma", "rtos", "iot"]
  ),
  q(
    "e-8-q2",
    "e-8",
    "multiple-choice",
    "An embedded system uses a watchdog timer (WDT). What is the correct approach to preventing a spurious watchdog reset?",
    [
      "Disable the WDT in production builds and only enable it during testing.",
      "Service (kick) the watchdog periodically in the main loop only when no faults have been detected, ensuring the system resets if it becomes stuck in an error state or deadlock.",
      "Set the WDT timeout to maximum to reduce the frequency of required kicks.",
      "Service the watchdog inside every ISR to prevent it expiring during high interrupt load.",
    ],
    1,
    "The WDT's job is to reset the system if it enters an unrecoverable state. Kicking it unconditionally defeats the purpose. The correct pattern: kick only from a known-good context (main loop health monitor) on a schedule shorter than the timeout. Never kick from ISRs alone — a stuck main loop would go undetected.",
    "hard",
    ["watchdog", "wdt", "reliability", "embedded"]
  ),
  q(
    "e-8-q3",
    "e-8",
    "multiple-choice",
    "A firmware binary must be verified for integrity before execution after a field update. Which technique provides the strongest assurance?",
    [
      "Checking the binary file size against a stored expected size.",
      "Verifying a CRC32 checksum stored at the end of the binary.",
      "Verifying a cryptographic signature (e.g., ECDSA over SHA-256 of the firmware image) using a public key stored in the bootloader.",
      "Checking that the first 4 bytes of the binary match the expected stack pointer value.",
    ],
    2,
    "CRC detects accidental corruption but not malicious modification — an attacker can compute a valid CRC for tampered code. A cryptographic signature requires the private key (held offline) to forge. The bootloader verifies with the embedded public key, providing authenticity and integrity — the foundation of secure boot.",
    "hard",
    ["secure-boot", "firmware-update", "signature", "cryptography"]
  ),
  q(
    "e-8-q4",
    "e-8",
    "multiple-choice",
    "In a dual-bank flash bootloader design, what is the primary advantage of storing the running firmware in Bank A while updating Bank B?",
    [
      "Bank B is always faster than Bank A for read operations.",
      "The device remains fully operational during the update; if the update fails or the new firmware is invalid, the bootloader can safely continue running the known-good firmware in Bank A.",
      "It doubles the available flash storage capacity.",
      "It prevents the CPU from executing code during the flash erase cycle.",
    ],
    1,
    "Dual-bank (or A/B partition) OTA updates provide atomicity: the system runs from one bank, writes the update to the other, verifies it, then only commits (swaps boot partition) if verification passes. A power failure during the write leaves the original bank intact.",
    "hard",
    ["bootloader", "dual-bank", "ota", "firmware-update"]
  ),
  q(
    "e-8-q5",
    "e-8",
    "multiple-choice",
    "You need to port a driver from one STM32 family to another. The peripheral base address and some register names have changed. What is the best first step?",
    [
      "Rewrite the driver from scratch using the new family's CMSIS headers.",
      "Diff the two families' reference manuals for the peripheral block and update base address macros and any renamed registers; leave the logic unchanged where the hardware behavior is identical.",
      "Use `#define` to alias all old register names to new ones at the top of the file.",
      "Switch to an RTOS abstraction layer that hides all hardware differences.",
    ],
    1,
    "CMSIS device headers provide the correct base addresses and register structures for each family. The peripheral logic (bit manipulation, state machine) is usually identical — only the peripheral address map and some register names differ. Working from the reference manual diff avoids introducing new bugs.",
    "medium",
    ["porting", "stm32", "cmsis", "driver"]
  ),
  q(
    "e-8-q6",
    "e-8",
    "multiple-choice",
    "A production firmware image fails intermittently in the field with no reproducible crash log. Which debugging technique is most appropriate when JTAG access is not available?",
    [
      "Add `printf` statements and rebuild.",
      "Implement a fault handler that captures the stack frame (PC, LR, CFSR) and key system state into non-volatile memory (e.g., a dedicated flash sector or EEPROM), then report it on the next boot.",
      "Reduce the CPU clock frequency to make timing issues disappear.",
      "Disable all interrupts and run the system in bare-metal polling mode.",
    ],
    1,
    "Cortex-M fault handlers receive a pointer to the exception stack frame containing the faulting PC, LR, and fault status registers (CFSR, HFSR). Writing this to NVM before resetting creates a post-mortem crash log that can be retrieved on next boot — the production equivalent of a core dump.",
    "hard",
    ["fault-handler", "debugging", "nvm", "crash-log", "cortex-m"]
  ),
  q(
    "e-8-q7",
    "e-8",
    "multiple-choice",
    "What is the purpose of the ARM Cortex-M MPU (Memory Protection Unit) in a safety-critical firmware design?",
    [
      "To provide virtual memory and address space isolation between processes.",
      "To define memory regions with access permissions (read-only, no-execute, privileged-only), so that a fault in one software component cannot corrupt another component's data or execute from RAM.",
      "To accelerate cache lookups for frequently accessed flash regions.",
      "To encrypt RAM contents to prevent cold-boot attacks.",
    ],
    1,
    "The MPU partitions the address space into regions with configurable permissions. A stack overflow in one RTOS task can trigger an MPU fault rather than silently corrupting adjacent memory. Marking code regions as execute-only and data regions as no-execute (XN) is also a basic exploit mitigation.",
    "hard",
    ["mpu", "memory-protection", "cortex-m", "safety"]
  ),
  q(
    "e-8-q8",
    "e-8",
    "multiple-choice",
    "In an embedded system with multiple peripherals sharing an SPI bus, what is the critical section that must be protected when initiating a transaction?",
    [
      "The SPI clock configuration registers.",
      "The assertion of the target Chip Select (CS) line through the completion of the transaction and de-assertion of CS — no other task may interleave SPI transfers on the shared bus during this window.",
      "The interrupt handler that reads the SPI receive buffer.",
      "The DMA channel assignment for the SPI peripheral.",
    ],
    1,
    "SPI is a bus: multiple peripherals share SCLK/MOSI/MISO. Only one transaction may occur at a time. In an RTOS, a mutex or semaphore must guard the sequence: assert CS → transfer → de-assert CS. If another task asserts a different CS while the first transaction is in flight, the target peripheral receives garbled data.",
    "medium",
    ["spi", "mutex", "rtos", "bus-arbitration"]
  ),
];
