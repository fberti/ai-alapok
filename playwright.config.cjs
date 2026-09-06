const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
  testDir:'./tesztek/bongeszo',
  use:{baseURL:'http://127.0.0.1:48173/ai-alapok/', trace:'retain-on-failure'},
  projects:[{name:'asztali',use:{viewport:{width:1365,height:900}}},{name:'telefon',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
  webServer:{command:'python3 -m http.server 48173 --bind 127.0.0.1 --directory ..',url:'http://127.0.0.1:48173/ai-alapok/',reuseExistingServer:false}
});
