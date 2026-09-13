# Correctness before latency

Prerequisites: Phase 12 C++, integer numerics, order identity and SPSC lessons; C++20 Clang or GCC with thread support. The program supplies a synthetic byte replay fixture, a bounded ITCH5 parser, integer-price book, independent reference comparison, gap/recovery cases and SPSC stress test. No exchange connection, order submission or proprietary market data is used.

```sh
c++ -std=c++20 -O2 -Wall -Wextra -Werror -pthread replay.cpp -o replay
./replay
c++ -std=c++20 -O1 -g -fsanitize=address,undefined -pthread replay.cpp -o replay-sanitized
./replay-sanitized
```

Keep assertions enabled. Expected output starts with `PASS`, then local parse+apply p50/p99/max nanoseconds. Results depend on machine, thermal state, compiler and instrumentation. Record compiler version, CPU, OS, flags and repeated runs. The per-event timer adds overhead; this is not network, exchange or production trading latency.

The parser supports unattributed Add, Execute, Cancel and Delete payloads for the synthetic DURA symbol/locate1. All other types fail closed. The external sequence argument models a transport cursor; it is not an ITCH payload field. A full feed requires administrative messages, other modifications, instrument directories, session identity and transport recovery. Compare offsets to the [Nasdaq TotalView-ITCH5 specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHSpecification.pdf).

## Your project

1. Reproduce the passing baseline and save test/benchmark logs.
2. Add Replace messages with identity-collision, quantity and price tests.
3. Add a second instrument without mixing its levels with the first.
4. Feed measured top-of-book events through the SPSC queue; preserve full/empty back pressure and expose any dropped-event count.
5. Compare a cache-aware level structure against this map baseline with exactly the same tape and oracle. Explain speed, memory and recovery tradeoffs.

Submit source, input fixture/seed, correctness logs, benchmark environment and the recovery design. Hashing your archive detects changed bytes; it does not prove authorship or skill. Dura `/verify` currently verifies assessment certificates and does not accept or grade project archives. Retain the archive and evidence in your portfolio for a reviewer to reproduce.
