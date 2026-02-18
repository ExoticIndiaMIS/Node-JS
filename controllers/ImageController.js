import ImageModel from '../models/ImageModel.js';
import XLSX from 'xlsx';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import archiver from 'archiver';
import { pipeline } from 'node:stream/promises';

class ImageController {
    // 1. Logic to convert numbers to letters (1 -> a, 2 -> b, 27 -> aa)
    static numberToLetters(n) {
        let result = "";
        while (n > 0) {
            n--;
            result = String.fromCharCode(97 + (n % 26)) + result;
            n = Math.floor(n / 26);
        }
        return result;
    }

    // 2. Logic to transform folder names (Python's transform_pattern)
    static transformPattern(s) {
        if (s.includes('--')) {
            const [before, after] = s.split('--');
            return before.toUpperCase() + '--' + after.replace(/\s/g, '-');
        } else if (s.includes('-')) {
            const [before, after] = s.split('-');
            return before.toUpperCase() + '-' + after.replace(/\s/g, '-');
        } else {
            return s.toUpperCase();
        }
    }

    static async isImageUrl(url) {
        try {
            const res = await axios.head(url, { timeout: 5000 });
            const contentType = res.headers['content-type'] || '';
            return res.status === 200 && contentType.startsWith('image');
        } catch { return false; }
    }

    static async uploadExcel(req, res) {
        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            // Replicating Python logic: join row, remove spaces/dashes, lowercase
            const codes = data.slice(1).map(row => {
                return row.filter(v => v != null)
                          .join('')
                          .replace(/[\s-]/g, '')
                          .toLowerCase();
            }).filter(c => c.length > 0);

            await fs.unlink(req.file.path); 
            res.json({ success: true, codes });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async processImages(req, res) {
        const { selectedCodes, filename } = req.body;
        const rootPath = path.join(process.cwd(), 'Images');
        
        try {
            const formatted = ImageModel.formatCodesForSql(selectedCodes);
            const rows = await ImageModel.fetchImageUrls(formatted);
            await fs.mkdir(rootPath, { recursive: true });

            const CONCURRENCY_LIMIT = 10;
            for (let i = 0; i < rows.length; i += CONCURRENCY_LIMIT) {
                const chunk = rows.slice(i, i + CONCURRENCY_LIMIT);

                await Promise.all(chunk.map(async (row) => {
                    // Apply the transform_pattern to the folder name
                    const folderName = ImageController.transformPattern(row.Code.trim());
                    const itemFolder = path.join(rootPath, folderName);
                    await fs.mkdir(itemFolder, { recursive: true });
                    
                    const urlsToDownload = [row.ImageURl];

                    // Replicating Python suffix check (a.jpg to z.jpg)
                    let consecutiveFailures = 0;
                    for (let j = 1; j <= 26; j++) {
                        const suffix = ImageController.numberToLetters(j) + ".jpg";
                        const variantUrl = row.ImageURl.replace(".jpg", "") + suffix;

                        if (await ImageController.isImageUrl(variantUrl)) {
                            urlsToDownload.push(variantUrl);
                            consecutiveFailures = 0;
                        } else {
                            consecutiveFailures++;
                            if (consecutiveFailures >= 2) break;
                        }
                    }

                    // Parallel download for the specific folder
                    await Promise.all(urlsToDownload.map(async (url) => {
                        try {
                            const imageName = path.basename(url);
                            const filePath = path.join(itemFolder, imageName);
                            const response = await axios.get(url, { responseType: 'stream' });
                            await pipeline(response.data, fsSync.createWriteStream(filePath));
                        } catch (e) {
                            console.error(`Download failed for ${url}`);
                        }
                    }));
                }));
            }

            // ZIP generation with timestamp
            const now = new Date();
            const timestamp = now.toLocaleDateString('en-GB').replace(/\//g, '-') + `_${now.getHours()}-${now.getMinutes()}`;
            const zipName = filename ? `${filename}.zip` : `AllImages_${timestamp}.zip`;
            
            const output = fsSync.createWriteStream(zipName);
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(rootPath, false);
            await archive.finalize();

            // Cleanup
            await fs.rm(rootPath, { recursive: true, force: true });
            res.json({ success: true, zipFile: zipName });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

export default ImageController;