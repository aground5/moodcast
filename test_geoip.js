
const { lookupIP } = require('./src/shared/lib/location/geoip');

async function test() {
    console.log("Testing IP: 121.129.46.138");
    try {
        const result = await lookupIP('121.129.46.138', 'ko');
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
