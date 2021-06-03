export function interpolate(start, end, t) {
    return start + t * (end - start);
}
export function interpolateColor(rgbaStart, rgbaEnd, t) {
    return rgbaStart.map((channel, i) => interpolate(channel, rgbaEnd[i], t));
}
