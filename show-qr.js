const qrcode = require('qrcode-terminal');

const localIP = '10.0.0.185';
const port = '8081';
const expoUrl = `exp://${localIP}:${port}`;

console.log('\n=================================================');
console.log('🎢 Disney Wait Times App - Connection Info');
console.log('=================================================\n');

console.log('📱 For Expo Go App:');
console.log(`   URL: ${expoUrl}`);
console.log('\n   Or scan this QR code:\n');

qrcode.generate(expoUrl, { small: true }, function(qrcode) {
    console.log(qrcode);
});

console.log('\n💻 For Web Browser:');
console.log(`   URL: http://localhost:${port}`);

console.log('\n📝 Debug Logs:');
console.log('   - Check browser console at http://localhost:8081');
console.log('   - Check terminal for [DEBUG] messages');

console.log('\n⚡ Connection Methods:');
console.log('   1. Type the exp:// URL in Expo Go app');
console.log('   2. Scan the QR code with Expo Go');
console.log('   3. Make sure your phone is on the same WiFi');

console.log('\n=================================================\n');