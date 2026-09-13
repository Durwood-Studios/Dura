# UART 8N1 verification lab

The synthesizable transmitter and synchronized receiver share one clock. Configure `CLKS_PER_BIT >= 4`; this fixture uses 16 clocks/bit, no parity, one stop bit, and LSB-first data. `tx_start` is accepted only while idle; requests while busy are ignored. `rx_valid` and `framing_error` are one-cycle pulses. Reset is synchronous and aborts an in-flight frame.

## Executed open-source regression

```sh
iverilog -g2012 -s tb -o /tmp/dura-uart.vvp uart.sv tb.sv
vvp /tmp/dura-uart.vvp
```

Executed with Icarus Verilog 13.0: **PASS: 256/256 byte bins; mid-frame reset; bad stop; recovery; 257 accepted frames**. The test compares every received byte, rejects unexpected valid pulses, checks reset outputs and absence of stale data, injects a low stop bit, and confirms recovery. A watchdog fails hangs. The testbench's integer array is an executable byte-bin coverage model; it is not coverage of every clock skew or implementation state.

## Full UVM path, using the same RTL

`uart_uvm_pkg.sv` supplies a sequence, sequencer, driver, passive receive monitor, expected/observed FIFOs, scoreboard, byte covergroup, and test. `uvm_top.sv` connects them to the same UART in loopback. This path requires a simulator with full SystemVerilog class/covergroup/UVM support; Icarus is used for the independent procedural regression above.

Example for an installed Questa simulator with its precompiled `uvm` library:

```sh
vlib work
vlog -sv -L uvm uart.sv uart_if.sv uart_uvm_pkg.sv uvm_top.sv
vsim -c -L uvm uvm_top -do 'run -all; quit -f'
```

The simulator's UVM macro include path must resolve `uvm_macros.svh`; if the installation does not provide it implicitly, add `+incdir+<installed-UVM-source-directory>` to `vlog`. Select the simulator's matching UVM library, not an arbitrary mixed version. Record tool and UVM versions. Inspect the final report: zero UVM errors/fatals, 256 compared transactions, all 256 byte bins. A shell exit code alone does not prove UVM passed. **The UVM path is supplied but has not been compiled or executed here; Questa is not installed.**

The UVM sequence covers the 256 loopback bytes. Reset-in-frame and framing-error injection are currently exercised by the executed procedural testbench, not claimed as UVM coverage. A learner extension is to move these transactions into an explicit reset/error agent and prove the scoreboard flush policy before claiming that coverage in UVM.

## Deliverable and limits

Save tool versions, both available run logs, coverage output, and a waveform around reset and the rejected stop bit. Explain why a receive monitor and an expected transaction stream catch different failures. Add a baud mismatch/false-start test and state the tested tolerance; do not infer it from same-clock loopback.

This is an educational UART, not a production-qualified peripheral: no FIFO, parity, bus interface, arbitrary baud error certification, CDC formal proof, or physical I/O timing signoff is supplied. Functional tests do not establish synthesis timing or silicon correctness.

Primary UVM reference: [Accellera UVM](https://www.accellera.org/downloads/standards/uvm). Simulator command options depend on the installed version; use its bundled documentation for library setup.
