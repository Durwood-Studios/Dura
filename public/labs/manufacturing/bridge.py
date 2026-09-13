"""Local MTConnect snapshot -> OPC UA -> SQLite MES teaching lab.

The OPC UA namespace is lab-specific, not the MTConnect companion model.
Run only with synthetic fixtures on loopback; no machine control is exposed.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import json
import math
import sqlite3
import urllib.request
from urllib.error import HTTPError
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

from asyncua import Client, Server, ua

NAMESPACE = "urn:dura:manufacturing:lab:v1"
ENDPOINT = "opc.tcp://127.0.0.1:4848/dura/"


def require_loopback(url):
    if urlparse(url).hostname not in {"localhost", "127.0.0.1", "::1"}:
        raise ValueError("This unauthenticated fixture lab accepts loopback endpoints only")


class SnapshotReader:
    def __init__(self):
        self.instance = None
        self.sequence = 0

    def parse(self, body, now):
        if len(body) > 65536 or b"<!DOCTYPE" in body.upper() or b"<!ENTITY" in body.upper():
            raise ValueError("Unsafe or oversized XML")
        root = ET.fromstring(body)
        if root.tag != "{urn:mtconnect.org:MTConnectStreams:2.2}MTConnectStreams":
            raise ValueError("Expected MTConnect Streams 2.2 fixture")
        header = root.find("{*}Header")
        samples = root.findall(".//{*}RotaryVelocity")
        if header is None or len(samples) != 1:
            raise ValueError("Expected one CNC spindle observation")
        sample = samples[0]
        if sample.attrib.get("dataItemId") != "spindle":
            raise ValueError("Unknown data item")
        instance = int(header.attrib["instanceId"])
        sequence = int(sample.attrib["sequence"])
        timestamp = datetime.fromisoformat(sample.attrib["timestamp"].replace("Z", "+00:00"))
        if timestamp.tzinfo is None or not 0 <= (now - timestamp).total_seconds() <= 5:
            raise ValueError("Stale or future sample")
        rpm = float(sample.text)
        if not math.isfinite(rpm) or not 0 <= rpm <= 20000:
            raise ValueError("Unavailable or implausible spindle value")
        if instance < 1 or sequence < 1:
            raise ValueError("Invalid sequence identity")
        if instance == self.instance and sequence < self.sequence:
            raise ValueError("Out-of-order sample")
        # /current is a snapshot: skipping sequences is expected. /sample
        # event-history consumers must implement a separate gap/replay policy.
        self.instance, self.sequence = instance, sequence
        return {"instance": instance, "sequence": sequence, "rpm": rpm,
                "timestamp": timestamp.isoformat(), "quality": "Good"}


def fetch_snapshot(url):
    require_loopback(url)
    # No redirects: a fixture URL cannot redirect this process off loopback.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    try:
        with urllib.request.build_opener(NoRedirect).open(url, timeout=2) as response:
            body = response.read(65537)
    except HTTPError as error:
        # HTTP errors still own a response socket; close it during repeated outages.
        error.close()
        raise
    if len(body) > 65536:
        raise ValueError("Snapshot exceeds limit")
    return body


async def make_server(endpoint=ENDPOINT):
    require_loopback(endpoint)
    server = Server()
    await server.init()
    server.set_endpoint(endpoint)
    server.set_security_policy([ua.SecurityPolicyType.NoSecurity])
    index = await server.register_namespace(NAMESPACE)
    machine = await server.nodes.objects.add_object(index, "CNC")
    # A single structured snapshot prevents consumers combining values from
    # different polls. Read-only to OPC UA clients by default.
    snapshot = await machine.add_variable(index, "Snapshot", json.dumps({"quality": "Starting"}))
    return server, snapshot


async def poll_once(node, reader, url, now=None):
    try:
        body = await asyncio.to_thread(fetch_snapshot, url)
        value = reader.parse(body, now or datetime.now(timezone.utc))
    except (OSError, ValueError, KeyError, ET.ParseError, TypeError):
        value = {"quality": "BadNoCommunication"}
    await node.write_value(json.dumps(value, allow_nan=False))
    return value


class MES:
    def __init__(self, database=":memory:"):
        self.db = sqlite3.connect(database)
        self.db.execute("CREATE TABLE IF NOT EXISTS observations (instance INTEGER, sequence INTEGER, rpm REAL, timestamp TEXT, PRIMARY KEY(instance,sequence))")

    def ingest(self, snapshot):
        if snapshot.get("quality") != "Good":
            return False
        rpm = snapshot.get("rpm")
        instance, sequence = snapshot.get("instance"), snapshot.get("sequence")
        if (type(instance) is not int or type(sequence) is not int or instance < 1 or sequence < 1
                or not isinstance(rpm, (float, int)) or not math.isfinite(rpm) or not 0 <= rpm <= 20000):
            raise ValueError("Invalid OPC UA snapshot")
        with self.db:
            cursor = self.db.execute("INSERT OR IGNORE INTO observations VALUES (?,?,?,?)",
                (instance, sequence, rpm, snapshot["timestamp"]))
        return cursor.rowcount == 1

    def close(self):
        self.db.close()


async def consume(endpoint, database):
    require_loopback(endpoint)
    mes = MES(database)
    try:
        while True:
            try:
                async with Client(endpoint, timeout=3) as client:
                    index = await client.get_namespace_index(NAMESPACE)
                    node = await client.nodes.objects.get_child([f"{index}:CNC", f"{index}:Snapshot"])
                    while True:
                        value = json.loads(await node.read_value())
                        if mes.ingest(value):
                            print(json.dumps(value), flush=True)
                        elif value.get("quality") != "Good":
                            print("MES: source unavailable; no production observation recorded", flush=True)
                        await asyncio.sleep(0.5)
            except (OSError, ConnectionError, asyncio.TimeoutError, ua.UaError):
                print("MES: OPC UA connection lost; reconnecting", flush=True)
                await asyncio.sleep(1)
    finally:
        mes.close()


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["bridge", "mes"])
    parser.add_argument("--feed", default="http://127.0.0.1:8088/current")
    parser.add_argument("--endpoint", default=ENDPOINT)
    parser.add_argument("--database", default="mes.sqlite")
    args = parser.parse_args()
    if args.mode == "mes":
        await consume(args.endpoint, args.database)
        return
    server, node = await make_server(args.endpoint)
    reader = SnapshotReader()
    async with server:
        while True:
            await poll_once(node, reader, args.feed)
            await asyncio.sleep(0.5)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
