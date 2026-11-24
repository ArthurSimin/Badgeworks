// Store small sets of downloaded files in a single ZIP without a dependency.
function zipFiles(files) {
  const encoder = new TextEncoder();
  const localEntries = [];
  const directory = [];
  let offset = 0;
  let directorySize = 0;

  for (const { name, contents } of files) {
    const filename = encoder.encode(name);
    const data = typeof contents === 'string' ? encoder.encode(contents) : contents;
    let crc = -1;
    for (const byte of data) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    crc = ~crc;

    const local = new Uint8Array(30 + filename.length);
    const header = new DataView(local.buffer);
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 0x0800, true); // UTF-8 filenames.
    header.setUint16(12, 33, true); // DOS date for 1980-01-01.
    header.setUint32(14, crc, true);
    header.setUint32(18, data.length, true);
    header.setUint32(22, data.length, true);
    header.setUint16(26, filename.length, true);
    local.set(filename, 30);
    localEntries.push(local, data);

    const central = new Uint8Array(46 + filename.length);
    const entry = new DataView(central.buffer);
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    central.set(local.subarray(4, 30), 6);
    entry.setUint32(42, offset, true);
    central.set(filename, 46);
    directory.push(central);
    directorySize += central.length;
    offset += local.length + data.length;
  }

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, directorySize, true);
  end.setUint32(16, offset, true);
  return new Blob([...localEntries, ...directory, end.buffer], { type: 'application/zip' });
}
