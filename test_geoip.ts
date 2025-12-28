
import { lookupIP } from './src/shared/lib/location/geoip';

async function test() {
    console.log("Testing IP: 121.129.46.138");
    try {
        // Mock headers or environment if needed, but lookupIP is standalone (except for MMDB path)
        const result = await lookupIP('121.129.46.138', 'ko');
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
