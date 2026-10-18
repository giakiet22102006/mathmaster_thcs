// ==============================================================================
// MathMaster THCS - Khởi động Máy chủ Mạng LAN / Wi-Fi cho nhiều máy cùng truy cập
// Chạy lệnh: npm run dev:lan
// ==============================================================================

import os from 'node:os';
import { spawn } from 'node:child_process';

function getLanAddresses(port = 3000) {
  const nets = os.networkInterfaces();
  const urls = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        urls.push({ interface: name, ip: net.address, url: `http://${net.address}:${port}` });
      }
    }
  }
  return urls;
}

const port = process.env.PORT || 3000;
const lanList = getLanAddresses(port);

console.log('======================================================================');
console.log('🌐 KHỞI ĐỘNG MATHMASTER THCS Ở CHẾ ĐỘ ĐA THIẾT BỊ (MẠNG LAN / WI-FI)');
console.log('======================================================================');
console.log(`👉 Trên máy tính hiện tại, mở: http://localhost:${port}`);
if (lanList.length > 0) {
  console.log('👉 Trên các máy tính, laptop, điện thoại khác CÙNG MẠNG WI-FI / LAN, hãy mở:');
  for (const item of lanList) {
    console.log(`   • ${item.url}   (${item.interface})`);
  }
} else {
  console.log('⚠️ Không tìm thấy kết nối mạng LAN/Wi-Fi. Vui lòng kiểm tra kết nối mạng.');
}
console.log('----------------------------------------------------------------------');
console.log('💡 Mẹo: Nếu máy khác không vào được, hãy mở Windows PowerShell (Run as Administrator)');
console.log('   và chạy lệnh sau 1 lần duy nhất để mở tường lửa cổng 3000 trên Windows:');
console.log('   netsh advfirewall firewall add rule name="MathMaster THCS Port 3000" dir=in action=allow protocol=TCP localport=3000');
console.log('======================================================================\n');

const child = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', String(port)], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => process.exit(code ?? 0));
