import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readProfanityList = async () => {
    const profanityList = [];
    const filePath = path.resolve(__dirname, 'profanity_list.csv');
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                profanityList.push(row.text);
            })
            .on('end', () => {
                resolve(profanityList);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// export const isProfanity = async (words) => {
//     const profanityList = await readProfanityList();
//     for(let i = 0; i < words.length; i++){
//         if(profanityList.includes(words[i])){
//             return true;
//         }
//     }
//     return false;
// }

export const isProfanity = async (words) => {
    const profanityList = await readProfanityList();
    const sanitizedWords = words.map(word => word.replace(/[^\w\s]|_$/, '')); // Removes special characters from the end of each word
    for(let i = 0; i < sanitizedWords.length; i++){
        if(profanityList.includes(sanitizedWords[i])){
            return true;
        }
    }
    return false;
}