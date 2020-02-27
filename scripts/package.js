/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const { Package } = require('fabric-client');
const path = require('path');

async function main() {
    const contractPath = path.resolve(__dirname, '..');
    const packagePath = path.resolve(contractPath, 'helloworldstate@0.23.0.cds');
    if (fs.existsSync(packagePath)) {
        fs.unlinkSync(packagePath);
    }
    const pkg = await Package.fromDirectory({
        name: 'helloworldstate',
        version: '0.23.0',
        path: contractPath,
        type: 'node'
    });
    const packageBuffer = await pkg.toBuffer();
    fs.writeFileSync(packagePath, packageBuffer);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});