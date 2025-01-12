import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath to convert URL to path
const __filename = fileURLToPath(import.meta.url);
import { dirname } from 'path';
const __dirname = dirname(__filename);

// Define the log file path
const logFilePath = path.join(__dirname, '..', 'resources', 'logs', 'app.log');

// Function to log messages
export function logMessage(message, serverName = 'Unknown Server') {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - [${serverName}] - ${message}\n`;

    // Ensure the logs directory exists
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Check if the log file exists
    if (!fs.existsSync(logFilePath)) {
        // Create the log file and write the initial log entry
        fs.writeFileSync(logFilePath, logEntry, 'utf8');
    } else {
        // Append the log entry to the existing log file
        fs.appendFileSync(logFilePath, logEntry, 'utf8');
    }
}