import json
from datetime import datetime, timedelta, timezone
from http.server import HTTPServer
import socket
import threading
import unittest
from asyncua import Client
from bridge import SnapshotReader, MES, NAMESPACE, make_server, poll_once
from feed import Feed, fixture


class ParserTests(unittest.TestCase):
    def test_quality_sequence_and_restart(self):
        now = datetime.now(timezone.utc)
        reader = SnapshotReader()
        self.assertEqual(reader.parse(fixture(8), now + timedelta(seconds=1))["rpm"], 1200)
        with self.assertRaises(ValueError): reader.parse(fixture(7), now + timedelta(seconds=1))
        self.assertEqual(reader.parse(fixture(1, instance=2), now + timedelta(seconds=1))["sequence"], 1)
        for value in ["UNAVAILABLE", "nan", "inf", -1, 999999]:
            with self.assertRaises(ValueError): reader.parse(fixture(2, rpm=value), now + timedelta(seconds=1))
        with self.assertRaises(ValueError): reader.parse(fixture(2, timestamp=(now - timedelta(seconds=10)).isoformat()), now)
        with self.assertRaises(ValueError): reader.parse(b'<!DOCTYPE x><x/>', now)

    def test_mes_deduplicates_and_ignores_bad_quality(self):
        mes = MES()
        try:
            sample = SnapshotReader().parse(fixture(1), datetime.now(timezone.utc) + timedelta(seconds=1))
            self.assertTrue(mes.ingest(sample))
            self.assertFalse(mes.ingest(sample))
            self.assertFalse(mes.ingest({"quality": "BadNoCommunication"}))
            self.assertEqual(mes.db.execute("SELECT COUNT(*) FROM observations").fetchone()[0], 1)
        finally: mes.close()


class ProtocolTests(unittest.IsolatedAsyncioTestCase):
    async def test_real_http_opcua_mes_and_recovery(self):
        feed = HTTPServer(("127.0.0.1", 0), Feed)
        worker = threading.Thread(target=feed.serve_forever, daemon=True)
        worker.start()
        with socket.socket() as reservation:
            reservation.bind(("127.0.0.1", 0))
            port = reservation.getsockname()[1]
        endpoint = f"opc.tcp://127.0.0.1:{port}/dura/"
        url = f"http://127.0.0.1:{feed.server_port}/current"
        server, node = await make_server(endpoint)
        reader, mes = SnapshotReader(), MES()
        try:
            async with server:
                async with Client(endpoint) as client:
                    ns = await client.get_namespace_index(NAMESPACE)
                    remote = await client.nodes.objects.get_child([f"{ns}:CNC", f"{ns}:Snapshot"])
                    await poll_once(node, reader, url)
                    self.assertTrue(mes.ingest(json.loads(await remote.read_value())))
                    await poll_once(node, reader, url + "/missing")
                    bad = json.loads(await remote.read_value())
                    self.assertEqual(bad["quality"], "BadNoCommunication")
                    self.assertFalse(mes.ingest(bad))
                    await poll_once(node, reader, url)
                    self.assertTrue(mes.ingest(json.loads(await remote.read_value())))
                    self.assertEqual(mes.db.execute("SELECT COUNT(*) FROM observations").fetchone()[0], 2)
                # A new OPC UA session resumes without duplicate MES records.
                async with Client(endpoint) as client:
                    ns = await client.get_namespace_index(NAMESPACE)
                    remote = await client.nodes.objects.get_child([f"{ns}:CNC", f"{ns}:Snapshot"])
                    self.assertFalse(mes.ingest(json.loads(await remote.read_value())))
        finally:
            mes.close()
            feed.shutdown()
            feed.server_close()
            worker.join()


if __name__ == "__main__": unittest.main()
