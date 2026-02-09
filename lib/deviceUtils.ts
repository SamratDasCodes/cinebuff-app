import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    os: string;
    browser: string;
    type: string;
    lastActive: number;
    ipAddress?: string; // Optional, might need an external service or server-side prop
}

export const getDeviceInfo = (): DeviceInfo => {
    const parser = new UAParser();
    const result = parser.getResult();

    // Persistent Device ID Logic
    let deviceId = "";
    if (typeof window !== 'undefined') {
        const storedId = localStorage.getItem('device_id');
        if (storedId) {
            deviceId = storedId;
        } else {
            // Generate distinct ID for this browser instance/profile
            deviceId = `dev_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
            localStorage.setItem('device_id', deviceId);
        }
    } else {
        // Fallback for SSR (shouldn't happen in client components, but safe)
        deviceId = "server_generated_id";
    }

    // Friendly Name Construction
    const osName = result.os.name || "Unknown OS";
    const browserName = result.browser.name || "Unknown Browser";
    const deviceType = result.device.type ?
        (result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)) :
        "Desktop"; // Default to desktop if undefined (common for PCs)

    // E.g., "Chrome on Windows" or "iPhone (Mobile Safari)"
    const friendlyName = `${browserName} on ${osName}`;

    return {
        deviceId,
        deviceName: friendlyName,
        os: osName,
        browser: browserName,
        type: deviceType,
        lastActive: Date.now()
    };
};
