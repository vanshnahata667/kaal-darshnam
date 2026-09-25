import {mkdir, writeFile} from 'node:fs/promises';
import {monuments, events} from '../app/heritage.ts';
import {librarySchema} from '../lib/validation.ts';

const catalogue = librarySchema.parse({places: monuments, timelines: events, media: {}});
const json = JSON.stringify(catalogue);
if (Buffer.byteLength(json, 'utf8') > 900000) throw new Error('Catalogue exceeds the export size limit.');
await mkdir(new URL('../outputs/', import.meta.url), {recursive: true});
await writeFile(new URL('../outputs/firestore-content.json', import.meta.url), json, 'utf8');
console.log(`Exported ${catalogue.places.length} places to outputs/firestore-content.json`);
