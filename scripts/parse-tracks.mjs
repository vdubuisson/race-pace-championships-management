import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import { stringify } from 'csv-stringify/sync';

const TRACKS_DIR = path.join(process.cwd(), 'Tracks');
const GAME_TRACK_FILES_DIR = path.join(TRACKS_DIR, '_game_track_files');
const OUTPUT_FILE = path.join(process.cwd(), 'csv', 'tracks-data.csv');

const PROPERTIES_TO_EXTRACT = [
  'TrackName',
  'Track Type',
  'TrackGradeFilter',
  'Max AI participants',
  'Country',
  'Length',
  'Number Of Turns',
  'Year'
];

async function parseXmlFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      parseString(data, { explicitArray: false }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

function extractPropertiesFromData(data) {
  const props = {};

  if (data.Reflection && data.Reflection.data) {
    const propArray = data.Reflection.data.prop;

    if (Array.isArray(propArray)) {
      propArray.forEach(prop => {
        if (PROPERTIES_TO_EXTRACT.includes(prop.$.name)) {
          props[prop.$.name] = prop.$.data || '';
        }
      });
    } else if (propArray) {
      if (PROPERTIES_TO_EXTRACT.includes(propArray.$.name)) {
        props[propArray.$.name] = propArray.$.data || '';
      }
    }
  }

  return props;
}

async function processTrdFiles() {
  const allData = [];

  // Process both _game_track_files and _mods_track_files
  const directories = [
    { path: GAME_TRACK_FILES_DIR, isGameFile: true },
    { path: path.join(TRACKS_DIR, '_mods_track_files'), isGameFile: false }
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir.path)) {
      console.warn(`Directory not found: ${dir.path}`);
      continue;
    }

    const files = fs.readdirSync(dir.path).filter(file => file.endsWith('.trd'));

    for (const file of files) {
      const filePath = path.join(dir.path, file);

      try {
        const xmlData = await parseXmlFile(filePath);
        const props = extractPropertiesFromData(xmlData);

        // Add filename and game file flag
        const row = {
          isMod: dir.isGameFile ? 'FALSE' : 'TRUE',
          ...props,
        };

        // Fill missing properties with empty strings
        PROPERTIES_TO_EXTRACT.forEach(prop => {
          if (!(prop in row)) {
            row[prop] = '';
          }
        });

        allData.push(row);
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }

  return allData;
}

function writeCsv(data) {
  const columns = [...PROPERTIES_TO_EXTRACT, 'isMod'];

  const output = stringify(data, {
    header: true,
    columns: columns
  });

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✓ CSV file written to ${OUTPUT_FILE}`);
  console.log(`✓ Total tracks processed: ${data.length}`);
}

async function main() {
  try {
    console.log('Starting track file parsing...');
    const tracksData = await processTrdFiles();

    if (tracksData.length === 0) {
      console.error('No track files found to process.');
      process.exit(1);
    }

    writeCsv(tracksData);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
