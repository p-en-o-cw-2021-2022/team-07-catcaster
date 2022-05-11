import { askPermissionIfNeeded } from '../js/motion-events.js';
import { setInnerText } from '../js/dom-util.js';

let highestacc: number = 0;
let refresher: number = 0;
let jump:boolean = false;

function motionEventHandler(e: DeviceMotionEvent) {
    if (e.acceleration === null || e.acceleration.x === null || e.acceleration.y === null || e.acceleration.z === null) {
        return;
    }
    const avgacc = Math.sqrt(e.acceleration.x**2+e.acceleration.y**2+e.acceleration.z**2);
    if (avgacc > highestacc) {
        highestacc = avgacc;
    }

    setInnerText('currenty', avgacc.toFixed(2));
    setInnerText('highesty', highestacc.toFixed(2));
    //setInnerText('lowesty', lowesty.toFixed(2));

    return;
}

function orientationEventHandler(e: DeviceOrientationEvent) {
    if (e.gamma === null || e.beta === null) {
        return;
    }
    sendControllerInput(e.gamma, e.beta);
    detectJump(); // TODO: Needs logic to be added
    return;
}

function sendControllerInput(gamma: number, beta: number) {
    //TODO
    // Should send the controller input over the P2P connection to the screen

    setInnerText('gamma', gamma);
    setInnerText('beta', beta);
    setInnerText('gyro-data', `${beta.toFixed(2)} ${gamma.toFixed(2)}`);
    // Send somehow here

    return;
}

/*
Checkes whether the jump flag should be true. Every 10 frames resets lowesty and highesty.
 */
function detectJump() {
    // Thresholds for jump flag are 50 and -50
    if (highestacc > 25) {
        jump = true;
    }
    refresher++;
    if (refresher === 10) { // The frame count at which it refreshes
        refresher = 0;
        highestacc = 0;
        jump = false;
    }

    setInnerText('jump', jump);
}

function firstTouch() {
    const touch = document.getElementById('touch');
    touch!.hidden = true;
    window.removeEventListener('touchend', firstTouch);
    // note the 'void' ignores the promise result here...
    void askPermissionIfNeeded().then(v => {
        const { ok, msg } = v;
        setInnerText('dm_status', msg);
        if (ok) {
            window.addEventListener('deviceorientation', orientationEventHandler);
            window.addEventListener('devicemotion', motionEventHandler);
        }
    });
}

window.addEventListener('touchend', firstTouch);
