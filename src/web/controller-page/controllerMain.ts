import { askPermissionIfNeeded } from '../js/motion-events.js';
import { setInnerText } from '../js/dom-util.js';

let highesty: number = 0;
let lowesty: number = 0;

function motionEventHandler(e: DeviceMotionEvent) {
    if (e.acceleration === null || e.acceleration.y === null) {
        return;
    }

    if (e.acceleration.y > highesty) {
        highesty = e.acceleration.y;
    }

    if (e.acceleration.y < lowesty) {
        lowesty = e.acceleration.y;
    }

    setInnerText('currenty', e.acceleration.y.toFixed(2));
    setInnerText('highesty', highesty.toFixed(2));
    setInnerText('lowesty', lowesty.toFixed(2));

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

    // Send somehow here

    return;
}

function detectJump() {
    //TODO
    // Should somehow detect and send jump to screen
}

function firstTouch() {
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
