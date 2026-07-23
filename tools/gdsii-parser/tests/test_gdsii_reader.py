import struct
import pytest
from litho_gdsii_parser.gdsii_reader import GdsiiReader, GdsiiRecord


def test_read_header_record():
    # GDSII HEADER: 2-byte length (includes itself) + 2-byte type + data
    record_type = 0x0002  # HEADER
    version = 600
    payload = struct.pack(">I", version)
    # Length = 2 (length field) + 2 (type) + 4 (payload) = 8
    record_data = struct.pack(">H", 8) + struct.pack(">H", record_type) + payload
    record = GdsiiRecord.parse(record_data)
    assert record.type == record_type
    assert record.data == payload


def test_read_string_record():
    record_type = 0x0606  # STRNAME
    name = b"TOP_CELL\x00"
    name_padded = name + b"\x00" * (len(name) % 2)
    # Length = 2 + 2 + len(name_padded)
    record_data = struct.pack(">H", 4 + len(name_padded)) + struct.pack(">H", record_type) + name_padded
    record = GdsiiRecord.parse(record_data)
    assert record.type == record_type
    assert record.data.rstrip(b"\x00") == b"TOP_CELL"


def test_reader_opens_file(tmp_path):
    # HEADER record: length=8, type=0x0002, data=version(600)
    header = struct.pack(">H", 8) + struct.pack(">H", 0x0002) + struct.pack(">I", 600)
    # END record: length=4, type=0x0400, no data
    end = struct.pack(">H", 4) + struct.pack(">H", 0x0400)
    gds_file = tmp_path / "test.gds"
    gds_file.write_bytes(header + end)

    reader = GdsiiReader(str(gds_file))
    records = list(reader.read_records())
    assert len(records) == 2
    assert records[0].type == 0x0002
    assert records[1].type == 0x0400
