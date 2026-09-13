# CNC telemetry integration lab

Build a real local HTTP → OPC UA → SQLite flow. Prerequisites: Python 3.11+ and the Phase 14 MTConnect, OPC UA, ISA-95 and IEC 62443 lessons. This project uses synthetic spindle telemetry and a private OPC UA namespace. It does not implement the full MTConnect companion information model, an OPC certification test, or a production security architecture.

## Run from a clean directory

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m unittest -v
```

Then open three terminals in this directory:

```sh
.venv/bin/python feed.py
.venv/bin/python bridge.py bridge
.venv/bin/python bridge.py mes
```

The MES prints new observations and records them in `mes.sqlite`. Stop the feed: the bridge publishes `BadNoCommunication` and the MES stops recording production values. Restart it: a real agent must advance `instanceId` when its sequence restarts; the fixture advances its instance identity on each process start, allowing the bridge to recover automatically. The automated test separately verifies an instance change with a lower sequence number.

## What to submit

Save the test output, exact Python/package versions, ten observed rows, and a screenshot/log of source loss and recovery. Draw the ISA-95 information flow separately from an IEC 62443 zones/conduits diagram. Include endpoint authentication, certificate distribution and access-control requirements for any future deployment; this loopback-only exercise deliberately uses NoSecurity and exposes no control method.

The `/current` snapshot can skip sequence numbers. An event-history MES would instead need `/sample`, buffer-overrun detection and replay. Duplicate snapshot identities are idempotent in SQLite. Stale, unavailable, malformed and non-finite data cannot become good production observations.

## Extend and verify

Add a second machine with a distinct identity, persist the last sequence across bridge restart, and implement an event-history consumer. Add tests showing that a missed event triggers recovery and that a restart cannot merge observations from different machines. A complete submission includes failed cases before the repair and passing output afterwards.

Primary references: [MTConnect standard](https://www.mtconnect.org/standard), [asyncua server/client examples](https://github.com/FreeOpcUa/opcua-asyncio/tree/master/examples). Dura assessments record quiz results; retain the project files and logs as your own portfolio evidence.
