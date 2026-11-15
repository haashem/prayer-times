// Time-based circular smoothing: take the short path across north.
export function smoothHeading(previous, heading, elapsedMs) {
    if (previous === null) return heading;
    const delta = ((heading - previous + 540) % 360) - 180;
    const blend = 1 - Math.exp(-Math.max(0, elapsedMs) / 120);
    return (previous + delta * blend + 360) % 360;
}

// Enter within 5 degrees; leave at 8 to avoid sensor jitter toggling feedback.
export function isQiblaAligned(difference, wasAligned) {
    return difference < (wasAligned ? 8 : 5);
}
