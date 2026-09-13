"""Synthetic CNC /current snapshot server; no real equipment connection."""
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
import time


def fixture(sequence, rpm=1200, instance=1, timestamp=None):
    timestamp = timestamp or datetime.now(timezone.utc).isoformat()
    return f'''<?xml version="1.0"?>
<MTConnectStreams xmlns="urn:mtconnect.org:MTConnectStreams:2.2">
<Header creationTime="{timestamp}" sender="dura-fixture" instanceId="{instance}" version="2.2" bufferSize="1024" nextSequence="{sequence + 1}" firstSequence="1" lastSequence="{sequence}"/>
<Streams><DeviceStream name="CNC" uuid="synthetic-cnc"><ComponentStream component="Rotary" name="S" componentId="spindle-component"><Samples>
<RotaryVelocity dataItemId="spindle" timestamp="{timestamp}" sequence="{sequence}">{rpm}</RotaryVelocity>
</Samples></ComponentStream></DeviceStream></Streams></MTConnectStreams>'''.encode()


class Feed(BaseHTTPRequestHandler):
    sequence = 0
    instance = time.time_ns()

    def do_GET(self):
        if self.path != "/current":
            self.send_error(404)
            return
        Feed.sequence += 1
        body = fixture(Feed.sequence, instance=Feed.instance)
        self.send_response(200)
        self.send_header("Content-Type", "application/xml")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    with HTTPServer(("127.0.0.1", 8088), Feed) as server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
