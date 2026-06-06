import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import { stringify } from 'csv-stringify/sync';

const VEHICLES_DIR = path.join(process.cwd(), 'Vehicles');
const GAME_VEHICLE_FILES_DIR = path.join(VEHICLES_DIR, '_game_vehicle_files');
const MODS_VEHICLE_FILES_DIR = path.join(VEHICLES_DIR, '_mods_vehicle_files');
const VEHICLES_OUTPUT_FILE = path.join(process.cwd(), 'csv', 'vehicles-data.csv');
const LIVERIES_OUTPUT_FILE = path.join(process.cwd(), 'csv', 'liveries-mods-data.csv');

const VEHICLE_PROPERTIES_TO_EXTRACT = {
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
        if (Object.keys(VEHICLE_PROPERTIES_TO_EXTRACT).includes(prop.$.name)) {
          const key = VEHICLE_PROPERTIES_TO_EXTRACT[prop.$.name];
          resultProps[key] = prop.$.data || '';
        }
      });
    } else if (props) {
      if (Object.keys(VEHICLE_PROPERTIES_TO_EXTRACT).includes(props.$.name)) {
        const key = VEHICLE_PROPERTIES_TO_EXTRACT[props.$.name];
        resultProps[key] = props.$.data || '';
      }
    }
  }

  return resultProps;
}

function extractLiveriesFromRcf(data) {
  const liveries = [];

  if (data.REPLACEMENT_SYSTEM && data.REPLACEMENT_SYSTEM.NAMES) {
    const namesArray = Array.isArray(data.REPLACEMENT_SYSTEM.NAMES)
      ? data.REPLACEMENT_SYSTEM.NAMES
      : [data.REPLACEMENT_SYSTEM.NAMES];

    const liveryNames = namesArray.find(n => n.$.INPUT === 'LIVERY');

    if (liveryNames && liveryNames.NAME) {
      const names = Array.isArray(liveryNames.NAME)
        ? liveryNames.NAME
        : [liveryNames.NAME];

      names.forEach(name => {
        liveries.push({
          livery_id: name.$.LIVERY || '',
          livery_name: name.$.NAME || ''
        });
      });
    }
  }

  return liveries;
}

async function processCrdFiles() {
  const vehiclesData = [];
  const liveriesData = [];

  const directories = [
    { path: GAME_VEHICLE_FILES_DIR, isGameFile: true },
    { path: MODS_VEHICLE_FILES_DIR, isGameFile: false }
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir.path)) {
      console.warn(`Directory not found: ${dir.path}`);
      continue;
    }

    const files = fs.readdirSync(dir.path).filter(file => file.endsWith('.crd'));

    for (const file of files) {
      const filePath = path.join(dir.path, file);
      const baseName = file.replace('.crd', '');

      try {
        const xmlData = await parseXmlFile(filePath);
        const props = extractPropertiesFromData(xmlData);

        // Add filename and game file flag
        const vehicleRow = {
          file_name: baseName.toLowerCase(),
          folder_name: '',
          is_mod: dir.isGameFile ? 'FALSE' : 'TRUE',
          ...props,
        };

        // Fill missing properties with empty strings
        Object.values(VEHICLE_PROPERTIES_TO_EXTRACT).forEach(prop => {
          if (!(prop in vehicleRow)) {
            vehicleRow[prop] = '';
          }
        });

        vehiclesData.push(vehicleRow);

        // Process RCF file only if isGameFile is false
        if (!dir.isGameFile) {
          const rcfFile = baseName + '.rcf';
          const rcfPath = path.join(dir.path, rcfFile);

          if (fs.existsSync(rcfPath)) {
            try {
              const rcfXmlData = await parseXmlFile(rcfPath);
              const liveries = extractLiveriesFromRcf(rcfXmlData);

              liveries.forEach(livery => {
                liveriesData.push({
                  class: vehicleRow.class,
                  car_name: vehicleRow.name,
                  livery_id: livery.livery_id,
                  livery_name: livery.livery_name
                });
              });

              console.log(`✓ Processed ${rcfFile} - Found ${liveries.length} liveries`);
            } catch (error) {
              console.error(`Error processing ${rcfFile}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }

  return { vehiclesData, liveriesData };
}

function writeVehiclesCsv(data) {
  const columns = [...Object.values(VEHICLE_PROPERTIES_TO_EXTRACT), 'folder_name', 'file_name', 'is_mod'];

  const output = stringify(data, {
    header: true,
    columns: columns
  });

  fs.writeFileSync(VEHICLES_OUTPUT_FILE, output, 'utf8');
  console.log(`✓ CSV file written to ${VEHICLES_OUTPUT_FILE}`);
  console.log(`✓ Total vehicles processed: ${data.length}`);
}

function writeLiveriesCsv(data) {
  if (data.length === 0) {
    console.log('ℹ No liveries to write.');
    return;
  }

  const columns = ['class', 'car_name', 'livery_name', 'livery_id'];

  const output = stringify(data, {
    header: true,
    columns: columns
  });

  fs.writeFileSync(LIVERIES_OUTPUT_FILE, output, 'utf8');
  console.log(`✓ CSV file written to ${LIVERIES_OUTPUT_FILE}`);
  console.log(`✓ Total liveries processed: ${data.length}`);
}

async function main() {
  try {
    console.log('Starting vehicle and liveries file parsing...');
    const { vehiclesData, liveriesData } = await processCrdFiles();

    if (vehiclesData.length === 0) {
      console.error('No vehicle files found to process.');
      process.exit(1);
    }

    writeVehiclesCsv(vehiclesData);
    writeLiveriesCsv(liveriesData);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
