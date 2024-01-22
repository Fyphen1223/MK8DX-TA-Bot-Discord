const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}
async function getTime(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: '1N-qbsQtT4G-2kMjQRQIKoRrh0Tw4424evuK9xnSSDpo',
        range: `150cc (Meta)!F7:ZZ7`,
    });
    const rows = res.data.values;
    console.log(rows);
}

authorize().then(getTime).catch(console.error);

//7, 25,43
//1のとき7, 2の時25, 3の時43...を返すようなJSの関数を書いてください

function getTrackInt(int) {
    return 18 * int - 11;
}

function getTrackNumberOnSheet(int) {
    const row = Math.ceil(int / 4);
    return getTrackInt(row);
}
