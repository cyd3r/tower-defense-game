export function interpolate(start: number, end: number, t: number) {
    return start + t * (end - start);
}
export function interpolateColor(rgbaStart: number[], rgbaEnd: number[], t: number) {
    return rgbaStart.map((channel, i) => interpolate(channel, rgbaEnd[i], t));
}
