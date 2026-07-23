import struct
from pathlib import Path


class StreamingProcessor:
    def __init__(self, chunk_size: int = 1024 * 1024):
        self.chunk_size = chunk_size

    def count_records(self, path: str) -> int:
        count = 0
        with open(path, "rb") as f:
            while True:
                header = f.read(4)
                if len(header) < 4:
                    break
                length = struct.unpack(">H", header[0:2])[0]
                if length < 4:
                    break
                f.seek(length - 4, 1)
                count += 1
        return count

    def stream_chunks(self, path: str):
        with open(path, "rb") as f:
            while True:
                data = f.read(self.chunk_size)
                if not data:
                    break
                yield data
