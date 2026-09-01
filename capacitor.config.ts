// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'comlandt.com',
//   appName: 'L&T App',
//   webDir: 'dist'
// };

// export default config;
import { CapacitorConfig } from '@capacitor/cli';
 
const config: CapacitorConfig = {
  appId: 'com.ltconstruction.app',
  appName: 'SiteSense',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'siteaense.kct.ac.in'
    ]
  }
};
 
export default config;