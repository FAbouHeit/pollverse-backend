import fs from 'fs';
import csv from 'csv-parser';

const readProfanityList = async () => {
    const profanityList = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream('profanity_list.csv')
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

export const isProfanity = async (words) => {
    const profanityList = await readProfanityList();
    for(let i = 0; i < words.length; i++){
        if(profanityList.includes(words[i])){
            return true;
        }
    }
    return false;
}