// splash.js
import figlet from 'figlet';
import util from 'util';

const figletPromise = util.promisify(figlet);

async function showSplash() {
    const text = "Hydro Destroyer";
    const options = {
        font: 'Slant',      // You can change font: 'Standard', 'Ghost', etc.
        horizontalLayout: 'default',
        verticalLayout: 'default'
    };

    const banner = await figletPromise(text, options);

    // Slow print each line
    for (const line of banner.split('\n')) {
        console.log(line);
        await new Promise(r => setTimeout(r, 100)); // 100ms delay per line
    }
}

export default showSplash;
