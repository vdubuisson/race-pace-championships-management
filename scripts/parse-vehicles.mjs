import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import { stringify } from 'csv-stringify/sync';

const VEHICLES_DIR = path.join(process.cwd(), 'Vehicles');
const GAME_VEHICLE_FILES_DIR = path.join(VEHICLES_DIR, '_game_vehicle_files');
const OUTPUT_FILE = path.join(process.cwd(), 'csv', 'vehicles-data.csv');

const PROPERTIES_TO_EXTRACT = {
  'Vehicle Class': 'class',
  'Vehicle Name': 'name',
  'Vehicle Year': 'year',
  'AI ONLY': 'ai_only'
};

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
  const resultProps = {};

  if (data.Reflection && data.Reflection.data) {
    const props = data.Reflection.data.prop;

    if (Array.isArray(props)) {
      props.forEach(prop => {
        if (Object.keys(PROPERTIES_TO_EXTRACT).includes(prop.$.name)) {
          const key = PROPERTIES_TO_EXTRACT[prop.$.name];
          resultProps[key] = prop.$.data || '';
        }
      });
    } else if (props) {
      if (Object.keys(PROPERTIES_TO_EXTRACT).includes(props.$.name)) {
        const key = PROPERTIES_TO_EXTRACT[props.$.name];
        resultProps[key] = props.$.data || '';
      }
    }
  }

  return resultProps;
}

async function processCrdFiles() {
  const allData = [];

  // Process both _game_vehicle_files and _mods_vehicle_files
  const directories = [
    { path: GAME_VEHICLE_FILES_DIR, isGameFile: true },
    { path: path.join(VEHICLES_DIR, '_mods_vehicle_files'), isGameFile: false }
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir.path)) {
      console.warn(`Directory not found: ${dir.path}`);
      continue;
    }

    const files = fs.readdirSync(dir.path).filter(file => file.endsWith('.crd'));

    for (const file of files) {
      const filePath = path.join(dir.path, file);

      try {
        const xmlData = await parseXmlFile(filePath);
        const props = extractPropertiesFromData(xmlData);

        // Add filename and game file flag
        const row = {
          file_name: file.replace('.crd', '').toLowerCase(),
          folder_name: '',
          is_mod: dir.isGameFile ? 'FALSE' : 'TRUE',
          ...props,
        };

        // Fill missing properties with empty strings
        Object.values(PROPERTIES_TO_EXTRACT).forEach(prop => {
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
  const columns = [...Object.values(PROPERTIES_TO_EXTRACT), 'folder_name', 'file_name', 'is_mod'];

  const output = stringify(data, {
    header: true,
    columns: columns
  });

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✓ CSV file written to ${OUTPUT_FILE}`);
  console.log(`✓ Total vehicles processed: ${data.length}`);
}

async function main() {
  try {
    console.log('Starting vehicle file parsing...');
    const vehiclesData = await processCrdFiles();

    if (vehiclesData.length === 0) {
      console.error('No vehicle files found to process.');
      process.exit(1);
    }

    writeCsv(vehiclesData);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
