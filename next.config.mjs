/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: false, // 👈 DISABLING PWA IN DEVELOPMENT MODE
    workboxOptions: {
        disableDevLogs: true,

    },
    register: true,
});

export default
//  withPWA(
    {
    // Your Next.js config
    env: {
        BASE_URL: process.env.BASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        X_API_KEY: process.env.X_API_KEY,

        // maxAge: 6 * 60 * 60,// 1 Day
        // maxAge:30 * 24 * 60 * 60,// 30 day
        SECRET: "flkjgkfllkfjnge.d,mf",

        VAPID_KEY: process.env.VAPID_KEY,
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId,
        measurementId: process.env.measurementId
    },
}
// );
