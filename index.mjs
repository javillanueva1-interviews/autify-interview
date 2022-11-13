import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

//Get dirname for file name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Regex to parse domain of url
const domainRegex = RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img);

//Regexs to parse for metadata

//links (a href and area according to MDN)
const linkRegex = RegExp(/(a href)|area/g);
const imgRegex = RegExp(/img/g);

//cmd line args
const args = process.argv.slice(2);

//Print Metadata
const useMetadata = args[0] === '--metadata'

const main = () => {
    let urls = args;

    //Skip the first argument as it should be the flag
    if(useMetadata) {
        urls = args.slice(1);
    }

    urls.forEach( async (url) => {
        let html

        //get domain name of url for file name
        const domain = domainRegex.exec(url)[1];

        //Fetch and put html string into memory
        try {
            const res = await fetch(url);
            html = await res.text();
        } catch (err) {
            throw new Error('Unable to access url');
        }

        //Write file to html
        try {
            fs.writeFileSync(path.join(__dirname, domain), html);
        } catch (err) {
            throw new Error('Unable to write file');
        }

        //Print Metadata if necessary
        if(useMetadata) {
            const numLinks = getNumLinks(html);
            const numImages = getNumImages(html);
            const lastFetch = getLastFetch(domain);

            console.log(`site: ${domain}`);
            console.log(`number of links: ${numLinks}`);
            console.log(`number of images : ${numImages}`);
            console.log(`last fetch: ${lastFetch}`);
        }

        //Write to timelog (must do after printing metadata for last fetch)
        try {
            fs.appendFileSync(path.join(__dirname, 'timelog.txt'), `${domain} ${new Date()}\n`)
        } catch (err) {
            throw new Error('Unable to write file');
        }
    })
}

const getNumLinks = (html) => {
    return html.match(linkRegex).length;
}

const getNumImages = (html) => {
    return html.match(imgRegex).length;
}

const getLastFetch = (domain) => {
    const timelogBuffer = fs.readFileSync(path.join(__dirname, 'timelog.txt'));
    
    let lastFetch = '';

    timelogBuffer.toString().split(/\n/).forEach(line => {
        if(line.match(domain)) {
            lastFetch = line.split(' ').slice(1).join(' ');
        }
    });

    return lastFetch;
}

main();