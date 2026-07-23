import struct
import pytest
from litho_gdsii_parser.streaming import StreamingProcessor


def test_streaming_processor_counts_records(tmp_path):
    records = b""
    for i in range(100):
        record_type = 0x0002
        payload = struct.pack(">I", 600)
        # Length = 2 + 2 + 4 = 8
        records += struct.pack(">H", 8) + struct.pack(">H", record_type) + payload
    # END record: length=4, type=0x0400
    end = struct.pack(">H", 4) + struct.pack(">H", 0x0400)
    gds_file = tmp_path / "large.gds"
    gds_file.write_bytes(records + end)

    processor = StreamingProcessor(chunk_size=256)
    count = processor.count_records(str(gds_file))
    assert count == 100 + 1  # 100 headers + 1 end
