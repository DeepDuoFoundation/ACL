import struct
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator


@dataclass
class GdsiiRecord:
    length: int
    type: int
    data: bytes

    @classmethod
    def parse(cls, raw: bytes) -> "GdsiiRecord":
        if len(raw) < 4:
            raise ValueError(f"Record too short: {len(raw)} bytes")
        length = struct.unpack(">H", raw[0:2])[0]
        record_type = struct.unpack(">H", raw[2:4])[0]
        data = raw[4:length]
        return cls(length=length, type=record_type, data=data)


class GdsiiReader:
    def __init__(self, path: str):
        self.path = Path(path)
        if not self.path.exists():
            raise FileNotFoundError(f"GDSII file not found: {path}")

    def read_records(self) -> Iterator[GdsiiRecord]:
        with open(self.path, "rb") as f:
            while True:
                header = f.read(4)
                if len(header) < 4:
                    break
                length = struct.unpack(">H", header[0:2])[0]
                if length < 4:
                    raise ValueError(f"Invalid record length: {length}")
                remaining = length - 4
                data = f.read(remaining)
                if len(data) < remaining:
                    break
                record_type = struct.unpack(">H", header[2:4])[0]
                yield GdsiiRecord(length=length, type=record_type, data=data)
