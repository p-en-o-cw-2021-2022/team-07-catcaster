// Fix 'requestPermission' missing from the DOM definitions.
// eslint-disable-next-line no-var
declare var DeviceMotionEvent: DeviceMotionEvent & {
    requestPermission?: () => Promise<PermissionState>;
};

export async function askPermissionIfNeeded(): Promise< { ok: boolean, msg: string } > {
    if (typeof(DeviceMotionEvent) === 'undefined') {
        return { ok: false, msg: 'no accelerometer available (or need localhost or https)' };
    } else if (typeof(DeviceMotionEvent.requestPermission) === 'function') {
        // Note: Writing "response = await DeviceMotionEvent.requestPermission();" does not work.
        // It is statically analyzed and then throws an error if DeviceMotionEvent does not exist...
        // So we do this:
        return DeviceMotionEvent.requestPermission().then((response: PermissionState) => {
            if (response === 'denied') return { ok: false, msg: 'permission denied might need localhost or https or restart browser if you previously said no to the request' };
            return { ok: true, msg: response }; // permision could be 'granted' or 'prompt'
        }).catch((e: unknown) => {
            return { ok: false, msg: `error: ${e}; (need localhost or https)` };
        });
    } else {
        return { ok: true, msg: 'we assume it works' }; // but we only know when we get events in...
    }
}