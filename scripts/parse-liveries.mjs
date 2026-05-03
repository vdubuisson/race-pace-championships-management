import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

const INPUT_FILE = path.join(process.cwd(), 'Vehicles', 'liveries.json');
const OUTPUT_FILE = path.join(process.cwd(), 'csv', 'liveries-data.csv');

function readLiveriesJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(rawContent);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }
}

function flattenLiveries(data) {
  const cars = data?.response?.list;

  if (!Array.isArray(cars)) {
    throw new Error('Unexpected JSON format: expected response.list to be an array.');
  }

  const rows = [];

  for (const car of cars) {
    const carName = car?.name ?? '';
    const liveries = Array.isArray(car?.liveries) ? car.liveries : [];

    for (const livery of liveries) {
      rows.push({
        carName,
        liveryId: (livery?.id ?? 0) + 1,
        liveryName: livery?.name ?? '',
      });
    }
  }

  return rows;
}

function writeCsv(rows, outputFilePath) {
  const output = stringify(rows, {
    header: true,
    columns: ['carName', 'liveryId', 'liveryName'],
  });

  const outputDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, output, 'utf8');
}

function main() {
  try {
    console.log('Starting livery JSON parsing...');
    const parsed = readLiveriesJson(INPUT_FILE);
    const rows = flattenLiveries(parsed);

    if (rows.length === 0) {
      console.error('No liveries found to export.');
      process.exit(1);
    }

    writeCsv(rows, OUTPUT_FILE);
    console.log(`✓ CSV file written to ${OUTPUT_FILE}`);
    console.log(`✓ Total liveries exported: ${rows.length}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
