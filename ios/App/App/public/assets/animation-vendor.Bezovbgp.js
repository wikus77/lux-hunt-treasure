import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { r as reactExports, d as getDefaultExportFromCjs, e as commonjsGlobal, c as React } from './react-vendor.CAU3V3le.js';

const LayoutGroupContext = reactExports.createContext({});

/**
 * Creates a constant value over the lifecycle of a component.
 *
 * Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
 * a guarantee that it won't re-run for performance reasons later on. By using `useConstant`
 * you can ensure that initialisers don't execute twice or more.
 */
function useConstant(init) {
    const ref = reactExports.useRef(null);
    if (ref.current === null) {
        ref.current = init();
    }
    return ref.current;
}

const isBrowser = typeof window !== "undefined";

const useIsomorphicLayoutEffect = isBrowser ? reactExports.useLayoutEffect : reactExports.useEffect;

/**
 * @public
 */
const PresenceContext = 
/* @__PURE__ */ reactExports.createContext(null);

function addUniqueItem(arr, item) {
    if (arr.indexOf(item) === -1)
        arr.push(item);
}
function removeItem(arr, item) {
    const index = arr.indexOf(item);
    if (index > -1)
        arr.splice(index, 1);
}

const clamp = (min, max, v) => {
    if (v > max)
        return max;
    if (v < min)
        return min;
    return v;
};

let invariant = () => {
};

const MotionGlobalConfig = {};

/**
 * Check if value is a numerical string, ie a string that is purely a number eg "100" or "-100.1"
 */
const isNumericalString = (v) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(v);

function isObject(value) {
    return typeof value === "object" && value !== null;
}

/**
 * Check if the value is a zero value string like "0px" or "0%"
 */
const isZeroValueString = (v) => /^0[^.\s]+$/u.test(v);

/*#__NO_SIDE_EFFECTS__*/
function memo(callback) {
    let result;
    return () => {
        if (result === undefined)
            result = callback();
        return result;
    };
}

/*#__NO_SIDE_EFFECTS__*/
const noop = (any) => any;

/**
 * Pipe
 * Compose other transformers to run linearily
 * pipe(min(20), max(40))
 * @param  {...functions} transformers
 * @return {function}
 */
const combineFunctions = (a, b) => (v) => b(a(v));
const pipe = (...transformers) => transformers.reduce(combineFunctions);

/*
  Progress within given range

  Given a lower limit and an upper limit, we return the progress
  (expressed as a number 0-1) represented by the given value, and
  limit that progress to within 0-1.

  @param [number]: Lower limit
  @param [number]: Upper limit
  @param [number]: Value to find progress within given range
  @return [number]: Progress of value within range as expressed 0-1
*/
/*#__NO_SIDE_EFFECTS__*/
const progress = (from, to, value) => {
    const toFromDifference = to - from;
    return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
};

class SubscriptionManager {
    constructor() {
        this.subscriptions = [];
    }
    add(handler) {
        addUniqueItem(this.subscriptions, handler);
        return () => removeItem(this.subscriptions, handler);
    }
    notify(a, b, c) {
        const numSubscriptions = this.subscriptions.length;
        if (!numSubscriptions)
            return;
        if (numSubscriptions === 1) {
            /**
             * If there's only a single handler we can just call it without invoking a loop.
             */
            this.subscriptions[0](a, b, c);
        }
        else {
            for (let i = 0; i < numSubscriptions; i++) {
                /**
                 * Check whether the handler exists before firing as it's possible
                 * the subscriptions were modified during this loop running.
                 */
                const handler = this.subscriptions[i];
                handler && handler(a, b, c);
            }
        }
    }
    getSize() {
        return this.subscriptions.length;
    }
    clear() {
        this.subscriptions.length = 0;
    }
}

/**
 * Converts seconds to milliseconds
 *
 * @param seconds - Time in seconds.
 * @return milliseconds - Converted time in milliseconds.
 */
/*#__NO_SIDE_EFFECTS__*/
const secondsToMilliseconds = (seconds) => seconds * 1000;
/*#__NO_SIDE_EFFECTS__*/
const millisecondsToSeconds = (milliseconds) => milliseconds / 1000;

/*
  Convert velocity into velocity per second

  @param [number]: Unit per frame
  @param [number]: Frame duration in ms
*/
function velocityPerSecond(velocity, frameDuration) {
    return frameDuration ? velocity * (1000 / frameDuration) : 0;
}

/*
  Bezier function generator
  This has been modified from Gaëtan Renaudeau's BezierEasing
  https://github.com/gre/bezier-easing/blob/master/src/index.js
  https://github.com/gre/bezier-easing/blob/master/LICENSE
  
  I've removed the newtonRaphsonIterate algo because in benchmarking it
  wasn't noticeably faster than binarySubdivision, indeed removing it
  usually improved times, depending on the curve.
  I also removed the lookup table, as for the added bundle size and loop we're
  only cutting ~4 or so subdivision iterations. I bumped the max iterations up
  to 12 to compensate and this still tended to be faster for no perceivable
  loss in accuracy.
  Usage
    const easeOut = cubicBezier(.17,.67,.83,.67);
    const x = easeOut(0.5); // returns 0.627...
*/
// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
const calcBezier = (t, a1, a2) => (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) *
    t;
const subdivisionPrecision = 0.0000001;
const subdivisionMaxIterations = 12;
function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
    let currentX;
    let currentT;
    let i = 0;
    do {
        currentT = lowerBound + (upperBound - lowerBound) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - x;
        if (currentX > 0.0) {
            upperBound = currentT;
        }
        else {
            lowerBound = currentT;
        }
    } while (Math.abs(currentX) > subdivisionPrecision &&
        ++i < subdivisionMaxIterations);
    return currentT;
}
function cubicBezier(mX1, mY1, mX2, mY2) {
    // If this is a linear gradient, return linear easing
    if (mX1 === mY1 && mX2 === mY2)
        return noop;
    const getTForX = (aX) => binarySubdivide(aX, 0, 1, mX1, mX2);
    // If animation is at start/end, return t without easing
    return (t) => t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
}

// Accepts an easing function and returns a new one that outputs mirrored values for
// the second half of the animation. Turns easeIn into easeInOut.
const mirrorEasing = (easing) => (p) => p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;

// Accepts an easing function and returns a new one that outputs reversed values.
// Turns easeIn into easeOut.
const reverseEasing = (easing) => (p) => 1 - easing(1 - p);

const backOut = /*@__PURE__*/ cubicBezier(0.33, 1.53, 0.69, 0.99);
const backIn = /*@__PURE__*/ reverseEasing(backOut);
const backInOut = /*@__PURE__*/ mirrorEasing(backIn);

const anticipate = (p) => (p *= 2) < 1 ? 0.5 * backIn(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));

const circIn = (p) => 1 - Math.sin(Math.acos(p));
const circOut = reverseEasing(circIn);
const circInOut = mirrorEasing(circIn);

const easeIn = /*@__PURE__*/ cubicBezier(0.42, 0, 1, 1);
const easeOut = /*@__PURE__*/ cubicBezier(0, 0, 0.58, 1);
const easeInOut = /*@__PURE__*/ cubicBezier(0.42, 0, 0.58, 1);

const isEasingArray = (ease) => {
    return Array.isArray(ease) && typeof ease[0] !== "number";
};

const isBezierDefinition = (easing) => Array.isArray(easing) && typeof easing[0] === "number";

const easingLookup = {
    linear: noop,
    easeIn,
    easeInOut,
    easeOut,
    circIn,
    circInOut,
    circOut,
    backIn,
    backInOut,
    backOut,
    anticipate,
};
const isValidEasing = (easing) => {
    return typeof easing === "string";
};
const easingDefinitionToFunction = (definition) => {
    if (isBezierDefinition(definition)) {
        // If cubic bezier definition, create bezier curve
        invariant(definition.length === 4);
        const [x1, y1, x2, y2] = definition;
        return cubicBezier(x1, y1, x2, y2);
    }
    else if (isValidEasing(definition)) {
        return easingLookup[definition];
    }
    return definition;
};

const stepsOrder = [
    "setup", // Compute
    "read", // Read
    "resolveKeyframes", // Write/Read/Write/Read
    "preUpdate", // Compute
    "update", // Compute
    "preRender", // Compute
    "render", // Write
    "postRender", // Compute
];

function createRenderStep(runNextFrame, stepName) {
    /**
     * We create and reuse two queues, one to queue jobs for the current frame
     * and one for the next. We reuse to avoid triggering GC after x frames.
     */
    let thisFrame = new Set();
    let nextFrame = new Set();
    /**
     * Track whether we're currently processing jobs in this step. This way
     * we can decide whether to schedule new jobs for this frame or next.
     */
    let isProcessing = false;
    let flushNextFrame = false;
    /**
     * A set of processes which were marked keepAlive when scheduled.
     */
    const toKeepAlive = new WeakSet();
    let latestFrameData = {
        delta: 0.0,
        timestamp: 0.0,
        isProcessing: false,
    };
    function triggerCallback(callback) {
        if (toKeepAlive.has(callback)) {
            step.schedule(callback);
            runNextFrame();
        }
        callback(latestFrameData);
    }
    const step = {
        /**
         * Schedule a process to run on the next frame.
         */
        schedule: (callback, keepAlive = false, immediate = false) => {
            const addToCurrentFrame = immediate && isProcessing;
            const queue = addToCurrentFrame ? thisFrame : nextFrame;
            if (keepAlive)
                toKeepAlive.add(callback);
            if (!queue.has(callback))
                queue.add(callback);
            return callback;
        },
        /**
         * Cancel the provided callback from running on the next frame.
         */
        cancel: (callback) => {
            nextFrame.delete(callback);
            toKeepAlive.delete(callback);
        },
        /**
         * Execute all schedule callbacks.
         */
        process: (frameData) => {
            latestFrameData = frameData;
            /**
             * If we're already processing we've probably been triggered by a flushSync
             * inside an existing process. Instead of executing, mark flushNextFrame
             * as true and ensure we flush the following frame at the end of this one.
             */
            if (isProcessing) {
                flushNextFrame = true;
                return;
            }
            isProcessing = true;
            [thisFrame, nextFrame] = [nextFrame, thisFrame];
            // Execute this frame
            thisFrame.forEach(triggerCallback);
            // Clear the frame so no callbacks remain. This is to avoid
            // memory leaks should this render step not run for a while.
            thisFrame.clear();
            isProcessing = false;
            if (flushNextFrame) {
                flushNextFrame = false;
                step.process(frameData);
            }
        },
    };
    return step;
}

const maxElapsed = 40;
function createRenderBatcher(scheduleNextBatch, allowKeepAlive) {
    let runNextFrame = false;
    let useDefaultElapsed = true;
    const state = {
        delta: 0.0,
        timestamp: 0.0,
        isProcessing: false,
    };
    const flagRunNextFrame = () => (runNextFrame = true);
    const steps = stepsOrder.reduce((acc, key) => {
        acc[key] = createRenderStep(flagRunNextFrame);
        return acc;
    }, {});
    const { setup, read, resolveKeyframes, preUpdate, update, preRender, render, postRender, } = steps;
    const processBatch = () => {
        const timestamp = MotionGlobalConfig.useManualTiming
            ? state.timestamp
            : performance.now();
        runNextFrame = false;
        if (!MotionGlobalConfig.useManualTiming) {
            state.delta = useDefaultElapsed
                ? 1000 / 60
                : Math.max(Math.min(timestamp - state.timestamp, maxElapsed), 1);
        }
        state.timestamp = timestamp;
        state.isProcessing = true;
        // Unrolled render loop for better per-frame performance
        setup.process(state);
        read.process(state);
        resolveKeyframes.process(state);
        preUpdate.process(state);
        update.process(state);
        preRender.process(state);
        render.process(state);
        postRender.process(state);
        state.isProcessing = false;
        if (runNextFrame && allowKeepAlive) {
            useDefaultElapsed = false;
            scheduleNextBatch(processBatch);
        }
    };
    const wake = () => {
        runNextFrame = true;
        useDefaultElapsed = true;
        if (!state.isProcessing) {
            scheduleNextBatch(processBatch);
        }
    };
    const schedule = stepsOrder.reduce((acc, key) => {
        const step = steps[key];
        acc[key] = (process, keepAlive = false, immediate = false) => {
            if (!runNextFrame)
                wake();
            return step.schedule(process, keepAlive, immediate);
        };
        return acc;
    }, {});
    const cancel = (process) => {
        for (let i = 0; i < stepsOrder.length; i++) {
            steps[stepsOrder[i]].cancel(process);
        }
    };
    return { schedule, cancel, state, steps };
}

const { schedule: frame, cancel: cancelFrame, state: frameData, steps: frameSteps, } = /* @__PURE__ */ createRenderBatcher(typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : noop, true);

let now;
function clearTime() {
    now = undefined;
}
/**
 * An eventloop-synchronous alternative to performance.now().
 *
 * Ensures that time measurements remain consistent within a synchronous context.
 * Usually calling performance.now() twice within the same synchronous context
 * will return different values which isn't useful for animations when we're usually
 * trying to sync animations to the same frame.
 */
const time = {
    now: () => {
        if (now === undefined) {
            time.set(frameData.isProcessing || MotionGlobalConfig.useManualTiming
                ? frameData.timestamp
                : performance.now());
        }
        return now;
    },
    set: (newTime) => {
        now = newTime;
        queueMicrotask(clearTime);
    },
};

const checkStringStartsWith = (token) => (key) => typeof key === "string" && key.startsWith(token);
const isCSSVariableName = 
/*@__PURE__*/ checkStringStartsWith("--");
const startsAsVariableToken = 
/*@__PURE__*/ checkStringStartsWith("var(--");
const isCSSVariableToken = (value) => {
    const startsWithToken = startsAsVariableToken(value);
    if (!startsWithToken)
        return false;
    // Ensure any comments are stripped from the value as this can harm performance of the regex.
    return singleCssVariableRegex.test(value.split("/*")[0].trim());
};
const singleCssVariableRegex = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;

const number = {
    test: (v) => typeof v === "number",
    parse: parseFloat,
    transform: (v) => v,
};
const alpha = {
    ...number,
    transform: (v) => clamp(0, 1, v),
};
const scale = {
    ...number,
    default: 1,
};

// If this number is a decimal, make it just five decimal places
// to avoid exponents
const sanitize = (v) => Math.round(v * 100000) / 100000;

const floatRegex = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;

function isNullish(v) {
    return v == null;
}

const singleColorRegex = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;

/**
 * Returns true if the provided string is a color, ie rgba(0,0,0,0) or #000,
 * but false if a number or multiple colors
 */
const isColorString = (type, testProp) => (v) => {
    return Boolean((typeof v === "string" &&
        singleColorRegex.test(v) &&
        v.startsWith(type)) ||
        (testProp &&
            !isNullish(v) &&
            Object.prototype.hasOwnProperty.call(v, testProp)));
};
const splitColor = (aName, bName, cName) => (v) => {
    if (typeof v !== "string")
        return v;
    const [a, b, c, alpha] = v.match(floatRegex);
    return {
        [aName]: parseFloat(a),
        [bName]: parseFloat(b),
        [cName]: parseFloat(c),
        alpha: alpha !== undefined ? parseFloat(alpha) : 1,
    };
};

const clampRgbUnit = (v) => clamp(0, 255, v);
const rgbUnit = {
    ...number,
    transform: (v) => Math.round(clampRgbUnit(v)),
};
const rgba = {
    test: /*@__PURE__*/ isColorString("rgb", "red"),
    parse: /*@__PURE__*/ splitColor("red", "green", "blue"),
    transform: ({ red, green, blue, alpha: alpha$1 = 1 }) => "rgba(" +
        rgbUnit.transform(red) +
        ", " +
        rgbUnit.transform(green) +
        ", " +
        rgbUnit.transform(blue) +
        ", " +
        sanitize(alpha.transform(alpha$1)) +
        ")",
};

function parseHex(v) {
    let r = "";
    let g = "";
    let b = "";
    let a = "";
    // If we have 6 characters, ie #FF0000
    if (v.length > 5) {
        r = v.substring(1, 3);
        g = v.substring(3, 5);
        b = v.substring(5, 7);
        a = v.substring(7, 9);
        // Or we have 3 characters, ie #F00
    }
    else {
        r = v.substring(1, 2);
        g = v.substring(2, 3);
        b = v.substring(3, 4);
        a = v.substring(4, 5);
        r += r;
        g += g;
        b += b;
        a += a;
    }
    return {
        red: parseInt(r, 16),
        green: parseInt(g, 16),
        blue: parseInt(b, 16),
        alpha: a ? parseInt(a, 16) / 255 : 1,
    };
}
const hex = {
    test: /*@__PURE__*/ isColorString("#"),
    parse: parseHex,
    transform: rgba.transform,
};

/*#__NO_SIDE_EFFECTS__*/
const createUnitType = (unit) => ({
    test: (v) => typeof v === "string" && v.endsWith(unit) && v.split(" ").length === 1,
    parse: parseFloat,
    transform: (v) => `${v}${unit}`,
});
const degrees = /*@__PURE__*/ createUnitType("deg");
const percent = /*@__PURE__*/ createUnitType("%");
const px = /*@__PURE__*/ createUnitType("px");
const vh = /*@__PURE__*/ createUnitType("vh");
const vw = /*@__PURE__*/ createUnitType("vw");
const progressPercentage = /*@__PURE__*/ (() => ({
    ...percent,
    parse: (v) => percent.parse(v) / 100,
    transform: (v) => percent.transform(v * 100),
}))();

const hsla = {
    test: /*@__PURE__*/ isColorString("hsl", "hue"),
    parse: /*@__PURE__*/ splitColor("hue", "saturation", "lightness"),
    transform: ({ hue, saturation, lightness, alpha: alpha$1 = 1 }) => {
        return ("hsla(" +
            Math.round(hue) +
            ", " +
            percent.transform(sanitize(saturation)) +
            ", " +
            percent.transform(sanitize(lightness)) +
            ", " +
            sanitize(alpha.transform(alpha$1)) +
            ")");
    },
};

const color = {
    test: (v) => rgba.test(v) || hex.test(v) || hsla.test(v),
    parse: (v) => {
        if (rgba.test(v)) {
            return rgba.parse(v);
        }
        else if (hsla.test(v)) {
            return hsla.parse(v);
        }
        else {
            return hex.parse(v);
        }
    },
    transform: (v) => {
        return typeof v === "string"
            ? v
            : v.hasOwnProperty("red")
                ? rgba.transform(v)
                : hsla.transform(v);
    },
    getAnimatableNone: (v) => {
        const parsed = color.parse(v);
        parsed.alpha = 0;
        return color.transform(parsed);
    },
};

const colorRegex = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;

function test(v) {
    return (isNaN(v) &&
        typeof v === "string" &&
        (v.match(floatRegex)?.length || 0) +
            (v.match(colorRegex)?.length || 0) >
            0);
}
const NUMBER_TOKEN = "number";
const COLOR_TOKEN = "color";
const VAR_TOKEN = "var";
const VAR_FUNCTION_TOKEN = "var(";
const SPLIT_TOKEN = "${}";
// this regex consists of the `singleCssVariableRegex|rgbHSLValueRegex|digitRegex`
const complexRegex = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function analyseComplexValue(value) {
    const originalValue = value.toString();
    const values = [];
    const indexes = {
        color: [],
        number: [],
        var: [],
    };
    const types = [];
    let i = 0;
    const tokenised = originalValue.replace(complexRegex, (parsedValue) => {
        if (color.test(parsedValue)) {
            indexes.color.push(i);
            types.push(COLOR_TOKEN);
            values.push(color.parse(parsedValue));
        }
        else if (parsedValue.startsWith(VAR_FUNCTION_TOKEN)) {
            indexes.var.push(i);
            types.push(VAR_TOKEN);
            values.push(parsedValue);
        }
        else {
            indexes.number.push(i);
            types.push(NUMBER_TOKEN);
            values.push(parseFloat(parsedValue));
        }
        ++i;
        return SPLIT_TOKEN;
    });
    const split = tokenised.split(SPLIT_TOKEN);
    return { values, split, indexes, types };
}
function parseComplexValue(v) {
    return analyseComplexValue(v).values;
}
function createTransformer(source) {
    const { split, types } = analyseComplexValue(source);
    const numSections = split.length;
    return (v) => {
        let output = "";
        for (let i = 0; i < numSections; i++) {
            output += split[i];
            if (v[i] !== undefined) {
                const type = types[i];
                if (type === NUMBER_TOKEN) {
                    output += sanitize(v[i]);
                }
                else if (type === COLOR_TOKEN) {
                    output += color.transform(v[i]);
                }
                else {
                    output += v[i];
                }
            }
        }
        return output;
    };
}
const convertNumbersToZero = (v) => typeof v === "number" ? 0 : color.test(v) ? color.getAnimatableNone(v) : v;
function getAnimatableNone$1(v) {
    const parsed = parseComplexValue(v);
    const transformer = createTransformer(v);
    return transformer(parsed.map(convertNumbersToZero));
}
const complex = {
    test,
    parse: parseComplexValue,
    createTransformer,
    getAnimatableNone: getAnimatableNone$1,
};

// Adapted from https://gist.github.com/mjackson/5311256
function hueToRgb(p, q, t) {
    if (t < 0)
        t += 1;
    if (t > 1)
        t -= 1;
    if (t < 1 / 6)
        return p + (q - p) * 6 * t;
    if (t < 1 / 2)
        return q;
    if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
function hslaToRgba({ hue, saturation, lightness, alpha }) {
    hue /= 360;
    saturation /= 100;
    lightness /= 100;
    let red = 0;
    let green = 0;
    let blue = 0;
    if (!saturation) {
        red = green = blue = lightness;
    }
    else {
        const q = lightness < 0.5
            ? lightness * (1 + saturation)
            : lightness + saturation - lightness * saturation;
        const p = 2 * lightness - q;
        red = hueToRgb(p, q, hue + 1 / 3);
        green = hueToRgb(p, q, hue);
        blue = hueToRgb(p, q, hue - 1 / 3);
    }
    return {
        red: Math.round(red * 255),
        green: Math.round(green * 255),
        blue: Math.round(blue * 255),
        alpha,
    };
}

function mixImmediate(a, b) {
    return (p) => (p > 0 ? b : a);
}

/*
  Value in range from progress

  Given a lower limit and an upper limit, we return the value within
  that range as expressed by progress (usually a number from 0 to 1)

  So progress = 0.5 would change

  from -------- to

  to

  from ---- to

  E.g. from = 10, to = 20, progress = 0.5 => 15

  @param [number]: Lower limit of range
  @param [number]: Upper limit of range
  @param [number]: The progress between lower and upper limits expressed 0-1
  @return [number]: Value as calculated from progress within range (not limited within range)
*/
const mixNumber$1 = (from, to, progress) => {
    return from + (to - from) * progress;
};

// Linear color space blending
// Explained https://www.youtube.com/watch?v=LKnqECcg6Gw
// Demonstrated http://codepen.io/osublake/pen/xGVVaN
const mixLinearColor = (from, to, v) => {
    const fromExpo = from * from;
    const expo = v * (to * to - fromExpo) + fromExpo;
    return expo < 0 ? 0 : Math.sqrt(expo);
};
const colorTypes = [hex, rgba, hsla];
const getColorType = (v) => colorTypes.find((type) => type.test(v));
function asRGBA(color) {
    const type = getColorType(color);
    if (!Boolean(type))
        return false;
    let model = type.parse(color);
    if (type === hsla) {
        // TODO Remove this cast - needed since Motion's stricter typing
        model = hslaToRgba(model);
    }
    return model;
}
const mixColor = (from, to) => {
    const fromRGBA = asRGBA(from);
    const toRGBA = asRGBA(to);
    if (!fromRGBA || !toRGBA) {
        return mixImmediate(from, to);
    }
    const blended = { ...fromRGBA };
    return (v) => {
        blended.red = mixLinearColor(fromRGBA.red, toRGBA.red, v);
        blended.green = mixLinearColor(fromRGBA.green, toRGBA.green, v);
        blended.blue = mixLinearColor(fromRGBA.blue, toRGBA.blue, v);
        blended.alpha = mixNumber$1(fromRGBA.alpha, toRGBA.alpha, v);
        return rgba.transform(blended);
    };
};

const invisibleValues = new Set(["none", "hidden"]);
/**
 * Returns a function that, when provided a progress value between 0 and 1,
 * will return the "none" or "hidden" string only when the progress is that of
 * the origin or target.
 */
function mixVisibility(origin, target) {
    if (invisibleValues.has(origin)) {
        return (p) => (p <= 0 ? origin : target);
    }
    else {
        return (p) => (p >= 1 ? target : origin);
    }
}

function mixNumber(a, b) {
    return (p) => mixNumber$1(a, b, p);
}
function getMixer(a) {
    if (typeof a === "number") {
        return mixNumber;
    }
    else if (typeof a === "string") {
        return isCSSVariableToken(a)
            ? mixImmediate
            : color.test(a)
                ? mixColor
                : mixComplex;
    }
    else if (Array.isArray(a)) {
        return mixArray;
    }
    else if (typeof a === "object") {
        return color.test(a) ? mixColor : mixObject;
    }
    return mixImmediate;
}
function mixArray(a, b) {
    const output = [...a];
    const numValues = output.length;
    const blendValue = a.map((v, i) => getMixer(v)(v, b[i]));
    return (p) => {
        for (let i = 0; i < numValues; i++) {
            output[i] = blendValue[i](p);
        }
        return output;
    };
}
function mixObject(a, b) {
    const output = { ...a, ...b };
    const blendValue = {};
    for (const key in output) {
        if (a[key] !== undefined && b[key] !== undefined) {
            blendValue[key] = getMixer(a[key])(a[key], b[key]);
        }
    }
    return (v) => {
        for (const key in blendValue) {
            output[key] = blendValue[key](v);
        }
        return output;
    };
}
function matchOrder(origin, target) {
    const orderedOrigin = [];
    const pointers = { color: 0, var: 0, number: 0 };
    for (let i = 0; i < target.values.length; i++) {
        const type = target.types[i];
        const originIndex = origin.indexes[type][pointers[type]];
        const originValue = origin.values[originIndex] ?? 0;
        orderedOrigin[i] = originValue;
        pointers[type]++;
    }
    return orderedOrigin;
}
const mixComplex = (origin, target) => {
    const template = complex.createTransformer(target);
    const originStats = analyseComplexValue(origin);
    const targetStats = analyseComplexValue(target);
    const canInterpolate = originStats.indexes.var.length === targetStats.indexes.var.length &&
        originStats.indexes.color.length === targetStats.indexes.color.length &&
        originStats.indexes.number.length >= targetStats.indexes.number.length;
    if (canInterpolate) {
        if ((invisibleValues.has(origin) &&
            !targetStats.values.length) ||
            (invisibleValues.has(target) &&
                !originStats.values.length)) {
            return mixVisibility(origin, target);
        }
        return pipe(mixArray(matchOrder(originStats, targetStats), targetStats.values), template);
    }
    else {
        return mixImmediate(origin, target);
    }
};

function mix(from, to, p) {
    if (typeof from === "number" &&
        typeof to === "number" &&
        typeof p === "number") {
        return mixNumber$1(from, to, p);
    }
    const mixer = getMixer(from);
    return mixer(from, to);
}

const frameloopDriver = (update) => {
    const passTimestamp = ({ timestamp }) => update(timestamp);
    return {
        start: (keepAlive = true) => frame.update(passTimestamp, keepAlive),
        stop: () => cancelFrame(passTimestamp),
        /**
         * If we're processing this frame we can use the
         * framelocked timestamp to keep things in sync.
         */
        now: () => (frameData.isProcessing ? frameData.timestamp : time.now()),
    };
};

const generateLinearEasing = (easing, duration, // as milliseconds
resolution = 10 // as milliseconds
) => {
    let points = "";
    const numPoints = Math.max(Math.round(duration / resolution), 2);
    for (let i = 0; i < numPoints; i++) {
        points += Math.round(easing(i / (numPoints - 1)) * 10000) / 10000 + ", ";
    }
    return `linear(${points.substring(0, points.length - 2)})`;
};

/**
 * Implement a practical max duration for keyframe generation
 * to prevent infinite loops
 */
const maxGeneratorDuration = 20000;
function calcGeneratorDuration(generator) {
    let duration = 0;
    const timeStep = 50;
    let state = generator.next(duration);
    while (!state.done && duration < maxGeneratorDuration) {
        duration += timeStep;
        state = generator.next(duration);
    }
    return duration >= maxGeneratorDuration ? Infinity : duration;
}

/**
 * Create a progress => progress easing function from a generator.
 */
function createGeneratorEasing(options, scale = 100, createGenerator) {
    const generator = createGenerator({ ...options, keyframes: [0, scale] });
    const duration = Math.min(calcGeneratorDuration(generator), maxGeneratorDuration);
    return {
        type: "keyframes",
        ease: (progress) => {
            return generator.next(duration * progress).value / scale;
        },
        duration: millisecondsToSeconds(duration),
    };
}

const velocitySampleDuration = 5; // ms
function calcGeneratorVelocity(resolveValue, t, current) {
    const prevT = Math.max(t - velocitySampleDuration, 0);
    return velocityPerSecond(current - resolveValue(prevT), t - prevT);
}

const springDefaults = {
    // Default spring physics
    stiffness: 100,
    damping: 10,
    mass: 1.0,
    velocity: 0.0,
    // Default duration/bounce-based options
    duration: 800, // in ms
    bounce: 0.3,
    visualDuration: 0.3, // in seconds
    // Rest thresholds
    restSpeed: {
        granular: 0.01,
        default: 2,
    },
    restDelta: {
        granular: 0.005,
        default: 0.5,
    },
    // Limits
    minDuration: 0.01, // in seconds
    maxDuration: 10.0, // in seconds
    minDamping: 0.05,
    maxDamping: 1,
};

const safeMin = 0.001;
function findSpring({ duration = springDefaults.duration, bounce = springDefaults.bounce, velocity = springDefaults.velocity, mass = springDefaults.mass, }) {
    let envelope;
    let derivative;
    let dampingRatio = 1 - bounce;
    /**
     * Restrict dampingRatio and duration to within acceptable ranges.
     */
    dampingRatio = clamp(springDefaults.minDamping, springDefaults.maxDamping, dampingRatio);
    duration = clamp(springDefaults.minDuration, springDefaults.maxDuration, millisecondsToSeconds(duration));
    if (dampingRatio < 1) {
        /**
         * Underdamped spring
         */
        envelope = (undampedFreq) => {
            const exponentialDecay = undampedFreq * dampingRatio;
            const delta = exponentialDecay * duration;
            const a = exponentialDecay - velocity;
            const b = calcAngularFreq(undampedFreq, dampingRatio);
            const c = Math.exp(-delta);
            return safeMin - (a / b) * c;
        };
        derivative = (undampedFreq) => {
            const exponentialDecay = undampedFreq * dampingRatio;
            const delta = exponentialDecay * duration;
            const d = delta * velocity + velocity;
            const e = Math.pow(dampingRatio, 2) * Math.pow(undampedFreq, 2) * duration;
            const f = Math.exp(-delta);
            const g = calcAngularFreq(Math.pow(undampedFreq, 2), dampingRatio);
            const factor = -envelope(undampedFreq) + safeMin > 0 ? -1 : 1;
            return (factor * ((d - e) * f)) / g;
        };
    }
    else {
        /**
         * Critically-damped spring
         */
        envelope = (undampedFreq) => {
            const a = Math.exp(-undampedFreq * duration);
            const b = (undampedFreq - velocity) * duration + 1;
            return -safeMin + a * b;
        };
        derivative = (undampedFreq) => {
            const a = Math.exp(-undampedFreq * duration);
            const b = (velocity - undampedFreq) * (duration * duration);
            return a * b;
        };
    }
    const initialGuess = 5 / duration;
    const undampedFreq = approximateRoot(envelope, derivative, initialGuess);
    duration = secondsToMilliseconds(duration);
    if (isNaN(undampedFreq)) {
        return {
            stiffness: springDefaults.stiffness,
            damping: springDefaults.damping,
            duration,
        };
    }
    else {
        const stiffness = Math.pow(undampedFreq, 2) * mass;
        return {
            stiffness,
            damping: dampingRatio * 2 * Math.sqrt(mass * stiffness),
            duration,
        };
    }
}
const rootIterations = 12;
function approximateRoot(envelope, derivative, initialGuess) {
    let result = initialGuess;
    for (let i = 1; i < rootIterations; i++) {
        result = result - envelope(result) / derivative(result);
    }
    return result;
}
function calcAngularFreq(undampedFreq, dampingRatio) {
    return undampedFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
}

const durationKeys = ["duration", "bounce"];
const physicsKeys = ["stiffness", "damping", "mass"];
function isSpringType(options, keys) {
    return keys.some((key) => options[key] !== undefined);
}
function getSpringOptions(options) {
    let springOptions = {
        velocity: springDefaults.velocity,
        stiffness: springDefaults.stiffness,
        damping: springDefaults.damping,
        mass: springDefaults.mass,
        isResolvedFromDuration: false,
        ...options,
    };
    // stiffness/damping/mass overrides duration/bounce
    if (!isSpringType(options, physicsKeys) &&
        isSpringType(options, durationKeys)) {
        if (options.visualDuration) {
            const visualDuration = options.visualDuration;
            const root = (2 * Math.PI) / (visualDuration * 1.2);
            const stiffness = root * root;
            const damping = 2 *
                clamp(0.05, 1, 1 - (options.bounce || 0)) *
                Math.sqrt(stiffness);
            springOptions = {
                ...springOptions,
                mass: springDefaults.mass,
                stiffness,
                damping,
            };
        }
        else {
            const derived = findSpring(options);
            springOptions = {
                ...springOptions,
                ...derived,
                mass: springDefaults.mass,
            };
            springOptions.isResolvedFromDuration = true;
        }
    }
    return springOptions;
}
function spring(optionsOrVisualDuration = springDefaults.visualDuration, bounce = springDefaults.bounce) {
    const options = typeof optionsOrVisualDuration !== "object"
        ? {
            visualDuration: optionsOrVisualDuration,
            keyframes: [0, 1],
            bounce,
        }
        : optionsOrVisualDuration;
    let { restSpeed, restDelta } = options;
    const origin = options.keyframes[0];
    const target = options.keyframes[options.keyframes.length - 1];
    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state = { done: false, value: origin };
    const { stiffness, damping, mass, duration, velocity, isResolvedFromDuration, } = getSpringOptions({
        ...options,
        velocity: -millisecondsToSeconds(options.velocity || 0),
    });
    const initialVelocity = velocity || 0.0;
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
    const initialDelta = target - origin;
    const undampedAngularFreq = millisecondsToSeconds(Math.sqrt(stiffness / mass));
    /**
     * If we're working on a granular scale, use smaller defaults for determining
     * when the spring is finished.
     *
     * These defaults have been selected emprically based on what strikes a good
     * ratio between feeling good and finishing as soon as changes are imperceptible.
     */
    const isGranularScale = Math.abs(initialDelta) < 5;
    restSpeed || (restSpeed = isGranularScale
        ? springDefaults.restSpeed.granular
        : springDefaults.restSpeed.default);
    restDelta || (restDelta = isGranularScale
        ? springDefaults.restDelta.granular
        : springDefaults.restDelta.default);
    let resolveSpring;
    if (dampingRatio < 1) {
        const angularFreq = calcAngularFreq(undampedAngularFreq, dampingRatio);
        // Underdamped spring
        resolveSpring = (t) => {
            const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
            return (target -
                envelope *
                    (((initialVelocity +
                        dampingRatio * undampedAngularFreq * initialDelta) /
                        angularFreq) *
                        Math.sin(angularFreq * t) +
                        initialDelta * Math.cos(angularFreq * t)));
        };
    }
    else if (dampingRatio === 1) {
        // Critically damped spring
        resolveSpring = (t) => target -
            Math.exp(-undampedAngularFreq * t) *
                (initialDelta +
                    (initialVelocity + undampedAngularFreq * initialDelta) * t);
    }
    else {
        // Overdamped spring
        const dampedAngularFreq = undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1);
        resolveSpring = (t) => {
            const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
            // When performing sinh or cosh values can hit Infinity so we cap them here
            const freqForT = Math.min(dampedAngularFreq * t, 300);
            return (target -
                (envelope *
                    ((initialVelocity +
                        dampingRatio * undampedAngularFreq * initialDelta) *
                        Math.sinh(freqForT) +
                        dampedAngularFreq *
                            initialDelta *
                            Math.cosh(freqForT))) /
                    dampedAngularFreq);
        };
    }
    const generator = {
        calculatedDuration: isResolvedFromDuration ? duration || null : null,
        next: (t) => {
            const current = resolveSpring(t);
            if (!isResolvedFromDuration) {
                let currentVelocity = t === 0 ? initialVelocity : 0.0;
                /**
                 * We only need to calculate velocity for under-damped springs
                 * as over- and critically-damped springs can't overshoot, so
                 * checking only for displacement is enough.
                 */
                if (dampingRatio < 1) {
                    currentVelocity =
                        t === 0
                            ? secondsToMilliseconds(initialVelocity)
                            : calcGeneratorVelocity(resolveSpring, t, current);
                }
                const isBelowVelocityThreshold = Math.abs(currentVelocity) <= restSpeed;
                const isBelowDisplacementThreshold = Math.abs(target - current) <= restDelta;
                state.done =
                    isBelowVelocityThreshold && isBelowDisplacementThreshold;
            }
            else {
                state.done = t >= duration;
            }
            state.value = state.done ? target : current;
            return state;
        },
        toString: () => {
            const calculatedDuration = Math.min(calcGeneratorDuration(generator), maxGeneratorDuration);
            const easing = generateLinearEasing((progress) => generator.next(calculatedDuration * progress).value, calculatedDuration, 30);
            return calculatedDuration + "ms " + easing;
        },
        toTransition: () => { },
    };
    return generator;
}
spring.applyToOptions = (options) => {
    const generatorOptions = createGeneratorEasing(options, 100, spring);
    options.ease = generatorOptions.ease;
    options.duration = secondsToMilliseconds(generatorOptions.duration);
    options.type = "keyframes";
    return options;
};

function inertia({ keyframes, velocity = 0.0, power = 0.8, timeConstant = 325, bounceDamping = 10, bounceStiffness = 500, modifyTarget, min, max, restDelta = 0.5, restSpeed, }) {
    const origin = keyframes[0];
    const state = {
        done: false,
        value: origin,
    };
    const isOutOfBounds = (v) => (min !== undefined && v < min) || (max !== undefined && v > max);
    const nearestBoundary = (v) => {
        if (min === undefined)
            return max;
        if (max === undefined)
            return min;
        return Math.abs(min - v) < Math.abs(max - v) ? min : max;
    };
    let amplitude = power * velocity;
    const ideal = origin + amplitude;
    const target = modifyTarget === undefined ? ideal : modifyTarget(ideal);
    /**
     * If the target has changed we need to re-calculate the amplitude, otherwise
     * the animation will start from the wrong position.
     */
    if (target !== ideal)
        amplitude = target - origin;
    const calcDelta = (t) => -amplitude * Math.exp(-t / timeConstant);
    const calcLatest = (t) => target + calcDelta(t);
    const applyFriction = (t) => {
        const delta = calcDelta(t);
        const latest = calcLatest(t);
        state.done = Math.abs(delta) <= restDelta;
        state.value = state.done ? target : latest;
    };
    /**
     * Ideally this would resolve for t in a stateless way, we could
     * do that by always precalculating the animation but as we know
     * this will be done anyway we can assume that spring will
     * be discovered during that.
     */
    let timeReachedBoundary;
    let spring$1;
    const checkCatchBoundary = (t) => {
        if (!isOutOfBounds(state.value))
            return;
        timeReachedBoundary = t;
        spring$1 = spring({
            keyframes: [state.value, nearestBoundary(state.value)],
            velocity: calcGeneratorVelocity(calcLatest, t, state.value), // TODO: This should be passing * 1000
            damping: bounceDamping,
            stiffness: bounceStiffness,
            restDelta,
            restSpeed,
        });
    };
    checkCatchBoundary(0);
    return {
        calculatedDuration: null,
        next: (t) => {
            /**
             * We need to resolve the friction to figure out if we need a
             * spring but we don't want to do this twice per frame. So here
             * we flag if we updated for this frame and later if we did
             * we can skip doing it again.
             */
            let hasUpdatedFrame = false;
            if (!spring$1 && timeReachedBoundary === undefined) {
                hasUpdatedFrame = true;
                applyFriction(t);
                checkCatchBoundary(t);
            }
            /**
             * If we have a spring and the provided t is beyond the moment the friction
             * animation crossed the min/max boundary, use the spring.
             */
            if (timeReachedBoundary !== undefined && t >= timeReachedBoundary) {
                return spring$1.next(t - timeReachedBoundary);
            }
            else {
                !hasUpdatedFrame && applyFriction(t);
                return state;
            }
        },
    };
}

function createMixers(output, ease, customMixer) {
    const mixers = [];
    const mixerFactory = customMixer || MotionGlobalConfig.mix || mix;
    const numMixers = output.length - 1;
    for (let i = 0; i < numMixers; i++) {
        let mixer = mixerFactory(output[i], output[i + 1]);
        if (ease) {
            const easingFunction = Array.isArray(ease) ? ease[i] || noop : ease;
            mixer = pipe(easingFunction, mixer);
        }
        mixers.push(mixer);
    }
    return mixers;
}
/**
 * Create a function that maps from a numerical input array to a generic output array.
 *
 * Accepts:
 *   - Numbers
 *   - Colors (hex, hsl, hsla, rgb, rgba)
 *   - Complex (combinations of one or more numbers or strings)
 *
 * ```jsx
 * const mixColor = interpolate([0, 1], ['#fff', '#000'])
 *
 * mixColor(0.5) // 'rgba(128, 128, 128, 1)'
 * ```
 *
 * TODO Revisit this approach once we've moved to data models for values,
 * probably not needed to pregenerate mixer functions.
 *
 * @public
 */
function interpolate(input, output, { clamp: isClamp = true, ease, mixer } = {}) {
    const inputLength = input.length;
    invariant(inputLength === output.length);
    /**
     * If we're only provided a single input, we can just make a function
     * that returns the output.
     */
    if (inputLength === 1)
        return () => output[0];
    if (inputLength === 2 && output[0] === output[1])
        return () => output[1];
    const isZeroDeltaRange = input[0] === input[1];
    // If input runs highest -> lowest, reverse both arrays
    if (input[0] > input[inputLength - 1]) {
        input = [...input].reverse();
        output = [...output].reverse();
    }
    const mixers = createMixers(output, ease, mixer);
    const numMixers = mixers.length;
    const interpolator = (v) => {
        if (isZeroDeltaRange && v < input[0])
            return output[0];
        let i = 0;
        if (numMixers > 1) {
            for (; i < input.length - 2; i++) {
                if (v < input[i + 1])
                    break;
            }
        }
        const progressInRange = progress(input[i], input[i + 1], v);
        return mixers[i](progressInRange);
    };
    return isClamp
        ? (v) => interpolator(clamp(input[0], input[inputLength - 1], v))
        : interpolator;
}

function fillOffset(offset, remaining) {
    const min = offset[offset.length - 1];
    for (let i = 1; i <= remaining; i++) {
        const offsetProgress = progress(0, remaining, i);
        offset.push(mixNumber$1(min, 1, offsetProgress));
    }
}

function defaultOffset(arr) {
    const offset = [0];
    fillOffset(offset, arr.length - 1);
    return offset;
}

function convertOffsetToTimes(offset, duration) {
    return offset.map((o) => o * duration);
}

function defaultEasing(values, easing) {
    return values.map(() => easing || easeInOut).splice(0, values.length - 1);
}
function keyframes({ duration = 300, keyframes: keyframeValues, times, ease = "easeInOut", }) {
    /**
     * Easing functions can be externally defined as strings. Here we convert them
     * into actual functions.
     */
    const easingFunctions = isEasingArray(ease)
        ? ease.map(easingDefinitionToFunction)
        : easingDefinitionToFunction(ease);
    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state = {
        done: false,
        value: keyframeValues[0],
    };
    /**
     * Create a times array based on the provided 0-1 offsets
     */
    const absoluteTimes = convertOffsetToTimes(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    times && times.length === keyframeValues.length
        ? times
        : defaultOffset(keyframeValues), duration);
    const mapTimeToKeyframe = interpolate(absoluteTimes, keyframeValues, {
        ease: Array.isArray(easingFunctions)
            ? easingFunctions
            : defaultEasing(keyframeValues, easingFunctions),
    });
    return {
        calculatedDuration: duration,
        next: (t) => {
            state.value = mapTimeToKeyframe(t);
            state.done = t >= duration;
            return state;
        },
    };
}

const isNotNull$1 = (value) => value !== null;
function getFinalKeyframe$1(keyframes, { repeat, repeatType = "loop" }, finalKeyframe, speed = 1) {
    const resolvedKeyframes = keyframes.filter(isNotNull$1);
    const useFirstKeyframe = speed < 0 || (repeat && repeatType !== "loop" && repeat % 2 === 1);
    const index = useFirstKeyframe ? 0 : resolvedKeyframes.length - 1;
    return !index || finalKeyframe === undefined
        ? resolvedKeyframes[index]
        : finalKeyframe;
}

const transitionTypeMap = {
    decay: inertia,
    inertia,
    tween: keyframes,
    keyframes: keyframes,
    spring,
};
function replaceTransitionType(transition) {
    if (typeof transition.type === "string") {
        transition.type = transitionTypeMap[transition.type];
    }
}

class WithPromise {
    constructor() {
        this.updateFinished();
    }
    get finished() {
        return this._finished;
    }
    updateFinished() {
        this._finished = new Promise((resolve) => {
            this.resolve = resolve;
        });
    }
    notifyFinished() {
        this.resolve();
    }
    /**
     * Allows the animation to be awaited.
     *
     * @deprecated Use `finished` instead.
     */
    then(onResolve, onReject) {
        return this.finished.then(onResolve, onReject);
    }
}

const percentToProgress = (percent) => percent / 100;
class JSAnimation extends WithPromise {
  constructor(options) {
    super();
    this.state = "idle";
    this.startTime = null;
    this.isStopped = false;
    this.currentTime = 0;
    this.holdTime = null;
    this.playbackSpeed = 1;
    this.stop = () => {
      const { motionValue } = this.options;
      if (motionValue && motionValue.updatedAt !== time.now()) {
        this.tick(time.now());
      }
      this.isStopped = true;
      if (this.state === "idle")
        return;
      this.teardown();
      this.options.onStop?.();
    };
    this.options = options;
    this.initAnimation();
    this.play();
    if (options.autoplay === false)
      this.pause();
  }
  initAnimation() {
    const { options } = this;
    replaceTransitionType(options);
    const { type = keyframes, repeat = 0, repeatDelay = 0, repeatType, velocity = 0 } = options;
    let { keyframes: keyframes$1 } = options;
    const generatorFactory = type || keyframes;
    if (generatorFactory !== keyframes && typeof keyframes$1[0] !== "number") {
      this.mixKeyframes = pipe(percentToProgress, mix(keyframes$1[0], keyframes$1[1]));
      keyframes$1 = [0, 100];
    }
    const generator = generatorFactory({ ...options, keyframes: keyframes$1 });
    if (repeatType === "mirror") {
      this.mirroredGenerator = generatorFactory({
        ...options,
        keyframes: [...keyframes$1].reverse(),
        velocity: -velocity
      });
    }
    if (generator.calculatedDuration === null) {
      generator.calculatedDuration = calcGeneratorDuration(generator);
    }
    const { calculatedDuration } = generator;
    this.calculatedDuration = calculatedDuration;
    this.resolvedDuration = calculatedDuration + repeatDelay;
    this.totalDuration = this.resolvedDuration * (repeat + 1) - repeatDelay;
    this.generator = generator;
  }
  updateTime(timestamp) {
    const animationTime = Math.round(timestamp - this.startTime) * this.playbackSpeed;
    if (this.holdTime !== null) {
      this.currentTime = this.holdTime;
    } else {
      this.currentTime = animationTime;
    }
  }
  tick(timestamp, sample = false) {
    const { generator, totalDuration, mixKeyframes, mirroredGenerator, resolvedDuration, calculatedDuration } = this;
    if (this.startTime === null)
      return generator.next(0);
    const { delay = 0, keyframes: keyframes2, repeat, repeatType, repeatDelay, type, onUpdate, finalKeyframe } = this.options;
    if (this.speed > 0) {
      this.startTime = Math.min(this.startTime, timestamp);
    } else if (this.speed < 0) {
      this.startTime = Math.min(timestamp - totalDuration / this.speed, this.startTime);
    }
    if (sample) {
      this.currentTime = timestamp;
    } else {
      this.updateTime(timestamp);
    }
    const timeWithoutDelay = this.currentTime - delay * (this.playbackSpeed >= 0 ? 1 : -1);
    const isInDelayPhase = this.playbackSpeed >= 0 ? timeWithoutDelay < 0 : timeWithoutDelay > totalDuration;
    this.currentTime = Math.max(timeWithoutDelay, 0);
    if (this.state === "finished" && this.holdTime === null) {
      this.currentTime = totalDuration;
    }
    let elapsed = this.currentTime;
    let frameGenerator = generator;
    if (repeat) {
      const progress = Math.min(this.currentTime, totalDuration) / resolvedDuration;
      let currentIteration = Math.floor(progress);
      let iterationProgress = progress % 1;
      if (!iterationProgress && progress >= 1) {
        iterationProgress = 1;
      }
      iterationProgress === 1 && currentIteration--;
      currentIteration = Math.min(currentIteration, repeat + 1);
      const isOddIteration = Boolean(currentIteration % 2);
      if (isOddIteration) {
        if (repeatType === "reverse") {
          iterationProgress = 1 - iterationProgress;
          if (repeatDelay) {
            iterationProgress -= repeatDelay / resolvedDuration;
          }
        } else if (repeatType === "mirror") {
          frameGenerator = mirroredGenerator;
        }
      }
      elapsed = clamp(0, 1, iterationProgress) * resolvedDuration;
    }
    const state = isInDelayPhase ? { done: false, value: keyframes2[0] } : frameGenerator.next(elapsed);
    if (mixKeyframes) {
      state.value = mixKeyframes(state.value);
    }
    let { done } = state;
    if (!isInDelayPhase && calculatedDuration !== null) {
      done = this.playbackSpeed >= 0 ? this.currentTime >= totalDuration : this.currentTime <= 0;
    }
    const isAnimationFinished = this.holdTime === null && (this.state === "finished" || this.state === "running" && done);
    if (isAnimationFinished && type !== inertia) {
      state.value = getFinalKeyframe$1(keyframes2, this.options, finalKeyframe, this.speed);
    }
    if (onUpdate) {
      onUpdate(state.value);
    }
    if (isAnimationFinished) {
      this.finish();
    }
    return state;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(resolve, reject) {
    return this.finished.then(resolve, reject);
  }
  get duration() {
    return millisecondsToSeconds(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay = 0 } = this.options || {};
    return this.duration + millisecondsToSeconds(delay);
  }
  get time() {
    return millisecondsToSeconds(this.currentTime);
  }
  set time(newTime) {
    newTime = secondsToMilliseconds(newTime);
    this.currentTime = newTime;
    if (this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0) {
      this.holdTime = newTime;
    } else if (this.driver) {
      this.startTime = this.driver.now() - newTime / this.playbackSpeed;
    }
    this.driver?.start(false);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(newSpeed) {
    this.updateTime(time.now());
    const hasChanged = this.playbackSpeed !== newSpeed;
    this.playbackSpeed = newSpeed;
    if (hasChanged) {
      this.time = millisecondsToSeconds(this.currentTime);
    }
  }
  play() {
    if (this.isStopped)
      return;
    const { driver = frameloopDriver, startTime } = this.options;
    if (!this.driver) {
      this.driver = driver((timestamp) => this.tick(timestamp));
    }
    this.options.onPlay?.();
    const now = this.driver.now();
    if (this.state === "finished") {
      this.updateFinished();
      this.startTime = now;
    } else if (this.holdTime !== null) {
      this.startTime = now - this.holdTime;
    } else if (!this.startTime) {
      this.startTime = startTime ?? now;
    }
    if (this.state === "finished" && this.speed < 0) {
      this.startTime += this.calculatedDuration;
    }
    this.holdTime = null;
    this.state = "running";
    this.driver.start();
  }
  pause() {
    this.state = "paused";
    this.updateTime(time.now());
    this.holdTime = this.currentTime;
  }
  complete() {
    if (this.state !== "running") {
      this.play();
    }
    this.state = "finished";
    this.holdTime = null;
  }
  finish() {
    this.notifyFinished();
    this.teardown();
    this.state = "finished";
    this.options.onComplete?.();
  }
  cancel() {
    this.holdTime = null;
    this.startTime = 0;
    this.tick(0);
    this.teardown();
    this.options.onCancel?.();
  }
  teardown() {
    this.state = "idle";
    this.stopDriver();
    this.startTime = this.holdTime = null;
  }
  stopDriver() {
    if (!this.driver)
      return;
    this.driver.stop();
    this.driver = void 0;
  }
  sample(sampleTime) {
    this.startTime = 0;
    return this.tick(sampleTime, true);
  }
  attachTimeline(timeline) {
    if (this.options.allowFlatten) {
      this.options.type = "keyframes";
      this.options.ease = "linear";
      this.initAnimation();
    }
    this.driver?.stop();
    return timeline.observe(this);
  }
}

function fillWildcards(keyframes) {
    for (let i = 1; i < keyframes.length; i++) {
        keyframes[i] ?? (keyframes[i] = keyframes[i - 1]);
    }
}

const radToDeg = (rad) => (rad * 180) / Math.PI;
const rotate = (v) => {
    const angle = radToDeg(Math.atan2(v[1], v[0]));
    return rebaseAngle(angle);
};
const matrix2dParsers = {
    x: 4,
    y: 5,
    translateX: 4,
    translateY: 5,
    scaleX: 0,
    scaleY: 3,
    scale: (v) => (Math.abs(v[0]) + Math.abs(v[3])) / 2,
    rotate,
    rotateZ: rotate,
    skewX: (v) => radToDeg(Math.atan(v[1])),
    skewY: (v) => radToDeg(Math.atan(v[2])),
    skew: (v) => (Math.abs(v[1]) + Math.abs(v[2])) / 2,
};
const rebaseAngle = (angle) => {
    angle = angle % 360;
    if (angle < 0)
        angle += 360;
    return angle;
};
const rotateZ = rotate;
const scaleX = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1]);
const scaleY = (v) => Math.sqrt(v[4] * v[4] + v[5] * v[5]);
const matrix3dParsers = {
    x: 12,
    y: 13,
    z: 14,
    translateX: 12,
    translateY: 13,
    translateZ: 14,
    scaleX,
    scaleY,
    scale: (v) => (scaleX(v) + scaleY(v)) / 2,
    rotateX: (v) => rebaseAngle(radToDeg(Math.atan2(v[6], v[5]))),
    rotateY: (v) => rebaseAngle(radToDeg(Math.atan2(-v[2], v[0]))),
    rotateZ,
    rotate: rotateZ,
    skewX: (v) => radToDeg(Math.atan(v[4])),
    skewY: (v) => radToDeg(Math.atan(v[1])),
    skew: (v) => (Math.abs(v[1]) + Math.abs(v[4])) / 2,
};
function defaultTransformValue(name) {
    return name.includes("scale") ? 1 : 0;
}
function parseValueFromTransform(transform, name) {
    if (!transform || transform === "none") {
        return defaultTransformValue(name);
    }
    const matrix3dMatch = transform.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
    let parsers;
    let match;
    if (matrix3dMatch) {
        parsers = matrix3dParsers;
        match = matrix3dMatch;
    }
    else {
        const matrix2dMatch = transform.match(/^matrix\(([-\d.e\s,]+)\)$/u);
        parsers = matrix2dParsers;
        match = matrix2dMatch;
    }
    if (!match) {
        return defaultTransformValue(name);
    }
    const valueParser = parsers[name];
    const values = match[1].split(",").map(convertTransformToNumber);
    return typeof valueParser === "function"
        ? valueParser(values)
        : values[valueParser];
}
const readTransformValue = (instance, name) => {
    const { transform = "none" } = getComputedStyle(instance);
    return parseValueFromTransform(transform, name);
};
function convertTransformToNumber(value) {
    return parseFloat(value.trim());
}

/**
 * Generate a list of every possible transform key.
 */
const transformPropOrder = [
    "transformPerspective",
    "x",
    "y",
    "z",
    "translateX",
    "translateY",
    "translateZ",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "skew",
    "skewX",
    "skewY",
];
/**
 * A quick lookup for transform props.
 */
const transformProps = /*@__PURE__*/ (() => new Set(transformPropOrder))();

const isNumOrPxType = (v) => v === number || v === px;
const transformKeys = new Set(["x", "y", "z"]);
const nonTranslationalTransformKeys = transformPropOrder.filter((key) => !transformKeys.has(key));
function removeNonTranslationalTransform(visualElement) {
    const removedTransforms = [];
    nonTranslationalTransformKeys.forEach((key) => {
        const value = visualElement.getValue(key);
        if (value !== undefined) {
            removedTransforms.push([key, value.get()]);
            value.set(key.startsWith("scale") ? 1 : 0);
        }
    });
    return removedTransforms;
}
const positionalValues = {
    // Dimensions
    width: ({ x }, { paddingLeft = "0", paddingRight = "0" }) => x.max - x.min - parseFloat(paddingLeft) - parseFloat(paddingRight),
    height: ({ y }, { paddingTop = "0", paddingBottom = "0" }) => y.max - y.min - parseFloat(paddingTop) - parseFloat(paddingBottom),
    top: (_bbox, { top }) => parseFloat(top),
    left: (_bbox, { left }) => parseFloat(left),
    bottom: ({ y }, { top }) => parseFloat(top) + (y.max - y.min),
    right: ({ x }, { left }) => parseFloat(left) + (x.max - x.min),
    // Transform
    x: (_bbox, { transform }) => parseValueFromTransform(transform, "x"),
    y: (_bbox, { transform }) => parseValueFromTransform(transform, "y"),
};
// Alias translate longform names
positionalValues.translateX = positionalValues.x;
positionalValues.translateY = positionalValues.y;

const toResolve = new Set();
let isScheduled = false;
let anyNeedsMeasurement = false;
let isForced = false;
function measureAllKeyframes() {
    if (anyNeedsMeasurement) {
        const resolversToMeasure = Array.from(toResolve).filter((resolver) => resolver.needsMeasurement);
        const elementsToMeasure = new Set(resolversToMeasure.map((resolver) => resolver.element));
        const transformsToRestore = new Map();
        /**
         * Write pass
         * If we're measuring elements we want to remove bounding box-changing transforms.
         */
        elementsToMeasure.forEach((element) => {
            const removedTransforms = removeNonTranslationalTransform(element);
            if (!removedTransforms.length)
                return;
            transformsToRestore.set(element, removedTransforms);
            element.render();
        });
        // Read
        resolversToMeasure.forEach((resolver) => resolver.measureInitialState());
        // Write
        elementsToMeasure.forEach((element) => {
            element.render();
            const restore = transformsToRestore.get(element);
            if (restore) {
                restore.forEach(([key, value]) => {
                    element.getValue(key)?.set(value);
                });
            }
        });
        // Read
        resolversToMeasure.forEach((resolver) => resolver.measureEndState());
        // Write
        resolversToMeasure.forEach((resolver) => {
            if (resolver.suspendedScrollY !== undefined) {
                window.scrollTo(0, resolver.suspendedScrollY);
            }
        });
    }
    anyNeedsMeasurement = false;
    isScheduled = false;
    toResolve.forEach((resolver) => resolver.complete(isForced));
    toResolve.clear();
}
function readAllKeyframes() {
    toResolve.forEach((resolver) => {
        resolver.readKeyframes();
        if (resolver.needsMeasurement) {
            anyNeedsMeasurement = true;
        }
    });
}
function flushKeyframeResolvers() {
    isForced = true;
    readAllKeyframes();
    measureAllKeyframes();
    isForced = false;
}
class KeyframeResolver {
    constructor(unresolvedKeyframes, onComplete, name, motionValue, element, isAsync = false) {
        this.state = "pending";
        /**
         * Track whether this resolver is async. If it is, it'll be added to the
         * resolver queue and flushed in the next frame. Resolvers that aren't going
         * to trigger read/write thrashing don't need to be async.
         */
        this.isAsync = false;
        /**
         * Track whether this resolver needs to perform a measurement
         * to resolve its keyframes.
         */
        this.needsMeasurement = false;
        this.unresolvedKeyframes = [...unresolvedKeyframes];
        this.onComplete = onComplete;
        this.name = name;
        this.motionValue = motionValue;
        this.element = element;
        this.isAsync = isAsync;
    }
    scheduleResolve() {
        this.state = "scheduled";
        if (this.isAsync) {
            toResolve.add(this);
            if (!isScheduled) {
                isScheduled = true;
                frame.read(readAllKeyframes);
                frame.resolveKeyframes(measureAllKeyframes);
            }
        }
        else {
            this.readKeyframes();
            this.complete();
        }
    }
    readKeyframes() {
        const { unresolvedKeyframes, name, element, motionValue } = this;
        // If initial keyframe is null we need to read it from the DOM
        if (unresolvedKeyframes[0] === null) {
            const currentValue = motionValue?.get();
            // TODO: This doesn't work if the final keyframe is a wildcard
            const finalKeyframe = unresolvedKeyframes[unresolvedKeyframes.length - 1];
            if (currentValue !== undefined) {
                unresolvedKeyframes[0] = currentValue;
            }
            else if (element && name) {
                const valueAsRead = element.readValue(name, finalKeyframe);
                if (valueAsRead !== undefined && valueAsRead !== null) {
                    unresolvedKeyframes[0] = valueAsRead;
                }
            }
            if (unresolvedKeyframes[0] === undefined) {
                unresolvedKeyframes[0] = finalKeyframe;
            }
            if (motionValue && currentValue === undefined) {
                motionValue.set(unresolvedKeyframes[0]);
            }
        }
        fillWildcards(unresolvedKeyframes);
    }
    setFinalKeyframe() { }
    measureInitialState() { }
    renderEndStyles() { }
    measureEndState() { }
    complete(isForcedComplete = false) {
        this.state = "complete";
        this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, isForcedComplete);
        toResolve.delete(this);
    }
    cancel() {
        if (this.state === "scheduled") {
            toResolve.delete(this);
            this.state = "pending";
        }
    }
    resume() {
        if (this.state === "pending")
            this.scheduleResolve();
    }
}

const isCSSVar = (name) => name.startsWith("--");

function setStyle(element, name, value) {
    isCSSVar(name)
        ? element.style.setProperty(name, value)
        : (element.style[name] = value);
}

const supportsScrollTimeline = /* @__PURE__ */ memo(() => window.ScrollTimeline !== undefined);

/**
 * Add the ability for test suites to manually set support flags
 * to better test more environments.
 */
const supportsFlags = {};

function memoSupports(callback, supportsFlag) {
    const memoized = memo(callback);
    return () => supportsFlags[supportsFlag] ?? memoized();
}

const supportsLinearEasing = /*@__PURE__*/ memoSupports(() => {
    try {
        document
            .createElement("div")
            .animate({ opacity: 0 }, { easing: "linear(0, 1)" });
    }
    catch (e) {
        return false;
    }
    return true;
}, "linearEasing");

const cubicBezierAsString = ([a, b, c, d]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

const supportedWaapiEasing = {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    circIn: /*@__PURE__*/ cubicBezierAsString([0, 0.65, 0.55, 1]),
    circOut: /*@__PURE__*/ cubicBezierAsString([0.55, 0, 1, 0.45]),
    backIn: /*@__PURE__*/ cubicBezierAsString([0.31, 0.01, 0.66, -0.59]),
    backOut: /*@__PURE__*/ cubicBezierAsString([0.33, 1.53, 0.69, 0.99]),
};

function mapEasingToNativeEasing(easing, duration) {
    if (!easing) {
        return undefined;
    }
    else if (typeof easing === "function") {
        return supportsLinearEasing()
            ? generateLinearEasing(easing, duration)
            : "ease-out";
    }
    else if (isBezierDefinition(easing)) {
        return cubicBezierAsString(easing);
    }
    else if (Array.isArray(easing)) {
        return easing.map((segmentEasing) => mapEasingToNativeEasing(segmentEasing, duration) ||
            supportedWaapiEasing.easeOut);
    }
    else {
        return supportedWaapiEasing[easing];
    }
}

function startWaapiAnimation(element, valueName, keyframes, { delay = 0, duration = 300, repeat = 0, repeatType = "loop", ease = "easeOut", times, } = {}, pseudoElement = undefined) {
    const keyframeOptions = {
        [valueName]: keyframes,
    };
    if (times)
        keyframeOptions.offset = times;
    const easing = mapEasingToNativeEasing(ease, duration);
    /**
     * If this is an easing array, apply to keyframes, not animation as a whole
     */
    if (Array.isArray(easing))
        keyframeOptions.easing = easing;
    const options = {
        delay,
        duration,
        easing: !Array.isArray(easing) ? easing : "linear",
        fill: "both",
        iterations: repeat + 1,
        direction: repeatType === "reverse" ? "alternate" : "normal",
    };
    if (pseudoElement)
        options.pseudoElement = pseudoElement;
    const animation = element.animate(keyframeOptions, options);
    return animation;
}

function isGenerator(type) {
    return typeof type === "function" && "applyToOptions" in type;
}

function applyGeneratorOptions({ type, ...options }) {
    if (isGenerator(type) && supportsLinearEasing()) {
        return type.applyToOptions(options);
    }
    else {
        options.duration ?? (options.duration = 300);
        options.ease ?? (options.ease = "easeOut");
    }
    return options;
}

/**
 * NativeAnimation implements AnimationPlaybackControls for the browser's Web Animations API.
 */
class NativeAnimation extends WithPromise {
    constructor(options) {
        super();
        this.finishedTime = null;
        this.isStopped = false;
        if (!options)
            return;
        const { element, name, keyframes, pseudoElement, allowFlatten = false, finalKeyframe, onComplete, } = options;
        this.isPseudoElement = Boolean(pseudoElement);
        this.allowFlatten = allowFlatten;
        this.options = options;
        invariant(typeof options.type !== "string");
        const transition = applyGeneratorOptions(options);
        this.animation = startWaapiAnimation(element, name, keyframes, transition, pseudoElement);
        if (transition.autoplay === false) {
            this.animation.pause();
        }
        this.animation.onfinish = () => {
            this.finishedTime = this.time;
            if (!pseudoElement) {
                const keyframe = getFinalKeyframe$1(keyframes, this.options, finalKeyframe, this.speed);
                if (this.updateMotionValue) {
                    this.updateMotionValue(keyframe);
                }
                else {
                    /**
                     * If we can, we want to commit the final style as set by the user,
                     * rather than the computed keyframe value supplied by the animation.
                     */
                    setStyle(element, name, keyframe);
                }
                this.animation.cancel();
            }
            onComplete?.();
            this.notifyFinished();
        };
    }
    play() {
        if (this.isStopped)
            return;
        this.animation.play();
        if (this.state === "finished") {
            this.updateFinished();
        }
    }
    pause() {
        this.animation.pause();
    }
    complete() {
        this.animation.finish?.();
    }
    cancel() {
        try {
            this.animation.cancel();
        }
        catch (e) { }
    }
    stop() {
        if (this.isStopped)
            return;
        this.isStopped = true;
        const { state } = this;
        if (state === "idle" || state === "finished") {
            return;
        }
        if (this.updateMotionValue) {
            this.updateMotionValue();
        }
        else {
            this.commitStyles();
        }
        if (!this.isPseudoElement)
            this.cancel();
    }
    /**
     * WAAPI doesn't natively have any interruption capabilities.
     *
     * In this method, we commit styles back to the DOM before cancelling
     * the animation.
     *
     * This is designed to be overridden by NativeAnimationExtended, which
     * will create a renderless JS animation and sample it twice to calculate
     * its current value, "previous" value, and therefore allow
     * Motion to also correctly calculate velocity for any subsequent animation
     * while deferring the commit until the next animation frame.
     */
    commitStyles() {
        if (!this.isPseudoElement) {
            this.animation.commitStyles?.();
        }
    }
    get duration() {
        const duration = this.animation.effect?.getComputedTiming?.().duration || 0;
        return millisecondsToSeconds(Number(duration));
    }
    get iterationDuration() {
        const { delay = 0 } = this.options || {};
        return this.duration + millisecondsToSeconds(delay);
    }
    get time() {
        return millisecondsToSeconds(Number(this.animation.currentTime) || 0);
    }
    set time(newTime) {
        this.finishedTime = null;
        this.animation.currentTime = secondsToMilliseconds(newTime);
    }
    /**
     * The playback speed of the animation.
     * 1 = normal speed, 2 = double speed, 0.5 = half speed.
     */
    get speed() {
        return this.animation.playbackRate;
    }
    set speed(newSpeed) {
        // Allow backwards playback after finishing
        if (newSpeed < 0)
            this.finishedTime = null;
        this.animation.playbackRate = newSpeed;
    }
    get state() {
        return this.finishedTime !== null
            ? "finished"
            : this.animation.playState;
    }
    get startTime() {
        return Number(this.animation.startTime);
    }
    set startTime(newStartTime) {
        this.animation.startTime = newStartTime;
    }
    /**
     * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
     */
    attachTimeline({ timeline, observe }) {
        if (this.allowFlatten) {
            this.animation.effect?.updateTiming({ easing: "linear" });
        }
        this.animation.onfinish = null;
        if (timeline && supportsScrollTimeline()) {
            this.animation.timeline = timeline;
            return noop;
        }
        else {
            return observe(this);
        }
    }
}

const unsupportedEasingFunctions = {
    anticipate,
    backInOut,
    circInOut,
};
function isUnsupportedEase(key) {
    return key in unsupportedEasingFunctions;
}
function replaceStringEasing(transition) {
    if (typeof transition.ease === "string" &&
        isUnsupportedEase(transition.ease)) {
        transition.ease = unsupportedEasingFunctions[transition.ease];
    }
}

/**
 * 10ms is chosen here as it strikes a balance between smooth
 * results (more than one keyframe per frame at 60fps) and
 * keyframe quantity.
 */
const sampleDelta = 10; //ms
class NativeAnimationExtended extends NativeAnimation {
    constructor(options) {
        /**
         * The base NativeAnimation function only supports a subset
         * of Motion easings, and WAAPI also only supports some
         * easing functions via string/cubic-bezier definitions.
         *
         * This function replaces those unsupported easing functions
         * with a JS easing function. This will later get compiled
         * to a linear() easing function.
         */
        replaceStringEasing(options);
        /**
         * Ensure we replace the transition type with a generator function
         * before passing to WAAPI.
         *
         * TODO: Does this have a better home? It could be shared with
         * JSAnimation.
         */
        replaceTransitionType(options);
        super(options);
        if (options.startTime) {
            this.startTime = options.startTime;
        }
        this.options = options;
    }
    /**
     * WAAPI doesn't natively have any interruption capabilities.
     *
     * Rather than read commited styles back out of the DOM, we can
     * create a renderless JS animation and sample it twice to calculate
     * its current value, "previous" value, and therefore allow
     * Motion to calculate velocity for any subsequent animation.
     */
    updateMotionValue(value) {
        const { motionValue, onUpdate, onComplete, element, ...options } = this.options;
        if (!motionValue)
            return;
        if (value !== undefined) {
            motionValue.set(value);
            return;
        }
        const sampleAnimation = new JSAnimation({
            ...options,
            autoplay: false,
        });
        const sampleTime = secondsToMilliseconds(this.finishedTime ?? this.time);
        motionValue.setWithVelocity(sampleAnimation.sample(sampleTime - sampleDelta).value, sampleAnimation.sample(sampleTime).value, sampleDelta);
        sampleAnimation.stop();
    }
}

/**
 * Check if a value is animatable. Examples:
 *
 * ✅: 100, "100px", "#fff"
 * ❌: "block", "url(2.jpg)"
 * @param value
 *
 * @internal
 */
const isAnimatable = (value, name) => {
    // If the list of keys that might be non-animatable grows, replace with Set
    if (name === "zIndex")
        return false;
    // If it's a number or a keyframes array, we can animate it. We might at some point
    // need to do a deep isAnimatable check of keyframes, or let Popmotion handle this,
    // but for now lets leave it like this for performance reasons
    if (typeof value === "number" || Array.isArray(value))
        return true;
    if (typeof value === "string" && // It's animatable if we have a string
        (complex.test(value) || value === "0") && // And it contains numbers and/or colors
        !value.startsWith("url(") // Unless it starts with "url("
    ) {
        return true;
    }
    return false;
};

function hasKeyframesChanged(keyframes) {
    const current = keyframes[0];
    if (keyframes.length === 1)
        return true;
    for (let i = 0; i < keyframes.length; i++) {
        if (keyframes[i] !== current)
            return true;
    }
}
function canAnimate(keyframes, name, type, velocity) {
    /**
     * Check if we're able to animate between the start and end keyframes,
     * and throw a warning if we're attempting to animate between one that's
     * animatable and another that isn't.
     */
    const originKeyframe = keyframes[0];
    if (originKeyframe === null)
        return false;
    /**
     * These aren't traditionally animatable but we do support them.
     * In future we could look into making this more generic or replacing
     * this function with mix() === mixImmediate
     */
    if (name === "display" || name === "visibility")
        return true;
    const targetKeyframe = keyframes[keyframes.length - 1];
    const isOriginAnimatable = isAnimatable(originKeyframe, name);
    const isTargetAnimatable = isAnimatable(targetKeyframe, name);
    // Always skip if any of these are true
    if (!isOriginAnimatable || !isTargetAnimatable) {
        return false;
    }
    return (hasKeyframesChanged(keyframes) ||
        ((type === "spring" || isGenerator(type)) && velocity));
}

function makeAnimationInstant(options) {
    options.duration = 0;
    options.type = "keyframes";
}

/**
 * A list of values that can be hardware-accelerated.
 */
const acceleratedValues = new Set([
    "opacity",
    "clipPath",
    "filter",
    "transform",
    // TODO: Could be re-enabled now we have support for linear() easing
    // "background-color"
]);
const supportsWaapi = /*@__PURE__*/ memo(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function supportsBrowserAnimation(options) {
    const { motionValue, name, repeatDelay, repeatType, damping, type } = options;
    const subject = motionValue?.owner?.current;
    /**
     * We use this check instead of isHTMLElement() because we explicitly
     * **don't** want elements in different timing contexts (i.e. popups)
     * to be accelerated, as it's not possible to sync these animations
     * properly with those driven from the main window frameloop.
     */
    if (!(subject instanceof HTMLElement)) {
        return false;
    }
    const { onUpdate, transformTemplate } = motionValue.owner.getProps();
    return (supportsWaapi() &&
        name &&
        acceleratedValues.has(name) &&
        (name !== "transform" || !transformTemplate) &&
        /**
         * If we're outputting values to onUpdate then we can't use WAAPI as there's
         * no way to read the value from WAAPI every frame.
         */
        !onUpdate &&
        !repeatDelay &&
        repeatType !== "mirror" &&
        damping !== 0 &&
        type !== "inertia");
}

/**
 * Maximum time allowed between an animation being created and it being
 * resolved for us to use the latter as the start time.
 *
 * This is to ensure that while we prefer to "start" an animation as soon
 * as it's triggered, we also want to avoid a visual jump if there's a big delay
 * between these two moments.
 */
const MAX_RESOLVE_DELAY = 40;
class AsyncMotionValueAnimation extends WithPromise {
    constructor({ autoplay = true, delay = 0, type = "keyframes", repeat = 0, repeatDelay = 0, repeatType = "loop", keyframes, name, motionValue, element, ...options }) {
        super();
        /**
         * Bound to support return animation.stop pattern
         */
        this.stop = () => {
            if (this._animation) {
                this._animation.stop();
                this.stopTimeline?.();
            }
            this.keyframeResolver?.cancel();
        };
        this.createdAt = time.now();
        const optionsWithDefaults = {
            autoplay,
            delay,
            type,
            repeat,
            repeatDelay,
            repeatType,
            name,
            motionValue,
            element,
            ...options,
        };
        const KeyframeResolver$1 = element?.KeyframeResolver || KeyframeResolver;
        this.keyframeResolver = new KeyframeResolver$1(keyframes, (resolvedKeyframes, finalKeyframe, forced) => this.onKeyframesResolved(resolvedKeyframes, finalKeyframe, optionsWithDefaults, !forced), name, motionValue, element);
        this.keyframeResolver?.scheduleResolve();
    }
    onKeyframesResolved(keyframes, finalKeyframe, options, sync) {
        this.keyframeResolver = undefined;
        const { name, type, velocity, delay, isHandoff, onUpdate } = options;
        this.resolvedAt = time.now();
        /**
         * If we can't animate this value with the resolved keyframes
         * then we should complete it immediately.
         */
        if (!canAnimate(keyframes, name, type, velocity)) {
            if (MotionGlobalConfig.instantAnimations || !delay) {
                onUpdate?.(getFinalKeyframe$1(keyframes, options, finalKeyframe));
            }
            keyframes[0] = keyframes[keyframes.length - 1];
            makeAnimationInstant(options);
            options.repeat = 0;
        }
        /**
         * Resolve startTime for the animation.
         *
         * This method uses the createdAt and resolvedAt to calculate the
         * animation startTime. *Ideally*, we would use the createdAt time as t=0
         * as the following frame would then be the first frame of the animation in
         * progress, which would feel snappier.
         *
         * However, if there's a delay (main thread work) between the creation of
         * the animation and the first commited frame, we prefer to use resolvedAt
         * to avoid a sudden jump into the animation.
         */
        const startTime = sync
            ? !this.resolvedAt
                ? this.createdAt
                : this.resolvedAt - this.createdAt > MAX_RESOLVE_DELAY
                    ? this.resolvedAt
                    : this.createdAt
            : undefined;
        const resolvedOptions = {
            startTime,
            finalKeyframe,
            ...options,
            keyframes,
        };
        /**
         * Animate via WAAPI if possible. If this is a handoff animation, the optimised animation will be running via
         * WAAPI. Therefore, this animation must be JS to ensure it runs "under" the
         * optimised animation.
         */
        const animation = !isHandoff && supportsBrowserAnimation(resolvedOptions)
            ? new NativeAnimationExtended({
                ...resolvedOptions,
                element: resolvedOptions.motionValue.owner.current,
            })
            : new JSAnimation(resolvedOptions);
        animation.finished.then(() => this.notifyFinished()).catch(noop);
        if (this.pendingTimeline) {
            this.stopTimeline = animation.attachTimeline(this.pendingTimeline);
            this.pendingTimeline = undefined;
        }
        this._animation = animation;
    }
    get finished() {
        if (!this._animation) {
            return this._finished;
        }
        else {
            return this.animation.finished;
        }
    }
    then(onResolve, _onReject) {
        return this.finished.finally(onResolve).then(() => { });
    }
    get animation() {
        if (!this._animation) {
            this.keyframeResolver?.resume();
            flushKeyframeResolvers();
        }
        return this._animation;
    }
    get duration() {
        return this.animation.duration;
    }
    get iterationDuration() {
        return this.animation.iterationDuration;
    }
    get time() {
        return this.animation.time;
    }
    set time(newTime) {
        this.animation.time = newTime;
    }
    get speed() {
        return this.animation.speed;
    }
    get state() {
        return this.animation.state;
    }
    set speed(newSpeed) {
        this.animation.speed = newSpeed;
    }
    get startTime() {
        return this.animation.startTime;
    }
    attachTimeline(timeline) {
        if (this._animation) {
            this.stopTimeline = this.animation.attachTimeline(timeline);
        }
        else {
            this.pendingTimeline = timeline;
        }
        return () => this.stop();
    }
    play() {
        this.animation.play();
    }
    pause() {
        this.animation.pause();
    }
    complete() {
        this.animation.complete();
    }
    cancel() {
        if (this._animation) {
            this.animation.cancel();
        }
        this.keyframeResolver?.cancel();
    }
}

/**
 * Parse Framer's special CSS variable format into a CSS token and a fallback.
 *
 * ```
 * `var(--foo, #fff)` => [`--foo`, '#fff']
 * ```
 *
 * @param current
 */
const splitCSSVariableRegex = 
// eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function parseCSSVariable(current) {
    const match = splitCSSVariableRegex.exec(current);
    if (!match)
        return [,];
    const [, token1, token2, fallback] = match;
    return [`--${token1 ?? token2}`, fallback];
}
function getVariableValue(current, element, depth = 1) {
    const [token, fallback] = parseCSSVariable(current);
    // No CSS variable detected
    if (!token)
        return;
    // Attempt to read this CSS variable off the element
    const resolved = window.getComputedStyle(element).getPropertyValue(token);
    if (resolved) {
        const trimmed = resolved.trim();
        return isNumericalString(trimmed) ? parseFloat(trimmed) : trimmed;
    }
    return isCSSVariableToken(fallback)
        ? getVariableValue(fallback, element, depth + 1)
        : fallback;
}

function getValueTransition(transition, key) {
    return (transition?.[key] ??
        transition?.["default"] ??
        transition);
}

const positionalKeys = new Set([
    "width",
    "height",
    "top",
    "left",
    "right",
    "bottom",
    ...transformPropOrder,
]);

/**
 * ValueType for "auto"
 */
const auto = {
    test: (v) => v === "auto",
    parse: (v) => v,
};

/**
 * Tests a provided value against a ValueType
 */
const testValueType = (v) => (type) => type.test(v);

/**
 * A list of value types commonly used for dimensions
 */
const dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
/**
 * Tests a dimensional value against the list of dimension ValueTypes
 */
const findDimensionValueType = (v) => dimensionValueTypes.find(testValueType(v));

function isNone(value) {
    if (typeof value === "number") {
        return value === 0;
    }
    else if (value !== null) {
        return value === "none" || value === "0" || isZeroValueString(value);
    }
    else {
        return true;
    }
}

/**
 * Properties that should default to 1 or 100%
 */
const maxDefaults = new Set(["brightness", "contrast", "saturate", "opacity"]);
function applyDefaultFilter(v) {
    const [name, value] = v.slice(0, -1).split("(");
    if (name === "drop-shadow")
        return v;
    const [number] = value.match(floatRegex) || [];
    if (!number)
        return v;
    const unit = value.replace(number, "");
    let defaultValue = maxDefaults.has(name) ? 1 : 0;
    if (number !== value)
        defaultValue *= 100;
    return name + "(" + defaultValue + unit + ")";
}
const functionRegex = /\b([a-z-]*)\(.*?\)/gu;
const filter = {
    ...complex,
    getAnimatableNone: (v) => {
        const functions = v.match(functionRegex);
        return functions ? functions.map(applyDefaultFilter).join(" ") : v;
    },
};

const int = {
    ...number,
    transform: Math.round,
};

const transformValueTypes = {
    rotate: degrees,
    rotateX: degrees,
    rotateY: degrees,
    rotateZ: degrees,
    scale,
    scaleX: scale,
    scaleY: scale,
    scaleZ: scale,
    skew: degrees,
    skewX: degrees,
    skewY: degrees,
    distance: px,
    translateX: px,
    translateY: px,
    translateZ: px,
    x: px,
    y: px,
    z: px,
    perspective: px,
    transformPerspective: px,
    opacity: alpha,
    originX: progressPercentage,
    originY: progressPercentage,
    originZ: px,
};

const numberValueTypes = {
    // Border props
    borderWidth: px,
    borderTopWidth: px,
    borderRightWidth: px,
    borderBottomWidth: px,
    borderLeftWidth: px,
    borderRadius: px,
    radius: px,
    borderTopLeftRadius: px,
    borderTopRightRadius: px,
    borderBottomRightRadius: px,
    borderBottomLeftRadius: px,
    // Positioning props
    width: px,
    maxWidth: px,
    height: px,
    maxHeight: px,
    top: px,
    right: px,
    bottom: px,
    left: px,
    // Spacing props
    padding: px,
    paddingTop: px,
    paddingRight: px,
    paddingBottom: px,
    paddingLeft: px,
    margin: px,
    marginTop: px,
    marginRight: px,
    marginBottom: px,
    marginLeft: px,
    // Misc
    backgroundPositionX: px,
    backgroundPositionY: px,
    ...transformValueTypes,
    zIndex: int,
    // SVG
    fillOpacity: alpha,
    strokeOpacity: alpha,
    numOctaves: int,
};

/**
 * A map of default value types for common values
 */
const defaultValueTypes = {
    ...numberValueTypes,
    // Color props
    color,
    backgroundColor: color,
    outlineColor: color,
    fill: color,
    stroke: color,
    // Border props
    borderColor: color,
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
    filter,
    WebkitFilter: filter,
};
/**
 * Gets the default ValueType for the provided value key
 */
const getDefaultValueType = (key) => defaultValueTypes[key];

function getAnimatableNone(key, value) {
    let defaultValueType = getDefaultValueType(key);
    if (defaultValueType !== filter)
        defaultValueType = complex;
    // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
    return defaultValueType.getAnimatableNone
        ? defaultValueType.getAnimatableNone(value)
        : undefined;
}

/**
 * If we encounter keyframes like "none" or "0" and we also have keyframes like
 * "#fff" or "200px 200px" we want to find a keyframe to serve as a template for
 * the "none" keyframes. In this case "#fff" or "200px 200px" - then these get turned into
 * zero equivalents, i.e. "#fff0" or "0px 0px".
 */
const invalidTemplates = new Set(["auto", "none", "0"]);
function makeNoneKeyframesAnimatable(unresolvedKeyframes, noneKeyframeIndexes, name) {
    let i = 0;
    let animatableTemplate = undefined;
    while (i < unresolvedKeyframes.length && !animatableTemplate) {
        const keyframe = unresolvedKeyframes[i];
        if (typeof keyframe === "string" &&
            !invalidTemplates.has(keyframe) &&
            analyseComplexValue(keyframe).values.length) {
            animatableTemplate = unresolvedKeyframes[i];
        }
        i++;
    }
    if (animatableTemplate && name) {
        for (const noneIndex of noneKeyframeIndexes) {
            unresolvedKeyframes[noneIndex] = getAnimatableNone(name, animatableTemplate);
        }
    }
}

class DOMKeyframesResolver extends KeyframeResolver {
    constructor(unresolvedKeyframes, onComplete, name, motionValue, element) {
        super(unresolvedKeyframes, onComplete, name, motionValue, element, true);
    }
    readKeyframes() {
        const { unresolvedKeyframes, element, name } = this;
        if (!element || !element.current)
            return;
        super.readKeyframes();
        /**
         * If any keyframe is a CSS variable, we need to find its value by sampling the element
         */
        for (let i = 0; i < unresolvedKeyframes.length; i++) {
            let keyframe = unresolvedKeyframes[i];
            if (typeof keyframe === "string") {
                keyframe = keyframe.trim();
                if (isCSSVariableToken(keyframe)) {
                    const resolved = getVariableValue(keyframe, element.current);
                    if (resolved !== undefined) {
                        unresolvedKeyframes[i] = resolved;
                    }
                    if (i === unresolvedKeyframes.length - 1) {
                        this.finalKeyframe = keyframe;
                    }
                }
            }
        }
        /**
         * Resolve "none" values. We do this potentially twice - once before and once after measuring keyframes.
         * This could be seen as inefficient but it's a trade-off to avoid measurements in more situations, which
         * have a far bigger performance impact.
         */
        this.resolveNoneKeyframes();
        /**
         * Check to see if unit type has changed. If so schedule jobs that will
         * temporarily set styles to the destination keyframes.
         * Skip if we have more than two keyframes or this isn't a positional value.
         * TODO: We can throw if there are multiple keyframes and the value type changes.
         */
        if (!positionalKeys.has(name) || unresolvedKeyframes.length !== 2) {
            return;
        }
        const [origin, target] = unresolvedKeyframes;
        const originType = findDimensionValueType(origin);
        const targetType = findDimensionValueType(target);
        /**
         * Either we don't recognise these value types or we can animate between them.
         */
        if (originType === targetType)
            return;
        /**
         * If both values are numbers or pixels, we can animate between them by
         * converting them to numbers.
         */
        if (isNumOrPxType(originType) && isNumOrPxType(targetType)) {
            for (let i = 0; i < unresolvedKeyframes.length; i++) {
                const value = unresolvedKeyframes[i];
                if (typeof value === "string") {
                    unresolvedKeyframes[i] = parseFloat(value);
                }
            }
        }
        else if (positionalValues[name]) {
            /**
             * Else, the only way to resolve this is by measuring the element.
             */
            this.needsMeasurement = true;
        }
    }
    resolveNoneKeyframes() {
        const { unresolvedKeyframes, name } = this;
        const noneKeyframeIndexes = [];
        for (let i = 0; i < unresolvedKeyframes.length; i++) {
            if (unresolvedKeyframes[i] === null ||
                isNone(unresolvedKeyframes[i])) {
                noneKeyframeIndexes.push(i);
            }
        }
        if (noneKeyframeIndexes.length) {
            makeNoneKeyframesAnimatable(unresolvedKeyframes, noneKeyframeIndexes, name);
        }
    }
    measureInitialState() {
        const { element, unresolvedKeyframes, name } = this;
        if (!element || !element.current)
            return;
        if (name === "height") {
            this.suspendedScrollY = window.pageYOffset;
        }
        this.measuredOrigin = positionalValues[name](element.measureViewportBox(), window.getComputedStyle(element.current));
        unresolvedKeyframes[0] = this.measuredOrigin;
        // Set final key frame to measure after next render
        const measureKeyframe = unresolvedKeyframes[unresolvedKeyframes.length - 1];
        if (measureKeyframe !== undefined) {
            element.getValue(name, measureKeyframe).jump(measureKeyframe, false);
        }
    }
    measureEndState() {
        const { element, name, unresolvedKeyframes } = this;
        if (!element || !element.current)
            return;
        const value = element.getValue(name);
        value && value.jump(this.measuredOrigin, false);
        const finalKeyframeIndex = unresolvedKeyframes.length - 1;
        const finalKeyframe = unresolvedKeyframes[finalKeyframeIndex];
        unresolvedKeyframes[finalKeyframeIndex] = positionalValues[name](element.measureViewportBox(), window.getComputedStyle(element.current));
        if (finalKeyframe !== null && this.finalKeyframe === undefined) {
            this.finalKeyframe = finalKeyframe;
        }
        // If we removed transform values, reapply them before the next render
        if (this.removedTransforms?.length) {
            this.removedTransforms.forEach(([unsetTransformName, unsetTransformValue]) => {
                element
                    .getValue(unsetTransformName)
                    .set(unsetTransformValue);
            });
        }
        this.resolveNoneKeyframes();
    }
}

function resolveElements(elementOrSelector, scope, selectorCache) {
    if (elementOrSelector instanceof EventTarget) {
        return [elementOrSelector];
    }
    else if (typeof elementOrSelector === "string") {
        let root = document;
        const elements = selectorCache?.[elementOrSelector] ??
            root.querySelectorAll(elementOrSelector);
        return elements ? Array.from(elements) : [];
    }
    return Array.from(elementOrSelector);
}

/**
 * Provided a value and a ValueType, returns the value as that value type.
 */
const getValueAsType = (value, type) => {
    return type && typeof value === "number"
        ? type.transform(value)
        : value;
};

/**
 * Checks if an element is an HTML element in a way
 * that works across iframes
 */
function isHTMLElement(element) {
    return isObject(element) && "offsetHeight" in element;
}

const MAX_VELOCITY_DELTA = 30;
const isFloat = (value) => {
  return !isNaN(parseFloat(value));
};
class MotionValue {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(init, options = {}) {
    this.canTrackVelocity = null;
    this.events = {};
    this.updateAndNotify = (v) => {
      const currentTime = time.now();
      if (this.updatedAt !== currentTime) {
        this.setPrevFrameValue();
      }
      this.prev = this.current;
      this.setCurrent(v);
      if (this.current !== this.prev) {
        this.events.change?.notify(this.current);
        if (this.dependents) {
          for (const dependent of this.dependents) {
            dependent.dirty();
          }
        }
      }
    };
    this.hasAnimated = false;
    this.setCurrent(init);
    this.owner = options.owner;
  }
  setCurrent(current) {
    this.current = current;
    this.updatedAt = time.now();
    if (this.canTrackVelocity === null && current !== void 0) {
      this.canTrackVelocity = isFloat(this.current);
    }
  }
  setPrevFrameValue(prevFrameValue = this.current) {
    this.prevFrameValue = prevFrameValue;
    this.prevUpdatedAt = this.updatedAt;
  }
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   *
   * When calling `onChange` inside a React component, it should be wrapped with the
   * `useEffect` hook. As it returns an unsubscribe function, this should be returned
   * from the `useEffect` function to ensure you don't add duplicate subscribers..
   *
   * ```jsx
   * export const MyComponent = () => {
   *   const x = useMotionValue(0)
   *   const y = useMotionValue(0)
   *   const opacity = useMotionValue(1)
   *
   *   useEffect(() => {
   *     function updateOpacity() {
   *       const maxXY = Math.max(x.get(), y.get())
   *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
   *       opacity.set(newOpacity)
   *     }
   *
   *     const unsubscribeX = x.on("change", updateOpacity)
   *     const unsubscribeY = y.on("change", updateOpacity)
   *
   *     return () => {
   *       unsubscribeX()
   *       unsubscribeY()
   *     }
   *   }, [])
   *
   *   return <motion.div style={{ x }} />
   * }
   * ```
   *
   * @param subscriber - A function that receives the latest value.
   * @returns A function that, when called, will cancel this subscription.
   *
   * @deprecated
   */
  onChange(subscription) {
    return this.on("change", subscription);
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = new SubscriptionManager();
    }
    const unsubscribe = this.events[eventName].add(callback);
    if (eventName === "change") {
      return () => {
        unsubscribe();
        frame.read(() => {
          if (!this.events.change.getSize()) {
            this.stop();
          }
        });
      };
    }
    return unsubscribe;
  }
  clearListeners() {
    for (const eventManagers in this.events) {
      this.events[eventManagers].clear();
    }
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(passiveEffect, stopPassiveEffect) {
    this.passiveEffect = passiveEffect;
    this.stopPassiveEffect = stopPassiveEffect;
  }
  /**
   * Sets the state of the `MotionValue`.
   *
   * @remarks
   *
   * ```jsx
   * const x = useMotionValue(0)
   * x.set(10)
   * ```
   *
   * @param latest - Latest value to set.
   * @param render - Whether to notify render subscribers. Defaults to `true`
   *
   * @public
   */
  set(v) {
    if (!this.passiveEffect) {
      this.updateAndNotify(v);
    } else {
      this.passiveEffect(v, this.updateAndNotify);
    }
  }
  setWithVelocity(prev, current, delta) {
    this.set(current);
    this.prev = void 0;
    this.prevFrameValue = prev;
    this.prevUpdatedAt = this.updatedAt - delta;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(v, endAnimation = true) {
    this.updateAndNotify(v);
    this.prev = v;
    this.prevUpdatedAt = this.prevFrameValue = void 0;
    endAnimation && this.stop();
    if (this.stopPassiveEffect)
      this.stopPassiveEffect();
  }
  dirty() {
    this.events.change?.notify(this.current);
  }
  addDependent(dependent) {
    if (!this.dependents) {
      this.dependents = /* @__PURE__ */ new Set();
    }
    this.dependents.add(dependent);
  }
  removeDependent(dependent) {
    if (this.dependents) {
      this.dependents.delete(dependent);
    }
  }
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   *
   * @public
   */
  get() {
    return this.current;
  }
  /**
   * @public
   */
  getPrevious() {
    return this.prev;
  }
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   *
   * @public
   */
  getVelocity() {
    const currentTime = time.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || currentTime - this.updatedAt > MAX_VELOCITY_DELTA) {
      return 0;
    }
    const delta = Math.min(this.updatedAt - this.prevUpdatedAt, MAX_VELOCITY_DELTA);
    return velocityPerSecond(parseFloat(this.current) - parseFloat(this.prevFrameValue), delta);
  }
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   *
   * ```jsx
   * value.start()
   * ```
   *
   * @param animation - A function that starts the provided animation
   */
  start(startAnimation) {
    this.stop();
    return new Promise((resolve) => {
      this.hasAnimated = true;
      this.animation = startAnimation(resolve);
      if (this.events.animationStart) {
        this.events.animationStart.notify();
      }
    }).then(() => {
      if (this.events.animationComplete) {
        this.events.animationComplete.notify();
      }
      this.clearAnimation();
    });
  }
  /**
   * Stop the currently active animation.
   *
   * @public
   */
  stop() {
    if (this.animation) {
      this.animation.stop();
      if (this.events.animationCancel) {
        this.events.animationCancel.notify();
      }
    }
    this.clearAnimation();
  }
  /**
   * Returns `true` if this value is currently animating.
   *
   * @public
   */
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   *
   * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
   * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
   * created a `MotionValue` via the `motionValue` function.
   *
   * @public
   */
  destroy() {
    this.dependents?.clear();
    this.events.destroy?.notify();
    this.clearListeners();
    this.stop();
    if (this.stopPassiveEffect) {
      this.stopPassiveEffect();
    }
  }
}
function motionValue(init, options) {
  return new MotionValue(init, options);
}

const { schedule: microtask} = 
/* @__PURE__ */ createRenderBatcher(queueMicrotask, false);

const isDragging = {
    x: false,
    y: false,
};
function isDragActive() {
    return isDragging.x || isDragging.y;
}

function setDragLock(axis) {
    if (axis === "x" || axis === "y") {
        if (isDragging[axis]) {
            return null;
        }
        else {
            isDragging[axis] = true;
            return () => {
                isDragging[axis] = false;
            };
        }
    }
    else {
        if (isDragging.x || isDragging.y) {
            return null;
        }
        else {
            isDragging.x = isDragging.y = true;
            return () => {
                isDragging.x = isDragging.y = false;
            };
        }
    }
}

function setupGesture(elementOrSelector, options) {
    const elements = resolveElements(elementOrSelector);
    const gestureAbortController = new AbortController();
    const eventOptions = {
        passive: true,
        ...options,
        signal: gestureAbortController.signal,
    };
    const cancel = () => gestureAbortController.abort();
    return [elements, eventOptions, cancel];
}

function isValidHover(event) {
    return !(event.pointerType === "touch" || isDragActive());
}
/**
 * Create a hover gesture. hover() is different to .addEventListener("pointerenter")
 * in that it has an easier syntax, filters out polyfilled touch events, interoperates
 * with drag gestures, and automatically removes the "pointerennd" event listener when the hover ends.
 *
 * @public
 */
function hover(elementOrSelector, onHoverStart, options = {}) {
    const [elements, eventOptions, cancel] = setupGesture(elementOrSelector, options);
    const onPointerEnter = (enterEvent) => {
        if (!isValidHover(enterEvent))
            return;
        const { target } = enterEvent;
        const onHoverEnd = onHoverStart(target, enterEvent);
        if (typeof onHoverEnd !== "function" || !target)
            return;
        const onPointerLeave = (leaveEvent) => {
            if (!isValidHover(leaveEvent))
                return;
            onHoverEnd(leaveEvent);
            target.removeEventListener("pointerleave", onPointerLeave);
        };
        target.addEventListener("pointerleave", onPointerLeave, eventOptions);
    };
    elements.forEach((element) => {
        element.addEventListener("pointerenter", onPointerEnter, eventOptions);
    });
    return cancel;
}

/**
 * Recursively traverse up the tree to check whether the provided child node
 * is the parent or a descendant of it.
 *
 * @param parent - Element to find
 * @param child - Element to test against parent
 */
const isNodeOrChild = (parent, child) => {
    if (!child) {
        return false;
    }
    else if (parent === child) {
        return true;
    }
    else {
        return isNodeOrChild(parent, child.parentElement);
    }
};

const isPrimaryPointer = (event) => {
    if (event.pointerType === "mouse") {
        return typeof event.button !== "number" || event.button <= 0;
    }
    else {
        /**
         * isPrimary is true for all mice buttons, whereas every touch point
         * is regarded as its own input. So subsequent concurrent touch points
         * will be false.
         *
         * Specifically match against false here as incomplete versions of
         * PointerEvents in very old browser might have it set as undefined.
         */
        return event.isPrimary !== false;
    }
};

const focusableElements = new Set([
    "BUTTON",
    "INPUT",
    "SELECT",
    "TEXTAREA",
    "A",
]);
function isElementKeyboardAccessible(element) {
    return (focusableElements.has(element.tagName) ||
        element.tabIndex !== -1);
}

const isPressing = new WeakSet();

/**
 * Filter out events that are not "Enter" keys.
 */
function filterEvents(callback) {
    return (event) => {
        if (event.key !== "Enter")
            return;
        callback(event);
    };
}
function firePointerEvent(target, type) {
    target.dispatchEvent(new PointerEvent("pointer" + type, { isPrimary: true, bubbles: true }));
}
const enableKeyboardPress = (focusEvent, eventOptions) => {
    const element = focusEvent.currentTarget;
    if (!element)
        return;
    const handleKeydown = filterEvents(() => {
        if (isPressing.has(element))
            return;
        firePointerEvent(element, "down");
        const handleKeyup = filterEvents(() => {
            firePointerEvent(element, "up");
        });
        const handleBlur = () => firePointerEvent(element, "cancel");
        element.addEventListener("keyup", handleKeyup, eventOptions);
        element.addEventListener("blur", handleBlur, eventOptions);
    });
    element.addEventListener("keydown", handleKeydown, eventOptions);
    /**
     * Add an event listener that fires on blur to remove the keydown events.
     */
    element.addEventListener("blur", () => element.removeEventListener("keydown", handleKeydown), eventOptions);
};

/**
 * Filter out events that are not primary pointer events, or are triggering
 * while a Motion gesture is active.
 */
function isValidPressEvent(event) {
    return isPrimaryPointer(event) && !isDragActive();
}
/**
 * Create a press gesture.
 *
 * Press is different to `"pointerdown"`, `"pointerup"` in that it
 * automatically filters out secondary pointer events like right
 * click and multitouch.
 *
 * It also adds accessibility support for keyboards, where
 * an element with a press gesture will receive focus and
 *  trigger on Enter `"keydown"` and `"keyup"` events.
 *
 * This is different to a browser's `"click"` event, which does
 * respond to keyboards but only for the `"click"` itself, rather
 * than the press start and end/cancel. The element also needs
 * to be focusable for this to work, whereas a press gesture will
 * make an element focusable by default.
 *
 * @public
 */
function press(targetOrSelector, onPressStart, options = {}) {
    const [targets, eventOptions, cancelEvents] = setupGesture(targetOrSelector, options);
    const startPress = (startEvent) => {
        const target = startEvent.currentTarget;
        if (!isValidPressEvent(startEvent))
            return;
        isPressing.add(target);
        const onPressEnd = onPressStart(target, startEvent);
        const onPointerEnd = (endEvent, success) => {
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerCancel);
            if (isPressing.has(target)) {
                isPressing.delete(target);
            }
            if (!isValidPressEvent(endEvent)) {
                return;
            }
            if (typeof onPressEnd === "function") {
                onPressEnd(endEvent, { success });
            }
        };
        const onPointerUp = (upEvent) => {
            onPointerEnd(upEvent, target === window ||
                target === document ||
                options.useGlobalTarget ||
                isNodeOrChild(target, upEvent.target));
        };
        const onPointerCancel = (cancelEvent) => {
            onPointerEnd(cancelEvent, false);
        };
        window.addEventListener("pointerup", onPointerUp, eventOptions);
        window.addEventListener("pointercancel", onPointerCancel, eventOptions);
    };
    targets.forEach((target) => {
        const pointerDownTarget = options.useGlobalTarget ? window : target;
        pointerDownTarget.addEventListener("pointerdown", startPress, eventOptions);
        if (isHTMLElement(target)) {
            target.addEventListener("focus", (event) => enableKeyboardPress(event, eventOptions));
            if (!isElementKeyboardAccessible(target) &&
                !target.hasAttribute("tabindex")) {
                target.tabIndex = 0;
            }
        }
    });
    return cancelEvents;
}

/**
 * Checks if an element is an SVG element in a way
 * that works across iframes
 */
function isSVGElement(element) {
    return isObject(element) && "ownerSVGElement" in element;
}

/**
 * Checks if an element is specifically an SVGSVGElement (the root SVG element)
 * in a way that works across iframes
 */
function isSVGSVGElement(element) {
    return isSVGElement(element) && element.tagName === "svg";
}

const isMotionValue = (value) => Boolean(value && value.getVelocity);

/**
 * A list of all ValueTypes
 */
const valueTypes = [...dimensionValueTypes, color, complex];
/**
 * Tests a value against the list of ValueTypes
 */
const findValueType = (v) => valueTypes.find(testValueType(v));

/**
 * @public
 */
const MotionConfigContext = reactExports.createContext({
    transformPagePoint: (p) => p,
    isStatic: false,
    reducedMotion: "never",
});

/**
 * Taken from https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/compose-refs.tsx
 */
/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef(ref, value) {
    if (typeof ref === "function") {
        return ref(value);
    }
    else if (ref !== null && ref !== undefined) {
        ref.current = value;
    }
}
/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
function composeRefs(...refs) {
    return (node) => {
        let hasCleanup = false;
        const cleanups = refs.map((ref) => {
            const cleanup = setRef(ref, node);
            if (!hasCleanup && typeof cleanup === "function") {
                hasCleanup = true;
            }
            return cleanup;
        });
        // React <19 will log an error to the console if a callback ref returns a
        // value. We don't use ref cleanups internally so this will only happen if a
        // user's ref callback returns a value, which we only expect if they are
        // using the cleanup functionality added in React 19.
        if (hasCleanup) {
            return () => {
                for (let i = 0; i < cleanups.length; i++) {
                    const cleanup = cleanups[i];
                    if (typeof cleanup === "function") {
                        cleanup();
                    }
                    else {
                        setRef(refs[i], null);
                    }
                }
            };
        }
    };
}
/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
function useComposedRefs(...refs) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return reactExports.useCallback(composeRefs(...refs), refs);
}

/**
 * Measurement functionality has to be within a separate component
 * to leverage snapshot lifecycle.
 */
class PopChildMeasure extends reactExports.Component {
    getSnapshotBeforeUpdate(prevProps) {
        const element = this.props.childRef.current;
        if (element && prevProps.isPresent && !this.props.isPresent) {
            const parent = element.offsetParent;
            const parentWidth = isHTMLElement(parent)
                ? parent.offsetWidth || 0
                : 0;
            const size = this.props.sizeRef.current;
            size.height = element.offsetHeight || 0;
            size.width = element.offsetWidth || 0;
            size.top = element.offsetTop;
            size.left = element.offsetLeft;
            size.right = parentWidth - size.width - size.left;
        }
        return null;
    }
    /**
     * Required with getSnapshotBeforeUpdate to stop React complaining.
     */
    componentDidUpdate() { }
    render() {
        return this.props.children;
    }
}
function PopChild({ children, isPresent, anchorX, root }) {
    const id = reactExports.useId();
    const ref = reactExports.useRef(null);
    const size = reactExports.useRef({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
    });
    const { nonce } = reactExports.useContext(MotionConfigContext);
    const composedRef = useComposedRefs(ref, children?.ref);
    /**
     * We create and inject a style block so we can apply this explicit
     * sizing in a non-destructive manner by just deleting the style block.
     *
     * We can't apply size via render as the measurement happens
     * in getSnapshotBeforeUpdate (post-render), likewise if we apply the
     * styles directly on the DOM node, we might be overwriting
     * styles set via the style prop.
     */
    reactExports.useInsertionEffect(() => {
        const { width, height, top, left, right } = size.current;
        if (isPresent || !ref.current || !width || !height)
            return;
        const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
        ref.current.dataset.motionPopId = id;
        const style = document.createElement("style");
        if (nonce)
            style.nonce = nonce;
        const parent = root ?? document.head;
        parent.appendChild(style);
        if (style.sheet) {
            style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            top: ${top}px !important;
          }
        `);
        }
        return () => {
            if (parent.contains(style)) {
                parent.removeChild(style);
            }
        };
    }, [isPresent]);
    return (jsxRuntimeExports.jsx(PopChildMeasure, { isPresent: isPresent, childRef: ref, sizeRef: size, children: reactExports.cloneElement(children, { ref: composedRef }) }));
}

const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, root }) => {
    const presenceChildren = useConstant(newChildrenMap);
    const id = reactExports.useId();
    let isReusedContext = true;
    let context = reactExports.useMemo(() => {
        isReusedContext = false;
        return {
            id,
            initial,
            isPresent,
            custom,
            onExitComplete: (childId) => {
                presenceChildren.set(childId, true);
                for (const isComplete of presenceChildren.values()) {
                    if (!isComplete)
                        return; // can stop searching when any is incomplete
                }
                onExitComplete && onExitComplete();
            },
            register: (childId) => {
                presenceChildren.set(childId, false);
                return () => presenceChildren.delete(childId);
            },
        };
    }, [isPresent, presenceChildren, onExitComplete]);
    /**
     * If the presence of a child affects the layout of the components around it,
     * we want to make a new context value to ensure they get re-rendered
     * so they can detect that layout change.
     */
    if (presenceAffectsLayout && isReusedContext) {
        context = { ...context };
    }
    reactExports.useMemo(() => {
        presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
    }, [isPresent]);
    /**
     * If there's no `motion` components to fire exit animations, we want to remove this
     * component immediately.
     */
    reactExports.useEffect(() => {
        !isPresent &&
            !presenceChildren.size &&
            onExitComplete &&
            onExitComplete();
    }, [isPresent]);
    if (mode === "popLayout") {
        children = (jsxRuntimeExports.jsx(PopChild, { isPresent: isPresent, anchorX: anchorX, root: root, children: children }));
    }
    return (jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children: children }));
};
function newChildrenMap() {
    return new Map();
}

/**
 * When a component is the child of `AnimatePresence`, it can use `usePresence`
 * to access information about whether it's still present in the React tree.
 *
 * ```jsx
 * import { usePresence } from "framer-motion"
 *
 * export const Component = () => {
 *   const [isPresent, safeToRemove] = usePresence()
 *
 *   useEffect(() => {
 *     !isPresent && setTimeout(safeToRemove, 1000)
 *   }, [isPresent])
 *
 *   return <div />
 * }
 * ```
 *
 * If `isPresent` is `false`, it means that a component has been removed the tree, but
 * `AnimatePresence` won't really remove it until `safeToRemove` has been called.
 *
 * @public
 */
function usePresence(subscribe = true) {
    const context = reactExports.useContext(PresenceContext);
    if (context === null)
        return [true, null];
    const { isPresent, onExitComplete, register } = context;
    // It's safe to call the following hooks conditionally (after an early return) because the context will always
    // either be null or non-null for the lifespan of the component.
    const id = reactExports.useId();
    reactExports.useEffect(() => {
        if (subscribe) {
            return register(id);
        }
    }, [subscribe]);
    const safeToRemove = reactExports.useCallback(() => subscribe && onExitComplete && onExitComplete(id), [id, onExitComplete, subscribe]);
    return !isPresent && onExitComplete ? [false, safeToRemove] : [true];
}

const getChildKey = (child) => child.key || "";
function onlyElements(children) {
    const filtered = [];
    // We use forEach here instead of map as map mutates the component key by preprending `.$`
    reactExports.Children.forEach(children, (child) => {
        if (reactExports.isValidElement(child))
            filtered.push(child);
    });
    return filtered;
}

const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitComplete.has(key)) {
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender?.();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && safeToRemove?.();
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, children: child }, key);
  }) });
};

/**
 * Note: Still used by components generated by old versions of Framer
 *
 * @deprecated
 */
const DeprecatedLayoutGroupContext = reactExports.createContext(null);

function useIsMounted() {
    const isMounted = reactExports.useRef(false);
    useIsomorphicLayoutEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    return isMounted;
}

function useForceUpdate() {
    const isMounted = useIsMounted();
    const [forcedRenderCount, setForcedRenderCount] = reactExports.useState(0);
    const forceRender = reactExports.useCallback(() => {
        isMounted.current && setForcedRenderCount(forcedRenderCount + 1);
    }, [forcedRenderCount]);
    /**
     * Defer this to the end of the next animation frame in case there are multiple
     * synchronous calls.
     */
    const deferredForceRender = reactExports.useCallback(() => frame.postRender(forceRender), [forceRender]);
    return [deferredForceRender, forcedRenderCount];
}

const notify = (node) => !node.isLayoutDirty && node.willUpdate(false);
function nodeGroup() {
    const nodes = new Set();
    const subscriptions = new WeakMap();
    const dirtyAll = () => nodes.forEach(notify);
    return {
        add: (node) => {
            nodes.add(node);
            subscriptions.set(node, node.addEventListener("willUpdate", dirtyAll));
        },
        remove: (node) => {
            nodes.delete(node);
            const unsubscribe = subscriptions.get(node);
            if (unsubscribe) {
                unsubscribe();
                subscriptions.delete(node);
            }
            dirtyAll();
        },
        dirty: dirtyAll,
    };
}

const shouldInheritGroup = (inherit) => inherit === true;
const shouldInheritId = (inherit) => shouldInheritGroup(inherit === true) || inherit === "id";
const LayoutGroup = ({ children, id, inherit = true }) => {
    const layoutGroupContext = reactExports.useContext(LayoutGroupContext);
    const deprecatedLayoutGroupContext = reactExports.useContext(DeprecatedLayoutGroupContext);
    const [forceRender, key] = useForceUpdate();
    const context = reactExports.useRef(null);
    const upstreamId = layoutGroupContext.id || deprecatedLayoutGroupContext;
    if (context.current === null) {
        if (shouldInheritId(inherit) && upstreamId) {
            id = id ? upstreamId + "-" + id : upstreamId;
        }
        context.current = {
            id,
            group: shouldInheritGroup(inherit)
                ? layoutGroupContext.group || nodeGroup()
                : nodeGroup(),
        };
    }
    const memoizedContext = reactExports.useMemo(() => ({ ...context.current, forceRender }), [key]);
    return (jsxRuntimeExports.jsx(LayoutGroupContext.Provider, { value: memoizedContext, children: children }));
};

const LazyContext = reactExports.createContext({ strict: false });

const featureProps = {
    animation: [
        "animate",
        "variants",
        "whileHover",
        "whileTap",
        "exit",
        "whileInView",
        "whileFocus",
        "whileDrag",
    ],
    exit: ["exit"],
    drag: ["drag", "dragControls"],
    focus: ["whileFocus"],
    hover: ["whileHover", "onHoverStart", "onHoverEnd"],
    tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
    pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
    inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
    layout: ["layout", "layoutId"],
};
const featureDefinitions = {};
for (const key in featureProps) {
    featureDefinitions[key] = {
        isEnabled: (props) => featureProps[key].some((name) => !!props[name]),
    };
}

function loadFeatures(features) {
    for (const key in features) {
        featureDefinitions[key] = {
            ...featureDefinitions[key],
            ...features[key],
        };
    }
}

const validMotionProps = /* @__PURE__ */ new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "ignoreStrict",
  "viewport"
]);
function isValidMotionProp(key) {
  return key.startsWith("while") || key.startsWith("drag") && key !== "draggable" || key.startsWith("layout") || key.startsWith("onTap") || key.startsWith("onPan") || key.startsWith("onLayout") || validMotionProps.has(key);
}

let shouldForward = (key) => !isValidMotionProp(key);
function loadExternalIsValidProp(isValidProp) {
    if (typeof isValidProp !== "function")
        return;
    // Explicitly filter our events
    shouldForward = (key) => key.startsWith("on") ? !isValidMotionProp(key) : isValidProp(key);
}
/**
 * Emotion and Styled Components both allow users to pass through arbitrary props to their components
 * to dynamically generate CSS. They both use the `@emotion/is-prop-valid` package to determine which
 * of these should be passed to the underlying DOM node.
 *
 * However, when styling a Motion component `styled(motion.div)`, both packages pass through *all* props
 * as it's seen as an arbitrary component rather than a DOM node. Motion only allows arbitrary props
 * passed through the `custom` prop so it doesn't *need* the payload or computational overhead of
 * `@emotion/is-prop-valid`, however to fix this problem we need to use it.
 *
 * By making it an optionalDependency we can offer this functionality only in the situations where it's
 * actually required.
 */
try {
    /**
     * We attempt to import this package but require won't be defined in esm environments, in that case
     * isPropValid will have to be provided via `MotionContext`. In a 6.0.0 this should probably be removed
     * in favour of explicit injection.
     */
    loadExternalIsValidProp(require("@emotion/is-prop-valid").default);
}
catch {
    // We don't need to actually do anything here - the fallback is the existing `isPropValid`.
}
function filterProps(props, isDom, forwardMotionProps) {
    const filteredProps = {};
    for (const key in props) {
        /**
         * values is considered a valid prop by Emotion, so if it's present
         * this will be rendered out to the DOM unless explicitly filtered.
         *
         * We check the type as it could be used with the `feColorMatrix`
         * element, which we support.
         */
        if (key === "values" && typeof props.values === "object")
            continue;
        if (shouldForward(key) ||
            (forwardMotionProps === true && isValidMotionProp(key)) ||
            (!isDom && !isValidMotionProp(key)) ||
            // If trying to use native HTML drag events, forward drag listeners
            (props["draggable"] &&
                key.startsWith("onDrag"))) {
            filteredProps[key] =
                props[key];
        }
    }
    return filteredProps;
}

const MotionContext = /* @__PURE__ */ reactExports.createContext({});

function isAnimationControls(v) {
    return (v !== null &&
        typeof v === "object" &&
        typeof v.start === "function");
}

/**
 * Decides if the supplied variable is variant label
 */
function isVariantLabel(v) {
    return typeof v === "string" || Array.isArray(v);
}

const variantPriorityOrder = [
    "animate",
    "whileInView",
    "whileFocus",
    "whileHover",
    "whileTap",
    "whileDrag",
    "exit",
];
const variantProps = ["initial", ...variantPriorityOrder];

function isControllingVariants(props) {
    return (isAnimationControls(props.animate) ||
        variantProps.some((name) => isVariantLabel(props[name])));
}
function isVariantNode(props) {
    return Boolean(isControllingVariants(props) || props.variants);
}

function getCurrentTreeVariants(props, context) {
    if (isControllingVariants(props)) {
        const { initial, animate } = props;
        return {
            initial: initial === false || isVariantLabel(initial)
                ? initial
                : undefined,
            animate: isVariantLabel(animate) ? animate : undefined,
        };
    }
    return props.inherit !== false ? context : {};
}

function useCreateMotionContext(props) {
    const { initial, animate } = getCurrentTreeVariants(props, reactExports.useContext(MotionContext));
    return reactExports.useMemo(() => ({ initial, animate }), [variantLabelsAsDependency(initial), variantLabelsAsDependency(animate)]);
}
function variantLabelsAsDependency(prop) {
    return Array.isArray(prop) ? prop.join(" ") : prop;
}

const scaleCorrectors = {};
function addScaleCorrector(correctors) {
    for (const key in correctors) {
        scaleCorrectors[key] = correctors[key];
        if (isCSSVariableName(key)) {
            scaleCorrectors[key].isCSSVariable = true;
        }
    }
}

function isForcedMotionValue(key, { layout, layoutId }) {
    return (transformProps.has(key) ||
        key.startsWith("origin") ||
        ((layout || layoutId !== undefined) &&
            (!!scaleCorrectors[key] || key === "opacity")));
}

const translateAlias = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
};
const numTransforms = transformPropOrder.length;
/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
function buildTransform(latestValues, transform, transformTemplate) {
    // The transform string we're going to build into.
    let transformString = "";
    let transformIsDefault = true;
    /**
     * Loop over all possible transforms in order, adding the ones that
     * are present to the transform string.
     */
    for (let i = 0; i < numTransforms; i++) {
        const key = transformPropOrder[i];
        const value = latestValues[key];
        if (value === undefined)
            continue;
        let valueIsDefault = true;
        if (typeof value === "number") {
            valueIsDefault = value === (key.startsWith("scale") ? 1 : 0);
        }
        else {
            valueIsDefault = parseFloat(value) === 0;
        }
        if (!valueIsDefault || transformTemplate) {
            const valueAsType = getValueAsType(value, numberValueTypes[key]);
            if (!valueIsDefault) {
                transformIsDefault = false;
                const transformName = translateAlias[key] || key;
                transformString += `${transformName}(${valueAsType}) `;
            }
            if (transformTemplate) {
                transform[key] = valueAsType;
            }
        }
    }
    transformString = transformString.trim();
    // If we have a custom `transform` template, pass our transform values and
    // generated transformString to that before returning
    if (transformTemplate) {
        transformString = transformTemplate(transform, transformIsDefault ? "" : transformString);
    }
    else if (transformIsDefault) {
        transformString = "none";
    }
    return transformString;
}

function buildHTMLStyles(state, latestValues, transformTemplate) {
    const { style, vars, transformOrigin } = state;
    // Track whether we encounter any transform or transformOrigin values.
    let hasTransform = false;
    let hasTransformOrigin = false;
    /**
     * Loop over all our latest animated values and decide whether to handle them
     * as a style or CSS variable.
     *
     * Transforms and transform origins are kept separately for further processing.
     */
    for (const key in latestValues) {
        const value = latestValues[key];
        if (transformProps.has(key)) {
            // If this is a transform, flag to enable further transform processing
            hasTransform = true;
            continue;
        }
        else if (isCSSVariableName(key)) {
            vars[key] = value;
            continue;
        }
        else {
            // Convert the value to its default value type, ie 0 -> "0px"
            const valueAsType = getValueAsType(value, numberValueTypes[key]);
            if (key.startsWith("origin")) {
                // If this is a transform origin, flag and enable further transform-origin processing
                hasTransformOrigin = true;
                transformOrigin[key] =
                    valueAsType;
            }
            else {
                style[key] = valueAsType;
            }
        }
    }
    if (!latestValues.transform) {
        if (hasTransform || transformTemplate) {
            style.transform = buildTransform(latestValues, state.transform, transformTemplate);
        }
        else if (style.transform) {
            /**
             * If we have previously created a transform but currently don't have any,
             * reset transform style to none.
             */
            style.transform = "none";
        }
    }
    /**
     * Build a transformOrigin style. Uses the same defaults as the browser for
     * undefined origins.
     */
    if (hasTransformOrigin) {
        const { originX = "50%", originY = "50%", originZ = 0, } = transformOrigin;
        style.transformOrigin = `${originX} ${originY} ${originZ}`;
    }
}

const createHtmlRenderState = () => ({
    style: {},
    transform: {},
    transformOrigin: {},
    vars: {},
});

function copyRawValuesOnly(target, source, props) {
    for (const key in source) {
        if (!isMotionValue(source[key]) && !isForcedMotionValue(key, props)) {
            target[key] = source[key];
        }
    }
}
function useInitialMotionValues({ transformTemplate }, visualState) {
    return reactExports.useMemo(() => {
        const state = createHtmlRenderState();
        buildHTMLStyles(state, visualState, transformTemplate);
        return Object.assign({}, state.vars, state.style);
    }, [visualState]);
}
function useStyle(props, visualState) {
    const styleProp = props.style || {};
    const style = {};
    /**
     * Copy non-Motion Values straight into style
     */
    copyRawValuesOnly(style, styleProp, props);
    Object.assign(style, useInitialMotionValues(props, visualState));
    return style;
}
function useHTMLProps(props, visualState) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps = {};
    const style = useStyle(props, visualState);
    if (props.drag && props.dragListener !== false) {
        // Disable the ghost element when a user drags
        htmlProps.draggable = false;
        // Disable text selection
        style.userSelect =
            style.WebkitUserSelect =
                style.WebkitTouchCallout =
                    "none";
        // Disable scrolling on the draggable direction
        style.touchAction =
            props.drag === true
                ? "none"
                : `pan-${props.drag === "x" ? "y" : "x"}`;
    }
    if (props.tabIndex === undefined &&
        (props.onTap || props.onTapStart || props.whileTap)) {
        htmlProps.tabIndex = 0;
    }
    htmlProps.style = style;
    return htmlProps;
}

const dashKeys = {
    offset: "stroke-dashoffset",
    array: "stroke-dasharray",
};
const camelKeys = {
    offset: "strokeDashoffset",
    array: "strokeDasharray",
};
/**
 * Build SVG path properties. Uses the path's measured length to convert
 * our custom pathLength, pathSpacing and pathOffset into stroke-dashoffset
 * and stroke-dasharray attributes.
 *
 * This function is mutative to reduce per-frame GC.
 */
function buildSVGPath(attrs, length, spacing = 1, offset = 0, useDashCase = true) {
    // Normalise path length by setting SVG attribute pathLength to 1
    attrs.pathLength = 1;
    // We use dash case when setting attributes directly to the DOM node and camel case
    // when defining props on a React component.
    const keys = useDashCase ? dashKeys : camelKeys;
    // Build the dash offset
    attrs[keys.offset] = px.transform(-offset);
    // Build the dash array
    const pathLength = px.transform(length);
    const pathSpacing = px.transform(spacing);
    attrs[keys.array] = `${pathLength} ${pathSpacing}`;
}

/**
 * Build SVG visual attributes, like cx and style.transform
 */
function buildSVGAttrs(state, { attrX, attrY, attrScale, pathLength, pathSpacing = 1, pathOffset = 0, 
// This is object creation, which we try to avoid per-frame.
...latest }, isSVGTag, transformTemplate, styleProp) {
    buildHTMLStyles(state, latest, transformTemplate);
    /**
     * For svg tags we just want to make sure viewBox is animatable and treat all the styles
     * as normal HTML tags.
     */
    if (isSVGTag) {
        if (state.style.viewBox) {
            state.attrs.viewBox = state.style.viewBox;
        }
        return;
    }
    state.attrs = state.style;
    state.style = {};
    const { attrs, style } = state;
    /**
     * However, we apply transforms as CSS transforms.
     * So if we detect a transform, transformOrigin we take it from attrs and copy it into style.
     */
    if (attrs.transform) {
        style.transform = attrs.transform;
        delete attrs.transform;
    }
    if (style.transform || attrs.transformOrigin) {
        style.transformOrigin = attrs.transformOrigin ?? "50% 50%";
        delete attrs.transformOrigin;
    }
    if (style.transform) {
        /**
         * SVG's element transform-origin uses its own median as a reference.
         * Therefore, transformBox becomes a fill-box
         */
        style.transformBox = styleProp?.transformBox ?? "fill-box";
        delete attrs.transformBox;
    }
    // Render attrX/attrY/attrScale as attributes
    if (attrX !== undefined)
        attrs.x = attrX;
    if (attrY !== undefined)
        attrs.y = attrY;
    if (attrScale !== undefined)
        attrs.scale = attrScale;
    // Build SVG path if one has been defined
    if (pathLength !== undefined) {
        buildSVGPath(attrs, pathLength, pathSpacing, pathOffset, false);
    }
}

const createSvgRenderState = () => ({
    ...createHtmlRenderState(),
    attrs: {},
});

const isSVGTag = (tag) => typeof tag === "string" && tag.toLowerCase() === "svg";

function useSVGProps(props, visualState, _isStatic, Component) {
    const visualProps = reactExports.useMemo(() => {
        const state = createSvgRenderState();
        buildSVGAttrs(state, visualState, isSVGTag(Component), props.transformTemplate, props.style);
        return {
            ...state.attrs,
            style: { ...state.style },
        };
    }, [visualState]);
    if (props.style) {
        const rawStyles = {};
        copyRawValuesOnly(rawStyles, props.style, props);
        visualProps.style = { ...rawStyles, ...visualProps.style };
    }
    return visualProps;
}

/**
 * We keep these listed separately as we use the lowercase tag names as part
 * of the runtime bundle to detect SVG components
 */
const lowercaseSVGElements = [
    "animate",
    "circle",
    "defs",
    "desc",
    "ellipse",
    "g",
    "image",
    "line",
    "filter",
    "marker",
    "mask",
    "metadata",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "rect",
    "stop",
    "switch",
    "symbol",
    "svg",
    "text",
    "tspan",
    "use",
    "view",
];

function isSVGComponent(Component) {
    if (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof Component !== "string" ||
        /**
         * If it contains a dash, the element is a custom HTML webcomponent.
         */
        Component.includes("-")) {
        return false;
    }
    else if (
    /**
     * If it's in our list of lowercase SVG tags, it's an SVG component
     */
    lowercaseSVGElements.indexOf(Component) > -1 ||
        /**
         * If it contains a capital letter, it's an SVG component
         */
        /[A-Z]/u.test(Component)) {
        return true;
    }
    return false;
}

function useRender(Component, props, ref, { latestValues, }, isStatic, forwardMotionProps = false) {
    const useVisualProps = isSVGComponent(Component)
        ? useSVGProps
        : useHTMLProps;
    const visualProps = useVisualProps(props, latestValues, isStatic, Component);
    const filteredProps = filterProps(props, typeof Component === "string", forwardMotionProps);
    const elementProps = Component !== reactExports.Fragment ? { ...filteredProps, ...visualProps, ref } : {};
    /**
     * If component has been handed a motion value as its child,
     * memoise its initial value and render that. Subsequent updates
     * will be handled by the onChange handler
     */
    const { children } = props;
    const renderedChildren = reactExports.useMemo(() => (isMotionValue(children) ? children.get() : children), [children]);
    return reactExports.createElement(Component, {
        ...elementProps,
        children: renderedChildren,
    });
}

function getValueState(visualElement) {
    const state = [{}, {}];
    visualElement?.values.forEach((value, key) => {
        state[0][key] = value.get();
        state[1][key] = value.getVelocity();
    });
    return state;
}
function resolveVariantFromProps(props, definition, custom, visualElement) {
    /**
     * If the variant definition is a function, resolve.
     */
    if (typeof definition === "function") {
        const [current, velocity] = getValueState(visualElement);
        definition = definition(custom !== undefined ? custom : props.custom, current, velocity);
    }
    /**
     * If the variant definition is a variant label, or
     * the function returned a variant label, resolve.
     */
    if (typeof definition === "string") {
        definition = props.variants && props.variants[definition];
    }
    /**
     * At this point we've resolved both functions and variant labels,
     * but the resolved variant label might itself have been a function.
     * If so, resolve. This can only have returned a valid target object.
     */
    if (typeof definition === "function") {
        const [current, velocity] = getValueState(visualElement);
        definition = definition(custom !== undefined ? custom : props.custom, current, velocity);
    }
    return definition;
}

/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * TODO: Remove and move to library
 */
function resolveMotionValue(value) {
    return isMotionValue(value) ? value.get() : value;
}

function makeState({ scrapeMotionValuesFromProps, createRenderState, }, props, context, presenceContext) {
    const state = {
        latestValues: makeLatestValues(props, context, presenceContext, scrapeMotionValuesFromProps),
        renderState: createRenderState(),
    };
    return state;
}
function makeLatestValues(props, context, presenceContext, scrapeMotionValues) {
    const values = {};
    const motionValues = scrapeMotionValues(props, {});
    for (const key in motionValues) {
        values[key] = resolveMotionValue(motionValues[key]);
    }
    let { initial, animate } = props;
    const isControllingVariants$1 = isControllingVariants(props);
    const isVariantNode$1 = isVariantNode(props);
    if (context &&
        isVariantNode$1 &&
        !isControllingVariants$1 &&
        props.inherit !== false) {
        if (initial === undefined)
            initial = context.initial;
        if (animate === undefined)
            animate = context.animate;
    }
    let isInitialAnimationBlocked = presenceContext
        ? presenceContext.initial === false
        : false;
    isInitialAnimationBlocked = isInitialAnimationBlocked || initial === false;
    const variantToSet = isInitialAnimationBlocked ? animate : initial;
    if (variantToSet &&
        typeof variantToSet !== "boolean" &&
        !isAnimationControls(variantToSet)) {
        const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet];
        for (let i = 0; i < list.length; i++) {
            const resolved = resolveVariantFromProps(props, list[i]);
            if (resolved) {
                const { transitionEnd, transition, ...target } = resolved;
                for (const key in target) {
                    let valueTarget = target[key];
                    if (Array.isArray(valueTarget)) {
                        /**
                         * Take final keyframe if the initial animation is blocked because
                         * we want to initialise at the end of that blocked animation.
                         */
                        const index = isInitialAnimationBlocked
                            ? valueTarget.length - 1
                            : 0;
                        valueTarget = valueTarget[index];
                    }
                    if (valueTarget !== null) {
                        values[key] = valueTarget;
                    }
                }
                for (const key in transitionEnd) {
                    values[key] = transitionEnd[key];
                }
            }
        }
    }
    return values;
}
const makeUseVisualState = (config) => (props, isStatic) => {
    const context = reactExports.useContext(MotionContext);
    const presenceContext = reactExports.useContext(PresenceContext);
    const make = () => makeState(config, props, context, presenceContext);
    return isStatic ? make() : useConstant(make);
};

function scrapeMotionValuesFromProps$1(props, prevProps, visualElement) {
    const { style } = props;
    const newValues = {};
    for (const key in style) {
        if (isMotionValue(style[key]) ||
            (prevProps.style &&
                isMotionValue(prevProps.style[key])) ||
            isForcedMotionValue(key, props) ||
            visualElement?.getValue(key)?.liveStyle !== undefined) {
            newValues[key] = style[key];
        }
    }
    return newValues;
}

const useHTMLVisualState = /*@__PURE__*/ makeUseVisualState({
    scrapeMotionValuesFromProps: scrapeMotionValuesFromProps$1,
    createRenderState: createHtmlRenderState,
});

function scrapeMotionValuesFromProps(props, prevProps, visualElement) {
    const newValues = scrapeMotionValuesFromProps$1(props, prevProps, visualElement);
    for (const key in props) {
        if (isMotionValue(props[key]) ||
            isMotionValue(prevProps[key])) {
            const targetKey = transformPropOrder.indexOf(key) !== -1
                ? "attr" + key.charAt(0).toUpperCase() + key.substring(1)
                : key;
            newValues[targetKey] = props[key];
        }
    }
    return newValues;
}

const useSVGVisualState = /*@__PURE__*/ makeUseVisualState({
    scrapeMotionValuesFromProps: scrapeMotionValuesFromProps,
    createRenderState: createSvgRenderState,
});

const motionComponentSymbol = Symbol.for("motionComponentSymbol");

function isRefObject(ref) {
    return (ref &&
        typeof ref === "object" &&
        Object.prototype.hasOwnProperty.call(ref, "current"));
}

/**
 * Creates a ref function that, when called, hydrates the provided
 * external ref and VisualElement.
 */
function useMotionRef(visualState, visualElement, externalRef) {
    return reactExports.useCallback((instance) => {
        if (instance) {
            visualState.onMount && visualState.onMount(instance);
        }
        if (visualElement) {
            if (instance) {
                visualElement.mount(instance);
            }
            else {
                visualElement.unmount();
            }
        }
        if (externalRef) {
            if (typeof externalRef === "function") {
                externalRef(instance);
            }
            else if (isRefObject(externalRef)) {
                externalRef.current = instance;
            }
        }
    }, 
    /**
     * Include externalRef in dependencies to ensure the callback updates
     * when the ref changes, allowing proper ref forwarding.
     */
    [visualElement]);
}

/**
 * Convert camelCase to dash-case properties.
 */
const camelToDash = (str) => str.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase();

const optimizedAppearDataId = "framerAppearId";
const optimizedAppearDataAttribute = "data-" + camelToDash(optimizedAppearDataId);

/**
 * Internal, exported only for usage in Framer
 */
const SwitchLayoutGroupContext = reactExports.createContext({});

function useVisualElement(Component, visualState, props, createVisualElement, ProjectionNodeConstructor) {
    const { visualElement: parent } = reactExports.useContext(MotionContext);
    const lazyContext = reactExports.useContext(LazyContext);
    const presenceContext = reactExports.useContext(PresenceContext);
    const reducedMotionConfig = reactExports.useContext(MotionConfigContext).reducedMotion;
    const visualElementRef = reactExports.useRef(null);
    /**
     * If we haven't preloaded a renderer, check to see if we have one lazy-loaded
     */
    createVisualElement =
        createVisualElement ||
            lazyContext.renderer;
    if (!visualElementRef.current && createVisualElement) {
        visualElementRef.current = createVisualElement(Component, {
            visualState,
            parent,
            props,
            presenceContext,
            blockInitialAnimation: presenceContext
                ? presenceContext.initial === false
                : false,
            reducedMotionConfig,
        });
    }
    const visualElement = visualElementRef.current;
    /**
     * Load Motion gesture and animation features. These are rendered as renderless
     * components so each feature can optionally make use of React lifecycle methods.
     */
    const initialLayoutGroupConfig = reactExports.useContext(SwitchLayoutGroupContext);
    if (visualElement &&
        !visualElement.projection &&
        ProjectionNodeConstructor &&
        (visualElement.type === "html" || visualElement.type === "svg")) {
        createProjectionNode$1(visualElementRef.current, props, ProjectionNodeConstructor, initialLayoutGroupConfig);
    }
    const isMounted = reactExports.useRef(false);
    reactExports.useInsertionEffect(() => {
        /**
         * Check the component has already mounted before calling
         * `update` unnecessarily. This ensures we skip the initial update.
         */
        if (visualElement && isMounted.current) {
            visualElement.update(props, presenceContext);
        }
    });
    /**
     * Cache this value as we want to know whether HandoffAppearAnimations
     * was present on initial render - it will be deleted after this.
     */
    const optimisedAppearId = props[optimizedAppearDataAttribute];
    const wantsHandoff = reactExports.useRef(Boolean(optimisedAppearId) &&
        !window.MotionHandoffIsComplete?.(optimisedAppearId) &&
        window.MotionHasOptimisedAnimation?.(optimisedAppearId));
    useIsomorphicLayoutEffect(() => {
        if (!visualElement)
            return;
        isMounted.current = true;
        window.MotionIsMounted = true;
        visualElement.updateFeatures();
        visualElement.scheduleRenderMicrotask();
        /**
         * Ideally this function would always run in a useEffect.
         *
         * However, if we have optimised appear animations to handoff from,
         * it needs to happen synchronously to ensure there's no flash of
         * incorrect styles in the event of a hydration error.
         *
         * So if we detect a situtation where optimised appear animations
         * are running, we use useLayoutEffect to trigger animations.
         */
        if (wantsHandoff.current && visualElement.animationState) {
            visualElement.animationState.animateChanges();
        }
    });
    reactExports.useEffect(() => {
        if (!visualElement)
            return;
        if (!wantsHandoff.current && visualElement.animationState) {
            visualElement.animationState.animateChanges();
        }
        if (wantsHandoff.current) {
            // This ensures all future calls to animateChanges() in this component will run in useEffect
            queueMicrotask(() => {
                window.MotionHandoffMarkAsComplete?.(optimisedAppearId);
            });
            wantsHandoff.current = false;
        }
        /**
         * Now we've finished triggering animations for this element we
         * can wipe the enteringChildren set for the next render.
         */
        visualElement.enteringChildren = undefined;
    });
    return visualElement;
}
function createProjectionNode$1(visualElement, props, ProjectionNodeConstructor, initialPromotionConfig) {
    const { layoutId, layout, drag, dragConstraints, layoutScroll, layoutRoot, layoutCrossfade, } = props;
    visualElement.projection = new ProjectionNodeConstructor(visualElement.latestValues, props["data-framer-portal-id"]
        ? undefined
        : getClosestProjectingNode(visualElement.parent));
    visualElement.projection.setOptions({
        layoutId,
        layout,
        alwaysMeasureLayout: Boolean(drag) || (dragConstraints && isRefObject(dragConstraints)),
        visualElement,
        /**
         * TODO: Update options in an effect. This could be tricky as it'll be too late
         * to update by the time layout animations run.
         * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
         * ensuring it gets called if there's no potential layout animations.
         *
         */
        animationType: typeof layout === "string" ? layout : "both",
        initialPromotionConfig,
        crossfade: layoutCrossfade,
        layoutScroll,
        layoutRoot,
    });
}
function getClosestProjectingNode(visualElement) {
    if (!visualElement)
        return undefined;
    return visualElement.options.allowProjection !== false
        ? visualElement.projection
        : getClosestProjectingNode(visualElement.parent);
}

function createMotionComponent(Component, { forwardMotionProps = false } = {}, preloadedFeatures, createVisualElement) {
  preloadedFeatures && loadFeatures(preloadedFeatures);
  const useVisualState = isSVGComponent(Component) ? useSVGVisualState : useHTMLVisualState;
  function MotionDOMComponent(props, externalRef) {
    let MeasureLayout;
    const configAndProps = {
      ...reactExports.useContext(MotionConfigContext),
      ...props,
      layoutId: useLayoutId(props)
    };
    const { isStatic } = configAndProps;
    const context = useCreateMotionContext(props);
    const visualState = useVisualState(props, isStatic);
    if (!isStatic && isBrowser) {
      useStrictMode();
      const layoutProjection = getProjectionFunctionality(configAndProps);
      MeasureLayout = layoutProjection.MeasureLayout;
      context.visualElement = useVisualElement(Component, visualState, configAndProps, createVisualElement, layoutProjection.ProjectionNode);
    }
    return jsxRuntimeExports.jsxs(MotionContext.Provider, { value: context, children: [MeasureLayout && context.visualElement ? jsxRuntimeExports.jsx(MeasureLayout, { visualElement: context.visualElement, ...configAndProps }) : null, useRender(Component, props, useMotionRef(visualState, context.visualElement, externalRef), visualState, isStatic, forwardMotionProps)] });
  }
  MotionDOMComponent.displayName = `motion.${typeof Component === "string" ? Component : `create(${Component.displayName ?? Component.name ?? ""})`}`;
  const ForwardRefMotionComponent = reactExports.forwardRef(MotionDOMComponent);
  ForwardRefMotionComponent[motionComponentSymbol] = Component;
  return ForwardRefMotionComponent;
}
function useLayoutId({ layoutId }) {
  const layoutGroupId = reactExports.useContext(LayoutGroupContext).id;
  return layoutGroupId && layoutId !== void 0 ? layoutGroupId + "-" + layoutId : layoutId;
}
function useStrictMode(configAndProps, preloadedFeatures) {
  reactExports.useContext(LazyContext).strict;
}
function getProjectionFunctionality(props) {
  const { drag, layout } = featureDefinitions;
  if (!drag && !layout)
    return {};
  const combined = { ...drag, ...layout };
  return {
    MeasureLayout: drag?.isEnabled(props) || layout?.isEnabled(props) ? combined.MeasureLayout : void 0,
    ProjectionNode: combined.ProjectionNode
  };
}

function createMotionProxy(preloadedFeatures, createVisualElement) {
  if (typeof Proxy === "undefined") {
    return createMotionComponent;
  }
  const componentCache = /* @__PURE__ */ new Map();
  const factory = (Component, options) => {
    return createMotionComponent(Component, options, preloadedFeatures, createVisualElement);
  };
  const deprecatedFactoryFunction = (Component, options) => {
    return factory(Component, options);
  };
  return new Proxy(deprecatedFactoryFunction, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (_target, key) => {
      if (key === "create")
        return factory;
      if (!componentCache.has(key)) {
        componentCache.set(key, createMotionComponent(key, void 0, preloadedFeatures, createVisualElement));
      }
      return componentCache.get(key);
    }
  });
}

/**
 * Bounding boxes tend to be defined as top, left, right, bottom. For various operations
 * it's easier to consider each axis individually. This function returns a bounding box
 * as a map of single-axis min/max values.
 */
function convertBoundingBoxToBox({ top, left, right, bottom, }) {
    return {
        x: { min: left, max: right },
        y: { min: top, max: bottom },
    };
}
function convertBoxToBoundingBox({ x, y }) {
    return { top: y.min, right: x.max, bottom: y.max, left: x.min };
}
/**
 * Applies a TransformPoint function to a bounding box. TransformPoint is usually a function
 * provided by Framer to allow measured points to be corrected for device scaling. This is used
 * when measuring DOM elements and DOM event points.
 */
function transformBoxPoints(point, transformPoint) {
    if (!transformPoint)
        return point;
    const topLeft = transformPoint({ x: point.left, y: point.top });
    const bottomRight = transformPoint({ x: point.right, y: point.bottom });
    return {
        top: topLeft.y,
        left: topLeft.x,
        bottom: bottomRight.y,
        right: bottomRight.x,
    };
}

function isIdentityScale(scale) {
    return scale === undefined || scale === 1;
}
function hasScale({ scale, scaleX, scaleY }) {
    return (!isIdentityScale(scale) ||
        !isIdentityScale(scaleX) ||
        !isIdentityScale(scaleY));
}
function hasTransform(values) {
    return (hasScale(values) ||
        has2DTranslate(values) ||
        values.z ||
        values.rotate ||
        values.rotateX ||
        values.rotateY ||
        values.skewX ||
        values.skewY);
}
function has2DTranslate(values) {
    return is2DTranslate(values.x) || is2DTranslate(values.y);
}
function is2DTranslate(value) {
    return value && value !== "0%";
}

/**
 * Scales a point based on a factor and an originPoint
 */
function scalePoint(point, scale, originPoint) {
    const distanceFromOrigin = point - originPoint;
    const scaled = scale * distanceFromOrigin;
    return originPoint + scaled;
}
/**
 * Applies a translate/scale delta to a point
 */
function applyPointDelta(point, translate, scale, originPoint, boxScale) {
    if (boxScale !== undefined) {
        point = scalePoint(point, boxScale, originPoint);
    }
    return scalePoint(point, scale, originPoint) + translate;
}
/**
 * Applies a translate/scale delta to an axis
 */
function applyAxisDelta(axis, translate = 0, scale = 1, originPoint, boxScale) {
    axis.min = applyPointDelta(axis.min, translate, scale, originPoint, boxScale);
    axis.max = applyPointDelta(axis.max, translate, scale, originPoint, boxScale);
}
/**
 * Applies a translate/scale delta to a box
 */
function applyBoxDelta(box, { x, y }) {
    applyAxisDelta(box.x, x.translate, x.scale, x.originPoint);
    applyAxisDelta(box.y, y.translate, y.scale, y.originPoint);
}
const TREE_SCALE_SNAP_MIN = 0.999999999999;
const TREE_SCALE_SNAP_MAX = 1.0000000000001;
/**
 * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
 * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
 *
 * This is the final nested loop within updateLayoutDelta for future refactoring
 */
function applyTreeDeltas(box, treeScale, treePath, isSharedTransition = false) {
    const treeLength = treePath.length;
    if (!treeLength)
        return;
    // Reset the treeScale
    treeScale.x = treeScale.y = 1;
    let node;
    let delta;
    for (let i = 0; i < treeLength; i++) {
        node = treePath[i];
        delta = node.projectionDelta;
        /**
         * TODO: Prefer to remove this, but currently we have motion components with
         * display: contents in Framer.
         */
        const { visualElement } = node.options;
        if (visualElement &&
            visualElement.props.style &&
            visualElement.props.style.display === "contents") {
            continue;
        }
        if (isSharedTransition &&
            node.options.layoutScroll &&
            node.scroll &&
            node !== node.root) {
            transformBox(box, {
                x: -node.scroll.offset.x,
                y: -node.scroll.offset.y,
            });
        }
        if (delta) {
            // Incoporate each ancestor's scale into a culmulative treeScale for this component
            treeScale.x *= delta.x.scale;
            treeScale.y *= delta.y.scale;
            // Apply each ancestor's calculated delta into this component's recorded layout box
            applyBoxDelta(box, delta);
        }
        if (isSharedTransition && hasTransform(node.latestValues)) {
            transformBox(box, node.latestValues);
        }
    }
    /**
     * Snap tree scale back to 1 if it's within a non-perceivable threshold.
     * This will help reduce useless scales getting rendered.
     */
    if (treeScale.x < TREE_SCALE_SNAP_MAX &&
        treeScale.x > TREE_SCALE_SNAP_MIN) {
        treeScale.x = 1.0;
    }
    if (treeScale.y < TREE_SCALE_SNAP_MAX &&
        treeScale.y > TREE_SCALE_SNAP_MIN) {
        treeScale.y = 1.0;
    }
}
function translateAxis(axis, distance) {
    axis.min = axis.min + distance;
    axis.max = axis.max + distance;
}
/**
 * Apply a transform to an axis from the latest resolved motion values.
 * This function basically acts as a bridge between a flat motion value map
 * and applyAxisDelta
 */
function transformAxis(axis, axisTranslate, axisScale, boxScale, axisOrigin = 0.5) {
    const originPoint = mixNumber$1(axis.min, axis.max, axisOrigin);
    // Apply the axis delta to the final axis
    applyAxisDelta(axis, axisTranslate, axisScale, originPoint, boxScale);
}
/**
 * Apply a transform to a box from the latest resolved motion values.
 */
function transformBox(box, transform) {
    transformAxis(box.x, transform.x, transform.scaleX, transform.scale, transform.originX);
    transformAxis(box.y, transform.y, transform.scaleY, transform.scale, transform.originY);
}

function measureViewportBox(instance, transformPoint) {
    return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(), transformPoint));
}
function measurePageBox(element, rootProjectionNode, transformPagePoint) {
    const viewportBox = measureViewportBox(element, transformPagePoint);
    const { scroll } = rootProjectionNode;
    if (scroll) {
        translateAxis(viewportBox.x, scroll.offset.x);
        translateAxis(viewportBox.y, scroll.offset.y);
    }
    return viewportBox;
}

const createAxisDelta = () => ({
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
});
const createDelta = () => ({
    x: createAxisDelta(),
    y: createAxisDelta(),
});
const createAxis = () => ({ min: 0, max: 0 });
const createBox = () => ({
    x: createAxis(),
    y: createAxis(),
});

// Does this device prefer reduced motion? Returns `null` server-side.
const prefersReducedMotion = { current: null };
const hasReducedMotionListener = { current: false };

function initPrefersReducedMotion() {
    hasReducedMotionListener.current = true;
    if (!isBrowser)
        return;
    if (window.matchMedia) {
        const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)");
        const setReducedMotionPreferences = () => (prefersReducedMotion.current = motionMediaQuery.matches);
        motionMediaQuery.addEventListener("change", setReducedMotionPreferences);
        setReducedMotionPreferences();
    }
    else {
        prefersReducedMotion.current = false;
    }
}

const visualElementStore = new WeakMap();

function updateMotionValuesFromProps(element, next, prev) {
    for (const key in next) {
        const nextValue = next[key];
        const prevValue = prev[key];
        if (isMotionValue(nextValue)) {
            /**
             * If this is a motion value found in props or style, we want to add it
             * to our visual element's motion value map.
             */
            element.addValue(key, nextValue);
        }
        else if (isMotionValue(prevValue)) {
            /**
             * If we're swapping from a motion value to a static value,
             * create a new motion value from that
             */
            element.addValue(key, motionValue(nextValue, { owner: element }));
        }
        else if (prevValue !== nextValue) {
            /**
             * If this is a flat value that has changed, update the motion value
             * or create one if it doesn't exist. We only want to do this if we're
             * not handling the value with our animation state.
             */
            if (element.hasValue(key)) {
                const existingValue = element.getValue(key);
                if (existingValue.liveStyle === true) {
                    existingValue.jump(nextValue);
                }
                else if (!existingValue.hasAnimated) {
                    existingValue.set(nextValue);
                }
            }
            else {
                const latestValue = element.getStaticValue(key);
                element.addValue(key, motionValue(latestValue !== undefined ? latestValue : nextValue, { owner: element }));
            }
        }
    }
    // Handle removed values
    for (const key in prev) {
        if (next[key] === undefined)
            element.removeValue(key);
    }
    return next;
}

const propEventHandlers = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
class VisualElement {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(_props, _prevProps, _visualElement) {
    return {};
  }
  constructor({ parent, props, presenceContext, reducedMotionConfig, blockInitialAnimation, visualState }, options = {}) {
    this.current = null;
    this.children = /* @__PURE__ */ new Set();
    this.isVariantNode = false;
    this.isControllingVariants = false;
    this.shouldReduceMotion = null;
    this.values = /* @__PURE__ */ new Map();
    this.KeyframeResolver = KeyframeResolver;
    this.features = {};
    this.valueSubscriptions = /* @__PURE__ */ new Map();
    this.prevMotionValues = {};
    this.events = {};
    this.propEventSubscriptions = {};
    this.notifyUpdate = () => this.notify("Update", this.latestValues);
    this.render = () => {
      if (!this.current)
        return;
      this.triggerBuild();
      this.renderInstance(this.current, this.renderState, this.props.style, this.projection);
    };
    this.renderScheduledAt = 0;
    this.scheduleRender = () => {
      const now = time.now();
      if (this.renderScheduledAt < now) {
        this.renderScheduledAt = now;
        frame.render(this.render, false, true);
      }
    };
    const { latestValues, renderState } = visualState;
    this.latestValues = latestValues;
    this.baseTarget = { ...latestValues };
    this.initialValues = props.initial ? { ...latestValues } : {};
    this.renderState = renderState;
    this.parent = parent;
    this.props = props;
    this.presenceContext = presenceContext;
    this.depth = parent ? parent.depth + 1 : 0;
    this.reducedMotionConfig = reducedMotionConfig;
    this.options = options;
    this.blockInitialAnimation = Boolean(blockInitialAnimation);
    this.isControllingVariants = isControllingVariants(props);
    this.isVariantNode = isVariantNode(props);
    if (this.isVariantNode) {
      this.variantChildren = /* @__PURE__ */ new Set();
    }
    this.manuallyAnimateOnMount = Boolean(parent && parent.current);
    const { willChange, ...initialMotionValues } = this.scrapeMotionValuesFromProps(props, {}, this);
    for (const key in initialMotionValues) {
      const value = initialMotionValues[key];
      if (latestValues[key] !== void 0 && isMotionValue(value)) {
        value.set(latestValues[key]);
      }
    }
  }
  mount(instance) {
    this.current = instance;
    visualElementStore.set(instance, this);
    if (this.projection && !this.projection.instance) {
      this.projection.mount(instance);
    }
    if (this.parent && this.isVariantNode && !this.isControllingVariants) {
      this.removeFromVariantTree = this.parent.addVariantChild(this);
    }
    this.values.forEach((value, key) => this.bindToMotionValue(key, value));
    if (!hasReducedMotionListener.current) {
      initPrefersReducedMotion();
    }
    this.shouldReduceMotion = this.reducedMotionConfig === "never" ? false : this.reducedMotionConfig === "always" ? true : prefersReducedMotion.current;
    this.parent?.addChild(this);
    this.update(this.props, this.presenceContext);
  }
  unmount() {
    this.projection && this.projection.unmount();
    cancelFrame(this.notifyUpdate);
    cancelFrame(this.render);
    this.valueSubscriptions.forEach((remove) => remove());
    this.valueSubscriptions.clear();
    this.removeFromVariantTree && this.removeFromVariantTree();
    this.parent?.removeChild(this);
    for (const key in this.events) {
      this.events[key].clear();
    }
    for (const key in this.features) {
      const feature = this.features[key];
      if (feature) {
        feature.unmount();
        feature.isMounted = false;
      }
    }
    this.current = null;
  }
  addChild(child) {
    this.children.add(child);
    this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set());
    this.enteringChildren.add(child);
  }
  removeChild(child) {
    this.children.delete(child);
    this.enteringChildren && this.enteringChildren.delete(child);
  }
  bindToMotionValue(key, value) {
    if (this.valueSubscriptions.has(key)) {
      this.valueSubscriptions.get(key)();
    }
    const valueIsTransform = transformProps.has(key);
    if (valueIsTransform && this.onBindTransform) {
      this.onBindTransform();
    }
    const removeOnChange = value.on("change", (latestValue) => {
      this.latestValues[key] = latestValue;
      this.props.onUpdate && frame.preRender(this.notifyUpdate);
      if (valueIsTransform && this.projection) {
        this.projection.isTransformDirty = true;
      }
      this.scheduleRender();
    });
    let removeSyncCheck;
    if (window.MotionCheckAppearSync) {
      removeSyncCheck = window.MotionCheckAppearSync(this, key, value);
    }
    this.valueSubscriptions.set(key, () => {
      removeOnChange();
      if (removeSyncCheck)
        removeSyncCheck();
      if (value.owner)
        value.stop();
    });
  }
  sortNodePosition(other) {
    if (!this.current || !this.sortInstanceNodePosition || this.type !== other.type) {
      return 0;
    }
    return this.sortInstanceNodePosition(this.current, other.current);
  }
  updateFeatures() {
    let key = "animation";
    for (key in featureDefinitions) {
      const featureDefinition = featureDefinitions[key];
      if (!featureDefinition)
        continue;
      const { isEnabled, Feature: FeatureConstructor } = featureDefinition;
      if (!this.features[key] && FeatureConstructor && isEnabled(this.props)) {
        this.features[key] = new FeatureConstructor(this);
      }
      if (this.features[key]) {
        const feature = this.features[key];
        if (feature.isMounted) {
          feature.update();
        } else {
          feature.mount();
          feature.isMounted = true;
        }
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  /**
   * Measure the current viewport box with or without transforms.
   * Only measures axis-aligned boxes, rotate and skew must be manually
   * removed with a re-render to work.
   */
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : createBox();
  }
  getStaticValue(key) {
    return this.latestValues[key];
  }
  setStaticValue(key, value) {
    this.latestValues[key] = value;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(props, presenceContext) {
    if (props.transformTemplate || this.props.transformTemplate) {
      this.scheduleRender();
    }
    this.prevProps = this.props;
    this.props = props;
    this.prevPresenceContext = this.presenceContext;
    this.presenceContext = presenceContext;
    for (let i = 0; i < propEventHandlers.length; i++) {
      const key = propEventHandlers[i];
      if (this.propEventSubscriptions[key]) {
        this.propEventSubscriptions[key]();
        delete this.propEventSubscriptions[key];
      }
      const listenerName = "on" + key;
      const listener = props[listenerName];
      if (listener) {
        this.propEventSubscriptions[key] = this.on(key, listener);
      }
    }
    this.prevMotionValues = updateMotionValuesFromProps(this, this.scrapeMotionValuesFromProps(props, this.prevProps, this), this.prevMotionValues);
    if (this.handleChildMotionValue) {
      this.handleChildMotionValue();
    }
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(name) {
    return this.props.variants ? this.props.variants[name] : void 0;
  }
  /**
   * Returns the defined default transition on this component.
   */
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  /**
   * Add a child visual element to our set of children.
   */
  addVariantChild(child) {
    const closestVariantNode = this.getClosestVariantNode();
    if (closestVariantNode) {
      closestVariantNode.variantChildren && closestVariantNode.variantChildren.add(child);
      return () => closestVariantNode.variantChildren.delete(child);
    }
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(key, value) {
    const existingValue = this.values.get(key);
    if (value !== existingValue) {
      if (existingValue)
        this.removeValue(key);
      this.bindToMotionValue(key, value);
      this.values.set(key, value);
      this.latestValues[key] = value.get();
    }
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(key) {
    this.values.delete(key);
    const unsubscribe = this.valueSubscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.valueSubscriptions.delete(key);
    }
    delete this.latestValues[key];
    this.removeValueFromRenderState(key, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(key) {
    return this.values.has(key);
  }
  getValue(key, defaultValue) {
    if (this.props.values && this.props.values[key]) {
      return this.props.values[key];
    }
    let value = this.values.get(key);
    if (value === void 0 && defaultValue !== void 0) {
      value = motionValue(defaultValue === null ? void 0 : defaultValue, { owner: this });
      this.addValue(key, value);
    }
    return value;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(key, target) {
    let value = this.latestValues[key] !== void 0 || !this.current ? this.latestValues[key] : this.getBaseTargetFromProps(this.props, key) ?? this.readValueFromInstance(this.current, key, this.options);
    if (value !== void 0 && value !== null) {
      if (typeof value === "string" && (isNumericalString(value) || isZeroValueString(value))) {
        value = parseFloat(value);
      } else if (!findValueType(value) && complex.test(target)) {
        value = getAnimatableNone(key, target);
      }
      this.setBaseTarget(key, isMotionValue(value) ? value.get() : value);
    }
    return isMotionValue(value) ? value.get() : value;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(key, value) {
    this.baseTarget[key] = value;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(key) {
    const { initial } = this.props;
    let valueFromInitial;
    if (typeof initial === "string" || typeof initial === "object") {
      const variant = resolveVariantFromProps(this.props, initial, this.presenceContext?.custom);
      if (variant) {
        valueFromInitial = variant[key];
      }
    }
    if (initial && valueFromInitial !== void 0) {
      return valueFromInitial;
    }
    const target = this.getBaseTargetFromProps(this.props, key);
    if (target !== void 0 && !isMotionValue(target))
      return target;
    return this.initialValues[key] !== void 0 && valueFromInitial === void 0 ? void 0 : this.baseTarget[key];
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = new SubscriptionManager();
    }
    return this.events[eventName].add(callback);
  }
  notify(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].notify(...args);
    }
  }
  scheduleRenderMicrotask() {
    microtask.render(this.render);
  }
}

class DOMVisualElement extends VisualElement {
    constructor() {
        super(...arguments);
        this.KeyframeResolver = DOMKeyframesResolver;
    }
    sortInstanceNodePosition(a, b) {
        /**
         * compareDocumentPosition returns a bitmask, by using the bitwise &
         * we're returning true if 2 in that bitmask is set to true. 2 is set
         * to true if b preceeds a.
         */
        return a.compareDocumentPosition(b) & 2 ? 1 : -1;
    }
    getBaseTargetFromProps(props, key) {
        return props.style
            ? props.style[key]
            : undefined;
    }
    removeValueFromRenderState(key, { vars, style }) {
        delete vars[key];
        delete style[key];
    }
    handleChildMotionValue() {
        if (this.childSubscription) {
            this.childSubscription();
            delete this.childSubscription;
        }
        const { children } = this.props;
        if (isMotionValue(children)) {
            this.childSubscription = children.on("change", (latest) => {
                if (this.current) {
                    this.current.textContent = `${latest}`;
                }
            });
        }
    }
}

function renderHTML(element, { style, vars }, styleProp, projection) {
    const elementStyle = element.style;
    let key;
    for (key in style) {
        // CSSStyleDeclaration has [index: number]: string; in the types, so we use that as key type.
        elementStyle[key] = style[key];
    }
    // Write projection styles directly to element style
    projection?.applyProjectionStyles(elementStyle, styleProp);
    for (key in vars) {
        // Loop over any CSS variables and assign those.
        // They can only be assigned using `setProperty`.
        elementStyle.setProperty(key, vars[key]);
    }
}

function getComputedStyle$1(element) {
    return window.getComputedStyle(element);
}
class HTMLVisualElement extends DOMVisualElement {
    constructor() {
        super(...arguments);
        this.type = "html";
        this.renderInstance = renderHTML;
    }
    readValueFromInstance(instance, key) {
        if (transformProps.has(key)) {
            return this.projection?.isProjecting
                ? defaultTransformValue(key)
                : readTransformValue(instance, key);
        }
        else {
            const computedStyle = getComputedStyle$1(instance);
            const value = (isCSSVariableName(key)
                ? computedStyle.getPropertyValue(key)
                : computedStyle[key]) || 0;
            return typeof value === "string" ? value.trim() : value;
        }
    }
    measureInstanceViewportBox(instance, { transformPagePoint }) {
        return measureViewportBox(instance, transformPagePoint);
    }
    build(renderState, latestValues, props) {
        buildHTMLStyles(renderState, latestValues, props.transformTemplate);
    }
    scrapeMotionValuesFromProps(props, prevProps, visualElement) {
        return scrapeMotionValuesFromProps$1(props, prevProps, visualElement);
    }
}

/**
 * A set of attribute names that are always read/written as camel case.
 */
const camelCaseAttributes = new Set([
    "baseFrequency",
    "diffuseConstant",
    "kernelMatrix",
    "kernelUnitLength",
    "keySplines",
    "keyTimes",
    "limitingConeAngle",
    "markerHeight",
    "markerWidth",
    "numOctaves",
    "targetX",
    "targetY",
    "surfaceScale",
    "specularConstant",
    "specularExponent",
    "stdDeviation",
    "tableValues",
    "viewBox",
    "gradientTransform",
    "pathLength",
    "startOffset",
    "textLength",
    "lengthAdjust",
]);

function renderSVG(element, renderState, _styleProp, projection) {
    renderHTML(element, renderState, undefined, projection);
    for (const key in renderState.attrs) {
        element.setAttribute(!camelCaseAttributes.has(key) ? camelToDash(key) : key, renderState.attrs[key]);
    }
}

class SVGVisualElement extends DOMVisualElement {
    constructor() {
        super(...arguments);
        this.type = "svg";
        this.isSVGTag = false;
        this.measureInstanceViewportBox = createBox;
    }
    getBaseTargetFromProps(props, key) {
        return props[key];
    }
    readValueFromInstance(instance, key) {
        if (transformProps.has(key)) {
            const defaultType = getDefaultValueType(key);
            return defaultType ? defaultType.default || 0 : 0;
        }
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
        return instance.getAttribute(key);
    }
    scrapeMotionValuesFromProps(props, prevProps, visualElement) {
        return scrapeMotionValuesFromProps(props, prevProps, visualElement);
    }
    build(renderState, latestValues, props) {
        buildSVGAttrs(renderState, latestValues, this.isSVGTag, props.transformTemplate, props.style);
    }
    renderInstance(instance, renderState, styleProp, projection) {
        renderSVG(instance, renderState, styleProp, projection);
    }
    mount(instance) {
        this.isSVGTag = isSVGTag(instance.tagName);
        super.mount(instance);
    }
}

const createDomVisualElement = (Component, options) => {
    return isSVGComponent(Component)
        ? new SVGVisualElement(options)
        : new HTMLVisualElement(options, {
            allowProjection: Component !== reactExports.Fragment,
        });
};

function resolveVariant(visualElement, definition, custom) {
    const props = visualElement.getProps();
    return resolveVariantFromProps(props, definition, custom !== undefined ? custom : props.custom, visualElement);
}

const isKeyframesTarget = (v) => {
    return Array.isArray(v);
};

/**
 * Set VisualElement's MotionValue, creating a new MotionValue for it if
 * it doesn't exist.
 */
function setMotionValue(visualElement, key, value) {
    if (visualElement.hasValue(key)) {
        visualElement.getValue(key).set(value);
    }
    else {
        visualElement.addValue(key, motionValue(value));
    }
}
function resolveFinalValueInKeyframes(v) {
    // TODO maybe throw if v.length - 1 is placeholder token?
    return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v;
}
function setTarget(visualElement, definition) {
    const resolved = resolveVariant(visualElement, definition);
    let { transitionEnd = {}, transition = {}, ...target } = resolved || {};
    target = { ...target, ...transitionEnd };
    for (const key in target) {
        const value = resolveFinalValueInKeyframes(target[key]);
        setMotionValue(visualElement, key, value);
    }
}

function isWillChangeMotionValue(value) {
    return Boolean(isMotionValue(value) && value.add);
}

function addValueToWillChange(visualElement, key) {
    const willChange = visualElement.getValue("willChange");
    /**
     * It could be that a user has set willChange to a regular MotionValue,
     * in which case we can't add the value to it.
     */
    if (isWillChangeMotionValue(willChange)) {
        return willChange.add(key);
    }
    else if (!willChange && MotionGlobalConfig.WillChange) {
        const newWillChange = new MotionGlobalConfig.WillChange("auto");
        visualElement.addValue("willChange", newWillChange);
        newWillChange.add(key);
    }
}

function getOptimisedAppearId(visualElement) {
    return visualElement.props[optimizedAppearDataAttribute];
}

const isNotNull = (value) => value !== null;
function getFinalKeyframe(keyframes, { repeat, repeatType = "loop" }, finalKeyframe) {
    const resolvedKeyframes = keyframes.filter(isNotNull);
    const index = repeat && repeatType !== "loop" && repeat % 2 === 1
        ? 0
        : resolvedKeyframes.length - 1;
    return resolvedKeyframes[index]
        ;
}

const underDampedSpring = {
    type: "spring",
    stiffness: 500,
    damping: 25,
    restSpeed: 10,
};
const criticallyDampedSpring = (target) => ({
    type: "spring",
    stiffness: 550,
    damping: target === 0 ? 2 * Math.sqrt(550) : 30,
    restSpeed: 10,
});
const keyframesTransition = {
    type: "keyframes",
    duration: 0.8,
};
/**
 * Default easing curve is a slightly shallower version of
 * the default browser easing curve.
 */
const ease = {
    type: "keyframes",
    ease: [0.25, 0.1, 0.35, 1],
    duration: 0.3,
};
const getDefaultTransition = (valueKey, { keyframes }) => {
    if (keyframes.length > 2) {
        return keyframesTransition;
    }
    else if (transformProps.has(valueKey)) {
        return valueKey.startsWith("scale")
            ? criticallyDampedSpring(keyframes[1])
            : underDampedSpring;
    }
    return ease;
};

/**
 * Decide whether a transition is defined on a given Transition.
 * This filters out orchestration options and returns true
 * if any options are left.
 */
function isTransitionDefined({ when, delay: _delay, delayChildren, staggerChildren, staggerDirection, repeat, repeatType, repeatDelay, from, elapsed, ...transition }) {
    return !!Object.keys(transition).length;
}

const animateMotionValue = (name, value, target, transition = {}, element, isHandoff) => (onComplete) => {
    const valueTransition = getValueTransition(transition, name) || {};
    /**
     * Most transition values are currently completely overwritten by value-specific
     * transitions. In the future it'd be nicer to blend these transitions. But for now
     * delay actually does inherit from the root transition if not value-specific.
     */
    const delay = valueTransition.delay || transition.delay || 0;
    /**
     * Elapsed isn't a public transition option but can be passed through from
     * optimized appear effects in milliseconds.
     */
    let { elapsed = 0 } = transition;
    elapsed = elapsed - secondsToMilliseconds(delay);
    const options = {
        keyframes: Array.isArray(target) ? target : [null, target],
        ease: "easeOut",
        velocity: value.getVelocity(),
        ...valueTransition,
        delay: -elapsed,
        onUpdate: (v) => {
            value.set(v);
            valueTransition.onUpdate && valueTransition.onUpdate(v);
        },
        onComplete: () => {
            onComplete();
            valueTransition.onComplete && valueTransition.onComplete();
        },
        name,
        motionValue: value,
        element: isHandoff ? undefined : element,
    };
    /**
     * If there's no transition defined for this value, we can generate
     * unique transition settings for this value.
     */
    if (!isTransitionDefined(valueTransition)) {
        Object.assign(options, getDefaultTransition(name, options));
    }
    /**
     * Both WAAPI and our internal animation functions use durations
     * as defined by milliseconds, while our external API defines them
     * as seconds.
     */
    options.duration && (options.duration = secondsToMilliseconds(options.duration));
    options.repeatDelay && (options.repeatDelay = secondsToMilliseconds(options.repeatDelay));
    /**
     * Support deprecated way to set initial value. Prefer keyframe syntax.
     */
    if (options.from !== undefined) {
        options.keyframes[0] = options.from;
    }
    let shouldSkip = false;
    if (options.type === false ||
        (options.duration === 0 && !options.repeatDelay)) {
        makeAnimationInstant(options);
        if (options.delay === 0) {
            shouldSkip = true;
        }
    }
    if (MotionGlobalConfig.instantAnimations ||
        MotionGlobalConfig.skipAnimations) {
        shouldSkip = true;
        makeAnimationInstant(options);
        options.delay = 0;
    }
    /**
     * If the transition type or easing has been explicitly set by the user
     * then we don't want to allow flattening the animation.
     */
    options.allowFlatten = !valueTransition.type && !valueTransition.ease;
    /**
     * If we can or must skip creating the animation, and apply only
     * the final keyframe, do so. We also check once keyframes are resolved but
     * this early check prevents the need to create an animation at all.
     */
    if (shouldSkip && !isHandoff && value.get() !== undefined) {
        const finalKeyframe = getFinalKeyframe(options.keyframes, valueTransition);
        if (finalKeyframe !== undefined) {
            frame.update(() => {
                options.onUpdate(finalKeyframe);
                options.onComplete();
            });
            return;
        }
    }
    return valueTransition.isSync
        ? new JSAnimation(options)
        : new AsyncMotionValueAnimation(options);
};

/**
 * Decide whether we should block this animation. Previously, we achieved this
 * just by checking whether the key was listed in protectedKeys, but this
 * posed problems if an animation was triggered by afterChildren and protectedKeys
 * had been set to true in the meantime.
 */
function shouldBlockAnimation({ protectedKeys, needsAnimating }, key) {
    const shouldBlock = protectedKeys.hasOwnProperty(key) && needsAnimating[key] !== true;
    needsAnimating[key] = false;
    return shouldBlock;
}
function animateTarget(visualElement, targetAndTransition, { delay = 0, transitionOverride, type } = {}) {
    let { transition = visualElement.getDefaultTransition(), transitionEnd, ...target } = targetAndTransition;
    if (transitionOverride)
        transition = transitionOverride;
    const animations = [];
    const animationTypeState = type &&
        visualElement.animationState &&
        visualElement.animationState.getState()[type];
    for (const key in target) {
        const value = visualElement.getValue(key, visualElement.latestValues[key] ?? null);
        const valueTarget = target[key];
        if (valueTarget === undefined ||
            (animationTypeState &&
                shouldBlockAnimation(animationTypeState, key))) {
            continue;
        }
        const valueTransition = {
            delay,
            ...getValueTransition(transition || {}, key),
        };
        /**
         * If the value is already at the defined target, skip the animation.
         */
        const currentValue = value.get();
        if (currentValue !== undefined &&
            !value.isAnimating &&
            !Array.isArray(valueTarget) &&
            valueTarget === currentValue &&
            !valueTransition.velocity) {
            continue;
        }
        /**
         * If this is the first time a value is being animated, check
         * to see if we're handling off from an existing animation.
         */
        let isHandoff = false;
        if (window.MotionHandoffAnimation) {
            const appearId = getOptimisedAppearId(visualElement);
            if (appearId) {
                const startTime = window.MotionHandoffAnimation(appearId, key, frame);
                if (startTime !== null) {
                    valueTransition.startTime = startTime;
                    isHandoff = true;
                }
            }
        }
        addValueToWillChange(visualElement, key);
        value.start(animateMotionValue(key, value, valueTarget, visualElement.shouldReduceMotion && positionalKeys.has(key)
            ? { type: false }
            : valueTransition, visualElement, isHandoff));
        const animation = value.animation;
        if (animation) {
            animations.push(animation);
        }
    }
    if (transitionEnd) {
        Promise.all(animations).then(() => {
            frame.update(() => {
                transitionEnd && setTarget(visualElement, transitionEnd);
            });
        });
    }
    return animations;
}

function calcChildStagger(children, child, delayChildren, staggerChildren = 0, staggerDirection = 1) {
    const index = Array.from(children)
        .sort((a, b) => a.sortNodePosition(b))
        .indexOf(child);
    const numChildren = children.size;
    const maxStaggerDuration = (numChildren - 1) * staggerChildren;
    const delayIsFunction = typeof delayChildren === "function";
    return delayIsFunction
        ? delayChildren(index, numChildren)
        : staggerDirection === 1
            ? index * staggerChildren
            : maxStaggerDuration - index * staggerChildren;
}

function animateVariant(visualElement, variant, options = {}) {
    const resolved = resolveVariant(visualElement, variant, options.type === "exit"
        ? visualElement.presenceContext?.custom
        : undefined);
    let { transition = visualElement.getDefaultTransition() || {} } = resolved || {};
    if (options.transitionOverride) {
        transition = options.transitionOverride;
    }
    /**
     * If we have a variant, create a callback that runs it as an animation.
     * Otherwise, we resolve a Promise immediately for a composable no-op.
     */
    const getAnimation = resolved
        ? () => Promise.all(animateTarget(visualElement, resolved, options))
        : () => Promise.resolve();
    /**
     * If we have children, create a callback that runs all their animations.
     * Otherwise, we resolve a Promise immediately for a composable no-op.
     */
    const getChildAnimations = visualElement.variantChildren && visualElement.variantChildren.size
        ? (forwardDelay = 0) => {
            const { delayChildren = 0, staggerChildren, staggerDirection, } = transition;
            return animateChildren(visualElement, variant, forwardDelay, delayChildren, staggerChildren, staggerDirection, options);
        }
        : () => Promise.resolve();
    /**
     * If the transition explicitly defines a "when" option, we need to resolve either
     * this animation or all children animations before playing the other.
     */
    const { when } = transition;
    if (when) {
        const [first, last] = when === "beforeChildren"
            ? [getAnimation, getChildAnimations]
            : [getChildAnimations, getAnimation];
        return first().then(() => last());
    }
    else {
        return Promise.all([getAnimation(), getChildAnimations(options.delay)]);
    }
}
function animateChildren(visualElement, variant, delay = 0, delayChildren = 0, staggerChildren = 0, staggerDirection = 1, options) {
    const animations = [];
    for (const child of visualElement.variantChildren) {
        child.notify("AnimationStart", variant);
        animations.push(animateVariant(child, variant, {
            ...options,
            delay: delay +
                (typeof delayChildren === "function" ? 0 : delayChildren) +
                calcChildStagger(visualElement.variantChildren, child, delayChildren, staggerChildren, staggerDirection),
        }).then(() => child.notify("AnimationComplete", variant)));
    }
    return Promise.all(animations);
}

function animateVisualElement(visualElement, definition, options = {}) {
    visualElement.notify("AnimationStart", definition);
    let animation;
    if (Array.isArray(definition)) {
        const animations = definition.map((variant) => animateVariant(visualElement, variant, options));
        animation = Promise.all(animations);
    }
    else if (typeof definition === "string") {
        animation = animateVariant(visualElement, definition, options);
    }
    else {
        const resolvedDefinition = typeof definition === "function"
            ? resolveVariant(visualElement, definition, options.custom)
            : definition;
        animation = Promise.all(animateTarget(visualElement, resolvedDefinition, options));
    }
    return animation.then(() => {
        visualElement.notify("AnimationComplete", definition);
    });
}

function shallowCompare(next, prev) {
    if (!Array.isArray(prev))
        return false;
    const prevLength = prev.length;
    if (prevLength !== next.length)
        return false;
    for (let i = 0; i < prevLength; i++) {
        if (prev[i] !== next[i])
            return false;
    }
    return true;
}

const numVariantProps = variantProps.length;
function getVariantContext(visualElement) {
    if (!visualElement)
        return undefined;
    if (!visualElement.isControllingVariants) {
        const context = visualElement.parent
            ? getVariantContext(visualElement.parent) || {}
            : {};
        if (visualElement.props.initial !== undefined) {
            context.initial = visualElement.props.initial;
        }
        return context;
    }
    const context = {};
    for (let i = 0; i < numVariantProps; i++) {
        const name = variantProps[i];
        const prop = visualElement.props[name];
        if (isVariantLabel(prop) || prop === false) {
            context[name] = prop;
        }
    }
    return context;
}

const reversePriorityOrder = [...variantPriorityOrder].reverse();
const numAnimationTypes = variantPriorityOrder.length;
function animateList(visualElement) {
    return (animations) => Promise.all(animations.map(({ animation, options }) => animateVisualElement(visualElement, animation, options)));
}
function createAnimationState(visualElement) {
    let animate = animateList(visualElement);
    let state = createState();
    let isInitialRender = true;
    /**
     * This function will be used to reduce the animation definitions for
     * each active animation type into an object of resolved values for it.
     */
    const buildResolvedTypeValues = (type) => (acc, definition) => {
        const resolved = resolveVariant(visualElement, definition, type === "exit"
            ? visualElement.presenceContext?.custom
            : undefined);
        if (resolved) {
            const { transition, transitionEnd, ...target } = resolved;
            acc = { ...acc, ...target, ...transitionEnd };
        }
        return acc;
    };
    /**
     * This just allows us to inject mocked animation functions
     * @internal
     */
    function setAnimateFunction(makeAnimator) {
        animate = makeAnimator(visualElement);
    }
    /**
     * When we receive new props, we need to:
     * 1. Create a list of protected keys for each type. This is a directory of
     *    value keys that are currently being "handled" by types of a higher priority
     *    so that whenever an animation is played of a given type, these values are
     *    protected from being animated.
     * 2. Determine if an animation type needs animating.
     * 3. Determine if any values have been removed from a type and figure out
     *    what to animate those to.
     */
    function animateChanges(changedActiveType) {
        const { props } = visualElement;
        const context = getVariantContext(visualElement.parent) || {};
        /**
         * A list of animations that we'll build into as we iterate through the animation
         * types. This will get executed at the end of the function.
         */
        const animations = [];
        /**
         * Keep track of which values have been removed. Then, as we hit lower priority
         * animation types, we can check if they contain removed values and animate to that.
         */
        const removedKeys = new Set();
        /**
         * A dictionary of all encountered keys. This is an object to let us build into and
         * copy it without iteration. Each time we hit an animation type we set its protected
         * keys - the keys its not allowed to animate - to the latest version of this object.
         */
        let encounteredKeys = {};
        /**
         * If a variant has been removed at a given index, and this component is controlling
         * variant animations, we want to ensure lower-priority variants are forced to animate.
         */
        let removedVariantIndex = Infinity;
        /**
         * Iterate through all animation types in reverse priority order. For each, we want to
         * detect which values it's handling and whether or not they've changed (and therefore
         * need to be animated). If any values have been removed, we want to detect those in
         * lower priority props and flag for animation.
         */
        for (let i = 0; i < numAnimationTypes; i++) {
            const type = reversePriorityOrder[i];
            const typeState = state[type];
            const prop = props[type] !== undefined
                ? props[type]
                : context[type];
            const propIsVariant = isVariantLabel(prop);
            /**
             * If this type has *just* changed isActive status, set activeDelta
             * to that status. Otherwise set to null.
             */
            const activeDelta = type === changedActiveType ? typeState.isActive : null;
            if (activeDelta === false)
                removedVariantIndex = i;
            /**
             * If this prop is an inherited variant, rather than been set directly on the
             * component itself, we want to make sure we allow the parent to trigger animations.
             *
             * TODO: Can probably change this to a !isControllingVariants check
             */
            let isInherited = prop === context[type] &&
                prop !== props[type] &&
                propIsVariant;
            if (isInherited &&
                isInitialRender &&
                visualElement.manuallyAnimateOnMount) {
                isInherited = false;
            }
            /**
             * Set all encountered keys so far as the protected keys for this type. This will
             * be any key that has been animated or otherwise handled by active, higher-priortiy types.
             */
            typeState.protectedKeys = { ...encounteredKeys };
            // Check if we can skip analysing this prop early
            if (
            // If it isn't active and hasn't *just* been set as inactive
            (!typeState.isActive && activeDelta === null) ||
                // If we didn't and don't have any defined prop for this animation type
                (!prop && !typeState.prevProp) ||
                // Or if the prop doesn't define an animation
                isAnimationControls(prop) ||
                typeof prop === "boolean") {
                continue;
            }
            /**
             * As we go look through the values defined on this type, if we detect
             * a changed value or a value that was removed in a higher priority, we set
             * this to true and add this prop to the animation list.
             */
            const variantDidChange = checkVariantsDidChange(typeState.prevProp, prop);
            let shouldAnimateType = variantDidChange ||
                // If we're making this variant active, we want to always make it active
                (type === changedActiveType &&
                    typeState.isActive &&
                    !isInherited &&
                    propIsVariant) ||
                // If we removed a higher-priority variant (i is in reverse order)
                (i > removedVariantIndex && propIsVariant);
            let handledRemovedValues = false;
            /**
             * As animations can be set as variant lists, variants or target objects, we
             * coerce everything to an array if it isn't one already
             */
            const definitionList = Array.isArray(prop) ? prop : [prop];
            /**
             * Build an object of all the resolved values. We'll use this in the subsequent
             * animateChanges calls to determine whether a value has changed.
             */
            let resolvedValues = definitionList.reduce(buildResolvedTypeValues(type), {});
            if (activeDelta === false)
                resolvedValues = {};
            /**
             * Now we need to loop through all the keys in the prev prop and this prop,
             * and decide:
             * 1. If the value has changed, and needs animating
             * 2. If it has been removed, and needs adding to the removedKeys set
             * 3. If it has been removed in a higher priority type and needs animating
             * 4. If it hasn't been removed in a higher priority but hasn't changed, and
             *    needs adding to the type's protectedKeys list.
             */
            const { prevResolvedValues = {} } = typeState;
            const allKeys = {
                ...prevResolvedValues,
                ...resolvedValues,
            };
            const markToAnimate = (key) => {
                shouldAnimateType = true;
                if (removedKeys.has(key)) {
                    handledRemovedValues = true;
                    removedKeys.delete(key);
                }
                typeState.needsAnimating[key] = true;
                const motionValue = visualElement.getValue(key);
                if (motionValue)
                    motionValue.liveStyle = false;
            };
            for (const key in allKeys) {
                const next = resolvedValues[key];
                const prev = prevResolvedValues[key];
                // If we've already handled this we can just skip ahead
                if (encounteredKeys.hasOwnProperty(key))
                    continue;
                /**
                 * If the value has changed, we probably want to animate it.
                 */
                let valueHasChanged = false;
                if (isKeyframesTarget(next) && isKeyframesTarget(prev)) {
                    valueHasChanged = !shallowCompare(next, prev);
                }
                else {
                    valueHasChanged = next !== prev;
                }
                if (valueHasChanged) {
                    if (next !== undefined && next !== null) {
                        // If next is defined and doesn't equal prev, it needs animating
                        markToAnimate(key);
                    }
                    else {
                        // If it's undefined, it's been removed.
                        removedKeys.add(key);
                    }
                }
                else if (next !== undefined && removedKeys.has(key)) {
                    /**
                     * If next hasn't changed and it isn't undefined, we want to check if it's
                     * been removed by a higher priority
                     */
                    markToAnimate(key);
                }
                else {
                    /**
                     * If it hasn't changed, we add it to the list of protected values
                     * to ensure it doesn't get animated.
                     */
                    typeState.protectedKeys[key] = true;
                }
            }
            /**
             * Update the typeState so next time animateChanges is called we can compare the
             * latest prop and resolvedValues to these.
             */
            typeState.prevProp = prop;
            typeState.prevResolvedValues = resolvedValues;
            if (typeState.isActive) {
                encounteredKeys = { ...encounteredKeys, ...resolvedValues };
            }
            if (isInitialRender && visualElement.blockInitialAnimation) {
                shouldAnimateType = false;
            }
            /**
             * If this is an inherited prop we want to skip this animation
             * unless the inherited variants haven't changed on this render.
             */
            const willAnimateViaParent = isInherited && variantDidChange;
            const needsAnimating = !willAnimateViaParent || handledRemovedValues;
            if (shouldAnimateType && needsAnimating) {
                animations.push(...definitionList.map((animation) => {
                    const options = { type };
                    /**
                     * If we're performing the initial animation, but we're not
                     * rendering at the same time as the variant-controlling parent,
                     * we want to use the parent's transition to calculate the stagger.
                     */
                    if (typeof animation === "string" &&
                        isInitialRender &&
                        !willAnimateViaParent &&
                        visualElement.manuallyAnimateOnMount &&
                        visualElement.parent) {
                        const { parent } = visualElement;
                        const parentVariant = resolveVariant(parent, animation);
                        if (parent.enteringChildren && parentVariant) {
                            const { delayChildren } = parentVariant.transition || {};
                            options.delay = calcChildStagger(parent.enteringChildren, visualElement, delayChildren);
                        }
                    }
                    return {
                        animation: animation,
                        options,
                    };
                }));
            }
        }
        /**
         * If there are some removed value that haven't been dealt with,
         * we need to create a new animation that falls back either to the value
         * defined in the style prop, or the last read value.
         */
        if (removedKeys.size) {
            const fallbackAnimation = {};
            /**
             * If the initial prop contains a transition we can use that, otherwise
             * allow the animation function to use the visual element's default.
             */
            if (typeof props.initial !== "boolean") {
                const initialTransition = resolveVariant(visualElement, Array.isArray(props.initial)
                    ? props.initial[0]
                    : props.initial);
                if (initialTransition && initialTransition.transition) {
                    fallbackAnimation.transition = initialTransition.transition;
                }
            }
            removedKeys.forEach((key) => {
                const fallbackTarget = visualElement.getBaseTarget(key);
                const motionValue = visualElement.getValue(key);
                if (motionValue)
                    motionValue.liveStyle = true;
                // @ts-expect-error - @mattgperry to figure if we should do something here
                fallbackAnimation[key] = fallbackTarget ?? null;
            });
            animations.push({ animation: fallbackAnimation });
        }
        let shouldAnimate = Boolean(animations.length);
        if (isInitialRender &&
            (props.initial === false || props.initial === props.animate) &&
            !visualElement.manuallyAnimateOnMount) {
            shouldAnimate = false;
        }
        isInitialRender = false;
        return shouldAnimate ? animate(animations) : Promise.resolve();
    }
    /**
     * Change whether a certain animation type is active.
     */
    function setActive(type, isActive) {
        // If the active state hasn't changed, we can safely do nothing here
        if (state[type].isActive === isActive)
            return Promise.resolve();
        // Propagate active change to children
        visualElement.variantChildren?.forEach((child) => child.animationState?.setActive(type, isActive));
        state[type].isActive = isActive;
        const animations = animateChanges(type);
        for (const key in state) {
            state[key].protectedKeys = {};
        }
        return animations;
    }
    return {
        animateChanges,
        setActive,
        setAnimateFunction,
        getState: () => state,
        reset: () => {
            state = createState();
            /**
             * Temporarily disabling resetting this flag as it prevents components
             * with initial={false} from animating after being remounted, for instance
             * as the child of an Activity component.
             */
            // isInitialRender = true
        },
    };
}
function checkVariantsDidChange(prev, next) {
    if (typeof next === "string") {
        return next !== prev;
    }
    else if (Array.isArray(next)) {
        return !shallowCompare(next, prev);
    }
    return false;
}
function createTypeState(isActive = false) {
    return {
        isActive,
        protectedKeys: {},
        needsAnimating: {},
        prevResolvedValues: {},
    };
}
function createState() {
    return {
        animate: createTypeState(true),
        whileInView: createTypeState(),
        whileHover: createTypeState(),
        whileTap: createTypeState(),
        whileDrag: createTypeState(),
        whileFocus: createTypeState(),
        exit: createTypeState(),
    };
}

class Feature {
    constructor(node) {
        this.isMounted = false;
        this.node = node;
    }
    update() { }
}

class AnimationFeature extends Feature {
    /**
     * We dynamically generate the AnimationState manager as it contains a reference
     * to the underlying animation library. We only want to load that if we load this,
     * so people can optionally code split it out using the `m` component.
     */
    constructor(node) {
        super(node);
        node.animationState || (node.animationState = createAnimationState(node));
    }
    updateAnimationControlsSubscription() {
        const { animate } = this.node.getProps();
        if (isAnimationControls(animate)) {
            this.unmountControls = animate.subscribe(this.node);
        }
    }
    /**
     * Subscribe any provided AnimationControls to the component's VisualElement
     */
    mount() {
        this.updateAnimationControlsSubscription();
    }
    update() {
        const { animate } = this.node.getProps();
        const { animate: prevAnimate } = this.node.prevProps || {};
        if (animate !== prevAnimate) {
            this.updateAnimationControlsSubscription();
        }
    }
    unmount() {
        this.node.animationState.reset();
        this.unmountControls?.();
    }
}

let id$1 = 0;
class ExitAnimationFeature extends Feature {
    constructor() {
        super(...arguments);
        this.id = id$1++;
    }
    update() {
        if (!this.node.presenceContext)
            return;
        const { isPresent, onExitComplete } = this.node.presenceContext;
        const { isPresent: prevIsPresent } = this.node.prevPresenceContext || {};
        if (!this.node.animationState || isPresent === prevIsPresent) {
            return;
        }
        const exitAnimation = this.node.animationState.setActive("exit", !isPresent);
        if (onExitComplete && !isPresent) {
            exitAnimation.then(() => {
                onExitComplete(this.id);
            });
        }
    }
    mount() {
        const { register, onExitComplete } = this.node.presenceContext || {};
        if (onExitComplete) {
            onExitComplete(this.id);
        }
        if (register) {
            this.unmount = register(this.id);
        }
    }
    unmount() { }
}

const animations = {
    animation: {
        Feature: AnimationFeature,
    },
    exit: {
        Feature: ExitAnimationFeature,
    },
};

function addDomEvent(target, eventName, handler, options = { passive: true }) {
    target.addEventListener(eventName, handler, options);
    return () => target.removeEventListener(eventName, handler);
}

function extractEventInfo(event) {
    return {
        point: {
            x: event.pageX,
            y: event.pageY,
        },
    };
}
const addPointerInfo = (handler) => {
    return (event) => isPrimaryPointer(event) && handler(event, extractEventInfo(event));
};

function addPointerEvent(target, eventName, handler, options) {
    return addDomEvent(target, eventName, addPointerInfo(handler), options);
}

const SCALE_PRECISION = 0.0001;
const SCALE_MIN = 1 - SCALE_PRECISION;
const SCALE_MAX = 1 + SCALE_PRECISION;
const TRANSLATE_PRECISION = 0.01;
const TRANSLATE_MIN = 0 - TRANSLATE_PRECISION;
const TRANSLATE_MAX = 0 + TRANSLATE_PRECISION;
function calcLength(axis) {
    return axis.max - axis.min;
}
function isNear(value, target, maxDistance) {
    return Math.abs(value - target) <= maxDistance;
}
function calcAxisDelta(delta, source, target, origin = 0.5) {
    delta.origin = origin;
    delta.originPoint = mixNumber$1(source.min, source.max, delta.origin);
    delta.scale = calcLength(target) / calcLength(source);
    delta.translate =
        mixNumber$1(target.min, target.max, delta.origin) - delta.originPoint;
    if ((delta.scale >= SCALE_MIN && delta.scale <= SCALE_MAX) ||
        isNaN(delta.scale)) {
        delta.scale = 1.0;
    }
    if ((delta.translate >= TRANSLATE_MIN &&
        delta.translate <= TRANSLATE_MAX) ||
        isNaN(delta.translate)) {
        delta.translate = 0.0;
    }
}
function calcBoxDelta(delta, source, target, origin) {
    calcAxisDelta(delta.x, source.x, target.x, origin ? origin.originX : undefined);
    calcAxisDelta(delta.y, source.y, target.y, origin ? origin.originY : undefined);
}
function calcRelativeAxis(target, relative, parent) {
    target.min = parent.min + relative.min;
    target.max = target.min + calcLength(relative);
}
function calcRelativeBox(target, relative, parent) {
    calcRelativeAxis(target.x, relative.x, parent.x);
    calcRelativeAxis(target.y, relative.y, parent.y);
}
function calcRelativeAxisPosition(target, layout, parent) {
    target.min = layout.min - parent.min;
    target.max = target.min + calcLength(layout);
}
function calcRelativePosition(target, layout, parent) {
    calcRelativeAxisPosition(target.x, layout.x, parent.x);
    calcRelativeAxisPosition(target.y, layout.y, parent.y);
}

function eachAxis(callback) {
    return [callback("x"), callback("y")];
}

// Fixes https://github.com/motiondivision/motion/issues/2270
const getContextWindow = ({ current }) => {
    return current ? current.ownerDocument.defaultView : null;
};

const distance = (a, b) => Math.abs(a - b);
function distance2D(a, b) {
    // Multi-dimensional
    const xDelta = distance(a.x, b.x);
    const yDelta = distance(a.y, b.y);
    return Math.sqrt(xDelta ** 2 + yDelta ** 2);
}

/**
 * @internal
 */
class PanSession {
    constructor(event, handlers, { transformPagePoint, contextWindow = window, dragSnapToOrigin = false, distanceThreshold = 3, } = {}) {
        /**
         * @internal
         */
        this.startEvent = null;
        /**
         * @internal
         */
        this.lastMoveEvent = null;
        /**
         * @internal
         */
        this.lastMoveEventInfo = null;
        /**
         * @internal
         */
        this.handlers = {};
        /**
         * @internal
         */
        this.contextWindow = window;
        this.updatePoint = () => {
            if (!(this.lastMoveEvent && this.lastMoveEventInfo))
                return;
            const info = getPanInfo(this.lastMoveEventInfo, this.history);
            const isPanStarted = this.startEvent !== null;
            // Only start panning if the offset is larger than 3 pixels. If we make it
            // any larger than this we'll want to reset the pointer history
            // on the first update to avoid visual snapping to the cursor.
            const isDistancePastThreshold = distance2D(info.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
            if (!isPanStarted && !isDistancePastThreshold)
                return;
            const { point } = info;
            const { timestamp } = frameData;
            this.history.push({ ...point, timestamp });
            const { onStart, onMove } = this.handlers;
            if (!isPanStarted) {
                onStart && onStart(this.lastMoveEvent, info);
                this.startEvent = this.lastMoveEvent;
            }
            onMove && onMove(this.lastMoveEvent, info);
        };
        this.handlePointerMove = (event, info) => {
            this.lastMoveEvent = event;
            this.lastMoveEventInfo = transformPoint(info, this.transformPagePoint);
            // Throttle mouse move event to once per frame
            frame.update(this.updatePoint, true);
        };
        this.handlePointerUp = (event, info) => {
            this.end();
            const { onEnd, onSessionEnd, resumeAnimation } = this.handlers;
            if (this.dragSnapToOrigin)
                resumeAnimation && resumeAnimation();
            if (!(this.lastMoveEvent && this.lastMoveEventInfo))
                return;
            const panInfo = getPanInfo(event.type === "pointercancel"
                ? this.lastMoveEventInfo
                : transformPoint(info, this.transformPagePoint), this.history);
            if (this.startEvent && onEnd) {
                onEnd(event, panInfo);
            }
            onSessionEnd && onSessionEnd(event, panInfo);
        };
        // If we have more than one touch, don't start detecting this gesture
        if (!isPrimaryPointer(event))
            return;
        this.dragSnapToOrigin = dragSnapToOrigin;
        this.handlers = handlers;
        this.transformPagePoint = transformPagePoint;
        this.distanceThreshold = distanceThreshold;
        this.contextWindow = contextWindow || window;
        const info = extractEventInfo(event);
        const initialInfo = transformPoint(info, this.transformPagePoint);
        const { point } = initialInfo;
        const { timestamp } = frameData;
        this.history = [{ ...point, timestamp }];
        const { onSessionStart } = handlers;
        onSessionStart &&
            onSessionStart(event, getPanInfo(initialInfo, this.history));
        this.removeListeners = pipe(addPointerEvent(this.contextWindow, "pointermove", this.handlePointerMove), addPointerEvent(this.contextWindow, "pointerup", this.handlePointerUp), addPointerEvent(this.contextWindow, "pointercancel", this.handlePointerUp));
    }
    updateHandlers(handlers) {
        this.handlers = handlers;
    }
    end() {
        this.removeListeners && this.removeListeners();
        cancelFrame(this.updatePoint);
    }
}
function transformPoint(info, transformPagePoint) {
    return transformPagePoint ? { point: transformPagePoint(info.point) } : info;
}
function subtractPoint(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
function getPanInfo({ point }, history) {
    return {
        point,
        delta: subtractPoint(point, lastDevicePoint(history)),
        offset: subtractPoint(point, startDevicePoint(history)),
        velocity: getVelocity(history, 0.1),
    };
}
function startDevicePoint(history) {
    return history[0];
}
function lastDevicePoint(history) {
    return history[history.length - 1];
}
function getVelocity(history, timeDelta) {
    if (history.length < 2) {
        return { x: 0, y: 0 };
    }
    let i = history.length - 1;
    let timestampedPoint = null;
    const lastPoint = lastDevicePoint(history);
    while (i >= 0) {
        timestampedPoint = history[i];
        if (lastPoint.timestamp - timestampedPoint.timestamp >
            secondsToMilliseconds(timeDelta)) {
            break;
        }
        i--;
    }
    if (!timestampedPoint) {
        return { x: 0, y: 0 };
    }
    const time = millisecondsToSeconds(lastPoint.timestamp - timestampedPoint.timestamp);
    if (time === 0) {
        return { x: 0, y: 0 };
    }
    const currentVelocity = {
        x: (lastPoint.x - timestampedPoint.x) / time,
        y: (lastPoint.y - timestampedPoint.y) / time,
    };
    if (currentVelocity.x === Infinity) {
        currentVelocity.x = 0;
    }
    if (currentVelocity.y === Infinity) {
        currentVelocity.y = 0;
    }
    return currentVelocity;
}

/**
 * Apply constraints to a point. These constraints are both physical along an
 * axis, and an elastic factor that determines how much to constrain the point
 * by if it does lie outside the defined parameters.
 */
function applyConstraints(point, { min, max }, elastic) {
    if (min !== undefined && point < min) {
        // If we have a min point defined, and this is outside of that, constrain
        point = elastic
            ? mixNumber$1(min, point, elastic.min)
            : Math.max(point, min);
    }
    else if (max !== undefined && point > max) {
        // If we have a max point defined, and this is outside of that, constrain
        point = elastic
            ? mixNumber$1(max, point, elastic.max)
            : Math.min(point, max);
    }
    return point;
}
/**
 * Calculate constraints in terms of the viewport when defined relatively to the
 * measured axis. This is measured from the nearest edge, so a max constraint of 200
 * on an axis with a max value of 300 would return a constraint of 500 - axis length
 */
function calcRelativeAxisConstraints(axis, min, max) {
    return {
        min: min !== undefined ? axis.min + min : undefined,
        max: max !== undefined
            ? axis.max + max - (axis.max - axis.min)
            : undefined,
    };
}
/**
 * Calculate constraints in terms of the viewport when
 * defined relatively to the measured bounding box.
 */
function calcRelativeConstraints(layoutBox, { top, left, bottom, right }) {
    return {
        x: calcRelativeAxisConstraints(layoutBox.x, left, right),
        y: calcRelativeAxisConstraints(layoutBox.y, top, bottom),
    };
}
/**
 * Calculate viewport constraints when defined as another viewport-relative axis
 */
function calcViewportAxisConstraints(layoutAxis, constraintsAxis) {
    let min = constraintsAxis.min - layoutAxis.min;
    let max = constraintsAxis.max - layoutAxis.max;
    // If the constraints axis is actually smaller than the layout axis then we can
    // flip the constraints
    if (constraintsAxis.max - constraintsAxis.min <
        layoutAxis.max - layoutAxis.min) {
        [min, max] = [max, min];
    }
    return { min, max };
}
/**
 * Calculate viewport constraints when defined as another viewport-relative box
 */
function calcViewportConstraints(layoutBox, constraintsBox) {
    return {
        x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
        y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y),
    };
}
/**
 * Calculate a transform origin relative to the source axis, between 0-1, that results
 * in an asthetically pleasing scale/transform needed to project from source to target.
 */
function calcOrigin(source, target) {
    let origin = 0.5;
    const sourceLength = calcLength(source);
    const targetLength = calcLength(target);
    if (targetLength > sourceLength) {
        origin = progress(target.min, target.max - sourceLength, source.min);
    }
    else if (sourceLength > targetLength) {
        origin = progress(source.min, source.max - targetLength, target.min);
    }
    return clamp(0, 1, origin);
}
/**
 * Rebase the calculated viewport constraints relative to the layout.min point.
 */
function rebaseAxisConstraints(layout, constraints) {
    const relativeConstraints = {};
    if (constraints.min !== undefined) {
        relativeConstraints.min = constraints.min - layout.min;
    }
    if (constraints.max !== undefined) {
        relativeConstraints.max = constraints.max - layout.min;
    }
    return relativeConstraints;
}
const defaultElastic = 0.35;
/**
 * Accepts a dragElastic prop and returns resolved elastic values for each axis.
 */
function resolveDragElastic(dragElastic = defaultElastic) {
    if (dragElastic === false) {
        dragElastic = 0;
    }
    else if (dragElastic === true) {
        dragElastic = defaultElastic;
    }
    return {
        x: resolveAxisElastic(dragElastic, "left", "right"),
        y: resolveAxisElastic(dragElastic, "top", "bottom"),
    };
}
function resolveAxisElastic(dragElastic, minLabel, maxLabel) {
    return {
        min: resolvePointElastic(dragElastic, minLabel),
        max: resolvePointElastic(dragElastic, maxLabel),
    };
}
function resolvePointElastic(dragElastic, label) {
    return typeof dragElastic === "number"
        ? dragElastic
        : dragElastic[label] || 0;
}

const elementDragControls = /* @__PURE__ */ new WeakMap();
class VisualElementDragControls {
  constructor(visualElement) {
    this.openDragLock = null;
    this.isDragging = false;
    this.currentDirection = null;
    this.originPoint = { x: 0, y: 0 };
    this.constraints = false;
    this.hasMutatedConstraints = false;
    this.elastic = createBox();
    this.latestPointerEvent = null;
    this.latestPanInfo = null;
    this.visualElement = visualElement;
  }
  start(originEvent, { snapToCursor = false, distanceThreshold } = {}) {
    const { presenceContext } = this.visualElement;
    if (presenceContext && presenceContext.isPresent === false)
      return;
    const onSessionStart = (event) => {
      const { dragSnapToOrigin: dragSnapToOrigin2 } = this.getProps();
      dragSnapToOrigin2 ? this.pauseAnimation() : this.stopAnimation();
      if (snapToCursor) {
        this.snapToCursor(extractEventInfo(event).point);
      }
    };
    const onStart = (event, info) => {
      const { drag, dragPropagation, onDragStart } = this.getProps();
      if (drag && !dragPropagation) {
        if (this.openDragLock)
          this.openDragLock();
        this.openDragLock = setDragLock(drag);
        if (!this.openDragLock)
          return;
      }
      this.latestPointerEvent = event;
      this.latestPanInfo = info;
      this.isDragging = true;
      this.currentDirection = null;
      this.resolveConstraints();
      if (this.visualElement.projection) {
        this.visualElement.projection.isAnimationBlocked = true;
        this.visualElement.projection.target = void 0;
      }
      eachAxis((axis) => {
        let current = this.getAxisMotionValue(axis).get() || 0;
        if (percent.test(current)) {
          const { projection } = this.visualElement;
          if (projection && projection.layout) {
            const measuredAxis = projection.layout.layoutBox[axis];
            if (measuredAxis) {
              const length = calcLength(measuredAxis);
              current = length * (parseFloat(current) / 100);
            }
          }
        }
        this.originPoint[axis] = current;
      });
      if (onDragStart) {
        frame.postRender(() => onDragStart(event, info));
      }
      addValueToWillChange(this.visualElement, "transform");
      const { animationState } = this.visualElement;
      animationState && animationState.setActive("whileDrag", true);
    };
    const onMove = (event, info) => {
      this.latestPointerEvent = event;
      this.latestPanInfo = info;
      const { dragPropagation, dragDirectionLock, onDirectionLock, onDrag } = this.getProps();
      if (!dragPropagation && !this.openDragLock)
        return;
      const { offset } = info;
      if (dragDirectionLock && this.currentDirection === null) {
        this.currentDirection = getCurrentDirection(offset);
        if (this.currentDirection !== null) {
          onDirectionLock && onDirectionLock(this.currentDirection);
        }
        return;
      }
      this.updateAxis("x", info.point, offset);
      this.updateAxis("y", info.point, offset);
      this.visualElement.render();
      onDrag && onDrag(event, info);
    };
    const onSessionEnd = (event, info) => {
      this.latestPointerEvent = event;
      this.latestPanInfo = info;
      this.stop(event, info);
      this.latestPointerEvent = null;
      this.latestPanInfo = null;
    };
    const resumeAnimation = () => eachAxis((axis) => this.getAnimationState(axis) === "paused" && this.getAxisMotionValue(axis).animation?.play());
    const { dragSnapToOrigin } = this.getProps();
    this.panSession = new PanSession(originEvent, {
      onSessionStart,
      onStart,
      onMove,
      onSessionEnd,
      resumeAnimation
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin,
      distanceThreshold,
      contextWindow: getContextWindow(this.visualElement)
    });
  }
  /**
   * @internal
   */
  stop(event, panInfo) {
    const finalEvent = event || this.latestPointerEvent;
    const finalPanInfo = panInfo || this.latestPanInfo;
    const isDragging = this.isDragging;
    this.cancel();
    if (!isDragging || !finalPanInfo || !finalEvent)
      return;
    const { velocity } = finalPanInfo;
    this.startAnimation(velocity);
    const { onDragEnd } = this.getProps();
    if (onDragEnd) {
      frame.postRender(() => onDragEnd(finalEvent, finalPanInfo));
    }
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = false;
    const { projection, animationState } = this.visualElement;
    if (projection) {
      projection.isAnimationBlocked = false;
    }
    this.panSession && this.panSession.end();
    this.panSession = void 0;
    const { dragPropagation } = this.getProps();
    if (!dragPropagation && this.openDragLock) {
      this.openDragLock();
      this.openDragLock = null;
    }
    animationState && animationState.setActive("whileDrag", false);
  }
  updateAxis(axis, _point, offset) {
    const { drag } = this.getProps();
    if (!offset || !shouldDrag(axis, drag, this.currentDirection))
      return;
    const axisValue = this.getAxisMotionValue(axis);
    let next = this.originPoint[axis] + offset[axis];
    if (this.constraints && this.constraints[axis]) {
      next = applyConstraints(next, this.constraints[axis], this.elastic[axis]);
    }
    axisValue.set(next);
  }
  resolveConstraints() {
    const { dragConstraints, dragElastic } = this.getProps();
    const layout = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(false) : this.visualElement.projection?.layout;
    const prevConstraints = this.constraints;
    if (dragConstraints && isRefObject(dragConstraints)) {
      if (!this.constraints) {
        this.constraints = this.resolveRefConstraints();
      }
    } else {
      if (dragConstraints && layout) {
        this.constraints = calcRelativeConstraints(layout.layoutBox, dragConstraints);
      } else {
        this.constraints = false;
      }
    }
    this.elastic = resolveDragElastic(dragElastic);
    if (prevConstraints !== this.constraints && layout && this.constraints && !this.hasMutatedConstraints) {
      eachAxis((axis) => {
        if (this.constraints !== false && this.getAxisMotionValue(axis)) {
          this.constraints[axis] = rebaseAxisConstraints(layout.layoutBox[axis], this.constraints[axis]);
        }
      });
    }
  }
  resolveRefConstraints() {
    const { dragConstraints: constraints, onMeasureDragConstraints } = this.getProps();
    if (!constraints || !isRefObject(constraints))
      return false;
    const constraintsElement = constraints.current;
    const { projection } = this.visualElement;
    if (!projection || !projection.layout)
      return false;
    const constraintsBox = measurePageBox(constraintsElement, projection.root, this.visualElement.getTransformPagePoint());
    let measuredConstraints = calcViewportConstraints(projection.layout.layoutBox, constraintsBox);
    if (onMeasureDragConstraints) {
      const userConstraints = onMeasureDragConstraints(convertBoxToBoundingBox(measuredConstraints));
      this.hasMutatedConstraints = !!userConstraints;
      if (userConstraints) {
        measuredConstraints = convertBoundingBoxToBox(userConstraints);
      }
    }
    return measuredConstraints;
  }
  startAnimation(velocity) {
    const { drag, dragMomentum, dragElastic, dragTransition, dragSnapToOrigin, onDragTransitionEnd } = this.getProps();
    const constraints = this.constraints || {};
    const momentumAnimations = eachAxis((axis) => {
      if (!shouldDrag(axis, drag, this.currentDirection)) {
        return;
      }
      let transition = constraints && constraints[axis] || {};
      if (dragSnapToOrigin)
        transition = { min: 0, max: 0 };
      const bounceStiffness = dragElastic ? 200 : 1e6;
      const bounceDamping = dragElastic ? 40 : 1e7;
      const inertia = {
        type: "inertia",
        velocity: dragMomentum ? velocity[axis] : 0,
        bounceStiffness,
        bounceDamping,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...dragTransition,
        ...transition
      };
      return this.startAxisValueAnimation(axis, inertia);
    });
    return Promise.all(momentumAnimations).then(onDragTransitionEnd);
  }
  startAxisValueAnimation(axis, transition) {
    const axisValue = this.getAxisMotionValue(axis);
    addValueToWillChange(this.visualElement, axis);
    return axisValue.start(animateMotionValue(axis, axisValue, 0, transition, this.visualElement, false));
  }
  stopAnimation() {
    eachAxis((axis) => this.getAxisMotionValue(axis).stop());
  }
  pauseAnimation() {
    eachAxis((axis) => this.getAxisMotionValue(axis).animation?.pause());
  }
  getAnimationState(axis) {
    return this.getAxisMotionValue(axis).animation?.state;
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(axis) {
    const dragKey = `_drag${axis.toUpperCase()}`;
    const props = this.visualElement.getProps();
    const externalMotionValue = props[dragKey];
    return externalMotionValue ? externalMotionValue : this.visualElement.getValue(axis, (props.initial ? props.initial[axis] : void 0) || 0);
  }
  snapToCursor(point) {
    eachAxis((axis) => {
      const { drag } = this.getProps();
      if (!shouldDrag(axis, drag, this.currentDirection))
        return;
      const { projection } = this.visualElement;
      const axisValue = this.getAxisMotionValue(axis);
      if (projection && projection.layout) {
        const { min, max } = projection.layout.layoutBox[axis];
        axisValue.set(point[axis] - mixNumber$1(min, max, 0.5));
      }
    });
  }
  /**
   * When the viewport resizes we want to check if the measured constraints
   * have changed and, if so, reposition the element within those new constraints
   * relative to where it was before the resize.
   */
  scalePositionWithinConstraints() {
    if (!this.visualElement.current)
      return;
    const { drag, dragConstraints } = this.getProps();
    const { projection } = this.visualElement;
    if (!isRefObject(dragConstraints) || !projection || !this.constraints)
      return;
    this.stopAnimation();
    const boxProgress = { x: 0, y: 0 };
    eachAxis((axis) => {
      const axisValue = this.getAxisMotionValue(axis);
      if (axisValue && this.constraints !== false) {
        const latest = axisValue.get();
        boxProgress[axis] = calcOrigin({ min: latest, max: latest }, this.constraints[axis]);
      }
    });
    const { transformTemplate } = this.visualElement.getProps();
    this.visualElement.current.style.transform = transformTemplate ? transformTemplate({}, "") : "none";
    projection.root && projection.root.updateScroll();
    projection.updateLayout();
    this.resolveConstraints();
    eachAxis((axis) => {
      if (!shouldDrag(axis, drag, null))
        return;
      const axisValue = this.getAxisMotionValue(axis);
      const { min, max } = this.constraints[axis];
      axisValue.set(mixNumber$1(min, max, boxProgress[axis]));
    });
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    elementDragControls.set(this.visualElement, this);
    const element = this.visualElement.current;
    const stopPointerListener = addPointerEvent(element, "pointerdown", (event) => {
      const { drag, dragListener = true } = this.getProps();
      drag && dragListener && this.start(event);
    });
    const measureDragConstraints = () => {
      const { dragConstraints } = this.getProps();
      if (isRefObject(dragConstraints) && dragConstraints.current) {
        this.constraints = this.resolveRefConstraints();
      }
    };
    const { projection } = this.visualElement;
    const stopMeasureLayoutListener = projection.addEventListener("measure", measureDragConstraints);
    if (projection && !projection.layout) {
      projection.root && projection.root.updateScroll();
      projection.updateLayout();
    }
    frame.read(measureDragConstraints);
    const stopResizeListener = addDomEvent(window, "resize", () => this.scalePositionWithinConstraints());
    const stopLayoutUpdateListener = projection.addEventListener("didUpdate", ({ delta, hasLayoutChanged }) => {
      if (this.isDragging && hasLayoutChanged) {
        eachAxis((axis) => {
          const motionValue = this.getAxisMotionValue(axis);
          if (!motionValue)
            return;
          this.originPoint[axis] += delta[axis].translate;
          motionValue.set(motionValue.get() + delta[axis].translate);
        });
        this.visualElement.render();
      }
    });
    return () => {
      stopResizeListener();
      stopPointerListener();
      stopMeasureLayoutListener();
      stopLayoutUpdateListener && stopLayoutUpdateListener();
    };
  }
  getProps() {
    const props = this.visualElement.getProps();
    const { drag = false, dragDirectionLock = false, dragPropagation = false, dragConstraints = false, dragElastic = defaultElastic, dragMomentum = true } = props;
    return {
      ...props,
      drag,
      dragDirectionLock,
      dragPropagation,
      dragConstraints,
      dragElastic,
      dragMomentum
    };
  }
}
function shouldDrag(direction, drag, currentDirection) {
  return (drag === true || drag === direction) && (currentDirection === null || currentDirection === direction);
}
function getCurrentDirection(offset, lockThreshold = 10) {
  let direction = null;
  if (Math.abs(offset.y) > lockThreshold) {
    direction = "y";
  } else if (Math.abs(offset.x) > lockThreshold) {
    direction = "x";
  }
  return direction;
}

class DragGesture extends Feature {
    constructor(node) {
        super(node);
        this.removeGroupControls = noop;
        this.removeListeners = noop;
        this.controls = new VisualElementDragControls(node);
    }
    mount() {
        // If we've been provided a DragControls for manual control over the drag gesture,
        // subscribe this component to it on mount.
        const { dragControls } = this.node.getProps();
        if (dragControls) {
            this.removeGroupControls = dragControls.subscribe(this.controls);
        }
        this.removeListeners = this.controls.addListeners() || noop;
    }
    unmount() {
        this.removeGroupControls();
        this.removeListeners();
    }
}

const asyncHandler = (handler) => (event, info) => {
    if (handler) {
        frame.postRender(() => handler(event, info));
    }
};
class PanGesture extends Feature {
    constructor() {
        super(...arguments);
        this.removePointerDownListener = noop;
    }
    onPointerDown(pointerDownEvent) {
        this.session = new PanSession(pointerDownEvent, this.createPanHandlers(), {
            transformPagePoint: this.node.getTransformPagePoint(),
            contextWindow: getContextWindow(this.node),
        });
    }
    createPanHandlers() {
        const { onPanSessionStart, onPanStart, onPan, onPanEnd } = this.node.getProps();
        return {
            onSessionStart: asyncHandler(onPanSessionStart),
            onStart: asyncHandler(onPanStart),
            onMove: onPan,
            onEnd: (event, info) => {
                delete this.session;
                if (onPanEnd) {
                    frame.postRender(() => onPanEnd(event, info));
                }
            },
        };
    }
    mount() {
        this.removePointerDownListener = addPointerEvent(this.node.current, "pointerdown", (event) => this.onPointerDown(event));
    }
    update() {
        this.session && this.session.updateHandlers(this.createPanHandlers());
    }
    unmount() {
        this.removePointerDownListener();
        this.session && this.session.end();
    }
}

const globalProjectionState = {
  /**
   * Global flag as to whether the tree has animated since the last time
   * we resized the window
   */
  hasAnimatedSinceResize: true,
  /**
   * We set this to true once, on the first update. Any nodes added to the tree beyond that
   * update will be given a `data-projection-id` attribute.
   */
  hasEverUpdated: false
};

function pixelsToPercent(pixels, axis) {
    if (axis.max === axis.min)
        return 0;
    return (pixels / (axis.max - axis.min)) * 100;
}
/**
 * We always correct borderRadius as a percentage rather than pixels to reduce paints.
 * For example, if you are projecting a box that is 100px wide with a 10px borderRadius
 * into a box that is 200px wide with a 20px borderRadius, that is actually a 10%
 * borderRadius in both states. If we animate between the two in pixels that will trigger
 * a paint each time. If we animate between the two in percentage we'll avoid a paint.
 */
const correctBorderRadius = {
    correct: (latest, node) => {
        if (!node.target)
            return latest;
        /**
         * If latest is a string, if it's a percentage we can return immediately as it's
         * going to be stretched appropriately. Otherwise, if it's a pixel, convert it to a number.
         */
        if (typeof latest === "string") {
            if (px.test(latest)) {
                latest = parseFloat(latest);
            }
            else {
                return latest;
            }
        }
        /**
         * If latest is a number, it's a pixel value. We use the current viewportBox to calculate that
         * pixel value as a percentage of each axis
         */
        const x = pixelsToPercent(latest, node.target.x);
        const y = pixelsToPercent(latest, node.target.y);
        return `${x}% ${y}%`;
    },
};

const correctBoxShadow = {
    correct: (latest, { treeScale, projectionDelta }) => {
        const original = latest;
        const shadow = complex.parse(latest);
        // TODO: Doesn't support multiple shadows
        if (shadow.length > 5)
            return original;
        const template = complex.createTransformer(latest);
        const offset = typeof shadow[0] !== "number" ? 1 : 0;
        // Calculate the overall context scale
        const xScale = projectionDelta.x.scale * treeScale.x;
        const yScale = projectionDelta.y.scale * treeScale.y;
        shadow[0 + offset] /= xScale;
        shadow[1 + offset] /= yScale;
        /**
         * Ideally we'd correct x and y scales individually, but because blur and
         * spread apply to both we have to take a scale average and apply that instead.
         * We could potentially improve the outcome of this by incorporating the ratio between
         * the two scales.
         */
        const averageScale = mixNumber$1(xScale, yScale, 0.5);
        // Blur
        if (typeof shadow[2 + offset] === "number")
            shadow[2 + offset] /= averageScale;
        // Spread
        if (typeof shadow[3 + offset] === "number")
            shadow[3 + offset] /= averageScale;
        return template(shadow);
    },
};

let hasTakenAnySnapshot = false;
class MeasureLayoutWithContext extends reactExports.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement, layoutGroup, switchLayoutGroup, layoutId } = this.props;
    const { projection } = visualElement;
    addScaleCorrector(defaultScaleCorrectors);
    if (projection) {
      if (layoutGroup.group)
        layoutGroup.group.add(projection);
      if (switchLayoutGroup && switchLayoutGroup.register && layoutId) {
        switchLayoutGroup.register(projection);
      }
      if (hasTakenAnySnapshot) {
        projection.root.didUpdate();
      }
      projection.addEventListener("animationComplete", () => {
        this.safeToRemove();
      });
      projection.setOptions({
        ...projection.options,
        onExitComplete: () => this.safeToRemove()
      });
    }
    globalProjectionState.hasEverUpdated = true;
  }
  getSnapshotBeforeUpdate(prevProps) {
    const { layoutDependency, visualElement, drag, isPresent } = this.props;
    const { projection } = visualElement;
    if (!projection)
      return null;
    projection.isPresent = isPresent;
    hasTakenAnySnapshot = true;
    if (drag || prevProps.layoutDependency !== layoutDependency || layoutDependency === void 0 || prevProps.isPresent !== isPresent) {
      projection.willUpdate();
    } else {
      this.safeToRemove();
    }
    if (prevProps.isPresent !== isPresent) {
      if (isPresent) {
        projection.promote();
      } else if (!projection.relegate()) {
        frame.postRender(() => {
          const stack = projection.getStack();
          if (!stack || !stack.members.length) {
            this.safeToRemove();
          }
        });
      }
    }
    return null;
  }
  componentDidUpdate() {
    const { projection } = this.props.visualElement;
    if (projection) {
      projection.root.didUpdate();
      microtask.postRender(() => {
        if (!projection.currentAnimation && projection.isLead()) {
          this.safeToRemove();
        }
      });
    }
  }
  componentWillUnmount() {
    const { visualElement, layoutGroup, switchLayoutGroup: promoteContext } = this.props;
    const { projection } = visualElement;
    hasTakenAnySnapshot = true;
    if (projection) {
      projection.scheduleCheckAfterUnmount();
      if (layoutGroup && layoutGroup.group)
        layoutGroup.group.remove(projection);
      if (promoteContext && promoteContext.deregister)
        promoteContext.deregister(projection);
    }
  }
  safeToRemove() {
    const { safeToRemove } = this.props;
    safeToRemove && safeToRemove();
  }
  render() {
    return null;
  }
}
function MeasureLayout(props) {
  const [isPresent, safeToRemove] = usePresence();
  const layoutGroup = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(MeasureLayoutWithContext, { ...props, layoutGroup, switchLayoutGroup: reactExports.useContext(SwitchLayoutGroupContext), isPresent, safeToRemove });
}
const defaultScaleCorrectors = {
  borderRadius: {
    ...correctBorderRadius,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: correctBorderRadius,
  borderTopRightRadius: correctBorderRadius,
  borderBottomLeftRadius: correctBorderRadius,
  borderBottomRightRadius: correctBorderRadius,
  boxShadow: correctBoxShadow
};

function animateSingleValue(value, keyframes, options) {
    const motionValue$1 = isMotionValue(value) ? value : motionValue(value);
    motionValue$1.start(animateMotionValue("", motionValue$1, keyframes, options));
    return motionValue$1.animation;
}

const compareByDepth = (a, b) => a.depth - b.depth;

class FlatTree {
    constructor() {
        this.children = [];
        this.isDirty = false;
    }
    add(child) {
        addUniqueItem(this.children, child);
        this.isDirty = true;
    }
    remove(child) {
        removeItem(this.children, child);
        this.isDirty = true;
    }
    forEach(callback) {
        this.isDirty && this.children.sort(compareByDepth);
        this.isDirty = false;
        this.children.forEach(callback);
    }
}

/**
 * Timeout defined in ms
 */
function delay(callback, timeout) {
    const start = time.now();
    const checkElapsed = ({ timestamp }) => {
        const elapsed = timestamp - start;
        if (elapsed >= timeout) {
            cancelFrame(checkElapsed);
            callback(elapsed - timeout);
        }
    };
    frame.setup(checkElapsed, true);
    return () => cancelFrame(checkElapsed);
}

const borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"];
const numBorders = borders.length;
const asNumber = (value) => typeof value === "string" ? parseFloat(value) : value;
const isPx = (value) => typeof value === "number" || px.test(value);
function mixValues(target, follow, lead, progress, shouldCrossfadeOpacity, isOnlyMember) {
    if (shouldCrossfadeOpacity) {
        target.opacity = mixNumber$1(0, lead.opacity ?? 1, easeCrossfadeIn(progress));
        target.opacityExit = mixNumber$1(follow.opacity ?? 1, 0, easeCrossfadeOut(progress));
    }
    else if (isOnlyMember) {
        target.opacity = mixNumber$1(follow.opacity ?? 1, lead.opacity ?? 1, progress);
    }
    /**
     * Mix border radius
     */
    for (let i = 0; i < numBorders; i++) {
        const borderLabel = `border${borders[i]}Radius`;
        let followRadius = getRadius(follow, borderLabel);
        let leadRadius = getRadius(lead, borderLabel);
        if (followRadius === undefined && leadRadius === undefined)
            continue;
        followRadius || (followRadius = 0);
        leadRadius || (leadRadius = 0);
        const canMix = followRadius === 0 ||
            leadRadius === 0 ||
            isPx(followRadius) === isPx(leadRadius);
        if (canMix) {
            target[borderLabel] = Math.max(mixNumber$1(asNumber(followRadius), asNumber(leadRadius), progress), 0);
            if (percent.test(leadRadius) || percent.test(followRadius)) {
                target[borderLabel] += "%";
            }
        }
        else {
            target[borderLabel] = leadRadius;
        }
    }
    /**
     * Mix rotation
     */
    if (follow.rotate || lead.rotate) {
        target.rotate = mixNumber$1(follow.rotate || 0, lead.rotate || 0, progress);
    }
}
function getRadius(values, radiusName) {
    return values[radiusName] !== undefined
        ? values[radiusName]
        : values.borderRadius;
}
// /**
//  * We only want to mix the background color if there's a follow element
//  * that we're not crossfading opacity between. For instance with switch
//  * AnimateSharedLayout animations, this helps the illusion of a continuous
//  * element being animated but also cuts down on the number of paints triggered
//  * for elements where opacity is doing that work for us.
//  */
// if (
//     !hasFollowElement &&
//     latestLeadValues.backgroundColor &&
//     latestFollowValues.backgroundColor
// ) {
//     /**
//      * This isn't ideal performance-wise as mixColor is creating a new function every frame.
//      * We could probably create a mixer that runs at the start of the animation but
//      * the idea behind the crossfader is that it runs dynamically between two potentially
//      * changing targets (ie opacity or borderRadius may be animating independently via variants)
//      */
//     leadState.backgroundColor = followState.backgroundColor = mixColor(
//         latestFollowValues.backgroundColor as string,
//         latestLeadValues.backgroundColor as string
//     )(p)
// }
const easeCrossfadeIn = /*@__PURE__*/ compress(0, 0.5, circOut);
const easeCrossfadeOut = /*@__PURE__*/ compress(0.5, 0.95, noop);
function compress(min, max, easing) {
    return (p) => {
        // Could replace ifs with clamp
        if (p < min)
            return 0;
        if (p > max)
            return 1;
        return easing(progress(min, max, p));
    };
}

/**
 * Reset an axis to the provided origin box.
 *
 * This is a mutative operation.
 */
function copyAxisInto(axis, originAxis) {
    axis.min = originAxis.min;
    axis.max = originAxis.max;
}
/**
 * Reset a box to the provided origin box.
 *
 * This is a mutative operation.
 */
function copyBoxInto(box, originBox) {
    copyAxisInto(box.x, originBox.x);
    copyAxisInto(box.y, originBox.y);
}
/**
 * Reset a delta to the provided origin box.
 *
 * This is a mutative operation.
 */
function copyAxisDeltaInto(delta, originDelta) {
    delta.translate = originDelta.translate;
    delta.scale = originDelta.scale;
    delta.originPoint = originDelta.originPoint;
    delta.origin = originDelta.origin;
}

/**
 * Remove a delta from a point. This is essentially the steps of applyPointDelta in reverse
 */
function removePointDelta(point, translate, scale, originPoint, boxScale) {
    point -= translate;
    point = scalePoint(point, 1 / scale, originPoint);
    if (boxScale !== undefined) {
        point = scalePoint(point, 1 / boxScale, originPoint);
    }
    return point;
}
/**
 * Remove a delta from an axis. This is essentially the steps of applyAxisDelta in reverse
 */
function removeAxisDelta(axis, translate = 0, scale = 1, origin = 0.5, boxScale, originAxis = axis, sourceAxis = axis) {
    if (percent.test(translate)) {
        translate = parseFloat(translate);
        const relativeProgress = mixNumber$1(sourceAxis.min, sourceAxis.max, translate / 100);
        translate = relativeProgress - sourceAxis.min;
    }
    if (typeof translate !== "number")
        return;
    let originPoint = mixNumber$1(originAxis.min, originAxis.max, origin);
    if (axis === originAxis)
        originPoint -= translate;
    axis.min = removePointDelta(axis.min, translate, scale, originPoint, boxScale);
    axis.max = removePointDelta(axis.max, translate, scale, originPoint, boxScale);
}
/**
 * Remove a transforms from an axis. This is essentially the steps of applyAxisTransforms in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
function removeAxisTransforms(axis, transforms, [key, scaleKey, originKey], origin, sourceAxis) {
    removeAxisDelta(axis, transforms[key], transforms[scaleKey], transforms[originKey], transforms.scale, origin, sourceAxis);
}
/**
 * The names of the motion values we want to apply as translation, scale and origin.
 */
const xKeys = ["x", "scaleX", "originX"];
const yKeys = ["y", "scaleY", "originY"];
/**
 * Remove a transforms from an box. This is essentially the steps of applyAxisBox in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
function removeBoxTransforms(box, transforms, originBox, sourceBox) {
    removeAxisTransforms(box.x, transforms, xKeys, originBox ? originBox.x : undefined, sourceBox ? sourceBox.x : undefined);
    removeAxisTransforms(box.y, transforms, yKeys, originBox ? originBox.y : undefined, sourceBox ? sourceBox.y : undefined);
}

function isAxisDeltaZero(delta) {
    return delta.translate === 0 && delta.scale === 1;
}
function isDeltaZero(delta) {
    return isAxisDeltaZero(delta.x) && isAxisDeltaZero(delta.y);
}
function axisEquals(a, b) {
    return a.min === b.min && a.max === b.max;
}
function boxEquals(a, b) {
    return axisEquals(a.x, b.x) && axisEquals(a.y, b.y);
}
function axisEqualsRounded(a, b) {
    return (Math.round(a.min) === Math.round(b.min) &&
        Math.round(a.max) === Math.round(b.max));
}
function boxEqualsRounded(a, b) {
    return axisEqualsRounded(a.x, b.x) && axisEqualsRounded(a.y, b.y);
}
function aspectRatio(box) {
    return calcLength(box.x) / calcLength(box.y);
}
function axisDeltaEquals(a, b) {
    return (a.translate === b.translate &&
        a.scale === b.scale &&
        a.originPoint === b.originPoint);
}

class NodeStack {
    constructor() {
        this.members = [];
    }
    add(node) {
        addUniqueItem(this.members, node);
        node.scheduleRender();
    }
    remove(node) {
        removeItem(this.members, node);
        if (node === this.prevLead) {
            this.prevLead = undefined;
        }
        if (node === this.lead) {
            const prevLead = this.members[this.members.length - 1];
            if (prevLead) {
                this.promote(prevLead);
            }
        }
    }
    relegate(node) {
        const indexOfNode = this.members.findIndex((member) => node === member);
        if (indexOfNode === 0)
            return false;
        /**
         * Find the next projection node that is present
         */
        let prevLead;
        for (let i = indexOfNode; i >= 0; i--) {
            const member = this.members[i];
            if (member.isPresent !== false) {
                prevLead = member;
                break;
            }
        }
        if (prevLead) {
            this.promote(prevLead);
            return true;
        }
        else {
            return false;
        }
    }
    promote(node, preserveFollowOpacity) {
        const prevLead = this.lead;
        if (node === prevLead)
            return;
        this.prevLead = prevLead;
        this.lead = node;
        node.show();
        if (prevLead) {
            prevLead.instance && prevLead.scheduleRender();
            node.scheduleRender();
            node.resumeFrom = prevLead;
            if (preserveFollowOpacity) {
                node.resumeFrom.preserveOpacity = true;
            }
            if (prevLead.snapshot) {
                node.snapshot = prevLead.snapshot;
                node.snapshot.latestValues =
                    prevLead.animationValues || prevLead.latestValues;
            }
            if (node.root && node.root.isUpdating) {
                node.isLayoutDirty = true;
            }
            const { crossfade } = node.options;
            if (crossfade === false) {
                prevLead.hide();
            }
            /**
             * TODO:
             *   - Test border radius when previous node was deleted
             *   - boxShadow mixing
             *   - Shared between element A in scrolled container and element B (scroll stays the same or changes)
             *   - Shared between element A in transformed container and element B (transform stays the same or changes)
             *   - Shared between element A in scrolled page and element B (scroll stays the same or changes)
             * ---
             *   - Crossfade opacity of root nodes
             *   - layoutId changes after animation
             *   - layoutId changes mid animation
             */
        }
    }
    exitAnimationComplete() {
        this.members.forEach((node) => {
            const { options, resumingFrom } = node;
            options.onExitComplete && options.onExitComplete();
            if (resumingFrom) {
                resumingFrom.options.onExitComplete &&
                    resumingFrom.options.onExitComplete();
            }
        });
    }
    scheduleRender() {
        this.members.forEach((node) => {
            node.instance && node.scheduleRender(false);
        });
    }
    /**
     * Clear any leads that have been removed this render to prevent them from being
     * used in future animations and to prevent memory leaks
     */
    removeLeadSnapshot() {
        if (this.lead && this.lead.snapshot) {
            this.lead.snapshot = undefined;
        }
    }
}

function buildProjectionTransform(delta, treeScale, latestTransform) {
    let transform = "";
    /**
     * The translations we use to calculate are always relative to the viewport coordinate space.
     * But when we apply scales, we also scale the coordinate space of an element and its children.
     * For instance if we have a treeScale (the culmination of all parent scales) of 0.5 and we need
     * to move an element 100 pixels, we actually need to move it 200 in within that scaled space.
     */
    const xTranslate = delta.x.translate / treeScale.x;
    const yTranslate = delta.y.translate / treeScale.y;
    const zTranslate = latestTransform?.z || 0;
    if (xTranslate || yTranslate || zTranslate) {
        transform = `translate3d(${xTranslate}px, ${yTranslate}px, ${zTranslate}px) `;
    }
    /**
     * Apply scale correction for the tree transform.
     * This will apply scale to the screen-orientated axes.
     */
    if (treeScale.x !== 1 || treeScale.y !== 1) {
        transform += `scale(${1 / treeScale.x}, ${1 / treeScale.y}) `;
    }
    if (latestTransform) {
        const { transformPerspective, rotate, rotateX, rotateY, skewX, skewY } = latestTransform;
        if (transformPerspective)
            transform = `perspective(${transformPerspective}px) ${transform}`;
        if (rotate)
            transform += `rotate(${rotate}deg) `;
        if (rotateX)
            transform += `rotateX(${rotateX}deg) `;
        if (rotateY)
            transform += `rotateY(${rotateY}deg) `;
        if (skewX)
            transform += `skewX(${skewX}deg) `;
        if (skewY)
            transform += `skewY(${skewY}deg) `;
    }
    /**
     * Apply scale to match the size of the element to the size we want it.
     * This will apply scale to the element-orientated axes.
     */
    const elementScaleX = delta.x.scale * treeScale.x;
    const elementScaleY = delta.y.scale * treeScale.y;
    if (elementScaleX !== 1 || elementScaleY !== 1) {
        transform += `scale(${elementScaleX}, ${elementScaleY})`;
    }
    return transform || "none";
}

const transformAxes = ["", "X", "Y", "Z"];
const animationTarget = 1e3;
let id = 0;
function resetDistortingTransform(key, visualElement, values, sharedAnimationValues) {
  const { latestValues } = visualElement;
  if (latestValues[key]) {
    values[key] = latestValues[key];
    visualElement.setStaticValue(key, 0);
    if (sharedAnimationValues) {
      sharedAnimationValues[key] = 0;
    }
  }
}
function cancelTreeOptimisedTransformAnimations(projectionNode) {
  projectionNode.hasCheckedOptimisedAppear = true;
  if (projectionNode.root === projectionNode)
    return;
  const { visualElement } = projectionNode.options;
  if (!visualElement)
    return;
  const appearId = getOptimisedAppearId(visualElement);
  if (window.MotionHasOptimisedAnimation(appearId, "transform")) {
    const { layout, layoutId } = projectionNode.options;
    window.MotionCancelOptimisedAnimation(appearId, "transform", frame, !(layout || layoutId));
  }
  const { parent } = projectionNode;
  if (parent && !parent.hasCheckedOptimisedAppear) {
    cancelTreeOptimisedTransformAnimations(parent);
  }
}
function createProjectionNode({ attachResizeListener, defaultParent, measureScroll, checkIsScrollRoot, resetTransform }) {
  return class ProjectionNode {
    constructor(latestValues = {}, parent = defaultParent?.()) {
      this.id = id++;
      this.animationId = 0;
      this.animationCommitId = 0;
      this.children = /* @__PURE__ */ new Set();
      this.options = {};
      this.isTreeAnimating = false;
      this.isAnimationBlocked = false;
      this.isLayoutDirty = false;
      this.isProjectionDirty = false;
      this.isSharedProjectionDirty = false;
      this.isTransformDirty = false;
      this.updateManuallyBlocked = false;
      this.updateBlockedByResize = false;
      this.isUpdating = false;
      this.isSVG = false;
      this.needsReset = false;
      this.shouldResetTransform = false;
      this.hasCheckedOptimisedAppear = false;
      this.treeScale = { x: 1, y: 1 };
      this.eventHandlers = /* @__PURE__ */ new Map();
      this.hasTreeAnimated = false;
      this.updateScheduled = false;
      this.scheduleUpdate = () => this.update();
      this.projectionUpdateScheduled = false;
      this.checkUpdateFailed = () => {
        if (this.isUpdating) {
          this.isUpdating = false;
          this.clearAllSnapshots();
        }
      };
      this.updateProjection = () => {
        this.projectionUpdateScheduled = false;
        this.nodes.forEach(propagateDirtyNodes);
        this.nodes.forEach(resolveTargetDelta);
        this.nodes.forEach(calcProjection);
        this.nodes.forEach(cleanDirtyNodes);
      };
      this.resolvedRelativeTargetAt = 0;
      this.hasProjected = false;
      this.isVisible = true;
      this.animationProgress = 0;
      this.sharedNodes = /* @__PURE__ */ new Map();
      this.latestValues = latestValues;
      this.root = parent ? parent.root || parent : this;
      this.path = parent ? [...parent.path, parent] : [];
      this.parent = parent;
      this.depth = parent ? parent.depth + 1 : 0;
      for (let i = 0; i < this.path.length; i++) {
        this.path[i].shouldResetTransform = true;
      }
      if (this.root === this)
        this.nodes = new FlatTree();
    }
    addEventListener(name, handler) {
      if (!this.eventHandlers.has(name)) {
        this.eventHandlers.set(name, new SubscriptionManager());
      }
      return this.eventHandlers.get(name).add(handler);
    }
    notifyListeners(name, ...args) {
      const subscriptionManager = this.eventHandlers.get(name);
      subscriptionManager && subscriptionManager.notify(...args);
    }
    hasListeners(name) {
      return this.eventHandlers.has(name);
    }
    /**
     * Lifecycles
     */
    mount(instance) {
      if (this.instance)
        return;
      this.isSVG = isSVGElement(instance) && !isSVGSVGElement(instance);
      this.instance = instance;
      const { layoutId, layout, visualElement } = this.options;
      if (visualElement && !visualElement.current) {
        visualElement.mount(instance);
      }
      this.root.nodes.add(this);
      this.parent && this.parent.children.add(this);
      if (this.root.hasTreeAnimated && (layout || layoutId)) {
        this.isLayoutDirty = true;
      }
      if (attachResizeListener) {
        let cancelDelay;
        let innerWidth = 0;
        const resizeUnblockUpdate = () => this.root.updateBlockedByResize = false;
        frame.read(() => {
          innerWidth = window.innerWidth;
        });
        attachResizeListener(instance, () => {
          const newInnerWidth = window.innerWidth;
          if (newInnerWidth === innerWidth)
            return;
          innerWidth = newInnerWidth;
          this.root.updateBlockedByResize = true;
          cancelDelay && cancelDelay();
          cancelDelay = delay(resizeUnblockUpdate, 250);
          if (globalProjectionState.hasAnimatedSinceResize) {
            globalProjectionState.hasAnimatedSinceResize = false;
            this.nodes.forEach(finishAnimation);
          }
        });
      }
      if (layoutId) {
        this.root.registerSharedNode(layoutId, this);
      }
      if (this.options.animate !== false && visualElement && (layoutId || layout)) {
        this.addEventListener("didUpdate", ({ delta, hasLayoutChanged, hasRelativeLayoutChanged, layout: newLayout }) => {
          if (this.isTreeAnimationBlocked()) {
            this.target = void 0;
            this.relativeTarget = void 0;
            return;
          }
          const layoutTransition = this.options.transition || visualElement.getDefaultTransition() || defaultLayoutTransition;
          const { onLayoutAnimationStart, onLayoutAnimationComplete } = visualElement.getProps();
          const hasTargetChanged = !this.targetLayout || !boxEqualsRounded(this.targetLayout, newLayout);
          const hasOnlyRelativeTargetChanged = !hasLayoutChanged && hasRelativeLayoutChanged;
          if (this.options.layoutRoot || this.resumeFrom || hasOnlyRelativeTargetChanged || hasLayoutChanged && (hasTargetChanged || !this.currentAnimation)) {
            if (this.resumeFrom) {
              this.resumingFrom = this.resumeFrom;
              this.resumingFrom.resumingFrom = void 0;
            }
            const animationOptions = {
              ...getValueTransition(layoutTransition, "layout"),
              onPlay: onLayoutAnimationStart,
              onComplete: onLayoutAnimationComplete
            };
            if (visualElement.shouldReduceMotion || this.options.layoutRoot) {
              animationOptions.delay = 0;
              animationOptions.type = false;
            }
            this.startAnimation(animationOptions);
            this.setAnimationOrigin(delta, hasOnlyRelativeTargetChanged);
          } else {
            if (!hasLayoutChanged) {
              finishAnimation(this);
            }
            if (this.isLead() && this.options.onExitComplete) {
              this.options.onExitComplete();
            }
          }
          this.targetLayout = newLayout;
        });
      }
    }
    unmount() {
      this.options.layoutId && this.willUpdate();
      this.root.nodes.remove(this);
      const stack = this.getStack();
      stack && stack.remove(this);
      this.parent && this.parent.children.delete(this);
      this.instance = void 0;
      this.eventHandlers.clear();
      cancelFrame(this.updateProjection);
    }
    // only on the root
    blockUpdate() {
      this.updateManuallyBlocked = true;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = false;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || false;
    }
    // Note: currently only running on root node
    startUpdate() {
      if (this.isUpdateBlocked())
        return;
      this.isUpdating = true;
      this.nodes && this.nodes.forEach(resetSkewAndRotation);
      this.animationId++;
    }
    getTransformTemplate() {
      const { visualElement } = this.options;
      return visualElement && visualElement.getProps().transformTemplate;
    }
    willUpdate(shouldNotifyListeners = true) {
      this.root.hasTreeAnimated = true;
      if (this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear) {
        cancelTreeOptimisedTransformAnimations(this);
      }
      !this.root.isUpdating && this.root.startUpdate();
      if (this.isLayoutDirty)
        return;
      this.isLayoutDirty = true;
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        node.shouldResetTransform = true;
        node.updateScroll("snapshot");
        if (node.options.layoutRoot) {
          node.willUpdate(false);
        }
      }
      const { layoutId, layout } = this.options;
      if (layoutId === void 0 && !layout)
        return;
      const transformTemplate = this.getTransformTemplate();
      this.prevTransformTemplateValue = transformTemplate ? transformTemplate(this.latestValues, "") : void 0;
      this.updateSnapshot();
      shouldNotifyListeners && this.notifyListeners("willUpdate");
    }
    update() {
      this.updateScheduled = false;
      const updateWasBlocked = this.isUpdateBlocked();
      if (updateWasBlocked) {
        this.unblockUpdate();
        this.clearAllSnapshots();
        this.nodes.forEach(clearMeasurements);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(clearIsLayoutDirty);
        return;
      }
      this.animationCommitId = this.animationId;
      if (!this.isUpdating) {
        this.nodes.forEach(clearIsLayoutDirty);
      } else {
        this.isUpdating = false;
        this.nodes.forEach(resetTransformStyle);
        this.nodes.forEach(updateLayout);
        this.nodes.forEach(notifyLayoutUpdate);
      }
      this.clearAllSnapshots();
      const now = time.now();
      frameData.delta = clamp(0, 1e3 / 60, now - frameData.timestamp);
      frameData.timestamp = now;
      frameData.isProcessing = true;
      frameSteps.update.process(frameData);
      frameSteps.preRender.process(frameData);
      frameSteps.render.process(frameData);
      frameData.isProcessing = false;
    }
    didUpdate() {
      if (!this.updateScheduled) {
        this.updateScheduled = true;
        microtask.read(this.scheduleUpdate);
      }
    }
    clearAllSnapshots() {
      this.nodes.forEach(clearSnapshot);
      this.sharedNodes.forEach(removeLeadSnapshots);
    }
    scheduleUpdateProjection() {
      if (!this.projectionUpdateScheduled) {
        this.projectionUpdateScheduled = true;
        frame.preRender(this.updateProjection, false, true);
      }
    }
    scheduleCheckAfterUnmount() {
      frame.postRender(() => {
        if (this.isLayoutDirty) {
          this.root.didUpdate();
        } else {
          this.root.checkUpdateFailed();
        }
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      if (this.snapshot || !this.instance)
        return;
      this.snapshot = this.measure();
      if (this.snapshot && !calcLength(this.snapshot.measuredBox.x) && !calcLength(this.snapshot.measuredBox.y)) {
        this.snapshot = void 0;
      }
    }
    updateLayout() {
      if (!this.instance)
        return;
      this.updateScroll();
      if (!(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty) {
        return;
      }
      if (this.resumeFrom && !this.resumeFrom.instance) {
        for (let i = 0; i < this.path.length; i++) {
          const node = this.path[i];
          node.updateScroll();
        }
      }
      const prevLayout = this.layout;
      this.layout = this.measure(false);
      this.layoutCorrected = createBox();
      this.isLayoutDirty = false;
      this.projectionDelta = void 0;
      this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement } = this.options;
      visualElement && visualElement.notify("LayoutMeasure", this.layout.layoutBox, prevLayout ? prevLayout.layoutBox : void 0);
    }
    updateScroll(phase = "measure") {
      let needsMeasurement = Boolean(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === phase) {
        needsMeasurement = false;
      }
      if (needsMeasurement && this.instance) {
        const isRoot = checkIsScrollRoot(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase,
          isRoot,
          offset: measureScroll(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : isRoot
        };
      }
    }
    resetTransform() {
      if (!resetTransform)
        return;
      const isResetRequested = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout;
      const hasProjection = this.projectionDelta && !isDeltaZero(this.projectionDelta);
      const transformTemplate = this.getTransformTemplate();
      const transformTemplateValue = transformTemplate ? transformTemplate(this.latestValues, "") : void 0;
      const transformTemplateHasChanged = transformTemplateValue !== this.prevTransformTemplateValue;
      if (isResetRequested && this.instance && (hasProjection || hasTransform(this.latestValues) || transformTemplateHasChanged)) {
        resetTransform(this.instance, transformTemplateValue);
        this.shouldResetTransform = false;
        this.scheduleRender();
      }
    }
    measure(removeTransform = true) {
      const pageBox = this.measurePageBox();
      let layoutBox = this.removeElementScroll(pageBox);
      if (removeTransform) {
        layoutBox = this.removeTransform(layoutBox);
      }
      roundBox(layoutBox);
      return {
        animationId: this.root.animationId,
        measuredBox: pageBox,
        layoutBox,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      const { visualElement } = this.options;
      if (!visualElement)
        return createBox();
      const box = visualElement.measureViewportBox();
      const wasInScrollRoot = this.scroll?.wasRoot || this.path.some(checkNodeWasScrollRoot);
      if (!wasInScrollRoot) {
        const { scroll } = this.root;
        if (scroll) {
          translateAxis(box.x, scroll.offset.x);
          translateAxis(box.y, scroll.offset.y);
        }
      }
      return box;
    }
    removeElementScroll(box) {
      const boxWithoutScroll = createBox();
      copyBoxInto(boxWithoutScroll, box);
      if (this.scroll?.wasRoot) {
        return boxWithoutScroll;
      }
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        const { scroll, options } = node;
        if (node !== this.root && scroll && options.layoutScroll) {
          if (scroll.wasRoot) {
            copyBoxInto(boxWithoutScroll, box);
          }
          translateAxis(boxWithoutScroll.x, scroll.offset.x);
          translateAxis(boxWithoutScroll.y, scroll.offset.y);
        }
      }
      return boxWithoutScroll;
    }
    applyTransform(box, transformOnly = false) {
      const withTransforms = createBox();
      copyBoxInto(withTransforms, box);
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        if (!transformOnly && node.options.layoutScroll && node.scroll && node !== node.root) {
          transformBox(withTransforms, {
            x: -node.scroll.offset.x,
            y: -node.scroll.offset.y
          });
        }
        if (!hasTransform(node.latestValues))
          continue;
        transformBox(withTransforms, node.latestValues);
      }
      if (hasTransform(this.latestValues)) {
        transformBox(withTransforms, this.latestValues);
      }
      return withTransforms;
    }
    removeTransform(box) {
      const boxWithoutTransform = createBox();
      copyBoxInto(boxWithoutTransform, box);
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        if (!node.instance)
          continue;
        if (!hasTransform(node.latestValues))
          continue;
        hasScale(node.latestValues) && node.updateSnapshot();
        const sourceBox = createBox();
        const nodeBox = node.measurePageBox();
        copyBoxInto(sourceBox, nodeBox);
        removeBoxTransforms(boxWithoutTransform, node.latestValues, node.snapshot ? node.snapshot.layoutBox : void 0, sourceBox);
      }
      if (hasTransform(this.latestValues)) {
        removeBoxTransforms(boxWithoutTransform, this.latestValues);
      }
      return boxWithoutTransform;
    }
    setTargetDelta(delta) {
      this.targetDelta = delta;
      this.root.scheduleUpdateProjection();
      this.isProjectionDirty = true;
    }
    setOptions(options) {
      this.options = {
        ...this.options,
        ...options,
        crossfade: options.crossfade !== void 0 ? options.crossfade : true
      };
    }
    clearMeasurements() {
      this.scroll = void 0;
      this.layout = void 0;
      this.snapshot = void 0;
      this.prevTransformTemplateValue = void 0;
      this.targetDelta = void 0;
      this.target = void 0;
      this.isLayoutDirty = false;
    }
    forceRelativeParentToResolveTarget() {
      if (!this.relativeParent)
        return;
      if (this.relativeParent.resolvedRelativeTargetAt !== frameData.timestamp) {
        this.relativeParent.resolveTargetDelta(true);
      }
    }
    resolveTargetDelta(forceRecalculation = false) {
      const lead = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = lead.isProjectionDirty);
      this.isTransformDirty || (this.isTransformDirty = lead.isTransformDirty);
      this.isSharedProjectionDirty || (this.isSharedProjectionDirty = lead.isSharedProjectionDirty);
      const isShared = Boolean(this.resumingFrom) || this !== lead;
      const canSkip = !(forceRecalculation || isShared && this.isSharedProjectionDirty || this.isProjectionDirty || this.parent?.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize);
      if (canSkip)
        return;
      const { layout, layoutId } = this.options;
      if (!this.layout || !(layout || layoutId))
        return;
      this.resolvedRelativeTargetAt = frameData.timestamp;
      if (!this.targetDelta && !this.relativeTarget) {
        const relativeParent = this.getClosestProjectingParent();
        if (relativeParent && relativeParent.layout && this.animationProgress !== 1) {
          this.relativeParent = relativeParent;
          this.forceRelativeParentToResolveTarget();
          this.relativeTarget = createBox();
          this.relativeTargetOrigin = createBox();
          calcRelativePosition(this.relativeTargetOrigin, this.layout.layoutBox, relativeParent.layout.layoutBox);
          copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
        } else {
          this.relativeParent = this.relativeTarget = void 0;
        }
      }
      if (!this.relativeTarget && !this.targetDelta)
        return;
      if (!this.target) {
        this.target = createBox();
        this.targetWithTransforms = createBox();
      }
      if (this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target) {
        this.forceRelativeParentToResolveTarget();
        calcRelativeBox(this.target, this.relativeTarget, this.relativeParent.target);
      } else if (this.targetDelta) {
        if (Boolean(this.resumingFrom)) {
          this.target = this.applyTransform(this.layout.layoutBox);
        } else {
          copyBoxInto(this.target, this.layout.layoutBox);
        }
        applyBoxDelta(this.target, this.targetDelta);
      } else {
        copyBoxInto(this.target, this.layout.layoutBox);
      }
      if (this.attemptToResolveRelativeTarget) {
        this.attemptToResolveRelativeTarget = false;
        const relativeParent = this.getClosestProjectingParent();
        if (relativeParent && Boolean(relativeParent.resumingFrom) === Boolean(this.resumingFrom) && !relativeParent.options.layoutScroll && relativeParent.target && this.animationProgress !== 1) {
          this.relativeParent = relativeParent;
          this.forceRelativeParentToResolveTarget();
          this.relativeTarget = createBox();
          this.relativeTargetOrigin = createBox();
          calcRelativePosition(this.relativeTargetOrigin, this.target, relativeParent.target);
          copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
        } else {
          this.relativeParent = this.relativeTarget = void 0;
        }
      }
    }
    getClosestProjectingParent() {
      if (!this.parent || hasScale(this.parent.latestValues) || has2DTranslate(this.parent.latestValues)) {
        return void 0;
      }
      if (this.parent.isProjecting()) {
        return this.parent;
      } else {
        return this.parent.getClosestProjectingParent();
      }
    }
    isProjecting() {
      return Boolean((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    calcProjection() {
      const lead = this.getLead();
      const isShared = Boolean(this.resumingFrom) || this !== lead;
      let canSkip = true;
      if (this.isProjectionDirty || this.parent?.isProjectionDirty) {
        canSkip = false;
      }
      if (isShared && (this.isSharedProjectionDirty || this.isTransformDirty)) {
        canSkip = false;
      }
      if (this.resolvedRelativeTargetAt === frameData.timestamp) {
        canSkip = false;
      }
      if (canSkip)
        return;
      const { layout, layoutId } = this.options;
      this.isTreeAnimating = Boolean(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation);
      if (!this.isTreeAnimating) {
        this.targetDelta = this.relativeTarget = void 0;
      }
      if (!this.layout || !(layout || layoutId))
        return;
      copyBoxInto(this.layoutCorrected, this.layout.layoutBox);
      const prevTreeScaleX = this.treeScale.x;
      const prevTreeScaleY = this.treeScale.y;
      applyTreeDeltas(this.layoutCorrected, this.treeScale, this.path, isShared);
      if (lead.layout && !lead.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1)) {
        lead.target = lead.layout.layoutBox;
        lead.targetWithTransforms = createBox();
      }
      const { target } = lead;
      if (!target) {
        if (this.prevProjectionDelta) {
          this.createProjectionDeltas();
          this.scheduleRender();
        }
        return;
      }
      if (!this.projectionDelta || !this.prevProjectionDelta) {
        this.createProjectionDeltas();
      } else {
        copyAxisDeltaInto(this.prevProjectionDelta.x, this.projectionDelta.x);
        copyAxisDeltaInto(this.prevProjectionDelta.y, this.projectionDelta.y);
      }
      calcBoxDelta(this.projectionDelta, this.layoutCorrected, target, this.latestValues);
      if (this.treeScale.x !== prevTreeScaleX || this.treeScale.y !== prevTreeScaleY || !axisDeltaEquals(this.projectionDelta.x, this.prevProjectionDelta.x) || !axisDeltaEquals(this.projectionDelta.y, this.prevProjectionDelta.y)) {
        this.hasProjected = true;
        this.scheduleRender();
        this.notifyListeners("projectionUpdate", target);
      }
    }
    hide() {
      this.isVisible = false;
    }
    show() {
      this.isVisible = true;
    }
    scheduleRender(notifyAll = true) {
      this.options.visualElement?.scheduleRender();
      if (notifyAll) {
        const stack = this.getStack();
        stack && stack.scheduleRender();
      }
      if (this.resumingFrom && !this.resumingFrom.instance) {
        this.resumingFrom = void 0;
      }
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = createDelta();
      this.projectionDelta = createDelta();
      this.projectionDeltaWithTransform = createDelta();
    }
    setAnimationOrigin(delta, hasOnlyRelativeTargetChanged = false) {
      const snapshot = this.snapshot;
      const snapshotLatestValues = snapshot ? snapshot.latestValues : {};
      const mixedValues = { ...this.latestValues };
      const targetDelta = createDelta();
      if (!this.relativeParent || !this.relativeParent.options.layoutRoot) {
        this.relativeTarget = this.relativeTargetOrigin = void 0;
      }
      this.attemptToResolveRelativeTarget = !hasOnlyRelativeTargetChanged;
      const relativeLayout = createBox();
      const snapshotSource = snapshot ? snapshot.source : void 0;
      const layoutSource = this.layout ? this.layout.source : void 0;
      const isSharedLayoutAnimation = snapshotSource !== layoutSource;
      const stack = this.getStack();
      const isOnlyMember = !stack || stack.members.length <= 1;
      const shouldCrossfadeOpacity = Boolean(isSharedLayoutAnimation && !isOnlyMember && this.options.crossfade === true && !this.path.some(hasOpacityCrossfade));
      this.animationProgress = 0;
      let prevRelativeTarget;
      this.mixTargetDelta = (latest) => {
        const progress = latest / 1e3;
        mixAxisDelta(targetDelta.x, delta.x, progress);
        mixAxisDelta(targetDelta.y, delta.y, progress);
        this.setTargetDelta(targetDelta);
        if (this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout) {
          calcRelativePosition(relativeLayout, this.layout.layoutBox, this.relativeParent.layout.layoutBox);
          mixBox(this.relativeTarget, this.relativeTargetOrigin, relativeLayout, progress);
          if (prevRelativeTarget && boxEquals(this.relativeTarget, prevRelativeTarget)) {
            this.isProjectionDirty = false;
          }
          if (!prevRelativeTarget)
            prevRelativeTarget = createBox();
          copyBoxInto(prevRelativeTarget, this.relativeTarget);
        }
        if (isSharedLayoutAnimation) {
          this.animationValues = mixedValues;
          mixValues(mixedValues, snapshotLatestValues, this.latestValues, progress, shouldCrossfadeOpacity, isOnlyMember);
        }
        this.root.scheduleUpdateProjection();
        this.scheduleRender();
        this.animationProgress = progress;
      };
      this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(options) {
      this.notifyListeners("animationStart");
      this.currentAnimation?.stop();
      this.resumingFrom?.currentAnimation?.stop();
      if (this.pendingAnimation) {
        cancelFrame(this.pendingAnimation);
        this.pendingAnimation = void 0;
      }
      this.pendingAnimation = frame.update(() => {
        globalProjectionState.hasAnimatedSinceResize = true;
        this.motionValue || (this.motionValue = motionValue(0));
        this.currentAnimation = animateSingleValue(this.motionValue, [0, 1e3], {
          ...options,
          velocity: 0,
          isSync: true,
          onUpdate: (latest) => {
            this.mixTargetDelta(latest);
            options.onUpdate && options.onUpdate(latest);
          },
          onStop: () => {
          },
          onComplete: () => {
            options.onComplete && options.onComplete();
            this.completeAnimation();
          }
        });
        if (this.resumingFrom) {
          this.resumingFrom.currentAnimation = this.currentAnimation;
        }
        this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      if (this.resumingFrom) {
        this.resumingFrom.currentAnimation = void 0;
        this.resumingFrom.preserveOpacity = void 0;
      }
      const stack = this.getStack();
      stack && stack.exitAnimationComplete();
      this.resumingFrom = this.currentAnimation = this.animationValues = void 0;
      this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      if (this.currentAnimation) {
        this.mixTargetDelta && this.mixTargetDelta(animationTarget);
        this.currentAnimation.stop();
      }
      this.completeAnimation();
    }
    applyTransformsToTarget() {
      const lead = this.getLead();
      let { targetWithTransforms, target, layout, latestValues } = lead;
      if (!targetWithTransforms || !target || !layout)
        return;
      if (this !== lead && this.layout && layout && shouldAnimatePositionOnly(this.options.animationType, this.layout.layoutBox, layout.layoutBox)) {
        target = this.target || createBox();
        const xLength = calcLength(this.layout.layoutBox.x);
        target.x.min = lead.target.x.min;
        target.x.max = target.x.min + xLength;
        const yLength = calcLength(this.layout.layoutBox.y);
        target.y.min = lead.target.y.min;
        target.y.max = target.y.min + yLength;
      }
      copyBoxInto(targetWithTransforms, target);
      transformBox(targetWithTransforms, latestValues);
      calcBoxDelta(this.projectionDeltaWithTransform, this.layoutCorrected, targetWithTransforms, latestValues);
    }
    registerSharedNode(layoutId, node) {
      if (!this.sharedNodes.has(layoutId)) {
        this.sharedNodes.set(layoutId, new NodeStack());
      }
      const stack = this.sharedNodes.get(layoutId);
      stack.add(node);
      const config = node.options.initialPromotionConfig;
      node.promote({
        transition: config ? config.transition : void 0,
        preserveFollowOpacity: config && config.shouldPreserveFollowOpacity ? config.shouldPreserveFollowOpacity(node) : void 0
      });
    }
    isLead() {
      const stack = this.getStack();
      return stack ? stack.lead === this : true;
    }
    getLead() {
      const { layoutId } = this.options;
      return layoutId ? this.getStack()?.lead || this : this;
    }
    getPrevLead() {
      const { layoutId } = this.options;
      return layoutId ? this.getStack()?.prevLead : void 0;
    }
    getStack() {
      const { layoutId } = this.options;
      if (layoutId)
        return this.root.sharedNodes.get(layoutId);
    }
    promote({ needsReset, transition, preserveFollowOpacity } = {}) {
      const stack = this.getStack();
      if (stack)
        stack.promote(this, preserveFollowOpacity);
      if (needsReset) {
        this.projectionDelta = void 0;
        this.needsReset = true;
      }
      if (transition)
        this.setOptions({ transition });
    }
    relegate() {
      const stack = this.getStack();
      if (stack) {
        return stack.relegate(this);
      } else {
        return false;
      }
    }
    resetSkewAndRotation() {
      const { visualElement } = this.options;
      if (!visualElement)
        return;
      let hasDistortingTransform = false;
      const { latestValues } = visualElement;
      if (latestValues.z || latestValues.rotate || latestValues.rotateX || latestValues.rotateY || latestValues.rotateZ || latestValues.skewX || latestValues.skewY) {
        hasDistortingTransform = true;
      }
      if (!hasDistortingTransform)
        return;
      const resetValues = {};
      if (latestValues.z) {
        resetDistortingTransform("z", visualElement, resetValues, this.animationValues);
      }
      for (let i = 0; i < transformAxes.length; i++) {
        resetDistortingTransform(`rotate${transformAxes[i]}`, visualElement, resetValues, this.animationValues);
        resetDistortingTransform(`skew${transformAxes[i]}`, visualElement, resetValues, this.animationValues);
      }
      visualElement.render();
      for (const key in resetValues) {
        visualElement.setStaticValue(key, resetValues[key]);
        if (this.animationValues) {
          this.animationValues[key] = resetValues[key];
        }
      }
      visualElement.scheduleRender();
    }
    applyProjectionStyles(targetStyle, styleProp) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        targetStyle.visibility = "hidden";
        return;
      }
      const transformTemplate = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = false;
        targetStyle.visibility = "";
        targetStyle.opacity = "";
        targetStyle.pointerEvents = resolveMotionValue(styleProp?.pointerEvents) || "";
        targetStyle.transform = transformTemplate ? transformTemplate(this.latestValues, "") : "none";
        return;
      }
      const lead = this.getLead();
      if (!this.projectionDelta || !this.layout || !lead.target) {
        if (this.options.layoutId) {
          targetStyle.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1;
          targetStyle.pointerEvents = resolveMotionValue(styleProp?.pointerEvents) || "";
        }
        if (this.hasProjected && !hasTransform(this.latestValues)) {
          targetStyle.transform = transformTemplate ? transformTemplate({}, "") : "none";
          this.hasProjected = false;
        }
        return;
      }
      targetStyle.visibility = "";
      const valuesToRender = lead.animationValues || lead.latestValues;
      this.applyTransformsToTarget();
      let transform = buildProjectionTransform(this.projectionDeltaWithTransform, this.treeScale, valuesToRender);
      if (transformTemplate) {
        transform = transformTemplate(valuesToRender, transform);
      }
      targetStyle.transform = transform;
      const { x, y } = this.projectionDelta;
      targetStyle.transformOrigin = `${x.origin * 100}% ${y.origin * 100}% 0`;
      if (lead.animationValues) {
        targetStyle.opacity = lead === this ? valuesToRender.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : valuesToRender.opacityExit;
      } else {
        targetStyle.opacity = lead === this ? valuesToRender.opacity !== void 0 ? valuesToRender.opacity : "" : valuesToRender.opacityExit !== void 0 ? valuesToRender.opacityExit : 0;
      }
      for (const key in scaleCorrectors) {
        if (valuesToRender[key] === void 0)
          continue;
        const { correct, applyTo, isCSSVariable } = scaleCorrectors[key];
        const corrected = transform === "none" ? valuesToRender[key] : correct(valuesToRender[key], lead);
        if (applyTo) {
          const num = applyTo.length;
          for (let i = 0; i < num; i++) {
            targetStyle[applyTo[i]] = corrected;
          }
        } else {
          if (isCSSVariable) {
            this.options.visualElement.renderState.vars[key] = corrected;
          } else {
            targetStyle[key] = corrected;
          }
        }
      }
      if (this.options.layoutId) {
        targetStyle.pointerEvents = lead === this ? resolveMotionValue(styleProp?.pointerEvents) || "" : "none";
      }
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((node) => node.currentAnimation?.stop());
      this.root.nodes.forEach(clearMeasurements);
      this.root.sharedNodes.clear();
    }
  };
}
function updateLayout(node) {
  node.updateLayout();
}
function notifyLayoutUpdate(node) {
  const snapshot = node.resumeFrom?.snapshot || node.snapshot;
  if (node.isLead() && node.layout && snapshot && node.hasListeners("didUpdate")) {
    const { layoutBox: layout, measuredBox: measuredLayout } = node.layout;
    const { animationType } = node.options;
    const isShared = snapshot.source !== node.layout.source;
    if (animationType === "size") {
      eachAxis((axis) => {
        const axisSnapshot = isShared ? snapshot.measuredBox[axis] : snapshot.layoutBox[axis];
        const length = calcLength(axisSnapshot);
        axisSnapshot.min = layout[axis].min;
        axisSnapshot.max = axisSnapshot.min + length;
      });
    } else if (shouldAnimatePositionOnly(animationType, snapshot.layoutBox, layout)) {
      eachAxis((axis) => {
        const axisSnapshot = isShared ? snapshot.measuredBox[axis] : snapshot.layoutBox[axis];
        const length = calcLength(layout[axis]);
        axisSnapshot.max = axisSnapshot.min + length;
        if (node.relativeTarget && !node.currentAnimation) {
          node.isProjectionDirty = true;
          node.relativeTarget[axis].max = node.relativeTarget[axis].min + length;
        }
      });
    }
    const layoutDelta = createDelta();
    calcBoxDelta(layoutDelta, layout, snapshot.layoutBox);
    const visualDelta = createDelta();
    if (isShared) {
      calcBoxDelta(visualDelta, node.applyTransform(measuredLayout, true), snapshot.measuredBox);
    } else {
      calcBoxDelta(visualDelta, layout, snapshot.layoutBox);
    }
    const hasLayoutChanged = !isDeltaZero(layoutDelta);
    let hasRelativeLayoutChanged = false;
    if (!node.resumeFrom) {
      const relativeParent = node.getClosestProjectingParent();
      if (relativeParent && !relativeParent.resumeFrom) {
        const { snapshot: parentSnapshot, layout: parentLayout } = relativeParent;
        if (parentSnapshot && parentLayout) {
          const relativeSnapshot = createBox();
          calcRelativePosition(relativeSnapshot, snapshot.layoutBox, parentSnapshot.layoutBox);
          const relativeLayout = createBox();
          calcRelativePosition(relativeLayout, layout, parentLayout.layoutBox);
          if (!boxEqualsRounded(relativeSnapshot, relativeLayout)) {
            hasRelativeLayoutChanged = true;
          }
          if (relativeParent.options.layoutRoot) {
            node.relativeTarget = relativeLayout;
            node.relativeTargetOrigin = relativeSnapshot;
            node.relativeParent = relativeParent;
          }
        }
      }
    }
    node.notifyListeners("didUpdate", {
      layout,
      snapshot,
      delta: visualDelta,
      layoutDelta,
      hasLayoutChanged,
      hasRelativeLayoutChanged
    });
  } else if (node.isLead()) {
    const { onExitComplete } = node.options;
    onExitComplete && onExitComplete();
  }
  node.options.transition = void 0;
}
function propagateDirtyNodes(node) {
  if (!node.parent)
    return;
  if (!node.isProjecting()) {
    node.isProjectionDirty = node.parent.isProjectionDirty;
  }
  node.isSharedProjectionDirty || (node.isSharedProjectionDirty = Boolean(node.isProjectionDirty || node.parent.isProjectionDirty || node.parent.isSharedProjectionDirty));
  node.isTransformDirty || (node.isTransformDirty = node.parent.isTransformDirty);
}
function cleanDirtyNodes(node) {
  node.isProjectionDirty = node.isSharedProjectionDirty = node.isTransformDirty = false;
}
function clearSnapshot(node) {
  node.clearSnapshot();
}
function clearMeasurements(node) {
  node.clearMeasurements();
}
function clearIsLayoutDirty(node) {
  node.isLayoutDirty = false;
}
function resetTransformStyle(node) {
  const { visualElement } = node.options;
  if (visualElement && visualElement.getProps().onBeforeLayoutMeasure) {
    visualElement.notify("BeforeLayoutMeasure");
  }
  node.resetTransform();
}
function finishAnimation(node) {
  node.finishAnimation();
  node.targetDelta = node.relativeTarget = node.target = void 0;
  node.isProjectionDirty = true;
}
function resolveTargetDelta(node) {
  node.resolveTargetDelta();
}
function calcProjection(node) {
  node.calcProjection();
}
function resetSkewAndRotation(node) {
  node.resetSkewAndRotation();
}
function removeLeadSnapshots(stack) {
  stack.removeLeadSnapshot();
}
function mixAxisDelta(output, delta, p) {
  output.translate = mixNumber$1(delta.translate, 0, p);
  output.scale = mixNumber$1(delta.scale, 1, p);
  output.origin = delta.origin;
  output.originPoint = delta.originPoint;
}
function mixAxis(output, from, to, p) {
  output.min = mixNumber$1(from.min, to.min, p);
  output.max = mixNumber$1(from.max, to.max, p);
}
function mixBox(output, from, to, p) {
  mixAxis(output.x, from.x, to.x, p);
  mixAxis(output.y, from.y, to.y, p);
}
function hasOpacityCrossfade(node) {
  return node.animationValues && node.animationValues.opacityExit !== void 0;
}
const defaultLayoutTransition = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
};
const userAgentContains = (string) => typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(string);
const roundPoint = userAgentContains("applewebkit/") && !userAgentContains("chrome/") ? Math.round : noop;
function roundAxis(axis) {
  axis.min = roundPoint(axis.min);
  axis.max = roundPoint(axis.max);
}
function roundBox(box) {
  roundAxis(box.x);
  roundAxis(box.y);
}
function shouldAnimatePositionOnly(animationType, snapshot, layout) {
  return animationType === "position" || animationType === "preserve-aspect" && !isNear(aspectRatio(snapshot), aspectRatio(layout), 0.2);
}
function checkNodeWasScrollRoot(node) {
  return node !== node.root && node.scroll?.wasRoot;
}

const DocumentProjectionNode = createProjectionNode({
    attachResizeListener: (ref, notify) => addDomEvent(ref, "resize", notify),
    measureScroll: () => ({
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop,
    }),
    checkIsScrollRoot: () => true,
});

const rootProjectionNode = {
    current: undefined,
};
const HTMLProjectionNode = createProjectionNode({
    measureScroll: (instance) => ({
        x: instance.scrollLeft,
        y: instance.scrollTop,
    }),
    defaultParent: () => {
        if (!rootProjectionNode.current) {
            const documentNode = new DocumentProjectionNode({});
            documentNode.mount(window);
            documentNode.setOptions({ layoutScroll: true });
            rootProjectionNode.current = documentNode;
        }
        return rootProjectionNode.current;
    },
    resetTransform: (instance, value) => {
        instance.style.transform = value !== undefined ? value : "none";
    },
    checkIsScrollRoot: (instance) => Boolean(window.getComputedStyle(instance).position === "fixed"),
});

const drag = {
    pan: {
        Feature: PanGesture,
    },
    drag: {
        Feature: DragGesture,
        ProjectionNode: HTMLProjectionNode,
        MeasureLayout,
    },
};

function handleHoverEvent(node, event, lifecycle) {
    const { props } = node;
    if (node.animationState && props.whileHover) {
        node.animationState.setActive("whileHover", lifecycle === "Start");
    }
    const eventName = ("onHover" + lifecycle);
    const callback = props[eventName];
    if (callback) {
        frame.postRender(() => callback(event, extractEventInfo(event)));
    }
}
class HoverGesture extends Feature {
    mount() {
        const { current } = this.node;
        if (!current)
            return;
        this.unmount = hover(current, (_element, startEvent) => {
            handleHoverEvent(this.node, startEvent, "Start");
            return (endEvent) => handleHoverEvent(this.node, endEvent, "End");
        });
    }
    unmount() { }
}

class FocusGesture extends Feature {
    constructor() {
        super(...arguments);
        this.isActive = false;
    }
    onFocus() {
        let isFocusVisible = false;
        /**
         * If this element doesn't match focus-visible then don't
         * apply whileHover. But, if matches throws that focus-visible
         * is not a valid selector then in that browser outline styles will be applied
         * to the element by default and we want to match that behaviour with whileFocus.
         */
        try {
            isFocusVisible = this.node.current.matches(":focus-visible");
        }
        catch (e) {
            isFocusVisible = true;
        }
        if (!isFocusVisible || !this.node.animationState)
            return;
        this.node.animationState.setActive("whileFocus", true);
        this.isActive = true;
    }
    onBlur() {
        if (!this.isActive || !this.node.animationState)
            return;
        this.node.animationState.setActive("whileFocus", false);
        this.isActive = false;
    }
    mount() {
        this.unmount = pipe(addDomEvent(this.node.current, "focus", () => this.onFocus()), addDomEvent(this.node.current, "blur", () => this.onBlur()));
    }
    unmount() { }
}

function handlePressEvent(node, event, lifecycle) {
  const { props } = node;
  if (node.current instanceof HTMLButtonElement && node.current.disabled) {
    return;
  }
  if (node.animationState && props.whileTap) {
    node.animationState.setActive("whileTap", lifecycle === "Start");
  }
  const eventName = "onTap" + (lifecycle === "End" ? "" : lifecycle);
  const callback = props[eventName];
  if (callback) {
    frame.postRender(() => callback(event, extractEventInfo(event)));
  }
}
class PressGesture extends Feature {
  mount() {
    const { current } = this.node;
    if (!current)
      return;
    this.unmount = press(current, (_element, startEvent) => {
      handlePressEvent(this.node, startEvent, "Start");
      return (endEvent, { success }) => handlePressEvent(this.node, endEvent, success ? "End" : "Cancel");
    }, { useGlobalTarget: this.node.props.globalTapTarget });
  }
  unmount() {
  }
}

/**
 * Map an IntersectionHandler callback to an element. We only ever make one handler for one
 * element, so even though these handlers might all be triggered by different
 * observers, we can keep them in the same map.
 */
const observerCallbacks = new WeakMap();
/**
 * Multiple observers can be created for multiple element/document roots. Each with
 * different settings. So here we store dictionaries of observers to each root,
 * using serialised settings (threshold/margin) as lookup keys.
 */
const observers = new WeakMap();
const fireObserverCallback = (entry) => {
    const callback = observerCallbacks.get(entry.target);
    callback && callback(entry);
};
const fireAllObserverCallbacks = (entries) => {
    entries.forEach(fireObserverCallback);
};
function initIntersectionObserver({ root, ...options }) {
    const lookupRoot = root || document;
    /**
     * If we don't have an observer lookup map for this root, create one.
     */
    if (!observers.has(lookupRoot)) {
        observers.set(lookupRoot, {});
    }
    const rootObservers = observers.get(lookupRoot);
    const key = JSON.stringify(options);
    /**
     * If we don't have an observer for this combination of root and settings,
     * create one.
     */
    if (!rootObservers[key]) {
        rootObservers[key] = new IntersectionObserver(fireAllObserverCallbacks, { root, ...options });
    }
    return rootObservers[key];
}
function observeIntersection(element, options, callback) {
    const rootInteresectionObserver = initIntersectionObserver(options);
    observerCallbacks.set(element, callback);
    rootInteresectionObserver.observe(element);
    return () => {
        observerCallbacks.delete(element);
        rootInteresectionObserver.unobserve(element);
    };
}

const thresholdNames = {
    some: 0,
    all: 1,
};
class InViewFeature extends Feature {
    constructor() {
        super(...arguments);
        this.hasEnteredView = false;
        this.isInView = false;
    }
    startObserver() {
        this.unmount();
        const { viewport = {} } = this.node.getProps();
        const { root, margin: rootMargin, amount = "some", once } = viewport;
        const options = {
            root: root ? root.current : undefined,
            rootMargin,
            threshold: typeof amount === "number" ? amount : thresholdNames[amount],
        };
        const onIntersectionUpdate = (entry) => {
            const { isIntersecting } = entry;
            /**
             * If there's been no change in the viewport state, early return.
             */
            if (this.isInView === isIntersecting)
                return;
            this.isInView = isIntersecting;
            /**
             * Handle hasEnteredView. If this is only meant to run once, and
             * element isn't visible, early return. Otherwise set hasEnteredView to true.
             */
            if (once && !isIntersecting && this.hasEnteredView) {
                return;
            }
            else if (isIntersecting) {
                this.hasEnteredView = true;
            }
            if (this.node.animationState) {
                this.node.animationState.setActive("whileInView", isIntersecting);
            }
            /**
             * Use the latest committed props rather than the ones in scope
             * when this observer is created
             */
            const { onViewportEnter, onViewportLeave } = this.node.getProps();
            const callback = isIntersecting ? onViewportEnter : onViewportLeave;
            callback && callback(entry);
        };
        return observeIntersection(this.node.current, options, onIntersectionUpdate);
    }
    mount() {
        this.startObserver();
    }
    update() {
        if (typeof IntersectionObserver === "undefined")
            return;
        const { props, prevProps } = this.node;
        const hasOptionsChanged = ["amount", "margin", "root"].some(hasViewportOptionChanged(props, prevProps));
        if (hasOptionsChanged) {
            this.startObserver();
        }
    }
    unmount() { }
}
function hasViewportOptionChanged({ viewport = {} }, { viewport: prevViewport = {} } = {}) {
    return (name) => viewport[name] !== prevViewport[name];
}

const gestureAnimations = {
    inView: {
        Feature: InViewFeature,
    },
    tap: {
        Feature: PressGesture,
    },
    focus: {
        Feature: FocusGesture,
    },
    hover: {
        Feature: HoverGesture,
    },
};

const layout = {
    layout: {
        ProjectionNode: HTMLProjectionNode,
        MeasureLayout,
    },
};

const featureBundle = {
    ...animations,
    ...gestureAnimations,
    ...drag,
    ...layout,
};

const motion = /*@__PURE__*/ createMotionProxy(featureBundle, createDomVisualElement);

var lottie$1 = {exports: {}};

(function (module, exports$1) {
	typeof document !== "undefined" && typeof navigator !== "undefined" && function(global, factory) {
	  module.exports = factory() ;
	}(commonjsGlobal, function() {
	  var svgNS = "http://www.w3.org/2000/svg";
	  var locationHref = "";
	  var _useWebWorker = false;
	  var initialDefaultFrame = -999999;
	  var setWebWorker = function setWebWorker2(flag) {
	    _useWebWorker = !!flag;
	  };
	  var getWebWorker = function getWebWorker2() {
	    return _useWebWorker;
	  };
	  var setLocationHref = function setLocationHref2(value2) {
	    locationHref = value2;
	  };
	  var getLocationHref = function getLocationHref2() {
	    return locationHref;
	  };
	  function createTag(type) {
	    return document.createElement(type);
	  }
	  function extendPrototype(sources, destination) {
	    var i;
	    var len = sources.length;
	    var sourcePrototype;
	    for (i = 0; i < len; i += 1) {
	      sourcePrototype = sources[i].prototype;
	      for (var attr in sourcePrototype) {
	        if (Object.prototype.hasOwnProperty.call(sourcePrototype, attr)) destination.prototype[attr] = sourcePrototype[attr];
	      }
	    }
	  }
	  function getDescriptor(object, prop) {
	    return Object.getOwnPropertyDescriptor(object, prop);
	  }
	  function createProxyFunction(prototype) {
	    function ProxyFunction() {
	    }
	    ProxyFunction.prototype = prototype;
	    return ProxyFunction;
	  }
	  var audioControllerFactory = function() {
	    function AudioController(audioFactory) {
	      this.audios = [];
	      this.audioFactory = audioFactory;
	      this._volume = 1;
	      this._isMuted = false;
	    }
	    AudioController.prototype = {
	      addAudio: function addAudio(audio) {
	        this.audios.push(audio);
	      },
	      pause: function pause() {
	        var i;
	        var len = this.audios.length;
	        for (i = 0; i < len; i += 1) {
	          this.audios[i].pause();
	        }
	      },
	      resume: function resume() {
	        var i;
	        var len = this.audios.length;
	        for (i = 0; i < len; i += 1) {
	          this.audios[i].resume();
	        }
	      },
	      setRate: function setRate(rateValue) {
	        var i;
	        var len = this.audios.length;
	        for (i = 0; i < len; i += 1) {
	          this.audios[i].setRate(rateValue);
	        }
	      },
	      createAudio: function createAudio(assetPath) {
	        if (this.audioFactory) {
	          return this.audioFactory(assetPath);
	        }
	        if (window.Howl) {
	          return new window.Howl({
	            src: [assetPath]
	          });
	        }
	        return {
	          isPlaying: false,
	          play: function play() {
	            this.isPlaying = true;
	          },
	          seek: function seek() {
	            this.isPlaying = false;
	          },
	          playing: function playing() {
	          },
	          rate: function rate() {
	          },
	          setVolume: function setVolume() {
	          }
	        };
	      },
	      setAudioFactory: function setAudioFactory(audioFactory) {
	        this.audioFactory = audioFactory;
	      },
	      setVolume: function setVolume(value2) {
	        this._volume = value2;
	        this._updateVolume();
	      },
	      mute: function mute() {
	        this._isMuted = true;
	        this._updateVolume();
	      },
	      unmute: function unmute() {
	        this._isMuted = false;
	        this._updateVolume();
	      },
	      getVolume: function getVolume() {
	        return this._volume;
	      },
	      _updateVolume: function _updateVolume() {
	        var i;
	        var len = this.audios.length;
	        for (i = 0; i < len; i += 1) {
	          this.audios[i].volume(this._volume * (this._isMuted ? 0 : 1));
	        }
	      }
	    };
	    return function() {
	      return new AudioController();
	    };
	  }();
	  var createTypedArray = function() {
	    function createRegularArray(type, len) {
	      var i = 0;
	      var arr = [];
	      var value2;
	      switch (type) {
	        case "int16":
	        case "uint8c":
	          value2 = 1;
	          break;
	        default:
	          value2 = 1.1;
	          break;
	      }
	      for (i = 0; i < len; i += 1) {
	        arr.push(value2);
	      }
	      return arr;
	    }
	    function createTypedArrayFactory(type, len) {
	      if (type === "float32") {
	        return new Float32Array(len);
	      }
	      if (type === "int16") {
	        return new Int16Array(len);
	      }
	      if (type === "uint8c") {
	        return new Uint8ClampedArray(len);
	      }
	      return createRegularArray(type, len);
	    }
	    if (typeof Uint8ClampedArray === "function" && typeof Float32Array === "function") {
	      return createTypedArrayFactory;
	    }
	    return createRegularArray;
	  }();
	  function createSizedArray(len) {
	    return Array.apply(null, {
	      length: len
	    });
	  }
	  function _typeof$6(o) {
	    "@babel/helpers - typeof";
	    return _typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof$6(o);
	  }
	  var subframeEnabled = true;
	  var expressionsPlugin = null;
	  var expressionsInterfaces = null;
	  var idPrefix$1 = "";
	  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	  var bmPow = Math.pow;
	  var bmSqrt = Math.sqrt;
	  var bmFloor = Math.floor;
	  var bmMax = Math.max;
	  var bmMin = Math.min;
	  var BMMath = {};
	  (function() {
	    var propertyNames = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt", "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"];
	    var i;
	    var len = propertyNames.length;
	    for (i = 0; i < len; i += 1) {
	      BMMath[propertyNames[i]] = Math[propertyNames[i]];
	    }
	  })();
	  BMMath.random = Math.random;
	  BMMath.abs = function(val2) {
	    var tOfVal = _typeof$6(val2);
	    if (tOfVal === "object" && val2.length) {
	      var absArr = createSizedArray(val2.length);
	      var i;
	      var len = val2.length;
	      for (i = 0; i < len; i += 1) {
	        absArr[i] = Math.abs(val2[i]);
	      }
	      return absArr;
	    }
	    return Math.abs(val2);
	  };
	  var defaultCurveSegments = 150;
	  var degToRads = Math.PI / 180;
	  var roundCorner = 0.5519;
	  function styleDiv(element) {
	    element.style.position = "absolute";
	    element.style.top = 0;
	    element.style.left = 0;
	    element.style.display = "block";
	    element.style.transformOrigin = "0 0";
	    element.style.webkitTransformOrigin = "0 0";
	    element.style.backfaceVisibility = "visible";
	    element.style.webkitBackfaceVisibility = "visible";
	    element.style.transformStyle = "preserve-3d";
	    element.style.webkitTransformStyle = "preserve-3d";
	    element.style.mozTransformStyle = "preserve-3d";
	  }
	  function BMEnterFrameEvent(type, currentTime, totalTime, frameMultiplier) {
	    this.type = type;
	    this.currentTime = currentTime;
	    this.totalTime = totalTime;
	    this.direction = frameMultiplier < 0 ? -1 : 1;
	  }
	  function BMCompleteEvent(type, frameMultiplier) {
	    this.type = type;
	    this.direction = frameMultiplier < 0 ? -1 : 1;
	  }
	  function BMCompleteLoopEvent(type, totalLoops, currentLoop, frameMultiplier) {
	    this.type = type;
	    this.currentLoop = currentLoop;
	    this.totalLoops = totalLoops;
	    this.direction = frameMultiplier < 0 ? -1 : 1;
	  }
	  function BMSegmentStartEvent(type, firstFrame, totalFrames) {
	    this.type = type;
	    this.firstFrame = firstFrame;
	    this.totalFrames = totalFrames;
	  }
	  function BMDestroyEvent(type, target) {
	    this.type = type;
	    this.target = target;
	  }
	  function BMRenderFrameErrorEvent(nativeError, currentTime) {
	    this.type = "renderFrameError";
	    this.nativeError = nativeError;
	    this.currentTime = currentTime;
	  }
	  function BMConfigErrorEvent(nativeError) {
	    this.type = "configError";
	    this.nativeError = nativeError;
	  }
	  var createElementID = /* @__PURE__ */ function() {
	    var _count = 0;
	    return function createID() {
	      _count += 1;
	      return idPrefix$1 + "__lottie_element_" + _count;
	    };
	  }();
	  function HSVtoRGB(h, s, v) {
	    var r;
	    var g;
	    var b;
	    var i;
	    var f;
	    var p;
	    var q;
	    var t;
	    i = Math.floor(h * 6);
	    f = h * 6 - i;
	    p = v * (1 - s);
	    q = v * (1 - f * s);
	    t = v * (1 - (1 - f) * s);
	    switch (i % 6) {
	      case 0:
	        r = v;
	        g = t;
	        b = p;
	        break;
	      case 1:
	        r = q;
	        g = v;
	        b = p;
	        break;
	      case 2:
	        r = p;
	        g = v;
	        b = t;
	        break;
	      case 3:
	        r = p;
	        g = q;
	        b = v;
	        break;
	      case 4:
	        r = t;
	        g = p;
	        b = v;
	        break;
	      case 5:
	        r = v;
	        g = p;
	        b = q;
	        break;
	    }
	    return [r, g, b];
	  }
	  function RGBtoHSV(r, g, b) {
	    var max = Math.max(r, g, b);
	    var min = Math.min(r, g, b);
	    var d = max - min;
	    var h;
	    var s = max === 0 ? 0 : d / max;
	    var v = max / 255;
	    switch (max) {
	      case min:
	        h = 0;
	        break;
	      case r:
	        h = g - b + d * (g < b ? 6 : 0);
	        h /= 6 * d;
	        break;
	      case g:
	        h = b - r + d * 2;
	        h /= 6 * d;
	        break;
	      case b:
	        h = r - g + d * 4;
	        h /= 6 * d;
	        break;
	    }
	    return [h, s, v];
	  }
	  function addSaturationToRGB(color, offset) {
	    var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
	    hsv[1] += offset;
	    if (hsv[1] > 1) {
	      hsv[1] = 1;
	    } else if (hsv[1] <= 0) {
	      hsv[1] = 0;
	    }
	    return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
	  }
	  function addBrightnessToRGB(color, offset) {
	    var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
	    hsv[2] += offset;
	    if (hsv[2] > 1) {
	      hsv[2] = 1;
	    } else if (hsv[2] < 0) {
	      hsv[2] = 0;
	    }
	    return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
	  }
	  function addHueToRGB(color, offset) {
	    var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
	    hsv[0] += offset / 360;
	    if (hsv[0] > 1) {
	      hsv[0] -= 1;
	    } else if (hsv[0] < 0) {
	      hsv[0] += 1;
	    }
	    return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
	  }
	  var rgbToHex = function() {
	    var colorMap = [];
	    var i;
	    var hex;
	    for (i = 0; i < 256; i += 1) {
	      hex = i.toString(16);
	      colorMap[i] = hex.length === 1 ? "0" + hex : hex;
	    }
	    return function(r, g, b) {
	      if (r < 0) {
	        r = 0;
	      }
	      if (g < 0) {
	        g = 0;
	      }
	      if (b < 0) {
	        b = 0;
	      }
	      return "#" + colorMap[r] + colorMap[g] + colorMap[b];
	    };
	  }();
	  var setSubframeEnabled = function setSubframeEnabled2(flag) {
	    subframeEnabled = !!flag;
	  };
	  var getSubframeEnabled = function getSubframeEnabled2() {
	    return subframeEnabled;
	  };
	  var setExpressionsPlugin = function setExpressionsPlugin2(value2) {
	    expressionsPlugin = value2;
	  };
	  var getExpressionsPlugin = function getExpressionsPlugin2() {
	    return expressionsPlugin;
	  };
	  var setExpressionInterfaces = function setExpressionInterfaces2(value2) {
	    expressionsInterfaces = value2;
	  };
	  var getExpressionInterfaces = function getExpressionInterfaces2() {
	    return expressionsInterfaces;
	  };
	  var setDefaultCurveSegments = function setDefaultCurveSegments2(value2) {
	    defaultCurveSegments = value2;
	  };
	  var getDefaultCurveSegments = function getDefaultCurveSegments2() {
	    return defaultCurveSegments;
	  };
	  var setIdPrefix = function setIdPrefix2(value2) {
	    idPrefix$1 = value2;
	  };
	  function createNS(type) {
	    return document.createElementNS(svgNS, type);
	  }
	  function _typeof$5(o) {
	    "@babel/helpers - typeof";
	    return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof$5(o);
	  }
	  var dataManager = /* @__PURE__ */ function() {
	    var _counterId = 1;
	    var processes = [];
	    var workerFn;
	    var workerInstance;
	    var workerProxy = {
	      onmessage: function onmessage() {
	      },
	      postMessage: function postMessage(path) {
	        workerFn({
	          data: path
	        });
	      }
	    };
	    var _workerSelf = {
	      postMessage: function postMessage(data2) {
	        workerProxy.onmessage({
	          data: data2
	        });
	      }
	    };
	    function createWorker(fn) {
	      if (window.Worker && window.Blob && getWebWorker()) {
	        var blob = new Blob(["var _workerSelf = self; self.onmessage = ", fn.toString()], {
	          type: "text/javascript"
	        });
	        var url = URL.createObjectURL(blob);
	        return new Worker(url);
	      }
	      workerFn = fn;
	      return workerProxy;
	    }
	    function setupWorker() {
	      if (!workerInstance) {
	        workerInstance = createWorker(function workerStart(e) {
	          function dataFunctionManager() {
	            function completeLayers(layers, comps) {
	              var layerData;
	              var i;
	              var len = layers.length;
	              var j;
	              var jLen;
	              var k;
	              var kLen;
	              for (i = 0; i < len; i += 1) {
	                layerData = layers[i];
	                if ("ks" in layerData && !layerData.completed) {
	                  layerData.completed = true;
	                  if (layerData.hasMask) {
	                    var maskProps = layerData.masksProperties;
	                    jLen = maskProps.length;
	                    for (j = 0; j < jLen; j += 1) {
	                      if (maskProps[j].pt.k.i) {
	                        convertPathsToAbsoluteValues(maskProps[j].pt.k);
	                      } else {
	                        kLen = maskProps[j].pt.k.length;
	                        for (k = 0; k < kLen; k += 1) {
	                          if (maskProps[j].pt.k[k].s) {
	                            convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
	                          }
	                          if (maskProps[j].pt.k[k].e) {
	                            convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
	                          }
	                        }
	                      }
	                    }
	                  }
	                  if (layerData.ty === 0) {
	                    layerData.layers = findCompLayers(layerData.refId, comps);
	                    completeLayers(layerData.layers, comps);
	                  } else if (layerData.ty === 4) {
	                    completeShapes(layerData.shapes);
	                  } else if (layerData.ty === 5) {
	                    completeText(layerData);
	                  }
	                }
	              }
	            }
	            function completeChars(chars, assets) {
	              if (chars) {
	                var i = 0;
	                var len = chars.length;
	                for (i = 0; i < len; i += 1) {
	                  if (chars[i].t === 1) {
	                    chars[i].data.layers = findCompLayers(chars[i].data.refId, assets);
	                    completeLayers(chars[i].data.layers, assets);
	                  }
	                }
	              }
	            }
	            function findComp(id, comps) {
	              var i = 0;
	              var len = comps.length;
	              while (i < len) {
	                if (comps[i].id === id) {
	                  return comps[i];
	                }
	                i += 1;
	              }
	              return null;
	            }
	            function findCompLayers(id, comps) {
	              var comp2 = findComp(id, comps);
	              if (comp2) {
	                if (!comp2.layers.__used) {
	                  comp2.layers.__used = true;
	                  return comp2.layers;
	                }
	                return JSON.parse(JSON.stringify(comp2.layers));
	              }
	              return null;
	            }
	            function completeShapes(arr) {
	              var i;
	              var len = arr.length;
	              var j;
	              var jLen;
	              for (i = len - 1; i >= 0; i -= 1) {
	                if (arr[i].ty === "sh") {
	                  if (arr[i].ks.k.i) {
	                    convertPathsToAbsoluteValues(arr[i].ks.k);
	                  } else {
	                    jLen = arr[i].ks.k.length;
	                    for (j = 0; j < jLen; j += 1) {
	                      if (arr[i].ks.k[j].s) {
	                        convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
	                      }
	                      if (arr[i].ks.k[j].e) {
	                        convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
	                      }
	                    }
	                  }
	                } else if (arr[i].ty === "gr") {
	                  completeShapes(arr[i].it);
	                }
	              }
	            }
	            function convertPathsToAbsoluteValues(path) {
	              var i;
	              var len = path.i.length;
	              for (i = 0; i < len; i += 1) {
	                path.i[i][0] += path.v[i][0];
	                path.i[i][1] += path.v[i][1];
	                path.o[i][0] += path.v[i][0];
	                path.o[i][1] += path.v[i][1];
	              }
	            }
	            function checkVersion(minimum, animVersionString) {
	              var animVersion = animVersionString ? animVersionString.split(".") : [100, 100, 100];
	              if (minimum[0] > animVersion[0]) {
	                return true;
	              }
	              if (animVersion[0] > minimum[0]) {
	                return false;
	              }
	              if (minimum[1] > animVersion[1]) {
	                return true;
	              }
	              if (animVersion[1] > minimum[1]) {
	                return false;
	              }
	              if (minimum[2] > animVersion[2]) {
	                return true;
	              }
	              if (animVersion[2] > minimum[2]) {
	                return false;
	              }
	              return null;
	            }
	            var checkText = /* @__PURE__ */ function() {
	              var minimumVersion = [4, 4, 14];
	              function updateTextLayer(textLayer) {
	                var documentData = textLayer.t.d;
	                textLayer.t.d = {
	                  k: [{
	                    s: documentData,
	                    t: 0
	                  }]
	                };
	              }
	              function iterateLayers(layers) {
	                var i;
	                var len = layers.length;
	                for (i = 0; i < len; i += 1) {
	                  if (layers[i].ty === 5) {
	                    updateTextLayer(layers[i]);
	                  }
	                }
	              }
	              return function(animationData2) {
	                if (checkVersion(minimumVersion, animationData2.v)) {
	                  iterateLayers(animationData2.layers);
	                  if (animationData2.assets) {
	                    var i;
	                    var len = animationData2.assets.length;
	                    for (i = 0; i < len; i += 1) {
	                      if (animationData2.assets[i].layers) {
	                        iterateLayers(animationData2.assets[i].layers);
	                      }
	                    }
	                  }
	                }
	              };
	            }();
	            var checkChars = /* @__PURE__ */ function() {
	              var minimumVersion = [4, 7, 99];
	              return function(animationData2) {
	                if (animationData2.chars && !checkVersion(minimumVersion, animationData2.v)) {
	                  var i;
	                  var len = animationData2.chars.length;
	                  for (i = 0; i < len; i += 1) {
	                    var charData = animationData2.chars[i];
	                    if (charData.data && charData.data.shapes) {
	                      completeShapes(charData.data.shapes);
	                      charData.data.ip = 0;
	                      charData.data.op = 99999;
	                      charData.data.st = 0;
	                      charData.data.sr = 1;
	                      charData.data.ks = {
	                        p: {
	                          k: [0, 0],
	                          a: 0
	                        },
	                        s: {
	                          k: [100, 100],
	                          a: 0
	                        },
	                        a: {
	                          k: [0, 0],
	                          a: 0
	                        },
	                        r: {
	                          k: 0,
	                          a: 0
	                        },
	                        o: {
	                          k: 100,
	                          a: 0
	                        }
	                      };
	                      if (!animationData2.chars[i].t) {
	                        charData.data.shapes.push({
	                          ty: "no"
	                        });
	                        charData.data.shapes[0].it.push({
	                          p: {
	                            k: [0, 0],
	                            a: 0
	                          },
	                          s: {
	                            k: [100, 100],
	                            a: 0
	                          },
	                          a: {
	                            k: [0, 0],
	                            a: 0
	                          },
	                          r: {
	                            k: 0,
	                            a: 0
	                          },
	                          o: {
	                            k: 100,
	                            a: 0
	                          },
	                          sk: {
	                            k: 0,
	                            a: 0
	                          },
	                          sa: {
	                            k: 0,
	                            a: 0
	                          },
	                          ty: "tr"
	                        });
	                      }
	                    }
	                  }
	                }
	              };
	            }();
	            var checkPathProperties = /* @__PURE__ */ function() {
	              var minimumVersion = [5, 7, 15];
	              function updateTextLayer(textLayer) {
	                var pathData = textLayer.t.p;
	                if (typeof pathData.a === "number") {
	                  pathData.a = {
	                    a: 0,
	                    k: pathData.a
	                  };
	                }
	                if (typeof pathData.p === "number") {
	                  pathData.p = {
	                    a: 0,
	                    k: pathData.p
	                  };
	                }
	                if (typeof pathData.r === "number") {
	                  pathData.r = {
	                    a: 0,
	                    k: pathData.r
	                  };
	                }
	              }
	              function iterateLayers(layers) {
	                var i;
	                var len = layers.length;
	                for (i = 0; i < len; i += 1) {
	                  if (layers[i].ty === 5) {
	                    updateTextLayer(layers[i]);
	                  }
	                }
	              }
	              return function(animationData2) {
	                if (checkVersion(minimumVersion, animationData2.v)) {
	                  iterateLayers(animationData2.layers);
	                  if (animationData2.assets) {
	                    var i;
	                    var len = animationData2.assets.length;
	                    for (i = 0; i < len; i += 1) {
	                      if (animationData2.assets[i].layers) {
	                        iterateLayers(animationData2.assets[i].layers);
	                      }
	                    }
	                  }
	                }
	              };
	            }();
	            var checkColors = /* @__PURE__ */ function() {
	              var minimumVersion = [4, 1, 9];
	              function iterateShapes(shapes) {
	                var i;
	                var len = shapes.length;
	                var j;
	                var jLen;
	                for (i = 0; i < len; i += 1) {
	                  if (shapes[i].ty === "gr") {
	                    iterateShapes(shapes[i].it);
	                  } else if (shapes[i].ty === "fl" || shapes[i].ty === "st") {
	                    if (shapes[i].c.k && shapes[i].c.k[0].i) {
	                      jLen = shapes[i].c.k.length;
	                      for (j = 0; j < jLen; j += 1) {
	                        if (shapes[i].c.k[j].s) {
	                          shapes[i].c.k[j].s[0] /= 255;
	                          shapes[i].c.k[j].s[1] /= 255;
	                          shapes[i].c.k[j].s[2] /= 255;
	                          shapes[i].c.k[j].s[3] /= 255;
	                        }
	                        if (shapes[i].c.k[j].e) {
	                          shapes[i].c.k[j].e[0] /= 255;
	                          shapes[i].c.k[j].e[1] /= 255;
	                          shapes[i].c.k[j].e[2] /= 255;
	                          shapes[i].c.k[j].e[3] /= 255;
	                        }
	                      }
	                    } else {
	                      shapes[i].c.k[0] /= 255;
	                      shapes[i].c.k[1] /= 255;
	                      shapes[i].c.k[2] /= 255;
	                      shapes[i].c.k[3] /= 255;
	                    }
	                  }
	                }
	              }
	              function iterateLayers(layers) {
	                var i;
	                var len = layers.length;
	                for (i = 0; i < len; i += 1) {
	                  if (layers[i].ty === 4) {
	                    iterateShapes(layers[i].shapes);
	                  }
	                }
	              }
	              return function(animationData2) {
	                if (checkVersion(minimumVersion, animationData2.v)) {
	                  iterateLayers(animationData2.layers);
	                  if (animationData2.assets) {
	                    var i;
	                    var len = animationData2.assets.length;
	                    for (i = 0; i < len; i += 1) {
	                      if (animationData2.assets[i].layers) {
	                        iterateLayers(animationData2.assets[i].layers);
	                      }
	                    }
	                  }
	                }
	              };
	            }();
	            var checkShapes = /* @__PURE__ */ function() {
	              var minimumVersion = [4, 4, 18];
	              function completeClosingShapes(arr) {
	                var i;
	                var len = arr.length;
	                var j;
	                var jLen;
	                for (i = len - 1; i >= 0; i -= 1) {
	                  if (arr[i].ty === "sh") {
	                    if (arr[i].ks.k.i) {
	                      arr[i].ks.k.c = arr[i].closed;
	                    } else {
	                      jLen = arr[i].ks.k.length;
	                      for (j = 0; j < jLen; j += 1) {
	                        if (arr[i].ks.k[j].s) {
	                          arr[i].ks.k[j].s[0].c = arr[i].closed;
	                        }
	                        if (arr[i].ks.k[j].e) {
	                          arr[i].ks.k[j].e[0].c = arr[i].closed;
	                        }
	                      }
	                    }
	                  } else if (arr[i].ty === "gr") {
	                    completeClosingShapes(arr[i].it);
	                  }
	                }
	              }
	              function iterateLayers(layers) {
	                var layerData;
	                var i;
	                var len = layers.length;
	                var j;
	                var jLen;
	                var k;
	                var kLen;
	                for (i = 0; i < len; i += 1) {
	                  layerData = layers[i];
	                  if (layerData.hasMask) {
	                    var maskProps = layerData.masksProperties;
	                    jLen = maskProps.length;
	                    for (j = 0; j < jLen; j += 1) {
	                      if (maskProps[j].pt.k.i) {
	                        maskProps[j].pt.k.c = maskProps[j].cl;
	                      } else {
	                        kLen = maskProps[j].pt.k.length;
	                        for (k = 0; k < kLen; k += 1) {
	                          if (maskProps[j].pt.k[k].s) {
	                            maskProps[j].pt.k[k].s[0].c = maskProps[j].cl;
	                          }
	                          if (maskProps[j].pt.k[k].e) {
	                            maskProps[j].pt.k[k].e[0].c = maskProps[j].cl;
	                          }
	                        }
	                      }
	                    }
	                  }
	                  if (layerData.ty === 4) {
	                    completeClosingShapes(layerData.shapes);
	                  }
	                }
	              }
	              return function(animationData2) {
	                if (checkVersion(minimumVersion, animationData2.v)) {
	                  iterateLayers(animationData2.layers);
	                  if (animationData2.assets) {
	                    var i;
	                    var len = animationData2.assets.length;
	                    for (i = 0; i < len; i += 1) {
	                      if (animationData2.assets[i].layers) {
	                        iterateLayers(animationData2.assets[i].layers);
	                      }
	                    }
	                  }
	                }
	              };
	            }();
	            function completeData(animationData2) {
	              if (animationData2.__complete) {
	                return;
	              }
	              checkColors(animationData2);
	              checkText(animationData2);
	              checkChars(animationData2);
	              checkPathProperties(animationData2);
	              checkShapes(animationData2);
	              completeLayers(animationData2.layers, animationData2.assets);
	              completeChars(animationData2.chars, animationData2.assets);
	              animationData2.__complete = true;
	            }
	            function completeText(data2) {
	              if (data2.t.a.length === 0 && !("m" in data2.t.p)) ;
	            }
	            var moduleOb = {};
	            moduleOb.completeData = completeData;
	            moduleOb.checkColors = checkColors;
	            moduleOb.checkChars = checkChars;
	            moduleOb.checkPathProperties = checkPathProperties;
	            moduleOb.checkShapes = checkShapes;
	            moduleOb.completeLayers = completeLayers;
	            return moduleOb;
	          }
	          if (!_workerSelf.dataManager) {
	            _workerSelf.dataManager = dataFunctionManager();
	          }
	          if (!_workerSelf.assetLoader) {
	            _workerSelf.assetLoader = /* @__PURE__ */ function() {
	              function formatResponse(xhr) {
	                var contentTypeHeader = xhr.getResponseHeader("content-type");
	                if (contentTypeHeader && xhr.responseType === "json" && contentTypeHeader.indexOf("json") !== -1) {
	                  return xhr.response;
	                }
	                if (xhr.response && _typeof$5(xhr.response) === "object") {
	                  return xhr.response;
	                }
	                if (xhr.response && typeof xhr.response === "string") {
	                  return JSON.parse(xhr.response);
	                }
	                if (xhr.responseText) {
	                  return JSON.parse(xhr.responseText);
	                }
	                return null;
	              }
	              function loadAsset(path, fullPath, callback, errorCallback) {
	                var response;
	                var xhr = new XMLHttpRequest();
	                try {
	                  xhr.responseType = "json";
	                } catch (err) {
	                }
	                xhr.onreadystatechange = function() {
	                  if (xhr.readyState === 4) {
	                    if (xhr.status === 200) {
	                      response = formatResponse(xhr);
	                      callback(response);
	                    } else {
	                      try {
	                        response = formatResponse(xhr);
	                        callback(response);
	                      } catch (err) {
	                        if (errorCallback) {
	                          errorCallback(err);
	                        }
	                      }
	                    }
	                  }
	                };
	                try {
	                  xhr.open(["G", "E", "T"].join(""), path, true);
	                } catch (error) {
	                  xhr.open(["G", "E", "T"].join(""), fullPath + "/" + path, true);
	                }
	                xhr.send();
	              }
	              return {
	                load: loadAsset
	              };
	            }();
	          }
	          if (e.data.type === "loadAnimation") {
	            _workerSelf.assetLoader.load(e.data.path, e.data.fullPath, function(data2) {
	              _workerSelf.dataManager.completeData(data2);
	              _workerSelf.postMessage({
	                id: e.data.id,
	                payload: data2,
	                status: "success"
	              });
	            }, function() {
	              _workerSelf.postMessage({
	                id: e.data.id,
	                status: "error"
	              });
	            });
	          } else if (e.data.type === "complete") {
	            var animation = e.data.animation;
	            _workerSelf.dataManager.completeData(animation);
	            _workerSelf.postMessage({
	              id: e.data.id,
	              payload: animation,
	              status: "success"
	            });
	          } else if (e.data.type === "loadData") {
	            _workerSelf.assetLoader.load(e.data.path, e.data.fullPath, function(data2) {
	              _workerSelf.postMessage({
	                id: e.data.id,
	                payload: data2,
	                status: "success"
	              });
	            }, function() {
	              _workerSelf.postMessage({
	                id: e.data.id,
	                status: "error"
	              });
	            });
	          }
	        });
	        workerInstance.onmessage = function(event) {
	          var data2 = event.data;
	          var id = data2.id;
	          var process = processes[id];
	          processes[id] = null;
	          if (data2.status === "success") {
	            process.onComplete(data2.payload);
	          } else if (process.onError) {
	            process.onError();
	          }
	        };
	      }
	    }
	    function createProcess(onComplete, onError) {
	      _counterId += 1;
	      var id = "processId_" + _counterId;
	      processes[id] = {
	        onComplete,
	        onError
	      };
	      return id;
	    }
	    function loadAnimation2(path, onComplete, onError) {
	      setupWorker();
	      var processId = createProcess(onComplete, onError);
	      workerInstance.postMessage({
	        type: "loadAnimation",
	        path,
	        fullPath: window.location.origin + window.location.pathname,
	        id: processId
	      });
	    }
	    function loadData(path, onComplete, onError) {
	      setupWorker();
	      var processId = createProcess(onComplete, onError);
	      workerInstance.postMessage({
	        type: "loadData",
	        path,
	        fullPath: window.location.origin + window.location.pathname,
	        id: processId
	      });
	    }
	    function completeAnimation(anim, onComplete, onError) {
	      setupWorker();
	      var processId = createProcess(onComplete, onError);
	      workerInstance.postMessage({
	        type: "complete",
	        animation: anim,
	        id: processId
	      });
	    }
	    return {
	      loadAnimation: loadAnimation2,
	      loadData,
	      completeAnimation
	    };
	  }();
	  var ImagePreloader = function() {
	    var proxyImage = function() {
	      var canvas = createTag("canvas");
	      canvas.width = 1;
	      canvas.height = 1;
	      var ctx = canvas.getContext("2d");
	      ctx.fillStyle = "rgba(0,0,0,0)";
	      ctx.fillRect(0, 0, 1, 1);
	      return canvas;
	    }();
	    function imageLoaded() {
	      this.loadedAssets += 1;
	      if (this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages) {
	        if (this.imagesLoadedCb) {
	          this.imagesLoadedCb(null);
	        }
	      }
	    }
	    function footageLoaded() {
	      this.loadedFootagesCount += 1;
	      if (this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages) {
	        if (this.imagesLoadedCb) {
	          this.imagesLoadedCb(null);
	        }
	      }
	    }
	    function getAssetsPath(assetData, assetsPath, originalPath) {
	      var path = "";
	      if (assetData.e) {
	        path = assetData.p;
	      } else if (assetsPath) {
	        var imagePath = assetData.p;
	        if (imagePath.indexOf("images/") !== -1) {
	          imagePath = imagePath.split("/")[1];
	        }
	        path = assetsPath + imagePath;
	      } else {
	        path = originalPath;
	        path += assetData.u ? assetData.u : "";
	        path += assetData.p;
	      }
	      return path;
	    }
	    function testImageLoaded(img) {
	      var _count = 0;
	      var intervalId = setInterval(function() {
	        var box = img.getBBox();
	        if (box.width || _count > 500) {
	          this._imageLoaded();
	          clearInterval(intervalId);
	        }
	        _count += 1;
	      }.bind(this), 50);
	    }
	    function createImageData(assetData) {
	      var path = getAssetsPath(assetData, this.assetsPath, this.path);
	      var img = createNS("image");
	      if (isSafari) {
	        this.testImageLoaded(img);
	      } else {
	        img.addEventListener("load", this._imageLoaded, false);
	      }
	      img.addEventListener("error", function() {
	        ob2.img = proxyImage;
	        this._imageLoaded();
	      }.bind(this), false);
	      img.setAttributeNS("http://www.w3.org/1999/xlink", "href", path);
	      if (this._elementHelper.append) {
	        this._elementHelper.append(img);
	      } else {
	        this._elementHelper.appendChild(img);
	      }
	      var ob2 = {
	        img,
	        assetData
	      };
	      return ob2;
	    }
	    function createImgData(assetData) {
	      var path = getAssetsPath(assetData, this.assetsPath, this.path);
	      var img = createTag("img");
	      img.crossOrigin = "anonymous";
	      img.addEventListener("load", this._imageLoaded, false);
	      img.addEventListener("error", function() {
	        ob2.img = proxyImage;
	        this._imageLoaded();
	      }.bind(this), false);
	      img.src = path;
	      var ob2 = {
	        img,
	        assetData
	      };
	      return ob2;
	    }
	    function createFootageData(data2) {
	      var ob2 = {
	        assetData: data2
	      };
	      var path = getAssetsPath(data2, this.assetsPath, this.path);
	      dataManager.loadData(path, function(footageData) {
	        ob2.img = footageData;
	        this._footageLoaded();
	      }.bind(this), function() {
	        ob2.img = {};
	        this._footageLoaded();
	      }.bind(this));
	      return ob2;
	    }
	    function loadAssets(assets, cb) {
	      this.imagesLoadedCb = cb;
	      var i;
	      var len = assets.length;
	      for (i = 0; i < len; i += 1) {
	        if (!assets[i].layers) {
	          if (!assets[i].t || assets[i].t === "seq") {
	            this.totalImages += 1;
	            this.images.push(this._createImageData(assets[i]));
	          } else if (assets[i].t === 3) {
	            this.totalFootages += 1;
	            this.images.push(this.createFootageData(assets[i]));
	          }
	        }
	      }
	    }
	    function setPath(path) {
	      this.path = path || "";
	    }
	    function setAssetsPath(path) {
	      this.assetsPath = path || "";
	    }
	    function getAsset(assetData) {
	      var i = 0;
	      var len = this.images.length;
	      while (i < len) {
	        if (this.images[i].assetData === assetData) {
	          return this.images[i].img;
	        }
	        i += 1;
	      }
	      return null;
	    }
	    function destroy() {
	      this.imagesLoadedCb = null;
	      this.images.length = 0;
	    }
	    function loadedImages() {
	      return this.totalImages === this.loadedAssets;
	    }
	    function loadedFootages() {
	      return this.totalFootages === this.loadedFootagesCount;
	    }
	    function setCacheType(type, elementHelper) {
	      if (type === "svg") {
	        this._elementHelper = elementHelper;
	        this._createImageData = this.createImageData.bind(this);
	      } else {
	        this._createImageData = this.createImgData.bind(this);
	      }
	    }
	    function ImagePreloaderFactory() {
	      this._imageLoaded = imageLoaded.bind(this);
	      this._footageLoaded = footageLoaded.bind(this);
	      this.testImageLoaded = testImageLoaded.bind(this);
	      this.createFootageData = createFootageData.bind(this);
	      this.assetsPath = "";
	      this.path = "";
	      this.totalImages = 0;
	      this.totalFootages = 0;
	      this.loadedAssets = 0;
	      this.loadedFootagesCount = 0;
	      this.imagesLoadedCb = null;
	      this.images = [];
	    }
	    ImagePreloaderFactory.prototype = {
	      loadAssets,
	      setAssetsPath,
	      setPath,
	      loadedImages,
	      loadedFootages,
	      destroy,
	      getAsset,
	      createImgData,
	      createImageData,
	      imageLoaded,
	      footageLoaded,
	      setCacheType
	    };
	    return ImagePreloaderFactory;
	  }();
	  function BaseEvent() {
	  }
	  BaseEvent.prototype = {
	    triggerEvent: function triggerEvent(eventName, args) {
	      if (this._cbs[eventName]) {
	        var callbacks = this._cbs[eventName];
	        for (var i = 0; i < callbacks.length; i += 1) {
	          callbacks[i](args);
	        }
	      }
	    },
	    addEventListener: function addEventListener(eventName, callback) {
	      if (!this._cbs[eventName]) {
	        this._cbs[eventName] = [];
	      }
	      this._cbs[eventName].push(callback);
	      return function() {
	        this.removeEventListener(eventName, callback);
	      }.bind(this);
	    },
	    removeEventListener: function removeEventListener(eventName, callback) {
	      if (!callback) {
	        this._cbs[eventName] = null;
	      } else if (this._cbs[eventName]) {
	        var i = 0;
	        var len = this._cbs[eventName].length;
	        while (i < len) {
	          if (this._cbs[eventName][i] === callback) {
	            this._cbs[eventName].splice(i, 1);
	            i -= 1;
	            len -= 1;
	          }
	          i += 1;
	        }
	        if (!this._cbs[eventName].length) {
	          this._cbs[eventName] = null;
	        }
	      }
	    }
	  };
	  var markerParser = /* @__PURE__ */ function() {
	    function parsePayloadLines(payload) {
	      var lines = payload.split("\r\n");
	      var keys = {};
	      var line;
	      var keysCount = 0;
	      for (var i = 0; i < lines.length; i += 1) {
	        line = lines[i].split(":");
	        if (line.length === 2) {
	          keys[line[0]] = line[1].trim();
	          keysCount += 1;
	        }
	      }
	      if (keysCount === 0) {
	        throw new Error();
	      }
	      return keys;
	    }
	    return function(_markers) {
	      var markers = [];
	      for (var i = 0; i < _markers.length; i += 1) {
	        var _marker = _markers[i];
	        var markerData = {
	          time: _marker.tm,
	          duration: _marker.dr
	        };
	        try {
	          markerData.payload = JSON.parse(_markers[i].cm);
	        } catch (_) {
	          try {
	            markerData.payload = parsePayloadLines(_markers[i].cm);
	          } catch (__) {
	            markerData.payload = {
	              name: _markers[i].cm
	            };
	          }
	        }
	        markers.push(markerData);
	      }
	      return markers;
	    };
	  }();
	  var ProjectInterface = /* @__PURE__ */ function() {
	    function registerComposition(comp2) {
	      this.compositions.push(comp2);
	    }
	    return function() {
	      function _thisProjectFunction(name2) {
	        var i = 0;
	        var len = this.compositions.length;
	        while (i < len) {
	          if (this.compositions[i].data && this.compositions[i].data.nm === name2) {
	            if (this.compositions[i].prepareFrame && this.compositions[i].data.xt) {
	              this.compositions[i].prepareFrame(this.currentFrame);
	            }
	            return this.compositions[i].compInterface;
	          }
	          i += 1;
	        }
	        return null;
	      }
	      _thisProjectFunction.compositions = [];
	      _thisProjectFunction.currentFrame = 0;
	      _thisProjectFunction.registerComposition = registerComposition;
	      return _thisProjectFunction;
	    };
	  }();
	  var renderers = {};
	  var registerRenderer = function registerRenderer2(key2, value2) {
	    renderers[key2] = value2;
	  };
	  function getRenderer(key2) {
	    return renderers[key2];
	  }
	  function getRegisteredRenderer() {
	    if (renderers.canvas) {
	      return "canvas";
	    }
	    for (var key2 in renderers) {
	      if (renderers[key2]) {
	        return key2;
	      }
	    }
	    return "";
	  }
	  function _typeof$4(o) {
	    "@babel/helpers - typeof";
	    return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof$4(o);
	  }
	  var AnimationItem = function AnimationItem2() {
	    this._cbs = [];
	    this.name = "";
	    this.path = "";
	    this.isLoaded = false;
	    this.currentFrame = 0;
	    this.currentRawFrame = 0;
	    this.firstFrame = 0;
	    this.totalFrames = 0;
	    this.frameRate = 0;
	    this.frameMult = 0;
	    this.playSpeed = 1;
	    this.playDirection = 1;
	    this.playCount = 0;
	    this.animationData = {};
	    this.assets = [];
	    this.isPaused = true;
	    this.autoplay = false;
	    this.loop = true;
	    this.renderer = null;
	    this.animationID = createElementID();
	    this.assetsPath = "";
	    this.timeCompleted = 0;
	    this.segmentPos = 0;
	    this.isSubframeEnabled = getSubframeEnabled();
	    this.segments = [];
	    this._idle = true;
	    this._completedLoop = false;
	    this.projectInterface = ProjectInterface();
	    this.imagePreloader = new ImagePreloader();
	    this.audioController = audioControllerFactory();
	    this.markers = [];
	    this.configAnimation = this.configAnimation.bind(this);
	    this.onSetupError = this.onSetupError.bind(this);
	    this.onSegmentComplete = this.onSegmentComplete.bind(this);
	    this.drawnFrameEvent = new BMEnterFrameEvent("drawnFrame", 0, 0, 0);
	    this.expressionsPlugin = getExpressionsPlugin();
	  };
	  extendPrototype([BaseEvent], AnimationItem);
	  AnimationItem.prototype.setParams = function(params) {
	    if (params.wrapper || params.container) {
	      this.wrapper = params.wrapper || params.container;
	    }
	    var animType = "svg";
	    if (params.animType) {
	      animType = params.animType;
	    } else if (params.renderer) {
	      animType = params.renderer;
	    }
	    var RendererClass = getRenderer(animType);
	    this.renderer = new RendererClass(this, params.rendererSettings);
	    this.imagePreloader.setCacheType(animType, this.renderer.globalData.defs);
	    this.renderer.setProjectInterface(this.projectInterface);
	    this.animType = animType;
	    if (params.loop === "" || params.loop === null || params.loop === void 0 || params.loop === true) {
	      this.loop = true;
	    } else if (params.loop === false) {
	      this.loop = false;
	    } else {
	      this.loop = parseInt(params.loop, 10);
	    }
	    this.autoplay = "autoplay" in params ? params.autoplay : true;
	    this.name = params.name ? params.name : "";
	    this.autoloadSegments = Object.prototype.hasOwnProperty.call(params, "autoloadSegments") ? params.autoloadSegments : true;
	    this.assetsPath = params.assetsPath;
	    this.initialSegment = params.initialSegment;
	    if (params.audioFactory) {
	      this.audioController.setAudioFactory(params.audioFactory);
	    }
	    if (params.animationData) {
	      this.setupAnimation(params.animationData);
	    } else if (params.path) {
	      if (params.path.lastIndexOf("\\") !== -1) {
	        this.path = params.path.substr(0, params.path.lastIndexOf("\\") + 1);
	      } else {
	        this.path = params.path.substr(0, params.path.lastIndexOf("/") + 1);
	      }
	      this.fileName = params.path.substr(params.path.lastIndexOf("/") + 1);
	      this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf(".json"));
	      dataManager.loadAnimation(params.path, this.configAnimation, this.onSetupError);
	    }
	  };
	  AnimationItem.prototype.onSetupError = function() {
	    this.trigger("data_failed");
	  };
	  AnimationItem.prototype.setupAnimation = function(data2) {
	    dataManager.completeAnimation(data2, this.configAnimation);
	  };
	  AnimationItem.prototype.setData = function(wrapper, animationData2) {
	    if (animationData2) {
	      if (_typeof$4(animationData2) !== "object") {
	        animationData2 = JSON.parse(animationData2);
	      }
	    }
	    var params = {
	      wrapper,
	      animationData: animationData2
	    };
	    var wrapperAttributes = wrapper.attributes;
	    params.path = wrapperAttributes.getNamedItem("data-animation-path") ? wrapperAttributes.getNamedItem("data-animation-path").value : wrapperAttributes.getNamedItem("data-bm-path") ? wrapperAttributes.getNamedItem("data-bm-path").value : wrapperAttributes.getNamedItem("bm-path") ? wrapperAttributes.getNamedItem("bm-path").value : "";
	    params.animType = wrapperAttributes.getNamedItem("data-anim-type") ? wrapperAttributes.getNamedItem("data-anim-type").value : wrapperAttributes.getNamedItem("data-bm-type") ? wrapperAttributes.getNamedItem("data-bm-type").value : wrapperAttributes.getNamedItem("bm-type") ? wrapperAttributes.getNamedItem("bm-type").value : wrapperAttributes.getNamedItem("data-bm-renderer") ? wrapperAttributes.getNamedItem("data-bm-renderer").value : wrapperAttributes.getNamedItem("bm-renderer") ? wrapperAttributes.getNamedItem("bm-renderer").value : getRegisteredRenderer() || "canvas";
	    var loop = wrapperAttributes.getNamedItem("data-anim-loop") ? wrapperAttributes.getNamedItem("data-anim-loop").value : wrapperAttributes.getNamedItem("data-bm-loop") ? wrapperAttributes.getNamedItem("data-bm-loop").value : wrapperAttributes.getNamedItem("bm-loop") ? wrapperAttributes.getNamedItem("bm-loop").value : "";
	    if (loop === "false") {
	      params.loop = false;
	    } else if (loop === "true") {
	      params.loop = true;
	    } else if (loop !== "") {
	      params.loop = parseInt(loop, 10);
	    }
	    var autoplay = wrapperAttributes.getNamedItem("data-anim-autoplay") ? wrapperAttributes.getNamedItem("data-anim-autoplay").value : wrapperAttributes.getNamedItem("data-bm-autoplay") ? wrapperAttributes.getNamedItem("data-bm-autoplay").value : wrapperAttributes.getNamedItem("bm-autoplay") ? wrapperAttributes.getNamedItem("bm-autoplay").value : true;
	    params.autoplay = autoplay !== "false";
	    params.name = wrapperAttributes.getNamedItem("data-name") ? wrapperAttributes.getNamedItem("data-name").value : wrapperAttributes.getNamedItem("data-bm-name") ? wrapperAttributes.getNamedItem("data-bm-name").value : wrapperAttributes.getNamedItem("bm-name") ? wrapperAttributes.getNamedItem("bm-name").value : "";
	    var prerender = wrapperAttributes.getNamedItem("data-anim-prerender") ? wrapperAttributes.getNamedItem("data-anim-prerender").value : wrapperAttributes.getNamedItem("data-bm-prerender") ? wrapperAttributes.getNamedItem("data-bm-prerender").value : wrapperAttributes.getNamedItem("bm-prerender") ? wrapperAttributes.getNamedItem("bm-prerender").value : "";
	    if (prerender === "false") {
	      params.prerender = false;
	    }
	    if (!params.path) {
	      this.trigger("destroy");
	    } else {
	      this.setParams(params);
	    }
	  };
	  AnimationItem.prototype.includeLayers = function(data2) {
	    if (data2.op > this.animationData.op) {
	      this.animationData.op = data2.op;
	      this.totalFrames = Math.floor(data2.op - this.animationData.ip);
	    }
	    var layers = this.animationData.layers;
	    var i;
	    var len = layers.length;
	    var newLayers = data2.layers;
	    var j;
	    var jLen = newLayers.length;
	    for (j = 0; j < jLen; j += 1) {
	      i = 0;
	      while (i < len) {
	        if (layers[i].id === newLayers[j].id) {
	          layers[i] = newLayers[j];
	          break;
	        }
	        i += 1;
	      }
	    }
	    if (data2.chars || data2.fonts) {
	      this.renderer.globalData.fontManager.addChars(data2.chars);
	      this.renderer.globalData.fontManager.addFonts(data2.fonts, this.renderer.globalData.defs);
	    }
	    if (data2.assets) {
	      len = data2.assets.length;
	      for (i = 0; i < len; i += 1) {
	        this.animationData.assets.push(data2.assets[i]);
	      }
	    }
	    this.animationData.__complete = false;
	    dataManager.completeAnimation(this.animationData, this.onSegmentComplete);
	  };
	  AnimationItem.prototype.onSegmentComplete = function(data2) {
	    this.animationData = data2;
	    var expressionsPlugin2 = getExpressionsPlugin();
	    if (expressionsPlugin2) {
	      expressionsPlugin2.initExpressions(this);
	    }
	    this.loadNextSegment();
	  };
	  AnimationItem.prototype.loadNextSegment = function() {
	    var segments = this.animationData.segments;
	    if (!segments || segments.length === 0 || !this.autoloadSegments) {
	      this.trigger("data_ready");
	      this.timeCompleted = this.totalFrames;
	      return;
	    }
	    var segment = segments.shift();
	    this.timeCompleted = segment.time * this.frameRate;
	    var segmentPath = this.path + this.fileName + "_" + this.segmentPos + ".json";
	    this.segmentPos += 1;
	    dataManager.loadData(segmentPath, this.includeLayers.bind(this), function() {
	      this.trigger("data_failed");
	    }.bind(this));
	  };
	  AnimationItem.prototype.loadSegments = function() {
	    var segments = this.animationData.segments;
	    if (!segments) {
	      this.timeCompleted = this.totalFrames;
	    }
	    this.loadNextSegment();
	  };
	  AnimationItem.prototype.imagesLoaded = function() {
	    this.trigger("loaded_images");
	    this.checkLoaded();
	  };
	  AnimationItem.prototype.preloadImages = function() {
	    this.imagePreloader.setAssetsPath(this.assetsPath);
	    this.imagePreloader.setPath(this.path);
	    this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
	  };
	  AnimationItem.prototype.configAnimation = function(animData) {
	    if (!this.renderer) {
	      return;
	    }
	    try {
	      this.animationData = animData;
	      if (this.initialSegment) {
	        this.totalFrames = Math.floor(this.initialSegment[1] - this.initialSegment[0]);
	        this.firstFrame = Math.round(this.initialSegment[0]);
	      } else {
	        this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
	        this.firstFrame = Math.round(this.animationData.ip);
	      }
	      this.renderer.configAnimation(animData);
	      if (!animData.assets) {
	        animData.assets = [];
	      }
	      this.assets = this.animationData.assets;
	      this.frameRate = this.animationData.fr;
	      this.frameMult = this.animationData.fr / 1e3;
	      this.renderer.searchExtraCompositions(animData.assets);
	      this.markers = markerParser(animData.markers || []);
	      this.trigger("config_ready");
	      this.preloadImages();
	      this.loadSegments();
	      this.updaFrameModifier();
	      this.waitForFontsLoaded();
	      if (this.isPaused) {
	        this.audioController.pause();
	      }
	    } catch (error) {
	      this.triggerConfigError(error);
	    }
	  };
	  AnimationItem.prototype.waitForFontsLoaded = function() {
	    if (!this.renderer) {
	      return;
	    }
	    if (this.renderer.globalData.fontManager.isLoaded) {
	      this.checkLoaded();
	    } else {
	      setTimeout(this.waitForFontsLoaded.bind(this), 20);
	    }
	  };
	  AnimationItem.prototype.checkLoaded = function() {
	    if (!this.isLoaded && this.renderer.globalData.fontManager.isLoaded && (this.imagePreloader.loadedImages() || this.renderer.rendererType !== "canvas") && this.imagePreloader.loadedFootages()) {
	      this.isLoaded = true;
	      var expressionsPlugin2 = getExpressionsPlugin();
	      if (expressionsPlugin2) {
	        expressionsPlugin2.initExpressions(this);
	      }
	      this.renderer.initItems();
	      setTimeout(function() {
	        this.trigger("DOMLoaded");
	      }.bind(this), 0);
	      this.gotoFrame();
	      if (this.autoplay) {
	        this.play();
	      }
	    }
	  };
	  AnimationItem.prototype.resize = function(width2, height2) {
	    var _width = typeof width2 === "number" ? width2 : void 0;
	    var _height = typeof height2 === "number" ? height2 : void 0;
	    this.renderer.updateContainerSize(_width, _height);
	  };
	  AnimationItem.prototype.setSubframe = function(flag) {
	    this.isSubframeEnabled = !!flag;
	  };
	  AnimationItem.prototype.gotoFrame = function() {
	    this.currentFrame = this.isSubframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame;
	    if (this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted) {
	      this.currentFrame = this.timeCompleted;
	    }
	    this.trigger("enterFrame");
	    this.renderFrame();
	    this.trigger("drawnFrame");
	  };
	  AnimationItem.prototype.renderFrame = function() {
	    if (this.isLoaded === false || !this.renderer) {
	      return;
	    }
	    try {
	      if (this.expressionsPlugin) {
	        this.expressionsPlugin.resetFrame();
	      }
	      this.renderer.renderFrame(this.currentFrame + this.firstFrame);
	    } catch (error) {
	      this.triggerRenderFrameError(error);
	    }
	  };
	  AnimationItem.prototype.play = function(name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    if (this.isPaused === true) {
	      this.isPaused = false;
	      this.trigger("_play");
	      this.audioController.resume();
	      if (this._idle) {
	        this._idle = false;
	        this.trigger("_active");
	      }
	    }
	  };
	  AnimationItem.prototype.pause = function(name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    if (this.isPaused === false) {
	      this.isPaused = true;
	      this.trigger("_pause");
	      this._idle = true;
	      this.trigger("_idle");
	      this.audioController.pause();
	    }
	  };
	  AnimationItem.prototype.togglePause = function(name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    if (this.isPaused === true) {
	      this.play();
	    } else {
	      this.pause();
	    }
	  };
	  AnimationItem.prototype.stop = function(name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    this.pause();
	    this.playCount = 0;
	    this._completedLoop = false;
	    this.setCurrentRawFrameValue(0);
	  };
	  AnimationItem.prototype.getMarkerData = function(markerName) {
	    var marker;
	    for (var i = 0; i < this.markers.length; i += 1) {
	      marker = this.markers[i];
	      if (marker.payload && marker.payload.name === markerName) {
	        return marker;
	      }
	    }
	    return null;
	  };
	  AnimationItem.prototype.goToAndStop = function(value2, isFrame, name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    var numValue = Number(value2);
	    if (isNaN(numValue)) {
	      var marker = this.getMarkerData(value2);
	      if (marker) {
	        this.goToAndStop(marker.time, true);
	      }
	    } else if (isFrame) {
	      this.setCurrentRawFrameValue(value2);
	    } else {
	      this.setCurrentRawFrameValue(value2 * this.frameModifier);
	    }
	    this.pause();
	  };
	  AnimationItem.prototype.goToAndPlay = function(value2, isFrame, name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    var numValue = Number(value2);
	    if (isNaN(numValue)) {
	      var marker = this.getMarkerData(value2);
	      if (marker) {
	        if (!marker.duration) {
	          this.goToAndStop(marker.time, true);
	        } else {
	          this.playSegments([marker.time, marker.time + marker.duration], true);
	        }
	      }
	    } else {
	      this.goToAndStop(numValue, isFrame, name2);
	    }
	    this.play();
	  };
	  AnimationItem.prototype.advanceTime = function(value2) {
	    if (this.isPaused === true || this.isLoaded === false) {
	      return;
	    }
	    var nextValue = this.currentRawFrame + value2 * this.frameModifier;
	    var _isComplete = false;
	    if (nextValue >= this.totalFrames - 1 && this.frameModifier > 0) {
	      if (!this.loop || this.playCount === this.loop) {
	        if (!this.checkSegments(nextValue > this.totalFrames ? nextValue % this.totalFrames : 0)) {
	          _isComplete = true;
	          nextValue = this.totalFrames - 1;
	        }
	      } else if (nextValue >= this.totalFrames) {
	        this.playCount += 1;
	        if (!this.checkSegments(nextValue % this.totalFrames)) {
	          this.setCurrentRawFrameValue(nextValue % this.totalFrames);
	          this._completedLoop = true;
	          this.trigger("loopComplete");
	        }
	      } else {
	        this.setCurrentRawFrameValue(nextValue);
	      }
	    } else if (nextValue < 0) {
	      if (!this.checkSegments(nextValue % this.totalFrames)) {
	        if (this.loop && !(this.playCount-- <= 0 && this.loop !== true)) {
	          this.setCurrentRawFrameValue(this.totalFrames + nextValue % this.totalFrames);
	          if (!this._completedLoop) {
	            this._completedLoop = true;
	          } else {
	            this.trigger("loopComplete");
	          }
	        } else {
	          _isComplete = true;
	          nextValue = 0;
	        }
	      }
	    } else {
	      this.setCurrentRawFrameValue(nextValue);
	    }
	    if (_isComplete) {
	      this.setCurrentRawFrameValue(nextValue);
	      this.pause();
	      this.trigger("complete");
	    }
	  };
	  AnimationItem.prototype.adjustSegment = function(arr, offset) {
	    this.playCount = 0;
	    if (arr[1] < arr[0]) {
	      if (this.frameModifier > 0) {
	        if (this.playSpeed < 0) {
	          this.setSpeed(-this.playSpeed);
	        } else {
	          this.setDirection(-1);
	        }
	      }
	      this.totalFrames = arr[0] - arr[1];
	      this.timeCompleted = this.totalFrames;
	      this.firstFrame = arr[1];
	      this.setCurrentRawFrameValue(this.totalFrames - 1e-3 - offset);
	    } else if (arr[1] > arr[0]) {
	      if (this.frameModifier < 0) {
	        if (this.playSpeed < 0) {
	          this.setSpeed(-this.playSpeed);
	        } else {
	          this.setDirection(1);
	        }
	      }
	      this.totalFrames = arr[1] - arr[0];
	      this.timeCompleted = this.totalFrames;
	      this.firstFrame = arr[0];
	      this.setCurrentRawFrameValue(1e-3 + offset);
	    }
	    this.trigger("segmentStart");
	  };
	  AnimationItem.prototype.setSegment = function(init, end) {
	    var pendingFrame = -1;
	    if (this.isPaused) {
	      if (this.currentRawFrame + this.firstFrame < init) {
	        pendingFrame = init;
	      } else if (this.currentRawFrame + this.firstFrame > end) {
	        pendingFrame = end - init;
	      }
	    }
	    this.firstFrame = init;
	    this.totalFrames = end - init;
	    this.timeCompleted = this.totalFrames;
	    if (pendingFrame !== -1) {
	      this.goToAndStop(pendingFrame, true);
	    }
	  };
	  AnimationItem.prototype.playSegments = function(arr, forceFlag) {
	    if (forceFlag) {
	      this.segments.length = 0;
	    }
	    if (_typeof$4(arr[0]) === "object") {
	      var i;
	      var len = arr.length;
	      for (i = 0; i < len; i += 1) {
	        this.segments.push(arr[i]);
	      }
	    } else {
	      this.segments.push(arr);
	    }
	    if (this.segments.length && forceFlag) {
	      this.adjustSegment(this.segments.shift(), 0);
	    }
	    if (this.isPaused) {
	      this.play();
	    }
	  };
	  AnimationItem.prototype.resetSegments = function(forceFlag) {
	    this.segments.length = 0;
	    this.segments.push([this.animationData.ip, this.animationData.op]);
	    if (forceFlag) {
	      this.checkSegments(0);
	    }
	  };
	  AnimationItem.prototype.checkSegments = function(offset) {
	    if (this.segments.length) {
	      this.adjustSegment(this.segments.shift(), offset);
	      return true;
	    }
	    return false;
	  };
	  AnimationItem.prototype.destroy = function(name2) {
	    if (name2 && this.name !== name2 || !this.renderer) {
	      return;
	    }
	    this.renderer.destroy();
	    this.imagePreloader.destroy();
	    this.trigger("destroy");
	    this._cbs = null;
	    this.onEnterFrame = null;
	    this.onLoopComplete = null;
	    this.onComplete = null;
	    this.onSegmentStart = null;
	    this.onDestroy = null;
	    this.renderer = null;
	    this.expressionsPlugin = null;
	    this.imagePreloader = null;
	    this.projectInterface = null;
	  };
	  AnimationItem.prototype.setCurrentRawFrameValue = function(value2) {
	    this.currentRawFrame = value2;
	    this.gotoFrame();
	  };
	  AnimationItem.prototype.setSpeed = function(val2) {
	    this.playSpeed = val2;
	    this.updaFrameModifier();
	  };
	  AnimationItem.prototype.setDirection = function(val2) {
	    this.playDirection = val2 < 0 ? -1 : 1;
	    this.updaFrameModifier();
	  };
	  AnimationItem.prototype.setLoop = function(isLooping) {
	    this.loop = isLooping;
	  };
	  AnimationItem.prototype.setVolume = function(val2, name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    this.audioController.setVolume(val2);
	  };
	  AnimationItem.prototype.getVolume = function() {
	    return this.audioController.getVolume();
	  };
	  AnimationItem.prototype.mute = function(name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    this.audioController.mute();
	  };
	  AnimationItem.prototype.unmute = function(name2) {
	    if (name2 && this.name !== name2) {
	      return;
	    }
	    this.audioController.unmute();
	  };
	  AnimationItem.prototype.updaFrameModifier = function() {
	    this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
	    this.audioController.setRate(this.playSpeed * this.playDirection);
	  };
	  AnimationItem.prototype.getPath = function() {
	    return this.path;
	  };
	  AnimationItem.prototype.getAssetsPath = function(assetData) {
	    var path = "";
	    if (assetData.e) {
	      path = assetData.p;
	    } else if (this.assetsPath) {
	      var imagePath = assetData.p;
	      if (imagePath.indexOf("images/") !== -1) {
	        imagePath = imagePath.split("/")[1];
	      }
	      path = this.assetsPath + imagePath;
	    } else {
	      path = this.path;
	      path += assetData.u ? assetData.u : "";
	      path += assetData.p;
	    }
	    return path;
	  };
	  AnimationItem.prototype.getAssetData = function(id) {
	    var i = 0;
	    var len = this.assets.length;
	    while (i < len) {
	      if (id === this.assets[i].id) {
	        return this.assets[i];
	      }
	      i += 1;
	    }
	    return null;
	  };
	  AnimationItem.prototype.hide = function() {
	    this.renderer.hide();
	  };
	  AnimationItem.prototype.show = function() {
	    this.renderer.show();
	  };
	  AnimationItem.prototype.getDuration = function(isFrame) {
	    return isFrame ? this.totalFrames : this.totalFrames / this.frameRate;
	  };
	  AnimationItem.prototype.updateDocumentData = function(path, documentData, index2) {
	    try {
	      var element = this.renderer.getElementByPath(path);
	      element.updateDocumentData(documentData, index2);
	    } catch (error) {
	    }
	  };
	  AnimationItem.prototype.trigger = function(name2) {
	    if (this._cbs && this._cbs[name2]) {
	      switch (name2) {
	        case "enterFrame":
	          this.triggerEvent(name2, new BMEnterFrameEvent(name2, this.currentFrame, this.totalFrames, this.frameModifier));
	          break;
	        case "drawnFrame":
	          this.drawnFrameEvent.currentTime = this.currentFrame;
	          this.drawnFrameEvent.totalTime = this.totalFrames;
	          this.drawnFrameEvent.direction = this.frameModifier;
	          this.triggerEvent(name2, this.drawnFrameEvent);
	          break;
	        case "loopComplete":
	          this.triggerEvent(name2, new BMCompleteLoopEvent(name2, this.loop, this.playCount, this.frameMult));
	          break;
	        case "complete":
	          this.triggerEvent(name2, new BMCompleteEvent(name2, this.frameMult));
	          break;
	        case "segmentStart":
	          this.triggerEvent(name2, new BMSegmentStartEvent(name2, this.firstFrame, this.totalFrames));
	          break;
	        case "destroy":
	          this.triggerEvent(name2, new BMDestroyEvent(name2, this));
	          break;
	        default:
	          this.triggerEvent(name2);
	      }
	    }
	    if (name2 === "enterFrame" && this.onEnterFrame) {
	      this.onEnterFrame.call(this, new BMEnterFrameEvent(name2, this.currentFrame, this.totalFrames, this.frameMult));
	    }
	    if (name2 === "loopComplete" && this.onLoopComplete) {
	      this.onLoopComplete.call(this, new BMCompleteLoopEvent(name2, this.loop, this.playCount, this.frameMult));
	    }
	    if (name2 === "complete" && this.onComplete) {
	      this.onComplete.call(this, new BMCompleteEvent(name2, this.frameMult));
	    }
	    if (name2 === "segmentStart" && this.onSegmentStart) {
	      this.onSegmentStart.call(this, new BMSegmentStartEvent(name2, this.firstFrame, this.totalFrames));
	    }
	    if (name2 === "destroy" && this.onDestroy) {
	      this.onDestroy.call(this, new BMDestroyEvent(name2, this));
	    }
	  };
	  AnimationItem.prototype.triggerRenderFrameError = function(nativeError) {
	    var error = new BMRenderFrameErrorEvent(nativeError, this.currentFrame);
	    this.triggerEvent("error", error);
	    if (this.onError) {
	      this.onError.call(this, error);
	    }
	  };
	  AnimationItem.prototype.triggerConfigError = function(nativeError) {
	    var error = new BMConfigErrorEvent(nativeError, this.currentFrame);
	    this.triggerEvent("error", error);
	    if (this.onError) {
	      this.onError.call(this, error);
	    }
	  };
	  var animationManager = function() {
	    var moduleOb = {};
	    var registeredAnimations = [];
	    var initTime = 0;
	    var len = 0;
	    var playingAnimationsNum = 0;
	    var _stopped = true;
	    var _isFrozen = false;
	    function removeElement(ev) {
	      var i = 0;
	      var animItem = ev.target;
	      while (i < len) {
	        if (registeredAnimations[i].animation === animItem) {
	          registeredAnimations.splice(i, 1);
	          i -= 1;
	          len -= 1;
	          if (!animItem.isPaused) {
	            subtractPlayingCount();
	          }
	        }
	        i += 1;
	      }
	    }
	    function registerAnimation(element, animationData2) {
	      if (!element) {
	        return null;
	      }
	      var i = 0;
	      while (i < len) {
	        if (registeredAnimations[i].elem === element && registeredAnimations[i].elem !== null) {
	          return registeredAnimations[i].animation;
	        }
	        i += 1;
	      }
	      var animItem = new AnimationItem();
	      setupAnimation(animItem, element);
	      animItem.setData(element, animationData2);
	      return animItem;
	    }
	    function getRegisteredAnimations() {
	      var i;
	      var lenAnims = registeredAnimations.length;
	      var animations = [];
	      for (i = 0; i < lenAnims; i += 1) {
	        animations.push(registeredAnimations[i].animation);
	      }
	      return animations;
	    }
	    function addPlayingCount() {
	      playingAnimationsNum += 1;
	      activate();
	    }
	    function subtractPlayingCount() {
	      playingAnimationsNum -= 1;
	    }
	    function setupAnimation(animItem, element) {
	      animItem.addEventListener("destroy", removeElement);
	      animItem.addEventListener("_active", addPlayingCount);
	      animItem.addEventListener("_idle", subtractPlayingCount);
	      registeredAnimations.push({
	        elem: element,
	        animation: animItem
	      });
	      len += 1;
	    }
	    function loadAnimation2(params) {
	      var animItem = new AnimationItem();
	      setupAnimation(animItem, null);
	      animItem.setParams(params);
	      return animItem;
	    }
	    function setSpeed(val2, animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.setSpeed(val2, animation);
	      }
	    }
	    function setDirection(val2, animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.setDirection(val2, animation);
	      }
	    }
	    function play(animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.play(animation);
	      }
	    }
	    function resume(nowTime) {
	      var elapsedTime = nowTime - initTime;
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.advanceTime(elapsedTime);
	      }
	      initTime = nowTime;
	      if (playingAnimationsNum && !_isFrozen) {
	        window.requestAnimationFrame(resume);
	      } else {
	        _stopped = true;
	      }
	    }
	    function first(nowTime) {
	      initTime = nowTime;
	      window.requestAnimationFrame(resume);
	    }
	    function pause(animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.pause(animation);
	      }
	    }
	    function goToAndStop(value2, isFrame, animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.goToAndStop(value2, isFrame, animation);
	      }
	    }
	    function stop(animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.stop(animation);
	      }
	    }
	    function togglePause(animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.togglePause(animation);
	      }
	    }
	    function destroy(animation) {
	      var i;
	      for (i = len - 1; i >= 0; i -= 1) {
	        registeredAnimations[i].animation.destroy(animation);
	      }
	    }
	    function searchAnimations2(animationData2, standalone2, renderer2) {
	      var animElements = [].concat([].slice.call(document.getElementsByClassName("lottie")), [].slice.call(document.getElementsByClassName("bodymovin")));
	      var i;
	      var lenAnims = animElements.length;
	      for (i = 0; i < lenAnims; i += 1) {
	        if (renderer2) {
	          animElements[i].setAttribute("data-bm-type", renderer2);
	        }
	        registerAnimation(animElements[i], animationData2);
	      }
	      if (standalone2 && lenAnims === 0) {
	        if (!renderer2) {
	          renderer2 = "svg";
	        }
	        var body = document.getElementsByTagName("body")[0];
	        body.innerText = "";
	        var div2 = createTag("div");
	        div2.style.width = "100%";
	        div2.style.height = "100%";
	        div2.setAttribute("data-bm-type", renderer2);
	        body.appendChild(div2);
	        registerAnimation(div2, animationData2);
	      }
	    }
	    function resize() {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.resize();
	      }
	    }
	    function activate() {
	      if (!_isFrozen && playingAnimationsNum) {
	        if (_stopped) {
	          window.requestAnimationFrame(first);
	          _stopped = false;
	        }
	      }
	    }
	    function freeze() {
	      _isFrozen = true;
	    }
	    function unfreeze() {
	      _isFrozen = false;
	      activate();
	    }
	    function setVolume(val2, animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.setVolume(val2, animation);
	      }
	    }
	    function mute(animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.mute(animation);
	      }
	    }
	    function unmute(animation) {
	      var i;
	      for (i = 0; i < len; i += 1) {
	        registeredAnimations[i].animation.unmute(animation);
	      }
	    }
	    moduleOb.registerAnimation = registerAnimation;
	    moduleOb.loadAnimation = loadAnimation2;
	    moduleOb.setSpeed = setSpeed;
	    moduleOb.setDirection = setDirection;
	    moduleOb.play = play;
	    moduleOb.pause = pause;
	    moduleOb.stop = stop;
	    moduleOb.togglePause = togglePause;
	    moduleOb.searchAnimations = searchAnimations2;
	    moduleOb.resize = resize;
	    moduleOb.goToAndStop = goToAndStop;
	    moduleOb.destroy = destroy;
	    moduleOb.freeze = freeze;
	    moduleOb.unfreeze = unfreeze;
	    moduleOb.setVolume = setVolume;
	    moduleOb.mute = mute;
	    moduleOb.unmute = unmute;
	    moduleOb.getRegisteredAnimations = getRegisteredAnimations;
	    return moduleOb;
	  }();
	  var BezierFactory = function() {
	    var ob2 = {};
	    ob2.getBezierEasing = getBezierEasing;
	    var beziers = {};
	    function getBezierEasing(a, b, c, d, nm) {
	      var str = nm || ("bez_" + a + "_" + b + "_" + c + "_" + d).replace(/\./g, "p");
	      if (beziers[str]) {
	        return beziers[str];
	      }
	      var bezEasing = new BezierEasing([a, b, c, d]);
	      beziers[str] = bezEasing;
	      return bezEasing;
	    }
	    var NEWTON_ITERATIONS = 4;
	    var NEWTON_MIN_SLOPE = 1e-3;
	    var SUBDIVISION_PRECISION = 1e-7;
	    var SUBDIVISION_MAX_ITERATIONS = 10;
	    var kSplineTableSize = 11;
	    var kSampleStepSize = 1 / (kSplineTableSize - 1);
	    var float32ArraySupported = typeof Float32Array === "function";
	    function A(aA1, aA2) {
	      return 1 - 3 * aA2 + 3 * aA1;
	    }
	    function B(aA1, aA2) {
	      return 3 * aA2 - 6 * aA1;
	    }
	    function C(aA1) {
	      return 3 * aA1;
	    }
	    function calcBezier(aT, aA1, aA2) {
	      return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
	    }
	    function getSlope(aT, aA1, aA2) {
	      return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
	    }
	    function binarySubdivide(aX, aA, aB, mX1, mX2) {
	      var currentX, currentT, i = 0;
	      do {
	        currentT = aA + (aB - aA) / 2;
	        currentX = calcBezier(currentT, mX1, mX2) - aX;
	        if (currentX > 0) {
	          aB = currentT;
	        } else {
	          aA = currentT;
	        }
	      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
	      return currentT;
	    }
	    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
	      for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
	        var currentSlope = getSlope(aGuessT, mX1, mX2);
	        if (currentSlope === 0) return aGuessT;
	        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
	        aGuessT -= currentX / currentSlope;
	      }
	      return aGuessT;
	    }
	    function BezierEasing(points) {
	      this._p = points;
	      this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
	      this._precomputed = false;
	      this.get = this.get.bind(this);
	    }
	    BezierEasing.prototype = {
	      get: function get(x) {
	        var mX1 = this._p[0], mY1 = this._p[1], mX2 = this._p[2], mY2 = this._p[3];
	        if (!this._precomputed) this._precompute();
	        if (mX1 === mY1 && mX2 === mY2) return x;
	        if (x === 0) return 0;
	        if (x === 1) return 1;
	        return calcBezier(this._getTForX(x), mY1, mY2);
	      },
	      // Private part
	      _precompute: function _precompute() {
	        var mX1 = this._p[0], mY1 = this._p[1], mX2 = this._p[2], mY2 = this._p[3];
	        this._precomputed = true;
	        if (mX1 !== mY1 || mX2 !== mY2) {
	          this._calcSampleValues();
	        }
	      },
	      _calcSampleValues: function _calcSampleValues() {
	        var mX1 = this._p[0], mX2 = this._p[2];
	        for (var i = 0; i < kSplineTableSize; ++i) {
	          this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
	        }
	      },
	      /**
	           * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
	           */
	      _getTForX: function _getTForX(aX) {
	        var mX1 = this._p[0], mX2 = this._p[2], mSampleValues = this._mSampleValues;
	        var intervalStart = 0;
	        var currentSample = 1;
	        var lastSample = kSplineTableSize - 1;
	        for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
	          intervalStart += kSampleStepSize;
	        }
	        --currentSample;
	        var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
	        var guessForT = intervalStart + dist * kSampleStepSize;
	        var initialSlope = getSlope(guessForT, mX1, mX2);
	        if (initialSlope >= NEWTON_MIN_SLOPE) {
	          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
	        }
	        if (initialSlope === 0) {
	          return guessForT;
	        }
	        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
	      }
	    };
	    return ob2;
	  }();
	  var pooling = /* @__PURE__ */ function() {
	    function _double(arr) {
	      return arr.concat(createSizedArray(arr.length));
	    }
	    return {
	      "double": _double
	    };
	  }();
	  var poolFactory = /* @__PURE__ */ function() {
	    return function(initialLength, _create, _release) {
	      var _length = 0;
	      var _maxLength = initialLength;
	      var pool = createSizedArray(_maxLength);
	      var ob2 = {
	        newElement,
	        release
	      };
	      function newElement() {
	        var element;
	        if (_length) {
	          _length -= 1;
	          element = pool[_length];
	        } else {
	          element = _create();
	        }
	        return element;
	      }
	      function release(element) {
	        if (_length === _maxLength) {
	          pool = pooling["double"](pool);
	          _maxLength *= 2;
	        }
	        if (_release) {
	          _release(element);
	        }
	        pool[_length] = element;
	        _length += 1;
	      }
	      return ob2;
	    };
	  }();
	  var bezierLengthPool = function() {
	    function create() {
	      return {
	        addedLength: 0,
	        percents: createTypedArray("float32", getDefaultCurveSegments()),
	        lengths: createTypedArray("float32", getDefaultCurveSegments())
	      };
	    }
	    return poolFactory(8, create);
	  }();
	  var segmentsLengthPool = function() {
	    function create() {
	      return {
	        lengths: [],
	        totalLength: 0
	      };
	    }
	    function release(element) {
	      var i;
	      var len = element.lengths.length;
	      for (i = 0; i < len; i += 1) {
	        bezierLengthPool.release(element.lengths[i]);
	      }
	      element.lengths.length = 0;
	    }
	    return poolFactory(8, create, release);
	  }();
	  function bezFunction() {
	    var math = Math;
	    function pointOnLine2D(x1, y1, x2, y2, x3, y3) {
	      var det1 = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
	      return det1 > -1e-3 && det1 < 1e-3;
	    }
	    function pointOnLine3D(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
	      if (z1 === 0 && z2 === 0 && z3 === 0) {
	        return pointOnLine2D(x1, y1, x2, y2, x3, y3);
	      }
	      var dist1 = math.sqrt(math.pow(x2 - x1, 2) + math.pow(y2 - y1, 2) + math.pow(z2 - z1, 2));
	      var dist2 = math.sqrt(math.pow(x3 - x1, 2) + math.pow(y3 - y1, 2) + math.pow(z3 - z1, 2));
	      var dist3 = math.sqrt(math.pow(x3 - x2, 2) + math.pow(y3 - y2, 2) + math.pow(z3 - z2, 2));
	      var diffDist;
	      if (dist1 > dist2) {
	        if (dist1 > dist3) {
	          diffDist = dist1 - dist2 - dist3;
	        } else {
	          diffDist = dist3 - dist2 - dist1;
	        }
	      } else if (dist3 > dist2) {
	        diffDist = dist3 - dist2 - dist1;
	      } else {
	        diffDist = dist2 - dist1 - dist3;
	      }
	      return diffDist > -1e-4 && diffDist < 1e-4;
	    }
	    var getBezierLength = /* @__PURE__ */ function() {
	      return function(pt1, pt2, pt3, pt4) {
	        var curveSegments = getDefaultCurveSegments();
	        var k;
	        var i;
	        var len;
	        var ptCoord;
	        var perc;
	        var addedLength = 0;
	        var ptDistance;
	        var point = [];
	        var lastPoint = [];
	        var lengthData = bezierLengthPool.newElement();
	        len = pt3.length;
	        for (k = 0; k < curveSegments; k += 1) {
	          perc = k / (curveSegments - 1);
	          ptDistance = 0;
	          for (i = 0; i < len; i += 1) {
	            ptCoord = bmPow(1 - perc, 3) * pt1[i] + 3 * bmPow(1 - perc, 2) * perc * pt3[i] + 3 * (1 - perc) * bmPow(perc, 2) * pt4[i] + bmPow(perc, 3) * pt2[i];
	            point[i] = ptCoord;
	            if (lastPoint[i] !== null) {
	              ptDistance += bmPow(point[i] - lastPoint[i], 2);
	            }
	            lastPoint[i] = point[i];
	          }
	          if (ptDistance) {
	            ptDistance = bmSqrt(ptDistance);
	            addedLength += ptDistance;
	          }
	          lengthData.percents[k] = perc;
	          lengthData.lengths[k] = addedLength;
	        }
	        lengthData.addedLength = addedLength;
	        return lengthData;
	      };
	    }();
	    function getSegmentsLength(shapeData) {
	      var segmentsLength = segmentsLengthPool.newElement();
	      var closed = shapeData.c;
	      var pathV = shapeData.v;
	      var pathO = shapeData.o;
	      var pathI = shapeData.i;
	      var i;
	      var len = shapeData._length;
	      var lengths = segmentsLength.lengths;
	      var totalLength = 0;
	      for (i = 0; i < len - 1; i += 1) {
	        lengths[i] = getBezierLength(pathV[i], pathV[i + 1], pathO[i], pathI[i + 1]);
	        totalLength += lengths[i].addedLength;
	      }
	      if (closed && len) {
	        lengths[i] = getBezierLength(pathV[i], pathV[0], pathO[i], pathI[0]);
	        totalLength += lengths[i].addedLength;
	      }
	      segmentsLength.totalLength = totalLength;
	      return segmentsLength;
	    }
	    function BezierData(length2) {
	      this.segmentLength = 0;
	      this.points = new Array(length2);
	    }
	    function PointData(partial, point) {
	      this.partialLength = partial;
	      this.point = point;
	    }
	    var buildBezierData = /* @__PURE__ */ function() {
	      var storedData = {};
	      return function(pt1, pt2, pt3, pt4) {
	        var bezierName = (pt1[0] + "_" + pt1[1] + "_" + pt2[0] + "_" + pt2[1] + "_" + pt3[0] + "_" + pt3[1] + "_" + pt4[0] + "_" + pt4[1]).replace(/\./g, "p");
	        if (!storedData[bezierName]) {
	          var curveSegments = getDefaultCurveSegments();
	          var k;
	          var i;
	          var len;
	          var ptCoord;
	          var perc;
	          var addedLength = 0;
	          var ptDistance;
	          var point;
	          var lastPoint = null;
	          if (pt1.length === 2 && (pt1[0] !== pt2[0] || pt1[1] !== pt2[1]) && pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt1[0] + pt3[0], pt1[1] + pt3[1]) && pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt2[0] + pt4[0], pt2[1] + pt4[1])) {
	            curveSegments = 2;
	          }
	          var bezierData = new BezierData(curveSegments);
	          len = pt3.length;
	          for (k = 0; k < curveSegments; k += 1) {
	            point = createSizedArray(len);
	            perc = k / (curveSegments - 1);
	            ptDistance = 0;
	            for (i = 0; i < len; i += 1) {
	              ptCoord = bmPow(1 - perc, 3) * pt1[i] + 3 * bmPow(1 - perc, 2) * perc * (pt1[i] + pt3[i]) + 3 * (1 - perc) * bmPow(perc, 2) * (pt2[i] + pt4[i]) + bmPow(perc, 3) * pt2[i];
	              point[i] = ptCoord;
	              if (lastPoint !== null) {
	                ptDistance += bmPow(point[i] - lastPoint[i], 2);
	              }
	            }
	            ptDistance = bmSqrt(ptDistance);
	            addedLength += ptDistance;
	            bezierData.points[k] = new PointData(ptDistance, point);
	            lastPoint = point;
	          }
	          bezierData.segmentLength = addedLength;
	          storedData[bezierName] = bezierData;
	        }
	        return storedData[bezierName];
	      };
	    }();
	    function getDistancePerc(perc, bezierData) {
	      var percents = bezierData.percents;
	      var lengths = bezierData.lengths;
	      var len = percents.length;
	      var initPos = bmFloor((len - 1) * perc);
	      var lengthPos = perc * bezierData.addedLength;
	      var lPerc = 0;
	      if (initPos === len - 1 || initPos === 0 || lengthPos === lengths[initPos]) {
	        return percents[initPos];
	      }
	      var dir = lengths[initPos] > lengthPos ? -1 : 1;
	      var flag = true;
	      while (flag) {
	        if (lengths[initPos] <= lengthPos && lengths[initPos + 1] > lengthPos) {
	          lPerc = (lengthPos - lengths[initPos]) / (lengths[initPos + 1] - lengths[initPos]);
	          flag = false;
	        } else {
	          initPos += dir;
	        }
	        if (initPos < 0 || initPos >= len - 1) {
	          if (initPos === len - 1) {
	            return percents[initPos];
	          }
	          flag = false;
	        }
	      }
	      return percents[initPos] + (percents[initPos + 1] - percents[initPos]) * lPerc;
	    }
	    function getPointInSegment(pt1, pt2, pt3, pt4, percent, bezierData) {
	      var t1 = getDistancePerc(percent, bezierData);
	      var u1 = 1 - t1;
	      var ptX = math.round((u1 * u1 * u1 * pt1[0] + (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[0] + (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[0] + t1 * t1 * t1 * pt2[0]) * 1e3) / 1e3;
	      var ptY = math.round((u1 * u1 * u1 * pt1[1] + (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[1] + (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[1] + t1 * t1 * t1 * pt2[1]) * 1e3) / 1e3;
	      return [ptX, ptY];
	    }
	    var bezierSegmentPoints = createTypedArray("float32", 8);
	    function getNewSegment(pt1, pt2, pt3, pt4, startPerc, endPerc, bezierData) {
	      if (startPerc < 0) {
	        startPerc = 0;
	      } else if (startPerc > 1) {
	        startPerc = 1;
	      }
	      var t0 = getDistancePerc(startPerc, bezierData);
	      endPerc = endPerc > 1 ? 1 : endPerc;
	      var t1 = getDistancePerc(endPerc, bezierData);
	      var i;
	      var len = pt1.length;
	      var u0 = 1 - t0;
	      var u1 = 1 - t1;
	      var u0u0u0 = u0 * u0 * u0;
	      var t0u0u0_3 = t0 * u0 * u0 * 3;
	      var t0t0u0_3 = t0 * t0 * u0 * 3;
	      var t0t0t0 = t0 * t0 * t0;
	      var u0u0u1 = u0 * u0 * u1;
	      var t0u0u1_3 = t0 * u0 * u1 + u0 * t0 * u1 + u0 * u0 * t1;
	      var t0t0u1_3 = t0 * t0 * u1 + u0 * t0 * t1 + t0 * u0 * t1;
	      var t0t0t1 = t0 * t0 * t1;
	      var u0u1u1 = u0 * u1 * u1;
	      var t0u1u1_3 = t0 * u1 * u1 + u0 * t1 * u1 + u0 * u1 * t1;
	      var t0t1u1_3 = t0 * t1 * u1 + u0 * t1 * t1 + t0 * u1 * t1;
	      var t0t1t1 = t0 * t1 * t1;
	      var u1u1u1 = u1 * u1 * u1;
	      var t1u1u1_3 = t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1;
	      var t1t1u1_3 = t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1;
	      var t1t1t1 = t1 * t1 * t1;
	      for (i = 0; i < len; i += 1) {
	        bezierSegmentPoints[i * 4] = math.round((u0u0u0 * pt1[i] + t0u0u0_3 * pt3[i] + t0t0u0_3 * pt4[i] + t0t0t0 * pt2[i]) * 1e3) / 1e3;
	        bezierSegmentPoints[i * 4 + 1] = math.round((u0u0u1 * pt1[i] + t0u0u1_3 * pt3[i] + t0t0u1_3 * pt4[i] + t0t0t1 * pt2[i]) * 1e3) / 1e3;
	        bezierSegmentPoints[i * 4 + 2] = math.round((u0u1u1 * pt1[i] + t0u1u1_3 * pt3[i] + t0t1u1_3 * pt4[i] + t0t1t1 * pt2[i]) * 1e3) / 1e3;
	        bezierSegmentPoints[i * 4 + 3] = math.round((u1u1u1 * pt1[i] + t1u1u1_3 * pt3[i] + t1t1u1_3 * pt4[i] + t1t1t1 * pt2[i]) * 1e3) / 1e3;
	      }
	      return bezierSegmentPoints;
	    }
	    return {
	      getSegmentsLength,
	      getNewSegment,
	      getPointInSegment,
	      buildBezierData,
	      pointOnLine2D,
	      pointOnLine3D
	    };
	  }
	  var bez = bezFunction();
	  var initFrame = initialDefaultFrame;
	  var mathAbs = Math.abs;
	  function interpolateValue(frameNum, caching) {
	    var offsetTime = this.offsetTime;
	    var newValue;
	    if (this.propType === "multidimensional") {
	      newValue = createTypedArray("float32", this.pv.length);
	    }
	    var iterationIndex = caching.lastIndex;
	    var i = iterationIndex;
	    var len = this.keyframes.length - 1;
	    var flag = true;
	    var keyData;
	    var nextKeyData;
	    var keyframeMetadata;
	    while (flag) {
	      keyData = this.keyframes[i];
	      nextKeyData = this.keyframes[i + 1];
	      if (i === len - 1 && frameNum >= nextKeyData.t - offsetTime) {
	        if (keyData.h) {
	          keyData = nextKeyData;
	        }
	        iterationIndex = 0;
	        break;
	      }
	      if (nextKeyData.t - offsetTime > frameNum) {
	        iterationIndex = i;
	        break;
	      }
	      if (i < len - 1) {
	        i += 1;
	      } else {
	        iterationIndex = 0;
	        flag = false;
	      }
	    }
	    keyframeMetadata = this.keyframesMetadata[i] || {};
	    var k;
	    var kLen;
	    var perc;
	    var jLen;
	    var j;
	    var fnc;
	    var nextKeyTime = nextKeyData.t - offsetTime;
	    var keyTime = keyData.t - offsetTime;
	    var endValue;
	    if (keyData.to) {
	      if (!keyframeMetadata.bezierData) {
	        keyframeMetadata.bezierData = bez.buildBezierData(keyData.s, nextKeyData.s || keyData.e, keyData.to, keyData.ti);
	      }
	      var bezierData = keyframeMetadata.bezierData;
	      if (frameNum >= nextKeyTime || frameNum < keyTime) {
	        var ind = frameNum >= nextKeyTime ? bezierData.points.length - 1 : 0;
	        kLen = bezierData.points[ind].point.length;
	        for (k = 0; k < kLen; k += 1) {
	          newValue[k] = bezierData.points[ind].point[k];
	        }
	      } else {
	        if (keyframeMetadata.__fnct) {
	          fnc = keyframeMetadata.__fnct;
	        } else {
	          fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n).get;
	          keyframeMetadata.__fnct = fnc;
	        }
	        perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
	        var distanceInLine = bezierData.segmentLength * perc;
	        var segmentPerc;
	        var addedLength = caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastAddedLength : 0;
	        j = caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastPoint : 0;
	        flag = true;
	        jLen = bezierData.points.length;
	        while (flag) {
	          addedLength += bezierData.points[j].partialLength;
	          if (distanceInLine === 0 || perc === 0 || j === bezierData.points.length - 1) {
	            kLen = bezierData.points[j].point.length;
	            for (k = 0; k < kLen; k += 1) {
	              newValue[k] = bezierData.points[j].point[k];
	            }
	            break;
	          } else if (distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j + 1].partialLength) {
	            segmentPerc = (distanceInLine - addedLength) / bezierData.points[j + 1].partialLength;
	            kLen = bezierData.points[j].point.length;
	            for (k = 0; k < kLen; k += 1) {
	              newValue[k] = bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
	            }
	            break;
	          }
	          if (j < jLen - 1) {
	            j += 1;
	          } else {
	            flag = false;
	          }
	        }
	        caching._lastPoint = j;
	        caching._lastAddedLength = addedLength - bezierData.points[j].partialLength;
	        caching._lastKeyframeIndex = i;
	      }
	    } else {
	      var outX;
	      var outY;
	      var inX;
	      var inY;
	      var keyValue;
	      len = keyData.s.length;
	      endValue = nextKeyData.s || keyData.e;
	      if (this.sh && keyData.h !== 1) {
	        if (frameNum >= nextKeyTime) {
	          newValue[0] = endValue[0];
	          newValue[1] = endValue[1];
	          newValue[2] = endValue[2];
	        } else if (frameNum <= keyTime) {
	          newValue[0] = keyData.s[0];
	          newValue[1] = keyData.s[1];
	          newValue[2] = keyData.s[2];
	        } else {
	          var quatStart = createQuaternion(keyData.s);
	          var quatEnd = createQuaternion(endValue);
	          var time2 = (frameNum - keyTime) / (nextKeyTime - keyTime);
	          quaternionToEuler(newValue, slerp(quatStart, quatEnd, time2));
	        }
	      } else {
	        for (i = 0; i < len; i += 1) {
	          if (keyData.h !== 1) {
	            if (frameNum >= nextKeyTime) {
	              perc = 1;
	            } else if (frameNum < keyTime) {
	              perc = 0;
	            } else {
	              if (keyData.o.x.constructor === Array) {
	                if (!keyframeMetadata.__fnct) {
	                  keyframeMetadata.__fnct = [];
	                }
	                if (!keyframeMetadata.__fnct[i]) {
	                  outX = keyData.o.x[i] === void 0 ? keyData.o.x[0] : keyData.o.x[i];
	                  outY = keyData.o.y[i] === void 0 ? keyData.o.y[0] : keyData.o.y[i];
	                  inX = keyData.i.x[i] === void 0 ? keyData.i.x[0] : keyData.i.x[i];
	                  inY = keyData.i.y[i] === void 0 ? keyData.i.y[0] : keyData.i.y[i];
	                  fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
	                  keyframeMetadata.__fnct[i] = fnc;
	                } else {
	                  fnc = keyframeMetadata.__fnct[i];
	                }
	              } else if (!keyframeMetadata.__fnct) {
	                outX = keyData.o.x;
	                outY = keyData.o.y;
	                inX = keyData.i.x;
	                inY = keyData.i.y;
	                fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
	                keyData.keyframeMetadata = fnc;
	              } else {
	                fnc = keyframeMetadata.__fnct;
	              }
	              perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
	            }
	          }
	          endValue = nextKeyData.s || keyData.e;
	          keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i] + (endValue[i] - keyData.s[i]) * perc;
	          if (this.propType === "multidimensional") {
	            newValue[i] = keyValue;
	          } else {
	            newValue = keyValue;
	          }
	        }
	      }
	    }
	    caching.lastIndex = iterationIndex;
	    return newValue;
	  }
	  function slerp(a, b, t) {
	    var out = [];
	    var ax = a[0];
	    var ay = a[1];
	    var az = a[2];
	    var aw = a[3];
	    var bx = b[0];
	    var by = b[1];
	    var bz = b[2];
	    var bw = b[3];
	    var omega;
	    var cosom;
	    var sinom;
	    var scale0;
	    var scale1;
	    cosom = ax * bx + ay * by + az * bz + aw * bw;
	    if (cosom < 0) {
	      cosom = -cosom;
	      bx = -bx;
	      by = -by;
	      bz = -bz;
	      bw = -bw;
	    }
	    if (1 - cosom > 1e-6) {
	      omega = Math.acos(cosom);
	      sinom = Math.sin(omega);
	      scale0 = Math.sin((1 - t) * omega) / sinom;
	      scale1 = Math.sin(t * omega) / sinom;
	    } else {
	      scale0 = 1 - t;
	      scale1 = t;
	    }
	    out[0] = scale0 * ax + scale1 * bx;
	    out[1] = scale0 * ay + scale1 * by;
	    out[2] = scale0 * az + scale1 * bz;
	    out[3] = scale0 * aw + scale1 * bw;
	    return out;
	  }
	  function quaternionToEuler(out, quat) {
	    var qx = quat[0];
	    var qy = quat[1];
	    var qz = quat[2];
	    var qw = quat[3];
	    var heading = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy * qy - 2 * qz * qz);
	    var attitude = Math.asin(2 * qx * qy + 2 * qz * qw);
	    var bank = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx * qx - 2 * qz * qz);
	    out[0] = heading / degToRads;
	    out[1] = attitude / degToRads;
	    out[2] = bank / degToRads;
	  }
	  function createQuaternion(values) {
	    var heading = values[0] * degToRads;
	    var attitude = values[1] * degToRads;
	    var bank = values[2] * degToRads;
	    var c1 = Math.cos(heading / 2);
	    var c2 = Math.cos(attitude / 2);
	    var c3 = Math.cos(bank / 2);
	    var s1 = Math.sin(heading / 2);
	    var s2 = Math.sin(attitude / 2);
	    var s3 = Math.sin(bank / 2);
	    var w = c1 * c2 * c3 - s1 * s2 * s3;
	    var x = s1 * s2 * c3 + c1 * c2 * s3;
	    var y = s1 * c2 * c3 + c1 * s2 * s3;
	    var z = c1 * s2 * c3 - s1 * c2 * s3;
	    return [x, y, z, w];
	  }
	  function getValueAtCurrentTime() {
	    var frameNum = this.comp.renderedFrame - this.offsetTime;
	    var initTime = this.keyframes[0].t - this.offsetTime;
	    var endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
	    if (!(frameNum === this._caching.lastFrame || this._caching.lastFrame !== initFrame && (this._caching.lastFrame >= endTime && frameNum >= endTime || this._caching.lastFrame < initTime && frameNum < initTime))) {
	      if (this._caching.lastFrame >= frameNum) {
	        this._caching._lastKeyframeIndex = -1;
	        this._caching.lastIndex = 0;
	      }
	      var renderResult = this.interpolateValue(frameNum, this._caching);
	      this.pv = renderResult;
	    }
	    this._caching.lastFrame = frameNum;
	    return this.pv;
	  }
	  function setVValue(val2) {
	    var multipliedValue;
	    if (this.propType === "unidimensional") {
	      multipliedValue = val2 * this.mult;
	      if (mathAbs(this.v - multipliedValue) > 1e-5) {
	        this.v = multipliedValue;
	        this._mdf = true;
	      }
	    } else {
	      var i = 0;
	      var len = this.v.length;
	      while (i < len) {
	        multipliedValue = val2[i] * this.mult;
	        if (mathAbs(this.v[i] - multipliedValue) > 1e-5) {
	          this.v[i] = multipliedValue;
	          this._mdf = true;
	        }
	        i += 1;
	      }
	    }
	  }
	  function processEffectsSequence() {
	    if (this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) {
	      return;
	    }
	    if (this.lock) {
	      this.setVValue(this.pv);
	      return;
	    }
	    this.lock = true;
	    this._mdf = this._isFirstFrame;
	    var i;
	    var len = this.effectsSequence.length;
	    var finalValue = this.kf ? this.pv : this.data.k;
	    for (i = 0; i < len; i += 1) {
	      finalValue = this.effectsSequence[i](finalValue);
	    }
	    this.setVValue(finalValue);
	    this._isFirstFrame = false;
	    this.lock = false;
	    this.frameId = this.elem.globalData.frameId;
	  }
	  function addEffect(effectFunction) {
	    this.effectsSequence.push(effectFunction);
	    this.container.addDynamicProperty(this);
	  }
	  function ValueProperty(elem2, data2, mult, container) {
	    this.propType = "unidimensional";
	    this.mult = mult || 1;
	    this.data = data2;
	    this.v = mult ? data2.k * mult : data2.k;
	    this.pv = data2.k;
	    this._mdf = false;
	    this.elem = elem2;
	    this.container = container;
	    this.comp = elem2.comp;
	    this.k = false;
	    this.kf = false;
	    this.vel = 0;
	    this.effectsSequence = [];
	    this._isFirstFrame = true;
	    this.getValue = processEffectsSequence;
	    this.setVValue = setVValue;
	    this.addEffect = addEffect;
	  }
	  function MultiDimensionalProperty(elem2, data2, mult, container) {
	    this.propType = "multidimensional";
	    this.mult = mult || 1;
	    this.data = data2;
	    this._mdf = false;
	    this.elem = elem2;
	    this.container = container;
	    this.comp = elem2.comp;
	    this.k = false;
	    this.kf = false;
	    this.frameId = -1;
	    var i;
	    var len = data2.k.length;
	    this.v = createTypedArray("float32", len);
	    this.pv = createTypedArray("float32", len);
	    this.vel = createTypedArray("float32", len);
	    for (i = 0; i < len; i += 1) {
	      this.v[i] = data2.k[i] * this.mult;
	      this.pv[i] = data2.k[i];
	    }
	    this._isFirstFrame = true;
	    this.effectsSequence = [];
	    this.getValue = processEffectsSequence;
	    this.setVValue = setVValue;
	    this.addEffect = addEffect;
	  }
	  function KeyframedValueProperty(elem2, data2, mult, container) {
	    this.propType = "unidimensional";
	    this.keyframes = data2.k;
	    this.keyframesMetadata = [];
	    this.offsetTime = elem2.data.st;
	    this.frameId = -1;
	    this._caching = {
	      lastFrame: initFrame,
	      lastIndex: 0,
	      value: 0,
	      _lastKeyframeIndex: -1
	    };
	    this.k = true;
	    this.kf = true;
	    this.data = data2;
	    this.mult = mult || 1;
	    this.elem = elem2;
	    this.container = container;
	    this.comp = elem2.comp;
	    this.v = initFrame;
	    this.pv = initFrame;
	    this._isFirstFrame = true;
	    this.getValue = processEffectsSequence;
	    this.setVValue = setVValue;
	    this.interpolateValue = interpolateValue;
	    this.effectsSequence = [getValueAtCurrentTime.bind(this)];
	    this.addEffect = addEffect;
	  }
	  function KeyframedMultidimensionalProperty(elem2, data2, mult, container) {
	    this.propType = "multidimensional";
	    var i;
	    var len = data2.k.length;
	    var s;
	    var e;
	    var to;
	    var ti;
	    for (i = 0; i < len - 1; i += 1) {
	      if (data2.k[i].to && data2.k[i].s && data2.k[i + 1] && data2.k[i + 1].s) {
	        s = data2.k[i].s;
	        e = data2.k[i + 1].s;
	        to = data2.k[i].to;
	        ti = data2.k[i].ti;
	        if (s.length === 2 && !(s[0] === e[0] && s[1] === e[1]) && bez.pointOnLine2D(s[0], s[1], e[0], e[1], s[0] + to[0], s[1] + to[1]) && bez.pointOnLine2D(s[0], s[1], e[0], e[1], e[0] + ti[0], e[1] + ti[1]) || s.length === 3 && !(s[0] === e[0] && s[1] === e[1] && s[2] === e[2]) && bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], s[0] + to[0], s[1] + to[1], s[2] + to[2]) && bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], e[0] + ti[0], e[1] + ti[1], e[2] + ti[2])) {
	          data2.k[i].to = null;
	          data2.k[i].ti = null;
	        }
	        if (s[0] === e[0] && s[1] === e[1] && to[0] === 0 && to[1] === 0 && ti[0] === 0 && ti[1] === 0) {
	          if (s.length === 2 || s[2] === e[2] && to[2] === 0 && ti[2] === 0) {
	            data2.k[i].to = null;
	            data2.k[i].ti = null;
	          }
	        }
	      }
	    }
	    this.effectsSequence = [getValueAtCurrentTime.bind(this)];
	    this.data = data2;
	    this.keyframes = data2.k;
	    this.keyframesMetadata = [];
	    this.offsetTime = elem2.data.st;
	    this.k = true;
	    this.kf = true;
	    this._isFirstFrame = true;
	    this.mult = mult || 1;
	    this.elem = elem2;
	    this.container = container;
	    this.comp = elem2.comp;
	    this.getValue = processEffectsSequence;
	    this.setVValue = setVValue;
	    this.interpolateValue = interpolateValue;
	    this.frameId = -1;
	    var arrLen = data2.k[0].s.length;
	    this.v = createTypedArray("float32", arrLen);
	    this.pv = createTypedArray("float32", arrLen);
	    for (i = 0; i < arrLen; i += 1) {
	      this.v[i] = initFrame;
	      this.pv[i] = initFrame;
	    }
	    this._caching = {
	      lastFrame: initFrame,
	      lastIndex: 0,
	      value: createTypedArray("float32", arrLen)
	    };
	    this.addEffect = addEffect;
	  }
	  var PropertyFactory = /* @__PURE__ */ function() {
	    function getProp(elem2, data2, type, mult, container) {
	      if (data2.sid) {
	        data2 = elem2.globalData.slotManager.getProp(data2);
	      }
	      var p;
	      if (!data2.k.length) {
	        p = new ValueProperty(elem2, data2, mult, container);
	      } else if (typeof data2.k[0] === "number") {
	        p = new MultiDimensionalProperty(elem2, data2, mult, container);
	      } else {
	        switch (type) {
	          case 0:
	            p = new KeyframedValueProperty(elem2, data2, mult, container);
	            break;
	          case 1:
	            p = new KeyframedMultidimensionalProperty(elem2, data2, mult, container);
	            break;
	        }
	      }
	      if (p.effectsSequence.length) {
	        container.addDynamicProperty(p);
	      }
	      return p;
	    }
	    var ob2 = {
	      getProp
	    };
	    return ob2;
	  }();
	  function DynamicPropertyContainer() {
	  }
	  DynamicPropertyContainer.prototype = {
	    addDynamicProperty: function addDynamicProperty(prop) {
	      if (this.dynamicProperties.indexOf(prop) === -1) {
	        this.dynamicProperties.push(prop);
	        this.container.addDynamicProperty(this);
	        this._isAnimated = true;
	      }
	    },
	    iterateDynamicProperties: function iterateDynamicProperties() {
	      this._mdf = false;
	      var i;
	      var len = this.dynamicProperties.length;
	      for (i = 0; i < len; i += 1) {
	        this.dynamicProperties[i].getValue();
	        if (this.dynamicProperties[i]._mdf) {
	          this._mdf = true;
	        }
	      }
	    },
	    initDynamicPropertyContainer: function initDynamicPropertyContainer(container) {
	      this.container = container;
	      this.dynamicProperties = [];
	      this._mdf = false;
	      this._isAnimated = false;
	    }
	  };
	  var pointPool = function() {
	    function create() {
	      return createTypedArray("float32", 2);
	    }
	    return poolFactory(8, create);
	  }();
	  function ShapePath() {
	    this.c = false;
	    this._length = 0;
	    this._maxLength = 8;
	    this.v = createSizedArray(this._maxLength);
	    this.o = createSizedArray(this._maxLength);
	    this.i = createSizedArray(this._maxLength);
	  }
	  ShapePath.prototype.setPathData = function(closed, len) {
	    this.c = closed;
	    this.setLength(len);
	    var i = 0;
	    while (i < len) {
	      this.v[i] = pointPool.newElement();
	      this.o[i] = pointPool.newElement();
	      this.i[i] = pointPool.newElement();
	      i += 1;
	    }
	  };
	  ShapePath.prototype.setLength = function(len) {
	    while (this._maxLength < len) {
	      this.doubleArrayLength();
	    }
	    this._length = len;
	  };
	  ShapePath.prototype.doubleArrayLength = function() {
	    this.v = this.v.concat(createSizedArray(this._maxLength));
	    this.i = this.i.concat(createSizedArray(this._maxLength));
	    this.o = this.o.concat(createSizedArray(this._maxLength));
	    this._maxLength *= 2;
	  };
	  ShapePath.prototype.setXYAt = function(x, y, type, pos, replace) {
	    var arr;
	    this._length = Math.max(this._length, pos + 1);
	    if (this._length >= this._maxLength) {
	      this.doubleArrayLength();
	    }
	    switch (type) {
	      case "v":
	        arr = this.v;
	        break;
	      case "i":
	        arr = this.i;
	        break;
	      case "o":
	        arr = this.o;
	        break;
	      default:
	        arr = [];
	        break;
	    }
	    if (!arr[pos] || arr[pos] && !replace) {
	      arr[pos] = pointPool.newElement();
	    }
	    arr[pos][0] = x;
	    arr[pos][1] = y;
	  };
	  ShapePath.prototype.setTripleAt = function(vX, vY, oX, oY, iX, iY, pos, replace) {
	    this.setXYAt(vX, vY, "v", pos, replace);
	    this.setXYAt(oX, oY, "o", pos, replace);
	    this.setXYAt(iX, iY, "i", pos, replace);
	  };
	  ShapePath.prototype.reverse = function() {
	    var newPath = new ShapePath();
	    newPath.setPathData(this.c, this._length);
	    var vertices = this.v;
	    var outPoints = this.o;
	    var inPoints = this.i;
	    var init = 0;
	    if (this.c) {
	      newPath.setTripleAt(vertices[0][0], vertices[0][1], inPoints[0][0], inPoints[0][1], outPoints[0][0], outPoints[0][1], 0, false);
	      init = 1;
	    }
	    var cnt = this._length - 1;
	    var len = this._length;
	    var i;
	    for (i = init; i < len; i += 1) {
	      newPath.setTripleAt(vertices[cnt][0], vertices[cnt][1], inPoints[cnt][0], inPoints[cnt][1], outPoints[cnt][0], outPoints[cnt][1], i, false);
	      cnt -= 1;
	    }
	    return newPath;
	  };
	  ShapePath.prototype.length = function() {
	    return this._length;
	  };
	  var shapePool = function() {
	    function create() {
	      return new ShapePath();
	    }
	    function release(shapePath) {
	      var len = shapePath._length;
	      var i;
	      for (i = 0; i < len; i += 1) {
	        pointPool.release(shapePath.v[i]);
	        pointPool.release(shapePath.i[i]);
	        pointPool.release(shapePath.o[i]);
	        shapePath.v[i] = null;
	        shapePath.i[i] = null;
	        shapePath.o[i] = null;
	      }
	      shapePath._length = 0;
	      shapePath.c = false;
	    }
	    function clone(shape) {
	      var cloned = factory.newElement();
	      var i;
	      var len = shape._length === void 0 ? shape.v.length : shape._length;
	      cloned.setLength(len);
	      cloned.c = shape.c;
	      for (i = 0; i < len; i += 1) {
	        cloned.setTripleAt(shape.v[i][0], shape.v[i][1], shape.o[i][0], shape.o[i][1], shape.i[i][0], shape.i[i][1], i);
	      }
	      return cloned;
	    }
	    var factory = poolFactory(4, create, release);
	    factory.clone = clone;
	    return factory;
	  }();
	  function ShapeCollection() {
	    this._length = 0;
	    this._maxLength = 4;
	    this.shapes = createSizedArray(this._maxLength);
	  }
	  ShapeCollection.prototype.addShape = function(shapeData) {
	    if (this._length === this._maxLength) {
	      this.shapes = this.shapes.concat(createSizedArray(this._maxLength));
	      this._maxLength *= 2;
	    }
	    this.shapes[this._length] = shapeData;
	    this._length += 1;
	  };
	  ShapeCollection.prototype.releaseShapes = function() {
	    var i;
	    for (i = 0; i < this._length; i += 1) {
	      shapePool.release(this.shapes[i]);
	    }
	    this._length = 0;
	  };
	  var shapeCollectionPool = function() {
	    var ob2 = {
	      newShapeCollection,
	      release
	    };
	    var _length = 0;
	    var _maxLength = 4;
	    var pool = createSizedArray(_maxLength);
	    function newShapeCollection() {
	      var shapeCollection;
	      if (_length) {
	        _length -= 1;
	        shapeCollection = pool[_length];
	      } else {
	        shapeCollection = new ShapeCollection();
	      }
	      return shapeCollection;
	    }
	    function release(shapeCollection) {
	      var i;
	      var len = shapeCollection._length;
	      for (i = 0; i < len; i += 1) {
	        shapePool.release(shapeCollection.shapes[i]);
	      }
	      shapeCollection._length = 0;
	      if (_length === _maxLength) {
	        pool = pooling["double"](pool);
	        _maxLength *= 2;
	      }
	      pool[_length] = shapeCollection;
	      _length += 1;
	    }
	    return ob2;
	  }();
	  var ShapePropertyFactory = function() {
	    var initFrame2 = -999999;
	    function interpolateShape(frameNum, previousValue, caching) {
	      var iterationIndex = caching.lastIndex;
	      var keyPropS;
	      var keyPropE;
	      var isHold;
	      var j;
	      var k;
	      var jLen;
	      var kLen;
	      var perc;
	      var vertexValue;
	      var kf = this.keyframes;
	      if (frameNum < kf[0].t - this.offsetTime) {
	        keyPropS = kf[0].s[0];
	        isHold = true;
	        iterationIndex = 0;
	      } else if (frameNum >= kf[kf.length - 1].t - this.offsetTime) {
	        keyPropS = kf[kf.length - 1].s ? kf[kf.length - 1].s[0] : kf[kf.length - 2].e[0];
	        isHold = true;
	      } else {
	        var i = iterationIndex;
	        var len = kf.length - 1;
	        var flag = true;
	        var keyData;
	        var nextKeyData;
	        var keyframeMetadata;
	        while (flag) {
	          keyData = kf[i];
	          nextKeyData = kf[i + 1];
	          if (nextKeyData.t - this.offsetTime > frameNum) {
	            break;
	          }
	          if (i < len - 1) {
	            i += 1;
	          } else {
	            flag = false;
	          }
	        }
	        keyframeMetadata = this.keyframesMetadata[i] || {};
	        isHold = keyData.h === 1;
	        iterationIndex = i;
	        if (!isHold) {
	          if (frameNum >= nextKeyData.t - this.offsetTime) {
	            perc = 1;
	          } else if (frameNum < keyData.t - this.offsetTime) {
	            perc = 0;
	          } else {
	            var fnc;
	            if (keyframeMetadata.__fnct) {
	              fnc = keyframeMetadata.__fnct;
	            } else {
	              fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y).get;
	              keyframeMetadata.__fnct = fnc;
	            }
	            perc = fnc((frameNum - (keyData.t - this.offsetTime)) / (nextKeyData.t - this.offsetTime - (keyData.t - this.offsetTime)));
	          }
	          keyPropE = nextKeyData.s ? nextKeyData.s[0] : keyData.e[0];
	        }
	        keyPropS = keyData.s[0];
	      }
	      jLen = previousValue._length;
	      kLen = keyPropS.i[0].length;
	      caching.lastIndex = iterationIndex;
	      for (j = 0; j < jLen; j += 1) {
	        for (k = 0; k < kLen; k += 1) {
	          vertexValue = isHold ? keyPropS.i[j][k] : keyPropS.i[j][k] + (keyPropE.i[j][k] - keyPropS.i[j][k]) * perc;
	          previousValue.i[j][k] = vertexValue;
	          vertexValue = isHold ? keyPropS.o[j][k] : keyPropS.o[j][k] + (keyPropE.o[j][k] - keyPropS.o[j][k]) * perc;
	          previousValue.o[j][k] = vertexValue;
	          vertexValue = isHold ? keyPropS.v[j][k] : keyPropS.v[j][k] + (keyPropE.v[j][k] - keyPropS.v[j][k]) * perc;
	          previousValue.v[j][k] = vertexValue;
	        }
	      }
	    }
	    function interpolateShapeCurrentTime() {
	      var frameNum = this.comp.renderedFrame - this.offsetTime;
	      var initTime = this.keyframes[0].t - this.offsetTime;
	      var endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
	      var lastFrame = this._caching.lastFrame;
	      if (!(lastFrame !== initFrame2 && (lastFrame < initTime && frameNum < initTime || lastFrame > endTime && frameNum > endTime))) {
	        this._caching.lastIndex = lastFrame < frameNum ? this._caching.lastIndex : 0;
	        this.interpolateShape(frameNum, this.pv, this._caching);
	      }
	      this._caching.lastFrame = frameNum;
	      return this.pv;
	    }
	    function resetShape() {
	      this.paths = this.localShapeCollection;
	    }
	    function shapesEqual(shape1, shape2) {
	      if (shape1._length !== shape2._length || shape1.c !== shape2.c) {
	        return false;
	      }
	      var i;
	      var len = shape1._length;
	      for (i = 0; i < len; i += 1) {
	        if (shape1.v[i][0] !== shape2.v[i][0] || shape1.v[i][1] !== shape2.v[i][1] || shape1.o[i][0] !== shape2.o[i][0] || shape1.o[i][1] !== shape2.o[i][1] || shape1.i[i][0] !== shape2.i[i][0] || shape1.i[i][1] !== shape2.i[i][1]) {
	          return false;
	        }
	      }
	      return true;
	    }
	    function setVValue2(newPath) {
	      if (!shapesEqual(this.v, newPath)) {
	        this.v = shapePool.clone(newPath);
	        this.localShapeCollection.releaseShapes();
	        this.localShapeCollection.addShape(this.v);
	        this._mdf = true;
	        this.paths = this.localShapeCollection;
	      }
	    }
	    function processEffectsSequence2() {
	      if (this.elem.globalData.frameId === this.frameId) {
	        return;
	      }
	      if (!this.effectsSequence.length) {
	        this._mdf = false;
	        return;
	      }
	      if (this.lock) {
	        this.setVValue(this.pv);
	        return;
	      }
	      this.lock = true;
	      this._mdf = false;
	      var finalValue;
	      if (this.kf) {
	        finalValue = this.pv;
	      } else if (this.data.ks) {
	        finalValue = this.data.ks.k;
	      } else {
	        finalValue = this.data.pt.k;
	      }
	      var i;
	      var len = this.effectsSequence.length;
	      for (i = 0; i < len; i += 1) {
	        finalValue = this.effectsSequence[i](finalValue);
	      }
	      this.setVValue(finalValue);
	      this.lock = false;
	      this.frameId = this.elem.globalData.frameId;
	    }
	    function ShapeProperty(elem2, data2, type) {
	      this.propType = "shape";
	      this.comp = elem2.comp;
	      this.container = elem2;
	      this.elem = elem2;
	      this.data = data2;
	      this.k = false;
	      this.kf = false;
	      this._mdf = false;
	      var pathData = type === 3 ? data2.pt.k : data2.ks.k;
	      this.v = shapePool.clone(pathData);
	      this.pv = shapePool.clone(this.v);
	      this.localShapeCollection = shapeCollectionPool.newShapeCollection();
	      this.paths = this.localShapeCollection;
	      this.paths.addShape(this.v);
	      this.reset = resetShape;
	      this.effectsSequence = [];
	    }
	    function addEffect2(effectFunction) {
	      this.effectsSequence.push(effectFunction);
	      this.container.addDynamicProperty(this);
	    }
	    ShapeProperty.prototype.interpolateShape = interpolateShape;
	    ShapeProperty.prototype.getValue = processEffectsSequence2;
	    ShapeProperty.prototype.setVValue = setVValue2;
	    ShapeProperty.prototype.addEffect = addEffect2;
	    function KeyframedShapeProperty(elem2, data2, type) {
	      this.propType = "shape";
	      this.comp = elem2.comp;
	      this.elem = elem2;
	      this.container = elem2;
	      this.offsetTime = elem2.data.st;
	      this.keyframes = type === 3 ? data2.pt.k : data2.ks.k;
	      this.keyframesMetadata = [];
	      this.k = true;
	      this.kf = true;
	      var len = this.keyframes[0].s[0].i.length;
	      this.v = shapePool.newElement();
	      this.v.setPathData(this.keyframes[0].s[0].c, len);
	      this.pv = shapePool.clone(this.v);
	      this.localShapeCollection = shapeCollectionPool.newShapeCollection();
	      this.paths = this.localShapeCollection;
	      this.paths.addShape(this.v);
	      this.lastFrame = initFrame2;
	      this.reset = resetShape;
	      this._caching = {
	        lastFrame: initFrame2,
	        lastIndex: 0
	      };
	      this.effectsSequence = [interpolateShapeCurrentTime.bind(this)];
	    }
	    KeyframedShapeProperty.prototype.getValue = processEffectsSequence2;
	    KeyframedShapeProperty.prototype.interpolateShape = interpolateShape;
	    KeyframedShapeProperty.prototype.setVValue = setVValue2;
	    KeyframedShapeProperty.prototype.addEffect = addEffect2;
	    var EllShapeProperty = function() {
	      var cPoint = roundCorner;
	      function EllShapePropertyFactory(elem2, data2) {
	        this.v = shapePool.newElement();
	        this.v.setPathData(true, 4);
	        this.localShapeCollection = shapeCollectionPool.newShapeCollection();
	        this.paths = this.localShapeCollection;
	        this.localShapeCollection.addShape(this.v);
	        this.d = data2.d;
	        this.elem = elem2;
	        this.comp = elem2.comp;
	        this.frameId = -1;
	        this.initDynamicPropertyContainer(elem2);
	        this.p = PropertyFactory.getProp(elem2, data2.p, 1, 0, this);
	        this.s = PropertyFactory.getProp(elem2, data2.s, 1, 0, this);
	        if (this.dynamicProperties.length) {
	          this.k = true;
	        } else {
	          this.k = false;
	          this.convertEllToPath();
	        }
	      }
	      EllShapePropertyFactory.prototype = {
	        reset: resetShape,
	        getValue: function getValue() {
	          if (this.elem.globalData.frameId === this.frameId) {
	            return;
	          }
	          this.frameId = this.elem.globalData.frameId;
	          this.iterateDynamicProperties();
	          if (this._mdf) {
	            this.convertEllToPath();
	          }
	        },
	        convertEllToPath: function convertEllToPath() {
	          var p0 = this.p.v[0];
	          var p1 = this.p.v[1];
	          var s0 = this.s.v[0] / 2;
	          var s1 = this.s.v[1] / 2;
	          var _cw = this.d !== 3;
	          var _v = this.v;
	          _v.v[0][0] = p0;
	          _v.v[0][1] = p1 - s1;
	          _v.v[1][0] = _cw ? p0 + s0 : p0 - s0;
	          _v.v[1][1] = p1;
	          _v.v[2][0] = p0;
	          _v.v[2][1] = p1 + s1;
	          _v.v[3][0] = _cw ? p0 - s0 : p0 + s0;
	          _v.v[3][1] = p1;
	          _v.i[0][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
	          _v.i[0][1] = p1 - s1;
	          _v.i[1][0] = _cw ? p0 + s0 : p0 - s0;
	          _v.i[1][1] = p1 - s1 * cPoint;
	          _v.i[2][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
	          _v.i[2][1] = p1 + s1;
	          _v.i[3][0] = _cw ? p0 - s0 : p0 + s0;
	          _v.i[3][1] = p1 + s1 * cPoint;
	          _v.o[0][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
	          _v.o[0][1] = p1 - s1;
	          _v.o[1][0] = _cw ? p0 + s0 : p0 - s0;
	          _v.o[1][1] = p1 + s1 * cPoint;
	          _v.o[2][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
	          _v.o[2][1] = p1 + s1;
	          _v.o[3][0] = _cw ? p0 - s0 : p0 + s0;
	          _v.o[3][1] = p1 - s1 * cPoint;
	        }
	      };
	      extendPrototype([DynamicPropertyContainer], EllShapePropertyFactory);
	      return EllShapePropertyFactory;
	    }();
	    var StarShapeProperty = function() {
	      function StarShapePropertyFactory(elem2, data2) {
	        this.v = shapePool.newElement();
	        this.v.setPathData(true, 0);
	        this.elem = elem2;
	        this.comp = elem2.comp;
	        this.data = data2;
	        this.frameId = -1;
	        this.d = data2.d;
	        this.initDynamicPropertyContainer(elem2);
	        if (data2.sy === 1) {
	          this.ir = PropertyFactory.getProp(elem2, data2.ir, 0, 0, this);
	          this.is = PropertyFactory.getProp(elem2, data2.is, 0, 0.01, this);
	          this.convertToPath = this.convertStarToPath;
	        } else {
	          this.convertToPath = this.convertPolygonToPath;
	        }
	        this.pt = PropertyFactory.getProp(elem2, data2.pt, 0, 0, this);
	        this.p = PropertyFactory.getProp(elem2, data2.p, 1, 0, this);
	        this.r = PropertyFactory.getProp(elem2, data2.r, 0, degToRads, this);
	        this.or = PropertyFactory.getProp(elem2, data2.or, 0, 0, this);
	        this.os = PropertyFactory.getProp(elem2, data2.os, 0, 0.01, this);
	        this.localShapeCollection = shapeCollectionPool.newShapeCollection();
	        this.localShapeCollection.addShape(this.v);
	        this.paths = this.localShapeCollection;
	        if (this.dynamicProperties.length) {
	          this.k = true;
	        } else {
	          this.k = false;
	          this.convertToPath();
	        }
	      }
	      StarShapePropertyFactory.prototype = {
	        reset: resetShape,
	        getValue: function getValue() {
	          if (this.elem.globalData.frameId === this.frameId) {
	            return;
	          }
	          this.frameId = this.elem.globalData.frameId;
	          this.iterateDynamicProperties();
	          if (this._mdf) {
	            this.convertToPath();
	          }
	        },
	        convertStarToPath: function convertStarToPath() {
	          var numPts = Math.floor(this.pt.v) * 2;
	          var angle = Math.PI * 2 / numPts;
	          var longFlag = true;
	          var longRad = this.or.v;
	          var shortRad = this.ir.v;
	          var longRound = this.os.v;
	          var shortRound = this.is.v;
	          var longPerimSegment = 2 * Math.PI * longRad / (numPts * 2);
	          var shortPerimSegment = 2 * Math.PI * shortRad / (numPts * 2);
	          var i;
	          var rad;
	          var roundness;
	          var perimSegment;
	          var currentAng = -Math.PI / 2;
	          currentAng += this.r.v;
	          var dir = this.data.d === 3 ? -1 : 1;
	          this.v._length = 0;
	          for (i = 0; i < numPts; i += 1) {
	            rad = longFlag ? longRad : shortRad;
	            roundness = longFlag ? longRound : shortRound;
	            perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
	            var x = rad * Math.cos(currentAng);
	            var y = rad * Math.sin(currentAng);
	            var ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
	            var oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
	            x += +this.p.v[0];
	            y += +this.p.v[1];
	            this.v.setTripleAt(x, y, x - ox * perimSegment * roundness * dir, y - oy * perimSegment * roundness * dir, x + ox * perimSegment * roundness * dir, y + oy * perimSegment * roundness * dir, i, true);
	            longFlag = !longFlag;
	            currentAng += angle * dir;
	          }
	        },
	        convertPolygonToPath: function convertPolygonToPath() {
	          var numPts = Math.floor(this.pt.v);
	          var angle = Math.PI * 2 / numPts;
	          var rad = this.or.v;
	          var roundness = this.os.v;
	          var perimSegment = 2 * Math.PI * rad / (numPts * 4);
	          var i;
	          var currentAng = -Math.PI * 0.5;
	          var dir = this.data.d === 3 ? -1 : 1;
	          currentAng += this.r.v;
	          this.v._length = 0;
	          for (i = 0; i < numPts; i += 1) {
	            var x = rad * Math.cos(currentAng);
	            var y = rad * Math.sin(currentAng);
	            var ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
	            var oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
	            x += +this.p.v[0];
	            y += +this.p.v[1];
	            this.v.setTripleAt(x, y, x - ox * perimSegment * roundness * dir, y - oy * perimSegment * roundness * dir, x + ox * perimSegment * roundness * dir, y + oy * perimSegment * roundness * dir, i, true);
	            currentAng += angle * dir;
	          }
	          this.paths.length = 0;
	          this.paths[0] = this.v;
	        }
	      };
	      extendPrototype([DynamicPropertyContainer], StarShapePropertyFactory);
	      return StarShapePropertyFactory;
	    }();
	    var RectShapeProperty = function() {
	      function RectShapePropertyFactory(elem2, data2) {
	        this.v = shapePool.newElement();
	        this.v.c = true;
	        this.localShapeCollection = shapeCollectionPool.newShapeCollection();
	        this.localShapeCollection.addShape(this.v);
	        this.paths = this.localShapeCollection;
	        this.elem = elem2;
	        this.comp = elem2.comp;
	        this.frameId = -1;
	        this.d = data2.d;
	        this.initDynamicPropertyContainer(elem2);
	        this.p = PropertyFactory.getProp(elem2, data2.p, 1, 0, this);
	        this.s = PropertyFactory.getProp(elem2, data2.s, 1, 0, this);
	        this.r = PropertyFactory.getProp(elem2, data2.r, 0, 0, this);
	        if (this.dynamicProperties.length) {
	          this.k = true;
	        } else {
	          this.k = false;
	          this.convertRectToPath();
	        }
	      }
	      RectShapePropertyFactory.prototype = {
	        convertRectToPath: function convertRectToPath() {
	          var p0 = this.p.v[0];
	          var p1 = this.p.v[1];
	          var v0 = this.s.v[0] / 2;
	          var v1 = this.s.v[1] / 2;
	          var round = bmMin(v0, v1, this.r.v);
	          var cPoint = round * (1 - roundCorner);
	          this.v._length = 0;
	          if (this.d === 2 || this.d === 1) {
	            this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, 0, true);
	            this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, p0 + v0, p1 + v1 - round, 1, true);
	            if (round !== 0) {
	              this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, 2, true);
	              this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0 + round, p1 + v1, 3, true);
	              this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, 4, true);
	              this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1 + round, 5, true);
	              this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, 6, true);
	              this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, p0 + v0 - round, p1 - v1, 7, true);
	            } else {
	              this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0, p1 + v1, 2);
	              this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1, 3);
	            }
	          } else {
	            this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, p0 + v0, p1 - v1 + round, 0, true);
	            if (round !== 0) {
	              this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, 1, true);
	              this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0 + round, p1 - v1, 2, true);
	              this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, 3, true);
	              this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1 - round, 4, true);
	              this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, 5, true);
	              this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0 - round, p1 + v1, 6, true);
	              this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, 7, true);
	            } else {
	              this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0, p1 - v1, 1, true);
	              this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1, 2, true);
	              this.v.setTripleAt(p0 + v0, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0, p1 + v1, 3, true);
	            }
	          }
	        },
	        getValue: function getValue() {
	          if (this.elem.globalData.frameId === this.frameId) {
	            return;
	          }
	          this.frameId = this.elem.globalData.frameId;
	          this.iterateDynamicProperties();
	          if (this._mdf) {
	            this.convertRectToPath();
	          }
	        },
	        reset: resetShape
	      };
	      extendPrototype([DynamicPropertyContainer], RectShapePropertyFactory);
	      return RectShapePropertyFactory;
	    }();
	    function getShapeProp(elem2, data2, type) {
	      var prop;
	      if (type === 3 || type === 4) {
	        var dataProp = type === 3 ? data2.pt : data2.ks;
	        var keys = dataProp.k;
	        if (keys.length) {
	          prop = new KeyframedShapeProperty(elem2, data2, type);
	        } else {
	          prop = new ShapeProperty(elem2, data2, type);
	        }
	      } else if (type === 5) {
	        prop = new RectShapeProperty(elem2, data2);
	      } else if (type === 6) {
	        prop = new EllShapeProperty(elem2, data2);
	      } else if (type === 7) {
	        prop = new StarShapeProperty(elem2, data2);
	      }
	      if (prop.k) {
	        elem2.addDynamicProperty(prop);
	      }
	      return prop;
	    }
	    function getConstructorFunction() {
	      return ShapeProperty;
	    }
	    function getKeyframedConstructorFunction() {
	      return KeyframedShapeProperty;
	    }
	    var ob2 = {};
	    ob2.getShapeProp = getShapeProp;
	    ob2.getConstructorFunction = getConstructorFunction;
	    ob2.getKeyframedConstructorFunction = getKeyframedConstructorFunction;
	    return ob2;
	  }();
	  /*!
	   Transformation Matrix v2.0
	   (c) Epistemex 2014-2015
	   www.epistemex.com
	   By Ken Fyrstenberg
	   Contributions by leeoniya.
	   License: MIT, header required.
	   */
	  var Matrix = /* @__PURE__ */ function() {
	    var _cos = Math.cos;
	    var _sin = Math.sin;
	    var _tan = Math.tan;
	    var _rnd = Math.round;
	    function reset() {
	      this.props[0] = 1;
	      this.props[1] = 0;
	      this.props[2] = 0;
	      this.props[3] = 0;
	      this.props[4] = 0;
	      this.props[5] = 1;
	      this.props[6] = 0;
	      this.props[7] = 0;
	      this.props[8] = 0;
	      this.props[9] = 0;
	      this.props[10] = 1;
	      this.props[11] = 0;
	      this.props[12] = 0;
	      this.props[13] = 0;
	      this.props[14] = 0;
	      this.props[15] = 1;
	      return this;
	    }
	    function rotate(angle) {
	      if (angle === 0) {
	        return this;
	      }
	      var mCos = _cos(angle);
	      var mSin = _sin(angle);
	      return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	    }
	    function rotateX(angle) {
	      if (angle === 0) {
	        return this;
	      }
	      var mCos = _cos(angle);
	      var mSin = _sin(angle);
	      return this._t(1, 0, 0, 0, 0, mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1);
	    }
	    function rotateY(angle) {
	      if (angle === 0) {
	        return this;
	      }
	      var mCos = _cos(angle);
	      var mSin = _sin(angle);
	      return this._t(mCos, 0, mSin, 0, 0, 1, 0, 0, -mSin, 0, mCos, 0, 0, 0, 0, 1);
	    }
	    function rotateZ(angle) {
	      if (angle === 0) {
	        return this;
	      }
	      var mCos = _cos(angle);
	      var mSin = _sin(angle);
	      return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	    }
	    function shear(sx, sy) {
	      return this._t(1, sy, sx, 1, 0, 0);
	    }
	    function skew(ax, ay) {
	      return this.shear(_tan(ax), _tan(ay));
	    }
	    function skewFromAxis(ax, angle) {
	      var mCos = _cos(angle);
	      var mSin = _sin(angle);
	      return this._t(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, _tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	    }
	    function scale2(sx, sy, sz) {
	      if (!sz && sz !== 0) {
	        sz = 1;
	      }
	      if (sx === 1 && sy === 1 && sz === 1) {
	        return this;
	      }
	      return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
	    }
	    function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
	      this.props[0] = a;
	      this.props[1] = b;
	      this.props[2] = c;
	      this.props[3] = d;
	      this.props[4] = e;
	      this.props[5] = f;
	      this.props[6] = g;
	      this.props[7] = h;
	      this.props[8] = i;
	      this.props[9] = j;
	      this.props[10] = k;
	      this.props[11] = l;
	      this.props[12] = m;
	      this.props[13] = n;
	      this.props[14] = o;
	      this.props[15] = p;
	      return this;
	    }
	    function translate(tx, ty, tz) {
	      tz = tz || 0;
	      if (tx !== 0 || ty !== 0 || tz !== 0) {
	        return this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
	      }
	      return this;
	    }
	    function transform2(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
	      var _p = this.props;
	      if (a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0) {
	        _p[12] = _p[12] * a2 + _p[15] * m2;
	        _p[13] = _p[13] * f2 + _p[15] * n2;
	        _p[14] = _p[14] * k2 + _p[15] * o2;
	        _p[15] *= p2;
	        this._identityCalculated = false;
	        return this;
	      }
	      var a1 = _p[0];
	      var b1 = _p[1];
	      var c1 = _p[2];
	      var d1 = _p[3];
	      var e1 = _p[4];
	      var f1 = _p[5];
	      var g1 = _p[6];
	      var h1 = _p[7];
	      var i1 = _p[8];
	      var j1 = _p[9];
	      var k1 = _p[10];
	      var l1 = _p[11];
	      var m1 = _p[12];
	      var n1 = _p[13];
	      var o1 = _p[14];
	      var p1 = _p[15];
	      _p[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
	      _p[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2;
	      _p[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2;
	      _p[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2;
	      _p[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2;
	      _p[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2;
	      _p[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2;
	      _p[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2;
	      _p[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2;
	      _p[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2;
	      _p[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2;
	      _p[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2;
	      _p[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2;
	      _p[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2;
	      _p[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2;
	      _p[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2;
	      this._identityCalculated = false;
	      return this;
	    }
	    function multiply(matrix) {
	      var matrixProps = matrix.props;
	      return this.transform(matrixProps[0], matrixProps[1], matrixProps[2], matrixProps[3], matrixProps[4], matrixProps[5], matrixProps[6], matrixProps[7], matrixProps[8], matrixProps[9], matrixProps[10], matrixProps[11], matrixProps[12], matrixProps[13], matrixProps[14], matrixProps[15]);
	    }
	    function isIdentity() {
	      if (!this._identityCalculated) {
	        this._identity = !(this.props[0] !== 1 || this.props[1] !== 0 || this.props[2] !== 0 || this.props[3] !== 0 || this.props[4] !== 0 || this.props[5] !== 1 || this.props[6] !== 0 || this.props[7] !== 0 || this.props[8] !== 0 || this.props[9] !== 0 || this.props[10] !== 1 || this.props[11] !== 0 || this.props[12] !== 0 || this.props[13] !== 0 || this.props[14] !== 0 || this.props[15] !== 1);
	        this._identityCalculated = true;
	      }
	      return this._identity;
	    }
	    function equals(matr) {
	      var i = 0;
	      while (i < 16) {
	        if (matr.props[i] !== this.props[i]) {
	          return false;
	        }
	        i += 1;
	      }
	      return true;
	    }
	    function clone(matr) {
	      var i;
	      for (i = 0; i < 16; i += 1) {
	        matr.props[i] = this.props[i];
	      }
	      return matr;
	    }
	    function cloneFromProps(props) {
	      var i;
	      for (i = 0; i < 16; i += 1) {
	        this.props[i] = props[i];
	      }
	    }
	    function applyToPoint(x, y, z) {
	      return {
	        x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
	        y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
	        z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
	      };
	    }
	    function applyToX(x, y, z) {
	      return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
	    }
	    function applyToY(x, y, z) {
	      return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
	    }
	    function applyToZ(x, y, z) {
	      return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
	    }
	    function getInverseMatrix() {
	      var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
	      var a = this.props[5] / determinant;
	      var b = -this.props[1] / determinant;
	      var c = -this.props[4] / determinant;
	      var d = this.props[0] / determinant;
	      var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / determinant;
	      var f = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / determinant;
	      var inverseMatrix = new Matrix();
	      inverseMatrix.props[0] = a;
	      inverseMatrix.props[1] = b;
	      inverseMatrix.props[4] = c;
	      inverseMatrix.props[5] = d;
	      inverseMatrix.props[12] = e;
	      inverseMatrix.props[13] = f;
	      return inverseMatrix;
	    }
	    function inversePoint(pt) {
	      var inverseMatrix = this.getInverseMatrix();
	      return inverseMatrix.applyToPointArray(pt[0], pt[1], pt[2] || 0);
	    }
	    function inversePoints(pts) {
	      var i;
	      var len = pts.length;
	      var retPts = [];
	      for (i = 0; i < len; i += 1) {
	        retPts[i] = inversePoint(pts[i]);
	      }
	      return retPts;
	    }
	    function applyToTriplePoints(pt1, pt2, pt3) {
	      var arr = createTypedArray("float32", 6);
	      if (this.isIdentity()) {
	        arr[0] = pt1[0];
	        arr[1] = pt1[1];
	        arr[2] = pt2[0];
	        arr[3] = pt2[1];
	        arr[4] = pt3[0];
	        arr[5] = pt3[1];
	      } else {
	        var p0 = this.props[0];
	        var p1 = this.props[1];
	        var p4 = this.props[4];
	        var p5 = this.props[5];
	        var p12 = this.props[12];
	        var p13 = this.props[13];
	        arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
	        arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
	        arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
	        arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
	        arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
	        arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
	      }
	      return arr;
	    }
	    function applyToPointArray(x, y, z) {
	      var arr;
	      if (this.isIdentity()) {
	        arr = [x, y, z];
	      } else {
	        arr = [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12], x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13], x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
	      }
	      return arr;
	    }
	    function applyToPointStringified(x, y) {
	      if (this.isIdentity()) {
	        return x + "," + y;
	      }
	      var _p = this.props;
	      return Math.round((x * _p[0] + y * _p[4] + _p[12]) * 100) / 100 + "," + Math.round((x * _p[1] + y * _p[5] + _p[13]) * 100) / 100;
	    }
	    function toCSS() {
	      var i = 0;
	      var props = this.props;
	      var cssValue = "matrix3d(";
	      var v = 1e4;
	      while (i < 16) {
	        cssValue += _rnd(props[i] * v) / v;
	        cssValue += i === 15 ? ")" : ",";
	        i += 1;
	      }
	      return cssValue;
	    }
	    function roundMatrixProperty(val2) {
	      var v = 1e4;
	      if (val2 < 1e-6 && val2 > 0 || val2 > -1e-6 && val2 < 0) {
	        return _rnd(val2 * v) / v;
	      }
	      return val2;
	    }
	    function to2dCSS() {
	      var props = this.props;
	      var _a = roundMatrixProperty(props[0]);
	      var _b = roundMatrixProperty(props[1]);
	      var _c = roundMatrixProperty(props[4]);
	      var _d = roundMatrixProperty(props[5]);
	      var _e = roundMatrixProperty(props[12]);
	      var _f = roundMatrixProperty(props[13]);
	      return "matrix(" + _a + "," + _b + "," + _c + "," + _d + "," + _e + "," + _f + ")";
	    }
	    return function() {
	      this.reset = reset;
	      this.rotate = rotate;
	      this.rotateX = rotateX;
	      this.rotateY = rotateY;
	      this.rotateZ = rotateZ;
	      this.skew = skew;
	      this.skewFromAxis = skewFromAxis;
	      this.shear = shear;
	      this.scale = scale2;
	      this.setTransform = setTransform;
	      this.translate = translate;
	      this.transform = transform2;
	      this.multiply = multiply;
	      this.applyToPoint = applyToPoint;
	      this.applyToX = applyToX;
	      this.applyToY = applyToY;
	      this.applyToZ = applyToZ;
	      this.applyToPointArray = applyToPointArray;
	      this.applyToTriplePoints = applyToTriplePoints;
	      this.applyToPointStringified = applyToPointStringified;
	      this.toCSS = toCSS;
	      this.to2dCSS = to2dCSS;
	      this.clone = clone;
	      this.cloneFromProps = cloneFromProps;
	      this.equals = equals;
	      this.inversePoints = inversePoints;
	      this.inversePoint = inversePoint;
	      this.getInverseMatrix = getInverseMatrix;
	      this._t = this.transform;
	      this.isIdentity = isIdentity;
	      this._identity = true;
	      this._identityCalculated = false;
	      this.props = createTypedArray("float32", 16);
	      this.reset();
	    };
	  }();
	  function _typeof$3(o) {
	    "@babel/helpers - typeof";
	    return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof$3(o);
	  }
	  var lottie = {};
	  function setLocation(href) {
	    setLocationHref(href);
	  }
	  function searchAnimations() {
	    {
	      animationManager.searchAnimations();
	    }
	  }
	  function setSubframeRendering(flag) {
	    setSubframeEnabled(flag);
	  }
	  function setPrefix(prefix) {
	    setIdPrefix(prefix);
	  }
	  function loadAnimation(params) {
	    return animationManager.loadAnimation(params);
	  }
	  function setQuality(value2) {
	    if (typeof value2 === "string") {
	      switch (value2) {
	        case "high":
	          setDefaultCurveSegments(200);
	          break;
	        default:
	        case "medium":
	          setDefaultCurveSegments(50);
	          break;
	        case "low":
	          setDefaultCurveSegments(10);
	          break;
	      }
	    } else if (!isNaN(value2) && value2 > 1) {
	      setDefaultCurveSegments(value2);
	    }
	  }
	  function inBrowser() {
	    return typeof navigator !== "undefined";
	  }
	  function installPlugin(type, plugin) {
	    if (type === "expressions") {
	      setExpressionsPlugin(plugin);
	    }
	  }
	  function getFactory(name2) {
	    switch (name2) {
	      case "propertyFactory":
	        return PropertyFactory;
	      case "shapePropertyFactory":
	        return ShapePropertyFactory;
	      case "matrix":
	        return Matrix;
	      default:
	        return null;
	    }
	  }
	  lottie.play = animationManager.play;
	  lottie.pause = animationManager.pause;
	  lottie.setLocationHref = setLocation;
	  lottie.togglePause = animationManager.togglePause;
	  lottie.setSpeed = animationManager.setSpeed;
	  lottie.setDirection = animationManager.setDirection;
	  lottie.stop = animationManager.stop;
	  lottie.searchAnimations = searchAnimations;
	  lottie.registerAnimation = animationManager.registerAnimation;
	  lottie.loadAnimation = loadAnimation;
	  lottie.setSubframeRendering = setSubframeRendering;
	  lottie.resize = animationManager.resize;
	  lottie.goToAndStop = animationManager.goToAndStop;
	  lottie.destroy = animationManager.destroy;
	  lottie.setQuality = setQuality;
	  lottie.inBrowser = inBrowser;
	  lottie.installPlugin = installPlugin;
	  lottie.freeze = animationManager.freeze;
	  lottie.unfreeze = animationManager.unfreeze;
	  lottie.setVolume = animationManager.setVolume;
	  lottie.mute = animationManager.mute;
	  lottie.unmute = animationManager.unmute;
	  lottie.getRegisteredAnimations = animationManager.getRegisteredAnimations;
	  lottie.useWebWorker = setWebWorker;
	  lottie.setIDPrefix = setPrefix;
	  lottie.__getFactory = getFactory;
	  lottie.version = "5.13.0";
	  function checkReady() {
	    if (document.readyState === "complete") {
	      clearInterval(readyStateCheckInterval);
	      searchAnimations();
	    }
	  }
	  function getQueryVariable(variable) {
	    var vars = queryString.split("&");
	    for (var i = 0; i < vars.length; i += 1) {
	      var pair = vars[i].split("=");
	      if (decodeURIComponent(pair[0]) == variable) {
	        return decodeURIComponent(pair[1]);
	      }
	    }
	    return null;
	  }
	  var queryString = "";
	  {
	    var scripts = document.getElementsByTagName("script");
	    var index = scripts.length - 1;
	    var myScript = scripts[index] || {
	      src: ""
	    };
	    queryString = myScript.src ? myScript.src.replace(/^[^\?]+\??/, "") : "";
	    getQueryVariable("renderer");
	  }
	  var readyStateCheckInterval = setInterval(checkReady, 100);
	  try {
	    if (!(('object' === "undefined" ? "undefined" : _typeof$3(exports$1)) === "object" && 'object' !== "undefined") && !(typeof undefined === "function" && undefined.amd)) {
	      window.bodymovin = lottie;
	    }
	  } catch (err) {
	  }
	  var ShapeModifiers = function() {
	    var ob2 = {};
	    var modifiers = {};
	    ob2.registerModifier = registerModifier;
	    ob2.getModifier = getModifier;
	    function registerModifier(nm, factory) {
	      if (!modifiers[nm]) {
	        modifiers[nm] = factory;
	      }
	    }
	    function getModifier(nm, elem2, data2) {
	      return new modifiers[nm](elem2, data2);
	    }
	    return ob2;
	  }();
	  function ShapeModifier() {
	  }
	  ShapeModifier.prototype.initModifierProperties = function() {
	  };
	  ShapeModifier.prototype.addShapeToModifier = function() {
	  };
	  ShapeModifier.prototype.addShape = function(data2) {
	    if (!this.closed) {
	      data2.sh.container.addDynamicProperty(data2.sh);
	      var shapeData = {
	        shape: data2.sh,
	        data: data2,
	        localShapeCollection: shapeCollectionPool.newShapeCollection()
	      };
	      this.shapes.push(shapeData);
	      this.addShapeToModifier(shapeData);
	      if (this._isAnimated) {
	        data2.setAsAnimated();
	      }
	    }
	  };
	  ShapeModifier.prototype.init = function(elem2, data2) {
	    this.shapes = [];
	    this.elem = elem2;
	    this.initDynamicPropertyContainer(elem2);
	    this.initModifierProperties(elem2, data2);
	    this.frameId = initialDefaultFrame;
	    this.closed = false;
	    this.k = false;
	    if (this.dynamicProperties.length) {
	      this.k = true;
	    } else {
	      this.getValue(true);
	    }
	  };
	  ShapeModifier.prototype.processKeys = function() {
	    if (this.elem.globalData.frameId === this.frameId) {
	      return;
	    }
	    this.frameId = this.elem.globalData.frameId;
	    this.iterateDynamicProperties();
	  };
	  extendPrototype([DynamicPropertyContainer], ShapeModifier);
	  function TrimModifier() {
	  }
	  extendPrototype([ShapeModifier], TrimModifier);
	  TrimModifier.prototype.initModifierProperties = function(elem2, data2) {
	    this.s = PropertyFactory.getProp(elem2, data2.s, 0, 0.01, this);
	    this.e = PropertyFactory.getProp(elem2, data2.e, 0, 0.01, this);
	    this.o = PropertyFactory.getProp(elem2, data2.o, 0, 0, this);
	    this.sValue = 0;
	    this.eValue = 0;
	    this.getValue = this.processKeys;
	    this.m = data2.m;
	    this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
	  };
	  TrimModifier.prototype.addShapeToModifier = function(shapeData) {
	    shapeData.pathsData = [];
	  };
	  TrimModifier.prototype.calculateShapeEdges = function(s, e, shapeLength, addedLength, totalModifierLength) {
	    var segments = [];
	    if (e <= 1) {
	      segments.push({
	        s,
	        e
	      });
	    } else if (s >= 1) {
	      segments.push({
	        s: s - 1,
	        e: e - 1
	      });
	    } else {
	      segments.push({
	        s,
	        e: 1
	      });
	      segments.push({
	        s: 0,
	        e: e - 1
	      });
	    }
	    var shapeSegments = [];
	    var i;
	    var len = segments.length;
	    var segmentOb;
	    for (i = 0; i < len; i += 1) {
	      segmentOb = segments[i];
	      if (!(segmentOb.e * totalModifierLength < addedLength || segmentOb.s * totalModifierLength > addedLength + shapeLength)) {
	        var shapeS;
	        var shapeE;
	        if (segmentOb.s * totalModifierLength <= addedLength) {
	          shapeS = 0;
	        } else {
	          shapeS = (segmentOb.s * totalModifierLength - addedLength) / shapeLength;
	        }
	        if (segmentOb.e * totalModifierLength >= addedLength + shapeLength) {
	          shapeE = 1;
	        } else {
	          shapeE = (segmentOb.e * totalModifierLength - addedLength) / shapeLength;
	        }
	        shapeSegments.push([shapeS, shapeE]);
	      }
	    }
	    if (!shapeSegments.length) {
	      shapeSegments.push([0, 0]);
	    }
	    return shapeSegments;
	  };
	  TrimModifier.prototype.releasePathsData = function(pathsData) {
	    var i;
	    var len = pathsData.length;
	    for (i = 0; i < len; i += 1) {
	      segmentsLengthPool.release(pathsData[i]);
	    }
	    pathsData.length = 0;
	    return pathsData;
	  };
	  TrimModifier.prototype.processShapes = function(_isFirstFrame) {
	    var s;
	    var e;
	    if (this._mdf || _isFirstFrame) {
	      var o = this.o.v % 360 / 360;
	      if (o < 0) {
	        o += 1;
	      }
	      if (this.s.v > 1) {
	        s = 1 + o;
	      } else if (this.s.v < 0) {
	        s = 0 + o;
	      } else {
	        s = this.s.v + o;
	      }
	      if (this.e.v > 1) {
	        e = 1 + o;
	      } else if (this.e.v < 0) {
	        e = 0 + o;
	      } else {
	        e = this.e.v + o;
	      }
	      if (s > e) {
	        var _s = s;
	        s = e;
	        e = _s;
	      }
	      s = Math.round(s * 1e4) * 1e-4;
	      e = Math.round(e * 1e4) * 1e-4;
	      this.sValue = s;
	      this.eValue = e;
	    } else {
	      s = this.sValue;
	      e = this.eValue;
	    }
	    var shapePaths;
	    var i;
	    var len = this.shapes.length;
	    var j;
	    var jLen;
	    var pathsData;
	    var pathData;
	    var totalShapeLength;
	    var totalModifierLength = 0;
	    if (e === s) {
	      for (i = 0; i < len; i += 1) {
	        this.shapes[i].localShapeCollection.releaseShapes();
	        this.shapes[i].shape._mdf = true;
	        this.shapes[i].shape.paths = this.shapes[i].localShapeCollection;
	        if (this._mdf) {
	          this.shapes[i].pathsData.length = 0;
	        }
	      }
	    } else if (!(e === 1 && s === 0 || e === 0 && s === 1)) {
	      var segments = [];
	      var shapeData;
	      var localShapeCollection;
	      for (i = 0; i < len; i += 1) {
	        shapeData = this.shapes[i];
	        if (!shapeData.shape._mdf && !this._mdf && !_isFirstFrame && this.m !== 2) {
	          shapeData.shape.paths = shapeData.localShapeCollection;
	        } else {
	          shapePaths = shapeData.shape.paths;
	          jLen = shapePaths._length;
	          totalShapeLength = 0;
	          if (!shapeData.shape._mdf && shapeData.pathsData.length) {
	            totalShapeLength = shapeData.totalShapeLength;
	          } else {
	            pathsData = this.releasePathsData(shapeData.pathsData);
	            for (j = 0; j < jLen; j += 1) {
	              pathData = bez.getSegmentsLength(shapePaths.shapes[j]);
	              pathsData.push(pathData);
	              totalShapeLength += pathData.totalLength;
	            }
	            shapeData.totalShapeLength = totalShapeLength;
	            shapeData.pathsData = pathsData;
	          }
	          totalModifierLength += totalShapeLength;
	          shapeData.shape._mdf = true;
	        }
	      }
	      var shapeS = s;
	      var shapeE = e;
	      var addedLength = 0;
	      var edges;
	      for (i = len - 1; i >= 0; i -= 1) {
	        shapeData = this.shapes[i];
	        if (shapeData.shape._mdf) {
	          localShapeCollection = shapeData.localShapeCollection;
	          localShapeCollection.releaseShapes();
	          if (this.m === 2 && len > 1) {
	            edges = this.calculateShapeEdges(s, e, shapeData.totalShapeLength, addedLength, totalModifierLength);
	            addedLength += shapeData.totalShapeLength;
	          } else {
	            edges = [[shapeS, shapeE]];
	          }
	          jLen = edges.length;
	          for (j = 0; j < jLen; j += 1) {
	            shapeS = edges[j][0];
	            shapeE = edges[j][1];
	            segments.length = 0;
	            if (shapeE <= 1) {
	              segments.push({
	                s: shapeData.totalShapeLength * shapeS,
	                e: shapeData.totalShapeLength * shapeE
	              });
	            } else if (shapeS >= 1) {
	              segments.push({
	                s: shapeData.totalShapeLength * (shapeS - 1),
	                e: shapeData.totalShapeLength * (shapeE - 1)
	              });
	            } else {
	              segments.push({
	                s: shapeData.totalShapeLength * shapeS,
	                e: shapeData.totalShapeLength
	              });
	              segments.push({
	                s: 0,
	                e: shapeData.totalShapeLength * (shapeE - 1)
	              });
	            }
	            var newShapesData = this.addShapes(shapeData, segments[0]);
	            if (segments[0].s !== segments[0].e) {
	              if (segments.length > 1) {
	                var lastShapeInCollection = shapeData.shape.paths.shapes[shapeData.shape.paths._length - 1];
	                if (lastShapeInCollection.c) {
	                  var lastShape = newShapesData.pop();
	                  this.addPaths(newShapesData, localShapeCollection);
	                  newShapesData = this.addShapes(shapeData, segments[1], lastShape);
	                } else {
	                  this.addPaths(newShapesData, localShapeCollection);
	                  newShapesData = this.addShapes(shapeData, segments[1]);
	                }
	              }
	              this.addPaths(newShapesData, localShapeCollection);
	            }
	          }
	          shapeData.shape.paths = localShapeCollection;
	        }
	      }
	    } else if (this._mdf) {
	      for (i = 0; i < len; i += 1) {
	        this.shapes[i].pathsData.length = 0;
	        this.shapes[i].shape._mdf = true;
	      }
	    }
	  };
	  TrimModifier.prototype.addPaths = function(newPaths, localShapeCollection) {
	    var i;
	    var len = newPaths.length;
	    for (i = 0; i < len; i += 1) {
	      localShapeCollection.addShape(newPaths[i]);
	    }
	  };
	  TrimModifier.prototype.addSegment = function(pt1, pt2, pt3, pt4, shapePath, pos, newShape) {
	    shapePath.setXYAt(pt2[0], pt2[1], "o", pos);
	    shapePath.setXYAt(pt3[0], pt3[1], "i", pos + 1);
	    if (newShape) {
	      shapePath.setXYAt(pt1[0], pt1[1], "v", pos);
	    }
	    shapePath.setXYAt(pt4[0], pt4[1], "v", pos + 1);
	  };
	  TrimModifier.prototype.addSegmentFromArray = function(points, shapePath, pos, newShape) {
	    shapePath.setXYAt(points[1], points[5], "o", pos);
	    shapePath.setXYAt(points[2], points[6], "i", pos + 1);
	    if (newShape) {
	      shapePath.setXYAt(points[0], points[4], "v", pos);
	    }
	    shapePath.setXYAt(points[3], points[7], "v", pos + 1);
	  };
	  TrimModifier.prototype.addShapes = function(shapeData, shapeSegment, shapePath) {
	    var pathsData = shapeData.pathsData;
	    var shapePaths = shapeData.shape.paths.shapes;
	    var i;
	    var len = shapeData.shape.paths._length;
	    var j;
	    var jLen;
	    var addedLength = 0;
	    var currentLengthData;
	    var segmentCount;
	    var lengths;
	    var segment;
	    var shapes = [];
	    var initPos;
	    var newShape = true;
	    if (!shapePath) {
	      shapePath = shapePool.newElement();
	      segmentCount = 0;
	      initPos = 0;
	    } else {
	      segmentCount = shapePath._length;
	      initPos = shapePath._length;
	    }
	    shapes.push(shapePath);
	    for (i = 0; i < len; i += 1) {
	      lengths = pathsData[i].lengths;
	      shapePath.c = shapePaths[i].c;
	      jLen = shapePaths[i].c ? lengths.length : lengths.length + 1;
	      for (j = 1; j < jLen; j += 1) {
	        currentLengthData = lengths[j - 1];
	        if (addedLength + currentLengthData.addedLength < shapeSegment.s) {
	          addedLength += currentLengthData.addedLength;
	          shapePath.c = false;
	        } else if (addedLength > shapeSegment.e) {
	          shapePath.c = false;
	          break;
	        } else {
	          if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength) {
	            this.addSegment(shapePaths[i].v[j - 1], shapePaths[i].o[j - 1], shapePaths[i].i[j], shapePaths[i].v[j], shapePath, segmentCount, newShape);
	            newShape = false;
	          } else {
	            segment = bez.getNewSegment(shapePaths[i].v[j - 1], shapePaths[i].v[j], shapePaths[i].o[j - 1], shapePaths[i].i[j], (shapeSegment.s - addedLength) / currentLengthData.addedLength, (shapeSegment.e - addedLength) / currentLengthData.addedLength, lengths[j - 1]);
	            this.addSegmentFromArray(segment, shapePath, segmentCount, newShape);
	            newShape = false;
	            shapePath.c = false;
	          }
	          addedLength += currentLengthData.addedLength;
	          segmentCount += 1;
	        }
	      }
	      if (shapePaths[i].c && lengths.length) {
	        currentLengthData = lengths[j - 1];
	        if (addedLength <= shapeSegment.e) {
	          var segmentLength = lengths[j - 1].addedLength;
	          if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength) {
	            this.addSegment(shapePaths[i].v[j - 1], shapePaths[i].o[j - 1], shapePaths[i].i[0], shapePaths[i].v[0], shapePath, segmentCount, newShape);
	            newShape = false;
	          } else {
	            segment = bez.getNewSegment(shapePaths[i].v[j - 1], shapePaths[i].v[0], shapePaths[i].o[j - 1], shapePaths[i].i[0], (shapeSegment.s - addedLength) / segmentLength, (shapeSegment.e - addedLength) / segmentLength, lengths[j - 1]);
	            this.addSegmentFromArray(segment, shapePath, segmentCount, newShape);
	            newShape = false;
	            shapePath.c = false;
	          }
	        } else {
	          shapePath.c = false;
	        }
	        addedLength += currentLengthData.addedLength;
	        segmentCount += 1;
	      }
	      if (shapePath._length) {
	        shapePath.setXYAt(shapePath.v[initPos][0], shapePath.v[initPos][1], "i", initPos);
	        shapePath.setXYAt(shapePath.v[shapePath._length - 1][0], shapePath.v[shapePath._length - 1][1], "o", shapePath._length - 1);
	      }
	      if (addedLength > shapeSegment.e) {
	        break;
	      }
	      if (i < len - 1) {
	        shapePath = shapePool.newElement();
	        newShape = true;
	        shapes.push(shapePath);
	        segmentCount = 0;
	      }
	    }
	    return shapes;
	  };
	  function PuckerAndBloatModifier() {
	  }
	  extendPrototype([ShapeModifier], PuckerAndBloatModifier);
	  PuckerAndBloatModifier.prototype.initModifierProperties = function(elem2, data2) {
	    this.getValue = this.processKeys;
	    this.amount = PropertyFactory.getProp(elem2, data2.a, 0, null, this);
	    this._isAnimated = !!this.amount.effectsSequence.length;
	  };
	  PuckerAndBloatModifier.prototype.processPath = function(path, amount) {
	    var percent = amount / 100;
	    var centerPoint = [0, 0];
	    var pathLength = path._length;
	    var i = 0;
	    for (i = 0; i < pathLength; i += 1) {
	      centerPoint[0] += path.v[i][0];
	      centerPoint[1] += path.v[i][1];
	    }
	    centerPoint[0] /= pathLength;
	    centerPoint[1] /= pathLength;
	    var clonedPath = shapePool.newElement();
	    clonedPath.c = path.c;
	    var vX;
	    var vY;
	    var oX;
	    var oY;
	    var iX;
	    var iY;
	    for (i = 0; i < pathLength; i += 1) {
	      vX = path.v[i][0] + (centerPoint[0] - path.v[i][0]) * percent;
	      vY = path.v[i][1] + (centerPoint[1] - path.v[i][1]) * percent;
	      oX = path.o[i][0] + (centerPoint[0] - path.o[i][0]) * -percent;
	      oY = path.o[i][1] + (centerPoint[1] - path.o[i][1]) * -percent;
	      iX = path.i[i][0] + (centerPoint[0] - path.i[i][0]) * -percent;
	      iY = path.i[i][1] + (centerPoint[1] - path.i[i][1]) * -percent;
	      clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, i);
	    }
	    return clonedPath;
	  };
	  PuckerAndBloatModifier.prototype.processShapes = function(_isFirstFrame) {
	    var shapePaths;
	    var i;
	    var len = this.shapes.length;
	    var j;
	    var jLen;
	    var amount = this.amount.v;
	    if (amount !== 0) {
	      var shapeData;
	      var localShapeCollection;
	      for (i = 0; i < len; i += 1) {
	        shapeData = this.shapes[i];
	        localShapeCollection = shapeData.localShapeCollection;
	        if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
	          localShapeCollection.releaseShapes();
	          shapeData.shape._mdf = true;
	          shapePaths = shapeData.shape.paths.shapes;
	          jLen = shapeData.shape.paths._length;
	          for (j = 0; j < jLen; j += 1) {
	            localShapeCollection.addShape(this.processPath(shapePaths[j], amount));
	          }
	        }
	        shapeData.shape.paths = shapeData.localShapeCollection;
	      }
	    }
	    if (!this.dynamicProperties.length) {
	      this._mdf = false;
	    }
	  };
	  var TransformPropertyFactory = function() {
	    var defaultVector = [0, 0];
	    function applyToMatrix(mat) {
	      var _mdf = this._mdf;
	      this.iterateDynamicProperties();
	      this._mdf = this._mdf || _mdf;
	      if (this.a) {
	        mat.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
	      }
	      if (this.s) {
	        mat.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
	      }
	      if (this.sk) {
	        mat.skewFromAxis(-this.sk.v, this.sa.v);
	      }
	      if (this.r) {
	        mat.rotate(-this.r.v);
	      } else {
	        mat.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
	      }
	      if (this.data.p.s) {
	        if (this.data.p.z) {
	          mat.translate(this.px.v, this.py.v, -this.pz.v);
	        } else {
	          mat.translate(this.px.v, this.py.v, 0);
	        }
	      } else {
	        mat.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
	      }
	    }
	    function processKeys(forceRender) {
	      if (this.elem.globalData.frameId === this.frameId) {
	        return;
	      }
	      if (this._isDirty) {
	        this.precalculateMatrix();
	        this._isDirty = false;
	      }
	      this.iterateDynamicProperties();
	      if (this._mdf || forceRender) {
	        var frameRate;
	        this.v.cloneFromProps(this.pre.props);
	        if (this.appliedTransformations < 1) {
	          this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
	        }
	        if (this.appliedTransformations < 2) {
	          this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
	        }
	        if (this.sk && this.appliedTransformations < 3) {
	          this.v.skewFromAxis(-this.sk.v, this.sa.v);
	        }
	        if (this.r && this.appliedTransformations < 4) {
	          this.v.rotate(-this.r.v);
	        } else if (!this.r && this.appliedTransformations < 4) {
	          this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
	        }
	        if (this.autoOriented) {
	          var v1;
	          var v2;
	          frameRate = this.elem.globalData.frameRate;
	          if (this.p && this.p.keyframes && this.p.getValueAtTime) {
	            if (this.p._caching.lastFrame + this.p.offsetTime <= this.p.keyframes[0].t) {
	              v1 = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / frameRate, 0);
	              v2 = this.p.getValueAtTime(this.p.keyframes[0].t / frameRate, 0);
	            } else if (this.p._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t) {
	              v1 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / frameRate, 0);
	              v2 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / frameRate, 0);
	            } else {
	              v1 = this.p.pv;
	              v2 = this.p.getValueAtTime((this.p._caching.lastFrame + this.p.offsetTime - 0.01) / frameRate, this.p.offsetTime);
	            }
	          } else if (this.px && this.px.keyframes && this.py.keyframes && this.px.getValueAtTime && this.py.getValueAtTime) {
	            v1 = [];
	            v2 = [];
	            var px = this.px;
	            var py = this.py;
	            if (px._caching.lastFrame + px.offsetTime <= px.keyframes[0].t) {
	              v1[0] = px.getValueAtTime((px.keyframes[0].t + 0.01) / frameRate, 0);
	              v1[1] = py.getValueAtTime((py.keyframes[0].t + 0.01) / frameRate, 0);
	              v2[0] = px.getValueAtTime(px.keyframes[0].t / frameRate, 0);
	              v2[1] = py.getValueAtTime(py.keyframes[0].t / frameRate, 0);
	            } else if (px._caching.lastFrame + px.offsetTime >= px.keyframes[px.keyframes.length - 1].t) {
	              v1[0] = px.getValueAtTime(px.keyframes[px.keyframes.length - 1].t / frameRate, 0);
	              v1[1] = py.getValueAtTime(py.keyframes[py.keyframes.length - 1].t / frameRate, 0);
	              v2[0] = px.getValueAtTime((px.keyframes[px.keyframes.length - 1].t - 0.01) / frameRate, 0);
	              v2[1] = py.getValueAtTime((py.keyframes[py.keyframes.length - 1].t - 0.01) / frameRate, 0);
	            } else {
	              v1 = [px.pv, py.pv];
	              v2[0] = px.getValueAtTime((px._caching.lastFrame + px.offsetTime - 0.01) / frameRate, px.offsetTime);
	              v2[1] = py.getValueAtTime((py._caching.lastFrame + py.offsetTime - 0.01) / frameRate, py.offsetTime);
	            }
	          } else {
	            v2 = defaultVector;
	            v1 = v2;
	          }
	          this.v.rotate(-Math.atan2(v1[1] - v2[1], v1[0] - v2[0]));
	        }
	        if (this.data.p && this.data.p.s) {
	          if (this.data.p.z) {
	            this.v.translate(this.px.v, this.py.v, -this.pz.v);
	          } else {
	            this.v.translate(this.px.v, this.py.v, 0);
	          }
	        } else {
	          this.v.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
	        }
	      }
	      this.frameId = this.elem.globalData.frameId;
	    }
	    function precalculateMatrix() {
	      this.appliedTransformations = 0;
	      this.pre.reset();
	      if (!this.a.effectsSequence.length) {
	        this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
	        this.appliedTransformations = 1;
	      } else {
	        return;
	      }
	      if (!this.s.effectsSequence.length) {
	        this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
	        this.appliedTransformations = 2;
	      } else {
	        return;
	      }
	      if (this.sk) {
	        if (!this.sk.effectsSequence.length && !this.sa.effectsSequence.length) {
	          this.pre.skewFromAxis(-this.sk.v, this.sa.v);
	          this.appliedTransformations = 3;
	        } else {
	          return;
	        }
	      }
	      if (this.r) {
	        if (!this.r.effectsSequence.length) {
	          this.pre.rotate(-this.r.v);
	          this.appliedTransformations = 4;
	        }
	      } else if (!this.rz.effectsSequence.length && !this.ry.effectsSequence.length && !this.rx.effectsSequence.length && !this.or.effectsSequence.length) {
	        this.pre.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
	        this.appliedTransformations = 4;
	      }
	    }
	    function autoOrient() {
	    }
	    function addDynamicProperty(prop) {
	      this._addDynamicProperty(prop);
	      this.elem.addDynamicProperty(prop);
	      this._isDirty = true;
	    }
	    function TransformProperty(elem2, data2, container) {
	      this.elem = elem2;
	      this.frameId = -1;
	      this.propType = "transform";
	      this.data = data2;
	      this.v = new Matrix();
	      this.pre = new Matrix();
	      this.appliedTransformations = 0;
	      this.initDynamicPropertyContainer(container || elem2);
	      if (data2.p && data2.p.s) {
	        this.px = PropertyFactory.getProp(elem2, data2.p.x, 0, 0, this);
	        this.py = PropertyFactory.getProp(elem2, data2.p.y, 0, 0, this);
	        if (data2.p.z) {
	          this.pz = PropertyFactory.getProp(elem2, data2.p.z, 0, 0, this);
	        }
	      } else {
	        this.p = PropertyFactory.getProp(elem2, data2.p || {
	          k: [0, 0, 0]
	        }, 1, 0, this);
	      }
	      if (data2.rx) {
	        this.rx = PropertyFactory.getProp(elem2, data2.rx, 0, degToRads, this);
	        this.ry = PropertyFactory.getProp(elem2, data2.ry, 0, degToRads, this);
	        this.rz = PropertyFactory.getProp(elem2, data2.rz, 0, degToRads, this);
	        if (data2.or.k[0].ti) {
	          var i;
	          var len = data2.or.k.length;
	          for (i = 0; i < len; i += 1) {
	            data2.or.k[i].to = null;
	            data2.or.k[i].ti = null;
	          }
	        }
	        this.or = PropertyFactory.getProp(elem2, data2.or, 1, degToRads, this);
	        this.or.sh = true;
	      } else {
	        this.r = PropertyFactory.getProp(elem2, data2.r || {
	          k: 0
	        }, 0, degToRads, this);
	      }
	      if (data2.sk) {
	        this.sk = PropertyFactory.getProp(elem2, data2.sk, 0, degToRads, this);
	        this.sa = PropertyFactory.getProp(elem2, data2.sa, 0, degToRads, this);
	      }
	      this.a = PropertyFactory.getProp(elem2, data2.a || {
	        k: [0, 0, 0]
	      }, 1, 0, this);
	      this.s = PropertyFactory.getProp(elem2, data2.s || {
	        k: [100, 100, 100]
	      }, 1, 0.01, this);
	      if (data2.o) {
	        this.o = PropertyFactory.getProp(elem2, data2.o, 0, 0.01, elem2);
	      } else {
	        this.o = {
	          _mdf: false,
	          v: 1
	        };
	      }
	      this._isDirty = true;
	      if (!this.dynamicProperties.length) {
	        this.getValue(true);
	      }
	    }
	    TransformProperty.prototype = {
	      applyToMatrix,
	      getValue: processKeys,
	      precalculateMatrix,
	      autoOrient
	    };
	    extendPrototype([DynamicPropertyContainer], TransformProperty);
	    TransformProperty.prototype.addDynamicProperty = addDynamicProperty;
	    TransformProperty.prototype._addDynamicProperty = DynamicPropertyContainer.prototype.addDynamicProperty;
	    function getTransformProperty(elem2, data2, container) {
	      return new TransformProperty(elem2, data2, container);
	    }
	    return {
	      getTransformProperty
	    };
	  }();
	  function RepeaterModifier() {
	  }
	  extendPrototype([ShapeModifier], RepeaterModifier);
	  RepeaterModifier.prototype.initModifierProperties = function(elem2, data2) {
	    this.getValue = this.processKeys;
	    this.c = PropertyFactory.getProp(elem2, data2.c, 0, null, this);
	    this.o = PropertyFactory.getProp(elem2, data2.o, 0, null, this);
	    this.tr = TransformPropertyFactory.getTransformProperty(elem2, data2.tr, this);
	    this.so = PropertyFactory.getProp(elem2, data2.tr.so, 0, 0.01, this);
	    this.eo = PropertyFactory.getProp(elem2, data2.tr.eo, 0, 0.01, this);
	    this.data = data2;
	    if (!this.dynamicProperties.length) {
	      this.getValue(true);
	    }
	    this._isAnimated = !!this.dynamicProperties.length;
	    this.pMatrix = new Matrix();
	    this.rMatrix = new Matrix();
	    this.sMatrix = new Matrix();
	    this.tMatrix = new Matrix();
	    this.matrix = new Matrix();
	  };
	  RepeaterModifier.prototype.applyTransforms = function(pMatrix, rMatrix, sMatrix, transform2, perc, inv) {
	    var dir = inv ? -1 : 1;
	    var scaleX = transform2.s.v[0] + (1 - transform2.s.v[0]) * (1 - perc);
	    var scaleY = transform2.s.v[1] + (1 - transform2.s.v[1]) * (1 - perc);
	    pMatrix.translate(transform2.p.v[0] * dir * perc, transform2.p.v[1] * dir * perc, transform2.p.v[2]);
	    rMatrix.translate(-transform2.a.v[0], -transform2.a.v[1], transform2.a.v[2]);
	    rMatrix.rotate(-transform2.r.v * dir * perc);
	    rMatrix.translate(transform2.a.v[0], transform2.a.v[1], transform2.a.v[2]);
	    sMatrix.translate(-transform2.a.v[0], -transform2.a.v[1], transform2.a.v[2]);
	    sMatrix.scale(inv ? 1 / scaleX : scaleX, inv ? 1 / scaleY : scaleY);
	    sMatrix.translate(transform2.a.v[0], transform2.a.v[1], transform2.a.v[2]);
	  };
	  RepeaterModifier.prototype.init = function(elem2, arr, pos, elemsData) {
	    this.elem = elem2;
	    this.arr = arr;
	    this.pos = pos;
	    this.elemsData = elemsData;
	    this._currentCopies = 0;
	    this._elements = [];
	    this._groups = [];
	    this.frameId = -1;
	    this.initDynamicPropertyContainer(elem2);
	    this.initModifierProperties(elem2, arr[pos]);
	    while (pos > 0) {
	      pos -= 1;
	      this._elements.unshift(arr[pos]);
	    }
	    if (this.dynamicProperties.length) {
	      this.k = true;
	    } else {
	      this.getValue(true);
	    }
	  };
	  RepeaterModifier.prototype.resetElements = function(elements) {
	    var i;
	    var len = elements.length;
	    for (i = 0; i < len; i += 1) {
	      elements[i]._processed = false;
	      if (elements[i].ty === "gr") {
	        this.resetElements(elements[i].it);
	      }
	    }
	  };
	  RepeaterModifier.prototype.cloneElements = function(elements) {
	    var newElements = JSON.parse(JSON.stringify(elements));
	    this.resetElements(newElements);
	    return newElements;
	  };
	  RepeaterModifier.prototype.changeGroupRender = function(elements, renderFlag) {
	    var i;
	    var len = elements.length;
	    for (i = 0; i < len; i += 1) {
	      elements[i]._render = renderFlag;
	      if (elements[i].ty === "gr") {
	        this.changeGroupRender(elements[i].it, renderFlag);
	      }
	    }
	  };
	  RepeaterModifier.prototype.processShapes = function(_isFirstFrame) {
	    var items;
	    var itemsTransform;
	    var i;
	    var dir;
	    var cont;
	    var hasReloaded = false;
	    if (this._mdf || _isFirstFrame) {
	      var copies = Math.ceil(this.c.v);
	      if (this._groups.length < copies) {
	        while (this._groups.length < copies) {
	          var group = {
	            it: this.cloneElements(this._elements),
	            ty: "gr"
	          };
	          group.it.push({
	            a: {
	              a: 0,
	              ix: 1,
	              k: [0, 0]
	            },
	            nm: "Transform",
	            o: {
	              a: 0,
	              ix: 7,
	              k: 100
	            },
	            p: {
	              a: 0,
	              ix: 2,
	              k: [0, 0]
	            },
	            r: {
	              a: 1,
	              ix: 6,
	              k: [{
	                s: 0,
	                e: 0,
	                t: 0
	              }, {
	                s: 0,
	                e: 0,
	                t: 1
	              }]
	            },
	            s: {
	              a: 0,
	              ix: 3,
	              k: [100, 100]
	            },
	            sa: {
	              a: 0,
	              ix: 5,
	              k: 0
	            },
	            sk: {
	              a: 0,
	              ix: 4,
	              k: 0
	            },
	            ty: "tr"
	          });
	          this.arr.splice(0, 0, group);
	          this._groups.splice(0, 0, group);
	          this._currentCopies += 1;
	        }
	        this.elem.reloadShapes();
	        hasReloaded = true;
	      }
	      cont = 0;
	      var renderFlag;
	      for (i = 0; i <= this._groups.length - 1; i += 1) {
	        renderFlag = cont < copies;
	        this._groups[i]._render = renderFlag;
	        this.changeGroupRender(this._groups[i].it, renderFlag);
	        if (!renderFlag) {
	          var elems = this.elemsData[i].it;
	          var transformData = elems[elems.length - 1];
	          if (transformData.transform.op.v !== 0) {
	            transformData.transform.op._mdf = true;
	            transformData.transform.op.v = 0;
	          } else {
	            transformData.transform.op._mdf = false;
	          }
	        }
	        cont += 1;
	      }
	      this._currentCopies = copies;
	      var offset = this.o.v;
	      var offsetModulo = offset % 1;
	      var roundOffset = offset > 0 ? Math.floor(offset) : Math.ceil(offset);
	      var pProps = this.pMatrix.props;
	      var rProps = this.rMatrix.props;
	      var sProps = this.sMatrix.props;
	      this.pMatrix.reset();
	      this.rMatrix.reset();
	      this.sMatrix.reset();
	      this.tMatrix.reset();
	      this.matrix.reset();
	      var iteration = 0;
	      if (offset > 0) {
	        while (iteration < roundOffset) {
	          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false);
	          iteration += 1;
	        }
	        if (offsetModulo) {
	          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, offsetModulo, false);
	          iteration += offsetModulo;
	        }
	      } else if (offset < 0) {
	        while (iteration > roundOffset) {
	          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, true);
	          iteration -= 1;
	        }
	        if (offsetModulo) {
	          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -offsetModulo, true);
	          iteration -= offsetModulo;
	        }
	      }
	      i = this.data.m === 1 ? 0 : this._currentCopies - 1;
	      dir = this.data.m === 1 ? 1 : -1;
	      cont = this._currentCopies;
	      var j;
	      var jLen;
	      while (cont) {
	        items = this.elemsData[i].it;
	        itemsTransform = items[items.length - 1].transform.mProps.v.props;
	        jLen = itemsTransform.length;
	        items[items.length - 1].transform.mProps._mdf = true;
	        items[items.length - 1].transform.op._mdf = true;
	        items[items.length - 1].transform.op.v = this._currentCopies === 1 ? this.so.v : this.so.v + (this.eo.v - this.so.v) * (i / (this._currentCopies - 1));
	        if (iteration !== 0) {
	          if (i !== 0 && dir === 1 || i !== this._currentCopies - 1 && dir === -1) {
	            this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false);
	          }
	          this.matrix.transform(rProps[0], rProps[1], rProps[2], rProps[3], rProps[4], rProps[5], rProps[6], rProps[7], rProps[8], rProps[9], rProps[10], rProps[11], rProps[12], rProps[13], rProps[14], rProps[15]);
	          this.matrix.transform(sProps[0], sProps[1], sProps[2], sProps[3], sProps[4], sProps[5], sProps[6], sProps[7], sProps[8], sProps[9], sProps[10], sProps[11], sProps[12], sProps[13], sProps[14], sProps[15]);
	          this.matrix.transform(pProps[0], pProps[1], pProps[2], pProps[3], pProps[4], pProps[5], pProps[6], pProps[7], pProps[8], pProps[9], pProps[10], pProps[11], pProps[12], pProps[13], pProps[14], pProps[15]);
	          for (j = 0; j < jLen; j += 1) {
	            itemsTransform[j] = this.matrix.props[j];
	          }
	          this.matrix.reset();
	        } else {
	          this.matrix.reset();
	          for (j = 0; j < jLen; j += 1) {
	            itemsTransform[j] = this.matrix.props[j];
	          }
	        }
	        iteration += 1;
	        cont -= 1;
	        i += dir;
	      }
	    } else {
	      cont = this._currentCopies;
	      i = 0;
	      dir = 1;
	      while (cont) {
	        items = this.elemsData[i].it;
	        itemsTransform = items[items.length - 1].transform.mProps.v.props;
	        items[items.length - 1].transform.mProps._mdf = false;
	        items[items.length - 1].transform.op._mdf = false;
	        cont -= 1;
	        i += dir;
	      }
	    }
	    return hasReloaded;
	  };
	  RepeaterModifier.prototype.addShape = function() {
	  };
	  function RoundCornersModifier() {
	  }
	  extendPrototype([ShapeModifier], RoundCornersModifier);
	  RoundCornersModifier.prototype.initModifierProperties = function(elem2, data2) {
	    this.getValue = this.processKeys;
	    this.rd = PropertyFactory.getProp(elem2, data2.r, 0, null, this);
	    this._isAnimated = !!this.rd.effectsSequence.length;
	  };
	  RoundCornersModifier.prototype.processPath = function(path, round) {
	    var clonedPath = shapePool.newElement();
	    clonedPath.c = path.c;
	    var i;
	    var len = path._length;
	    var currentV;
	    var currentI;
	    var currentO;
	    var closerV;
	    var distance;
	    var newPosPerc;
	    var index2 = 0;
	    var vX;
	    var vY;
	    var oX;
	    var oY;
	    var iX;
	    var iY;
	    for (i = 0; i < len; i += 1) {
	      currentV = path.v[i];
	      currentO = path.o[i];
	      currentI = path.i[i];
	      if (currentV[0] === currentO[0] && currentV[1] === currentO[1] && currentV[0] === currentI[0] && currentV[1] === currentI[1]) {
	        if ((i === 0 || i === len - 1) && !path.c) {
	          clonedPath.setTripleAt(currentV[0], currentV[1], currentO[0], currentO[1], currentI[0], currentI[1], index2);
	          index2 += 1;
	        } else {
	          if (i === 0) {
	            closerV = path.v[len - 1];
	          } else {
	            closerV = path.v[i - 1];
	          }
	          distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
	          newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
	          iX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
	          vX = iX;
	          iY = currentV[1] - (currentV[1] - closerV[1]) * newPosPerc;
	          vY = iY;
	          oX = vX - (vX - currentV[0]) * roundCorner;
	          oY = vY - (vY - currentV[1]) * roundCorner;
	          clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, index2);
	          index2 += 1;
	          if (i === len - 1) {
	            closerV = path.v[0];
	          } else {
	            closerV = path.v[i + 1];
	          }
	          distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
	          newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
	          oX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
	          vX = oX;
	          oY = currentV[1] + (closerV[1] - currentV[1]) * newPosPerc;
	          vY = oY;
	          iX = vX - (vX - currentV[0]) * roundCorner;
	          iY = vY - (vY - currentV[1]) * roundCorner;
	          clonedPath.setTripleAt(vX, vY, oX, oY, iX, iY, index2);
	          index2 += 1;
	        }
	      } else {
	        clonedPath.setTripleAt(path.v[i][0], path.v[i][1], path.o[i][0], path.o[i][1], path.i[i][0], path.i[i][1], index2);
	        index2 += 1;
	      }
	    }
	    return clonedPath;
	  };
	  RoundCornersModifier.prototype.processShapes = function(_isFirstFrame) {
	    var shapePaths;
	    var i;
	    var len = this.shapes.length;
	    var j;
	    var jLen;
	    var rd = this.rd.v;
	    if (rd !== 0) {
	      var shapeData;
	      var localShapeCollection;
	      for (i = 0; i < len; i += 1) {
	        shapeData = this.shapes[i];
	        localShapeCollection = shapeData.localShapeCollection;
	        if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
	          localShapeCollection.releaseShapes();
	          shapeData.shape._mdf = true;
	          shapePaths = shapeData.shape.paths.shapes;
	          jLen = shapeData.shape.paths._length;
	          for (j = 0; j < jLen; j += 1) {
	            localShapeCollection.addShape(this.processPath(shapePaths[j], rd));
	          }
	        }
	        shapeData.shape.paths = shapeData.localShapeCollection;
	      }
	    }
	    if (!this.dynamicProperties.length) {
	      this._mdf = false;
	    }
	  };
	  function floatEqual(a, b) {
	    return Math.abs(a - b) * 1e5 <= Math.min(Math.abs(a), Math.abs(b));
	  }
	  function floatZero(f) {
	    return Math.abs(f) <= 1e-5;
	  }
	  function lerp(p0, p1, amount) {
	    return p0 * (1 - amount) + p1 * amount;
	  }
	  function lerpPoint(p0, p1, amount) {
	    return [lerp(p0[0], p1[0], amount), lerp(p0[1], p1[1], amount)];
	  }
	  function quadRoots(a, b, c) {
	    if (a === 0) return [];
	    var s = b * b - 4 * a * c;
	    if (s < 0) return [];
	    var singleRoot = -b / (2 * a);
	    if (s === 0) return [singleRoot];
	    var delta = Math.sqrt(s) / (2 * a);
	    return [singleRoot - delta, singleRoot + delta];
	  }
	  function polynomialCoefficients(p0, p1, p2, p3) {
	    return [-p0 + 3 * p1 - 3 * p2 + p3, 3 * p0 - 6 * p1 + 3 * p2, -3 * p0 + 3 * p1, p0];
	  }
	  function singlePoint(p) {
	    return new PolynomialBezier(p, p, p, p, false);
	  }
	  function PolynomialBezier(p0, p1, p2, p3, linearize) {
	    if (linearize && pointEqual(p0, p1)) {
	      p1 = lerpPoint(p0, p3, 1 / 3);
	    }
	    if (linearize && pointEqual(p2, p3)) {
	      p2 = lerpPoint(p0, p3, 2 / 3);
	    }
	    var coeffx = polynomialCoefficients(p0[0], p1[0], p2[0], p3[0]);
	    var coeffy = polynomialCoefficients(p0[1], p1[1], p2[1], p3[1]);
	    this.a = [coeffx[0], coeffy[0]];
	    this.b = [coeffx[1], coeffy[1]];
	    this.c = [coeffx[2], coeffy[2]];
	    this.d = [coeffx[3], coeffy[3]];
	    this.points = [p0, p1, p2, p3];
	  }
	  PolynomialBezier.prototype.point = function(t) {
	    return [((this.a[0] * t + this.b[0]) * t + this.c[0]) * t + this.d[0], ((this.a[1] * t + this.b[1]) * t + this.c[1]) * t + this.d[1]];
	  };
	  PolynomialBezier.prototype.derivative = function(t) {
	    return [(3 * t * this.a[0] + 2 * this.b[0]) * t + this.c[0], (3 * t * this.a[1] + 2 * this.b[1]) * t + this.c[1]];
	  };
	  PolynomialBezier.prototype.tangentAngle = function(t) {
	    var p = this.derivative(t);
	    return Math.atan2(p[1], p[0]);
	  };
	  PolynomialBezier.prototype.normalAngle = function(t) {
	    var p = this.derivative(t);
	    return Math.atan2(p[0], p[1]);
	  };
	  PolynomialBezier.prototype.inflectionPoints = function() {
	    var denom = this.a[1] * this.b[0] - this.a[0] * this.b[1];
	    if (floatZero(denom)) return [];
	    var tcusp = -0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1]) / denom;
	    var square = tcusp * tcusp - 1 / 3 * (this.b[1] * this.c[0] - this.b[0] * this.c[1]) / denom;
	    if (square < 0) return [];
	    var root = Math.sqrt(square);
	    if (floatZero(root)) {
	      if (root > 0 && root < 1) return [tcusp];
	      return [];
	    }
	    return [tcusp - root, tcusp + root].filter(function(r) {
	      return r > 0 && r < 1;
	    });
	  };
	  PolynomialBezier.prototype.split = function(t) {
	    if (t <= 0) return [singlePoint(this.points[0]), this];
	    if (t >= 1) return [this, singlePoint(this.points[this.points.length - 1])];
	    var p10 = lerpPoint(this.points[0], this.points[1], t);
	    var p11 = lerpPoint(this.points[1], this.points[2], t);
	    var p12 = lerpPoint(this.points[2], this.points[3], t);
	    var p20 = lerpPoint(p10, p11, t);
	    var p21 = lerpPoint(p11, p12, t);
	    var p3 = lerpPoint(p20, p21, t);
	    return [new PolynomialBezier(this.points[0], p10, p20, p3, true), new PolynomialBezier(p3, p21, p12, this.points[3], true)];
	  };
	  function extrema(bez2, comp2) {
	    var min = bez2.points[0][comp2];
	    var max = bez2.points[bez2.points.length - 1][comp2];
	    if (min > max) {
	      var e = max;
	      max = min;
	      min = e;
	    }
	    var f = quadRoots(3 * bez2.a[comp2], 2 * bez2.b[comp2], bez2.c[comp2]);
	    for (var i = 0; i < f.length; i += 1) {
	      if (f[i] > 0 && f[i] < 1) {
	        var val2 = bez2.point(f[i])[comp2];
	        if (val2 < min) min = val2;
	        else if (val2 > max) max = val2;
	      }
	    }
	    return {
	      min,
	      max
	    };
	  }
	  PolynomialBezier.prototype.bounds = function() {
	    return {
	      x: extrema(this, 0),
	      y: extrema(this, 1)
	    };
	  };
	  PolynomialBezier.prototype.boundingBox = function() {
	    var bounds = this.bounds();
	    return {
	      left: bounds.x.min,
	      right: bounds.x.max,
	      top: bounds.y.min,
	      bottom: bounds.y.max,
	      width: bounds.x.max - bounds.x.min,
	      height: bounds.y.max - bounds.y.min,
	      cx: (bounds.x.max + bounds.x.min) / 2,
	      cy: (bounds.y.max + bounds.y.min) / 2
	    };
	  };
	  function intersectData(bez2, t1, t2) {
	    var box = bez2.boundingBox();
	    return {
	      cx: box.cx,
	      cy: box.cy,
	      width: box.width,
	      height: box.height,
	      bez: bez2,
	      t: (t1 + t2) / 2,
	      t1,
	      t2
	    };
	  }
	  function splitData(data2) {
	    var split = data2.bez.split(0.5);
	    return [intersectData(split[0], data2.t1, data2.t), intersectData(split[1], data2.t, data2.t2)];
	  }
	  function boxIntersect(b1, b2) {
	    return Math.abs(b1.cx - b2.cx) * 2 < b1.width + b2.width && Math.abs(b1.cy - b2.cy) * 2 < b1.height + b2.height;
	  }
	  function intersectsImpl(d1, d2, depth, tolerance, intersections, maxRecursion) {
	    if (!boxIntersect(d1, d2)) return;
	    if (depth >= maxRecursion || d1.width <= tolerance && d1.height <= tolerance && d2.width <= tolerance && d2.height <= tolerance) {
	      intersections.push([d1.t, d2.t]);
	      return;
	    }
	    var d1s = splitData(d1);
	    var d2s = splitData(d2);
	    intersectsImpl(d1s[0], d2s[0], depth + 1, tolerance, intersections, maxRecursion);
	    intersectsImpl(d1s[0], d2s[1], depth + 1, tolerance, intersections, maxRecursion);
	    intersectsImpl(d1s[1], d2s[0], depth + 1, tolerance, intersections, maxRecursion);
	    intersectsImpl(d1s[1], d2s[1], depth + 1, tolerance, intersections, maxRecursion);
	  }
	  PolynomialBezier.prototype.intersections = function(other, tolerance, maxRecursion) {
	    if (tolerance === void 0) tolerance = 2;
	    if (maxRecursion === void 0) maxRecursion = 7;
	    var intersections = [];
	    intersectsImpl(intersectData(this, 0, 1), intersectData(other, 0, 1), 0, tolerance, intersections, maxRecursion);
	    return intersections;
	  };
	  PolynomialBezier.shapeSegment = function(shapePath, index2) {
	    var nextIndex = (index2 + 1) % shapePath.length();
	    return new PolynomialBezier(shapePath.v[index2], shapePath.o[index2], shapePath.i[nextIndex], shapePath.v[nextIndex], true);
	  };
	  PolynomialBezier.shapeSegmentInverted = function(shapePath, index2) {
	    var nextIndex = (index2 + 1) % shapePath.length();
	    return new PolynomialBezier(shapePath.v[nextIndex], shapePath.i[nextIndex], shapePath.o[index2], shapePath.v[index2], true);
	  };
	  function crossProduct(a, b) {
	    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	  }
	  function lineIntersection(start1, end1, start2, end2) {
	    var v1 = [start1[0], start1[1], 1];
	    var v2 = [end1[0], end1[1], 1];
	    var v3 = [start2[0], start2[1], 1];
	    var v4 = [end2[0], end2[1], 1];
	    var r = crossProduct(crossProduct(v1, v2), crossProduct(v3, v4));
	    if (floatZero(r[2])) return null;
	    return [r[0] / r[2], r[1] / r[2]];
	  }
	  function polarOffset(p, angle, length2) {
	    return [p[0] + Math.cos(angle) * length2, p[1] - Math.sin(angle) * length2];
	  }
	  function pointDistance(p1, p2) {
	    return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
	  }
	  function pointEqual(p1, p2) {
	    return floatEqual(p1[0], p2[0]) && floatEqual(p1[1], p2[1]);
	  }
	  function ZigZagModifier() {
	  }
	  extendPrototype([ShapeModifier], ZigZagModifier);
	  ZigZagModifier.prototype.initModifierProperties = function(elem2, data2) {
	    this.getValue = this.processKeys;
	    this.amplitude = PropertyFactory.getProp(elem2, data2.s, 0, null, this);
	    this.frequency = PropertyFactory.getProp(elem2, data2.r, 0, null, this);
	    this.pointsType = PropertyFactory.getProp(elem2, data2.pt, 0, null, this);
	    this._isAnimated = this.amplitude.effectsSequence.length !== 0 || this.frequency.effectsSequence.length !== 0 || this.pointsType.effectsSequence.length !== 0;
	  };
	  function setPoint(outputBezier, point, angle, direction, amplitude, outAmplitude, inAmplitude) {
	    var angO = angle - Math.PI / 2;
	    var angI = angle + Math.PI / 2;
	    var px = point[0] + Math.cos(angle) * direction * amplitude;
	    var py = point[1] - Math.sin(angle) * direction * amplitude;
	    outputBezier.setTripleAt(px, py, px + Math.cos(angO) * outAmplitude, py - Math.sin(angO) * outAmplitude, px + Math.cos(angI) * inAmplitude, py - Math.sin(angI) * inAmplitude, outputBezier.length());
	  }
	  function getPerpendicularVector(pt1, pt2) {
	    var vector = [pt2[0] - pt1[0], pt2[1] - pt1[1]];
	    var rot = -Math.PI * 0.5;
	    var rotatedVector = [Math.cos(rot) * vector[0] - Math.sin(rot) * vector[1], Math.sin(rot) * vector[0] + Math.cos(rot) * vector[1]];
	    return rotatedVector;
	  }
	  function getProjectingAngle(path, cur) {
	    var prevIndex = cur === 0 ? path.length() - 1 : cur - 1;
	    var nextIndex = (cur + 1) % path.length();
	    var prevPoint = path.v[prevIndex];
	    var nextPoint = path.v[nextIndex];
	    var pVector = getPerpendicularVector(prevPoint, nextPoint);
	    return Math.atan2(0, 1) - Math.atan2(pVector[1], pVector[0]);
	  }
	  function zigZagCorner(outputBezier, path, cur, amplitude, frequency, pointType, direction) {
	    var angle = getProjectingAngle(path, cur);
	    var point = path.v[cur % path._length];
	    var prevPoint = path.v[cur === 0 ? path._length - 1 : cur - 1];
	    var nextPoint = path.v[(cur + 1) % path._length];
	    var prevDist = pointType === 2 ? Math.sqrt(Math.pow(point[0] - prevPoint[0], 2) + Math.pow(point[1] - prevPoint[1], 2)) : 0;
	    var nextDist = pointType === 2 ? Math.sqrt(Math.pow(point[0] - nextPoint[0], 2) + Math.pow(point[1] - nextPoint[1], 2)) : 0;
	    setPoint(outputBezier, path.v[cur % path._length], angle, direction, amplitude, nextDist / ((frequency + 1) * 2), prevDist / ((frequency + 1) * 2));
	  }
	  function zigZagSegment(outputBezier, segment, amplitude, frequency, pointType, direction) {
	    for (var i = 0; i < frequency; i += 1) {
	      var t = (i + 1) / (frequency + 1);
	      var dist = pointType === 2 ? Math.sqrt(Math.pow(segment.points[3][0] - segment.points[0][0], 2) + Math.pow(segment.points[3][1] - segment.points[0][1], 2)) : 0;
	      var angle = segment.normalAngle(t);
	      var point = segment.point(t);
	      setPoint(outputBezier, point, angle, direction, amplitude, dist / ((frequency + 1) * 2), dist / ((frequency + 1) * 2));
	      direction = -direction;
	    }
	    return direction;
	  }
	  ZigZagModifier.prototype.processPath = function(path, amplitude, frequency, pointType) {
	    var count = path._length;
	    var clonedPath = shapePool.newElement();
	    clonedPath.c = path.c;
	    if (!path.c) {
	      count -= 1;
	    }
	    if (count === 0) return clonedPath;
	    var direction = -1;
	    var segment = PolynomialBezier.shapeSegment(path, 0);
	    zigZagCorner(clonedPath, path, 0, amplitude, frequency, pointType, direction);
	    for (var i = 0; i < count; i += 1) {
	      direction = zigZagSegment(clonedPath, segment, amplitude, frequency, pointType, -direction);
	      if (i === count - 1 && !path.c) {
	        segment = null;
	      } else {
	        segment = PolynomialBezier.shapeSegment(path, (i + 1) % count);
	      }
	      zigZagCorner(clonedPath, path, i + 1, amplitude, frequency, pointType, direction);
	    }
	    return clonedPath;
	  };
	  ZigZagModifier.prototype.processShapes = function(_isFirstFrame) {
	    var shapePaths;
	    var i;
	    var len = this.shapes.length;
	    var j;
	    var jLen;
	    var amplitude = this.amplitude.v;
	    var frequency = Math.max(0, Math.round(this.frequency.v));
	    var pointType = this.pointsType.v;
	    if (amplitude !== 0) {
	      var shapeData;
	      var localShapeCollection;
	      for (i = 0; i < len; i += 1) {
	        shapeData = this.shapes[i];
	        localShapeCollection = shapeData.localShapeCollection;
	        if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
	          localShapeCollection.releaseShapes();
	          shapeData.shape._mdf = true;
	          shapePaths = shapeData.shape.paths.shapes;
	          jLen = shapeData.shape.paths._length;
	          for (j = 0; j < jLen; j += 1) {
	            localShapeCollection.addShape(this.processPath(shapePaths[j], amplitude, frequency, pointType));
	          }
	        }
	        shapeData.shape.paths = shapeData.localShapeCollection;
	      }
	    }
	    if (!this.dynamicProperties.length) {
	      this._mdf = false;
	    }
	  };
	  function linearOffset(p1, p2, amount) {
	    var angle = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]);
	    return [polarOffset(p1, angle, amount), polarOffset(p2, angle, amount)];
	  }
	  function offsetSegment(segment, amount) {
	    var p0;
	    var p1a;
	    var p1b;
	    var p2b;
	    var p2a;
	    var p3;
	    var e;
	    e = linearOffset(segment.points[0], segment.points[1], amount);
	    p0 = e[0];
	    p1a = e[1];
	    e = linearOffset(segment.points[1], segment.points[2], amount);
	    p1b = e[0];
	    p2b = e[1];
	    e = linearOffset(segment.points[2], segment.points[3], amount);
	    p2a = e[0];
	    p3 = e[1];
	    var p1 = lineIntersection(p0, p1a, p1b, p2b);
	    if (p1 === null) p1 = p1a;
	    var p2 = lineIntersection(p2a, p3, p1b, p2b);
	    if (p2 === null) p2 = p2a;
	    return new PolynomialBezier(p0, p1, p2, p3);
	  }
	  function joinLines(outputBezier, seg1, seg2, lineJoin, miterLimit) {
	    var p0 = seg1.points[3];
	    var p1 = seg2.points[0];
	    if (lineJoin === 3) return p0;
	    if (pointEqual(p0, p1)) return p0;
	    if (lineJoin === 2) {
	      var angleOut = -seg1.tangentAngle(1);
	      var angleIn = -seg2.tangentAngle(0) + Math.PI;
	      var center = lineIntersection(p0, polarOffset(p0, angleOut + Math.PI / 2, 100), p1, polarOffset(p1, angleOut + Math.PI / 2, 100));
	      var radius = center ? pointDistance(center, p0) : pointDistance(p0, p1) / 2;
	      var tan = polarOffset(p0, angleOut, 2 * radius * roundCorner);
	      outputBezier.setXYAt(tan[0], tan[1], "o", outputBezier.length() - 1);
	      tan = polarOffset(p1, angleIn, 2 * radius * roundCorner);
	      outputBezier.setTripleAt(p1[0], p1[1], p1[0], p1[1], tan[0], tan[1], outputBezier.length());
	      return p1;
	    }
	    var t0 = pointEqual(p0, seg1.points[2]) ? seg1.points[0] : seg1.points[2];
	    var t1 = pointEqual(p1, seg2.points[1]) ? seg2.points[3] : seg2.points[1];
	    var intersection = lineIntersection(t0, p0, p1, t1);
	    if (intersection && pointDistance(intersection, p0) < miterLimit) {
	      outputBezier.setTripleAt(intersection[0], intersection[1], intersection[0], intersection[1], intersection[0], intersection[1], outputBezier.length());
	      return intersection;
	    }
	    return p0;
	  }
	  function getIntersection(a, b) {
	    var intersect = a.intersections(b);
	    if (intersect.length && floatEqual(intersect[0][0], 1)) intersect.shift();
	    if (intersect.length) return intersect[0];
	    return null;
	  }
	  function pruneSegmentIntersection(a, b) {
	    var outa = a.slice();
	    var outb = b.slice();
	    var intersect = getIntersection(a[a.length - 1], b[0]);
	    if (intersect) {
	      outa[a.length - 1] = a[a.length - 1].split(intersect[0])[0];
	      outb[0] = b[0].split(intersect[1])[1];
	    }
	    if (a.length > 1 && b.length > 1) {
	      intersect = getIntersection(a[0], b[b.length - 1]);
	      if (intersect) {
	        return [[a[0].split(intersect[0])[0]], [b[b.length - 1].split(intersect[1])[1]]];
	      }
	    }
	    return [outa, outb];
	  }
	  function pruneIntersections(segments) {
	    var e;
	    for (var i = 1; i < segments.length; i += 1) {
	      e = pruneSegmentIntersection(segments[i - 1], segments[i]);
	      segments[i - 1] = e[0];
	      segments[i] = e[1];
	    }
	    if (segments.length > 1) {
	      e = pruneSegmentIntersection(segments[segments.length - 1], segments[0]);
	      segments[segments.length - 1] = e[0];
	      segments[0] = e[1];
	    }
	    return segments;
	  }
	  function offsetSegmentSplit(segment, amount) {
	    var flex = segment.inflectionPoints();
	    var left;
	    var right;
	    var split;
	    var mid;
	    if (flex.length === 0) {
	      return [offsetSegment(segment, amount)];
	    }
	    if (flex.length === 1 || floatEqual(flex[1], 1)) {
	      split = segment.split(flex[0]);
	      left = split[0];
	      right = split[1];
	      return [offsetSegment(left, amount), offsetSegment(right, amount)];
	    }
	    split = segment.split(flex[0]);
	    left = split[0];
	    var t = (flex[1] - flex[0]) / (1 - flex[0]);
	    split = split[1].split(t);
	    mid = split[0];
	    right = split[1];
	    return [offsetSegment(left, amount), offsetSegment(mid, amount), offsetSegment(right, amount)];
	  }
	  function OffsetPathModifier() {
	  }
	  extendPrototype([ShapeModifier], OffsetPathModifier);
	  OffsetPathModifier.prototype.initModifierProperties = function(elem2, data2) {
	    this.getValue = this.processKeys;
	    this.amount = PropertyFactory.getProp(elem2, data2.a, 0, null, this);
	    this.miterLimit = PropertyFactory.getProp(elem2, data2.ml, 0, null, this);
	    this.lineJoin = data2.lj;
	    this._isAnimated = this.amount.effectsSequence.length !== 0;
	  };
	  OffsetPathModifier.prototype.processPath = function(inputBezier, amount, lineJoin, miterLimit) {
	    var outputBezier = shapePool.newElement();
	    outputBezier.c = inputBezier.c;
	    var count = inputBezier.length();
	    if (!inputBezier.c) {
	      count -= 1;
	    }
	    var i;
	    var j;
	    var segment;
	    var multiSegments = [];
	    for (i = 0; i < count; i += 1) {
	      segment = PolynomialBezier.shapeSegment(inputBezier, i);
	      multiSegments.push(offsetSegmentSplit(segment, amount));
	    }
	    if (!inputBezier.c) {
	      for (i = count - 1; i >= 0; i -= 1) {
	        segment = PolynomialBezier.shapeSegmentInverted(inputBezier, i);
	        multiSegments.push(offsetSegmentSplit(segment, amount));
	      }
	    }
	    multiSegments = pruneIntersections(multiSegments);
	    var lastPoint = null;
	    var lastSeg = null;
	    for (i = 0; i < multiSegments.length; i += 1) {
	      var multiSegment = multiSegments[i];
	      if (lastSeg) lastPoint = joinLines(outputBezier, lastSeg, multiSegment[0], lineJoin, miterLimit);
	      lastSeg = multiSegment[multiSegment.length - 1];
	      for (j = 0; j < multiSegment.length; j += 1) {
	        segment = multiSegment[j];
	        if (lastPoint && pointEqual(segment.points[0], lastPoint)) {
	          outputBezier.setXYAt(segment.points[1][0], segment.points[1][1], "o", outputBezier.length() - 1);
	        } else {
	          outputBezier.setTripleAt(segment.points[0][0], segment.points[0][1], segment.points[1][0], segment.points[1][1], segment.points[0][0], segment.points[0][1], outputBezier.length());
	        }
	        outputBezier.setTripleAt(segment.points[3][0], segment.points[3][1], segment.points[3][0], segment.points[3][1], segment.points[2][0], segment.points[2][1], outputBezier.length());
	        lastPoint = segment.points[3];
	      }
	    }
	    if (multiSegments.length) joinLines(outputBezier, lastSeg, multiSegments[0][0], lineJoin, miterLimit);
	    return outputBezier;
	  };
	  OffsetPathModifier.prototype.processShapes = function(_isFirstFrame) {
	    var shapePaths;
	    var i;
	    var len = this.shapes.length;
	    var j;
	    var jLen;
	    var amount = this.amount.v;
	    var miterLimit = this.miterLimit.v;
	    var lineJoin = this.lineJoin;
	    if (amount !== 0) {
	      var shapeData;
	      var localShapeCollection;
	      for (i = 0; i < len; i += 1) {
	        shapeData = this.shapes[i];
	        localShapeCollection = shapeData.localShapeCollection;
	        if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
	          localShapeCollection.releaseShapes();
	          shapeData.shape._mdf = true;
	          shapePaths = shapeData.shape.paths.shapes;
	          jLen = shapeData.shape.paths._length;
	          for (j = 0; j < jLen; j += 1) {
	            localShapeCollection.addShape(this.processPath(shapePaths[j], amount, lineJoin, miterLimit));
	          }
	        }
	        shapeData.shape.paths = shapeData.localShapeCollection;
	      }
	    }
	    if (!this.dynamicProperties.length) {
	      this._mdf = false;
	    }
	  };
	  function getFontProperties(fontData) {
	    var styles = fontData.fStyle ? fontData.fStyle.split(" ") : [];
	    var fWeight = "normal";
	    var fStyle = "normal";
	    var len = styles.length;
	    var styleName;
	    for (var i = 0; i < len; i += 1) {
	      styleName = styles[i].toLowerCase();
	      switch (styleName) {
	        case "italic":
	          fStyle = "italic";
	          break;
	        case "bold":
	          fWeight = "700";
	          break;
	        case "black":
	          fWeight = "900";
	          break;
	        case "medium":
	          fWeight = "500";
	          break;
	        case "regular":
	        case "normal":
	          fWeight = "400";
	          break;
	        case "light":
	        case "thin":
	          fWeight = "200";
	          break;
	      }
	    }
	    return {
	      style: fStyle,
	      weight: fontData.fWeight || fWeight
	    };
	  }
	  var FontManager = function() {
	    var maxWaitingTime = 5e3;
	    var emptyChar = {
	      w: 0,
	      size: 0,
	      shapes: [],
	      data: {
	        shapes: []
	      }
	    };
	    var combinedCharacters = [];
	    combinedCharacters = combinedCharacters.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);
	    var BLACK_FLAG_CODE_POINT = 127988;
	    var CANCEL_TAG_CODE_POINT = 917631;
	    var A_TAG_CODE_POINT = 917601;
	    var Z_TAG_CODE_POINT = 917626;
	    var VARIATION_SELECTOR_16_CODE_POINT = 65039;
	    var ZERO_WIDTH_JOINER_CODE_POINT = 8205;
	    var REGIONAL_CHARACTER_A_CODE_POINT = 127462;
	    var REGIONAL_CHARACTER_Z_CODE_POINT = 127487;
	    var surrogateModifiers = ["d83cdffb", "d83cdffc", "d83cdffd", "d83cdffe", "d83cdfff"];
	    function trimFontOptions(font) {
	      var familyArray = font.split(",");
	      var i;
	      var len = familyArray.length;
	      var enabledFamilies = [];
	      for (i = 0; i < len; i += 1) {
	        if (familyArray[i] !== "sans-serif" && familyArray[i] !== "monospace") {
	          enabledFamilies.push(familyArray[i]);
	        }
	      }
	      return enabledFamilies.join(",");
	    }
	    function setUpNode(font, family) {
	      var parentNode = createTag("span");
	      parentNode.setAttribute("aria-hidden", true);
	      parentNode.style.fontFamily = family;
	      var node = createTag("span");
	      node.innerText = "giItT1WQy@!-/#";
	      parentNode.style.position = "absolute";
	      parentNode.style.left = "-10000px";
	      parentNode.style.top = "-10000px";
	      parentNode.style.fontSize = "300px";
	      parentNode.style.fontVariant = "normal";
	      parentNode.style.fontStyle = "normal";
	      parentNode.style.fontWeight = "normal";
	      parentNode.style.letterSpacing = "0";
	      parentNode.appendChild(node);
	      document.body.appendChild(parentNode);
	      var width2 = node.offsetWidth;
	      node.style.fontFamily = trimFontOptions(font) + ", " + family;
	      return {
	        node,
	        w: width2,
	        parent: parentNode
	      };
	    }
	    function checkLoadedFonts() {
	      var i;
	      var len = this.fonts.length;
	      var node;
	      var w;
	      var loadedCount = len;
	      for (i = 0; i < len; i += 1) {
	        if (this.fonts[i].loaded) {
	          loadedCount -= 1;
	        } else if (this.fonts[i].fOrigin === "n" || this.fonts[i].origin === 0) {
	          this.fonts[i].loaded = true;
	        } else {
	          node = this.fonts[i].monoCase.node;
	          w = this.fonts[i].monoCase.w;
	          if (node.offsetWidth !== w) {
	            loadedCount -= 1;
	            this.fonts[i].loaded = true;
	          } else {
	            node = this.fonts[i].sansCase.node;
	            w = this.fonts[i].sansCase.w;
	            if (node.offsetWidth !== w) {
	              loadedCount -= 1;
	              this.fonts[i].loaded = true;
	            }
	          }
	          if (this.fonts[i].loaded) {
	            this.fonts[i].sansCase.parent.parentNode.removeChild(this.fonts[i].sansCase.parent);
	            this.fonts[i].monoCase.parent.parentNode.removeChild(this.fonts[i].monoCase.parent);
	          }
	        }
	      }
	      if (loadedCount !== 0 && Date.now() - this.initTime < maxWaitingTime) {
	        setTimeout(this.checkLoadedFontsBinded, 20);
	      } else {
	        setTimeout(this.setIsLoadedBinded, 10);
	      }
	    }
	    function createHelper(fontData, def) {
	      var engine = document.body && def ? "svg" : "canvas";
	      var helper;
	      var fontProps = getFontProperties(fontData);
	      if (engine === "svg") {
	        var tHelper = createNS("text");
	        tHelper.style.fontSize = "100px";
	        tHelper.setAttribute("font-family", fontData.fFamily);
	        tHelper.setAttribute("font-style", fontProps.style);
	        tHelper.setAttribute("font-weight", fontProps.weight);
	        tHelper.textContent = "1";
	        if (fontData.fClass) {
	          tHelper.style.fontFamily = "inherit";
	          tHelper.setAttribute("class", fontData.fClass);
	        } else {
	          tHelper.style.fontFamily = fontData.fFamily;
	        }
	        def.appendChild(tHelper);
	        helper = tHelper;
	      } else {
	        var tCanvasHelper = new OffscreenCanvas(500, 500).getContext("2d");
	        tCanvasHelper.font = fontProps.style + " " + fontProps.weight + " 100px " + fontData.fFamily;
	        helper = tCanvasHelper;
	      }
	      function measure(text2) {
	        if (engine === "svg") {
	          helper.textContent = text2;
	          return helper.getComputedTextLength();
	        }
	        return helper.measureText(text2).width;
	      }
	      return {
	        measureText: measure
	      };
	    }
	    function addFonts(fontData, defs) {
	      if (!fontData) {
	        this.isLoaded = true;
	        return;
	      }
	      if (this.chars) {
	        this.isLoaded = true;
	        this.fonts = fontData.list;
	        return;
	      }
	      if (!document.body) {
	        this.isLoaded = true;
	        fontData.list.forEach(function(data2) {
	          data2.helper = createHelper(data2);
	          data2.cache = {};
	        });
	        this.fonts = fontData.list;
	        return;
	      }
	      var fontArr = fontData.list;
	      var i;
	      var len = fontArr.length;
	      var _pendingFonts = len;
	      for (i = 0; i < len; i += 1) {
	        var shouldLoadFont = true;
	        var loadedSelector;
	        var j;
	        fontArr[i].loaded = false;
	        fontArr[i].monoCase = setUpNode(fontArr[i].fFamily, "monospace");
	        fontArr[i].sansCase = setUpNode(fontArr[i].fFamily, "sans-serif");
	        if (!fontArr[i].fPath) {
	          fontArr[i].loaded = true;
	          _pendingFonts -= 1;
	        } else if (fontArr[i].fOrigin === "p" || fontArr[i].origin === 3) {
	          loadedSelector = document.querySelectorAll('style[f-forigin="p"][f-family="' + fontArr[i].fFamily + '"], style[f-origin="3"][f-family="' + fontArr[i].fFamily + '"]');
	          if (loadedSelector.length > 0) {
	            shouldLoadFont = false;
	          }
	          if (shouldLoadFont) {
	            var s = createTag("style");
	            s.setAttribute("f-forigin", fontArr[i].fOrigin);
	            s.setAttribute("f-origin", fontArr[i].origin);
	            s.setAttribute("f-family", fontArr[i].fFamily);
	            s.type = "text/css";
	            s.innerText = "@font-face {font-family: " + fontArr[i].fFamily + "; font-style: normal; src: url('" + fontArr[i].fPath + "');}";
	            defs.appendChild(s);
	          }
	        } else if (fontArr[i].fOrigin === "g" || fontArr[i].origin === 1) {
	          loadedSelector = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]');
	          for (j = 0; j < loadedSelector.length; j += 1) {
	            if (loadedSelector[j].href.indexOf(fontArr[i].fPath) !== -1) {
	              shouldLoadFont = false;
	            }
	          }
	          if (shouldLoadFont) {
	            var l = createTag("link");
	            l.setAttribute("f-forigin", fontArr[i].fOrigin);
	            l.setAttribute("f-origin", fontArr[i].origin);
	            l.type = "text/css";
	            l.rel = "stylesheet";
	            l.href = fontArr[i].fPath;
	            document.body.appendChild(l);
	          }
	        } else if (fontArr[i].fOrigin === "t" || fontArr[i].origin === 2) {
	          loadedSelector = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]');
	          for (j = 0; j < loadedSelector.length; j += 1) {
	            if (fontArr[i].fPath === loadedSelector[j].src) {
	              shouldLoadFont = false;
	            }
	          }
	          if (shouldLoadFont) {
	            var sc = createTag("link");
	            sc.setAttribute("f-forigin", fontArr[i].fOrigin);
	            sc.setAttribute("f-origin", fontArr[i].origin);
	            sc.setAttribute("rel", "stylesheet");
	            sc.setAttribute("href", fontArr[i].fPath);
	            defs.appendChild(sc);
	          }
	        }
	        fontArr[i].helper = createHelper(fontArr[i], defs);
	        fontArr[i].cache = {};
	        this.fonts.push(fontArr[i]);
	      }
	      if (_pendingFonts === 0) {
	        this.isLoaded = true;
	      } else {
	        setTimeout(this.checkLoadedFonts.bind(this), 100);
	      }
	    }
	    function addChars(chars) {
	      if (!chars) {
	        return;
	      }
	      if (!this.chars) {
	        this.chars = [];
	      }
	      var i;
	      var len = chars.length;
	      var j;
	      var jLen = this.chars.length;
	      var found;
	      for (i = 0; i < len; i += 1) {
	        j = 0;
	        found = false;
	        while (j < jLen) {
	          if (this.chars[j].style === chars[i].style && this.chars[j].fFamily === chars[i].fFamily && this.chars[j].ch === chars[i].ch) {
	            found = true;
	          }
	          j += 1;
	        }
	        if (!found) {
	          this.chars.push(chars[i]);
	          jLen += 1;
	        }
	      }
	    }
	    function getCharData(_char, style, font) {
	      var i = 0;
	      var len = this.chars.length;
	      while (i < len) {
	        if (this.chars[i].ch === _char && this.chars[i].style === style && this.chars[i].fFamily === font) {
	          return this.chars[i];
	        }
	        i += 1;
	      }
	      if ((typeof _char === "string" && _char.charCodeAt(0) !== 13 || !_char) && console && console.warn && !this._warned) {
	        this._warned = true;
	        console.warn("Missing character from exported characters list: ", _char, style, font);
	      }
	      return emptyChar;
	    }
	    function measureText(_char2, fontName, size) {
	      var fontData = this.getFontByName(fontName);
	      var index2 = _char2;
	      if (!fontData.cache[index2]) {
	        var tHelper = fontData.helper;
	        if (_char2 === " ") {
	          var doubleSize = tHelper.measureText("|" + _char2 + "|");
	          var singleSize = tHelper.measureText("||");
	          fontData.cache[index2] = (doubleSize - singleSize) / 100;
	        } else {
	          fontData.cache[index2] = tHelper.measureText(_char2) / 100;
	        }
	      }
	      return fontData.cache[index2] * size;
	    }
	    function getFontByName(name2) {
	      var i = 0;
	      var len = this.fonts.length;
	      while (i < len) {
	        if (this.fonts[i].fName === name2) {
	          return this.fonts[i];
	        }
	        i += 1;
	      }
	      return this.fonts[0];
	    }
	    function getCodePoint(string) {
	      var codePoint = 0;
	      var first = string.charCodeAt(0);
	      if (first >= 55296 && first <= 56319) {
	        var second = string.charCodeAt(1);
	        if (second >= 56320 && second <= 57343) {
	          codePoint = (first - 55296) * 1024 + second - 56320 + 65536;
	        }
	      }
	      return codePoint;
	    }
	    function isModifier(firstCharCode, secondCharCode) {
	      var sum2 = firstCharCode.toString(16) + secondCharCode.toString(16);
	      return surrogateModifiers.indexOf(sum2) !== -1;
	    }
	    function isZeroWidthJoiner(charCode) {
	      return charCode === ZERO_WIDTH_JOINER_CODE_POINT;
	    }
	    function isVariationSelector(charCode) {
	      return charCode === VARIATION_SELECTOR_16_CODE_POINT;
	    }
	    function isRegionalCode(string) {
	      var codePoint = getCodePoint(string);
	      if (codePoint >= REGIONAL_CHARACTER_A_CODE_POINT && codePoint <= REGIONAL_CHARACTER_Z_CODE_POINT) {
	        return true;
	      }
	      return false;
	    }
	    function isFlagEmoji(string) {
	      return isRegionalCode(string.substr(0, 2)) && isRegionalCode(string.substr(2, 2));
	    }
	    function isCombinedCharacter(_char3) {
	      return combinedCharacters.indexOf(_char3) !== -1;
	    }
	    function isRegionalFlag(text2, index2) {
	      var codePoint = getCodePoint(text2.substr(index2, 2));
	      if (codePoint !== BLACK_FLAG_CODE_POINT) {
	        return false;
	      }
	      var count = 0;
	      index2 += 2;
	      while (count < 5) {
	        codePoint = getCodePoint(text2.substr(index2, 2));
	        if (codePoint < A_TAG_CODE_POINT || codePoint > Z_TAG_CODE_POINT) {
	          return false;
	        }
	        count += 1;
	        index2 += 2;
	      }
	      return getCodePoint(text2.substr(index2, 2)) === CANCEL_TAG_CODE_POINT;
	    }
	    function setIsLoaded() {
	      this.isLoaded = true;
	    }
	    var Font = function Font2() {
	      this.fonts = [];
	      this.chars = null;
	      this.typekitLoaded = 0;
	      this.isLoaded = false;
	      this._warned = false;
	      this.initTime = Date.now();
	      this.setIsLoadedBinded = this.setIsLoaded.bind(this);
	      this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
	    };
	    Font.isModifier = isModifier;
	    Font.isZeroWidthJoiner = isZeroWidthJoiner;
	    Font.isFlagEmoji = isFlagEmoji;
	    Font.isRegionalCode = isRegionalCode;
	    Font.isCombinedCharacter = isCombinedCharacter;
	    Font.isRegionalFlag = isRegionalFlag;
	    Font.isVariationSelector = isVariationSelector;
	    Font.BLACK_FLAG_CODE_POINT = BLACK_FLAG_CODE_POINT;
	    var fontPrototype = {
	      addChars,
	      addFonts,
	      getCharData,
	      getFontByName,
	      measureText,
	      checkLoadedFonts,
	      setIsLoaded
	    };
	    Font.prototype = fontPrototype;
	    return Font;
	  }();
	  function SlotManager(animationData2) {
	    this.animationData = animationData2;
	  }
	  SlotManager.prototype.getProp = function(data2) {
	    if (this.animationData.slots && this.animationData.slots[data2.sid]) {
	      return Object.assign(data2, this.animationData.slots[data2.sid].p);
	    }
	    return data2;
	  };
	  function slotFactory(animationData2) {
	    return new SlotManager(animationData2);
	  }
	  function RenderableElement() {
	  }
	  RenderableElement.prototype = {
	    initRenderable: function initRenderable() {
	      this.isInRange = false;
	      this.hidden = false;
	      this.isTransparent = false;
	      this.renderableComponents = [];
	    },
	    addRenderableComponent: function addRenderableComponent(component) {
	      if (this.renderableComponents.indexOf(component) === -1) {
	        this.renderableComponents.push(component);
	      }
	    },
	    removeRenderableComponent: function removeRenderableComponent(component) {
	      if (this.renderableComponents.indexOf(component) !== -1) {
	        this.renderableComponents.splice(this.renderableComponents.indexOf(component), 1);
	      }
	    },
	    prepareRenderableFrame: function prepareRenderableFrame(num) {
	      this.checkLayerLimits(num);
	    },
	    checkTransparency: function checkTransparency() {
	      if (this.finalTransform.mProp.o.v <= 0) {
	        if (!this.isTransparent && this.globalData.renderConfig.hideOnTransparent) {
	          this.isTransparent = true;
	          this.hide();
	        }
	      } else if (this.isTransparent) {
	        this.isTransparent = false;
	        this.show();
	      }
	    },
	    /**
	       * @function
	       * Initializes frame related properties.
	       *
	       * @param {number} num
	       * current frame number in Layer's time
	       *
	       */
	    checkLayerLimits: function checkLayerLimits(num) {
	      if (this.data.ip - this.data.st <= num && this.data.op - this.data.st > num) {
	        if (this.isInRange !== true) {
	          this.globalData._mdf = true;
	          this._mdf = true;
	          this.isInRange = true;
	          this.show();
	        }
	      } else if (this.isInRange !== false) {
	        this.globalData._mdf = true;
	        this.isInRange = false;
	        this.hide();
	      }
	    },
	    renderRenderable: function renderRenderable() {
	      var i;
	      var len = this.renderableComponents.length;
	      for (i = 0; i < len; i += 1) {
	        this.renderableComponents[i].renderFrame(this._isFirstFrame);
	      }
	    },
	    sourceRectAtTime: function sourceRectAtTime2() {
	      return {
	        top: 0,
	        left: 0,
	        width: 100,
	        height: 100
	      };
	    },
	    getLayerSize: function getLayerSize() {
	      if (this.data.ty === 5) {
	        return {
	          w: this.data.textData.width,
	          h: this.data.textData.height
	        };
	      }
	      return {
	        w: this.data.width,
	        h: this.data.height
	      };
	    }
	  };
	  var getBlendMode = /* @__PURE__ */ function() {
	    var blendModeEnums = {
	      0: "source-over",
	      1: "multiply",
	      2: "screen",
	      3: "overlay",
	      4: "darken",
	      5: "lighten",
	      6: "color-dodge",
	      7: "color-burn",
	      8: "hard-light",
	      9: "soft-light",
	      10: "difference",
	      11: "exclusion",
	      12: "hue",
	      13: "saturation",
	      14: "color",
	      15: "luminosity"
	    };
	    return function(mode) {
	      return blendModeEnums[mode] || "";
	    };
	  }();
	  function SliderEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 0, 0, container);
	  }
	  function AngleEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 0, 0, container);
	  }
	  function ColorEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 1, 0, container);
	  }
	  function PointEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 1, 0, container);
	  }
	  function LayerIndexEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 0, 0, container);
	  }
	  function MaskIndexEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 0, 0, container);
	  }
	  function CheckboxEffect(data2, elem2, container) {
	    this.p = PropertyFactory.getProp(elem2, data2.v, 0, 0, container);
	  }
	  function NoValueEffect() {
	    this.p = {};
	  }
	  function EffectsManager(data2, element) {
	    var effects = data2.ef || [];
	    this.effectElements = [];
	    var i;
	    var len = effects.length;
	    var effectItem;
	    for (i = 0; i < len; i += 1) {
	      effectItem = new GroupEffect(effects[i], element);
	      this.effectElements.push(effectItem);
	    }
	  }
	  function GroupEffect(data2, element) {
	    this.init(data2, element);
	  }
	  extendPrototype([DynamicPropertyContainer], GroupEffect);
	  GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties;
	  GroupEffect.prototype.init = function(data2, element) {
	    this.data = data2;
	    this.effectElements = [];
	    this.initDynamicPropertyContainer(element);
	    var i;
	    var len = this.data.ef.length;
	    var eff;
	    var effects = this.data.ef;
	    for (i = 0; i < len; i += 1) {
	      eff = null;
	      switch (effects[i].ty) {
	        case 0:
	          eff = new SliderEffect(effects[i], element, this);
	          break;
	        case 1:
	          eff = new AngleEffect(effects[i], element, this);
	          break;
	        case 2:
	          eff = new ColorEffect(effects[i], element, this);
	          break;
	        case 3:
	          eff = new PointEffect(effects[i], element, this);
	          break;
	        case 4:
	        case 7:
	          eff = new CheckboxEffect(effects[i], element, this);
	          break;
	        case 10:
	          eff = new LayerIndexEffect(effects[i], element, this);
	          break;
	        case 11:
	          eff = new MaskIndexEffect(effects[i], element, this);
	          break;
	        case 5:
	          eff = new EffectsManager(effects[i], element);
	          break;
	        default:
	          eff = new NoValueEffect(effects[i]);
	          break;
	      }
	      if (eff) {
	        this.effectElements.push(eff);
	      }
	    }
	  };
	  function BaseElement() {
	  }
	  BaseElement.prototype = {
	    checkMasks: function checkMasks() {
	      if (!this.data.hasMask) {
	        return false;
	      }
	      var i = 0;
	      var len = this.data.masksProperties.length;
	      while (i < len) {
	        if (this.data.masksProperties[i].mode !== "n" && this.data.masksProperties[i].cl !== false) {
	          return true;
	        }
	        i += 1;
	      }
	      return false;
	    },
	    initExpressions: function initExpressions() {
	      var expressionsInterfaces2 = getExpressionInterfaces();
	      if (!expressionsInterfaces2) {
	        return;
	      }
	      var LayerExpressionInterface2 = expressionsInterfaces2("layer");
	      var EffectsExpressionInterface2 = expressionsInterfaces2("effects");
	      var ShapeExpressionInterface2 = expressionsInterfaces2("shape");
	      var TextExpressionInterface2 = expressionsInterfaces2("text");
	      var CompExpressionInterface2 = expressionsInterfaces2("comp");
	      this.layerInterface = LayerExpressionInterface2(this);
	      if (this.data.hasMask && this.maskManager) {
	        this.layerInterface.registerMaskInterface(this.maskManager);
	      }
	      var effectsInterface = EffectsExpressionInterface2.createEffectsInterface(this, this.layerInterface);
	      this.layerInterface.registerEffectsInterface(effectsInterface);
	      if (this.data.ty === 0 || this.data.xt) {
	        this.compInterface = CompExpressionInterface2(this);
	      } else if (this.data.ty === 4) {
	        this.layerInterface.shapeInterface = ShapeExpressionInterface2(this.shapesData, this.itemsData, this.layerInterface);
	        this.layerInterface.content = this.layerInterface.shapeInterface;
	      } else if (this.data.ty === 5) {
	        this.layerInterface.textInterface = TextExpressionInterface2(this);
	        this.layerInterface.text = this.layerInterface.textInterface;
	      }
	    },
	    setBlendMode: function setBlendMode() {
	      var blendModeValue = getBlendMode(this.data.bm);
	      var elem2 = this.baseElement || this.layerElement;
	      elem2.style["mix-blend-mode"] = blendModeValue;
	    },
	    initBaseData: function initBaseData(data2, globalData2, comp2) {
	      this.globalData = globalData2;
	      this.comp = comp2;
	      this.data = data2;
	      this.layerId = createElementID();
	      if (!this.data.sr) {
	        this.data.sr = 1;
	      }
	      this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
	    },
	    getType: function getType() {
	      return this.type;
	    },
	    sourceRectAtTime: function sourceRectAtTime2() {
	    }
	  };
	  function FrameElement() {
	  }
	  FrameElement.prototype = {
	    /**
	       * @function
	       * Initializes frame related properties.
	       *
	       */
	    initFrame: function initFrame2() {
	      this._isFirstFrame = false;
	      this.dynamicProperties = [];
	      this._mdf = false;
	    },
	    /**
	       * @function
	       * Calculates all dynamic values
	       *
	       * @param {number} num
	       * current frame number in Layer's time
	       * @param {boolean} isVisible
	       * if layers is currently in range
	       *
	       */
	    prepareProperties: function prepareProperties(num, isVisible) {
	      var i;
	      var len = this.dynamicProperties.length;
	      for (i = 0; i < len; i += 1) {
	        if (isVisible || this._isParent && this.dynamicProperties[i].propType === "transform") {
	          this.dynamicProperties[i].getValue();
	          if (this.dynamicProperties[i]._mdf) {
	            this.globalData._mdf = true;
	            this._mdf = true;
	          }
	        }
	      }
	    },
	    addDynamicProperty: function addDynamicProperty(prop) {
	      if (this.dynamicProperties.indexOf(prop) === -1) {
	        this.dynamicProperties.push(prop);
	      }
	    }
	  };
	  function FootageElement(data2, globalData2, comp2) {
	    this.initFrame();
	    this.initRenderable();
	    this.assetData = globalData2.getAssetData(data2.refId);
	    this.footageData = globalData2.imageLoader.getAsset(this.assetData);
	    this.initBaseData(data2, globalData2, comp2);
	  }
	  FootageElement.prototype.prepareFrame = function() {
	  };
	  extendPrototype([RenderableElement, BaseElement, FrameElement], FootageElement);
	  FootageElement.prototype.getBaseElement = function() {
	    return null;
	  };
	  FootageElement.prototype.renderFrame = function() {
	  };
	  FootageElement.prototype.destroy = function() {
	  };
	  FootageElement.prototype.initExpressions = function() {
	    var expressionsInterfaces2 = getExpressionInterfaces();
	    if (!expressionsInterfaces2) {
	      return;
	    }
	    var FootageInterface2 = expressionsInterfaces2("footage");
	    this.layerInterface = FootageInterface2(this);
	  };
	  FootageElement.prototype.getFootageData = function() {
	    return this.footageData;
	  };
	  function AudioElement(data2, globalData2, comp2) {
	    this.initFrame();
	    this.initRenderable();
	    this.assetData = globalData2.getAssetData(data2.refId);
	    this.initBaseData(data2, globalData2, comp2);
	    this._isPlaying = false;
	    this._canPlay = false;
	    var assetPath = this.globalData.getAssetsPath(this.assetData);
	    this.audio = this.globalData.audioController.createAudio(assetPath);
	    this._currentTime = 0;
	    this.globalData.audioController.addAudio(this);
	    this._volumeMultiplier = 1;
	    this._volume = 1;
	    this._previousVolume = null;
	    this.tm = data2.tm ? PropertyFactory.getProp(this, data2.tm, 0, globalData2.frameRate, this) : {
	      _placeholder: true
	    };
	    this.lv = PropertyFactory.getProp(this, data2.au && data2.au.lv ? data2.au.lv : {
	      k: [100]
	    }, 1, 0.01, this);
	  }
	  AudioElement.prototype.prepareFrame = function(num) {
	    this.prepareRenderableFrame(num, true);
	    this.prepareProperties(num, true);
	    if (!this.tm._placeholder) {
	      var timeRemapped = this.tm.v;
	      this._currentTime = timeRemapped;
	    } else {
	      this._currentTime = num / this.data.sr;
	    }
	    this._volume = this.lv.v[0];
	    var totalVolume = this._volume * this._volumeMultiplier;
	    if (this._previousVolume !== totalVolume) {
	      this._previousVolume = totalVolume;
	      this.audio.volume(totalVolume);
	    }
	  };
	  extendPrototype([RenderableElement, BaseElement, FrameElement], AudioElement);
	  AudioElement.prototype.renderFrame = function() {
	    if (this.isInRange && this._canPlay) {
	      if (!this._isPlaying) {
	        this.audio.play();
	        this.audio.seek(this._currentTime / this.globalData.frameRate);
	        this._isPlaying = true;
	      } else if (!this.audio.playing() || Math.abs(this._currentTime / this.globalData.frameRate - this.audio.seek()) > 0.1) {
	        this.audio.seek(this._currentTime / this.globalData.frameRate);
	      }
	    }
	  };
	  AudioElement.prototype.show = function() {
	  };
	  AudioElement.prototype.hide = function() {
	    this.audio.pause();
	    this._isPlaying = false;
	  };
	  AudioElement.prototype.pause = function() {
	    this.audio.pause();
	    this._isPlaying = false;
	    this._canPlay = false;
	  };
	  AudioElement.prototype.resume = function() {
	    this._canPlay = true;
	  };
	  AudioElement.prototype.setRate = function(rateValue) {
	    this.audio.rate(rateValue);
	  };
	  AudioElement.prototype.volume = function(volumeValue) {
	    this._volumeMultiplier = volumeValue;
	    this._previousVolume = volumeValue * this._volume;
	    this.audio.volume(this._previousVolume);
	  };
	  AudioElement.prototype.getBaseElement = function() {
	    return null;
	  };
	  AudioElement.prototype.destroy = function() {
	  };
	  AudioElement.prototype.sourceRectAtTime = function() {
	  };
	  AudioElement.prototype.initExpressions = function() {
	  };
	  function BaseRenderer() {
	  }
	  BaseRenderer.prototype.checkLayers = function(num) {
	    var i;
	    var len = this.layers.length;
	    var data2;
	    this.completeLayers = true;
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (!this.elements[i]) {
	        data2 = this.layers[i];
	        if (data2.ip - data2.st <= num - this.layers[i].st && data2.op - data2.st > num - this.layers[i].st) {
	          this.buildItem(i);
	        }
	      }
	      this.completeLayers = this.elements[i] ? this.completeLayers : false;
	    }
	    this.checkPendingElements();
	  };
	  BaseRenderer.prototype.createItem = function(layer) {
	    switch (layer.ty) {
	      case 2:
	        return this.createImage(layer);
	      case 0:
	        return this.createComp(layer);
	      case 1:
	        return this.createSolid(layer);
	      case 3:
	        return this.createNull(layer);
	      case 4:
	        return this.createShape(layer);
	      case 5:
	        return this.createText(layer);
	      case 6:
	        return this.createAudio(layer);
	      case 13:
	        return this.createCamera(layer);
	      case 15:
	        return this.createFootage(layer);
	      default:
	        return this.createNull(layer);
	    }
	  };
	  BaseRenderer.prototype.createCamera = function() {
	    throw new Error("You're using a 3d camera. Try the html renderer.");
	  };
	  BaseRenderer.prototype.createAudio = function(data2) {
	    return new AudioElement(data2, this.globalData, this);
	  };
	  BaseRenderer.prototype.createFootage = function(data2) {
	    return new FootageElement(data2, this.globalData, this);
	  };
	  BaseRenderer.prototype.buildAllItems = function() {
	    var i;
	    var len = this.layers.length;
	    for (i = 0; i < len; i += 1) {
	      this.buildItem(i);
	    }
	    this.checkPendingElements();
	  };
	  BaseRenderer.prototype.includeLayers = function(newLayers) {
	    this.completeLayers = false;
	    var i;
	    var len = newLayers.length;
	    var j;
	    var jLen = this.layers.length;
	    for (i = 0; i < len; i += 1) {
	      j = 0;
	      while (j < jLen) {
	        if (this.layers[j].id === newLayers[i].id) {
	          this.layers[j] = newLayers[i];
	          break;
	        }
	        j += 1;
	      }
	    }
	  };
	  BaseRenderer.prototype.setProjectInterface = function(pInterface) {
	    this.globalData.projectInterface = pInterface;
	  };
	  BaseRenderer.prototype.initItems = function() {
	    if (!this.globalData.progressiveLoad) {
	      this.buildAllItems();
	    }
	  };
	  BaseRenderer.prototype.buildElementParenting = function(element, parentName, hierarchy) {
	    var elements = this.elements;
	    var layers = this.layers;
	    var i = 0;
	    var len = layers.length;
	    while (i < len) {
	      if (layers[i].ind == parentName) {
	        if (!elements[i] || elements[i] === true) {
	          this.buildItem(i);
	          this.addPendingElement(element);
	        } else {
	          hierarchy.push(elements[i]);
	          elements[i].setAsParent();
	          if (layers[i].parent !== void 0) {
	            this.buildElementParenting(element, layers[i].parent, hierarchy);
	          } else {
	            element.setHierarchy(hierarchy);
	          }
	        }
	      }
	      i += 1;
	    }
	  };
	  BaseRenderer.prototype.addPendingElement = function(element) {
	    this.pendingElements.push(element);
	  };
	  BaseRenderer.prototype.searchExtraCompositions = function(assets) {
	    var i;
	    var len = assets.length;
	    for (i = 0; i < len; i += 1) {
	      if (assets[i].xt) {
	        var comp2 = this.createComp(assets[i]);
	        comp2.initExpressions();
	        this.globalData.projectInterface.registerComposition(comp2);
	      }
	    }
	  };
	  BaseRenderer.prototype.getElementById = function(ind) {
	    var i;
	    var len = this.elements.length;
	    for (i = 0; i < len; i += 1) {
	      if (this.elements[i].data.ind === ind) {
	        return this.elements[i];
	      }
	    }
	    return null;
	  };
	  BaseRenderer.prototype.getElementByPath = function(path) {
	    var pathValue = path.shift();
	    var element;
	    if (typeof pathValue === "number") {
	      element = this.elements[pathValue];
	    } else {
	      var i;
	      var len = this.elements.length;
	      for (i = 0; i < len; i += 1) {
	        if (this.elements[i].data.nm === pathValue) {
	          element = this.elements[i];
	          break;
	        }
	      }
	    }
	    if (path.length === 0) {
	      return element;
	    }
	    return element.getElementByPath(path);
	  };
	  BaseRenderer.prototype.setupGlobalData = function(animData, fontsContainer) {
	    this.globalData.fontManager = new FontManager();
	    this.globalData.slotManager = slotFactory(animData);
	    this.globalData.fontManager.addChars(animData.chars);
	    this.globalData.fontManager.addFonts(animData.fonts, fontsContainer);
	    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
	    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
	    this.globalData.imageLoader = this.animationItem.imagePreloader;
	    this.globalData.audioController = this.animationItem.audioController;
	    this.globalData.frameId = 0;
	    this.globalData.frameRate = animData.fr;
	    this.globalData.nm = animData.nm;
	    this.globalData.compSize = {
	      w: animData.w,
	      h: animData.h
	    };
	  };
	  var effectTypes = {
	    TRANSFORM_EFFECT: "transformEFfect"
	  };
	  function TransformElement() {
	  }
	  TransformElement.prototype = {
	    initTransform: function initTransform() {
	      var mat = new Matrix();
	      this.finalTransform = {
	        mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : {
	          o: 0
	        },
	        _matMdf: false,
	        _localMatMdf: false,
	        _opMdf: false,
	        mat,
	        localMat: mat,
	        localOpacity: 1
	      };
	      if (this.data.ao) {
	        this.finalTransform.mProp.autoOriented = true;
	      }
	      if (this.data.ty !== 11) ;
	    },
	    renderTransform: function renderTransform() {
	      this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame;
	      this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame;
	      if (this.hierarchy) {
	        var mat;
	        var finalMat = this.finalTransform.mat;
	        var i = 0;
	        var len = this.hierarchy.length;
	        if (!this.finalTransform._matMdf) {
	          while (i < len) {
	            if (this.hierarchy[i].finalTransform.mProp._mdf) {
	              this.finalTransform._matMdf = true;
	              break;
	            }
	            i += 1;
	          }
	        }
	        if (this.finalTransform._matMdf) {
	          mat = this.finalTransform.mProp.v.props;
	          finalMat.cloneFromProps(mat);
	          for (i = 0; i < len; i += 1) {
	            finalMat.multiply(this.hierarchy[i].finalTransform.mProp.v);
	          }
	        }
	      }
	      if (!this.localTransforms || this.finalTransform._matMdf) {
	        this.finalTransform._localMatMdf = this.finalTransform._matMdf;
	      }
	      if (this.finalTransform._opMdf) {
	        this.finalTransform.localOpacity = this.finalTransform.mProp.o.v;
	      }
	    },
	    renderLocalTransform: function renderLocalTransform() {
	      if (this.localTransforms) {
	        var i = 0;
	        var len = this.localTransforms.length;
	        this.finalTransform._localMatMdf = this.finalTransform._matMdf;
	        if (!this.finalTransform._localMatMdf || !this.finalTransform._opMdf) {
	          while (i < len) {
	            if (this.localTransforms[i]._mdf) {
	              this.finalTransform._localMatMdf = true;
	            }
	            if (this.localTransforms[i]._opMdf && !this.finalTransform._opMdf) {
	              this.finalTransform.localOpacity = this.finalTransform.mProp.o.v;
	              this.finalTransform._opMdf = true;
	            }
	            i += 1;
	          }
	        }
	        if (this.finalTransform._localMatMdf) {
	          var localMat = this.finalTransform.localMat;
	          this.localTransforms[0].matrix.clone(localMat);
	          for (i = 1; i < len; i += 1) {
	            var lmat = this.localTransforms[i].matrix;
	            localMat.multiply(lmat);
	          }
	          localMat.multiply(this.finalTransform.mat);
	        }
	        if (this.finalTransform._opMdf) {
	          var localOp = this.finalTransform.localOpacity;
	          for (i = 0; i < len; i += 1) {
	            localOp *= this.localTransforms[i].opacity * 0.01;
	          }
	          this.finalTransform.localOpacity = localOp;
	        }
	      }
	    },
	    searchEffectTransforms: function searchEffectTransforms() {
	      if (this.renderableEffectsManager) {
	        var transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
	        if (transformEffects.length) {
	          this.localTransforms = [];
	          this.finalTransform.localMat = new Matrix();
	          var i = 0;
	          var len = transformEffects.length;
	          for (i = 0; i < len; i += 1) {
	            this.localTransforms.push(transformEffects[i]);
	          }
	        }
	      }
	    },
	    globalToLocal: function globalToLocal(pt) {
	      var transforms = [];
	      transforms.push(this.finalTransform);
	      var flag = true;
	      var comp2 = this.comp;
	      while (flag) {
	        if (comp2.finalTransform) {
	          if (comp2.data.hasMask) {
	            transforms.splice(0, 0, comp2.finalTransform);
	          }
	          comp2 = comp2.comp;
	        } else {
	          flag = false;
	        }
	      }
	      var i;
	      var len = transforms.length;
	      var ptNew;
	      for (i = 0; i < len; i += 1) {
	        ptNew = transforms[i].mat.applyToPointArray(0, 0, 0);
	        pt = [pt[0] - ptNew[0], pt[1] - ptNew[1], 0];
	      }
	      return pt;
	    },
	    mHelper: new Matrix()
	  };
	  function MaskElement(data2, element, globalData2) {
	    this.data = data2;
	    this.element = element;
	    this.globalData = globalData2;
	    this.storedData = [];
	    this.masksProperties = this.data.masksProperties || [];
	    this.maskElement = null;
	    var defs = this.globalData.defs;
	    var i;
	    var len = this.masksProperties ? this.masksProperties.length : 0;
	    this.viewData = createSizedArray(len);
	    this.solidPath = "";
	    var path;
	    var properties = this.masksProperties;
	    var count = 0;
	    var currentMasks = [];
	    var j;
	    var jLen;
	    var layerId = createElementID();
	    var rect;
	    var expansor;
	    var feMorph;
	    var x;
	    var maskType = "clipPath";
	    var maskRef = "clip-path";
	    for (i = 0; i < len; i += 1) {
	      if (properties[i].mode !== "a" && properties[i].mode !== "n" || properties[i].inv || properties[i].o.k !== 100 || properties[i].o.x) {
	        maskType = "mask";
	        maskRef = "mask";
	      }
	      if ((properties[i].mode === "s" || properties[i].mode === "i") && count === 0) {
	        rect = createNS("rect");
	        rect.setAttribute("fill", "#ffffff");
	        rect.setAttribute("width", this.element.comp.data.w || 0);
	        rect.setAttribute("height", this.element.comp.data.h || 0);
	        currentMasks.push(rect);
	      } else {
	        rect = null;
	      }
	      path = createNS("path");
	      if (properties[i].mode === "n") {
	        this.viewData[i] = {
	          op: PropertyFactory.getProp(this.element, properties[i].o, 0, 0.01, this.element),
	          prop: ShapePropertyFactory.getShapeProp(this.element, properties[i], 3),
	          elem: path,
	          lastPath: ""
	        };
	        defs.appendChild(path);
	      } else {
	        count += 1;
	        path.setAttribute("fill", properties[i].mode === "s" ? "#000000" : "#ffffff");
	        path.setAttribute("clip-rule", "nonzero");
	        var filterID;
	        if (properties[i].x.k !== 0) {
	          maskType = "mask";
	          maskRef = "mask";
	          x = PropertyFactory.getProp(this.element, properties[i].x, 0, null, this.element);
	          filterID = createElementID();
	          expansor = createNS("filter");
	          expansor.setAttribute("id", filterID);
	          feMorph = createNS("feMorphology");
	          feMorph.setAttribute("operator", "erode");
	          feMorph.setAttribute("in", "SourceGraphic");
	          feMorph.setAttribute("radius", "0");
	          expansor.appendChild(feMorph);
	          defs.appendChild(expansor);
	          path.setAttribute("stroke", properties[i].mode === "s" ? "#000000" : "#ffffff");
	        } else {
	          feMorph = null;
	          x = null;
	        }
	        this.storedData[i] = {
	          elem: path,
	          x,
	          expan: feMorph,
	          lastPath: "",
	          lastOperator: "",
	          filterId: filterID,
	          lastRadius: 0
	        };
	        if (properties[i].mode === "i") {
	          jLen = currentMasks.length;
	          var g = createNS("g");
	          for (j = 0; j < jLen; j += 1) {
	            g.appendChild(currentMasks[j]);
	          }
	          var mask2 = createNS("mask");
	          mask2.setAttribute("mask-type", "alpha");
	          mask2.setAttribute("id", layerId + "_" + count);
	          mask2.appendChild(path);
	          defs.appendChild(mask2);
	          g.setAttribute("mask", "url(" + getLocationHref() + "#" + layerId + "_" + count + ")");
	          currentMasks.length = 0;
	          currentMasks.push(g);
	        } else {
	          currentMasks.push(path);
	        }
	        if (properties[i].inv && !this.solidPath) {
	          this.solidPath = this.createLayerSolidPath();
	        }
	        this.viewData[i] = {
	          elem: path,
	          lastPath: "",
	          op: PropertyFactory.getProp(this.element, properties[i].o, 0, 0.01, this.element),
	          prop: ShapePropertyFactory.getShapeProp(this.element, properties[i], 3),
	          invRect: rect
	        };
	        if (!this.viewData[i].prop.k) {
	          this.drawPath(properties[i], this.viewData[i].prop.v, this.viewData[i]);
	        }
	      }
	    }
	    this.maskElement = createNS(maskType);
	    len = currentMasks.length;
	    for (i = 0; i < len; i += 1) {
	      this.maskElement.appendChild(currentMasks[i]);
	    }
	    if (count > 0) {
	      this.maskElement.setAttribute("id", layerId);
	      this.element.maskedElement.setAttribute(maskRef, "url(" + getLocationHref() + "#" + layerId + ")");
	      defs.appendChild(this.maskElement);
	    }
	    if (this.viewData.length) {
	      this.element.addRenderableComponent(this);
	    }
	  }
	  MaskElement.prototype.getMaskProperty = function(pos) {
	    return this.viewData[pos].prop;
	  };
	  MaskElement.prototype.renderFrame = function(isFirstFrame) {
	    var finalMat = this.element.finalTransform.mat;
	    var i;
	    var len = this.masksProperties.length;
	    for (i = 0; i < len; i += 1) {
	      if (this.viewData[i].prop._mdf || isFirstFrame) {
	        this.drawPath(this.masksProperties[i], this.viewData[i].prop.v, this.viewData[i]);
	      }
	      if (this.viewData[i].op._mdf || isFirstFrame) {
	        this.viewData[i].elem.setAttribute("fill-opacity", this.viewData[i].op.v);
	      }
	      if (this.masksProperties[i].mode !== "n") {
	        if (this.viewData[i].invRect && (this.element.finalTransform.mProp._mdf || isFirstFrame)) {
	          this.viewData[i].invRect.setAttribute("transform", finalMat.getInverseMatrix().to2dCSS());
	        }
	        if (this.storedData[i].x && (this.storedData[i].x._mdf || isFirstFrame)) {
	          var feMorph = this.storedData[i].expan;
	          if (this.storedData[i].x.v < 0) {
	            if (this.storedData[i].lastOperator !== "erode") {
	              this.storedData[i].lastOperator = "erode";
	              this.storedData[i].elem.setAttribute("filter", "url(" + getLocationHref() + "#" + this.storedData[i].filterId + ")");
	            }
	            feMorph.setAttribute("radius", -this.storedData[i].x.v);
	          } else {
	            if (this.storedData[i].lastOperator !== "dilate") {
	              this.storedData[i].lastOperator = "dilate";
	              this.storedData[i].elem.setAttribute("filter", null);
	            }
	            this.storedData[i].elem.setAttribute("stroke-width", this.storedData[i].x.v * 2);
	          }
	        }
	      }
	    }
	  };
	  MaskElement.prototype.getMaskelement = function() {
	    return this.maskElement;
	  };
	  MaskElement.prototype.createLayerSolidPath = function() {
	    var path = "M0,0 ";
	    path += " h" + this.globalData.compSize.w;
	    path += " v" + this.globalData.compSize.h;
	    path += " h-" + this.globalData.compSize.w;
	    path += " v-" + this.globalData.compSize.h + " ";
	    return path;
	  };
	  MaskElement.prototype.drawPath = function(pathData, pathNodes, viewData) {
	    var pathString = " M" + pathNodes.v[0][0] + "," + pathNodes.v[0][1];
	    var i;
	    var len;
	    len = pathNodes._length;
	    for (i = 1; i < len; i += 1) {
	      pathString += " C" + pathNodes.o[i - 1][0] + "," + pathNodes.o[i - 1][1] + " " + pathNodes.i[i][0] + "," + pathNodes.i[i][1] + " " + pathNodes.v[i][0] + "," + pathNodes.v[i][1];
	    }
	    if (pathNodes.c && len > 1) {
	      pathString += " C" + pathNodes.o[i - 1][0] + "," + pathNodes.o[i - 1][1] + " " + pathNodes.i[0][0] + "," + pathNodes.i[0][1] + " " + pathNodes.v[0][0] + "," + pathNodes.v[0][1];
	    }
	    if (viewData.lastPath !== pathString) {
	      var pathShapeValue = "";
	      if (viewData.elem) {
	        if (pathNodes.c) {
	          pathShapeValue = pathData.inv ? this.solidPath + pathString : pathString;
	        }
	        viewData.elem.setAttribute("d", pathShapeValue);
	      }
	      viewData.lastPath = pathString;
	    }
	  };
	  MaskElement.prototype.destroy = function() {
	    this.element = null;
	    this.globalData = null;
	    this.maskElement = null;
	    this.data = null;
	    this.masksProperties = null;
	  };
	  var filtersFactory = function() {
	    var ob2 = {};
	    ob2.createFilter = createFilter;
	    ob2.createAlphaToLuminanceFilter = createAlphaToLuminanceFilter;
	    function createFilter(filId, skipCoordinates) {
	      var fil = createNS("filter");
	      fil.setAttribute("id", filId);
	      if (skipCoordinates !== true) {
	        fil.setAttribute("filterUnits", "objectBoundingBox");
	        fil.setAttribute("x", "0%");
	        fil.setAttribute("y", "0%");
	        fil.setAttribute("width", "100%");
	        fil.setAttribute("height", "100%");
	      }
	      return fil;
	    }
	    function createAlphaToLuminanceFilter() {
	      var feColorMatrix = createNS("feColorMatrix");
	      feColorMatrix.setAttribute("type", "matrix");
	      feColorMatrix.setAttribute("color-interpolation-filters", "sRGB");
	      feColorMatrix.setAttribute("values", "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1");
	      return feColorMatrix;
	    }
	    return ob2;
	  }();
	  var featureSupport = function() {
	    var ob2 = {
	      maskType: true,
	      svgLumaHidden: true,
	      offscreenCanvas: typeof OffscreenCanvas !== "undefined"
	    };
	    if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
	      ob2.maskType = false;
	    }
	    if (/firefox/i.test(navigator.userAgent)) {
	      ob2.svgLumaHidden = false;
	    }
	    return ob2;
	  }();
	  var registeredEffects$1 = {};
	  var idPrefix = "filter_result_";
	  function SVGEffects(elem2) {
	    var i;
	    var source = "SourceGraphic";
	    var len = elem2.data.ef ? elem2.data.ef.length : 0;
	    var filId = createElementID();
	    var fil = filtersFactory.createFilter(filId, true);
	    var count = 0;
	    this.filters = [];
	    var filterManager;
	    for (i = 0; i < len; i += 1) {
	      filterManager = null;
	      var type = elem2.data.ef[i].ty;
	      if (registeredEffects$1[type]) {
	        var Effect = registeredEffects$1[type].effect;
	        filterManager = new Effect(fil, elem2.effectsManager.effectElements[i], elem2, idPrefix + count, source);
	        source = idPrefix + count;
	        if (registeredEffects$1[type].countsAsEffect) {
	          count += 1;
	        }
	      }
	      if (filterManager) {
	        this.filters.push(filterManager);
	      }
	    }
	    if (count) {
	      elem2.globalData.defs.appendChild(fil);
	      elem2.layerElement.setAttribute("filter", "url(" + getLocationHref() + "#" + filId + ")");
	    }
	    if (this.filters.length) {
	      elem2.addRenderableComponent(this);
	    }
	  }
	  SVGEffects.prototype.renderFrame = function(_isFirstFrame) {
	    var i;
	    var len = this.filters.length;
	    for (i = 0; i < len; i += 1) {
	      this.filters[i].renderFrame(_isFirstFrame);
	    }
	  };
	  SVGEffects.prototype.getEffects = function(type) {
	    var i;
	    var len = this.filters.length;
	    var effects = [];
	    for (i = 0; i < len; i += 1) {
	      if (this.filters[i].type === type) {
	        effects.push(this.filters[i]);
	      }
	    }
	    return effects;
	  };
	  function registerEffect$1(id, effect2, countsAsEffect) {
	    registeredEffects$1[id] = {
	      effect: effect2,
	      countsAsEffect
	    };
	  }
	  function SVGBaseElement() {
	  }
	  SVGBaseElement.prototype = {
	    initRendererElement: function initRendererElement() {
	      this.layerElement = createNS("g");
	    },
	    createContainerElements: function createContainerElements() {
	      this.matteElement = createNS("g");
	      this.transformedElement = this.layerElement;
	      this.maskedElement = this.layerElement;
	      this._sizeChanged = false;
	      var layerElementParent = null;
	      if (this.data.td) {
	        this.matteMasks = {};
	        var gg = createNS("g");
	        gg.setAttribute("id", this.layerId);
	        gg.appendChild(this.layerElement);
	        layerElementParent = gg;
	        this.globalData.defs.appendChild(gg);
	      } else if (this.data.tt) {
	        this.matteElement.appendChild(this.layerElement);
	        layerElementParent = this.matteElement;
	        this.baseElement = this.matteElement;
	      } else {
	        this.baseElement = this.layerElement;
	      }
	      if (this.data.ln) {
	        this.layerElement.setAttribute("id", this.data.ln);
	      }
	      if (this.data.cl) {
	        this.layerElement.setAttribute("class", this.data.cl);
	      }
	      if (this.data.ty === 0 && !this.data.hd) {
	        var cp = createNS("clipPath");
	        var pt = createNS("path");
	        pt.setAttribute("d", "M0,0 L" + this.data.w + ",0 L" + this.data.w + "," + this.data.h + " L0," + this.data.h + "z");
	        var clipId = createElementID();
	        cp.setAttribute("id", clipId);
	        cp.appendChild(pt);
	        this.globalData.defs.appendChild(cp);
	        if (this.checkMasks()) {
	          var cpGroup = createNS("g");
	          cpGroup.setAttribute("clip-path", "url(" + getLocationHref() + "#" + clipId + ")");
	          cpGroup.appendChild(this.layerElement);
	          this.transformedElement = cpGroup;
	          if (layerElementParent) {
	            layerElementParent.appendChild(this.transformedElement);
	          } else {
	            this.baseElement = this.transformedElement;
	          }
	        } else {
	          this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + clipId + ")");
	        }
	      }
	      if (this.data.bm !== 0) {
	        this.setBlendMode();
	      }
	    },
	    renderElement: function renderElement() {
	      if (this.finalTransform._localMatMdf) {
	        this.transformedElement.setAttribute("transform", this.finalTransform.localMat.to2dCSS());
	      }
	      if (this.finalTransform._opMdf) {
	        this.transformedElement.setAttribute("opacity", this.finalTransform.localOpacity);
	      }
	    },
	    destroyBaseElement: function destroyBaseElement() {
	      this.layerElement = null;
	      this.matteElement = null;
	      this.maskManager.destroy();
	    },
	    getBaseElement: function getBaseElement() {
	      if (this.data.hd) {
	        return null;
	      }
	      return this.baseElement;
	    },
	    createRenderableComponents: function createRenderableComponents() {
	      this.maskManager = new MaskElement(this.data, this, this.globalData);
	      this.renderableEffectsManager = new SVGEffects(this);
	      this.searchEffectTransforms();
	    },
	    getMatte: function getMatte(matteType) {
	      if (!this.matteMasks) {
	        this.matteMasks = {};
	      }
	      if (!this.matteMasks[matteType]) {
	        var id = this.layerId + "_" + matteType;
	        var filId;
	        var fil;
	        var useElement;
	        var gg;
	        if (matteType === 1 || matteType === 3) {
	          var masker = createNS("mask");
	          masker.setAttribute("id", id);
	          masker.setAttribute("mask-type", matteType === 3 ? "luminance" : "alpha");
	          useElement = createNS("use");
	          useElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId);
	          masker.appendChild(useElement);
	          this.globalData.defs.appendChild(masker);
	          if (!featureSupport.maskType && matteType === 1) {
	            masker.setAttribute("mask-type", "luminance");
	            filId = createElementID();
	            fil = filtersFactory.createFilter(filId);
	            this.globalData.defs.appendChild(fil);
	            fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
	            gg = createNS("g");
	            gg.appendChild(useElement);
	            masker.appendChild(gg);
	            gg.setAttribute("filter", "url(" + getLocationHref() + "#" + filId + ")");
	          }
	        } else if (matteType === 2) {
	          var maskGroup = createNS("mask");
	          maskGroup.setAttribute("id", id);
	          maskGroup.setAttribute("mask-type", "alpha");
	          var maskGrouper = createNS("g");
	          maskGroup.appendChild(maskGrouper);
	          filId = createElementID();
	          fil = filtersFactory.createFilter(filId);
	          var feCTr = createNS("feComponentTransfer");
	          feCTr.setAttribute("in", "SourceGraphic");
	          fil.appendChild(feCTr);
	          var feFunc = createNS("feFuncA");
	          feFunc.setAttribute("type", "table");
	          feFunc.setAttribute("tableValues", "1.0 0.0");
	          feCTr.appendChild(feFunc);
	          this.globalData.defs.appendChild(fil);
	          var alphaRect = createNS("rect");
	          alphaRect.setAttribute("width", this.comp.data.w);
	          alphaRect.setAttribute("height", this.comp.data.h);
	          alphaRect.setAttribute("x", "0");
	          alphaRect.setAttribute("y", "0");
	          alphaRect.setAttribute("fill", "#ffffff");
	          alphaRect.setAttribute("opacity", "0");
	          maskGrouper.setAttribute("filter", "url(" + getLocationHref() + "#" + filId + ")");
	          maskGrouper.appendChild(alphaRect);
	          useElement = createNS("use");
	          useElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId);
	          maskGrouper.appendChild(useElement);
	          if (!featureSupport.maskType) {
	            maskGroup.setAttribute("mask-type", "luminance");
	            fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
	            gg = createNS("g");
	            maskGrouper.appendChild(alphaRect);
	            gg.appendChild(this.layerElement);
	            maskGrouper.appendChild(gg);
	          }
	          this.globalData.defs.appendChild(maskGroup);
	        }
	        this.matteMasks[matteType] = id;
	      }
	      return this.matteMasks[matteType];
	    },
	    setMatte: function setMatte(id) {
	      if (!this.matteElement) {
	        return;
	      }
	      this.matteElement.setAttribute("mask", "url(" + getLocationHref() + "#" + id + ")");
	    }
	  };
	  function HierarchyElement() {
	  }
	  HierarchyElement.prototype = {
	    /**
	       * @function
	       * Initializes hierarchy properties
	       *
	       */
	    initHierarchy: function initHierarchy() {
	      this.hierarchy = [];
	      this._isParent = false;
	      this.checkParenting();
	    },
	    /**
	       * @function
	       * Sets layer's hierarchy.
	       * @param {array} hierarch
	       * layer's parent list
	       *
	       */
	    setHierarchy: function setHierarchy(hierarchy) {
	      this.hierarchy = hierarchy;
	    },
	    /**
	       * @function
	       * Sets layer as parent.
	       *
	       */
	    setAsParent: function setAsParent() {
	      this._isParent = true;
	    },
	    /**
	       * @function
	       * Searches layer's parenting chain
	       *
	       */
	    checkParenting: function checkParenting() {
	      if (this.data.parent !== void 0) {
	        this.comp.buildElementParenting(this, this.data.parent, []);
	      }
	    }
	  };
	  function RenderableDOMElement() {
	  }
	  (function() {
	    var _prototype = {
	      initElement: function initElement(data2, globalData2, comp2) {
	        this.initFrame();
	        this.initBaseData(data2, globalData2, comp2);
	        this.initTransform(data2, globalData2, comp2);
	        this.initHierarchy();
	        this.initRenderable();
	        this.initRendererElement();
	        this.createContainerElements();
	        this.createRenderableComponents();
	        this.createContent();
	        this.hide();
	      },
	      hide: function hide() {
	        if (!this.hidden && (!this.isInRange || this.isTransparent)) {
	          var elem2 = this.baseElement || this.layerElement;
	          elem2.style.display = "none";
	          this.hidden = true;
	        }
	      },
	      show: function show() {
	        if (this.isInRange && !this.isTransparent) {
	          if (!this.data.hd) {
	            var elem2 = this.baseElement || this.layerElement;
	            elem2.style.display = "block";
	          }
	          this.hidden = false;
	          this._isFirstFrame = true;
	        }
	      },
	      renderFrame: function renderFrame() {
	        if (this.data.hd || this.hidden) {
	          return;
	        }
	        this.renderTransform();
	        this.renderRenderable();
	        this.renderLocalTransform();
	        this.renderElement();
	        this.renderInnerContent();
	        if (this._isFirstFrame) {
	          this._isFirstFrame = false;
	        }
	      },
	      renderInnerContent: function renderInnerContent() {
	      },
	      prepareFrame: function prepareFrame(num) {
	        this._mdf = false;
	        this.prepareRenderableFrame(num);
	        this.prepareProperties(num, this.isInRange);
	        this.checkTransparency();
	      },
	      destroy: function destroy() {
	        this.innerElem = null;
	        this.destroyBaseElement();
	      }
	    };
	    extendPrototype([RenderableElement, createProxyFunction(_prototype)], RenderableDOMElement);
	  })();
	  function IImageElement(data2, globalData2, comp2) {
	    this.assetData = globalData2.getAssetData(data2.refId);
	    if (this.assetData && this.assetData.sid) {
	      this.assetData = globalData2.slotManager.getProp(this.assetData);
	    }
	    this.initElement(data2, globalData2, comp2);
	    this.sourceRect = {
	      top: 0,
	      left: 0,
	      width: this.assetData.w,
	      height: this.assetData.h
	    };
	  }
	  extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement);
	  IImageElement.prototype.createContent = function() {
	    var assetPath = this.globalData.getAssetsPath(this.assetData);
	    this.innerElem = createNS("image");
	    this.innerElem.setAttribute("width", this.assetData.w + "px");
	    this.innerElem.setAttribute("height", this.assetData.h + "px");
	    this.innerElem.setAttribute("preserveAspectRatio", this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio);
	    this.innerElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", assetPath);
	    this.layerElement.appendChild(this.innerElem);
	  };
	  IImageElement.prototype.sourceRectAtTime = function() {
	    return this.sourceRect;
	  };
	  function ProcessedElement(element, position2) {
	    this.elem = element;
	    this.pos = position2;
	  }
	  function IShapeElement() {
	  }
	  IShapeElement.prototype = {
	    addShapeToModifiers: function addShapeToModifiers(data2) {
	      var i;
	      var len = this.shapeModifiers.length;
	      for (i = 0; i < len; i += 1) {
	        this.shapeModifiers[i].addShape(data2);
	      }
	    },
	    isShapeInAnimatedModifiers: function isShapeInAnimatedModifiers(data2) {
	      var i = 0;
	      var len = this.shapeModifiers.length;
	      while (i < len) {
	        if (this.shapeModifiers[i].isAnimatedWithShape(data2)) {
	          return true;
	        }
	      }
	      return false;
	    },
	    renderModifiers: function renderModifiers() {
	      if (!this.shapeModifiers.length) {
	        return;
	      }
	      var i;
	      var len = this.shapes.length;
	      for (i = 0; i < len; i += 1) {
	        this.shapes[i].sh.reset();
	      }
	      len = this.shapeModifiers.length;
	      var shouldBreakProcess;
	      for (i = len - 1; i >= 0; i -= 1) {
	        shouldBreakProcess = this.shapeModifiers[i].processShapes(this._isFirstFrame);
	        if (shouldBreakProcess) {
	          break;
	        }
	      }
	    },
	    searchProcessedElement: function searchProcessedElement(elem2) {
	      var elements = this.processedElements;
	      var i = 0;
	      var len = elements.length;
	      while (i < len) {
	        if (elements[i].elem === elem2) {
	          return elements[i].pos;
	        }
	        i += 1;
	      }
	      return 0;
	    },
	    addProcessedElement: function addProcessedElement(elem2, pos) {
	      var elements = this.processedElements;
	      var i = elements.length;
	      while (i) {
	        i -= 1;
	        if (elements[i].elem === elem2) {
	          elements[i].pos = pos;
	          return;
	        }
	      }
	      elements.push(new ProcessedElement(elem2, pos));
	    },
	    prepareFrame: function prepareFrame(num) {
	      this.prepareRenderableFrame(num);
	      this.prepareProperties(num, this.isInRange);
	    }
	  };
	  var lineCapEnum = {
	    1: "butt",
	    2: "round",
	    3: "square"
	  };
	  var lineJoinEnum = {
	    1: "miter",
	    2: "round",
	    3: "bevel"
	  };
	  function SVGShapeData(transformers, level, shape) {
	    this.caches = [];
	    this.styles = [];
	    this.transformers = transformers;
	    this.lStr = "";
	    this.sh = shape;
	    this.lvl = level;
	    this._isAnimated = !!shape.k;
	    var i = 0;
	    var len = transformers.length;
	    while (i < len) {
	      if (transformers[i].mProps.dynamicProperties.length) {
	        this._isAnimated = true;
	        break;
	      }
	      i += 1;
	    }
	  }
	  SVGShapeData.prototype.setAsAnimated = function() {
	    this._isAnimated = true;
	  };
	  function SVGStyleData(data2, level) {
	    this.data = data2;
	    this.type = data2.ty;
	    this.d = "";
	    this.lvl = level;
	    this._mdf = false;
	    this.closed = data2.hd === true;
	    this.pElem = createNS("path");
	    this.msElem = null;
	  }
	  SVGStyleData.prototype.reset = function() {
	    this.d = "";
	    this._mdf = false;
	  };
	  function DashProperty(elem2, data2, renderer2, container) {
	    this.elem = elem2;
	    this.frameId = -1;
	    this.dataProps = createSizedArray(data2.length);
	    this.renderer = renderer2;
	    this.k = false;
	    this.dashStr = "";
	    this.dashArray = createTypedArray("float32", data2.length ? data2.length - 1 : 0);
	    this.dashoffset = createTypedArray("float32", 1);
	    this.initDynamicPropertyContainer(container);
	    var i;
	    var len = data2.length || 0;
	    var prop;
	    for (i = 0; i < len; i += 1) {
	      prop = PropertyFactory.getProp(elem2, data2[i].v, 0, 0, this);
	      this.k = prop.k || this.k;
	      this.dataProps[i] = {
	        n: data2[i].n,
	        p: prop
	      };
	    }
	    if (!this.k) {
	      this.getValue(true);
	    }
	    this._isAnimated = this.k;
	  }
	  DashProperty.prototype.getValue = function(forceRender) {
	    if (this.elem.globalData.frameId === this.frameId && !forceRender) {
	      return;
	    }
	    this.frameId = this.elem.globalData.frameId;
	    this.iterateDynamicProperties();
	    this._mdf = this._mdf || forceRender;
	    if (this._mdf) {
	      var i = 0;
	      var len = this.dataProps.length;
	      if (this.renderer === "svg") {
	        this.dashStr = "";
	      }
	      for (i = 0; i < len; i += 1) {
	        if (this.dataProps[i].n !== "o") {
	          if (this.renderer === "svg") {
	            this.dashStr += " " + this.dataProps[i].p.v;
	          } else {
	            this.dashArray[i] = this.dataProps[i].p.v;
	          }
	        } else {
	          this.dashoffset[0] = this.dataProps[i].p.v;
	        }
	      }
	    }
	  };
	  extendPrototype([DynamicPropertyContainer], DashProperty);
	  function SVGStrokeStyleData(elem2, data2, styleOb) {
	    this.initDynamicPropertyContainer(elem2);
	    this.getValue = this.iterateDynamicProperties;
	    this.o = PropertyFactory.getProp(elem2, data2.o, 0, 0.01, this);
	    this.w = PropertyFactory.getProp(elem2, data2.w, 0, null, this);
	    this.d = new DashProperty(elem2, data2.d || {}, "svg", this);
	    this.c = PropertyFactory.getProp(elem2, data2.c, 1, 255, this);
	    this.style = styleOb;
	    this._isAnimated = !!this._isAnimated;
	  }
	  extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData);
	  function SVGFillStyleData(elem2, data2, styleOb) {
	    this.initDynamicPropertyContainer(elem2);
	    this.getValue = this.iterateDynamicProperties;
	    this.o = PropertyFactory.getProp(elem2, data2.o, 0, 0.01, this);
	    this.c = PropertyFactory.getProp(elem2, data2.c, 1, 255, this);
	    this.style = styleOb;
	  }
	  extendPrototype([DynamicPropertyContainer], SVGFillStyleData);
	  function SVGNoStyleData(elem2, data2, styleOb) {
	    this.initDynamicPropertyContainer(elem2);
	    this.getValue = this.iterateDynamicProperties;
	    this.style = styleOb;
	  }
	  extendPrototype([DynamicPropertyContainer], SVGNoStyleData);
	  function GradientProperty(elem2, data2, container) {
	    this.data = data2;
	    this.c = createTypedArray("uint8c", data2.p * 4);
	    var cLength = data2.k.k[0].s ? data2.k.k[0].s.length - data2.p * 4 : data2.k.k.length - data2.p * 4;
	    this.o = createTypedArray("float32", cLength);
	    this._cmdf = false;
	    this._omdf = false;
	    this._collapsable = this.checkCollapsable();
	    this._hasOpacity = cLength;
	    this.initDynamicPropertyContainer(container);
	    this.prop = PropertyFactory.getProp(elem2, data2.k, 1, null, this);
	    this.k = this.prop.k;
	    this.getValue(true);
	  }
	  GradientProperty.prototype.comparePoints = function(values, points) {
	    var i = 0;
	    var len = this.o.length / 2;
	    var diff;
	    while (i < len) {
	      diff = Math.abs(values[i * 4] - values[points * 4 + i * 2]);
	      if (diff > 0.01) {
	        return false;
	      }
	      i += 1;
	    }
	    return true;
	  };
	  GradientProperty.prototype.checkCollapsable = function() {
	    if (this.o.length / 2 !== this.c.length / 4) {
	      return false;
	    }
	    if (this.data.k.k[0].s) {
	      var i = 0;
	      var len = this.data.k.k.length;
	      while (i < len) {
	        if (!this.comparePoints(this.data.k.k[i].s, this.data.p)) {
	          return false;
	        }
	        i += 1;
	      }
	    } else if (!this.comparePoints(this.data.k.k, this.data.p)) {
	      return false;
	    }
	    return true;
	  };
	  GradientProperty.prototype.getValue = function(forceRender) {
	    this.prop.getValue();
	    this._mdf = false;
	    this._cmdf = false;
	    this._omdf = false;
	    if (this.prop._mdf || forceRender) {
	      var i;
	      var len = this.data.p * 4;
	      var mult;
	      var val2;
	      for (i = 0; i < len; i += 1) {
	        mult = i % 4 === 0 ? 100 : 255;
	        val2 = Math.round(this.prop.v[i] * mult);
	        if (this.c[i] !== val2) {
	          this.c[i] = val2;
	          this._cmdf = !forceRender;
	        }
	      }
	      if (this.o.length) {
	        len = this.prop.v.length;
	        for (i = this.data.p * 4; i < len; i += 1) {
	          mult = i % 2 === 0 ? 100 : 1;
	          val2 = i % 2 === 0 ? Math.round(this.prop.v[i] * 100) : this.prop.v[i];
	          if (this.o[i - this.data.p * 4] !== val2) {
	            this.o[i - this.data.p * 4] = val2;
	            this._omdf = !forceRender;
	          }
	        }
	      }
	      this._mdf = !forceRender;
	    }
	  };
	  extendPrototype([DynamicPropertyContainer], GradientProperty);
	  function SVGGradientFillStyleData(elem2, data2, styleOb) {
	    this.initDynamicPropertyContainer(elem2);
	    this.getValue = this.iterateDynamicProperties;
	    this.initGradientData(elem2, data2, styleOb);
	  }
	  SVGGradientFillStyleData.prototype.initGradientData = function(elem2, data2, styleOb) {
	    this.o = PropertyFactory.getProp(elem2, data2.o, 0, 0.01, this);
	    this.s = PropertyFactory.getProp(elem2, data2.s, 1, null, this);
	    this.e = PropertyFactory.getProp(elem2, data2.e, 1, null, this);
	    this.h = PropertyFactory.getProp(elem2, data2.h || {
	      k: 0
	    }, 0, 0.01, this);
	    this.a = PropertyFactory.getProp(elem2, data2.a || {
	      k: 0
	    }, 0, degToRads, this);
	    this.g = new GradientProperty(elem2, data2.g, this);
	    this.style = styleOb;
	    this.stops = [];
	    this.setGradientData(styleOb.pElem, data2);
	    this.setGradientOpacity(data2, styleOb);
	    this._isAnimated = !!this._isAnimated;
	  };
	  SVGGradientFillStyleData.prototype.setGradientData = function(pathElement, data2) {
	    var gradientId = createElementID();
	    var gfill = createNS(data2.t === 1 ? "linearGradient" : "radialGradient");
	    gfill.setAttribute("id", gradientId);
	    gfill.setAttribute("spreadMethod", "pad");
	    gfill.setAttribute("gradientUnits", "userSpaceOnUse");
	    var stops = [];
	    var stop;
	    var j;
	    var jLen;
	    jLen = data2.g.p * 4;
	    for (j = 0; j < jLen; j += 4) {
	      stop = createNS("stop");
	      gfill.appendChild(stop);
	      stops.push(stop);
	    }
	    pathElement.setAttribute(data2.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + gradientId + ")");
	    this.gf = gfill;
	    this.cst = stops;
	  };
	  SVGGradientFillStyleData.prototype.setGradientOpacity = function(data2, styleOb) {
	    if (this.g._hasOpacity && !this.g._collapsable) {
	      var stop;
	      var j;
	      var jLen;
	      var mask2 = createNS("mask");
	      var maskElement = createNS("path");
	      mask2.appendChild(maskElement);
	      var opacityId = createElementID();
	      var maskId = createElementID();
	      mask2.setAttribute("id", maskId);
	      var opFill = createNS(data2.t === 1 ? "linearGradient" : "radialGradient");
	      opFill.setAttribute("id", opacityId);
	      opFill.setAttribute("spreadMethod", "pad");
	      opFill.setAttribute("gradientUnits", "userSpaceOnUse");
	      jLen = data2.g.k.k[0].s ? data2.g.k.k[0].s.length : data2.g.k.k.length;
	      var stops = this.stops;
	      for (j = data2.g.p * 4; j < jLen; j += 2) {
	        stop = createNS("stop");
	        stop.setAttribute("stop-color", "rgb(255,255,255)");
	        opFill.appendChild(stop);
	        stops.push(stop);
	      }
	      maskElement.setAttribute(data2.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + opacityId + ")");
	      if (data2.ty === "gs") {
	        maskElement.setAttribute("stroke-linecap", lineCapEnum[data2.lc || 2]);
	        maskElement.setAttribute("stroke-linejoin", lineJoinEnum[data2.lj || 2]);
	        if (data2.lj === 1) {
	          maskElement.setAttribute("stroke-miterlimit", data2.ml);
	        }
	      }
	      this.of = opFill;
	      this.ms = mask2;
	      this.ost = stops;
	      this.maskId = maskId;
	      styleOb.msElem = maskElement;
	    }
	  };
	  extendPrototype([DynamicPropertyContainer], SVGGradientFillStyleData);
	  function SVGGradientStrokeStyleData(elem2, data2, styleOb) {
	    this.initDynamicPropertyContainer(elem2);
	    this.getValue = this.iterateDynamicProperties;
	    this.w = PropertyFactory.getProp(elem2, data2.w, 0, null, this);
	    this.d = new DashProperty(elem2, data2.d || {}, "svg", this);
	    this.initGradientData(elem2, data2, styleOb);
	    this._isAnimated = !!this._isAnimated;
	  }
	  extendPrototype([SVGGradientFillStyleData, DynamicPropertyContainer], SVGGradientStrokeStyleData);
	  function ShapeGroupData() {
	    this.it = [];
	    this.prevViewData = [];
	    this.gr = createNS("g");
	  }
	  function SVGTransformData(mProps, op, container) {
	    this.transform = {
	      mProps,
	      op,
	      container
	    };
	    this.elements = [];
	    this._isAnimated = this.transform.mProps.dynamicProperties.length || this.transform.op.effectsSequence.length;
	  }
	  var buildShapeString = function buildShapeString2(pathNodes, length2, closed, mat) {
	    if (length2 === 0) {
	      return "";
	    }
	    var _o = pathNodes.o;
	    var _i = pathNodes.i;
	    var _v = pathNodes.v;
	    var i;
	    var shapeString = " M" + mat.applyToPointStringified(_v[0][0], _v[0][1]);
	    for (i = 1; i < length2; i += 1) {
	      shapeString += " C" + mat.applyToPointStringified(_o[i - 1][0], _o[i - 1][1]) + " " + mat.applyToPointStringified(_i[i][0], _i[i][1]) + " " + mat.applyToPointStringified(_v[i][0], _v[i][1]);
	    }
	    if (closed && length2) {
	      shapeString += " C" + mat.applyToPointStringified(_o[i - 1][0], _o[i - 1][1]) + " " + mat.applyToPointStringified(_i[0][0], _i[0][1]) + " " + mat.applyToPointStringified(_v[0][0], _v[0][1]);
	      shapeString += "z";
	    }
	    return shapeString;
	  };
	  var SVGElementsRenderer = function() {
	    var _identityMatrix = new Matrix();
	    var _matrixHelper = new Matrix();
	    var ob2 = {
	      createRenderFunction
	    };
	    function createRenderFunction(data2) {
	      switch (data2.ty) {
	        case "fl":
	          return renderFill;
	        case "gf":
	          return renderGradient;
	        case "gs":
	          return renderGradientStroke;
	        case "st":
	          return renderStroke;
	        case "sh":
	        case "el":
	        case "rc":
	        case "sr":
	          return renderPath;
	        case "tr":
	          return renderContentTransform;
	        case "no":
	          return renderNoop;
	        default:
	          return null;
	      }
	    }
	    function renderContentTransform(styleData, itemData, isFirstFrame) {
	      if (isFirstFrame || itemData.transform.op._mdf) {
	        itemData.transform.container.setAttribute("opacity", itemData.transform.op.v);
	      }
	      if (isFirstFrame || itemData.transform.mProps._mdf) {
	        itemData.transform.container.setAttribute("transform", itemData.transform.mProps.v.to2dCSS());
	      }
	    }
	    function renderNoop() {
	    }
	    function renderPath(styleData, itemData, isFirstFrame) {
	      var j;
	      var jLen;
	      var pathStringTransformed;
	      var redraw;
	      var pathNodes;
	      var l;
	      var lLen = itemData.styles.length;
	      var lvl = itemData.lvl;
	      var paths;
	      var mat;
	      var iterations;
	      var k;
	      for (l = 0; l < lLen; l += 1) {
	        redraw = itemData.sh._mdf || isFirstFrame;
	        if (itemData.styles[l].lvl < lvl) {
	          mat = _matrixHelper.reset();
	          iterations = lvl - itemData.styles[l].lvl;
	          k = itemData.transformers.length - 1;
	          while (!redraw && iterations > 0) {
	            redraw = itemData.transformers[k].mProps._mdf || redraw;
	            iterations -= 1;
	            k -= 1;
	          }
	          if (redraw) {
	            iterations = lvl - itemData.styles[l].lvl;
	            k = itemData.transformers.length - 1;
	            while (iterations > 0) {
	              mat.multiply(itemData.transformers[k].mProps.v);
	              iterations -= 1;
	              k -= 1;
	            }
	          }
	        } else {
	          mat = _identityMatrix;
	        }
	        paths = itemData.sh.paths;
	        jLen = paths._length;
	        if (redraw) {
	          pathStringTransformed = "";
	          for (j = 0; j < jLen; j += 1) {
	            pathNodes = paths.shapes[j];
	            if (pathNodes && pathNodes._length) {
	              pathStringTransformed += buildShapeString(pathNodes, pathNodes._length, pathNodes.c, mat);
	            }
	          }
	          itemData.caches[l] = pathStringTransformed;
	        } else {
	          pathStringTransformed = itemData.caches[l];
	        }
	        itemData.styles[l].d += styleData.hd === true ? "" : pathStringTransformed;
	        itemData.styles[l]._mdf = redraw || itemData.styles[l]._mdf;
	      }
	    }
	    function renderFill(styleData, itemData, isFirstFrame) {
	      var styleElem = itemData.style;
	      if (itemData.c._mdf || isFirstFrame) {
	        styleElem.pElem.setAttribute("fill", "rgb(" + bmFloor(itemData.c.v[0]) + "," + bmFloor(itemData.c.v[1]) + "," + bmFloor(itemData.c.v[2]) + ")");
	      }
	      if (itemData.o._mdf || isFirstFrame) {
	        styleElem.pElem.setAttribute("fill-opacity", itemData.o.v);
	      }
	    }
	    function renderGradientStroke(styleData, itemData, isFirstFrame) {
	      renderGradient(styleData, itemData, isFirstFrame);
	      renderStroke(styleData, itemData, isFirstFrame);
	    }
	    function renderGradient(styleData, itemData, isFirstFrame) {
	      var gfill = itemData.gf;
	      var hasOpacity = itemData.g._hasOpacity;
	      var pt1 = itemData.s.v;
	      var pt2 = itemData.e.v;
	      if (itemData.o._mdf || isFirstFrame) {
	        var attr = styleData.ty === "gf" ? "fill-opacity" : "stroke-opacity";
	        itemData.style.pElem.setAttribute(attr, itemData.o.v);
	      }
	      if (itemData.s._mdf || isFirstFrame) {
	        var attr1 = styleData.t === 1 ? "x1" : "cx";
	        var attr2 = attr1 === "x1" ? "y1" : "cy";
	        gfill.setAttribute(attr1, pt1[0]);
	        gfill.setAttribute(attr2, pt1[1]);
	        if (hasOpacity && !itemData.g._collapsable) {
	          itemData.of.setAttribute(attr1, pt1[0]);
	          itemData.of.setAttribute(attr2, pt1[1]);
	        }
	      }
	      var stops;
	      var i;
	      var len;
	      var stop;
	      if (itemData.g._cmdf || isFirstFrame) {
	        stops = itemData.cst;
	        var cValues = itemData.g.c;
	        len = stops.length;
	        for (i = 0; i < len; i += 1) {
	          stop = stops[i];
	          stop.setAttribute("offset", cValues[i * 4] + "%");
	          stop.setAttribute("stop-color", "rgb(" + cValues[i * 4 + 1] + "," + cValues[i * 4 + 2] + "," + cValues[i * 4 + 3] + ")");
	        }
	      }
	      if (hasOpacity && (itemData.g._omdf || isFirstFrame)) {
	        var oValues = itemData.g.o;
	        if (itemData.g._collapsable) {
	          stops = itemData.cst;
	        } else {
	          stops = itemData.ost;
	        }
	        len = stops.length;
	        for (i = 0; i < len; i += 1) {
	          stop = stops[i];
	          if (!itemData.g._collapsable) {
	            stop.setAttribute("offset", oValues[i * 2] + "%");
	          }
	          stop.setAttribute("stop-opacity", oValues[i * 2 + 1]);
	        }
	      }
	      if (styleData.t === 1) {
	        if (itemData.e._mdf || isFirstFrame) {
	          gfill.setAttribute("x2", pt2[0]);
	          gfill.setAttribute("y2", pt2[1]);
	          if (hasOpacity && !itemData.g._collapsable) {
	            itemData.of.setAttribute("x2", pt2[0]);
	            itemData.of.setAttribute("y2", pt2[1]);
	          }
	        }
	      } else {
	        var rad;
	        if (itemData.s._mdf || itemData.e._mdf || isFirstFrame) {
	          rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
	          gfill.setAttribute("r", rad);
	          if (hasOpacity && !itemData.g._collapsable) {
	            itemData.of.setAttribute("r", rad);
	          }
	        }
	        if (itemData.s._mdf || itemData.e._mdf || itemData.h._mdf || itemData.a._mdf || isFirstFrame) {
	          if (!rad) {
	            rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
	          }
	          var ang = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]);
	          var percent = itemData.h.v;
	          if (percent >= 1) {
	            percent = 0.99;
	          } else if (percent <= -1) {
	            percent = -0.99;
	          }
	          var dist = rad * percent;
	          var x = Math.cos(ang + itemData.a.v) * dist + pt1[0];
	          var y = Math.sin(ang + itemData.a.v) * dist + pt1[1];
	          gfill.setAttribute("fx", x);
	          gfill.setAttribute("fy", y);
	          if (hasOpacity && !itemData.g._collapsable) {
	            itemData.of.setAttribute("fx", x);
	            itemData.of.setAttribute("fy", y);
	          }
	        }
	      }
	    }
	    function renderStroke(styleData, itemData, isFirstFrame) {
	      var styleElem = itemData.style;
	      var d = itemData.d;
	      if (d && (d._mdf || isFirstFrame) && d.dashStr) {
	        styleElem.pElem.setAttribute("stroke-dasharray", d.dashStr);
	        styleElem.pElem.setAttribute("stroke-dashoffset", d.dashoffset[0]);
	      }
	      if (itemData.c && (itemData.c._mdf || isFirstFrame)) {
	        styleElem.pElem.setAttribute("stroke", "rgb(" + bmFloor(itemData.c.v[0]) + "," + bmFloor(itemData.c.v[1]) + "," + bmFloor(itemData.c.v[2]) + ")");
	      }
	      if (itemData.o._mdf || isFirstFrame) {
	        styleElem.pElem.setAttribute("stroke-opacity", itemData.o.v);
	      }
	      if (itemData.w._mdf || isFirstFrame) {
	        styleElem.pElem.setAttribute("stroke-width", itemData.w.v);
	        if (styleElem.msElem) {
	          styleElem.msElem.setAttribute("stroke-width", itemData.w.v);
	        }
	      }
	    }
	    return ob2;
	  }();
	  function SVGShapeElement(data2, globalData2, comp2) {
	    this.shapes = [];
	    this.shapesData = data2.shapes;
	    this.stylesList = [];
	    this.shapeModifiers = [];
	    this.itemsData = [];
	    this.processedElements = [];
	    this.animatedContents = [];
	    this.initElement(data2, globalData2, comp2);
	    this.prevViewData = [];
	  }
	  extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableDOMElement], SVGShapeElement);
	  SVGShapeElement.prototype.initSecondaryElement = function() {
	  };
	  SVGShapeElement.prototype.identityMatrix = new Matrix();
	  SVGShapeElement.prototype.buildExpressionInterface = function() {
	  };
	  SVGShapeElement.prototype.createContent = function() {
	    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], true);
	    this.filterUniqueShapes();
	  };
	  SVGShapeElement.prototype.filterUniqueShapes = function() {
	    var i;
	    var len = this.shapes.length;
	    var shape;
	    var j;
	    var jLen = this.stylesList.length;
	    var style;
	    var tempShapes = [];
	    var areAnimated = false;
	    for (j = 0; j < jLen; j += 1) {
	      style = this.stylesList[j];
	      areAnimated = false;
	      tempShapes.length = 0;
	      for (i = 0; i < len; i += 1) {
	        shape = this.shapes[i];
	        if (shape.styles.indexOf(style) !== -1) {
	          tempShapes.push(shape);
	          areAnimated = shape._isAnimated || areAnimated;
	        }
	      }
	      if (tempShapes.length > 1 && areAnimated) {
	        this.setShapesAsAnimated(tempShapes);
	      }
	    }
	  };
	  SVGShapeElement.prototype.setShapesAsAnimated = function(shapes) {
	    var i;
	    var len = shapes.length;
	    for (i = 0; i < len; i += 1) {
	      shapes[i].setAsAnimated();
	    }
	  };
	  SVGShapeElement.prototype.createStyleElement = function(data2, level) {
	    var elementData;
	    var styleOb = new SVGStyleData(data2, level);
	    var pathElement = styleOb.pElem;
	    if (data2.ty === "st") {
	      elementData = new SVGStrokeStyleData(this, data2, styleOb);
	    } else if (data2.ty === "fl") {
	      elementData = new SVGFillStyleData(this, data2, styleOb);
	    } else if (data2.ty === "gf" || data2.ty === "gs") {
	      var GradientConstructor = data2.ty === "gf" ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
	      elementData = new GradientConstructor(this, data2, styleOb);
	      this.globalData.defs.appendChild(elementData.gf);
	      if (elementData.maskId) {
	        this.globalData.defs.appendChild(elementData.ms);
	        this.globalData.defs.appendChild(elementData.of);
	        pathElement.setAttribute("mask", "url(" + getLocationHref() + "#" + elementData.maskId + ")");
	      }
	    } else if (data2.ty === "no") {
	      elementData = new SVGNoStyleData(this, data2, styleOb);
	    }
	    if (data2.ty === "st" || data2.ty === "gs") {
	      pathElement.setAttribute("stroke-linecap", lineCapEnum[data2.lc || 2]);
	      pathElement.setAttribute("stroke-linejoin", lineJoinEnum[data2.lj || 2]);
	      pathElement.setAttribute("fill-opacity", "0");
	      if (data2.lj === 1) {
	        pathElement.setAttribute("stroke-miterlimit", data2.ml);
	      }
	    }
	    if (data2.r === 2) {
	      pathElement.setAttribute("fill-rule", "evenodd");
	    }
	    if (data2.ln) {
	      pathElement.setAttribute("id", data2.ln);
	    }
	    if (data2.cl) {
	      pathElement.setAttribute("class", data2.cl);
	    }
	    if (data2.bm) {
	      pathElement.style["mix-blend-mode"] = getBlendMode(data2.bm);
	    }
	    this.stylesList.push(styleOb);
	    this.addToAnimatedContents(data2, elementData);
	    return elementData;
	  };
	  SVGShapeElement.prototype.createGroupElement = function(data2) {
	    var elementData = new ShapeGroupData();
	    if (data2.ln) {
	      elementData.gr.setAttribute("id", data2.ln);
	    }
	    if (data2.cl) {
	      elementData.gr.setAttribute("class", data2.cl);
	    }
	    if (data2.bm) {
	      elementData.gr.style["mix-blend-mode"] = getBlendMode(data2.bm);
	    }
	    return elementData;
	  };
	  SVGShapeElement.prototype.createTransformElement = function(data2, container) {
	    var transformProperty = TransformPropertyFactory.getTransformProperty(this, data2, this);
	    var elementData = new SVGTransformData(transformProperty, transformProperty.o, container);
	    this.addToAnimatedContents(data2, elementData);
	    return elementData;
	  };
	  SVGShapeElement.prototype.createShapeElement = function(data2, ownTransformers, level) {
	    var ty = 4;
	    if (data2.ty === "rc") {
	      ty = 5;
	    } else if (data2.ty === "el") {
	      ty = 6;
	    } else if (data2.ty === "sr") {
	      ty = 7;
	    }
	    var shapeProperty = ShapePropertyFactory.getShapeProp(this, data2, ty, this);
	    var elementData = new SVGShapeData(ownTransformers, level, shapeProperty);
	    this.shapes.push(elementData);
	    this.addShapeToModifiers(elementData);
	    this.addToAnimatedContents(data2, elementData);
	    return elementData;
	  };
	  SVGShapeElement.prototype.addToAnimatedContents = function(data2, element) {
	    var i = 0;
	    var len = this.animatedContents.length;
	    while (i < len) {
	      if (this.animatedContents[i].element === element) {
	        return;
	      }
	      i += 1;
	    }
	    this.animatedContents.push({
	      fn: SVGElementsRenderer.createRenderFunction(data2),
	      element,
	      data: data2
	    });
	  };
	  SVGShapeElement.prototype.setElementStyles = function(elementData) {
	    var arr = elementData.styles;
	    var j;
	    var jLen = this.stylesList.length;
	    for (j = 0; j < jLen; j += 1) {
	      if (arr.indexOf(this.stylesList[j]) === -1 && !this.stylesList[j].closed) {
	        arr.push(this.stylesList[j]);
	      }
	    }
	  };
	  SVGShapeElement.prototype.reloadShapes = function() {
	    this._isFirstFrame = true;
	    var i;
	    var len = this.itemsData.length;
	    for (i = 0; i < len; i += 1) {
	      this.prevViewData[i] = this.itemsData[i];
	    }
	    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], true);
	    this.filterUniqueShapes();
	    len = this.dynamicProperties.length;
	    for (i = 0; i < len; i += 1) {
	      this.dynamicProperties[i].getValue();
	    }
	    this.renderModifiers();
	  };
	  SVGShapeElement.prototype.searchShapes = function(arr, itemsData, prevViewData, container, level, transformers, render) {
	    var ownTransformers = [].concat(transformers);
	    var i;
	    var len = arr.length - 1;
	    var j;
	    var jLen;
	    var ownStyles = [];
	    var ownModifiers = [];
	    var currentTransform;
	    var modifier;
	    var processedPos;
	    for (i = len; i >= 0; i -= 1) {
	      processedPos = this.searchProcessedElement(arr[i]);
	      if (!processedPos) {
	        arr[i]._render = render;
	      } else {
	        itemsData[i] = prevViewData[processedPos - 1];
	      }
	      if (arr[i].ty === "fl" || arr[i].ty === "st" || arr[i].ty === "gf" || arr[i].ty === "gs" || arr[i].ty === "no") {
	        if (!processedPos) {
	          itemsData[i] = this.createStyleElement(arr[i], level);
	        } else {
	          itemsData[i].style.closed = arr[i].hd;
	        }
	        if (arr[i]._render) {
	          if (itemsData[i].style.pElem.parentNode !== container) {
	            container.appendChild(itemsData[i].style.pElem);
	          }
	        }
	        ownStyles.push(itemsData[i].style);
	      } else if (arr[i].ty === "gr") {
	        if (!processedPos) {
	          itemsData[i] = this.createGroupElement(arr[i]);
	        } else {
	          jLen = itemsData[i].it.length;
	          for (j = 0; j < jLen; j += 1) {
	            itemsData[i].prevViewData[j] = itemsData[i].it[j];
	          }
	        }
	        this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, itemsData[i].gr, level + 1, ownTransformers, render);
	        if (arr[i]._render) {
	          if (itemsData[i].gr.parentNode !== container) {
	            container.appendChild(itemsData[i].gr);
	          }
	        }
	      } else if (arr[i].ty === "tr") {
	        if (!processedPos) {
	          itemsData[i] = this.createTransformElement(arr[i], container);
	        }
	        currentTransform = itemsData[i].transform;
	        ownTransformers.push(currentTransform);
	      } else if (arr[i].ty === "sh" || arr[i].ty === "rc" || arr[i].ty === "el" || arr[i].ty === "sr") {
	        if (!processedPos) {
	          itemsData[i] = this.createShapeElement(arr[i], ownTransformers, level);
	        }
	        this.setElementStyles(itemsData[i]);
	      } else if (arr[i].ty === "tm" || arr[i].ty === "rd" || arr[i].ty === "ms" || arr[i].ty === "pb" || arr[i].ty === "zz" || arr[i].ty === "op") {
	        if (!processedPos) {
	          modifier = ShapeModifiers.getModifier(arr[i].ty);
	          modifier.init(this, arr[i]);
	          itemsData[i] = modifier;
	          this.shapeModifiers.push(modifier);
	        } else {
	          modifier = itemsData[i];
	          modifier.closed = false;
	        }
	        ownModifiers.push(modifier);
	      } else if (arr[i].ty === "rp") {
	        if (!processedPos) {
	          modifier = ShapeModifiers.getModifier(arr[i].ty);
	          itemsData[i] = modifier;
	          modifier.init(this, arr, i, itemsData);
	          this.shapeModifiers.push(modifier);
	          render = false;
	        } else {
	          modifier = itemsData[i];
	          modifier.closed = true;
	        }
	        ownModifiers.push(modifier);
	      }
	      this.addProcessedElement(arr[i], i + 1);
	    }
	    len = ownStyles.length;
	    for (i = 0; i < len; i += 1) {
	      ownStyles[i].closed = true;
	    }
	    len = ownModifiers.length;
	    for (i = 0; i < len; i += 1) {
	      ownModifiers[i].closed = true;
	    }
	  };
	  SVGShapeElement.prototype.renderInnerContent = function() {
	    this.renderModifiers();
	    var i;
	    var len = this.stylesList.length;
	    for (i = 0; i < len; i += 1) {
	      this.stylesList[i].reset();
	    }
	    this.renderShape();
	    for (i = 0; i < len; i += 1) {
	      if (this.stylesList[i]._mdf || this._isFirstFrame) {
	        if (this.stylesList[i].msElem) {
	          this.stylesList[i].msElem.setAttribute("d", this.stylesList[i].d);
	          this.stylesList[i].d = "M0 0" + this.stylesList[i].d;
	        }
	        this.stylesList[i].pElem.setAttribute("d", this.stylesList[i].d || "M0 0");
	      }
	    }
	  };
	  SVGShapeElement.prototype.renderShape = function() {
	    var i;
	    var len = this.animatedContents.length;
	    var animatedContent;
	    for (i = 0; i < len; i += 1) {
	      animatedContent = this.animatedContents[i];
	      if ((this._isFirstFrame || animatedContent.element._isAnimated) && animatedContent.data !== true) {
	        animatedContent.fn(animatedContent.data, animatedContent.element, this._isFirstFrame);
	      }
	    }
	  };
	  SVGShapeElement.prototype.destroy = function() {
	    this.destroyBaseElement();
	    this.shapesData = null;
	    this.itemsData = null;
	  };
	  function LetterProps(o, sw, sc, fc, m, p) {
	    this.o = o;
	    this.sw = sw;
	    this.sc = sc;
	    this.fc = fc;
	    this.m = m;
	    this.p = p;
	    this._mdf = {
	      o: true,
	      sw: !!sw,
	      sc: !!sc,
	      fc: !!fc,
	      m: true,
	      p: true
	    };
	  }
	  LetterProps.prototype.update = function(o, sw, sc, fc, m, p) {
	    this._mdf.o = false;
	    this._mdf.sw = false;
	    this._mdf.sc = false;
	    this._mdf.fc = false;
	    this._mdf.m = false;
	    this._mdf.p = false;
	    var updated = false;
	    if (this.o !== o) {
	      this.o = o;
	      this._mdf.o = true;
	      updated = true;
	    }
	    if (this.sw !== sw) {
	      this.sw = sw;
	      this._mdf.sw = true;
	      updated = true;
	    }
	    if (this.sc !== sc) {
	      this.sc = sc;
	      this._mdf.sc = true;
	      updated = true;
	    }
	    if (this.fc !== fc) {
	      this.fc = fc;
	      this._mdf.fc = true;
	      updated = true;
	    }
	    if (this.m !== m) {
	      this.m = m;
	      this._mdf.m = true;
	      updated = true;
	    }
	    if (p.length && (this.p[0] !== p[0] || this.p[1] !== p[1] || this.p[4] !== p[4] || this.p[5] !== p[5] || this.p[12] !== p[12] || this.p[13] !== p[13])) {
	      this.p = p;
	      this._mdf.p = true;
	      updated = true;
	    }
	    return updated;
	  };
	  function TextProperty(elem2, data2) {
	    this._frameId = initialDefaultFrame;
	    this.pv = "";
	    this.v = "";
	    this.kf = false;
	    this._isFirstFrame = true;
	    this._mdf = false;
	    if (data2.d && data2.d.sid) {
	      data2.d = elem2.globalData.slotManager.getProp(data2.d);
	    }
	    this.data = data2;
	    this.elem = elem2;
	    this.comp = this.elem.comp;
	    this.keysIndex = 0;
	    this.canResize = false;
	    this.minimumFontSize = 1;
	    this.effectsSequence = [];
	    this.currentData = {
	      ascent: 0,
	      boxWidth: this.defaultBoxWidth,
	      f: "",
	      fStyle: "",
	      fWeight: "",
	      fc: "",
	      j: "",
	      justifyOffset: "",
	      l: [],
	      lh: 0,
	      lineWidths: [],
	      ls: "",
	      of: "",
	      s: "",
	      sc: "",
	      sw: 0,
	      t: 0,
	      tr: 0,
	      sz: 0,
	      ps: null,
	      fillColorAnim: false,
	      strokeColorAnim: false,
	      strokeWidthAnim: false,
	      yOffset: 0,
	      finalSize: 0,
	      finalText: [],
	      finalLineHeight: 0,
	      __complete: false
	    };
	    this.copyData(this.currentData, this.data.d.k[0].s);
	    if (!this.searchProperty()) {
	      this.completeTextData(this.currentData);
	    }
	  }
	  TextProperty.prototype.defaultBoxWidth = [0, 0];
	  TextProperty.prototype.copyData = function(obj, data2) {
	    for (var s in data2) {
	      if (Object.prototype.hasOwnProperty.call(data2, s)) {
	        obj[s] = data2[s];
	      }
	    }
	    return obj;
	  };
	  TextProperty.prototype.setCurrentData = function(data2) {
	    if (!data2.__complete) {
	      this.completeTextData(data2);
	    }
	    this.currentData = data2;
	    this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth;
	    this._mdf = true;
	  };
	  TextProperty.prototype.searchProperty = function() {
	    return this.searchKeyframes();
	  };
	  TextProperty.prototype.searchKeyframes = function() {
	    this.kf = this.data.d.k.length > 1;
	    if (this.kf) {
	      this.addEffect(this.getKeyframeValue.bind(this));
	    }
	    return this.kf;
	  };
	  TextProperty.prototype.addEffect = function(effectFunction) {
	    this.effectsSequence.push(effectFunction);
	    this.elem.addDynamicProperty(this);
	  };
	  TextProperty.prototype.getValue = function(_finalValue) {
	    if ((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !_finalValue) {
	      return;
	    }
	    this.currentData.t = this.data.d.k[this.keysIndex].s.t;
	    var currentValue = this.currentData;
	    var currentIndex = this.keysIndex;
	    if (this.lock) {
	      this.setCurrentData(this.currentData);
	      return;
	    }
	    this.lock = true;
	    this._mdf = false;
	    var i;
	    var len = this.effectsSequence.length;
	    var finalValue = _finalValue || this.data.d.k[this.keysIndex].s;
	    for (i = 0; i < len; i += 1) {
	      if (currentIndex !== this.keysIndex) {
	        finalValue = this.effectsSequence[i](finalValue, finalValue.t);
	      } else {
	        finalValue = this.effectsSequence[i](this.currentData, finalValue.t);
	      }
	    }
	    if (currentValue !== finalValue) {
	      this.setCurrentData(finalValue);
	    }
	    this.v = this.currentData;
	    this.pv = this.v;
	    this.lock = false;
	    this.frameId = this.elem.globalData.frameId;
	  };
	  TextProperty.prototype.getKeyframeValue = function() {
	    var textKeys = this.data.d.k;
	    var frameNum = this.elem.comp.renderedFrame;
	    var i = 0;
	    var len = textKeys.length;
	    while (i <= len - 1) {
	      if (i === len - 1 || textKeys[i + 1].t > frameNum) {
	        break;
	      }
	      i += 1;
	    }
	    if (this.keysIndex !== i) {
	      this.keysIndex = i;
	    }
	    return this.data.d.k[this.keysIndex].s;
	  };
	  TextProperty.prototype.buildFinalText = function(text2) {
	    var charactersArray = [];
	    var i = 0;
	    var len = text2.length;
	    var charCode;
	    var secondCharCode;
	    var shouldCombine = false;
	    var shouldCombineNext = false;
	    var currentChars = "";
	    while (i < len) {
	      shouldCombine = shouldCombineNext;
	      shouldCombineNext = false;
	      charCode = text2.charCodeAt(i);
	      currentChars = text2.charAt(i);
	      if (FontManager.isCombinedCharacter(charCode)) {
	        shouldCombine = true;
	      } else if (charCode >= 55296 && charCode <= 56319) {
	        if (FontManager.isRegionalFlag(text2, i)) {
	          currentChars = text2.substr(i, 14);
	        } else {
	          secondCharCode = text2.charCodeAt(i + 1);
	          if (secondCharCode >= 56320 && secondCharCode <= 57343) {
	            if (FontManager.isModifier(charCode, secondCharCode)) {
	              currentChars = text2.substr(i, 2);
	              shouldCombine = true;
	            } else if (FontManager.isFlagEmoji(text2.substr(i, 4))) {
	              currentChars = text2.substr(i, 4);
	            } else {
	              currentChars = text2.substr(i, 2);
	            }
	          }
	        }
	      } else if (charCode > 56319) {
	        secondCharCode = text2.charCodeAt(i + 1);
	        if (FontManager.isVariationSelector(charCode)) {
	          shouldCombine = true;
	        }
	      } else if (FontManager.isZeroWidthJoiner(charCode)) {
	        shouldCombine = true;
	        shouldCombineNext = true;
	      }
	      if (shouldCombine) {
	        charactersArray[charactersArray.length - 1] += currentChars;
	        shouldCombine = false;
	      } else {
	        charactersArray.push(currentChars);
	      }
	      i += currentChars.length;
	    }
	    return charactersArray;
	  };
	  TextProperty.prototype.completeTextData = function(documentData) {
	    documentData.__complete = true;
	    var fontManager = this.elem.globalData.fontManager;
	    var data2 = this.data;
	    var letters = [];
	    var i;
	    var len;
	    var newLineFlag;
	    var index2 = 0;
	    var val2;
	    var anchorGrouping = data2.m.g;
	    var currentSize = 0;
	    var currentPos = 0;
	    var currentLine = 0;
	    var lineWidths = [];
	    var lineWidth = 0;
	    var maxLineWidth = 0;
	    var j;
	    var jLen;
	    var fontData = fontManager.getFontByName(documentData.f);
	    var charData;
	    var cLength = 0;
	    var fontProps = getFontProperties(fontData);
	    documentData.fWeight = fontProps.weight;
	    documentData.fStyle = fontProps.style;
	    documentData.finalSize = documentData.s;
	    documentData.finalText = this.buildFinalText(documentData.t);
	    len = documentData.finalText.length;
	    documentData.finalLineHeight = documentData.lh;
	    var trackingOffset = documentData.tr / 1e3 * documentData.finalSize;
	    var charCode;
	    if (documentData.sz) {
	      var flag = true;
	      var boxWidth = documentData.sz[0];
	      var boxHeight = documentData.sz[1];
	      var currentHeight;
	      var finalText;
	      while (flag) {
	        finalText = this.buildFinalText(documentData.t);
	        currentHeight = 0;
	        lineWidth = 0;
	        len = finalText.length;
	        trackingOffset = documentData.tr / 1e3 * documentData.finalSize;
	        var lastSpaceIndex = -1;
	        for (i = 0; i < len; i += 1) {
	          charCode = finalText[i].charCodeAt(0);
	          newLineFlag = false;
	          if (finalText[i] === " ") {
	            lastSpaceIndex = i;
	          } else if (charCode === 13 || charCode === 3) {
	            lineWidth = 0;
	            newLineFlag = true;
	            currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
	          }
	          if (fontManager.chars) {
	            charData = fontManager.getCharData(finalText[i], fontData.fStyle, fontData.fFamily);
	            cLength = newLineFlag ? 0 : charData.w * documentData.finalSize / 100;
	          } else {
	            cLength = fontManager.measureText(finalText[i], documentData.f, documentData.finalSize);
	          }
	          if (lineWidth + cLength > boxWidth && finalText[i] !== " ") {
	            if (lastSpaceIndex === -1) {
	              len += 1;
	            } else {
	              i = lastSpaceIndex;
	            }
	            currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
	            finalText.splice(i, lastSpaceIndex === i ? 1 : 0, "\r");
	            lastSpaceIndex = -1;
	            lineWidth = 0;
	          } else {
	            lineWidth += cLength;
	            lineWidth += trackingOffset;
	          }
	        }
	        currentHeight += fontData.ascent * documentData.finalSize / 100;
	        if (this.canResize && documentData.finalSize > this.minimumFontSize && boxHeight < currentHeight) {
	          documentData.finalSize -= 1;
	          documentData.finalLineHeight = documentData.finalSize * documentData.lh / documentData.s;
	        } else {
	          documentData.finalText = finalText;
	          len = documentData.finalText.length;
	          flag = false;
	        }
	      }
	    }
	    lineWidth = -trackingOffset;
	    cLength = 0;
	    var uncollapsedSpaces = 0;
	    var currentChar;
	    for (i = 0; i < len; i += 1) {
	      newLineFlag = false;
	      currentChar = documentData.finalText[i];
	      charCode = currentChar.charCodeAt(0);
	      if (charCode === 13 || charCode === 3) {
	        uncollapsedSpaces = 0;
	        lineWidths.push(lineWidth);
	        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
	        lineWidth = -2 * trackingOffset;
	        val2 = "";
	        newLineFlag = true;
	        currentLine += 1;
	      } else {
	        val2 = currentChar;
	      }
	      if (fontManager.chars) {
	        charData = fontManager.getCharData(currentChar, fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
	        cLength = newLineFlag ? 0 : charData.w * documentData.finalSize / 100;
	      } else {
	        cLength = fontManager.measureText(val2, documentData.f, documentData.finalSize);
	      }
	      if (currentChar === " ") {
	        uncollapsedSpaces += cLength + trackingOffset;
	      } else {
	        lineWidth += cLength + trackingOffset + uncollapsedSpaces;
	        uncollapsedSpaces = 0;
	      }
	      letters.push({
	        l: cLength,
	        an: cLength,
	        add: currentSize,
	        n: newLineFlag,
	        anIndexes: [],
	        val: val2,
	        line: currentLine,
	        animatorJustifyOffset: 0
	      });
	      if (anchorGrouping == 2) {
	        currentSize += cLength;
	        if (val2 === "" || val2 === " " || i === len - 1) {
	          if (val2 === "" || val2 === " ") {
	            currentSize -= cLength;
	          }
	          while (currentPos <= i) {
	            letters[currentPos].an = currentSize;
	            letters[currentPos].ind = index2;
	            letters[currentPos].extra = cLength;
	            currentPos += 1;
	          }
	          index2 += 1;
	          currentSize = 0;
	        }
	      } else if (anchorGrouping == 3) {
	        currentSize += cLength;
	        if (val2 === "" || i === len - 1) {
	          if (val2 === "") {
	            currentSize -= cLength;
	          }
	          while (currentPos <= i) {
	            letters[currentPos].an = currentSize;
	            letters[currentPos].ind = index2;
	            letters[currentPos].extra = cLength;
	            currentPos += 1;
	          }
	          currentSize = 0;
	          index2 += 1;
	        }
	      } else {
	        letters[index2].ind = index2;
	        letters[index2].extra = 0;
	        index2 += 1;
	      }
	    }
	    documentData.l = letters;
	    maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
	    lineWidths.push(lineWidth);
	    if (documentData.sz) {
	      documentData.boxWidth = documentData.sz[0];
	      documentData.justifyOffset = 0;
	    } else {
	      documentData.boxWidth = maxLineWidth;
	      switch (documentData.j) {
	        case 1:
	          documentData.justifyOffset = -documentData.boxWidth;
	          break;
	        case 2:
	          documentData.justifyOffset = -documentData.boxWidth / 2;
	          break;
	        default:
	          documentData.justifyOffset = 0;
	      }
	    }
	    documentData.lineWidths = lineWidths;
	    var animators = data2.a;
	    var animatorData;
	    var letterData;
	    jLen = animators.length;
	    var based;
	    var ind;
	    var indexes = [];
	    for (j = 0; j < jLen; j += 1) {
	      animatorData = animators[j];
	      if (animatorData.a.sc) {
	        documentData.strokeColorAnim = true;
	      }
	      if (animatorData.a.sw) {
	        documentData.strokeWidthAnim = true;
	      }
	      if (animatorData.a.fc || animatorData.a.fh || animatorData.a.fs || animatorData.a.fb) {
	        documentData.fillColorAnim = true;
	      }
	      ind = 0;
	      based = animatorData.s.b;
	      for (i = 0; i < len; i += 1) {
	        letterData = letters[i];
	        letterData.anIndexes[j] = ind;
	        if (based == 1 && letterData.val !== "" || based == 2 && letterData.val !== "" && letterData.val !== " " || based == 3 && (letterData.n || letterData.val == " " || i == len - 1) || based == 4 && (letterData.n || i == len - 1)) {
	          if (animatorData.s.rn === 1) {
	            indexes.push(ind);
	          }
	          ind += 1;
	        }
	      }
	      data2.a[j].s.totalChars = ind;
	      var currentInd = -1;
	      var newInd;
	      if (animatorData.s.rn === 1) {
	        for (i = 0; i < len; i += 1) {
	          letterData = letters[i];
	          if (currentInd != letterData.anIndexes[j]) {
	            currentInd = letterData.anIndexes[j];
	            newInd = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
	          }
	          letterData.anIndexes[j] = newInd;
	        }
	      }
	    }
	    documentData.yOffset = documentData.finalLineHeight || documentData.finalSize * 1.2;
	    documentData.ls = documentData.ls || 0;
	    documentData.ascent = fontData.ascent * documentData.finalSize / 100;
	  };
	  TextProperty.prototype.updateDocumentData = function(newData, index2) {
	    index2 = index2 === void 0 ? this.keysIndex : index2;
	    var dData = this.copyData({}, this.data.d.k[index2].s);
	    dData = this.copyData(dData, newData);
	    this.data.d.k[index2].s = dData;
	    this.recalculate(index2);
	    this.setCurrentData(dData);
	    this.elem.addDynamicProperty(this);
	  };
	  TextProperty.prototype.recalculate = function(index2) {
	    var dData = this.data.d.k[index2].s;
	    dData.__complete = false;
	    this.keysIndex = 0;
	    this._isFirstFrame = true;
	    this.getValue(dData);
	  };
	  TextProperty.prototype.canResizeFont = function(_canResize) {
	    this.canResize = _canResize;
	    this.recalculate(this.keysIndex);
	    this.elem.addDynamicProperty(this);
	  };
	  TextProperty.prototype.setMinimumFontSize = function(_fontValue) {
	    this.minimumFontSize = Math.floor(_fontValue) || 1;
	    this.recalculate(this.keysIndex);
	    this.elem.addDynamicProperty(this);
	  };
	  var TextSelectorProp = function() {
	    var max = Math.max;
	    var min = Math.min;
	    var floor = Math.floor;
	    function TextSelectorPropFactory(elem2, data2) {
	      this._currentTextLength = -1;
	      this.k = false;
	      this.data = data2;
	      this.elem = elem2;
	      this.comp = elem2.comp;
	      this.finalS = 0;
	      this.finalE = 0;
	      this.initDynamicPropertyContainer(elem2);
	      this.s = PropertyFactory.getProp(elem2, data2.s || {
	        k: 0
	      }, 0, 0, this);
	      if ("e" in data2) {
	        this.e = PropertyFactory.getProp(elem2, data2.e, 0, 0, this);
	      } else {
	        this.e = {
	          v: 100
	        };
	      }
	      this.o = PropertyFactory.getProp(elem2, data2.o || {
	        k: 0
	      }, 0, 0, this);
	      this.xe = PropertyFactory.getProp(elem2, data2.xe || {
	        k: 0
	      }, 0, 0, this);
	      this.ne = PropertyFactory.getProp(elem2, data2.ne || {
	        k: 0
	      }, 0, 0, this);
	      this.sm = PropertyFactory.getProp(elem2, data2.sm || {
	        k: 100
	      }, 0, 0, this);
	      this.a = PropertyFactory.getProp(elem2, data2.a, 0, 0.01, this);
	      if (!this.dynamicProperties.length) {
	        this.getValue();
	      }
	    }
	    TextSelectorPropFactory.prototype = {
	      getMult: function getMult(ind) {
	        if (this._currentTextLength !== this.elem.textProperty.currentData.l.length) {
	          this.getValue();
	        }
	        var x1 = 0;
	        var y1 = 0;
	        var x2 = 1;
	        var y2 = 1;
	        if (this.ne.v > 0) {
	          x1 = this.ne.v / 100;
	        } else {
	          y1 = -this.ne.v / 100;
	        }
	        if (this.xe.v > 0) {
	          x2 = 1 - this.xe.v / 100;
	        } else {
	          y2 = 1 + this.xe.v / 100;
	        }
	        var easer = BezierFactory.getBezierEasing(x1, y1, x2, y2).get;
	        var mult = 0;
	        var s = this.finalS;
	        var e = this.finalE;
	        var type = this.data.sh;
	        if (type === 2) {
	          if (e === s) {
	            mult = ind >= e ? 1 : 0;
	          } else {
	            mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
	          }
	          mult = easer(mult);
	        } else if (type === 3) {
	          if (e === s) {
	            mult = ind >= e ? 0 : 1;
	          } else {
	            mult = 1 - max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
	          }
	          mult = easer(mult);
	        } else if (type === 4) {
	          if (e === s) {
	            mult = 0;
	          } else {
	            mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
	            if (mult < 0.5) {
	              mult *= 2;
	            } else {
	              mult = 1 - 2 * (mult - 0.5);
	            }
	          }
	          mult = easer(mult);
	        } else if (type === 5) {
	          if (e === s) {
	            mult = 0;
	          } else {
	            var tot = e - s;
	            ind = min(max(0, ind + 0.5 - s), e - s);
	            var x = -tot / 2 + ind;
	            var a = tot / 2;
	            mult = Math.sqrt(1 - x * x / (a * a));
	          }
	          mult = easer(mult);
	        } else if (type === 6) {
	          if (e === s) {
	            mult = 0;
	          } else {
	            ind = min(max(0, ind + 0.5 - s), e - s);
	            mult = (1 + Math.cos(Math.PI + Math.PI * 2 * ind / (e - s))) / 2;
	          }
	          mult = easer(mult);
	        } else {
	          if (ind >= floor(s)) {
	            if (ind - s < 0) {
	              mult = max(0, min(min(e, 1) - (s - ind), 1));
	            } else {
	              mult = max(0, min(e - ind, 1));
	            }
	          }
	          mult = easer(mult);
	        }
	        if (this.sm.v !== 100) {
	          var smoothness = this.sm.v * 0.01;
	          if (smoothness === 0) {
	            smoothness = 1e-8;
	          }
	          var threshold = 0.5 - smoothness * 0.5;
	          if (mult < threshold) {
	            mult = 0;
	          } else {
	            mult = (mult - threshold) / smoothness;
	            if (mult > 1) {
	              mult = 1;
	            }
	          }
	        }
	        return mult * this.a.v;
	      },
	      getValue: function getValue(newCharsFlag) {
	        this.iterateDynamicProperties();
	        this._mdf = newCharsFlag || this._mdf;
	        this._currentTextLength = this.elem.textProperty.currentData.l.length || 0;
	        if (newCharsFlag && this.data.r === 2) {
	          this.e.v = this._currentTextLength;
	        }
	        var divisor = this.data.r === 2 ? 1 : 100 / this.data.totalChars;
	        var o = this.o.v / divisor;
	        var s = this.s.v / divisor + o;
	        var e = this.e.v / divisor + o;
	        if (s > e) {
	          var _s = s;
	          s = e;
	          e = _s;
	        }
	        this.finalS = s;
	        this.finalE = e;
	      }
	    };
	    extendPrototype([DynamicPropertyContainer], TextSelectorPropFactory);
	    function getTextSelectorProp(elem2, data2, arr) {
	      return new TextSelectorPropFactory(elem2, data2);
	    }
	    return {
	      getTextSelectorProp
	    };
	  }();
	  function TextAnimatorDataProperty(elem2, animatorProps, container) {
	    var defaultData = {
	      propType: false
	    };
	    var getProp = PropertyFactory.getProp;
	    var textAnimatorAnimatables = animatorProps.a;
	    this.a = {
	      r: textAnimatorAnimatables.r ? getProp(elem2, textAnimatorAnimatables.r, 0, degToRads, container) : defaultData,
	      rx: textAnimatorAnimatables.rx ? getProp(elem2, textAnimatorAnimatables.rx, 0, degToRads, container) : defaultData,
	      ry: textAnimatorAnimatables.ry ? getProp(elem2, textAnimatorAnimatables.ry, 0, degToRads, container) : defaultData,
	      sk: textAnimatorAnimatables.sk ? getProp(elem2, textAnimatorAnimatables.sk, 0, degToRads, container) : defaultData,
	      sa: textAnimatorAnimatables.sa ? getProp(elem2, textAnimatorAnimatables.sa, 0, degToRads, container) : defaultData,
	      s: textAnimatorAnimatables.s ? getProp(elem2, textAnimatorAnimatables.s, 1, 0.01, container) : defaultData,
	      a: textAnimatorAnimatables.a ? getProp(elem2, textAnimatorAnimatables.a, 1, 0, container) : defaultData,
	      o: textAnimatorAnimatables.o ? getProp(elem2, textAnimatorAnimatables.o, 0, 0.01, container) : defaultData,
	      p: textAnimatorAnimatables.p ? getProp(elem2, textAnimatorAnimatables.p, 1, 0, container) : defaultData,
	      sw: textAnimatorAnimatables.sw ? getProp(elem2, textAnimatorAnimatables.sw, 0, 0, container) : defaultData,
	      sc: textAnimatorAnimatables.sc ? getProp(elem2, textAnimatorAnimatables.sc, 1, 0, container) : defaultData,
	      fc: textAnimatorAnimatables.fc ? getProp(elem2, textAnimatorAnimatables.fc, 1, 0, container) : defaultData,
	      fh: textAnimatorAnimatables.fh ? getProp(elem2, textAnimatorAnimatables.fh, 0, 0, container) : defaultData,
	      fs: textAnimatorAnimatables.fs ? getProp(elem2, textAnimatorAnimatables.fs, 0, 0.01, container) : defaultData,
	      fb: textAnimatorAnimatables.fb ? getProp(elem2, textAnimatorAnimatables.fb, 0, 0.01, container) : defaultData,
	      t: textAnimatorAnimatables.t ? getProp(elem2, textAnimatorAnimatables.t, 0, 0, container) : defaultData
	    };
	    this.s = TextSelectorProp.getTextSelectorProp(elem2, animatorProps.s, container);
	    this.s.t = animatorProps.s.t;
	  }
	  function TextAnimatorProperty(textData, renderType, elem2) {
	    this._isFirstFrame = true;
	    this._hasMaskedPath = false;
	    this._frameId = -1;
	    this._textData = textData;
	    this._renderType = renderType;
	    this._elem = elem2;
	    this._animatorsData = createSizedArray(this._textData.a.length);
	    this._pathData = {};
	    this._moreOptions = {
	      alignment: {}
	    };
	    this.renderedLetters = [];
	    this.lettersChangedFlag = false;
	    this.initDynamicPropertyContainer(elem2);
	  }
	  TextAnimatorProperty.prototype.searchProperties = function() {
	    var i;
	    var len = this._textData.a.length;
	    var animatorProps;
	    var getProp = PropertyFactory.getProp;
	    for (i = 0; i < len; i += 1) {
	      animatorProps = this._textData.a[i];
	      this._animatorsData[i] = new TextAnimatorDataProperty(this._elem, animatorProps, this);
	    }
	    if (this._textData.p && "m" in this._textData.p) {
	      this._pathData = {
	        a: getProp(this._elem, this._textData.p.a, 0, 0, this),
	        f: getProp(this._elem, this._textData.p.f, 0, 0, this),
	        l: getProp(this._elem, this._textData.p.l, 0, 0, this),
	        r: getProp(this._elem, this._textData.p.r, 0, 0, this),
	        p: getProp(this._elem, this._textData.p.p, 0, 0, this),
	        m: this._elem.maskManager.getMaskProperty(this._textData.p.m)
	      };
	      this._hasMaskedPath = true;
	    } else {
	      this._hasMaskedPath = false;
	    }
	    this._moreOptions.alignment = getProp(this._elem, this._textData.m.a, 1, 0, this);
	  };
	  TextAnimatorProperty.prototype.getMeasures = function(documentData, lettersChangedFlag) {
	    this.lettersChangedFlag = lettersChangedFlag;
	    if (!this._mdf && !this._isFirstFrame && !lettersChangedFlag && (!this._hasMaskedPath || !this._pathData.m._mdf)) {
	      return;
	    }
	    this._isFirstFrame = false;
	    var alignment = this._moreOptions.alignment.v;
	    var animators = this._animatorsData;
	    var textData = this._textData;
	    var matrixHelper = this.mHelper;
	    var renderType = this._renderType;
	    var renderedLettersCount = this.renderedLetters.length;
	    var xPos;
	    var yPos;
	    var i;
	    var len;
	    var letters = documentData.l;
	    var pathInfo;
	    var currentLength;
	    var currentPoint;
	    var segmentLength;
	    var flag;
	    var pointInd;
	    var segmentInd;
	    var prevPoint;
	    var points;
	    var segments;
	    var partialLength;
	    var totalLength;
	    var perc;
	    var tanAngle;
	    var mask2;
	    if (this._hasMaskedPath) {
	      mask2 = this._pathData.m;
	      if (!this._pathData.n || this._pathData._mdf) {
	        var paths = mask2.v;
	        if (this._pathData.r.v) {
	          paths = paths.reverse();
	        }
	        pathInfo = {
	          tLength: 0,
	          segments: []
	        };
	        len = paths._length - 1;
	        var bezierData;
	        totalLength = 0;
	        for (i = 0; i < len; i += 1) {
	          bezierData = bez.buildBezierData(paths.v[i], paths.v[i + 1], [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]], [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]]);
	          pathInfo.tLength += bezierData.segmentLength;
	          pathInfo.segments.push(bezierData);
	          totalLength += bezierData.segmentLength;
	        }
	        i = len;
	        if (mask2.v.c) {
	          bezierData = bez.buildBezierData(paths.v[i], paths.v[0], [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]], [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]]);
	          pathInfo.tLength += bezierData.segmentLength;
	          pathInfo.segments.push(bezierData);
	          totalLength += bezierData.segmentLength;
	        }
	        this._pathData.pi = pathInfo;
	      }
	      pathInfo = this._pathData.pi;
	      currentLength = this._pathData.f.v;
	      segmentInd = 0;
	      pointInd = 1;
	      segmentLength = 0;
	      flag = true;
	      segments = pathInfo.segments;
	      if (currentLength < 0 && mask2.v.c) {
	        if (pathInfo.tLength < Math.abs(currentLength)) {
	          currentLength = -Math.abs(currentLength) % pathInfo.tLength;
	        }
	        segmentInd = segments.length - 1;
	        points = segments[segmentInd].points;
	        pointInd = points.length - 1;
	        while (currentLength < 0) {
	          currentLength += points[pointInd].partialLength;
	          pointInd -= 1;
	          if (pointInd < 0) {
	            segmentInd -= 1;
	            points = segments[segmentInd].points;
	            pointInd = points.length - 1;
	          }
	        }
	      }
	      points = segments[segmentInd].points;
	      prevPoint = points[pointInd - 1];
	      currentPoint = points[pointInd];
	      partialLength = currentPoint.partialLength;
	    }
	    len = letters.length;
	    xPos = 0;
	    yPos = 0;
	    var yOff = documentData.finalSize * 1.2 * 0.714;
	    var firstLine = true;
	    var animatorProps;
	    var animatorSelector;
	    var j;
	    var jLen;
	    var letterValue;
	    jLen = animators.length;
	    var mult;
	    var ind = -1;
	    var offf;
	    var xPathPos;
	    var yPathPos;
	    var initPathPos = currentLength;
	    var initSegmentInd = segmentInd;
	    var initPointInd = pointInd;
	    var currentLine = -1;
	    var elemOpacity;
	    var sc;
	    var sw;
	    var fc;
	    var k;
	    var letterSw;
	    var letterSc;
	    var letterFc;
	    var letterM = "";
	    var letterP = this.defaultPropsArray;
	    var letterO;
	    if (documentData.j === 2 || documentData.j === 1) {
	      var animatorJustifyOffset = 0;
	      var animatorFirstCharOffset = 0;
	      var justifyOffsetMult = documentData.j === 2 ? -0.5 : -1;
	      var lastIndex = 0;
	      var isNewLine = true;
	      for (i = 0; i < len; i += 1) {
	        if (letters[i].n) {
	          if (animatorJustifyOffset) {
	            animatorJustifyOffset += animatorFirstCharOffset;
	          }
	          while (lastIndex < i) {
	            letters[lastIndex].animatorJustifyOffset = animatorJustifyOffset;
	            lastIndex += 1;
	          }
	          animatorJustifyOffset = 0;
	          isNewLine = true;
	        } else {
	          for (j = 0; j < jLen; j += 1) {
	            animatorProps = animators[j].a;
	            if (animatorProps.t.propType) {
	              if (isNewLine && documentData.j === 2) {
	                animatorFirstCharOffset += animatorProps.t.v * justifyOffsetMult;
	              }
	              animatorSelector = animators[j].s;
	              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	              if (mult.length) {
	                animatorJustifyOffset += animatorProps.t.v * mult[0] * justifyOffsetMult;
	              } else {
	                animatorJustifyOffset += animatorProps.t.v * mult * justifyOffsetMult;
	              }
	            }
	          }
	          isNewLine = false;
	        }
	      }
	      if (animatorJustifyOffset) {
	        animatorJustifyOffset += animatorFirstCharOffset;
	      }
	      while (lastIndex < i) {
	        letters[lastIndex].animatorJustifyOffset = animatorJustifyOffset;
	        lastIndex += 1;
	      }
	    }
	    for (i = 0; i < len; i += 1) {
	      matrixHelper.reset();
	      elemOpacity = 1;
	      if (letters[i].n) {
	        xPos = 0;
	        yPos += documentData.yOffset;
	        yPos += firstLine ? 1 : 0;
	        currentLength = initPathPos;
	        firstLine = false;
	        if (this._hasMaskedPath) {
	          segmentInd = initSegmentInd;
	          pointInd = initPointInd;
	          points = segments[segmentInd].points;
	          prevPoint = points[pointInd - 1];
	          currentPoint = points[pointInd];
	          partialLength = currentPoint.partialLength;
	          segmentLength = 0;
	        }
	        letterM = "";
	        letterFc = "";
	        letterSw = "";
	        letterO = "";
	        letterP = this.defaultPropsArray;
	      } else {
	        if (this._hasMaskedPath) {
	          if (currentLine !== letters[i].line) {
	            switch (documentData.j) {
	              case 1:
	                currentLength += totalLength - documentData.lineWidths[letters[i].line];
	                break;
	              case 2:
	                currentLength += (totalLength - documentData.lineWidths[letters[i].line]) / 2;
	                break;
	            }
	            currentLine = letters[i].line;
	          }
	          if (ind !== letters[i].ind) {
	            if (letters[ind]) {
	              currentLength += letters[ind].extra;
	            }
	            currentLength += letters[i].an / 2;
	            ind = letters[i].ind;
	          }
	          currentLength += alignment[0] * letters[i].an * 5e-3;
	          var animatorOffset = 0;
	          for (j = 0; j < jLen; j += 1) {
	            animatorProps = animators[j].a;
	            if (animatorProps.p.propType) {
	              animatorSelector = animators[j].s;
	              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	              if (mult.length) {
	                animatorOffset += animatorProps.p.v[0] * mult[0];
	              } else {
	                animatorOffset += animatorProps.p.v[0] * mult;
	              }
	            }
	            if (animatorProps.a.propType) {
	              animatorSelector = animators[j].s;
	              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	              if (mult.length) {
	                animatorOffset += animatorProps.a.v[0] * mult[0];
	              } else {
	                animatorOffset += animatorProps.a.v[0] * mult;
	              }
	            }
	          }
	          flag = true;
	          if (this._pathData.a.v) {
	            currentLength = letters[0].an * 0.5 + (totalLength - this._pathData.f.v - letters[0].an * 0.5 - letters[letters.length - 1].an * 0.5) * ind / (len - 1);
	            currentLength += this._pathData.f.v;
	          }
	          while (flag) {
	            if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
	              perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
	              xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
	              yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
	              matrixHelper.translate(-alignment[0] * letters[i].an * 5e-3, -(alignment[1] * yOff) * 0.01);
	              flag = false;
	            } else if (points) {
	              segmentLength += currentPoint.partialLength;
	              pointInd += 1;
	              if (pointInd >= points.length) {
	                pointInd = 0;
	                segmentInd += 1;
	                if (!segments[segmentInd]) {
	                  if (mask2.v.c) {
	                    pointInd = 0;
	                    segmentInd = 0;
	                    points = segments[segmentInd].points;
	                  } else {
	                    segmentLength -= currentPoint.partialLength;
	                    points = null;
	                  }
	                } else {
	                  points = segments[segmentInd].points;
	                }
	              }
	              if (points) {
	                prevPoint = currentPoint;
	                currentPoint = points[pointInd];
	                partialLength = currentPoint.partialLength;
	              }
	            }
	          }
	          offf = letters[i].an / 2 - letters[i].add;
	          matrixHelper.translate(-offf, 0, 0);
	        } else {
	          offf = letters[i].an / 2 - letters[i].add;
	          matrixHelper.translate(-offf, 0, 0);
	          matrixHelper.translate(-alignment[0] * letters[i].an * 5e-3, -alignment[1] * yOff * 0.01, 0);
	        }
	        for (j = 0; j < jLen; j += 1) {
	          animatorProps = animators[j].a;
	          if (animatorProps.t.propType) {
	            animatorSelector = animators[j].s;
	            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	            if (xPos !== 0 || documentData.j !== 0) {
	              if (this._hasMaskedPath) {
	                if (mult.length) {
	                  currentLength += animatorProps.t.v * mult[0];
	                } else {
	                  currentLength += animatorProps.t.v * mult;
	                }
	              } else if (mult.length) {
	                xPos += animatorProps.t.v * mult[0];
	              } else {
	                xPos += animatorProps.t.v * mult;
	              }
	            }
	          }
	        }
	        if (documentData.strokeWidthAnim) {
	          sw = documentData.sw || 0;
	        }
	        if (documentData.strokeColorAnim) {
	          if (documentData.sc) {
	            sc = [documentData.sc[0], documentData.sc[1], documentData.sc[2]];
	          } else {
	            sc = [0, 0, 0];
	          }
	        }
	        if (documentData.fillColorAnim && documentData.fc) {
	          fc = [documentData.fc[0], documentData.fc[1], documentData.fc[2]];
	        }
	        for (j = 0; j < jLen; j += 1) {
	          animatorProps = animators[j].a;
	          if (animatorProps.a.propType) {
	            animatorSelector = animators[j].s;
	            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	            if (mult.length) {
	              matrixHelper.translate(-animatorProps.a.v[0] * mult[0], -animatorProps.a.v[1] * mult[1], animatorProps.a.v[2] * mult[2]);
	            } else {
	              matrixHelper.translate(-animatorProps.a.v[0] * mult, -animatorProps.a.v[1] * mult, animatorProps.a.v[2] * mult);
	            }
	          }
	        }
	        for (j = 0; j < jLen; j += 1) {
	          animatorProps = animators[j].a;
	          if (animatorProps.s.propType) {
	            animatorSelector = animators[j].s;
	            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	            if (mult.length) {
	              matrixHelper.scale(1 + (animatorProps.s.v[0] - 1) * mult[0], 1 + (animatorProps.s.v[1] - 1) * mult[1], 1);
	            } else {
	              matrixHelper.scale(1 + (animatorProps.s.v[0] - 1) * mult, 1 + (animatorProps.s.v[1] - 1) * mult, 1);
	            }
	          }
	        }
	        for (j = 0; j < jLen; j += 1) {
	          animatorProps = animators[j].a;
	          animatorSelector = animators[j].s;
	          mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	          if (animatorProps.sk.propType) {
	            if (mult.length) {
	              matrixHelper.skewFromAxis(-animatorProps.sk.v * mult[0], animatorProps.sa.v * mult[1]);
	            } else {
	              matrixHelper.skewFromAxis(-animatorProps.sk.v * mult, animatorProps.sa.v * mult);
	            }
	          }
	          if (animatorProps.r.propType) {
	            if (mult.length) {
	              matrixHelper.rotateZ(-animatorProps.r.v * mult[2]);
	            } else {
	              matrixHelper.rotateZ(-animatorProps.r.v * mult);
	            }
	          }
	          if (animatorProps.ry.propType) {
	            if (mult.length) {
	              matrixHelper.rotateY(animatorProps.ry.v * mult[1]);
	            } else {
	              matrixHelper.rotateY(animatorProps.ry.v * mult);
	            }
	          }
	          if (animatorProps.rx.propType) {
	            if (mult.length) {
	              matrixHelper.rotateX(animatorProps.rx.v * mult[0]);
	            } else {
	              matrixHelper.rotateX(animatorProps.rx.v * mult);
	            }
	          }
	          if (animatorProps.o.propType) {
	            if (mult.length) {
	              elemOpacity += (animatorProps.o.v * mult[0] - elemOpacity) * mult[0];
	            } else {
	              elemOpacity += (animatorProps.o.v * mult - elemOpacity) * mult;
	            }
	          }
	          if (documentData.strokeWidthAnim && animatorProps.sw.propType) {
	            if (mult.length) {
	              sw += animatorProps.sw.v * mult[0];
	            } else {
	              sw += animatorProps.sw.v * mult;
	            }
	          }
	          if (documentData.strokeColorAnim && animatorProps.sc.propType) {
	            for (k = 0; k < 3; k += 1) {
	              if (mult.length) {
	                sc[k] += (animatorProps.sc.v[k] - sc[k]) * mult[0];
	              } else {
	                sc[k] += (animatorProps.sc.v[k] - sc[k]) * mult;
	              }
	            }
	          }
	          if (documentData.fillColorAnim && documentData.fc) {
	            if (animatorProps.fc.propType) {
	              for (k = 0; k < 3; k += 1) {
	                if (mult.length) {
	                  fc[k] += (animatorProps.fc.v[k] - fc[k]) * mult[0];
	                } else {
	                  fc[k] += (animatorProps.fc.v[k] - fc[k]) * mult;
	                }
	              }
	            }
	            if (animatorProps.fh.propType) {
	              if (mult.length) {
	                fc = addHueToRGB(fc, animatorProps.fh.v * mult[0]);
	              } else {
	                fc = addHueToRGB(fc, animatorProps.fh.v * mult);
	              }
	            }
	            if (animatorProps.fs.propType) {
	              if (mult.length) {
	                fc = addSaturationToRGB(fc, animatorProps.fs.v * mult[0]);
	              } else {
	                fc = addSaturationToRGB(fc, animatorProps.fs.v * mult);
	              }
	            }
	            if (animatorProps.fb.propType) {
	              if (mult.length) {
	                fc = addBrightnessToRGB(fc, animatorProps.fb.v * mult[0]);
	              } else {
	                fc = addBrightnessToRGB(fc, animatorProps.fb.v * mult);
	              }
	            }
	          }
	        }
	        for (j = 0; j < jLen; j += 1) {
	          animatorProps = animators[j].a;
	          if (animatorProps.p.propType) {
	            animatorSelector = animators[j].s;
	            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);
	            if (this._hasMaskedPath) {
	              if (mult.length) {
	                matrixHelper.translate(0, animatorProps.p.v[1] * mult[0], -animatorProps.p.v[2] * mult[1]);
	              } else {
	                matrixHelper.translate(0, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
	              }
	            } else if (mult.length) {
	              matrixHelper.translate(animatorProps.p.v[0] * mult[0], animatorProps.p.v[1] * mult[1], -animatorProps.p.v[2] * mult[2]);
	            } else {
	              matrixHelper.translate(animatorProps.p.v[0] * mult, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
	            }
	          }
	        }
	        if (documentData.strokeWidthAnim) {
	          letterSw = sw < 0 ? 0 : sw;
	        }
	        if (documentData.strokeColorAnim) {
	          letterSc = "rgb(" + Math.round(sc[0] * 255) + "," + Math.round(sc[1] * 255) + "," + Math.round(sc[2] * 255) + ")";
	        }
	        if (documentData.fillColorAnim && documentData.fc) {
	          letterFc = "rgb(" + Math.round(fc[0] * 255) + "," + Math.round(fc[1] * 255) + "," + Math.round(fc[2] * 255) + ")";
	        }
	        if (this._hasMaskedPath) {
	          matrixHelper.translate(0, -documentData.ls);
	          matrixHelper.translate(0, alignment[1] * yOff * 0.01 + yPos, 0);
	          if (this._pathData.p.v) {
	            tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
	            var rot = Math.atan(tanAngle) * 180 / Math.PI;
	            if (currentPoint.point[0] < prevPoint.point[0]) {
	              rot += 180;
	            }
	            matrixHelper.rotate(-rot * Math.PI / 180);
	          }
	          matrixHelper.translate(xPathPos, yPathPos, 0);
	          currentLength -= alignment[0] * letters[i].an * 5e-3;
	          if (letters[i + 1] && ind !== letters[i + 1].ind) {
	            currentLength += letters[i].an / 2;
	            currentLength += documentData.tr * 1e-3 * documentData.finalSize;
	          }
	        } else {
	          matrixHelper.translate(xPos, yPos, 0);
	          if (documentData.ps) {
	            matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
	          }
	          switch (documentData.j) {
	            case 1:
	              matrixHelper.translate(letters[i].animatorJustifyOffset + documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]), 0, 0);
	              break;
	            case 2:
	              matrixHelper.translate(letters[i].animatorJustifyOffset + documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]) / 2, 0, 0);
	              break;
	          }
	          matrixHelper.translate(0, -documentData.ls);
	          matrixHelper.translate(offf, 0, 0);
	          matrixHelper.translate(alignment[0] * letters[i].an * 5e-3, alignment[1] * yOff * 0.01, 0);
	          xPos += letters[i].l + documentData.tr * 1e-3 * documentData.finalSize;
	        }
	        if (renderType === "html") {
	          letterM = matrixHelper.toCSS();
	        } else if (renderType === "svg") {
	          letterM = matrixHelper.to2dCSS();
	        } else {
	          letterP = [matrixHelper.props[0], matrixHelper.props[1], matrixHelper.props[2], matrixHelper.props[3], matrixHelper.props[4], matrixHelper.props[5], matrixHelper.props[6], matrixHelper.props[7], matrixHelper.props[8], matrixHelper.props[9], matrixHelper.props[10], matrixHelper.props[11], matrixHelper.props[12], matrixHelper.props[13], matrixHelper.props[14], matrixHelper.props[15]];
	        }
	        letterO = elemOpacity;
	      }
	      if (renderedLettersCount <= i) {
	        letterValue = new LetterProps(letterO, letterSw, letterSc, letterFc, letterM, letterP);
	        this.renderedLetters.push(letterValue);
	        renderedLettersCount += 1;
	        this.lettersChangedFlag = true;
	      } else {
	        letterValue = this.renderedLetters[i];
	        this.lettersChangedFlag = letterValue.update(letterO, letterSw, letterSc, letterFc, letterM, letterP) || this.lettersChangedFlag;
	      }
	    }
	  };
	  TextAnimatorProperty.prototype.getValue = function() {
	    if (this._elem.globalData.frameId === this._frameId) {
	      return;
	    }
	    this._frameId = this._elem.globalData.frameId;
	    this.iterateDynamicProperties();
	  };
	  TextAnimatorProperty.prototype.mHelper = new Matrix();
	  TextAnimatorProperty.prototype.defaultPropsArray = [];
	  extendPrototype([DynamicPropertyContainer], TextAnimatorProperty);
	  function ITextElement() {
	  }
	  ITextElement.prototype.initElement = function(data2, globalData2, comp2) {
	    this.lettersChangedFlag = true;
	    this.initFrame();
	    this.initBaseData(data2, globalData2, comp2);
	    this.textProperty = new TextProperty(this, data2.t, this.dynamicProperties);
	    this.textAnimator = new TextAnimatorProperty(data2.t, this.renderType, this);
	    this.initTransform(data2, globalData2, comp2);
	    this.initHierarchy();
	    this.initRenderable();
	    this.initRendererElement();
	    this.createContainerElements();
	    this.createRenderableComponents();
	    this.createContent();
	    this.hide();
	    this.textAnimator.searchProperties(this.dynamicProperties);
	  };
	  ITextElement.prototype.prepareFrame = function(num) {
	    this._mdf = false;
	    this.prepareRenderableFrame(num);
	    this.prepareProperties(num, this.isInRange);
	  };
	  ITextElement.prototype.createPathShape = function(matrixHelper, shapes) {
	    var j;
	    var jLen = shapes.length;
	    var pathNodes;
	    var shapeStr = "";
	    for (j = 0; j < jLen; j += 1) {
	      if (shapes[j].ty === "sh") {
	        pathNodes = shapes[j].ks.k;
	        shapeStr += buildShapeString(pathNodes, pathNodes.i.length, true, matrixHelper);
	      }
	    }
	    return shapeStr;
	  };
	  ITextElement.prototype.updateDocumentData = function(newData, index2) {
	    this.textProperty.updateDocumentData(newData, index2);
	  };
	  ITextElement.prototype.canResizeFont = function(_canResize) {
	    this.textProperty.canResizeFont(_canResize);
	  };
	  ITextElement.prototype.setMinimumFontSize = function(_fontSize) {
	    this.textProperty.setMinimumFontSize(_fontSize);
	  };
	  ITextElement.prototype.applyTextPropertiesToMatrix = function(documentData, matrixHelper, lineNumber, xPos, yPos) {
	    if (documentData.ps) {
	      matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
	    }
	    matrixHelper.translate(0, -documentData.ls, 0);
	    switch (documentData.j) {
	      case 1:
	        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]), 0, 0);
	        break;
	      case 2:
	        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]) / 2, 0, 0);
	        break;
	    }
	    matrixHelper.translate(xPos, yPos, 0);
	  };
	  ITextElement.prototype.buildColor = function(colorData) {
	    return "rgb(" + Math.round(colorData[0] * 255) + "," + Math.round(colorData[1] * 255) + "," + Math.round(colorData[2] * 255) + ")";
	  };
	  ITextElement.prototype.emptyProp = new LetterProps();
	  ITextElement.prototype.destroy = function() {
	  };
	  ITextElement.prototype.validateText = function() {
	    if (this.textProperty._mdf || this.textProperty._isFirstFrame) {
	      this.buildNewText();
	      this.textProperty._isFirstFrame = false;
	      this.textProperty._mdf = false;
	    }
	  };
	  var emptyShapeData = {
	    shapes: []
	  };
	  function SVGTextLottieElement(data2, globalData2, comp2) {
	    this.textSpans = [];
	    this.renderType = "svg";
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], SVGTextLottieElement);
	  SVGTextLottieElement.prototype.createContent = function() {
	    if (this.data.singleShape && !this.globalData.fontManager.chars) {
	      this.textContainer = createNS("text");
	    }
	  };
	  SVGTextLottieElement.prototype.buildTextContents = function(textArray) {
	    var i = 0;
	    var len = textArray.length;
	    var textContents = [];
	    var currentTextContent = "";
	    while (i < len) {
	      if (textArray[i] === String.fromCharCode(13) || textArray[i] === String.fromCharCode(3)) {
	        textContents.push(currentTextContent);
	        currentTextContent = "";
	      } else {
	        currentTextContent += textArray[i];
	      }
	      i += 1;
	    }
	    textContents.push(currentTextContent);
	    return textContents;
	  };
	  SVGTextLottieElement.prototype.buildShapeData = function(data2, scale2) {
	    if (data2.shapes && data2.shapes.length) {
	      var shape = data2.shapes[0];
	      if (shape.it) {
	        var shapeItem = shape.it[shape.it.length - 1];
	        if (shapeItem.s) {
	          shapeItem.s.k[0] = scale2;
	          shapeItem.s.k[1] = scale2;
	        }
	      }
	    }
	    return data2;
	  };
	  SVGTextLottieElement.prototype.buildNewText = function() {
	    this.addDynamicProperty(this);
	    var i;
	    var len;
	    var documentData = this.textProperty.currentData;
	    this.renderedLetters = createSizedArray(documentData ? documentData.l.length : 0);
	    if (documentData.fc) {
	      this.layerElement.setAttribute("fill", this.buildColor(documentData.fc));
	    } else {
	      this.layerElement.setAttribute("fill", "rgba(0,0,0,0)");
	    }
	    if (documentData.sc) {
	      this.layerElement.setAttribute("stroke", this.buildColor(documentData.sc));
	      this.layerElement.setAttribute("stroke-width", documentData.sw);
	    }
	    this.layerElement.setAttribute("font-size", documentData.finalSize);
	    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
	    if (fontData.fClass) {
	      this.layerElement.setAttribute("class", fontData.fClass);
	    } else {
	      this.layerElement.setAttribute("font-family", fontData.fFamily);
	      var fWeight = documentData.fWeight;
	      var fStyle = documentData.fStyle;
	      this.layerElement.setAttribute("font-style", fStyle);
	      this.layerElement.setAttribute("font-weight", fWeight);
	    }
	    this.layerElement.setAttribute("aria-label", documentData.t);
	    var letters = documentData.l || [];
	    var usesGlyphs = !!this.globalData.fontManager.chars;
	    len = letters.length;
	    var tSpan;
	    var matrixHelper = this.mHelper;
	    var shapeStr = "";
	    var singleShape = this.data.singleShape;
	    var xPos = 0;
	    var yPos = 0;
	    var firstLine = true;
	    var trackingOffset = documentData.tr * 1e-3 * documentData.finalSize;
	    if (singleShape && !usesGlyphs && !documentData.sz) {
	      var tElement = this.textContainer;
	      var justify = "start";
	      switch (documentData.j) {
	        case 1:
	          justify = "end";
	          break;
	        case 2:
	          justify = "middle";
	          break;
	        default:
	          justify = "start";
	          break;
	      }
	      tElement.setAttribute("text-anchor", justify);
	      tElement.setAttribute("letter-spacing", trackingOffset);
	      var textContent = this.buildTextContents(documentData.finalText);
	      len = textContent.length;
	      yPos = documentData.ps ? documentData.ps[1] + documentData.ascent : 0;
	      for (i = 0; i < len; i += 1) {
	        tSpan = this.textSpans[i].span || createNS("tspan");
	        tSpan.textContent = textContent[i];
	        tSpan.setAttribute("x", 0);
	        tSpan.setAttribute("y", yPos);
	        tSpan.style.display = "inherit";
	        tElement.appendChild(tSpan);
	        if (!this.textSpans[i]) {
	          this.textSpans[i] = {
	            span: null,
	            glyph: null
	          };
	        }
	        this.textSpans[i].span = tSpan;
	        yPos += documentData.finalLineHeight;
	      }
	      this.layerElement.appendChild(tElement);
	    } else {
	      var cachedSpansLength = this.textSpans.length;
	      var charData;
	      for (i = 0; i < len; i += 1) {
	        if (!this.textSpans[i]) {
	          this.textSpans[i] = {
	            span: null,
	            childSpan: null,
	            glyph: null
	          };
	        }
	        if (!usesGlyphs || !singleShape || i === 0) {
	          tSpan = cachedSpansLength > i ? this.textSpans[i].span : createNS(usesGlyphs ? "g" : "text");
	          if (cachedSpansLength <= i) {
	            tSpan.setAttribute("stroke-linecap", "butt");
	            tSpan.setAttribute("stroke-linejoin", "round");
	            tSpan.setAttribute("stroke-miterlimit", "4");
	            this.textSpans[i].span = tSpan;
	            if (usesGlyphs) {
	              var childSpan = createNS("g");
	              tSpan.appendChild(childSpan);
	              this.textSpans[i].childSpan = childSpan;
	            }
	            this.textSpans[i].span = tSpan;
	            this.layerElement.appendChild(tSpan);
	          }
	          tSpan.style.display = "inherit";
	        }
	        matrixHelper.reset();
	        if (singleShape) {
	          if (letters[i].n) {
	            xPos = -trackingOffset;
	            yPos += documentData.yOffset;
	            yPos += firstLine ? 1 : 0;
	            firstLine = false;
	          }
	          this.applyTextPropertiesToMatrix(documentData, matrixHelper, letters[i].line, xPos, yPos);
	          xPos += letters[i].l || 0;
	          xPos += trackingOffset;
	        }
	        if (usesGlyphs) {
	          charData = this.globalData.fontManager.getCharData(documentData.finalText[i], fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
	          var glyphElement;
	          if (charData.t === 1) {
	            glyphElement = new SVGCompElement(charData.data, this.globalData, this);
	          } else {
	            var data2 = emptyShapeData;
	            if (charData.data && charData.data.shapes) {
	              data2 = this.buildShapeData(charData.data, documentData.finalSize);
	            }
	            glyphElement = new SVGShapeElement(data2, this.globalData, this);
	          }
	          if (this.textSpans[i].glyph) {
	            var glyph = this.textSpans[i].glyph;
	            this.textSpans[i].childSpan.removeChild(glyph.layerElement);
	            glyph.destroy();
	          }
	          this.textSpans[i].glyph = glyphElement;
	          glyphElement._debug = true;
	          glyphElement.prepareFrame(0);
	          glyphElement.renderFrame();
	          this.textSpans[i].childSpan.appendChild(glyphElement.layerElement);
	          if (charData.t === 1) {
	            this.textSpans[i].childSpan.setAttribute("transform", "scale(" + documentData.finalSize / 100 + "," + documentData.finalSize / 100 + ")");
	          }
	        } else {
	          if (singleShape) {
	            tSpan.setAttribute("transform", "translate(" + matrixHelper.props[12] + "," + matrixHelper.props[13] + ")");
	          }
	          tSpan.textContent = letters[i].val;
	          tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
	        }
	      }
	      if (singleShape && tSpan) {
	        tSpan.setAttribute("d", shapeStr);
	      }
	    }
	    while (i < this.textSpans.length) {
	      this.textSpans[i].span.style.display = "none";
	      i += 1;
	    }
	    this._sizeChanged = true;
	  };
	  SVGTextLottieElement.prototype.sourceRectAtTime = function() {
	    this.prepareFrame(this.comp.renderedFrame - this.data.st);
	    this.renderInnerContent();
	    if (this._sizeChanged) {
	      this._sizeChanged = false;
	      var textBox = this.layerElement.getBBox();
	      this.bbox = {
	        top: textBox.y,
	        left: textBox.x,
	        width: textBox.width,
	        height: textBox.height
	      };
	    }
	    return this.bbox;
	  };
	  SVGTextLottieElement.prototype.getValue = function() {
	    var i;
	    var len = this.textSpans.length;
	    var glyphElement;
	    this.renderedFrame = this.comp.renderedFrame;
	    for (i = 0; i < len; i += 1) {
	      glyphElement = this.textSpans[i].glyph;
	      if (glyphElement) {
	        glyphElement.prepareFrame(this.comp.renderedFrame - this.data.st);
	        if (glyphElement._mdf) {
	          this._mdf = true;
	        }
	      }
	    }
	  };
	  SVGTextLottieElement.prototype.renderInnerContent = function() {
	    this.validateText();
	    if (!this.data.singleShape || this._mdf) {
	      this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
	      if (this.lettersChangedFlag || this.textAnimator.lettersChangedFlag) {
	        this._sizeChanged = true;
	        var i;
	        var len;
	        var renderedLetters = this.textAnimator.renderedLetters;
	        var letters = this.textProperty.currentData.l;
	        len = letters.length;
	        var renderedLetter;
	        var textSpan;
	        var glyphElement;
	        for (i = 0; i < len; i += 1) {
	          if (!letters[i].n) {
	            renderedLetter = renderedLetters[i];
	            textSpan = this.textSpans[i].span;
	            glyphElement = this.textSpans[i].glyph;
	            if (glyphElement) {
	              glyphElement.renderFrame();
	            }
	            if (renderedLetter._mdf.m) {
	              textSpan.setAttribute("transform", renderedLetter.m);
	            }
	            if (renderedLetter._mdf.o) {
	              textSpan.setAttribute("opacity", renderedLetter.o);
	            }
	            if (renderedLetter._mdf.sw) {
	              textSpan.setAttribute("stroke-width", renderedLetter.sw);
	            }
	            if (renderedLetter._mdf.sc) {
	              textSpan.setAttribute("stroke", renderedLetter.sc);
	            }
	            if (renderedLetter._mdf.fc) {
	              textSpan.setAttribute("fill", renderedLetter.fc);
	            }
	          }
	        }
	      }
	    }
	  };
	  function ISolidElement(data2, globalData2, comp2) {
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([IImageElement], ISolidElement);
	  ISolidElement.prototype.createContent = function() {
	    var rect = createNS("rect");
	    rect.setAttribute("width", this.data.sw);
	    rect.setAttribute("height", this.data.sh);
	    rect.setAttribute("fill", this.data.sc);
	    this.layerElement.appendChild(rect);
	  };
	  function NullElement(data2, globalData2, comp2) {
	    this.initFrame();
	    this.initBaseData(data2, globalData2, comp2);
	    this.initFrame();
	    this.initTransform(data2, globalData2, comp2);
	    this.initHierarchy();
	  }
	  NullElement.prototype.prepareFrame = function(num) {
	    this.prepareProperties(num, true);
	  };
	  NullElement.prototype.renderFrame = function() {
	  };
	  NullElement.prototype.getBaseElement = function() {
	    return null;
	  };
	  NullElement.prototype.destroy = function() {
	  };
	  NullElement.prototype.sourceRectAtTime = function() {
	  };
	  NullElement.prototype.hide = function() {
	  };
	  extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement], NullElement);
	  function SVGRendererBase() {
	  }
	  extendPrototype([BaseRenderer], SVGRendererBase);
	  SVGRendererBase.prototype.createNull = function(data2) {
	    return new NullElement(data2, this.globalData, this);
	  };
	  SVGRendererBase.prototype.createShape = function(data2) {
	    return new SVGShapeElement(data2, this.globalData, this);
	  };
	  SVGRendererBase.prototype.createText = function(data2) {
	    return new SVGTextLottieElement(data2, this.globalData, this);
	  };
	  SVGRendererBase.prototype.createImage = function(data2) {
	    return new IImageElement(data2, this.globalData, this);
	  };
	  SVGRendererBase.prototype.createSolid = function(data2) {
	    return new ISolidElement(data2, this.globalData, this);
	  };
	  SVGRendererBase.prototype.configAnimation = function(animData) {
	    this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	    this.svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	    if (this.renderConfig.viewBoxSize) {
	      this.svgElement.setAttribute("viewBox", this.renderConfig.viewBoxSize);
	    } else {
	      this.svgElement.setAttribute("viewBox", "0 0 " + animData.w + " " + animData.h);
	    }
	    if (!this.renderConfig.viewBoxOnly) {
	      this.svgElement.setAttribute("width", animData.w);
	      this.svgElement.setAttribute("height", animData.h);
	      this.svgElement.style.width = "100%";
	      this.svgElement.style.height = "100%";
	      this.svgElement.style.transform = "translate3d(0,0,0)";
	      this.svgElement.style.contentVisibility = this.renderConfig.contentVisibility;
	    }
	    if (this.renderConfig.width) {
	      this.svgElement.setAttribute("width", this.renderConfig.width);
	    }
	    if (this.renderConfig.height) {
	      this.svgElement.setAttribute("height", this.renderConfig.height);
	    }
	    if (this.renderConfig.className) {
	      this.svgElement.setAttribute("class", this.renderConfig.className);
	    }
	    if (this.renderConfig.id) {
	      this.svgElement.setAttribute("id", this.renderConfig.id);
	    }
	    if (this.renderConfig.focusable !== void 0) {
	      this.svgElement.setAttribute("focusable", this.renderConfig.focusable);
	    }
	    this.svgElement.setAttribute("preserveAspectRatio", this.renderConfig.preserveAspectRatio);
	    this.animationItem.wrapper.appendChild(this.svgElement);
	    var defs = this.globalData.defs;
	    this.setupGlobalData(animData, defs);
	    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
	    this.data = animData;
	    var maskElement = createNS("clipPath");
	    var rect = createNS("rect");
	    rect.setAttribute("width", animData.w);
	    rect.setAttribute("height", animData.h);
	    rect.setAttribute("x", 0);
	    rect.setAttribute("y", 0);
	    var maskId = createElementID();
	    maskElement.setAttribute("id", maskId);
	    maskElement.appendChild(rect);
	    this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + maskId + ")");
	    defs.appendChild(maskElement);
	    this.layers = animData.layers;
	    this.elements = createSizedArray(animData.layers.length);
	  };
	  SVGRendererBase.prototype.destroy = function() {
	    if (this.animationItem.wrapper) {
	      this.animationItem.wrapper.innerText = "";
	    }
	    this.layerElement = null;
	    this.globalData.defs = null;
	    var i;
	    var len = this.layers ? this.layers.length : 0;
	    for (i = 0; i < len; i += 1) {
	      if (this.elements[i] && this.elements[i].destroy) {
	        this.elements[i].destroy();
	      }
	    }
	    this.elements.length = 0;
	    this.destroyed = true;
	    this.animationItem = null;
	  };
	  SVGRendererBase.prototype.updateContainerSize = function() {
	  };
	  SVGRendererBase.prototype.findIndexByInd = function(ind) {
	    var i = 0;
	    var len = this.layers.length;
	    for (i = 0; i < len; i += 1) {
	      if (this.layers[i].ind === ind) {
	        return i;
	      }
	    }
	    return -1;
	  };
	  SVGRendererBase.prototype.buildItem = function(pos) {
	    var elements = this.elements;
	    if (elements[pos] || this.layers[pos].ty === 99) {
	      return;
	    }
	    elements[pos] = true;
	    var element = this.createItem(this.layers[pos]);
	    elements[pos] = element;
	    if (getExpressionsPlugin()) {
	      if (this.layers[pos].ty === 0) {
	        this.globalData.projectInterface.registerComposition(element);
	      }
	      element.initExpressions();
	    }
	    this.appendElementInPos(element, pos);
	    if (this.layers[pos].tt) {
	      var elementIndex = "tp" in this.layers[pos] ? this.findIndexByInd(this.layers[pos].tp) : pos - 1;
	      if (elementIndex === -1) {
	        return;
	      }
	      if (!this.elements[elementIndex] || this.elements[elementIndex] === true) {
	        this.buildItem(elementIndex);
	        this.addPendingElement(element);
	      } else {
	        var matteElement = elements[elementIndex];
	        var matteMask = matteElement.getMatte(this.layers[pos].tt);
	        element.setMatte(matteMask);
	      }
	    }
	  };
	  SVGRendererBase.prototype.checkPendingElements = function() {
	    while (this.pendingElements.length) {
	      var element = this.pendingElements.pop();
	      element.checkParenting();
	      if (element.data.tt) {
	        var i = 0;
	        var len = this.elements.length;
	        while (i < len) {
	          if (this.elements[i] === element) {
	            var elementIndex = "tp" in element.data ? this.findIndexByInd(element.data.tp) : i - 1;
	            var matteElement = this.elements[elementIndex];
	            var matteMask = matteElement.getMatte(this.layers[i].tt);
	            element.setMatte(matteMask);
	            break;
	          }
	          i += 1;
	        }
	      }
	    }
	  };
	  SVGRendererBase.prototype.renderFrame = function(num) {
	    if (this.renderedFrame === num || this.destroyed) {
	      return;
	    }
	    if (num === null) {
	      num = this.renderedFrame;
	    } else {
	      this.renderedFrame = num;
	    }
	    this.globalData.frameNum = num;
	    this.globalData.frameId += 1;
	    this.globalData.projectInterface.currentFrame = num;
	    this.globalData._mdf = false;
	    var i;
	    var len = this.layers.length;
	    if (!this.completeLayers) {
	      this.checkLayers(num);
	    }
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (this.completeLayers || this.elements[i]) {
	        this.elements[i].prepareFrame(num - this.layers[i].st);
	      }
	    }
	    if (this.globalData._mdf) {
	      for (i = 0; i < len; i += 1) {
	        if (this.completeLayers || this.elements[i]) {
	          this.elements[i].renderFrame();
	        }
	      }
	    }
	  };
	  SVGRendererBase.prototype.appendElementInPos = function(element, pos) {
	    var newElement = element.getBaseElement();
	    if (!newElement) {
	      return;
	    }
	    var i = 0;
	    var nextElement;
	    while (i < pos) {
	      if (this.elements[i] && this.elements[i] !== true && this.elements[i].getBaseElement()) {
	        nextElement = this.elements[i].getBaseElement();
	      }
	      i += 1;
	    }
	    if (nextElement) {
	      this.layerElement.insertBefore(newElement, nextElement);
	    } else {
	      this.layerElement.appendChild(newElement);
	    }
	  };
	  SVGRendererBase.prototype.hide = function() {
	    this.layerElement.style.display = "none";
	  };
	  SVGRendererBase.prototype.show = function() {
	    this.layerElement.style.display = "block";
	  };
	  function ICompElement() {
	  }
	  extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement], ICompElement);
	  ICompElement.prototype.initElement = function(data2, globalData2, comp2) {
	    this.initFrame();
	    this.initBaseData(data2, globalData2, comp2);
	    this.initTransform(data2, globalData2, comp2);
	    this.initRenderable();
	    this.initHierarchy();
	    this.initRendererElement();
	    this.createContainerElements();
	    this.createRenderableComponents();
	    if (this.data.xt || !globalData2.progressiveLoad) {
	      this.buildAllItems();
	    }
	    this.hide();
	  };
	  ICompElement.prototype.prepareFrame = function(num) {
	    this._mdf = false;
	    this.prepareRenderableFrame(num);
	    this.prepareProperties(num, this.isInRange);
	    if (!this.isInRange && !this.data.xt) {
	      return;
	    }
	    if (!this.tm._placeholder) {
	      var timeRemapped = this.tm.v;
	      if (timeRemapped === this.data.op) {
	        timeRemapped = this.data.op - 1;
	      }
	      this.renderedFrame = timeRemapped;
	    } else {
	      this.renderedFrame = num / this.data.sr;
	    }
	    var i;
	    var len = this.elements.length;
	    if (!this.completeLayers) {
	      this.checkLayers(this.renderedFrame);
	    }
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (this.completeLayers || this.elements[i]) {
	        this.elements[i].prepareFrame(this.renderedFrame - this.layers[i].st);
	        if (this.elements[i]._mdf) {
	          this._mdf = true;
	        }
	      }
	    }
	  };
	  ICompElement.prototype.renderInnerContent = function() {
	    var i;
	    var len = this.layers.length;
	    for (i = 0; i < len; i += 1) {
	      if (this.completeLayers || this.elements[i]) {
	        this.elements[i].renderFrame();
	      }
	    }
	  };
	  ICompElement.prototype.setElements = function(elems) {
	    this.elements = elems;
	  };
	  ICompElement.prototype.getElements = function() {
	    return this.elements;
	  };
	  ICompElement.prototype.destroyElements = function() {
	    var i;
	    var len = this.layers.length;
	    for (i = 0; i < len; i += 1) {
	      if (this.elements[i]) {
	        this.elements[i].destroy();
	      }
	    }
	  };
	  ICompElement.prototype.destroy = function() {
	    this.destroyElements();
	    this.destroyBaseElement();
	  };
	  function SVGCompElement(data2, globalData2, comp2) {
	    this.layers = data2.layers;
	    this.supports3d = true;
	    this.completeLayers = false;
	    this.pendingElements = [];
	    this.elements = this.layers ? createSizedArray(this.layers.length) : [];
	    this.initElement(data2, globalData2, comp2);
	    this.tm = data2.tm ? PropertyFactory.getProp(this, data2.tm, 0, globalData2.frameRate, this) : {
	      _placeholder: true
	    };
	  }
	  extendPrototype([SVGRendererBase, ICompElement, SVGBaseElement], SVGCompElement);
	  SVGCompElement.prototype.createComp = function(data2) {
	    return new SVGCompElement(data2, this.globalData, this);
	  };
	  function SVGRenderer(animationItem, config) {
	    this.animationItem = animationItem;
	    this.layers = null;
	    this.renderedFrame = -1;
	    this.svgElement = createNS("svg");
	    var ariaLabel = "";
	    if (config && config.title) {
	      var titleElement = createNS("title");
	      var titleId = createElementID();
	      titleElement.setAttribute("id", titleId);
	      titleElement.textContent = config.title;
	      this.svgElement.appendChild(titleElement);
	      ariaLabel += titleId;
	    }
	    if (config && config.description) {
	      var descElement = createNS("desc");
	      var descId = createElementID();
	      descElement.setAttribute("id", descId);
	      descElement.textContent = config.description;
	      this.svgElement.appendChild(descElement);
	      ariaLabel += " " + descId;
	    }
	    if (ariaLabel) {
	      this.svgElement.setAttribute("aria-labelledby", ariaLabel);
	    }
	    var defs = createNS("defs");
	    this.svgElement.appendChild(defs);
	    var maskElement = createNS("g");
	    this.svgElement.appendChild(maskElement);
	    this.layerElement = maskElement;
	    this.renderConfig = {
	      preserveAspectRatio: config && config.preserveAspectRatio || "xMidYMid meet",
	      imagePreserveAspectRatio: config && config.imagePreserveAspectRatio || "xMidYMid slice",
	      contentVisibility: config && config.contentVisibility || "visible",
	      progressiveLoad: config && config.progressiveLoad || false,
	      hideOnTransparent: !(config && config.hideOnTransparent === false),
	      viewBoxOnly: config && config.viewBoxOnly || false,
	      viewBoxSize: config && config.viewBoxSize || false,
	      className: config && config.className || "",
	      id: config && config.id || "",
	      focusable: config && config.focusable,
	      filterSize: {
	        width: config && config.filterSize && config.filterSize.width || "100%",
	        height: config && config.filterSize && config.filterSize.height || "100%",
	        x: config && config.filterSize && config.filterSize.x || "0%",
	        y: config && config.filterSize && config.filterSize.y || "0%"
	      },
	      width: config && config.width,
	      height: config && config.height,
	      runExpressions: !config || config.runExpressions === void 0 || config.runExpressions
	    };
	    this.globalData = {
	      _mdf: false,
	      frameNum: -1,
	      defs,
	      renderConfig: this.renderConfig
	    };
	    this.elements = [];
	    this.pendingElements = [];
	    this.destroyed = false;
	    this.rendererType = "svg";
	  }
	  extendPrototype([SVGRendererBase], SVGRenderer);
	  SVGRenderer.prototype.createComp = function(data2) {
	    return new SVGCompElement(data2, this.globalData, this);
	  };
	  function ShapeTransformManager() {
	    this.sequences = {};
	    this.sequenceList = [];
	    this.transform_key_count = 0;
	  }
	  ShapeTransformManager.prototype = {
	    addTransformSequence: function addTransformSequence(transforms) {
	      var i;
	      var len = transforms.length;
	      var key2 = "_";
	      for (i = 0; i < len; i += 1) {
	        key2 += transforms[i].transform.key + "_";
	      }
	      var sequence = this.sequences[key2];
	      if (!sequence) {
	        sequence = {
	          transforms: [].concat(transforms),
	          finalTransform: new Matrix(),
	          _mdf: false
	        };
	        this.sequences[key2] = sequence;
	        this.sequenceList.push(sequence);
	      }
	      return sequence;
	    },
	    processSequence: function processSequence(sequence, isFirstFrame) {
	      var i = 0;
	      var len = sequence.transforms.length;
	      var _mdf = isFirstFrame;
	      while (i < len && !isFirstFrame) {
	        if (sequence.transforms[i].transform.mProps._mdf) {
	          _mdf = true;
	          break;
	        }
	        i += 1;
	      }
	      if (_mdf) {
	        sequence.finalTransform.reset();
	        for (i = len - 1; i >= 0; i -= 1) {
	          sequence.finalTransform.multiply(sequence.transforms[i].transform.mProps.v);
	        }
	      }
	      sequence._mdf = _mdf;
	    },
	    processSequences: function processSequences(isFirstFrame) {
	      var i;
	      var len = this.sequenceList.length;
	      for (i = 0; i < len; i += 1) {
	        this.processSequence(this.sequenceList[i], isFirstFrame);
	      }
	    },
	    getNewKey: function getNewKey() {
	      this.transform_key_count += 1;
	      return "_" + this.transform_key_count;
	    }
	  };
	  var lumaLoader = function lumaLoader2() {
	    var id = "__lottie_element_luma_buffer";
	    var lumaBuffer = null;
	    var lumaBufferCtx = null;
	    var svg = null;
	    function createLumaSvgFilter() {
	      var _svg = createNS("svg");
	      var fil = createNS("filter");
	      var matrix = createNS("feColorMatrix");
	      fil.setAttribute("id", id);
	      matrix.setAttribute("type", "matrix");
	      matrix.setAttribute("color-interpolation-filters", "sRGB");
	      matrix.setAttribute("values", "0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0");
	      fil.appendChild(matrix);
	      _svg.appendChild(fil);
	      _svg.setAttribute("id", id + "_svg");
	      if (featureSupport.svgLumaHidden) {
	        _svg.style.display = "none";
	      }
	      return _svg;
	    }
	    function loadLuma() {
	      if (!lumaBuffer) {
	        svg = createLumaSvgFilter();
	        document.body.appendChild(svg);
	        lumaBuffer = createTag("canvas");
	        lumaBufferCtx = lumaBuffer.getContext("2d");
	        lumaBufferCtx.filter = "url(#" + id + ")";
	        lumaBufferCtx.fillStyle = "rgba(0,0,0,0)";
	        lumaBufferCtx.fillRect(0, 0, 1, 1);
	      }
	    }
	    function getLuma(canvas) {
	      if (!lumaBuffer) {
	        loadLuma();
	      }
	      lumaBuffer.width = canvas.width;
	      lumaBuffer.height = canvas.height;
	      lumaBufferCtx.filter = "url(#" + id + ")";
	      return lumaBuffer;
	    }
	    return {
	      load: loadLuma,
	      get: getLuma
	    };
	  };
	  function createCanvas(width2, height2) {
	    if (featureSupport.offscreenCanvas) {
	      return new OffscreenCanvas(width2, height2);
	    }
	    var canvas = createTag("canvas");
	    canvas.width = width2;
	    canvas.height = height2;
	    return canvas;
	  }
	  var assetLoader = function() {
	    return {
	      loadLumaCanvas: lumaLoader.load,
	      getLumaCanvas: lumaLoader.get,
	      createCanvas
	    };
	  }();
	  var registeredEffects = {};
	  function CVEffects(elem2) {
	    var i;
	    var len = elem2.data.ef ? elem2.data.ef.length : 0;
	    this.filters = [];
	    var filterManager;
	    for (i = 0; i < len; i += 1) {
	      filterManager = null;
	      var type = elem2.data.ef[i].ty;
	      if (registeredEffects[type]) {
	        var Effect = registeredEffects[type].effect;
	        filterManager = new Effect(elem2.effectsManager.effectElements[i], elem2);
	      }
	      if (filterManager) {
	        this.filters.push(filterManager);
	      }
	    }
	    if (this.filters.length) {
	      elem2.addRenderableComponent(this);
	    }
	  }
	  CVEffects.prototype.renderFrame = function(_isFirstFrame) {
	    var i;
	    var len = this.filters.length;
	    for (i = 0; i < len; i += 1) {
	      this.filters[i].renderFrame(_isFirstFrame);
	    }
	  };
	  CVEffects.prototype.getEffects = function(type) {
	    var i;
	    var len = this.filters.length;
	    var effects = [];
	    for (i = 0; i < len; i += 1) {
	      if (this.filters[i].type === type) {
	        effects.push(this.filters[i]);
	      }
	    }
	    return effects;
	  };
	  function registerEffect(id, effect2) {
	    registeredEffects[id] = {
	      effect: effect2
	    };
	  }
	  function CVMaskElement(data2, element) {
	    this.data = data2;
	    this.element = element;
	    this.masksProperties = this.data.masksProperties || [];
	    this.viewData = createSizedArray(this.masksProperties.length);
	    var i;
	    var len = this.masksProperties.length;
	    var hasMasks = false;
	    for (i = 0; i < len; i += 1) {
	      if (this.masksProperties[i].mode !== "n") {
	        hasMasks = true;
	      }
	      this.viewData[i] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[i], 3);
	    }
	    this.hasMasks = hasMasks;
	    if (hasMasks) {
	      this.element.addRenderableComponent(this);
	    }
	  }
	  CVMaskElement.prototype.renderFrame = function() {
	    if (!this.hasMasks) {
	      return;
	    }
	    var transform2 = this.element.finalTransform.mat;
	    var ctx = this.element.canvasContext;
	    var i;
	    var len = this.masksProperties.length;
	    var pt;
	    var pts;
	    var data2;
	    ctx.beginPath();
	    for (i = 0; i < len; i += 1) {
	      if (this.masksProperties[i].mode !== "n") {
	        if (this.masksProperties[i].inv) {
	          ctx.moveTo(0, 0);
	          ctx.lineTo(this.element.globalData.compSize.w, 0);
	          ctx.lineTo(this.element.globalData.compSize.w, this.element.globalData.compSize.h);
	          ctx.lineTo(0, this.element.globalData.compSize.h);
	          ctx.lineTo(0, 0);
	        }
	        data2 = this.viewData[i].v;
	        pt = transform2.applyToPointArray(data2.v[0][0], data2.v[0][1], 0);
	        ctx.moveTo(pt[0], pt[1]);
	        var j;
	        var jLen = data2._length;
	        for (j = 1; j < jLen; j += 1) {
	          pts = transform2.applyToTriplePoints(data2.o[j - 1], data2.i[j], data2.v[j]);
	          ctx.bezierCurveTo(pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]);
	        }
	        pts = transform2.applyToTriplePoints(data2.o[j - 1], data2.i[0], data2.v[0]);
	        ctx.bezierCurveTo(pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]);
	      }
	    }
	    this.element.globalData.renderer.save(true);
	    ctx.clip();
	  };
	  CVMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty;
	  CVMaskElement.prototype.destroy = function() {
	    this.element = null;
	  };
	  function CVBaseElement() {
	  }
	  var operationsMap = {
	    1: "source-in",
	    2: "source-out",
	    3: "source-in",
	    4: "source-out"
	  };
	  CVBaseElement.prototype = {
	    createElements: function createElements() {
	    },
	    initRendererElement: function initRendererElement() {
	    },
	    createContainerElements: function createContainerElements() {
	      if (this.data.tt >= 1) {
	        this.buffers = [];
	        var canvasContext = this.globalData.canvasContext;
	        var bufferCanvas = assetLoader.createCanvas(canvasContext.canvas.width, canvasContext.canvas.height);
	        this.buffers.push(bufferCanvas);
	        var bufferCanvas2 = assetLoader.createCanvas(canvasContext.canvas.width, canvasContext.canvas.height);
	        this.buffers.push(bufferCanvas2);
	        if (this.data.tt >= 3 && !document._isProxy) {
	          assetLoader.loadLumaCanvas();
	        }
	      }
	      this.canvasContext = this.globalData.canvasContext;
	      this.transformCanvas = this.globalData.transformCanvas;
	      this.renderableEffectsManager = new CVEffects(this);
	      this.searchEffectTransforms();
	    },
	    createContent: function createContent() {
	    },
	    setBlendMode: function setBlendMode() {
	      var globalData2 = this.globalData;
	      if (globalData2.blendMode !== this.data.bm) {
	        globalData2.blendMode = this.data.bm;
	        var blendModeValue = getBlendMode(this.data.bm);
	        globalData2.canvasContext.globalCompositeOperation = blendModeValue;
	      }
	    },
	    createRenderableComponents: function createRenderableComponents() {
	      this.maskManager = new CVMaskElement(this.data, this);
	      this.transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
	    },
	    hideElement: function hideElement() {
	      if (!this.hidden && (!this.isInRange || this.isTransparent)) {
	        this.hidden = true;
	      }
	    },
	    showElement: function showElement() {
	      if (this.isInRange && !this.isTransparent) {
	        this.hidden = false;
	        this._isFirstFrame = true;
	        this.maskManager._isFirstFrame = true;
	      }
	    },
	    clearCanvas: function clearCanvas(canvasContext) {
	      canvasContext.clearRect(this.transformCanvas.tx, this.transformCanvas.ty, this.transformCanvas.w * this.transformCanvas.sx, this.transformCanvas.h * this.transformCanvas.sy);
	    },
	    prepareLayer: function prepareLayer() {
	      if (this.data.tt >= 1) {
	        var buffer = this.buffers[0];
	        var bufferCtx = buffer.getContext("2d");
	        this.clearCanvas(bufferCtx);
	        bufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
	        this.currentTransform = this.canvasContext.getTransform();
	        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
	        this.clearCanvas(this.canvasContext);
	        this.canvasContext.setTransform(this.currentTransform);
	      }
	    },
	    exitLayer: function exitLayer() {
	      if (this.data.tt >= 1) {
	        var buffer = this.buffers[1];
	        var bufferCtx = buffer.getContext("2d");
	        this.clearCanvas(bufferCtx);
	        bufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
	        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
	        this.clearCanvas(this.canvasContext);
	        this.canvasContext.setTransform(this.currentTransform);
	        var mask2 = this.comp.getElementById("tp" in this.data ? this.data.tp : this.data.ind - 1);
	        mask2.renderFrame(true);
	        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
	        if (this.data.tt >= 3 && !document._isProxy) {
	          var lumaBuffer = assetLoader.getLumaCanvas(this.canvasContext.canvas);
	          var lumaBufferCtx = lumaBuffer.getContext("2d");
	          lumaBufferCtx.drawImage(this.canvasContext.canvas, 0, 0);
	          this.clearCanvas(this.canvasContext);
	          this.canvasContext.drawImage(lumaBuffer, 0, 0);
	        }
	        this.canvasContext.globalCompositeOperation = operationsMap[this.data.tt];
	        this.canvasContext.drawImage(buffer, 0, 0);
	        this.canvasContext.globalCompositeOperation = "destination-over";
	        this.canvasContext.drawImage(this.buffers[0], 0, 0);
	        this.canvasContext.setTransform(this.currentTransform);
	        this.canvasContext.globalCompositeOperation = "source-over";
	      }
	    },
	    renderFrame: function renderFrame(forceRender) {
	      if (this.hidden || this.data.hd) {
	        return;
	      }
	      if (this.data.td === 1 && !forceRender) {
	        return;
	      }
	      this.renderTransform();
	      this.renderRenderable();
	      this.renderLocalTransform();
	      this.setBlendMode();
	      var forceRealStack = this.data.ty === 0;
	      this.prepareLayer();
	      this.globalData.renderer.save(forceRealStack);
	      this.globalData.renderer.ctxTransform(this.finalTransform.localMat.props);
	      this.globalData.renderer.ctxOpacity(this.finalTransform.localOpacity);
	      this.renderInnerContent();
	      this.globalData.renderer.restore(forceRealStack);
	      this.exitLayer();
	      if (this.maskManager.hasMasks) {
	        this.globalData.renderer.restore(true);
	      }
	      if (this._isFirstFrame) {
	        this._isFirstFrame = false;
	      }
	    },
	    destroy: function destroy() {
	      this.canvasContext = null;
	      this.data = null;
	      this.globalData = null;
	      this.maskManager.destroy();
	    },
	    mHelper: new Matrix()
	  };
	  CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
	  CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;
	  function CVShapeData(element, data2, styles, transformsManager) {
	    this.styledShapes = [];
	    this.tr = [0, 0, 0, 0, 0, 0];
	    var ty = 4;
	    if (data2.ty === "rc") {
	      ty = 5;
	    } else if (data2.ty === "el") {
	      ty = 6;
	    } else if (data2.ty === "sr") {
	      ty = 7;
	    }
	    this.sh = ShapePropertyFactory.getShapeProp(element, data2, ty, element);
	    var i;
	    var len = styles.length;
	    var styledShape;
	    for (i = 0; i < len; i += 1) {
	      if (!styles[i].closed) {
	        styledShape = {
	          transforms: transformsManager.addTransformSequence(styles[i].transforms),
	          trNodes: []
	        };
	        this.styledShapes.push(styledShape);
	        styles[i].elements.push(styledShape);
	      }
	    }
	  }
	  CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated;
	  function CVShapeElement(data2, globalData2, comp2) {
	    this.shapes = [];
	    this.shapesData = data2.shapes;
	    this.stylesList = [];
	    this.itemsData = [];
	    this.prevViewData = [];
	    this.shapeModifiers = [];
	    this.processedElements = [];
	    this.transformsManager = new ShapeTransformManager();
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement], CVShapeElement);
	  CVShapeElement.prototype.initElement = RenderableDOMElement.prototype.initElement;
	  CVShapeElement.prototype.transformHelper = {
	    opacity: 1,
	    _opMdf: false
	  };
	  CVShapeElement.prototype.dashResetter = [];
	  CVShapeElement.prototype.createContent = function() {
	    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
	  };
	  CVShapeElement.prototype.createStyleElement = function(data2, transforms) {
	    var styleElem = {
	      data: data2,
	      type: data2.ty,
	      preTransforms: this.transformsManager.addTransformSequence(transforms),
	      transforms: [],
	      elements: [],
	      closed: data2.hd === true
	    };
	    var elementData = {};
	    if (data2.ty === "fl" || data2.ty === "st") {
	      elementData.c = PropertyFactory.getProp(this, data2.c, 1, 255, this);
	      if (!elementData.c.k) {
	        styleElem.co = "rgb(" + bmFloor(elementData.c.v[0]) + "," + bmFloor(elementData.c.v[1]) + "," + bmFloor(elementData.c.v[2]) + ")";
	      }
	    } else if (data2.ty === "gf" || data2.ty === "gs") {
	      elementData.s = PropertyFactory.getProp(this, data2.s, 1, null, this);
	      elementData.e = PropertyFactory.getProp(this, data2.e, 1, null, this);
	      elementData.h = PropertyFactory.getProp(this, data2.h || {
	        k: 0
	      }, 0, 0.01, this);
	      elementData.a = PropertyFactory.getProp(this, data2.a || {
	        k: 0
	      }, 0, degToRads, this);
	      elementData.g = new GradientProperty(this, data2.g, this);
	    }
	    elementData.o = PropertyFactory.getProp(this, data2.o, 0, 0.01, this);
	    if (data2.ty === "st" || data2.ty === "gs") {
	      styleElem.lc = lineCapEnum[data2.lc || 2];
	      styleElem.lj = lineJoinEnum[data2.lj || 2];
	      if (data2.lj == 1) {
	        styleElem.ml = data2.ml;
	      }
	      elementData.w = PropertyFactory.getProp(this, data2.w, 0, null, this);
	      if (!elementData.w.k) {
	        styleElem.wi = elementData.w.v;
	      }
	      if (data2.d) {
	        var d = new DashProperty(this, data2.d, "canvas", this);
	        elementData.d = d;
	        if (!elementData.d.k) {
	          styleElem.da = elementData.d.dashArray;
	          styleElem["do"] = elementData.d.dashoffset[0];
	        }
	      }
	    } else {
	      styleElem.r = data2.r === 2 ? "evenodd" : "nonzero";
	    }
	    this.stylesList.push(styleElem);
	    elementData.style = styleElem;
	    return elementData;
	  };
	  CVShapeElement.prototype.createGroupElement = function() {
	    var elementData = {
	      it: [],
	      prevViewData: []
	    };
	    return elementData;
	  };
	  CVShapeElement.prototype.createTransformElement = function(data2) {
	    var elementData = {
	      transform: {
	        opacity: 1,
	        _opMdf: false,
	        key: this.transformsManager.getNewKey(),
	        op: PropertyFactory.getProp(this, data2.o, 0, 0.01, this),
	        mProps: TransformPropertyFactory.getTransformProperty(this, data2, this)
	      }
	    };
	    return elementData;
	  };
	  CVShapeElement.prototype.createShapeElement = function(data2) {
	    var elementData = new CVShapeData(this, data2, this.stylesList, this.transformsManager);
	    this.shapes.push(elementData);
	    this.addShapeToModifiers(elementData);
	    return elementData;
	  };
	  CVShapeElement.prototype.reloadShapes = function() {
	    this._isFirstFrame = true;
	    var i;
	    var len = this.itemsData.length;
	    for (i = 0; i < len; i += 1) {
	      this.prevViewData[i] = this.itemsData[i];
	    }
	    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
	    len = this.dynamicProperties.length;
	    for (i = 0; i < len; i += 1) {
	      this.dynamicProperties[i].getValue();
	    }
	    this.renderModifiers();
	    this.transformsManager.processSequences(this._isFirstFrame);
	  };
	  CVShapeElement.prototype.addTransformToStyleList = function(transform2) {
	    var i;
	    var len = this.stylesList.length;
	    for (i = 0; i < len; i += 1) {
	      if (!this.stylesList[i].closed) {
	        this.stylesList[i].transforms.push(transform2);
	      }
	    }
	  };
	  CVShapeElement.prototype.removeTransformFromStyleList = function() {
	    var i;
	    var len = this.stylesList.length;
	    for (i = 0; i < len; i += 1) {
	      if (!this.stylesList[i].closed) {
	        this.stylesList[i].transforms.pop();
	      }
	    }
	  };
	  CVShapeElement.prototype.closeStyles = function(styles) {
	    var i;
	    var len = styles.length;
	    for (i = 0; i < len; i += 1) {
	      styles[i].closed = true;
	    }
	  };
	  CVShapeElement.prototype.searchShapes = function(arr, itemsData, prevViewData, shouldRender, transforms) {
	    var i;
	    var len = arr.length - 1;
	    var j;
	    var jLen;
	    var ownStyles = [];
	    var ownModifiers = [];
	    var processedPos;
	    var modifier;
	    var currentTransform;
	    var ownTransforms = [].concat(transforms);
	    for (i = len; i >= 0; i -= 1) {
	      processedPos = this.searchProcessedElement(arr[i]);
	      if (!processedPos) {
	        arr[i]._shouldRender = shouldRender;
	      } else {
	        itemsData[i] = prevViewData[processedPos - 1];
	      }
	      if (arr[i].ty === "fl" || arr[i].ty === "st" || arr[i].ty === "gf" || arr[i].ty === "gs") {
	        if (!processedPos) {
	          itemsData[i] = this.createStyleElement(arr[i], ownTransforms);
	        } else {
	          itemsData[i].style.closed = false;
	        }
	        ownStyles.push(itemsData[i].style);
	      } else if (arr[i].ty === "gr") {
	        if (!processedPos) {
	          itemsData[i] = this.createGroupElement(arr[i]);
	        } else {
	          jLen = itemsData[i].it.length;
	          for (j = 0; j < jLen; j += 1) {
	            itemsData[i].prevViewData[j] = itemsData[i].it[j];
	          }
	        }
	        this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, shouldRender, ownTransforms);
	      } else if (arr[i].ty === "tr") {
	        if (!processedPos) {
	          currentTransform = this.createTransformElement(arr[i]);
	          itemsData[i] = currentTransform;
	        }
	        ownTransforms.push(itemsData[i]);
	        this.addTransformToStyleList(itemsData[i]);
	      } else if (arr[i].ty === "sh" || arr[i].ty === "rc" || arr[i].ty === "el" || arr[i].ty === "sr") {
	        if (!processedPos) {
	          itemsData[i] = this.createShapeElement(arr[i]);
	        }
	      } else if (arr[i].ty === "tm" || arr[i].ty === "rd" || arr[i].ty === "pb" || arr[i].ty === "zz" || arr[i].ty === "op") {
	        if (!processedPos) {
	          modifier = ShapeModifiers.getModifier(arr[i].ty);
	          modifier.init(this, arr[i]);
	          itemsData[i] = modifier;
	          this.shapeModifiers.push(modifier);
	        } else {
	          modifier = itemsData[i];
	          modifier.closed = false;
	        }
	        ownModifiers.push(modifier);
	      } else if (arr[i].ty === "rp") {
	        if (!processedPos) {
	          modifier = ShapeModifiers.getModifier(arr[i].ty);
	          itemsData[i] = modifier;
	          modifier.init(this, arr, i, itemsData);
	          this.shapeModifiers.push(modifier);
	          shouldRender = false;
	        } else {
	          modifier = itemsData[i];
	          modifier.closed = true;
	        }
	        ownModifiers.push(modifier);
	      }
	      this.addProcessedElement(arr[i], i + 1);
	    }
	    this.removeTransformFromStyleList();
	    this.closeStyles(ownStyles);
	    len = ownModifiers.length;
	    for (i = 0; i < len; i += 1) {
	      ownModifiers[i].closed = true;
	    }
	  };
	  CVShapeElement.prototype.renderInnerContent = function() {
	    this.transformHelper.opacity = 1;
	    this.transformHelper._opMdf = false;
	    this.renderModifiers();
	    this.transformsManager.processSequences(this._isFirstFrame);
	    this.renderShape(this.transformHelper, this.shapesData, this.itemsData, true);
	  };
	  CVShapeElement.prototype.renderShapeTransform = function(parentTransform, groupTransform) {
	    if (parentTransform._opMdf || groupTransform.op._mdf || this._isFirstFrame) {
	      groupTransform.opacity = parentTransform.opacity;
	      groupTransform.opacity *= groupTransform.op.v;
	      groupTransform._opMdf = true;
	    }
	  };
	  CVShapeElement.prototype.drawLayer = function() {
	    var i;
	    var len = this.stylesList.length;
	    var j;
	    var jLen;
	    var k;
	    var kLen;
	    var elems;
	    var nodes;
	    var renderer2 = this.globalData.renderer;
	    var ctx = this.globalData.canvasContext;
	    var type;
	    var currentStyle;
	    for (i = 0; i < len; i += 1) {
	      currentStyle = this.stylesList[i];
	      type = currentStyle.type;
	      if (!((type === "st" || type === "gs") && currentStyle.wi === 0 || !currentStyle.data._shouldRender || currentStyle.coOp === 0 || this.globalData.currentGlobalAlpha === 0)) {
	        renderer2.save();
	        elems = currentStyle.elements;
	        if (type === "st" || type === "gs") {
	          renderer2.ctxStrokeStyle(type === "st" ? currentStyle.co : currentStyle.grd);
	          renderer2.ctxLineWidth(currentStyle.wi);
	          renderer2.ctxLineCap(currentStyle.lc);
	          renderer2.ctxLineJoin(currentStyle.lj);
	          renderer2.ctxMiterLimit(currentStyle.ml || 0);
	        } else {
	          renderer2.ctxFillStyle(type === "fl" ? currentStyle.co : currentStyle.grd);
	        }
	        renderer2.ctxOpacity(currentStyle.coOp);
	        if (type !== "st" && type !== "gs") {
	          ctx.beginPath();
	        }
	        renderer2.ctxTransform(currentStyle.preTransforms.finalTransform.props);
	        jLen = elems.length;
	        for (j = 0; j < jLen; j += 1) {
	          if (type === "st" || type === "gs") {
	            ctx.beginPath();
	            if (currentStyle.da) {
	              ctx.setLineDash(currentStyle.da);
	              ctx.lineDashOffset = currentStyle["do"];
	            }
	          }
	          nodes = elems[j].trNodes;
	          kLen = nodes.length;
	          for (k = 0; k < kLen; k += 1) {
	            if (nodes[k].t === "m") {
	              ctx.moveTo(nodes[k].p[0], nodes[k].p[1]);
	            } else if (nodes[k].t === "c") {
	              ctx.bezierCurveTo(nodes[k].pts[0], nodes[k].pts[1], nodes[k].pts[2], nodes[k].pts[3], nodes[k].pts[4], nodes[k].pts[5]);
	            } else {
	              ctx.closePath();
	            }
	          }
	          if (type === "st" || type === "gs") {
	            renderer2.ctxStroke();
	            if (currentStyle.da) {
	              ctx.setLineDash(this.dashResetter);
	            }
	          }
	        }
	        if (type !== "st" && type !== "gs") {
	          this.globalData.renderer.ctxFill(currentStyle.r);
	        }
	        renderer2.restore();
	      }
	    }
	  };
	  CVShapeElement.prototype.renderShape = function(parentTransform, items, data2, isMain) {
	    var i;
	    var len = items.length - 1;
	    var groupTransform;
	    groupTransform = parentTransform;
	    for (i = len; i >= 0; i -= 1) {
	      if (items[i].ty === "tr") {
	        groupTransform = data2[i].transform;
	        this.renderShapeTransform(parentTransform, groupTransform);
	      } else if (items[i].ty === "sh" || items[i].ty === "el" || items[i].ty === "rc" || items[i].ty === "sr") {
	        this.renderPath(items[i], data2[i]);
	      } else if (items[i].ty === "fl") {
	        this.renderFill(items[i], data2[i], groupTransform);
	      } else if (items[i].ty === "st") {
	        this.renderStroke(items[i], data2[i], groupTransform);
	      } else if (items[i].ty === "gf" || items[i].ty === "gs") {
	        this.renderGradientFill(items[i], data2[i], groupTransform);
	      } else if (items[i].ty === "gr") {
	        this.renderShape(groupTransform, items[i].it, data2[i].it);
	      } else if (items[i].ty === "tm") ;
	    }
	    if (isMain) {
	      this.drawLayer();
	    }
	  };
	  CVShapeElement.prototype.renderStyledShape = function(styledShape, shape) {
	    if (this._isFirstFrame || shape._mdf || styledShape.transforms._mdf) {
	      var shapeNodes = styledShape.trNodes;
	      var paths = shape.paths;
	      var i;
	      var len;
	      var j;
	      var jLen = paths._length;
	      shapeNodes.length = 0;
	      var groupTransformMat = styledShape.transforms.finalTransform;
	      for (j = 0; j < jLen; j += 1) {
	        var pathNodes = paths.shapes[j];
	        if (pathNodes && pathNodes.v) {
	          len = pathNodes._length;
	          for (i = 1; i < len; i += 1) {
	            if (i === 1) {
	              shapeNodes.push({
	                t: "m",
	                p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
	              });
	            }
	            shapeNodes.push({
	              t: "c",
	              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[i], pathNodes.v[i])
	            });
	          }
	          if (len === 1) {
	            shapeNodes.push({
	              t: "m",
	              p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
	            });
	          }
	          if (pathNodes.c && len) {
	            shapeNodes.push({
	              t: "c",
	              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[0], pathNodes.v[0])
	            });
	            shapeNodes.push({
	              t: "z"
	            });
	          }
	        }
	      }
	      styledShape.trNodes = shapeNodes;
	    }
	  };
	  CVShapeElement.prototype.renderPath = function(pathData, itemData) {
	    if (pathData.hd !== true && pathData._shouldRender) {
	      var i;
	      var len = itemData.styledShapes.length;
	      for (i = 0; i < len; i += 1) {
	        this.renderStyledShape(itemData.styledShapes[i], itemData.sh);
	      }
	    }
	  };
	  CVShapeElement.prototype.renderFill = function(styleData, itemData, groupTransform) {
	    var styleElem = itemData.style;
	    if (itemData.c._mdf || this._isFirstFrame) {
	      styleElem.co = "rgb(" + bmFloor(itemData.c.v[0]) + "," + bmFloor(itemData.c.v[1]) + "," + bmFloor(itemData.c.v[2]) + ")";
	    }
	    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
	      styleElem.coOp = itemData.o.v * groupTransform.opacity;
	    }
	  };
	  CVShapeElement.prototype.renderGradientFill = function(styleData, itemData, groupTransform) {
	    var styleElem = itemData.style;
	    var grd;
	    if (!styleElem.grd || itemData.g._mdf || itemData.s._mdf || itemData.e._mdf || styleData.t !== 1 && (itemData.h._mdf || itemData.a._mdf)) {
	      var ctx = this.globalData.canvasContext;
	      var pt1 = itemData.s.v;
	      var pt2 = itemData.e.v;
	      if (styleData.t === 1) {
	        grd = ctx.createLinearGradient(pt1[0], pt1[1], pt2[0], pt2[1]);
	      } else {
	        var rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
	        var ang = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]);
	        var percent = itemData.h.v;
	        if (percent >= 1) {
	          percent = 0.99;
	        } else if (percent <= -1) {
	          percent = -0.99;
	        }
	        var dist = rad * percent;
	        var x = Math.cos(ang + itemData.a.v) * dist + pt1[0];
	        var y = Math.sin(ang + itemData.a.v) * dist + pt1[1];
	        grd = ctx.createRadialGradient(x, y, 0, pt1[0], pt1[1], rad);
	      }
	      var i;
	      var len = styleData.g.p;
	      var cValues = itemData.g.c;
	      var opacity = 1;
	      for (i = 0; i < len; i += 1) {
	        if (itemData.g._hasOpacity && itemData.g._collapsable) {
	          opacity = itemData.g.o[i * 2 + 1];
	        }
	        grd.addColorStop(cValues[i * 4] / 100, "rgba(" + cValues[i * 4 + 1] + "," + cValues[i * 4 + 2] + "," + cValues[i * 4 + 3] + "," + opacity + ")");
	      }
	      styleElem.grd = grd;
	    }
	    styleElem.coOp = itemData.o.v * groupTransform.opacity;
	  };
	  CVShapeElement.prototype.renderStroke = function(styleData, itemData, groupTransform) {
	    var styleElem = itemData.style;
	    var d = itemData.d;
	    if (d && (d._mdf || this._isFirstFrame)) {
	      styleElem.da = d.dashArray;
	      styleElem["do"] = d.dashoffset[0];
	    }
	    if (itemData.c._mdf || this._isFirstFrame) {
	      styleElem.co = "rgb(" + bmFloor(itemData.c.v[0]) + "," + bmFloor(itemData.c.v[1]) + "," + bmFloor(itemData.c.v[2]) + ")";
	    }
	    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
	      styleElem.coOp = itemData.o.v * groupTransform.opacity;
	    }
	    if (itemData.w._mdf || this._isFirstFrame) {
	      styleElem.wi = itemData.w.v;
	    }
	  };
	  CVShapeElement.prototype.destroy = function() {
	    this.shapesData = null;
	    this.globalData = null;
	    this.canvasContext = null;
	    this.stylesList.length = 0;
	    this.itemsData.length = 0;
	  };
	  function CVTextElement(data2, globalData2, comp2) {
	    this.textSpans = [];
	    this.yOffset = 0;
	    this.fillColorAnim = false;
	    this.strokeColorAnim = false;
	    this.strokeWidthAnim = false;
	    this.stroke = false;
	    this.fill = false;
	    this.justifyOffset = 0;
	    this.currentRender = null;
	    this.renderType = "canvas";
	    this.values = {
	      fill: "rgba(0,0,0,0)",
	      stroke: "rgba(0,0,0,0)",
	      sWidth: 0,
	      fValue: ""
	    };
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement], CVTextElement);
	  CVTextElement.prototype.tHelper = createTag("canvas").getContext("2d");
	  CVTextElement.prototype.buildNewText = function() {
	    var documentData = this.textProperty.currentData;
	    this.renderedLetters = createSizedArray(documentData.l ? documentData.l.length : 0);
	    var hasFill = false;
	    if (documentData.fc) {
	      hasFill = true;
	      this.values.fill = this.buildColor(documentData.fc);
	    } else {
	      this.values.fill = "rgba(0,0,0,0)";
	    }
	    this.fill = hasFill;
	    var hasStroke = false;
	    if (documentData.sc) {
	      hasStroke = true;
	      this.values.stroke = this.buildColor(documentData.sc);
	      this.values.sWidth = documentData.sw;
	    }
	    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
	    var i;
	    var len;
	    var letters = documentData.l;
	    var matrixHelper = this.mHelper;
	    this.stroke = hasStroke;
	    this.values.fValue = documentData.finalSize + "px " + this.globalData.fontManager.getFontByName(documentData.f).fFamily;
	    len = documentData.finalText.length;
	    var charData;
	    var shapeData;
	    var k;
	    var kLen;
	    var shapes;
	    var j;
	    var jLen;
	    var pathNodes;
	    var commands;
	    var pathArr;
	    var singleShape = this.data.singleShape;
	    var trackingOffset = documentData.tr * 1e-3 * documentData.finalSize;
	    var xPos = 0;
	    var yPos = 0;
	    var firstLine = true;
	    var cnt = 0;
	    for (i = 0; i < len; i += 1) {
	      charData = this.globalData.fontManager.getCharData(documentData.finalText[i], fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
	      shapeData = charData && charData.data || {};
	      matrixHelper.reset();
	      if (singleShape && letters[i].n) {
	        xPos = -trackingOffset;
	        yPos += documentData.yOffset;
	        yPos += firstLine ? 1 : 0;
	        firstLine = false;
	      }
	      shapes = shapeData.shapes ? shapeData.shapes[0].it : [];
	      jLen = shapes.length;
	      matrixHelper.scale(documentData.finalSize / 100, documentData.finalSize / 100);
	      if (singleShape) {
	        this.applyTextPropertiesToMatrix(documentData, matrixHelper, letters[i].line, xPos, yPos);
	      }
	      commands = createSizedArray(jLen - 1);
	      var commandsCounter = 0;
	      for (j = 0; j < jLen; j += 1) {
	        if (shapes[j].ty === "sh") {
	          kLen = shapes[j].ks.k.i.length;
	          pathNodes = shapes[j].ks.k;
	          pathArr = [];
	          for (k = 1; k < kLen; k += 1) {
	            if (k === 1) {
	              pathArr.push(matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0), matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0));
	            }
	            pathArr.push(matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToX(pathNodes.i[k][0], pathNodes.i[k][1], 0), matrixHelper.applyToY(pathNodes.i[k][0], pathNodes.i[k][1], 0), matrixHelper.applyToX(pathNodes.v[k][0], pathNodes.v[k][1], 0), matrixHelper.applyToY(pathNodes.v[k][0], pathNodes.v[k][1], 0));
	          }
	          pathArr.push(matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToX(pathNodes.i[0][0], pathNodes.i[0][1], 0), matrixHelper.applyToY(pathNodes.i[0][0], pathNodes.i[0][1], 0), matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0), matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0));
	          commands[commandsCounter] = pathArr;
	          commandsCounter += 1;
	        }
	      }
	      if (singleShape) {
	        xPos += letters[i].l;
	        xPos += trackingOffset;
	      }
	      if (this.textSpans[cnt]) {
	        this.textSpans[cnt].elem = commands;
	      } else {
	        this.textSpans[cnt] = {
	          elem: commands
	        };
	      }
	      cnt += 1;
	    }
	  };
	  CVTextElement.prototype.renderInnerContent = function() {
	    this.validateText();
	    var ctx = this.canvasContext;
	    ctx.font = this.values.fValue;
	    this.globalData.renderer.ctxLineCap("butt");
	    this.globalData.renderer.ctxLineJoin("miter");
	    this.globalData.renderer.ctxMiterLimit(4);
	    if (!this.data.singleShape) {
	      this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
	    }
	    var i;
	    var len;
	    var j;
	    var jLen;
	    var k;
	    var kLen;
	    var renderedLetters = this.textAnimator.renderedLetters;
	    var letters = this.textProperty.currentData.l;
	    len = letters.length;
	    var renderedLetter;
	    var lastFill = null;
	    var lastStroke = null;
	    var lastStrokeW = null;
	    var commands;
	    var pathArr;
	    var renderer2 = this.globalData.renderer;
	    for (i = 0; i < len; i += 1) {
	      if (!letters[i].n) {
	        renderedLetter = renderedLetters[i];
	        if (renderedLetter) {
	          renderer2.save();
	          renderer2.ctxTransform(renderedLetter.p);
	          renderer2.ctxOpacity(renderedLetter.o);
	        }
	        if (this.fill) {
	          if (renderedLetter && renderedLetter.fc) {
	            if (lastFill !== renderedLetter.fc) {
	              renderer2.ctxFillStyle(renderedLetter.fc);
	              lastFill = renderedLetter.fc;
	            }
	          } else if (lastFill !== this.values.fill) {
	            lastFill = this.values.fill;
	            renderer2.ctxFillStyle(this.values.fill);
	          }
	          commands = this.textSpans[i].elem;
	          jLen = commands.length;
	          this.globalData.canvasContext.beginPath();
	          for (j = 0; j < jLen; j += 1) {
	            pathArr = commands[j];
	            kLen = pathArr.length;
	            this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
	            for (k = 2; k < kLen; k += 6) {
	              this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
	            }
	          }
	          this.globalData.canvasContext.closePath();
	          renderer2.ctxFill();
	        }
	        if (this.stroke) {
	          if (renderedLetter && renderedLetter.sw) {
	            if (lastStrokeW !== renderedLetter.sw) {
	              lastStrokeW = renderedLetter.sw;
	              renderer2.ctxLineWidth(renderedLetter.sw);
	            }
	          } else if (lastStrokeW !== this.values.sWidth) {
	            lastStrokeW = this.values.sWidth;
	            renderer2.ctxLineWidth(this.values.sWidth);
	          }
	          if (renderedLetter && renderedLetter.sc) {
	            if (lastStroke !== renderedLetter.sc) {
	              lastStroke = renderedLetter.sc;
	              renderer2.ctxStrokeStyle(renderedLetter.sc);
	            }
	          } else if (lastStroke !== this.values.stroke) {
	            lastStroke = this.values.stroke;
	            renderer2.ctxStrokeStyle(this.values.stroke);
	          }
	          commands = this.textSpans[i].elem;
	          jLen = commands.length;
	          this.globalData.canvasContext.beginPath();
	          for (j = 0; j < jLen; j += 1) {
	            pathArr = commands[j];
	            kLen = pathArr.length;
	            this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
	            for (k = 2; k < kLen; k += 6) {
	              this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
	            }
	          }
	          this.globalData.canvasContext.closePath();
	          renderer2.ctxStroke();
	        }
	        if (renderedLetter) {
	          this.globalData.renderer.restore();
	        }
	      }
	    }
	  };
	  function CVImageElement(data2, globalData2, comp2) {
	    this.assetData = globalData2.getAssetData(data2.refId);
	    this.img = globalData2.imageLoader.getAsset(this.assetData);
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVImageElement);
	  CVImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;
	  CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;
	  CVImageElement.prototype.createContent = function() {
	    if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
	      var canvas = createTag("canvas");
	      canvas.width = this.assetData.w;
	      canvas.height = this.assetData.h;
	      var ctx = canvas.getContext("2d");
	      var imgW = this.img.width;
	      var imgH = this.img.height;
	      var imgRel = imgW / imgH;
	      var canvasRel = this.assetData.w / this.assetData.h;
	      var widthCrop;
	      var heightCrop;
	      var par = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
	      if (imgRel > canvasRel && par === "xMidYMid slice" || imgRel < canvasRel && par !== "xMidYMid slice") {
	        heightCrop = imgH;
	        widthCrop = heightCrop * canvasRel;
	      } else {
	        widthCrop = imgW;
	        heightCrop = widthCrop / canvasRel;
	      }
	      ctx.drawImage(this.img, (imgW - widthCrop) / 2, (imgH - heightCrop) / 2, widthCrop, heightCrop, 0, 0, this.assetData.w, this.assetData.h);
	      this.img = canvas;
	    }
	  };
	  CVImageElement.prototype.renderInnerContent = function() {
	    this.canvasContext.drawImage(this.img, 0, 0);
	  };
	  CVImageElement.prototype.destroy = function() {
	    this.img = null;
	  };
	  function CVSolidElement(data2, globalData2, comp2) {
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement);
	  CVSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;
	  CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;
	  CVSolidElement.prototype.renderInnerContent = function() {
	    this.globalData.renderer.ctxFillStyle(this.data.sc);
	    this.globalData.renderer.ctxFillRect(0, 0, this.data.sw, this.data.sh);
	  };
	  function CanvasRendererBase() {
	  }
	  extendPrototype([BaseRenderer], CanvasRendererBase);
	  CanvasRendererBase.prototype.createShape = function(data2) {
	    return new CVShapeElement(data2, this.globalData, this);
	  };
	  CanvasRendererBase.prototype.createText = function(data2) {
	    return new CVTextElement(data2, this.globalData, this);
	  };
	  CanvasRendererBase.prototype.createImage = function(data2) {
	    return new CVImageElement(data2, this.globalData, this);
	  };
	  CanvasRendererBase.prototype.createSolid = function(data2) {
	    return new CVSolidElement(data2, this.globalData, this);
	  };
	  CanvasRendererBase.prototype.createNull = SVGRenderer.prototype.createNull;
	  CanvasRendererBase.prototype.ctxTransform = function(props) {
	    if (props[0] === 1 && props[1] === 0 && props[4] === 0 && props[5] === 1 && props[12] === 0 && props[13] === 0) {
	      return;
	    }
	    this.canvasContext.transform(props[0], props[1], props[4], props[5], props[12], props[13]);
	  };
	  CanvasRendererBase.prototype.ctxOpacity = function(op) {
	    this.canvasContext.globalAlpha *= op < 0 ? 0 : op;
	  };
	  CanvasRendererBase.prototype.ctxFillStyle = function(value2) {
	    this.canvasContext.fillStyle = value2;
	  };
	  CanvasRendererBase.prototype.ctxStrokeStyle = function(value2) {
	    this.canvasContext.strokeStyle = value2;
	  };
	  CanvasRendererBase.prototype.ctxLineWidth = function(value2) {
	    this.canvasContext.lineWidth = value2;
	  };
	  CanvasRendererBase.prototype.ctxLineCap = function(value2) {
	    this.canvasContext.lineCap = value2;
	  };
	  CanvasRendererBase.prototype.ctxLineJoin = function(value2) {
	    this.canvasContext.lineJoin = value2;
	  };
	  CanvasRendererBase.prototype.ctxMiterLimit = function(value2) {
	    this.canvasContext.miterLimit = value2;
	  };
	  CanvasRendererBase.prototype.ctxFill = function(rule) {
	    this.canvasContext.fill(rule);
	  };
	  CanvasRendererBase.prototype.ctxFillRect = function(x, y, w, h) {
	    this.canvasContext.fillRect(x, y, w, h);
	  };
	  CanvasRendererBase.prototype.ctxStroke = function() {
	    this.canvasContext.stroke();
	  };
	  CanvasRendererBase.prototype.reset = function() {
	    if (!this.renderConfig.clearCanvas) {
	      this.canvasContext.restore();
	      return;
	    }
	    this.contextData.reset();
	  };
	  CanvasRendererBase.prototype.save = function() {
	    this.canvasContext.save();
	  };
	  CanvasRendererBase.prototype.restore = function(actionFlag) {
	    if (!this.renderConfig.clearCanvas) {
	      this.canvasContext.restore();
	      return;
	    }
	    if (actionFlag) {
	      this.globalData.blendMode = "source-over";
	    }
	    this.contextData.restore(actionFlag);
	  };
	  CanvasRendererBase.prototype.configAnimation = function(animData) {
	    if (this.animationItem.wrapper) {
	      this.animationItem.container = createTag("canvas");
	      var containerStyle = this.animationItem.container.style;
	      containerStyle.width = "100%";
	      containerStyle.height = "100%";
	      var origin = "0px 0px 0px";
	      containerStyle.transformOrigin = origin;
	      containerStyle.mozTransformOrigin = origin;
	      containerStyle.webkitTransformOrigin = origin;
	      containerStyle["-webkit-transform"] = origin;
	      containerStyle.contentVisibility = this.renderConfig.contentVisibility;
	      this.animationItem.wrapper.appendChild(this.animationItem.container);
	      this.canvasContext = this.animationItem.container.getContext("2d");
	      if (this.renderConfig.className) {
	        this.animationItem.container.setAttribute("class", this.renderConfig.className);
	      }
	      if (this.renderConfig.id) {
	        this.animationItem.container.setAttribute("id", this.renderConfig.id);
	      }
	    } else {
	      this.canvasContext = this.renderConfig.context;
	    }
	    this.contextData.setContext(this.canvasContext);
	    this.data = animData;
	    this.layers = animData.layers;
	    this.transformCanvas = {
	      w: animData.w,
	      h: animData.h,
	      sx: 0,
	      sy: 0,
	      tx: 0,
	      ty: 0
	    };
	    this.setupGlobalData(animData, document.body);
	    this.globalData.canvasContext = this.canvasContext;
	    this.globalData.renderer = this;
	    this.globalData.isDashed = false;
	    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
	    this.globalData.transformCanvas = this.transformCanvas;
	    this.elements = createSizedArray(animData.layers.length);
	    this.updateContainerSize();
	  };
	  CanvasRendererBase.prototype.updateContainerSize = function(width2, height2) {
	    this.reset();
	    var elementWidth;
	    var elementHeight;
	    if (width2) {
	      elementWidth = width2;
	      elementHeight = height2;
	      this.canvasContext.canvas.width = elementWidth;
	      this.canvasContext.canvas.height = elementHeight;
	    } else {
	      if (this.animationItem.wrapper && this.animationItem.container) {
	        elementWidth = this.animationItem.wrapper.offsetWidth;
	        elementHeight = this.animationItem.wrapper.offsetHeight;
	      } else {
	        elementWidth = this.canvasContext.canvas.width;
	        elementHeight = this.canvasContext.canvas.height;
	      }
	      this.canvasContext.canvas.width = elementWidth * this.renderConfig.dpr;
	      this.canvasContext.canvas.height = elementHeight * this.renderConfig.dpr;
	    }
	    var elementRel;
	    var animationRel;
	    if (this.renderConfig.preserveAspectRatio.indexOf("meet") !== -1 || this.renderConfig.preserveAspectRatio.indexOf("slice") !== -1) {
	      var par = this.renderConfig.preserveAspectRatio.split(" ");
	      var fillType = par[1] || "meet";
	      var pos = par[0] || "xMidYMid";
	      var xPos = pos.substr(0, 4);
	      var yPos = pos.substr(4);
	      elementRel = elementWidth / elementHeight;
	      animationRel = this.transformCanvas.w / this.transformCanvas.h;
	      if (animationRel > elementRel && fillType === "meet" || animationRel < elementRel && fillType === "slice") {
	        this.transformCanvas.sx = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
	        this.transformCanvas.sy = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
	      } else {
	        this.transformCanvas.sx = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
	        this.transformCanvas.sy = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
	      }
	      if (xPos === "xMid" && (animationRel < elementRel && fillType === "meet" || animationRel > elementRel && fillType === "slice")) {
	        this.transformCanvas.tx = (elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) / 2 * this.renderConfig.dpr;
	      } else if (xPos === "xMax" && (animationRel < elementRel && fillType === "meet" || animationRel > elementRel && fillType === "slice")) {
	        this.transformCanvas.tx = (elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) * this.renderConfig.dpr;
	      } else {
	        this.transformCanvas.tx = 0;
	      }
	      if (yPos === "YMid" && (animationRel > elementRel && fillType === "meet" || animationRel < elementRel && fillType === "slice")) {
	        this.transformCanvas.ty = (elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w)) / 2 * this.renderConfig.dpr;
	      } else if (yPos === "YMax" && (animationRel > elementRel && fillType === "meet" || animationRel < elementRel && fillType === "slice")) {
	        this.transformCanvas.ty = (elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w)) * this.renderConfig.dpr;
	      } else {
	        this.transformCanvas.ty = 0;
	      }
	    } else if (this.renderConfig.preserveAspectRatio === "none") {
	      this.transformCanvas.sx = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
	      this.transformCanvas.sy = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
	      this.transformCanvas.tx = 0;
	      this.transformCanvas.ty = 0;
	    } else {
	      this.transformCanvas.sx = this.renderConfig.dpr;
	      this.transformCanvas.sy = this.renderConfig.dpr;
	      this.transformCanvas.tx = 0;
	      this.transformCanvas.ty = 0;
	    }
	    this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1];
	    this.ctxTransform(this.transformCanvas.props);
	    this.canvasContext.beginPath();
	    this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h);
	    this.canvasContext.closePath();
	    this.canvasContext.clip();
	    this.renderFrame(this.renderedFrame, true);
	  };
	  CanvasRendererBase.prototype.destroy = function() {
	    if (this.renderConfig.clearCanvas && this.animationItem.wrapper) {
	      this.animationItem.wrapper.innerText = "";
	    }
	    var i;
	    var len = this.layers ? this.layers.length : 0;
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (this.elements[i] && this.elements[i].destroy) {
	        this.elements[i].destroy();
	      }
	    }
	    this.elements.length = 0;
	    this.globalData.canvasContext = null;
	    this.animationItem.container = null;
	    this.destroyed = true;
	  };
	  CanvasRendererBase.prototype.renderFrame = function(num, forceRender) {
	    if (this.renderedFrame === num && this.renderConfig.clearCanvas === true && !forceRender || this.destroyed || num === -1) {
	      return;
	    }
	    this.renderedFrame = num;
	    this.globalData.frameNum = num - this.animationItem._isFirstFrame;
	    this.globalData.frameId += 1;
	    this.globalData._mdf = !this.renderConfig.clearCanvas || forceRender;
	    this.globalData.projectInterface.currentFrame = num;
	    var i;
	    var len = this.layers.length;
	    if (!this.completeLayers) {
	      this.checkLayers(num);
	    }
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (this.completeLayers || this.elements[i]) {
	        this.elements[i].prepareFrame(num - this.layers[i].st);
	      }
	    }
	    if (this.globalData._mdf) {
	      if (this.renderConfig.clearCanvas === true) {
	        this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h);
	      } else {
	        this.save();
	      }
	      for (i = len - 1; i >= 0; i -= 1) {
	        if (this.completeLayers || this.elements[i]) {
	          this.elements[i].renderFrame();
	        }
	      }
	      if (this.renderConfig.clearCanvas !== true) {
	        this.restore();
	      }
	    }
	  };
	  CanvasRendererBase.prototype.buildItem = function(pos) {
	    var elements = this.elements;
	    if (elements[pos] || this.layers[pos].ty === 99) {
	      return;
	    }
	    var element = this.createItem(this.layers[pos], this, this.globalData);
	    elements[pos] = element;
	    element.initExpressions();
	  };
	  CanvasRendererBase.prototype.checkPendingElements = function() {
	    while (this.pendingElements.length) {
	      var element = this.pendingElements.pop();
	      element.checkParenting();
	    }
	  };
	  CanvasRendererBase.prototype.hide = function() {
	    this.animationItem.container.style.display = "none";
	  };
	  CanvasRendererBase.prototype.show = function() {
	    this.animationItem.container.style.display = "block";
	  };
	  function CanvasContext() {
	    this.opacity = -1;
	    this.transform = createTypedArray("float32", 16);
	    this.fillStyle = "";
	    this.strokeStyle = "";
	    this.lineWidth = "";
	    this.lineCap = "";
	    this.lineJoin = "";
	    this.miterLimit = "";
	    this.id = Math.random();
	  }
	  function CVContextData() {
	    this.stack = [];
	    this.cArrPos = 0;
	    this.cTr = new Matrix();
	    var i;
	    var len = 15;
	    for (i = 0; i < len; i += 1) {
	      var canvasContext = new CanvasContext();
	      this.stack[i] = canvasContext;
	    }
	    this._length = len;
	    this.nativeContext = null;
	    this.transformMat = new Matrix();
	    this.currentOpacity = 1;
	    this.currentFillStyle = "";
	    this.appliedFillStyle = "";
	    this.currentStrokeStyle = "";
	    this.appliedStrokeStyle = "";
	    this.currentLineWidth = "";
	    this.appliedLineWidth = "";
	    this.currentLineCap = "";
	    this.appliedLineCap = "";
	    this.currentLineJoin = "";
	    this.appliedLineJoin = "";
	    this.appliedMiterLimit = "";
	    this.currentMiterLimit = "";
	  }
	  CVContextData.prototype.duplicate = function() {
	    var newLength = this._length * 2;
	    var i = 0;
	    for (i = this._length; i < newLength; i += 1) {
	      this.stack[i] = new CanvasContext();
	    }
	    this._length = newLength;
	  };
	  CVContextData.prototype.reset = function() {
	    this.cArrPos = 0;
	    this.cTr.reset();
	    this.stack[this.cArrPos].opacity = 1;
	  };
	  CVContextData.prototype.restore = function(forceRestore) {
	    this.cArrPos -= 1;
	    var currentContext = this.stack[this.cArrPos];
	    var transform2 = currentContext.transform;
	    var i;
	    var arr = this.cTr.props;
	    for (i = 0; i < 16; i += 1) {
	      arr[i] = transform2[i];
	    }
	    if (forceRestore) {
	      this.nativeContext.restore();
	      var prevStack = this.stack[this.cArrPos + 1];
	      this.appliedFillStyle = prevStack.fillStyle;
	      this.appliedStrokeStyle = prevStack.strokeStyle;
	      this.appliedLineWidth = prevStack.lineWidth;
	      this.appliedLineCap = prevStack.lineCap;
	      this.appliedLineJoin = prevStack.lineJoin;
	      this.appliedMiterLimit = prevStack.miterLimit;
	    }
	    this.nativeContext.setTransform(transform2[0], transform2[1], transform2[4], transform2[5], transform2[12], transform2[13]);
	    if (forceRestore || currentContext.opacity !== -1 && this.currentOpacity !== currentContext.opacity) {
	      this.nativeContext.globalAlpha = currentContext.opacity;
	      this.currentOpacity = currentContext.opacity;
	    }
	    this.currentFillStyle = currentContext.fillStyle;
	    this.currentStrokeStyle = currentContext.strokeStyle;
	    this.currentLineWidth = currentContext.lineWidth;
	    this.currentLineCap = currentContext.lineCap;
	    this.currentLineJoin = currentContext.lineJoin;
	    this.currentMiterLimit = currentContext.miterLimit;
	  };
	  CVContextData.prototype.save = function(saveOnNativeFlag) {
	    if (saveOnNativeFlag) {
	      this.nativeContext.save();
	    }
	    var props = this.cTr.props;
	    if (this._length <= this.cArrPos) {
	      this.duplicate();
	    }
	    var currentStack = this.stack[this.cArrPos];
	    var i;
	    for (i = 0; i < 16; i += 1) {
	      currentStack.transform[i] = props[i];
	    }
	    this.cArrPos += 1;
	    var newStack = this.stack[this.cArrPos];
	    newStack.opacity = currentStack.opacity;
	    newStack.fillStyle = currentStack.fillStyle;
	    newStack.strokeStyle = currentStack.strokeStyle;
	    newStack.lineWidth = currentStack.lineWidth;
	    newStack.lineCap = currentStack.lineCap;
	    newStack.lineJoin = currentStack.lineJoin;
	    newStack.miterLimit = currentStack.miterLimit;
	  };
	  CVContextData.prototype.setOpacity = function(value2) {
	    this.stack[this.cArrPos].opacity = value2;
	  };
	  CVContextData.prototype.setContext = function(value2) {
	    this.nativeContext = value2;
	  };
	  CVContextData.prototype.fillStyle = function(value2) {
	    if (this.stack[this.cArrPos].fillStyle !== value2) {
	      this.currentFillStyle = value2;
	      this.stack[this.cArrPos].fillStyle = value2;
	    }
	  };
	  CVContextData.prototype.strokeStyle = function(value2) {
	    if (this.stack[this.cArrPos].strokeStyle !== value2) {
	      this.currentStrokeStyle = value2;
	      this.stack[this.cArrPos].strokeStyle = value2;
	    }
	  };
	  CVContextData.prototype.lineWidth = function(value2) {
	    if (this.stack[this.cArrPos].lineWidth !== value2) {
	      this.currentLineWidth = value2;
	      this.stack[this.cArrPos].lineWidth = value2;
	    }
	  };
	  CVContextData.prototype.lineCap = function(value2) {
	    if (this.stack[this.cArrPos].lineCap !== value2) {
	      this.currentLineCap = value2;
	      this.stack[this.cArrPos].lineCap = value2;
	    }
	  };
	  CVContextData.prototype.lineJoin = function(value2) {
	    if (this.stack[this.cArrPos].lineJoin !== value2) {
	      this.currentLineJoin = value2;
	      this.stack[this.cArrPos].lineJoin = value2;
	    }
	  };
	  CVContextData.prototype.miterLimit = function(value2) {
	    if (this.stack[this.cArrPos].miterLimit !== value2) {
	      this.currentMiterLimit = value2;
	      this.stack[this.cArrPos].miterLimit = value2;
	    }
	  };
	  CVContextData.prototype.transform = function(props) {
	    this.transformMat.cloneFromProps(props);
	    var currentTransform = this.cTr;
	    this.transformMat.multiply(currentTransform);
	    currentTransform.cloneFromProps(this.transformMat.props);
	    var trProps = currentTransform.props;
	    this.nativeContext.setTransform(trProps[0], trProps[1], trProps[4], trProps[5], trProps[12], trProps[13]);
	  };
	  CVContextData.prototype.opacity = function(op) {
	    var currentOpacity = this.stack[this.cArrPos].opacity;
	    currentOpacity *= op < 0 ? 0 : op;
	    if (this.stack[this.cArrPos].opacity !== currentOpacity) {
	      if (this.currentOpacity !== op) {
	        this.nativeContext.globalAlpha = op;
	        this.currentOpacity = op;
	      }
	      this.stack[this.cArrPos].opacity = currentOpacity;
	    }
	  };
	  CVContextData.prototype.fill = function(rule) {
	    if (this.appliedFillStyle !== this.currentFillStyle) {
	      this.appliedFillStyle = this.currentFillStyle;
	      this.nativeContext.fillStyle = this.appliedFillStyle;
	    }
	    this.nativeContext.fill(rule);
	  };
	  CVContextData.prototype.fillRect = function(x, y, w, h) {
	    if (this.appliedFillStyle !== this.currentFillStyle) {
	      this.appliedFillStyle = this.currentFillStyle;
	      this.nativeContext.fillStyle = this.appliedFillStyle;
	    }
	    this.nativeContext.fillRect(x, y, w, h);
	  };
	  CVContextData.prototype.stroke = function() {
	    if (this.appliedStrokeStyle !== this.currentStrokeStyle) {
	      this.appliedStrokeStyle = this.currentStrokeStyle;
	      this.nativeContext.strokeStyle = this.appliedStrokeStyle;
	    }
	    if (this.appliedLineWidth !== this.currentLineWidth) {
	      this.appliedLineWidth = this.currentLineWidth;
	      this.nativeContext.lineWidth = this.appliedLineWidth;
	    }
	    if (this.appliedLineCap !== this.currentLineCap) {
	      this.appliedLineCap = this.currentLineCap;
	      this.nativeContext.lineCap = this.appliedLineCap;
	    }
	    if (this.appliedLineJoin !== this.currentLineJoin) {
	      this.appliedLineJoin = this.currentLineJoin;
	      this.nativeContext.lineJoin = this.appliedLineJoin;
	    }
	    if (this.appliedMiterLimit !== this.currentMiterLimit) {
	      this.appliedMiterLimit = this.currentMiterLimit;
	      this.nativeContext.miterLimit = this.appliedMiterLimit;
	    }
	    this.nativeContext.stroke();
	  };
	  function CVCompElement(data2, globalData2, comp2) {
	    this.completeLayers = false;
	    this.layers = data2.layers;
	    this.pendingElements = [];
	    this.elements = createSizedArray(this.layers.length);
	    this.initElement(data2, globalData2, comp2);
	    this.tm = data2.tm ? PropertyFactory.getProp(this, data2.tm, 0, globalData2.frameRate, this) : {
	      _placeholder: true
	    };
	  }
	  extendPrototype([CanvasRendererBase, ICompElement, CVBaseElement], CVCompElement);
	  CVCompElement.prototype.renderInnerContent = function() {
	    var ctx = this.canvasContext;
	    ctx.beginPath();
	    ctx.moveTo(0, 0);
	    ctx.lineTo(this.data.w, 0);
	    ctx.lineTo(this.data.w, this.data.h);
	    ctx.lineTo(0, this.data.h);
	    ctx.lineTo(0, 0);
	    ctx.clip();
	    var i;
	    var len = this.layers.length;
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (this.completeLayers || this.elements[i]) {
	        this.elements[i].renderFrame();
	      }
	    }
	  };
	  CVCompElement.prototype.destroy = function() {
	    var i;
	    var len = this.layers.length;
	    for (i = len - 1; i >= 0; i -= 1) {
	      if (this.elements[i]) {
	        this.elements[i].destroy();
	      }
	    }
	    this.layers = null;
	    this.elements = null;
	  };
	  CVCompElement.prototype.createComp = function(data2) {
	    return new CVCompElement(data2, this.globalData, this);
	  };
	  function CanvasRenderer(animationItem, config) {
	    this.animationItem = animationItem;
	    this.renderConfig = {
	      clearCanvas: config && config.clearCanvas !== void 0 ? config.clearCanvas : true,
	      context: config && config.context || null,
	      progressiveLoad: config && config.progressiveLoad || false,
	      preserveAspectRatio: config && config.preserveAspectRatio || "xMidYMid meet",
	      imagePreserveAspectRatio: config && config.imagePreserveAspectRatio || "xMidYMid slice",
	      contentVisibility: config && config.contentVisibility || "visible",
	      className: config && config.className || "",
	      id: config && config.id || "",
	      runExpressions: !config || config.runExpressions === void 0 || config.runExpressions
	    };
	    this.renderConfig.dpr = config && config.dpr || 1;
	    if (this.animationItem.wrapper) {
	      this.renderConfig.dpr = config && config.dpr || window.devicePixelRatio || 1;
	    }
	    this.renderedFrame = -1;
	    this.globalData = {
	      frameNum: -1,
	      _mdf: false,
	      renderConfig: this.renderConfig,
	      currentGlobalAlpha: -1
	    };
	    this.contextData = new CVContextData();
	    this.elements = [];
	    this.pendingElements = [];
	    this.transformMat = new Matrix();
	    this.completeLayers = false;
	    this.rendererType = "canvas";
	    if (this.renderConfig.clearCanvas) {
	      this.ctxTransform = this.contextData.transform.bind(this.contextData);
	      this.ctxOpacity = this.contextData.opacity.bind(this.contextData);
	      this.ctxFillStyle = this.contextData.fillStyle.bind(this.contextData);
	      this.ctxStrokeStyle = this.contextData.strokeStyle.bind(this.contextData);
	      this.ctxLineWidth = this.contextData.lineWidth.bind(this.contextData);
	      this.ctxLineCap = this.contextData.lineCap.bind(this.contextData);
	      this.ctxLineJoin = this.contextData.lineJoin.bind(this.contextData);
	      this.ctxMiterLimit = this.contextData.miterLimit.bind(this.contextData);
	      this.ctxFill = this.contextData.fill.bind(this.contextData);
	      this.ctxFillRect = this.contextData.fillRect.bind(this.contextData);
	      this.ctxStroke = this.contextData.stroke.bind(this.contextData);
	      this.save = this.contextData.save.bind(this.contextData);
	    }
	  }
	  extendPrototype([CanvasRendererBase], CanvasRenderer);
	  CanvasRenderer.prototype.createComp = function(data2) {
	    return new CVCompElement(data2, this.globalData, this);
	  };
	  function HBaseElement() {
	  }
	  HBaseElement.prototype = {
	    checkBlendMode: function checkBlendMode() {
	    },
	    initRendererElement: function initRendererElement() {
	      this.baseElement = createTag(this.data.tg || "div");
	      if (this.data.hasMask) {
	        this.svgElement = createNS("svg");
	        this.layerElement = createNS("g");
	        this.maskedElement = this.layerElement;
	        this.svgElement.appendChild(this.layerElement);
	        this.baseElement.appendChild(this.svgElement);
	      } else {
	        this.layerElement = this.baseElement;
	      }
	      styleDiv(this.baseElement);
	    },
	    createContainerElements: function createContainerElements() {
	      this.renderableEffectsManager = new CVEffects(this);
	      this.transformedElement = this.baseElement;
	      this.maskedElement = this.layerElement;
	      if (this.data.ln) {
	        this.layerElement.setAttribute("id", this.data.ln);
	      }
	      if (this.data.cl) {
	        this.layerElement.setAttribute("class", this.data.cl);
	      }
	      if (this.data.bm !== 0) {
	        this.setBlendMode();
	      }
	    },
	    renderElement: function renderElement() {
	      var transformedElementStyle = this.transformedElement ? this.transformedElement.style : {};
	      if (this.finalTransform._matMdf) {
	        var matrixValue = this.finalTransform.mat.toCSS();
	        transformedElementStyle.transform = matrixValue;
	        transformedElementStyle.webkitTransform = matrixValue;
	      }
	      if (this.finalTransform._opMdf) {
	        transformedElementStyle.opacity = this.finalTransform.mProp.o.v;
	      }
	    },
	    renderFrame: function renderFrame() {
	      if (this.data.hd || this.hidden) {
	        return;
	      }
	      this.renderTransform();
	      this.renderRenderable();
	      this.renderElement();
	      this.renderInnerContent();
	      if (this._isFirstFrame) {
	        this._isFirstFrame = false;
	      }
	    },
	    destroy: function destroy() {
	      this.layerElement = null;
	      this.transformedElement = null;
	      if (this.matteElement) {
	        this.matteElement = null;
	      }
	      if (this.maskManager) {
	        this.maskManager.destroy();
	        this.maskManager = null;
	      }
	    },
	    createRenderableComponents: function createRenderableComponents() {
	      this.maskManager = new MaskElement(this.data, this, this.globalData);
	    },
	    addEffects: function addEffects() {
	    },
	    setMatte: function setMatte() {
	    }
	  };
	  HBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement;
	  HBaseElement.prototype.destroyBaseElement = HBaseElement.prototype.destroy;
	  HBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;
	  function HSolidElement(data2, globalData2, comp2) {
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], HSolidElement);
	  HSolidElement.prototype.createContent = function() {
	    var rect;
	    if (this.data.hasMask) {
	      rect = createNS("rect");
	      rect.setAttribute("width", this.data.sw);
	      rect.setAttribute("height", this.data.sh);
	      rect.setAttribute("fill", this.data.sc);
	      this.svgElement.setAttribute("width", this.data.sw);
	      this.svgElement.setAttribute("height", this.data.sh);
	    } else {
	      rect = createTag("div");
	      rect.style.width = this.data.sw + "px";
	      rect.style.height = this.data.sh + "px";
	      rect.style.backgroundColor = this.data.sc;
	    }
	    this.layerElement.appendChild(rect);
	  };
	  function HShapeElement(data2, globalData2, comp2) {
	    this.shapes = [];
	    this.shapesData = data2.shapes;
	    this.stylesList = [];
	    this.shapeModifiers = [];
	    this.itemsData = [];
	    this.processedElements = [];
	    this.animatedContents = [];
	    this.shapesContainer = createNS("g");
	    this.initElement(data2, globalData2, comp2);
	    this.prevViewData = [];
	    this.currentBBox = {
	      x: 999999,
	      y: -999999,
	      h: 0,
	      w: 0
	    };
	  }
	  extendPrototype([BaseElement, TransformElement, HSolidElement, SVGShapeElement, HBaseElement, HierarchyElement, FrameElement, RenderableElement], HShapeElement);
	  HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderInnerContent;
	  HShapeElement.prototype.createContent = function() {
	    var cont;
	    this.baseElement.style.fontSize = 0;
	    if (this.data.hasMask) {
	      this.layerElement.appendChild(this.shapesContainer);
	      cont = this.svgElement;
	    } else {
	      cont = createNS("svg");
	      var size = this.comp.data ? this.comp.data : this.globalData.compSize;
	      cont.setAttribute("width", size.w);
	      cont.setAttribute("height", size.h);
	      cont.appendChild(this.shapesContainer);
	      this.layerElement.appendChild(cont);
	    }
	    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.shapesContainer, 0, [], true);
	    this.filterUniqueShapes();
	    this.shapeCont = cont;
	  };
	  HShapeElement.prototype.getTransformedPoint = function(transformers, point) {
	    var i;
	    var len = transformers.length;
	    for (i = 0; i < len; i += 1) {
	      point = transformers[i].mProps.v.applyToPointArray(point[0], point[1], 0);
	    }
	    return point;
	  };
	  HShapeElement.prototype.calculateShapeBoundingBox = function(item, boundingBox) {
	    var shape = item.sh.v;
	    var transformers = item.transformers;
	    var i;
	    var len = shape._length;
	    var vPoint;
	    var oPoint;
	    var nextIPoint;
	    var nextVPoint;
	    if (len <= 1) {
	      return;
	    }
	    for (i = 0; i < len - 1; i += 1) {
	      vPoint = this.getTransformedPoint(transformers, shape.v[i]);
	      oPoint = this.getTransformedPoint(transformers, shape.o[i]);
	      nextIPoint = this.getTransformedPoint(transformers, shape.i[i + 1]);
	      nextVPoint = this.getTransformedPoint(transformers, shape.v[i + 1]);
	      this.checkBounds(vPoint, oPoint, nextIPoint, nextVPoint, boundingBox);
	    }
	    if (shape.c) {
	      vPoint = this.getTransformedPoint(transformers, shape.v[i]);
	      oPoint = this.getTransformedPoint(transformers, shape.o[i]);
	      nextIPoint = this.getTransformedPoint(transformers, shape.i[0]);
	      nextVPoint = this.getTransformedPoint(transformers, shape.v[0]);
	      this.checkBounds(vPoint, oPoint, nextIPoint, nextVPoint, boundingBox);
	    }
	  };
	  HShapeElement.prototype.checkBounds = function(vPoint, oPoint, nextIPoint, nextVPoint, boundingBox) {
	    this.getBoundsOfCurve(vPoint, oPoint, nextIPoint, nextVPoint);
	    var bounds = this.shapeBoundingBox;
	    boundingBox.x = bmMin(bounds.left, boundingBox.x);
	    boundingBox.xMax = bmMax(bounds.right, boundingBox.xMax);
	    boundingBox.y = bmMin(bounds.top, boundingBox.y);
	    boundingBox.yMax = bmMax(bounds.bottom, boundingBox.yMax);
	  };
	  HShapeElement.prototype.shapeBoundingBox = {
	    left: 0,
	    right: 0,
	    top: 0,
	    bottom: 0
	  };
	  HShapeElement.prototype.tempBoundingBox = {
	    x: 0,
	    xMax: 0,
	    y: 0,
	    yMax: 0,
	    width: 0,
	    height: 0
	  };
	  HShapeElement.prototype.getBoundsOfCurve = function(p0, p1, p2, p3) {
	    var bounds = [[p0[0], p3[0]], [p0[1], p3[1]]];
	    for (var a, b, c, t, b2ac, t1, t2, i = 0; i < 2; ++i) {
	      b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
	      a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
	      c = 3 * p1[i] - 3 * p0[i];
	      b |= 0;
	      a |= 0;
	      c |= 0;
	      if (a === 0 && b === 0) ; else if (a === 0) {
	        t = -c / b;
	        if (t > 0 && t < 1) {
	          bounds[i].push(this.calculateF(t, p0, p1, p2, p3, i));
	        }
	      } else {
	        b2ac = b * b - 4 * c * a;
	        if (b2ac >= 0) {
	          t1 = (-b + bmSqrt(b2ac)) / (2 * a);
	          if (t1 > 0 && t1 < 1) bounds[i].push(this.calculateF(t1, p0, p1, p2, p3, i));
	          t2 = (-b - bmSqrt(b2ac)) / (2 * a);
	          if (t2 > 0 && t2 < 1) bounds[i].push(this.calculateF(t2, p0, p1, p2, p3, i));
	        }
	      }
	    }
	    this.shapeBoundingBox.left = bmMin.apply(null, bounds[0]);
	    this.shapeBoundingBox.top = bmMin.apply(null, bounds[1]);
	    this.shapeBoundingBox.right = bmMax.apply(null, bounds[0]);
	    this.shapeBoundingBox.bottom = bmMax.apply(null, bounds[1]);
	  };
	  HShapeElement.prototype.calculateF = function(t, p0, p1, p2, p3, i) {
	    return bmPow(1 - t, 3) * p0[i] + 3 * bmPow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * bmPow(t, 2) * p2[i] + bmPow(t, 3) * p3[i];
	  };
	  HShapeElement.prototype.calculateBoundingBox = function(itemsData, boundingBox) {
	    var i;
	    var len = itemsData.length;
	    for (i = 0; i < len; i += 1) {
	      if (itemsData[i] && itemsData[i].sh) {
	        this.calculateShapeBoundingBox(itemsData[i], boundingBox);
	      } else if (itemsData[i] && itemsData[i].it) {
	        this.calculateBoundingBox(itemsData[i].it, boundingBox);
	      } else if (itemsData[i] && itemsData[i].style && itemsData[i].w) {
	        this.expandStrokeBoundingBox(itemsData[i].w, boundingBox);
	      }
	    }
	  };
	  HShapeElement.prototype.expandStrokeBoundingBox = function(widthProperty, boundingBox) {
	    var width2 = 0;
	    if (widthProperty.keyframes) {
	      for (var i = 0; i < widthProperty.keyframes.length; i += 1) {
	        var kfw = widthProperty.keyframes[i].s;
	        if (kfw > width2) {
	          width2 = kfw;
	        }
	      }
	      width2 *= widthProperty.mult;
	    } else {
	      width2 = widthProperty.v * widthProperty.mult;
	    }
	    boundingBox.x -= width2;
	    boundingBox.xMax += width2;
	    boundingBox.y -= width2;
	    boundingBox.yMax += width2;
	  };
	  HShapeElement.prototype.currentBoxContains = function(box) {
	    return this.currentBBox.x <= box.x && this.currentBBox.y <= box.y && this.currentBBox.width + this.currentBBox.x >= box.x + box.width && this.currentBBox.height + this.currentBBox.y >= box.y + box.height;
	  };
	  HShapeElement.prototype.renderInnerContent = function() {
	    this._renderShapeFrame();
	    if (!this.hidden && (this._isFirstFrame || this._mdf)) {
	      var tempBoundingBox = this.tempBoundingBox;
	      var max = 999999;
	      tempBoundingBox.x = max;
	      tempBoundingBox.xMax = -max;
	      tempBoundingBox.y = max;
	      tempBoundingBox.yMax = -max;
	      this.calculateBoundingBox(this.itemsData, tempBoundingBox);
	      tempBoundingBox.width = tempBoundingBox.xMax < tempBoundingBox.x ? 0 : tempBoundingBox.xMax - tempBoundingBox.x;
	      tempBoundingBox.height = tempBoundingBox.yMax < tempBoundingBox.y ? 0 : tempBoundingBox.yMax - tempBoundingBox.y;
	      if (this.currentBoxContains(tempBoundingBox)) {
	        return;
	      }
	      var changed = false;
	      if (this.currentBBox.w !== tempBoundingBox.width) {
	        this.currentBBox.w = tempBoundingBox.width;
	        this.shapeCont.setAttribute("width", tempBoundingBox.width);
	        changed = true;
	      }
	      if (this.currentBBox.h !== tempBoundingBox.height) {
	        this.currentBBox.h = tempBoundingBox.height;
	        this.shapeCont.setAttribute("height", tempBoundingBox.height);
	        changed = true;
	      }
	      if (changed || this.currentBBox.x !== tempBoundingBox.x || this.currentBBox.y !== tempBoundingBox.y) {
	        this.currentBBox.w = tempBoundingBox.width;
	        this.currentBBox.h = tempBoundingBox.height;
	        this.currentBBox.x = tempBoundingBox.x;
	        this.currentBBox.y = tempBoundingBox.y;
	        this.shapeCont.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h);
	        var shapeStyle = this.shapeCont.style;
	        var shapeTransform = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
	        shapeStyle.transform = shapeTransform;
	        shapeStyle.webkitTransform = shapeTransform;
	      }
	    }
	  };
	  function HTextElement(data2, globalData2, comp2) {
	    this.textSpans = [];
	    this.textPaths = [];
	    this.currentBBox = {
	      x: 999999,
	      y: -999999,
	      h: 0,
	      w: 0
	    };
	    this.renderType = "svg";
	    this.isMasked = false;
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], HTextElement);
	  HTextElement.prototype.createContent = function() {
	    this.isMasked = this.checkMasks();
	    if (this.isMasked) {
	      this.renderType = "svg";
	      this.compW = this.comp.data.w;
	      this.compH = this.comp.data.h;
	      this.svgElement.setAttribute("width", this.compW);
	      this.svgElement.setAttribute("height", this.compH);
	      var g = createNS("g");
	      this.maskedElement.appendChild(g);
	      this.innerElem = g;
	    } else {
	      this.renderType = "html";
	      this.innerElem = this.layerElement;
	    }
	    this.checkParenting();
	  };
	  HTextElement.prototype.buildNewText = function() {
	    var documentData = this.textProperty.currentData;
	    this.renderedLetters = createSizedArray(documentData.l ? documentData.l.length : 0);
	    var innerElemStyle = this.innerElem.style;
	    var textColor = documentData.fc ? this.buildColor(documentData.fc) : "rgba(0,0,0,0)";
	    innerElemStyle.fill = textColor;
	    innerElemStyle.color = textColor;
	    if (documentData.sc) {
	      innerElemStyle.stroke = this.buildColor(documentData.sc);
	      innerElemStyle.strokeWidth = documentData.sw + "px";
	    }
	    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
	    if (!this.globalData.fontManager.chars) {
	      innerElemStyle.fontSize = documentData.finalSize + "px";
	      innerElemStyle.lineHeight = documentData.finalSize + "px";
	      if (fontData.fClass) {
	        this.innerElem.className = fontData.fClass;
	      } else {
	        innerElemStyle.fontFamily = fontData.fFamily;
	        var fWeight = documentData.fWeight;
	        var fStyle = documentData.fStyle;
	        innerElemStyle.fontStyle = fStyle;
	        innerElemStyle.fontWeight = fWeight;
	      }
	    }
	    var i;
	    var len;
	    var letters = documentData.l;
	    len = letters.length;
	    var tSpan;
	    var tParent;
	    var tCont;
	    var matrixHelper = this.mHelper;
	    var shapes;
	    var shapeStr = "";
	    var cnt = 0;
	    for (i = 0; i < len; i += 1) {
	      if (this.globalData.fontManager.chars) {
	        if (!this.textPaths[cnt]) {
	          tSpan = createNS("path");
	          tSpan.setAttribute("stroke-linecap", lineCapEnum[1]);
	          tSpan.setAttribute("stroke-linejoin", lineJoinEnum[2]);
	          tSpan.setAttribute("stroke-miterlimit", "4");
	        } else {
	          tSpan = this.textPaths[cnt];
	        }
	        if (!this.isMasked) {
	          if (this.textSpans[cnt]) {
	            tParent = this.textSpans[cnt];
	            tCont = tParent.children[0];
	          } else {
	            tParent = createTag("div");
	            tParent.style.lineHeight = 0;
	            tCont = createNS("svg");
	            tCont.appendChild(tSpan);
	            styleDiv(tParent);
	          }
	        }
	      } else if (!this.isMasked) {
	        if (this.textSpans[cnt]) {
	          tParent = this.textSpans[cnt];
	          tSpan = this.textPaths[cnt];
	        } else {
	          tParent = createTag("span");
	          styleDiv(tParent);
	          tSpan = createTag("span");
	          styleDiv(tSpan);
	          tParent.appendChild(tSpan);
	        }
	      } else {
	        tSpan = this.textPaths[cnt] ? this.textPaths[cnt] : createNS("text");
	      }
	      if (this.globalData.fontManager.chars) {
	        var charData = this.globalData.fontManager.getCharData(documentData.finalText[i], fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
	        var shapeData;
	        if (charData) {
	          shapeData = charData.data;
	        } else {
	          shapeData = null;
	        }
	        matrixHelper.reset();
	        if (shapeData && shapeData.shapes && shapeData.shapes.length) {
	          shapes = shapeData.shapes[0].it;
	          matrixHelper.scale(documentData.finalSize / 100, documentData.finalSize / 100);
	          shapeStr = this.createPathShape(matrixHelper, shapes);
	          tSpan.setAttribute("d", shapeStr);
	        }
	        if (!this.isMasked) {
	          this.innerElem.appendChild(tParent);
	          if (shapeData && shapeData.shapes) {
	            document.body.appendChild(tCont);
	            var boundingBox = tCont.getBBox();
	            tCont.setAttribute("width", boundingBox.width + 2);
	            tCont.setAttribute("height", boundingBox.height + 2);
	            tCont.setAttribute("viewBox", boundingBox.x - 1 + " " + (boundingBox.y - 1) + " " + (boundingBox.width + 2) + " " + (boundingBox.height + 2));
	            var tContStyle = tCont.style;
	            var tContTranslation = "translate(" + (boundingBox.x - 1) + "px," + (boundingBox.y - 1) + "px)";
	            tContStyle.transform = tContTranslation;
	            tContStyle.webkitTransform = tContTranslation;
	            letters[i].yOffset = boundingBox.y - 1;
	          } else {
	            tCont.setAttribute("width", 1);
	            tCont.setAttribute("height", 1);
	          }
	          tParent.appendChild(tCont);
	        } else {
	          this.innerElem.appendChild(tSpan);
	        }
	      } else {
	        tSpan.textContent = letters[i].val;
	        tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
	        if (!this.isMasked) {
	          this.innerElem.appendChild(tParent);
	          var tStyle = tSpan.style;
	          var tSpanTranslation = "translate3d(0," + -documentData.finalSize / 1.2 + "px,0)";
	          tStyle.transform = tSpanTranslation;
	          tStyle.webkitTransform = tSpanTranslation;
	        } else {
	          this.innerElem.appendChild(tSpan);
	        }
	      }
	      if (!this.isMasked) {
	        this.textSpans[cnt] = tParent;
	      } else {
	        this.textSpans[cnt] = tSpan;
	      }
	      this.textSpans[cnt].style.display = "block";
	      this.textPaths[cnt] = tSpan;
	      cnt += 1;
	    }
	    while (cnt < this.textSpans.length) {
	      this.textSpans[cnt].style.display = "none";
	      cnt += 1;
	    }
	  };
	  HTextElement.prototype.renderInnerContent = function() {
	    this.validateText();
	    var svgStyle;
	    if (this.data.singleShape) {
	      if (!this._isFirstFrame && !this.lettersChangedFlag) {
	        return;
	      }
	      if (this.isMasked && this.finalTransform._matMdf) {
	        this.svgElement.setAttribute("viewBox", -this.finalTransform.mProp.p.v[0] + " " + -this.finalTransform.mProp.p.v[1] + " " + this.compW + " " + this.compH);
	        svgStyle = this.svgElement.style;
	        var translation = "translate(" + -this.finalTransform.mProp.p.v[0] + "px," + -this.finalTransform.mProp.p.v[1] + "px)";
	        svgStyle.transform = translation;
	        svgStyle.webkitTransform = translation;
	      }
	    }
	    this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
	    if (!this.lettersChangedFlag && !this.textAnimator.lettersChangedFlag) {
	      return;
	    }
	    var i;
	    var len;
	    var count = 0;
	    var renderedLetters = this.textAnimator.renderedLetters;
	    var letters = this.textProperty.currentData.l;
	    len = letters.length;
	    var renderedLetter;
	    var textSpan;
	    var textPath;
	    for (i = 0; i < len; i += 1) {
	      if (letters[i].n) {
	        count += 1;
	      } else {
	        textSpan = this.textSpans[i];
	        textPath = this.textPaths[i];
	        renderedLetter = renderedLetters[count];
	        count += 1;
	        if (renderedLetter._mdf.m) {
	          if (!this.isMasked) {
	            textSpan.style.webkitTransform = renderedLetter.m;
	            textSpan.style.transform = renderedLetter.m;
	          } else {
	            textSpan.setAttribute("transform", renderedLetter.m);
	          }
	        }
	        textSpan.style.opacity = renderedLetter.o;
	        if (renderedLetter.sw && renderedLetter._mdf.sw) {
	          textPath.setAttribute("stroke-width", renderedLetter.sw);
	        }
	        if (renderedLetter.sc && renderedLetter._mdf.sc) {
	          textPath.setAttribute("stroke", renderedLetter.sc);
	        }
	        if (renderedLetter.fc && renderedLetter._mdf.fc) {
	          textPath.setAttribute("fill", renderedLetter.fc);
	          textPath.style.color = renderedLetter.fc;
	        }
	      }
	    }
	    if (this.innerElem.getBBox && !this.hidden && (this._isFirstFrame || this._mdf)) {
	      var boundingBox = this.innerElem.getBBox();
	      if (this.currentBBox.w !== boundingBox.width) {
	        this.currentBBox.w = boundingBox.width;
	        this.svgElement.setAttribute("width", boundingBox.width);
	      }
	      if (this.currentBBox.h !== boundingBox.height) {
	        this.currentBBox.h = boundingBox.height;
	        this.svgElement.setAttribute("height", boundingBox.height);
	      }
	      var margin = 1;
	      if (this.currentBBox.w !== boundingBox.width + margin * 2 || this.currentBBox.h !== boundingBox.height + margin * 2 || this.currentBBox.x !== boundingBox.x - margin || this.currentBBox.y !== boundingBox.y - margin) {
	        this.currentBBox.w = boundingBox.width + margin * 2;
	        this.currentBBox.h = boundingBox.height + margin * 2;
	        this.currentBBox.x = boundingBox.x - margin;
	        this.currentBBox.y = boundingBox.y - margin;
	        this.svgElement.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h);
	        svgStyle = this.svgElement.style;
	        var svgTransform = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
	        svgStyle.transform = svgTransform;
	        svgStyle.webkitTransform = svgTransform;
	      }
	    }
	  };
	  function HCameraElement(data2, globalData2, comp2) {
	    this.initFrame();
	    this.initBaseData(data2, globalData2, comp2);
	    this.initHierarchy();
	    var getProp = PropertyFactory.getProp;
	    this.pe = getProp(this, data2.pe, 0, 0, this);
	    if (data2.ks.p.s) {
	      this.px = getProp(this, data2.ks.p.x, 1, 0, this);
	      this.py = getProp(this, data2.ks.p.y, 1, 0, this);
	      this.pz = getProp(this, data2.ks.p.z, 1, 0, this);
	    } else {
	      this.p = getProp(this, data2.ks.p, 1, 0, this);
	    }
	    if (data2.ks.a) {
	      this.a = getProp(this, data2.ks.a, 1, 0, this);
	    }
	    if (data2.ks.or.k.length && data2.ks.or.k[0].to) {
	      var i;
	      var len = data2.ks.or.k.length;
	      for (i = 0; i < len; i += 1) {
	        data2.ks.or.k[i].to = null;
	        data2.ks.or.k[i].ti = null;
	      }
	    }
	    this.or = getProp(this, data2.ks.or, 1, degToRads, this);
	    this.or.sh = true;
	    this.rx = getProp(this, data2.ks.rx, 0, degToRads, this);
	    this.ry = getProp(this, data2.ks.ry, 0, degToRads, this);
	    this.rz = getProp(this, data2.ks.rz, 0, degToRads, this);
	    this.mat = new Matrix();
	    this._prevMat = new Matrix();
	    this._isFirstFrame = true;
	    this.finalTransform = {
	      mProp: this
	    };
	  }
	  extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement);
	  HCameraElement.prototype.setup = function() {
	    var i;
	    var len = this.comp.threeDElements.length;
	    var comp2;
	    var perspectiveStyle;
	    var containerStyle;
	    for (i = 0; i < len; i += 1) {
	      comp2 = this.comp.threeDElements[i];
	      if (comp2.type === "3d") {
	        perspectiveStyle = comp2.perspectiveElem.style;
	        containerStyle = comp2.container.style;
	        var perspective = this.pe.v + "px";
	        var origin = "0px 0px 0px";
	        var matrix = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
	        perspectiveStyle.perspective = perspective;
	        perspectiveStyle.webkitPerspective = perspective;
	        containerStyle.transformOrigin = origin;
	        containerStyle.mozTransformOrigin = origin;
	        containerStyle.webkitTransformOrigin = origin;
	        perspectiveStyle.transform = matrix;
	        perspectiveStyle.webkitTransform = matrix;
	      }
	    }
	  };
	  HCameraElement.prototype.createElements = function() {
	  };
	  HCameraElement.prototype.hide = function() {
	  };
	  HCameraElement.prototype.renderFrame = function() {
	    var _mdf = this._isFirstFrame;
	    var i;
	    var len;
	    if (this.hierarchy) {
	      len = this.hierarchy.length;
	      for (i = 0; i < len; i += 1) {
	        _mdf = this.hierarchy[i].finalTransform.mProp._mdf || _mdf;
	      }
	    }
	    if (_mdf || this.pe._mdf || this.p && this.p._mdf || this.px && (this.px._mdf || this.py._mdf || this.pz._mdf) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || this.a && this.a._mdf) {
	      this.mat.reset();
	      if (this.hierarchy) {
	        len = this.hierarchy.length - 1;
	        for (i = len; i >= 0; i -= 1) {
	          var mTransf = this.hierarchy[i].finalTransform.mProp;
	          this.mat.translate(-mTransf.p.v[0], -mTransf.p.v[1], mTransf.p.v[2]);
	          this.mat.rotateX(-mTransf.or.v[0]).rotateY(-mTransf.or.v[1]).rotateZ(mTransf.or.v[2]);
	          this.mat.rotateX(-mTransf.rx.v).rotateY(-mTransf.ry.v).rotateZ(mTransf.rz.v);
	          this.mat.scale(1 / mTransf.s.v[0], 1 / mTransf.s.v[1], 1 / mTransf.s.v[2]);
	          this.mat.translate(mTransf.a.v[0], mTransf.a.v[1], mTransf.a.v[2]);
	        }
	      }
	      if (this.p) {
	        this.mat.translate(-this.p.v[0], -this.p.v[1], this.p.v[2]);
	      } else {
	        this.mat.translate(-this.px.v, -this.py.v, this.pz.v);
	      }
	      if (this.a) {
	        var diffVector;
	        if (this.p) {
	          diffVector = [this.p.v[0] - this.a.v[0], this.p.v[1] - this.a.v[1], this.p.v[2] - this.a.v[2]];
	        } else {
	          diffVector = [this.px.v - this.a.v[0], this.py.v - this.a.v[1], this.pz.v - this.a.v[2]];
	        }
	        var mag = Math.sqrt(Math.pow(diffVector[0], 2) + Math.pow(diffVector[1], 2) + Math.pow(diffVector[2], 2));
	        var lookDir = [diffVector[0] / mag, diffVector[1] / mag, diffVector[2] / mag];
	        var lookLengthOnXZ = Math.sqrt(lookDir[2] * lookDir[2] + lookDir[0] * lookDir[0]);
	        var mRotationX = Math.atan2(lookDir[1], lookLengthOnXZ);
	        var mRotationY = Math.atan2(lookDir[0], -lookDir[2]);
	        this.mat.rotateY(mRotationY).rotateX(-mRotationX);
	      }
	      this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
	      this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
	      this.mat.translate(this.globalData.compSize.w / 2, this.globalData.compSize.h / 2, 0);
	      this.mat.translate(0, 0, this.pe.v);
	      var hasMatrixChanged = !this._prevMat.equals(this.mat);
	      if ((hasMatrixChanged || this.pe._mdf) && this.comp.threeDElements) {
	        len = this.comp.threeDElements.length;
	        var comp2;
	        var perspectiveStyle;
	        var containerStyle;
	        for (i = 0; i < len; i += 1) {
	          comp2 = this.comp.threeDElements[i];
	          if (comp2.type === "3d") {
	            if (hasMatrixChanged) {
	              var matValue = this.mat.toCSS();
	              containerStyle = comp2.container.style;
	              containerStyle.transform = matValue;
	              containerStyle.webkitTransform = matValue;
	            }
	            if (this.pe._mdf) {
	              perspectiveStyle = comp2.perspectiveElem.style;
	              perspectiveStyle.perspective = this.pe.v + "px";
	              perspectiveStyle.webkitPerspective = this.pe.v + "px";
	            }
	          }
	        }
	        this.mat.clone(this._prevMat);
	      }
	    }
	    this._isFirstFrame = false;
	  };
	  HCameraElement.prototype.prepareFrame = function(num) {
	    this.prepareProperties(num, true);
	  };
	  HCameraElement.prototype.destroy = function() {
	  };
	  HCameraElement.prototype.getBaseElement = function() {
	    return null;
	  };
	  function HImageElement(data2, globalData2, comp2) {
	    this.assetData = globalData2.getAssetData(data2.refId);
	    this.initElement(data2, globalData2, comp2);
	  }
	  extendPrototype([BaseElement, TransformElement, HBaseElement, HSolidElement, HierarchyElement, FrameElement, RenderableElement], HImageElement);
	  HImageElement.prototype.createContent = function() {
	    var assetPath = this.globalData.getAssetsPath(this.assetData);
	    var img = new Image();
	    if (this.data.hasMask) {
	      this.imageElem = createNS("image");
	      this.imageElem.setAttribute("width", this.assetData.w + "px");
	      this.imageElem.setAttribute("height", this.assetData.h + "px");
	      this.imageElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", assetPath);
	      this.layerElement.appendChild(this.imageElem);
	      this.baseElement.setAttribute("width", this.assetData.w);
	      this.baseElement.setAttribute("height", this.assetData.h);
	    } else {
	      this.layerElement.appendChild(img);
	    }
	    img.crossOrigin = "anonymous";
	    img.src = assetPath;
	    if (this.data.ln) {
	      this.baseElement.setAttribute("id", this.data.ln);
	    }
	  };
	  function HybridRendererBase(animationItem, config) {
	    this.animationItem = animationItem;
	    this.layers = null;
	    this.renderedFrame = -1;
	    this.renderConfig = {
	      className: config && config.className || "",
	      imagePreserveAspectRatio: config && config.imagePreserveAspectRatio || "xMidYMid slice",
	      hideOnTransparent: !(config && config.hideOnTransparent === false),
	      filterSize: {
	        width: config && config.filterSize && config.filterSize.width || "400%",
	        height: config && config.filterSize && config.filterSize.height || "400%",
	        x: config && config.filterSize && config.filterSize.x || "-100%",
	        y: config && config.filterSize && config.filterSize.y || "-100%"
	      }
	    };
	    this.globalData = {
	      _mdf: false,
	      frameNum: -1,
	      renderConfig: this.renderConfig
	    };
	    this.pendingElements = [];
	    this.elements = [];
	    this.threeDElements = [];
	    this.destroyed = false;
	    this.camera = null;
	    this.supports3d = true;
	    this.rendererType = "html";
	  }
	  extendPrototype([BaseRenderer], HybridRendererBase);
	  HybridRendererBase.prototype.buildItem = SVGRenderer.prototype.buildItem;
	  HybridRendererBase.prototype.checkPendingElements = function() {
	    while (this.pendingElements.length) {
	      var element = this.pendingElements.pop();
	      element.checkParenting();
	    }
	  };
	  HybridRendererBase.prototype.appendElementInPos = function(element, pos) {
	    var newDOMElement = element.getBaseElement();
	    if (!newDOMElement) {
	      return;
	    }
	    var layer = this.layers[pos];
	    if (!layer.ddd || !this.supports3d) {
	      if (this.threeDElements) {
	        this.addTo3dContainer(newDOMElement, pos);
	      } else {
	        var i = 0;
	        var nextDOMElement;
	        var nextLayer;
	        var tmpDOMElement;
	        while (i < pos) {
	          if (this.elements[i] && this.elements[i] !== true && this.elements[i].getBaseElement) {
	            nextLayer = this.elements[i];
	            tmpDOMElement = this.layers[i].ddd ? this.getThreeDContainerByPos(i) : nextLayer.getBaseElement();
	            nextDOMElement = tmpDOMElement || nextDOMElement;
	          }
	          i += 1;
	        }
	        if (nextDOMElement) {
	          if (!layer.ddd || !this.supports3d) {
	            this.layerElement.insertBefore(newDOMElement, nextDOMElement);
	          }
	        } else if (!layer.ddd || !this.supports3d) {
	          this.layerElement.appendChild(newDOMElement);
	        }
	      }
	    } else {
	      this.addTo3dContainer(newDOMElement, pos);
	    }
	  };
	  HybridRendererBase.prototype.createShape = function(data2) {
	    if (!this.supports3d) {
	      return new SVGShapeElement(data2, this.globalData, this);
	    }
	    return new HShapeElement(data2, this.globalData, this);
	  };
	  HybridRendererBase.prototype.createText = function(data2) {
	    if (!this.supports3d) {
	      return new SVGTextLottieElement(data2, this.globalData, this);
	    }
	    return new HTextElement(data2, this.globalData, this);
	  };
	  HybridRendererBase.prototype.createCamera = function(data2) {
	    this.camera = new HCameraElement(data2, this.globalData, this);
	    return this.camera;
	  };
	  HybridRendererBase.prototype.createImage = function(data2) {
	    if (!this.supports3d) {
	      return new IImageElement(data2, this.globalData, this);
	    }
	    return new HImageElement(data2, this.globalData, this);
	  };
	  HybridRendererBase.prototype.createSolid = function(data2) {
	    if (!this.supports3d) {
	      return new ISolidElement(data2, this.globalData, this);
	    }
	    return new HSolidElement(data2, this.globalData, this);
	  };
	  HybridRendererBase.prototype.createNull = SVGRenderer.prototype.createNull;
	  HybridRendererBase.prototype.getThreeDContainerByPos = function(pos) {
	    var i = 0;
	    var len = this.threeDElements.length;
	    while (i < len) {
	      if (this.threeDElements[i].startPos <= pos && this.threeDElements[i].endPos >= pos) {
	        return this.threeDElements[i].perspectiveElem;
	      }
	      i += 1;
	    }
	    return null;
	  };
	  HybridRendererBase.prototype.createThreeDContainer = function(pos, type) {
	    var perspectiveElem = createTag("div");
	    var style;
	    var containerStyle;
	    styleDiv(perspectiveElem);
	    var container = createTag("div");
	    styleDiv(container);
	    if (type === "3d") {
	      style = perspectiveElem.style;
	      style.width = this.globalData.compSize.w + "px";
	      style.height = this.globalData.compSize.h + "px";
	      var center = "50% 50%";
	      style.webkitTransformOrigin = center;
	      style.mozTransformOrigin = center;
	      style.transformOrigin = center;
	      containerStyle = container.style;
	      var matrix = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
	      containerStyle.transform = matrix;
	      containerStyle.webkitTransform = matrix;
	    }
	    perspectiveElem.appendChild(container);
	    var threeDContainerData = {
	      container,
	      perspectiveElem,
	      startPos: pos,
	      endPos: pos,
	      type
	    };
	    this.threeDElements.push(threeDContainerData);
	    return threeDContainerData;
	  };
	  HybridRendererBase.prototype.build3dContainers = function() {
	    var i;
	    var len = this.layers.length;
	    var lastThreeDContainerData;
	    var currentContainer = "";
	    for (i = 0; i < len; i += 1) {
	      if (this.layers[i].ddd && this.layers[i].ty !== 3) {
	        if (currentContainer !== "3d") {
	          currentContainer = "3d";
	          lastThreeDContainerData = this.createThreeDContainer(i, "3d");
	        }
	        lastThreeDContainerData.endPos = Math.max(lastThreeDContainerData.endPos, i);
	      } else {
	        if (currentContainer !== "2d") {
	          currentContainer = "2d";
	          lastThreeDContainerData = this.createThreeDContainer(i, "2d");
	        }
	        lastThreeDContainerData.endPos = Math.max(lastThreeDContainerData.endPos, i);
	      }
	    }
	    len = this.threeDElements.length;
	    for (i = len - 1; i >= 0; i -= 1) {
	      this.resizerElem.appendChild(this.threeDElements[i].perspectiveElem);
	    }
	  };
	  HybridRendererBase.prototype.addTo3dContainer = function(elem2, pos) {
	    var i = 0;
	    var len = this.threeDElements.length;
	    while (i < len) {
	      if (pos <= this.threeDElements[i].endPos) {
	        var j = this.threeDElements[i].startPos;
	        var nextElement;
	        while (j < pos) {
	          if (this.elements[j] && this.elements[j].getBaseElement) {
	            nextElement = this.elements[j].getBaseElement();
	          }
	          j += 1;
	        }
	        if (nextElement) {
	          this.threeDElements[i].container.insertBefore(elem2, nextElement);
	        } else {
	          this.threeDElements[i].container.appendChild(elem2);
	        }
	        break;
	      }
	      i += 1;
	    }
	  };
	  HybridRendererBase.prototype.configAnimation = function(animData) {
	    var resizerElem = createTag("div");
	    var wrapper = this.animationItem.wrapper;
	    var style = resizerElem.style;
	    style.width = animData.w + "px";
	    style.height = animData.h + "px";
	    this.resizerElem = resizerElem;
	    styleDiv(resizerElem);
	    style.transformStyle = "flat";
	    style.mozTransformStyle = "flat";
	    style.webkitTransformStyle = "flat";
	    if (this.renderConfig.className) {
	      resizerElem.setAttribute("class", this.renderConfig.className);
	    }
	    wrapper.appendChild(resizerElem);
	    style.overflow = "hidden";
	    var svg = createNS("svg");
	    svg.setAttribute("width", "1");
	    svg.setAttribute("height", "1");
	    styleDiv(svg);
	    this.resizerElem.appendChild(svg);
	    var defs = createNS("defs");
	    svg.appendChild(defs);
	    this.data = animData;
	    this.setupGlobalData(animData, svg);
	    this.globalData.defs = defs;
	    this.layers = animData.layers;
	    this.layerElement = this.resizerElem;
	    this.build3dContainers();
	    this.updateContainerSize();
	  };
	  HybridRendererBase.prototype.destroy = function() {
	    if (this.animationItem.wrapper) {
	      this.animationItem.wrapper.innerText = "";
	    }
	    this.animationItem.container = null;
	    this.globalData.defs = null;
	    var i;
	    var len = this.layers ? this.layers.length : 0;
	    for (i = 0; i < len; i += 1) {
	      if (this.elements[i] && this.elements[i].destroy) {
	        this.elements[i].destroy();
	      }
	    }
	    this.elements.length = 0;
	    this.destroyed = true;
	    this.animationItem = null;
	  };
	  HybridRendererBase.prototype.updateContainerSize = function() {
	    var elementWidth = this.animationItem.wrapper.offsetWidth;
	    var elementHeight = this.animationItem.wrapper.offsetHeight;
	    var elementRel = elementWidth / elementHeight;
	    var animationRel = this.globalData.compSize.w / this.globalData.compSize.h;
	    var sx;
	    var sy;
	    var tx;
	    var ty;
	    if (animationRel > elementRel) {
	      sx = elementWidth / this.globalData.compSize.w;
	      sy = elementWidth / this.globalData.compSize.w;
	      tx = 0;
	      ty = (elementHeight - this.globalData.compSize.h * (elementWidth / this.globalData.compSize.w)) / 2;
	    } else {
	      sx = elementHeight / this.globalData.compSize.h;
	      sy = elementHeight / this.globalData.compSize.h;
	      tx = (elementWidth - this.globalData.compSize.w * (elementHeight / this.globalData.compSize.h)) / 2;
	      ty = 0;
	    }
	    var style = this.resizerElem.style;
	    style.webkitTransform = "matrix3d(" + sx + ",0,0,0,0," + sy + ",0,0,0,0,1,0," + tx + "," + ty + ",0,1)";
	    style.transform = style.webkitTransform;
	  };
	  HybridRendererBase.prototype.renderFrame = SVGRenderer.prototype.renderFrame;
	  HybridRendererBase.prototype.hide = function() {
	    this.resizerElem.style.display = "none";
	  };
	  HybridRendererBase.prototype.show = function() {
	    this.resizerElem.style.display = "block";
	  };
	  HybridRendererBase.prototype.initItems = function() {
	    this.buildAllItems();
	    if (this.camera) {
	      this.camera.setup();
	    } else {
	      var cWidth = this.globalData.compSize.w;
	      var cHeight = this.globalData.compSize.h;
	      var i;
	      var len = this.threeDElements.length;
	      for (i = 0; i < len; i += 1) {
	        var style = this.threeDElements[i].perspectiveElem.style;
	        style.webkitPerspective = Math.sqrt(Math.pow(cWidth, 2) + Math.pow(cHeight, 2)) + "px";
	        style.perspective = style.webkitPerspective;
	      }
	    }
	  };
	  HybridRendererBase.prototype.searchExtraCompositions = function(assets) {
	    var i;
	    var len = assets.length;
	    var floatingContainer = createTag("div");
	    for (i = 0; i < len; i += 1) {
	      if (assets[i].xt) {
	        var comp2 = this.createComp(assets[i], floatingContainer, this.globalData.comp, null);
	        comp2.initExpressions();
	        this.globalData.projectInterface.registerComposition(comp2);
	      }
	    }
	  };
	  function HCompElement(data2, globalData2, comp2) {
	    this.layers = data2.layers;
	    this.supports3d = !data2.hasMask;
	    this.completeLayers = false;
	    this.pendingElements = [];
	    this.elements = this.layers ? createSizedArray(this.layers.length) : [];
	    this.initElement(data2, globalData2, comp2);
	    this.tm = data2.tm ? PropertyFactory.getProp(this, data2.tm, 0, globalData2.frameRate, this) : {
	      _placeholder: true
	    };
	  }
	  extendPrototype([HybridRendererBase, ICompElement, HBaseElement], HCompElement);
	  HCompElement.prototype._createBaseContainerElements = HCompElement.prototype.createContainerElements;
	  HCompElement.prototype.createContainerElements = function() {
	    this._createBaseContainerElements();
	    if (this.data.hasMask) {
	      this.svgElement.setAttribute("width", this.data.w);
	      this.svgElement.setAttribute("height", this.data.h);
	      this.transformedElement = this.baseElement;
	    } else {
	      this.transformedElement = this.layerElement;
	    }
	  };
	  HCompElement.prototype.addTo3dContainer = function(elem2, pos) {
	    var j = 0;
	    var nextElement;
	    while (j < pos) {
	      if (this.elements[j] && this.elements[j].getBaseElement) {
	        nextElement = this.elements[j].getBaseElement();
	      }
	      j += 1;
	    }
	    if (nextElement) {
	      this.layerElement.insertBefore(elem2, nextElement);
	    } else {
	      this.layerElement.appendChild(elem2);
	    }
	  };
	  HCompElement.prototype.createComp = function(data2) {
	    if (!this.supports3d) {
	      return new SVGCompElement(data2, this.globalData, this);
	    }
	    return new HCompElement(data2, this.globalData, this);
	  };
	  function HybridRenderer(animationItem, config) {
	    this.animationItem = animationItem;
	    this.layers = null;
	    this.renderedFrame = -1;
	    this.renderConfig = {
	      className: config && config.className || "",
	      imagePreserveAspectRatio: config && config.imagePreserveAspectRatio || "xMidYMid slice",
	      hideOnTransparent: !(config && config.hideOnTransparent === false),
	      filterSize: {
	        width: config && config.filterSize && config.filterSize.width || "400%",
	        height: config && config.filterSize && config.filterSize.height || "400%",
	        x: config && config.filterSize && config.filterSize.x || "-100%",
	        y: config && config.filterSize && config.filterSize.y || "-100%"
	      },
	      runExpressions: !config || config.runExpressions === void 0 || config.runExpressions
	    };
	    this.globalData = {
	      _mdf: false,
	      frameNum: -1,
	      renderConfig: this.renderConfig
	    };
	    this.pendingElements = [];
	    this.elements = [];
	    this.threeDElements = [];
	    this.destroyed = false;
	    this.camera = null;
	    this.supports3d = true;
	    this.rendererType = "html";
	  }
	  extendPrototype([HybridRendererBase], HybridRenderer);
	  HybridRenderer.prototype.createComp = function(data2) {
	    if (!this.supports3d) {
	      return new SVGCompElement(data2, this.globalData, this);
	    }
	    return new HCompElement(data2, this.globalData, this);
	  };
	  var CompExpressionInterface = /* @__PURE__ */ function() {
	    return function(comp2) {
	      function _thisLayerFunction(name2) {
	        var i = 0;
	        var len = comp2.layers.length;
	        while (i < len) {
	          if (comp2.layers[i].nm === name2 || comp2.layers[i].ind === name2) {
	            return comp2.elements[i].layerInterface;
	          }
	          i += 1;
	        }
	        return null;
	      }
	      Object.defineProperty(_thisLayerFunction, "_name", {
	        value: comp2.data.nm
	      });
	      _thisLayerFunction.layer = _thisLayerFunction;
	      _thisLayerFunction.pixelAspect = 1;
	      _thisLayerFunction.height = comp2.data.h || comp2.globalData.compSize.h;
	      _thisLayerFunction.width = comp2.data.w || comp2.globalData.compSize.w;
	      _thisLayerFunction.pixelAspect = 1;
	      _thisLayerFunction.frameDuration = 1 / comp2.globalData.frameRate;
	      _thisLayerFunction.displayStartTime = 0;
	      _thisLayerFunction.numLayers = comp2.layers.length;
	      return _thisLayerFunction;
	    };
	  }();
	  function _typeof$2(o) {
	    "@babel/helpers - typeof";
	    return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof$2(o);
	  }
	  function seedRandom(pool, math) {
	    var global = this, width2 = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width2, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask2 = width2 - 1, nodecrypto;
	    function seedrandom(seed, options, callback) {
	      var key2 = [];
	      options = options === true ? {
	        entropy: true
	      } : options || {};
	      var shortseed = mixkey(flatten(options.entropy ? [seed, tostring(pool)] : seed === null ? autoseed() : seed, 3), key2);
	      var arc4 = new ARC4(key2);
	      var prng = function prng2() {
	        var n = arc4.g(chunks), d = startdenom, x = 0;
	        while (n < significance) {
	          n = (n + x) * width2;
	          d *= width2;
	          x = arc4.g(1);
	        }
	        while (n >= overflow) {
	          n /= 2;
	          d /= 2;
	          x >>>= 1;
	        }
	        return (n + x) / d;
	      };
	      prng.int32 = function() {
	        return arc4.g(4) | 0;
	      };
	      prng.quick = function() {
	        return arc4.g(4) / 4294967296;
	      };
	      prng["double"] = prng;
	      mixkey(tostring(arc4.S), pool);
	      return (options.pass || callback || function(prng2, seed2, is_math_call, state) {
	        if (state) {
	          if (state.S) {
	            copy(state, arc4);
	          }
	          prng2.state = function() {
	            return copy(arc4, {});
	          };
	        }
	        if (is_math_call) {
	          math[rngname] = prng2;
	          return seed2;
	        } else return prng2;
	      })(prng, shortseed, "global" in options ? options.global : this == math, options.state);
	    }
	    math["seed" + rngname] = seedrandom;
	    function ARC4(key2) {
	      var t, keylen = key2.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
	      if (!keylen) {
	        key2 = [keylen++];
	      }
	      while (i < width2) {
	        s[i] = i++;
	      }
	      for (i = 0; i < width2; i++) {
	        s[i] = s[j = mask2 & j + key2[i % keylen] + (t = s[i])];
	        s[j] = t;
	      }
	      me.g = function(count) {
	        var t2, r = 0, i2 = me.i, j2 = me.j, s2 = me.S;
	        while (count--) {
	          t2 = s2[i2 = mask2 & i2 + 1];
	          r = r * width2 + s2[mask2 & (s2[i2] = s2[j2 = mask2 & j2 + t2]) + (s2[j2] = t2)];
	        }
	        me.i = i2;
	        me.j = j2;
	        return r;
	      };
	    }
	    function copy(f, t) {
	      t.i = f.i;
	      t.j = f.j;
	      t.S = f.S.slice();
	      return t;
	    }
	    function flatten(obj, depth) {
	      var result = [], typ = _typeof$2(obj), prop;
	      if (depth && typ == "object") {
	        for (prop in obj) {
	          try {
	            result.push(flatten(obj[prop], depth - 1));
	          } catch (e) {
	          }
	        }
	      }
	      return result.length ? result : typ == "string" ? obj : obj + "\0";
	    }
	    function mixkey(seed, key2) {
	      var stringseed = seed + "", smear, j = 0;
	      while (j < stringseed.length) {
	        key2[mask2 & j] = mask2 & (smear ^= key2[mask2 & j] * 19) + stringseed.charCodeAt(j++);
	      }
	      return tostring(key2);
	    }
	    function autoseed() {
	      try {
	        if (nodecrypto) ;
	        var out = new Uint8Array(width2);
	        (global.crypto || global.msCrypto).getRandomValues(out);
	        return tostring(out);
	      } catch (e) {
	        var browser = global.navigator, plugins = browser && browser.plugins;
	        return [+/* @__PURE__ */ new Date(), global, plugins, global.screen, tostring(pool)];
	      }
	    }
	    function tostring(a) {
	      return String.fromCharCode.apply(0, a);
	    }
	    mixkey(math.random(), pool);
	  }
	  function initialize$2(BMMath2) {
	    seedRandom([], BMMath2);
	  }
	  var propTypes = {
	    SHAPE: "shape"
	  };
	  function _typeof$1(o) {
	    "@babel/helpers - typeof";
	    return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof$1(o);
	  }
	  var ExpressionManager = function() {
	    var ob = {};
	    var Math = BMMath;
	    var window = null;
	    var document = null;
	    var XMLHttpRequest = null;
	    var fetch = null;
	    var frames = null;
	    var _lottieGlobal = {};
	    initialize$2(BMMath);
	    function resetFrame() {
	      _lottieGlobal = {};
	    }
	    function $bm_isInstanceOfArray(arr) {
	      return arr.constructor === Array || arr.constructor === Float32Array;
	    }
	    function isNumerable(tOfV, v) {
	      return tOfV === "number" || v instanceof Number || tOfV === "boolean" || tOfV === "string";
	    }
	    function $bm_neg(a) {
	      var tOfA = _typeof$1(a);
	      if (tOfA === "number" || a instanceof Number || tOfA === "boolean") {
	        return -a;
	      }
	      if ($bm_isInstanceOfArray(a)) {
	        var i;
	        var lenA = a.length;
	        var retArr = [];
	        for (i = 0; i < lenA; i += 1) {
	          retArr[i] = -a[i];
	        }
	        return retArr;
	      }
	      if (a.propType) {
	        return a.v;
	      }
	      return -a;
	    }
	    var easeInBez = BezierFactory.getBezierEasing(0.333, 0, 0.833, 0.833, "easeIn").get;
	    var easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, 0.667, 1, "easeOut").get;
	    var easeInOutBez = BezierFactory.getBezierEasing(0.33, 0, 0.667, 1, "easeInOut").get;
	    function sum(a, b) {
	      var tOfA = _typeof$1(a);
	      var tOfB = _typeof$1(b);
	      if (isNumerable(tOfA, a) && isNumerable(tOfB, b) || tOfA === "string" || tOfB === "string") {
	        return a + b;
	      }
	      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
	        a = a.slice(0);
	        a[0] += b;
	        return a;
	      }
	      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
	        b = b.slice(0);
	        b[0] = a + b[0];
	        return b;
	      }
	      if ($bm_isInstanceOfArray(a) && $bm_isInstanceOfArray(b)) {
	        var i = 0;
	        var lenA = a.length;
	        var lenB = b.length;
	        var retArr = [];
	        while (i < lenA || i < lenB) {
	          if ((typeof a[i] === "number" || a[i] instanceof Number) && (typeof b[i] === "number" || b[i] instanceof Number)) {
	            retArr[i] = a[i] + b[i];
	          } else {
	            retArr[i] = b[i] === void 0 ? a[i] : a[i] || b[i];
	          }
	          i += 1;
	        }
	        return retArr;
	      }
	      return 0;
	    }
	    var add = sum;
	    function sub(a, b) {
	      var tOfA = _typeof$1(a);
	      var tOfB = _typeof$1(b);
	      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
	        if (tOfA === "string") {
	          a = parseInt(a, 10);
	        }
	        if (tOfB === "string") {
	          b = parseInt(b, 10);
	        }
	        return a - b;
	      }
	      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
	        a = a.slice(0);
	        a[0] -= b;
	        return a;
	      }
	      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
	        b = b.slice(0);
	        b[0] = a - b[0];
	        return b;
	      }
	      if ($bm_isInstanceOfArray(a) && $bm_isInstanceOfArray(b)) {
	        var i = 0;
	        var lenA = a.length;
	        var lenB = b.length;
	        var retArr = [];
	        while (i < lenA || i < lenB) {
	          if ((typeof a[i] === "number" || a[i] instanceof Number) && (typeof b[i] === "number" || b[i] instanceof Number)) {
	            retArr[i] = a[i] - b[i];
	          } else {
	            retArr[i] = b[i] === void 0 ? a[i] : a[i] || b[i];
	          }
	          i += 1;
	        }
	        return retArr;
	      }
	      return 0;
	    }
	    function mul(a, b) {
	      var tOfA = _typeof$1(a);
	      var tOfB = _typeof$1(b);
	      var arr;
	      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
	        return a * b;
	      }
	      var i;
	      var len;
	      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
	        len = a.length;
	        arr = createTypedArray("float32", len);
	        for (i = 0; i < len; i += 1) {
	          arr[i] = a[i] * b;
	        }
	        return arr;
	      }
	      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
	        len = b.length;
	        arr = createTypedArray("float32", len);
	        for (i = 0; i < len; i += 1) {
	          arr[i] = a * b[i];
	        }
	        return arr;
	      }
	      return 0;
	    }
	    function div(a, b) {
	      var tOfA = _typeof$1(a);
	      var tOfB = _typeof$1(b);
	      var arr;
	      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
	        return a / b;
	      }
	      var i;
	      var len;
	      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
	        len = a.length;
	        arr = createTypedArray("float32", len);
	        for (i = 0; i < len; i += 1) {
	          arr[i] = a[i] / b;
	        }
	        return arr;
	      }
	      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
	        len = b.length;
	        arr = createTypedArray("float32", len);
	        for (i = 0; i < len; i += 1) {
	          arr[i] = a / b[i];
	        }
	        return arr;
	      }
	      return 0;
	    }
	    function mod(a, b) {
	      if (typeof a === "string") {
	        a = parseInt(a, 10);
	      }
	      if (typeof b === "string") {
	        b = parseInt(b, 10);
	      }
	      return a % b;
	    }
	    var $bm_sum = sum;
	    var $bm_sub = sub;
	    var $bm_mul = mul;
	    var $bm_div = div;
	    var $bm_mod = mod;
	    function clamp(num, min, max) {
	      if (min > max) {
	        var mm = max;
	        max = min;
	        min = mm;
	      }
	      return Math.min(Math.max(num, min), max);
	    }
	    function radiansToDegrees(val2) {
	      return val2 / degToRads;
	    }
	    var radians_to_degrees = radiansToDegrees;
	    function degreesToRadians(val2) {
	      return val2 * degToRads;
	    }
	    var degrees_to_radians = radiansToDegrees;
	    var helperLengthArray = [0, 0, 0, 0, 0, 0];
	    function length(arr1, arr2) {
	      if (typeof arr1 === "number" || arr1 instanceof Number) {
	        arr2 = arr2 || 0;
	        return Math.abs(arr1 - arr2);
	      }
	      if (!arr2) {
	        arr2 = helperLengthArray;
	      }
	      var i;
	      var len = Math.min(arr1.length, arr2.length);
	      var addedLength = 0;
	      for (i = 0; i < len; i += 1) {
	        addedLength += Math.pow(arr2[i] - arr1[i], 2);
	      }
	      return Math.sqrt(addedLength);
	    }
	    function normalize(vec) {
	      return div(vec, length(vec));
	    }
	    function rgbToHsl(val2) {
	      var r = val2[0];
	      var g = val2[1];
	      var b = val2[2];
	      var max = Math.max(r, g, b);
	      var min = Math.min(r, g, b);
	      var h;
	      var s;
	      var l = (max + min) / 2;
	      if (max === min) {
	        h = 0;
	        s = 0;
	      } else {
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch (max) {
	          case r:
	            h = (g - b) / d + (g < b ? 6 : 0);
	            break;
	          case g:
	            h = (b - r) / d + 2;
	            break;
	          case b:
	            h = (r - g) / d + 4;
	            break;
	        }
	        h /= 6;
	      }
	      return [h, s, l, val2[3]];
	    }
	    function hue2rgb(p, q, t) {
	      if (t < 0) t += 1;
	      if (t > 1) t -= 1;
	      if (t < 1 / 6) return p + (q - p) * 6 * t;
	      if (t < 1 / 2) return q;
	      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	      return p;
	    }
	    function hslToRgb(val2) {
	      var h = val2[0];
	      var s = val2[1];
	      var l = val2[2];
	      var r;
	      var g;
	      var b;
	      if (s === 0) {
	        r = l;
	        b = l;
	        g = l;
	      } else {
	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1 / 3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1 / 3);
	      }
	      return [r, g, b, val2[3]];
	    }
	    function linear(t, tMin, tMax, value1, value2) {
	      if (value1 === void 0 || value2 === void 0) {
	        value1 = tMin;
	        value2 = tMax;
	        tMin = 0;
	        tMax = 1;
	      }
	      if (tMax < tMin) {
	        var _tMin = tMax;
	        tMax = tMin;
	        tMin = _tMin;
	      }
	      if (t <= tMin) {
	        return value1;
	      }
	      if (t >= tMax) {
	        return value2;
	      }
	      var perc = tMax === tMin ? 0 : (t - tMin) / (tMax - tMin);
	      if (!value1.length) {
	        return value1 + (value2 - value1) * perc;
	      }
	      var i;
	      var len = value1.length;
	      var arr = createTypedArray("float32", len);
	      for (i = 0; i < len; i += 1) {
	        arr[i] = value1[i] + (value2[i] - value1[i]) * perc;
	      }
	      return arr;
	    }
	    function random(min, max) {
	      if (max === void 0) {
	        if (min === void 0) {
	          min = 0;
	          max = 1;
	        } else {
	          max = min;
	          min = void 0;
	        }
	      }
	      if (max.length) {
	        var i;
	        var len = max.length;
	        if (!min) {
	          min = createTypedArray("float32", len);
	        }
	        var arr = createTypedArray("float32", len);
	        var rnd = BMMath.random();
	        for (i = 0; i < len; i += 1) {
	          arr[i] = min[i] + rnd * (max[i] - min[i]);
	        }
	        return arr;
	      }
	      if (min === void 0) {
	        min = 0;
	      }
	      var rndm = BMMath.random();
	      return min + rndm * (max - min);
	    }
	    function createPath(points, inTangents, outTangents, closed) {
	      var i;
	      var len = points.length;
	      var path = shapePool.newElement();
	      path.setPathData(!!closed, len);
	      var arrPlaceholder = [0, 0];
	      var inVertexPoint;
	      var outVertexPoint;
	      for (i = 0; i < len; i += 1) {
	        inVertexPoint = inTangents && inTangents[i] ? inTangents[i] : arrPlaceholder;
	        outVertexPoint = outTangents && outTangents[i] ? outTangents[i] : arrPlaceholder;
	        path.setTripleAt(points[i][0], points[i][1], outVertexPoint[0] + points[i][0], outVertexPoint[1] + points[i][1], inVertexPoint[0] + points[i][0], inVertexPoint[1] + points[i][1], i, true);
	      }
	      return path;
	    }
	    function initiateExpression(elem, data, property) {
	      function noOp(_value) {
	        return _value;
	      }
	      if (!elem.globalData.renderConfig.runExpressions) {
	        return noOp;
	      }
	      var val = data.x;
	      var needsVelocity = /velocity(?![\w\d])/.test(val);
	      var _needsRandom = val.indexOf("random") !== -1;
	      var elemType = elem.data.ty;
	      var transform;
	      var $bm_transform;
	      var content;
	      var effect;
	      var thisProperty = property;
	      thisProperty._name = elem.data.nm;
	      thisProperty.valueAtTime = thisProperty.getValueAtTime;
	      Object.defineProperty(thisProperty, "value", {
	        get: function get() {
	          return thisProperty.v;
	        }
	      });
	      elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate;
	      elem.comp.displayStartTime = 0;
	      var inPoint = elem.data.ip / elem.comp.globalData.frameRate;
	      var outPoint = elem.data.op / elem.comp.globalData.frameRate;
	      var width = elem.data.sw ? elem.data.sw : 0;
	      var height = elem.data.sh ? elem.data.sh : 0;
	      var name = elem.data.nm;
	      var loopIn;
	      var loop_in;
	      var loopOut;
	      var loop_out;
	      var smooth;
	      var toWorld;
	      var fromWorld;
	      var fromComp;
	      var toComp;
	      var fromCompToSurface;
	      var position;
	      var rotation;
	      var anchorPoint;
	      var scale;
	      var thisLayer;
	      var thisComp;
	      var mask;
	      var valueAtTime;
	      var velocityAtTime;
	      var scoped_bm_rt;
	      var expression_function = eval("[function _expression_function(){" + val + ";scoped_bm_rt=$bm_rt}]")[0];
	      var numKeys = property.kf ? data.k.length : 0;
	      var active = !this.data || this.data.hd !== true;
	      var wiggle = function wiggle2(freq, amp) {
	        var iWiggle;
	        var j;
	        var lenWiggle = this.pv.length ? this.pv.length : 1;
	        var addedAmps = createTypedArray("float32", lenWiggle);
	        freq = 5;
	        var iterations = Math.floor(time * freq);
	        iWiggle = 0;
	        j = 0;
	        while (iWiggle < iterations) {
	          for (j = 0; j < lenWiggle; j += 1) {
	            addedAmps[j] += -amp + amp * 2 * BMMath.random();
	          }
	          iWiggle += 1;
	        }
	        var periods = time * freq;
	        var perc = periods - Math.floor(periods);
	        var arr = createTypedArray("float32", lenWiggle);
	        if (lenWiggle > 1) {
	          for (j = 0; j < lenWiggle; j += 1) {
	            arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp * 2 * BMMath.random()) * perc;
	          }
	          return arr;
	        }
	        return this.pv + addedAmps[0] + (-amp + amp * 2 * BMMath.random()) * perc;
	      }.bind(this);
	      if (thisProperty.loopIn) {
	        loopIn = thisProperty.loopIn.bind(thisProperty);
	        loop_in = loopIn;
	      }
	      if (thisProperty.loopOut) {
	        loopOut = thisProperty.loopOut.bind(thisProperty);
	        loop_out = loopOut;
	      }
	      if (thisProperty.smooth) {
	        smooth = thisProperty.smooth.bind(thisProperty);
	      }
	      function loopInDuration(type, duration) {
	        return loopIn(type, duration, true);
	      }
	      function loopOutDuration(type, duration) {
	        return loopOut(type, duration, true);
	      }
	      if (this.getValueAtTime) {
	        valueAtTime = this.getValueAtTime.bind(this);
	      }
	      if (this.getVelocityAtTime) {
	        velocityAtTime = this.getVelocityAtTime.bind(this);
	      }
	      var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);
	      function lookAt(elem1, elem2) {
	        var fVec = [elem2[0] - elem1[0], elem2[1] - elem1[1], elem2[2] - elem1[2]];
	        var pitch = Math.atan2(fVec[0], Math.sqrt(fVec[1] * fVec[1] + fVec[2] * fVec[2])) / degToRads;
	        var yaw = -Math.atan2(fVec[1], fVec[2]) / degToRads;
	        return [yaw, pitch, 0];
	      }
	      function easeOut(t, tMin, tMax, val1, val2) {
	        return applyEase(easeOutBez, t, tMin, tMax, val1, val2);
	      }
	      function easeIn(t, tMin, tMax, val1, val2) {
	        return applyEase(easeInBez, t, tMin, tMax, val1, val2);
	      }
	      function ease(t, tMin, tMax, val1, val2) {
	        return applyEase(easeInOutBez, t, tMin, tMax, val1, val2);
	      }
	      function applyEase(fn, t, tMin, tMax, val1, val2) {
	        if (val1 === void 0) {
	          val1 = tMin;
	          val2 = tMax;
	        } else {
	          t = (t - tMin) / (tMax - tMin);
	        }
	        if (t > 1) {
	          t = 1;
	        } else if (t < 0) {
	          t = 0;
	        }
	        var mult = fn(t);
	        if ($bm_isInstanceOfArray(val1)) {
	          var iKey;
	          var lenKey = val1.length;
	          var arr = createTypedArray("float32", lenKey);
	          for (iKey = 0; iKey < lenKey; iKey += 1) {
	            arr[iKey] = (val2[iKey] - val1[iKey]) * mult + val1[iKey];
	          }
	          return arr;
	        }
	        return (val2 - val1) * mult + val1;
	      }
	      function nearestKey(time2) {
	        var iKey;
	        var lenKey = data.k.length;
	        var index2;
	        var keyTime;
	        if (!data.k.length || typeof data.k[0] === "number") {
	          index2 = 0;
	          keyTime = 0;
	        } else {
	          index2 = -1;
	          time2 *= elem.comp.globalData.frameRate;
	          if (time2 < data.k[0].t) {
	            index2 = 1;
	            keyTime = data.k[0].t;
	          } else {
	            for (iKey = 0; iKey < lenKey - 1; iKey += 1) {
	              if (time2 === data.k[iKey].t) {
	                index2 = iKey + 1;
	                keyTime = data.k[iKey].t;
	                break;
	              } else if (time2 > data.k[iKey].t && time2 < data.k[iKey + 1].t) {
	                if (time2 - data.k[iKey].t > data.k[iKey + 1].t - time2) {
	                  index2 = iKey + 2;
	                  keyTime = data.k[iKey + 1].t;
	                } else {
	                  index2 = iKey + 1;
	                  keyTime = data.k[iKey].t;
	                }
	                break;
	              }
	            }
	            if (index2 === -1) {
	              index2 = iKey + 1;
	              keyTime = data.k[iKey].t;
	            }
	          }
	        }
	        var obKey = {};
	        obKey.index = index2;
	        obKey.time = keyTime / elem.comp.globalData.frameRate;
	        return obKey;
	      }
	      function key(ind) {
	        var obKey;
	        var iKey;
	        var lenKey;
	        if (!data.k.length || typeof data.k[0] === "number") {
	          throw new Error("The property has no keyframe at index " + ind);
	        }
	        ind -= 1;
	        obKey = {
	          time: data.k[ind].t / elem.comp.globalData.frameRate,
	          value: []
	        };
	        var arr = Object.prototype.hasOwnProperty.call(data.k[ind], "s") ? data.k[ind].s : data.k[ind - 1].e;
	        lenKey = arr.length;
	        for (iKey = 0; iKey < lenKey; iKey += 1) {
	          obKey[iKey] = arr[iKey];
	          obKey.value[iKey] = arr[iKey];
	        }
	        return obKey;
	      }
	      function framesToTime(fr, fps) {
	        if (!fps) {
	          fps = elem.comp.globalData.frameRate;
	        }
	        return fr / fps;
	      }
	      function timeToFrames(t, fps) {
	        if (!t && t !== 0) {
	          t = time;
	        }
	        if (!fps) {
	          fps = elem.comp.globalData.frameRate;
	        }
	        return t * fps;
	      }
	      function seedRandom(seed) {
	        BMMath.seedrandom(randSeed + seed);
	      }
	      function sourceRectAtTime() {
	        return elem.sourceRectAtTime();
	      }
	      function substring(init, end) {
	        if (typeof value === "string") {
	          if (end === void 0) {
	            return value.substring(init);
	          }
	          return value.substring(init, end);
	        }
	        return "";
	      }
	      function substr(init, end) {
	        if (typeof value === "string") {
	          if (end === void 0) {
	            return value.substr(init);
	          }
	          return value.substr(init, end);
	        }
	        return "";
	      }
	      function posterizeTime(framesPerSecond) {
	        time = framesPerSecond === 0 ? 0 : Math.floor(time * framesPerSecond) / framesPerSecond;
	        value = valueAtTime(time);
	      }
	      var time;
	      var velocity;
	      var value;
	      var text;
	      var textIndex;
	      var textTotal;
	      var selectorValue;
	      var index = elem.data.ind;
	      var hasParent = !!(elem.hierarchy && elem.hierarchy.length);
	      var parent;
	      var randSeed = Math.floor(Math.random() * 1e6);
	      var globalData = elem.globalData;
	      function executeExpression(_value) {
	        value = _value;
	        if (this.frameExpressionId === elem.globalData.frameId && this.propType !== "textSelector") {
	          return value;
	        }
	        if (this.propType === "textSelector") {
	          textIndex = this.textIndex;
	          textTotal = this.textTotal;
	          selectorValue = this.selectorValue;
	        }
	        if (!thisLayer) {
	          text = elem.layerInterface.text;
	          thisLayer = elem.layerInterface;
	          thisComp = elem.comp.compInterface;
	          toWorld = thisLayer.toWorld.bind(thisLayer);
	          fromWorld = thisLayer.fromWorld.bind(thisLayer);
	          fromComp = thisLayer.fromComp.bind(thisLayer);
	          toComp = thisLayer.toComp.bind(thisLayer);
	          mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null;
	          fromCompToSurface = fromComp;
	        }
	        if (!transform) {
	          transform = elem.layerInterface("ADBE Transform Group");
	          $bm_transform = transform;
	          if (transform) {
	            anchorPoint = transform.anchorPoint;
	          }
	        }
	        if (elemType === 4 && !content) {
	          content = thisLayer("ADBE Root Vectors Group");
	        }
	        if (!effect) {
	          effect = thisLayer(4);
	        }
	        hasParent = !!(elem.hierarchy && elem.hierarchy.length);
	        if (hasParent && !parent) {
	          parent = elem.hierarchy[0].layerInterface;
	        }
	        time = this.comp.renderedFrame / this.comp.globalData.frameRate;
	        if (_needsRandom) {
	          seedRandom(randSeed + time);
	        }
	        if (needsVelocity) {
	          velocity = velocityAtTime(time);
	        }
	        expression_function();
	        this.frameExpressionId = elem.globalData.frameId;
	        scoped_bm_rt = scoped_bm_rt.propType === propTypes.SHAPE ? scoped_bm_rt.v : scoped_bm_rt;
	        return scoped_bm_rt;
	      }
	      executeExpression.__preventDeadCodeRemoval = [$bm_transform, anchorPoint, time, velocity, inPoint, outPoint, width, height, name, loop_in, loop_out, smooth, toComp, fromCompToSurface, toWorld, fromWorld, mask, position, rotation, scale, thisComp, numKeys, active, wiggle, loopInDuration, loopOutDuration, comp, lookAt, easeOut, easeIn, ease, nearestKey, key, text, textIndex, textTotal, selectorValue, framesToTime, timeToFrames, sourceRectAtTime, substring, substr, posterizeTime, index, globalData];
	      return executeExpression;
	    }
	    ob.initiateExpression = initiateExpression;
	    ob.__preventDeadCodeRemoval = [window, document, XMLHttpRequest, fetch, frames, $bm_neg, add, $bm_sum, $bm_sub, $bm_mul, $bm_div, $bm_mod, clamp, radians_to_degrees, degreesToRadians, degrees_to_radians, normalize, rgbToHsl, hslToRgb, linear, random, createPath, _lottieGlobal];
	    ob.resetFrame = resetFrame;
	    return ob;
	  }();
	  var Expressions = function() {
	    var ob2 = {};
	    ob2.initExpressions = initExpressions;
	    ob2.resetFrame = ExpressionManager.resetFrame;
	    function initExpressions(animation) {
	      var stackCount = 0;
	      var registers = [];
	      function pushExpression() {
	        stackCount += 1;
	      }
	      function popExpression() {
	        stackCount -= 1;
	        if (stackCount === 0) {
	          releaseInstances();
	        }
	      }
	      function registerExpressionProperty(expression) {
	        if (registers.indexOf(expression) === -1) {
	          registers.push(expression);
	        }
	      }
	      function releaseInstances() {
	        var i;
	        var len = registers.length;
	        for (i = 0; i < len; i += 1) {
	          registers[i].release();
	        }
	        registers.length = 0;
	      }
	      animation.renderer.compInterface = CompExpressionInterface(animation.renderer);
	      animation.renderer.globalData.projectInterface.registerComposition(animation.renderer);
	      animation.renderer.globalData.pushExpression = pushExpression;
	      animation.renderer.globalData.popExpression = popExpression;
	      animation.renderer.globalData.registerExpressionProperty = registerExpressionProperty;
	    }
	    return ob2;
	  }();
	  var MaskManagerInterface = function() {
	    function MaskInterface(mask2, data2) {
	      this._mask = mask2;
	      this._data = data2;
	    }
	    Object.defineProperty(MaskInterface.prototype, "maskPath", {
	      get: function get() {
	        if (this._mask.prop.k) {
	          this._mask.prop.getValue();
	        }
	        return this._mask.prop;
	      }
	    });
	    Object.defineProperty(MaskInterface.prototype, "maskOpacity", {
	      get: function get() {
	        if (this._mask.op.k) {
	          this._mask.op.getValue();
	        }
	        return this._mask.op.v * 100;
	      }
	    });
	    var MaskManager = function MaskManager2(maskManager) {
	      var _masksInterfaces = createSizedArray(maskManager.viewData.length);
	      var i;
	      var len = maskManager.viewData.length;
	      for (i = 0; i < len; i += 1) {
	        _masksInterfaces[i] = new MaskInterface(maskManager.viewData[i], maskManager.masksProperties[i]);
	      }
	      var maskFunction = function maskFunction2(name2) {
	        i = 0;
	        while (i < len) {
	          if (maskManager.masksProperties[i].nm === name2) {
	            return _masksInterfaces[i];
	          }
	          i += 1;
	        }
	        return null;
	      };
	      return maskFunction;
	    };
	    return MaskManager;
	  }();
	  var ExpressionPropertyInterface = /* @__PURE__ */ function() {
	    var defaultUnidimensionalValue = {
	      pv: 0,
	      v: 0,
	      mult: 1
	    };
	    var defaultMultidimensionalValue = {
	      pv: [0, 0, 0],
	      v: [0, 0, 0],
	      mult: 1
	    };
	    function completeProperty(expressionValue, property2, type) {
	      Object.defineProperty(expressionValue, "velocity", {
	        get: function get() {
	          return property2.getVelocityAtTime(property2.comp.currentFrame);
	        }
	      });
	      expressionValue.numKeys = property2.keyframes ? property2.keyframes.length : 0;
	      expressionValue.key = function(pos) {
	        if (!expressionValue.numKeys) {
	          return 0;
	        }
	        var value2 = "";
	        if ("s" in property2.keyframes[pos - 1]) {
	          value2 = property2.keyframes[pos - 1].s;
	        } else if ("e" in property2.keyframes[pos - 2]) {
	          value2 = property2.keyframes[pos - 2].e;
	        } else {
	          value2 = property2.keyframes[pos - 2].s;
	        }
	        var valueProp = type === "unidimensional" ? new Number(value2) : Object.assign({}, value2);
	        valueProp.time = property2.keyframes[pos - 1].t / property2.elem.comp.globalData.frameRate;
	        valueProp.value = type === "unidimensional" ? value2[0] : value2;
	        return valueProp;
	      };
	      expressionValue.valueAtTime = property2.getValueAtTime;
	      expressionValue.speedAtTime = property2.getSpeedAtTime;
	      expressionValue.velocityAtTime = property2.getVelocityAtTime;
	      expressionValue.propertyGroup = property2.propertyGroup;
	    }
	    function UnidimensionalPropertyInterface(property2) {
	      if (!property2 || !("pv" in property2)) {
	        property2 = defaultUnidimensionalValue;
	      }
	      var mult = 1 / property2.mult;
	      var val2 = property2.pv * mult;
	      var expressionValue = new Number(val2);
	      expressionValue.value = val2;
	      completeProperty(expressionValue, property2, "unidimensional");
	      return function() {
	        if (property2.k) {
	          property2.getValue();
	        }
	        val2 = property2.v * mult;
	        if (expressionValue.value !== val2) {
	          expressionValue = new Number(val2);
	          expressionValue.value = val2;
	          expressionValue[0] = val2;
	          completeProperty(expressionValue, property2, "unidimensional");
	        }
	        return expressionValue;
	      };
	    }
	    function MultidimensionalPropertyInterface(property2) {
	      if (!property2 || !("pv" in property2)) {
	        property2 = defaultMultidimensionalValue;
	      }
	      var mult = 1 / property2.mult;
	      var len = property2.data && property2.data.l || property2.pv.length;
	      var expressionValue = createTypedArray("float32", len);
	      var arrValue = createTypedArray("float32", len);
	      expressionValue.value = arrValue;
	      completeProperty(expressionValue, property2, "multidimensional");
	      return function() {
	        if (property2.k) {
	          property2.getValue();
	        }
	        for (var i = 0; i < len; i += 1) {
	          arrValue[i] = property2.v[i] * mult;
	          expressionValue[i] = arrValue[i];
	        }
	        return expressionValue;
	      };
	    }
	    function defaultGetter() {
	      return defaultUnidimensionalValue;
	    }
	    return function(property2) {
	      if (!property2) {
	        return defaultGetter;
	      }
	      if (property2.propType === "unidimensional") {
	        return UnidimensionalPropertyInterface(property2);
	      }
	      return MultidimensionalPropertyInterface(property2);
	    };
	  }();
	  var TransformExpressionInterface = /* @__PURE__ */ function() {
	    return function(transform2) {
	      function _thisFunction(name2) {
	        switch (name2) {
	          case "scale":
	          case "Scale":
	          case "ADBE Scale":
	          case 6:
	            return _thisFunction.scale;
	          case "rotation":
	          case "Rotation":
	          case "ADBE Rotation":
	          case "ADBE Rotate Z":
	          case 10:
	            return _thisFunction.rotation;
	          case "ADBE Rotate X":
	            return _thisFunction.xRotation;
	          case "ADBE Rotate Y":
	            return _thisFunction.yRotation;
	          case "position":
	          case "Position":
	          case "ADBE Position":
	          case 2:
	            return _thisFunction.position;
	          case "ADBE Position_0":
	            return _thisFunction.xPosition;
	          case "ADBE Position_1":
	            return _thisFunction.yPosition;
	          case "ADBE Position_2":
	            return _thisFunction.zPosition;
	          case "anchorPoint":
	          case "AnchorPoint":
	          case "Anchor Point":
	          case "ADBE AnchorPoint":
	          case 1:
	            return _thisFunction.anchorPoint;
	          case "opacity":
	          case "Opacity":
	          case 11:
	            return _thisFunction.opacity;
	          default:
	            return null;
	        }
	      }
	      Object.defineProperty(_thisFunction, "rotation", {
	        get: ExpressionPropertyInterface(transform2.r || transform2.rz)
	      });
	      Object.defineProperty(_thisFunction, "zRotation", {
	        get: ExpressionPropertyInterface(transform2.rz || transform2.r)
	      });
	      Object.defineProperty(_thisFunction, "xRotation", {
	        get: ExpressionPropertyInterface(transform2.rx)
	      });
	      Object.defineProperty(_thisFunction, "yRotation", {
	        get: ExpressionPropertyInterface(transform2.ry)
	      });
	      Object.defineProperty(_thisFunction, "scale", {
	        get: ExpressionPropertyInterface(transform2.s)
	      });
	      var _px;
	      var _py;
	      var _pz;
	      var _transformFactory;
	      if (transform2.p) {
	        _transformFactory = ExpressionPropertyInterface(transform2.p);
	      } else {
	        _px = ExpressionPropertyInterface(transform2.px);
	        _py = ExpressionPropertyInterface(transform2.py);
	        if (transform2.pz) {
	          _pz = ExpressionPropertyInterface(transform2.pz);
	        }
	      }
	      Object.defineProperty(_thisFunction, "position", {
	        get: function get() {
	          if (transform2.p) {
	            return _transformFactory();
	          }
	          return [_px(), _py(), _pz ? _pz() : 0];
	        }
	      });
	      Object.defineProperty(_thisFunction, "xPosition", {
	        get: ExpressionPropertyInterface(transform2.px)
	      });
	      Object.defineProperty(_thisFunction, "yPosition", {
	        get: ExpressionPropertyInterface(transform2.py)
	      });
	      Object.defineProperty(_thisFunction, "zPosition", {
	        get: ExpressionPropertyInterface(transform2.pz)
	      });
	      Object.defineProperty(_thisFunction, "anchorPoint", {
	        get: ExpressionPropertyInterface(transform2.a)
	      });
	      Object.defineProperty(_thisFunction, "opacity", {
	        get: ExpressionPropertyInterface(transform2.o)
	      });
	      Object.defineProperty(_thisFunction, "skew", {
	        get: ExpressionPropertyInterface(transform2.sk)
	      });
	      Object.defineProperty(_thisFunction, "skewAxis", {
	        get: ExpressionPropertyInterface(transform2.sa)
	      });
	      Object.defineProperty(_thisFunction, "orientation", {
	        get: ExpressionPropertyInterface(transform2.or)
	      });
	      return _thisFunction;
	    };
	  }();
	  var LayerExpressionInterface = /* @__PURE__ */ function() {
	    function getMatrix(time2) {
	      var toWorldMat = new Matrix();
	      if (time2 !== void 0) {
	        var propMatrix = this._elem.finalTransform.mProp.getValueAtTime(time2);
	        propMatrix.clone(toWorldMat);
	      } else {
	        var transformMat = this._elem.finalTransform.mProp;
	        transformMat.applyToMatrix(toWorldMat);
	      }
	      return toWorldMat;
	    }
	    function toWorldVec(arr, time2) {
	      var toWorldMat = this.getMatrix(time2);
	      toWorldMat.props[12] = 0;
	      toWorldMat.props[13] = 0;
	      toWorldMat.props[14] = 0;
	      return this.applyPoint(toWorldMat, arr);
	    }
	    function toWorld2(arr, time2) {
	      var toWorldMat = this.getMatrix(time2);
	      return this.applyPoint(toWorldMat, arr);
	    }
	    function fromWorldVec(arr, time2) {
	      var toWorldMat = this.getMatrix(time2);
	      toWorldMat.props[12] = 0;
	      toWorldMat.props[13] = 0;
	      toWorldMat.props[14] = 0;
	      return this.invertPoint(toWorldMat, arr);
	    }
	    function fromWorld2(arr, time2) {
	      var toWorldMat = this.getMatrix(time2);
	      return this.invertPoint(toWorldMat, arr);
	    }
	    function applyPoint(matrix, arr) {
	      if (this._elem.hierarchy && this._elem.hierarchy.length) {
	        var i;
	        var len = this._elem.hierarchy.length;
	        for (i = 0; i < len; i += 1) {
	          this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(matrix);
	        }
	      }
	      return matrix.applyToPointArray(arr[0], arr[1], arr[2] || 0);
	    }
	    function invertPoint(matrix, arr) {
	      if (this._elem.hierarchy && this._elem.hierarchy.length) {
	        var i;
	        var len = this._elem.hierarchy.length;
	        for (i = 0; i < len; i += 1) {
	          this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(matrix);
	        }
	      }
	      return matrix.inversePoint(arr);
	    }
	    function fromComp2(arr) {
	      var toWorldMat = new Matrix();
	      toWorldMat.reset();
	      this._elem.finalTransform.mProp.applyToMatrix(toWorldMat);
	      if (this._elem.hierarchy && this._elem.hierarchy.length) {
	        var i;
	        var len = this._elem.hierarchy.length;
	        for (i = 0; i < len; i += 1) {
	          this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
	        }
	        return toWorldMat.inversePoint(arr);
	      }
	      return toWorldMat.inversePoint(arr);
	    }
	    function sampleImage() {
	      return [1, 1, 1, 1];
	    }
	    return function(elem2) {
	      var transformInterface;
	      function _registerMaskInterface(maskManager) {
	        _thisLayerFunction.mask = new MaskManagerInterface(maskManager, elem2);
	      }
	      function _registerEffectsInterface(effects) {
	        _thisLayerFunction.effect = effects;
	      }
	      function _thisLayerFunction(name2) {
	        switch (name2) {
	          case "ADBE Root Vectors Group":
	          case "Contents":
	          case 2:
	            return _thisLayerFunction.shapeInterface;
	          case 1:
	          case 6:
	          case "Transform":
	          case "transform":
	          case "ADBE Transform Group":
	            return transformInterface;
	          case 4:
	          case "ADBE Effect Parade":
	          case "effects":
	          case "Effects":
	            return _thisLayerFunction.effect;
	          case "ADBE Text Properties":
	            return _thisLayerFunction.textInterface;
	          default:
	            return null;
	        }
	      }
	      _thisLayerFunction.getMatrix = getMatrix;
	      _thisLayerFunction.invertPoint = invertPoint;
	      _thisLayerFunction.applyPoint = applyPoint;
	      _thisLayerFunction.toWorld = toWorld2;
	      _thisLayerFunction.toWorldVec = toWorldVec;
	      _thisLayerFunction.fromWorld = fromWorld2;
	      _thisLayerFunction.fromWorldVec = fromWorldVec;
	      _thisLayerFunction.toComp = toWorld2;
	      _thisLayerFunction.fromComp = fromComp2;
	      _thisLayerFunction.sampleImage = sampleImage;
	      _thisLayerFunction.sourceRectAtTime = elem2.sourceRectAtTime.bind(elem2);
	      _thisLayerFunction._elem = elem2;
	      transformInterface = TransformExpressionInterface(elem2.finalTransform.mProp);
	      var anchorPointDescriptor = getDescriptor(transformInterface, "anchorPoint");
	      Object.defineProperties(_thisLayerFunction, {
	        hasParent: {
	          get: function get() {
	            return elem2.hierarchy.length;
	          }
	        },
	        parent: {
	          get: function get() {
	            return elem2.hierarchy[0].layerInterface;
	          }
	        },
	        rotation: getDescriptor(transformInterface, "rotation"),
	        scale: getDescriptor(transformInterface, "scale"),
	        position: getDescriptor(transformInterface, "position"),
	        opacity: getDescriptor(transformInterface, "opacity"),
	        anchorPoint: anchorPointDescriptor,
	        anchor_point: anchorPointDescriptor,
	        transform: {
	          get: function get() {
	            return transformInterface;
	          }
	        },
	        active: {
	          get: function get() {
	            return elem2.isInRange;
	          }
	        }
	      });
	      _thisLayerFunction.startTime = elem2.data.st;
	      _thisLayerFunction.index = elem2.data.ind;
	      _thisLayerFunction.source = elem2.data.refId;
	      _thisLayerFunction.height = elem2.data.ty === 0 ? elem2.data.h : 100;
	      _thisLayerFunction.width = elem2.data.ty === 0 ? elem2.data.w : 100;
	      _thisLayerFunction.inPoint = elem2.data.ip / elem2.comp.globalData.frameRate;
	      _thisLayerFunction.outPoint = elem2.data.op / elem2.comp.globalData.frameRate;
	      _thisLayerFunction._name = elem2.data.nm;
	      _thisLayerFunction.registerMaskInterface = _registerMaskInterface;
	      _thisLayerFunction.registerEffectsInterface = _registerEffectsInterface;
	      return _thisLayerFunction;
	    };
	  }();
	  var propertyGroupFactory = /* @__PURE__ */ function() {
	    return function(interfaceFunction, parentPropertyGroup) {
	      return function(val2) {
	        val2 = val2 === void 0 ? 1 : val2;
	        if (val2 <= 0) {
	          return interfaceFunction;
	        }
	        return parentPropertyGroup(val2 - 1);
	      };
	    };
	  }();
	  var PropertyInterface = /* @__PURE__ */ function() {
	    return function(propertyName, propertyGroup) {
	      var interfaceFunction = {
	        _name: propertyName
	      };
	      function _propertyGroup(val2) {
	        val2 = val2 === void 0 ? 1 : val2;
	        if (val2 <= 0) {
	          return interfaceFunction;
	        }
	        return propertyGroup(val2 - 1);
	      }
	      return _propertyGroup;
	    };
	  }();
	  var EffectsExpressionInterface = /* @__PURE__ */ function() {
	    var ob2 = {
	      createEffectsInterface
	    };
	    function createEffectsInterface(elem2, propertyGroup) {
	      if (elem2.effectsManager) {
	        var effectElements = [];
	        var effectsData = elem2.data.ef;
	        var i;
	        var len = elem2.effectsManager.effectElements.length;
	        for (i = 0; i < len; i += 1) {
	          effectElements.push(createGroupInterface(effectsData[i], elem2.effectsManager.effectElements[i], propertyGroup, elem2));
	        }
	        var effects = elem2.data.ef || [];
	        var groupInterface = function groupInterface2(name2) {
	          i = 0;
	          len = effects.length;
	          while (i < len) {
	            if (name2 === effects[i].nm || name2 === effects[i].mn || name2 === effects[i].ix) {
	              return effectElements[i];
	            }
	            i += 1;
	          }
	          return null;
	        };
	        Object.defineProperty(groupInterface, "numProperties", {
	          get: function get() {
	            return effects.length;
	          }
	        });
	        return groupInterface;
	      }
	      return null;
	    }
	    function createGroupInterface(data2, elements, propertyGroup, elem2) {
	      function groupInterface(name2) {
	        var effects = data2.ef;
	        var i2 = 0;
	        var len2 = effects.length;
	        while (i2 < len2) {
	          if (name2 === effects[i2].nm || name2 === effects[i2].mn || name2 === effects[i2].ix) {
	            if (effects[i2].ty === 5) {
	              return effectElements[i2];
	            }
	            return effectElements[i2]();
	          }
	          i2 += 1;
	        }
	        throw new Error();
	      }
	      var _propertyGroup = propertyGroupFactory(groupInterface, propertyGroup);
	      var effectElements = [];
	      var i;
	      var len = data2.ef.length;
	      for (i = 0; i < len; i += 1) {
	        if (data2.ef[i].ty === 5) {
	          effectElements.push(createGroupInterface(data2.ef[i], elements.effectElements[i], elements.effectElements[i].propertyGroup, elem2));
	        } else {
	          effectElements.push(createValueInterface(elements.effectElements[i], data2.ef[i].ty, elem2, _propertyGroup));
	        }
	      }
	      if (data2.mn === "ADBE Color Control") {
	        Object.defineProperty(groupInterface, "color", {
	          get: function get() {
	            return effectElements[0]();
	          }
	        });
	      }
	      Object.defineProperties(groupInterface, {
	        numProperties: {
	          get: function get() {
	            return data2.np;
	          }
	        },
	        _name: {
	          value: data2.nm
	        },
	        propertyGroup: {
	          value: _propertyGroup
	        }
	      });
	      groupInterface.enabled = data2.en !== 0;
	      groupInterface.active = groupInterface.enabled;
	      return groupInterface;
	    }
	    function createValueInterface(element, type, elem2, propertyGroup) {
	      var expressionProperty = ExpressionPropertyInterface(element.p);
	      function interfaceFunction() {
	        if (type === 10) {
	          return elem2.comp.compInterface(element.p.v);
	        }
	        return expressionProperty();
	      }
	      if (element.p.setGroupProperty) {
	        element.p.setGroupProperty(PropertyInterface("", propertyGroup));
	      }
	      return interfaceFunction;
	    }
	    return ob2;
	  }();
	  var ShapePathInterface = /* @__PURE__ */ function() {
	    return function pathInterfaceFactory(shape, view, propertyGroup) {
	      var prop = view.sh;
	      function interfaceFunction(val2) {
	        if (val2 === "Shape" || val2 === "shape" || val2 === "Path" || val2 === "path" || val2 === "ADBE Vector Shape" || val2 === 2) {
	          return interfaceFunction.path;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      prop.setGroupProperty(PropertyInterface("Path", _propertyGroup));
	      Object.defineProperties(interfaceFunction, {
	        path: {
	          get: function get() {
	            if (prop.k) {
	              prop.getValue();
	            }
	            return prop;
	          }
	        },
	        shape: {
	          get: function get() {
	            if (prop.k) {
	              prop.getValue();
	            }
	            return prop;
	          }
	        },
	        _name: {
	          value: shape.nm
	        },
	        ix: {
	          value: shape.ix
	        },
	        propertyIndex: {
	          value: shape.ix
	        },
	        mn: {
	          value: shape.mn
	        },
	        propertyGroup: {
	          value: propertyGroup
	        }
	      });
	      return interfaceFunction;
	    };
	  }();
	  var ShapeExpressionInterface = /* @__PURE__ */ function() {
	    function iterateElements(shapes, view, propertyGroup) {
	      var arr = [];
	      var i;
	      var len = shapes ? shapes.length : 0;
	      for (i = 0; i < len; i += 1) {
	        if (shapes[i].ty === "gr") {
	          arr.push(groupInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "fl") {
	          arr.push(fillInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "st") {
	          arr.push(strokeInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "tm") {
	          arr.push(trimInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "tr") ; else if (shapes[i].ty === "el") {
	          arr.push(ellipseInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "sr") {
	          arr.push(starInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "sh") {
	          arr.push(ShapePathInterface(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "rc") {
	          arr.push(rectInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "rd") {
	          arr.push(roundedInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "rp") {
	          arr.push(repeaterInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else if (shapes[i].ty === "gf") {
	          arr.push(gradientFillInterfaceFactory(shapes[i], view[i], propertyGroup));
	        } else {
	          arr.push(defaultInterfaceFactory(shapes[i], view[i]));
	        }
	      }
	      return arr;
	    }
	    function contentsInterfaceFactory(shape, view, propertyGroup) {
	      var interfaces2;
	      var interfaceFunction = function _interfaceFunction(value2) {
	        var i = 0;
	        var len = interfaces2.length;
	        while (i < len) {
	          if (interfaces2[i]._name === value2 || interfaces2[i].mn === value2 || interfaces2[i].propertyIndex === value2 || interfaces2[i].ix === value2 || interfaces2[i].ind === value2) {
	            return interfaces2[i];
	          }
	          i += 1;
	        }
	        if (typeof value2 === "number") {
	          return interfaces2[value2 - 1];
	        }
	        return null;
	      };
	      interfaceFunction.propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      interfaces2 = iterateElements(shape.it, view.it, interfaceFunction.propertyGroup);
	      interfaceFunction.numProperties = interfaces2.length;
	      var transformInterface = transformInterfaceFactory(shape.it[shape.it.length - 1], view.it[view.it.length - 1], interfaceFunction.propertyGroup);
	      interfaceFunction.transform = transformInterface;
	      interfaceFunction.propertyIndex = shape.cix;
	      interfaceFunction._name = shape.nm;
	      return interfaceFunction;
	    }
	    function groupInterfaceFactory(shape, view, propertyGroup) {
	      var interfaceFunction = function _interfaceFunction(value2) {
	        switch (value2) {
	          case "ADBE Vectors Group":
	          case "Contents":
	          case 2:
	            return interfaceFunction.content;
	          default:
	            return interfaceFunction.transform;
	        }
	      };
	      interfaceFunction.propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      var content2 = contentsInterfaceFactory(shape, view, interfaceFunction.propertyGroup);
	      var transformInterface = transformInterfaceFactory(shape.it[shape.it.length - 1], view.it[view.it.length - 1], interfaceFunction.propertyGroup);
	      interfaceFunction.content = content2;
	      interfaceFunction.transform = transformInterface;
	      Object.defineProperty(interfaceFunction, "_name", {
	        get: function get() {
	          return shape.nm;
	        }
	      });
	      interfaceFunction.numProperties = shape.np;
	      interfaceFunction.propertyIndex = shape.ix;
	      interfaceFunction.nm = shape.nm;
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    function fillInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(val2) {
	        if (val2 === "Color" || val2 === "color") {
	          return interfaceFunction.color;
	        }
	        if (val2 === "Opacity" || val2 === "opacity") {
	          return interfaceFunction.opacity;
	        }
	        return null;
	      }
	      Object.defineProperties(interfaceFunction, {
	        color: {
	          get: ExpressionPropertyInterface(view.c)
	        },
	        opacity: {
	          get: ExpressionPropertyInterface(view.o)
	        },
	        _name: {
	          value: shape.nm
	        },
	        mn: {
	          value: shape.mn
	        }
	      });
	      view.c.setGroupProperty(PropertyInterface("Color", propertyGroup));
	      view.o.setGroupProperty(PropertyInterface("Opacity", propertyGroup));
	      return interfaceFunction;
	    }
	    function gradientFillInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(val2) {
	        if (val2 === "Start Point" || val2 === "start point") {
	          return interfaceFunction.startPoint;
	        }
	        if (val2 === "End Point" || val2 === "end point") {
	          return interfaceFunction.endPoint;
	        }
	        if (val2 === "Opacity" || val2 === "opacity") {
	          return interfaceFunction.opacity;
	        }
	        return null;
	      }
	      Object.defineProperties(interfaceFunction, {
	        startPoint: {
	          get: ExpressionPropertyInterface(view.s)
	        },
	        endPoint: {
	          get: ExpressionPropertyInterface(view.e)
	        },
	        opacity: {
	          get: ExpressionPropertyInterface(view.o)
	        },
	        type: {
	          get: function get() {
	            return "a";
	          }
	        },
	        _name: {
	          value: shape.nm
	        },
	        mn: {
	          value: shape.mn
	        }
	      });
	      view.s.setGroupProperty(PropertyInterface("Start Point", propertyGroup));
	      view.e.setGroupProperty(PropertyInterface("End Point", propertyGroup));
	      view.o.setGroupProperty(PropertyInterface("Opacity", propertyGroup));
	      return interfaceFunction;
	    }
	    function defaultInterfaceFactory() {
	      function interfaceFunction() {
	        return null;
	      }
	      return interfaceFunction;
	    }
	    function strokeInterfaceFactory(shape, view, propertyGroup) {
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      var _dashPropertyGroup = propertyGroupFactory(dashOb, _propertyGroup);
	      function addPropertyToDashOb(i2) {
	        Object.defineProperty(dashOb, shape.d[i2].nm, {
	          get: ExpressionPropertyInterface(view.d.dataProps[i2].p)
	        });
	      }
	      var i;
	      var len = shape.d ? shape.d.length : 0;
	      var dashOb = {};
	      for (i = 0; i < len; i += 1) {
	        addPropertyToDashOb(i);
	        view.d.dataProps[i].p.setGroupProperty(_dashPropertyGroup);
	      }
	      function interfaceFunction(val2) {
	        if (val2 === "Color" || val2 === "color") {
	          return interfaceFunction.color;
	        }
	        if (val2 === "Opacity" || val2 === "opacity") {
	          return interfaceFunction.opacity;
	        }
	        if (val2 === "Stroke Width" || val2 === "stroke width") {
	          return interfaceFunction.strokeWidth;
	        }
	        return null;
	      }
	      Object.defineProperties(interfaceFunction, {
	        color: {
	          get: ExpressionPropertyInterface(view.c)
	        },
	        opacity: {
	          get: ExpressionPropertyInterface(view.o)
	        },
	        strokeWidth: {
	          get: ExpressionPropertyInterface(view.w)
	        },
	        dash: {
	          get: function get() {
	            return dashOb;
	          }
	        },
	        _name: {
	          value: shape.nm
	        },
	        mn: {
	          value: shape.mn
	        }
	      });
	      view.c.setGroupProperty(PropertyInterface("Color", _propertyGroup));
	      view.o.setGroupProperty(PropertyInterface("Opacity", _propertyGroup));
	      view.w.setGroupProperty(PropertyInterface("Stroke Width", _propertyGroup));
	      return interfaceFunction;
	    }
	    function trimInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(val2) {
	        if (val2 === shape.e.ix || val2 === "End" || val2 === "end") {
	          return interfaceFunction.end;
	        }
	        if (val2 === shape.s.ix) {
	          return interfaceFunction.start;
	        }
	        if (val2 === shape.o.ix) {
	          return interfaceFunction.offset;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      interfaceFunction.propertyIndex = shape.ix;
	      view.s.setGroupProperty(PropertyInterface("Start", _propertyGroup));
	      view.e.setGroupProperty(PropertyInterface("End", _propertyGroup));
	      view.o.setGroupProperty(PropertyInterface("Offset", _propertyGroup));
	      interfaceFunction.propertyIndex = shape.ix;
	      interfaceFunction.propertyGroup = propertyGroup;
	      Object.defineProperties(interfaceFunction, {
	        start: {
	          get: ExpressionPropertyInterface(view.s)
	        },
	        end: {
	          get: ExpressionPropertyInterface(view.e)
	        },
	        offset: {
	          get: ExpressionPropertyInterface(view.o)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    function transformInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(value2) {
	        if (shape.a.ix === value2 || value2 === "Anchor Point") {
	          return interfaceFunction.anchorPoint;
	        }
	        if (shape.o.ix === value2 || value2 === "Opacity") {
	          return interfaceFunction.opacity;
	        }
	        if (shape.p.ix === value2 || value2 === "Position") {
	          return interfaceFunction.position;
	        }
	        if (shape.r.ix === value2 || value2 === "Rotation" || value2 === "ADBE Vector Rotation") {
	          return interfaceFunction.rotation;
	        }
	        if (shape.s.ix === value2 || value2 === "Scale") {
	          return interfaceFunction.scale;
	        }
	        if (shape.sk && shape.sk.ix === value2 || value2 === "Skew") {
	          return interfaceFunction.skew;
	        }
	        if (shape.sa && shape.sa.ix === value2 || value2 === "Skew Axis") {
	          return interfaceFunction.skewAxis;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      view.transform.mProps.o.setGroupProperty(PropertyInterface("Opacity", _propertyGroup));
	      view.transform.mProps.p.setGroupProperty(PropertyInterface("Position", _propertyGroup));
	      view.transform.mProps.a.setGroupProperty(PropertyInterface("Anchor Point", _propertyGroup));
	      view.transform.mProps.s.setGroupProperty(PropertyInterface("Scale", _propertyGroup));
	      view.transform.mProps.r.setGroupProperty(PropertyInterface("Rotation", _propertyGroup));
	      if (view.transform.mProps.sk) {
	        view.transform.mProps.sk.setGroupProperty(PropertyInterface("Skew", _propertyGroup));
	        view.transform.mProps.sa.setGroupProperty(PropertyInterface("Skew Angle", _propertyGroup));
	      }
	      view.transform.op.setGroupProperty(PropertyInterface("Opacity", _propertyGroup));
	      Object.defineProperties(interfaceFunction, {
	        opacity: {
	          get: ExpressionPropertyInterface(view.transform.mProps.o)
	        },
	        position: {
	          get: ExpressionPropertyInterface(view.transform.mProps.p)
	        },
	        anchorPoint: {
	          get: ExpressionPropertyInterface(view.transform.mProps.a)
	        },
	        scale: {
	          get: ExpressionPropertyInterface(view.transform.mProps.s)
	        },
	        rotation: {
	          get: ExpressionPropertyInterface(view.transform.mProps.r)
	        },
	        skew: {
	          get: ExpressionPropertyInterface(view.transform.mProps.sk)
	        },
	        skewAxis: {
	          get: ExpressionPropertyInterface(view.transform.mProps.sa)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.ty = "tr";
	      interfaceFunction.mn = shape.mn;
	      interfaceFunction.propertyGroup = propertyGroup;
	      return interfaceFunction;
	    }
	    function ellipseInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(value2) {
	        if (shape.p.ix === value2) {
	          return interfaceFunction.position;
	        }
	        if (shape.s.ix === value2) {
	          return interfaceFunction.size;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      interfaceFunction.propertyIndex = shape.ix;
	      var prop = view.sh.ty === "tm" ? view.sh.prop : view.sh;
	      prop.s.setGroupProperty(PropertyInterface("Size", _propertyGroup));
	      prop.p.setGroupProperty(PropertyInterface("Position", _propertyGroup));
	      Object.defineProperties(interfaceFunction, {
	        size: {
	          get: ExpressionPropertyInterface(prop.s)
	        },
	        position: {
	          get: ExpressionPropertyInterface(prop.p)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    function starInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(value2) {
	        if (shape.p.ix === value2) {
	          return interfaceFunction.position;
	        }
	        if (shape.r.ix === value2) {
	          return interfaceFunction.rotation;
	        }
	        if (shape.pt.ix === value2) {
	          return interfaceFunction.points;
	        }
	        if (shape.or.ix === value2 || value2 === "ADBE Vector Star Outer Radius") {
	          return interfaceFunction.outerRadius;
	        }
	        if (shape.os.ix === value2) {
	          return interfaceFunction.outerRoundness;
	        }
	        if (shape.ir && (shape.ir.ix === value2 || value2 === "ADBE Vector Star Inner Radius")) {
	          return interfaceFunction.innerRadius;
	        }
	        if (shape.is && shape.is.ix === value2) {
	          return interfaceFunction.innerRoundness;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      var prop = view.sh.ty === "tm" ? view.sh.prop : view.sh;
	      interfaceFunction.propertyIndex = shape.ix;
	      prop.or.setGroupProperty(PropertyInterface("Outer Radius", _propertyGroup));
	      prop.os.setGroupProperty(PropertyInterface("Outer Roundness", _propertyGroup));
	      prop.pt.setGroupProperty(PropertyInterface("Points", _propertyGroup));
	      prop.p.setGroupProperty(PropertyInterface("Position", _propertyGroup));
	      prop.r.setGroupProperty(PropertyInterface("Rotation", _propertyGroup));
	      if (shape.ir) {
	        prop.ir.setGroupProperty(PropertyInterface("Inner Radius", _propertyGroup));
	        prop.is.setGroupProperty(PropertyInterface("Inner Roundness", _propertyGroup));
	      }
	      Object.defineProperties(interfaceFunction, {
	        position: {
	          get: ExpressionPropertyInterface(prop.p)
	        },
	        rotation: {
	          get: ExpressionPropertyInterface(prop.r)
	        },
	        points: {
	          get: ExpressionPropertyInterface(prop.pt)
	        },
	        outerRadius: {
	          get: ExpressionPropertyInterface(prop.or)
	        },
	        outerRoundness: {
	          get: ExpressionPropertyInterface(prop.os)
	        },
	        innerRadius: {
	          get: ExpressionPropertyInterface(prop.ir)
	        },
	        innerRoundness: {
	          get: ExpressionPropertyInterface(prop.is)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    function rectInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(value2) {
	        if (shape.p.ix === value2) {
	          return interfaceFunction.position;
	        }
	        if (shape.r.ix === value2) {
	          return interfaceFunction.roundness;
	        }
	        if (shape.s.ix === value2 || value2 === "Size" || value2 === "ADBE Vector Rect Size") {
	          return interfaceFunction.size;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      var prop = view.sh.ty === "tm" ? view.sh.prop : view.sh;
	      interfaceFunction.propertyIndex = shape.ix;
	      prop.p.setGroupProperty(PropertyInterface("Position", _propertyGroup));
	      prop.s.setGroupProperty(PropertyInterface("Size", _propertyGroup));
	      prop.r.setGroupProperty(PropertyInterface("Rotation", _propertyGroup));
	      Object.defineProperties(interfaceFunction, {
	        position: {
	          get: ExpressionPropertyInterface(prop.p)
	        },
	        roundness: {
	          get: ExpressionPropertyInterface(prop.r)
	        },
	        size: {
	          get: ExpressionPropertyInterface(prop.s)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    function roundedInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(value2) {
	        if (shape.r.ix === value2 || value2 === "Round Corners 1") {
	          return interfaceFunction.radius;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      var prop = view;
	      interfaceFunction.propertyIndex = shape.ix;
	      prop.rd.setGroupProperty(PropertyInterface("Radius", _propertyGroup));
	      Object.defineProperties(interfaceFunction, {
	        radius: {
	          get: ExpressionPropertyInterface(prop.rd)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    function repeaterInterfaceFactory(shape, view, propertyGroup) {
	      function interfaceFunction(value2) {
	        if (shape.c.ix === value2 || value2 === "Copies") {
	          return interfaceFunction.copies;
	        }
	        if (shape.o.ix === value2 || value2 === "Offset") {
	          return interfaceFunction.offset;
	        }
	        return null;
	      }
	      var _propertyGroup = propertyGroupFactory(interfaceFunction, propertyGroup);
	      var prop = view;
	      interfaceFunction.propertyIndex = shape.ix;
	      prop.c.setGroupProperty(PropertyInterface("Copies", _propertyGroup));
	      prop.o.setGroupProperty(PropertyInterface("Offset", _propertyGroup));
	      Object.defineProperties(interfaceFunction, {
	        copies: {
	          get: ExpressionPropertyInterface(prop.c)
	        },
	        offset: {
	          get: ExpressionPropertyInterface(prop.o)
	        },
	        _name: {
	          value: shape.nm
	        }
	      });
	      interfaceFunction.mn = shape.mn;
	      return interfaceFunction;
	    }
	    return function(shapes, view, propertyGroup) {
	      var interfaces2;
	      function _interfaceFunction(value2) {
	        if (typeof value2 === "number") {
	          value2 = value2 === void 0 ? 1 : value2;
	          if (value2 === 0) {
	            return propertyGroup;
	          }
	          return interfaces2[value2 - 1];
	        }
	        var i = 0;
	        var len = interfaces2.length;
	        while (i < len) {
	          if (interfaces2[i]._name === value2) {
	            return interfaces2[i];
	          }
	          i += 1;
	        }
	        return null;
	      }
	      function parentGroupWrapper() {
	        return propertyGroup;
	      }
	      _interfaceFunction.propertyGroup = propertyGroupFactory(_interfaceFunction, parentGroupWrapper);
	      interfaces2 = iterateElements(shapes, view, _interfaceFunction.propertyGroup);
	      _interfaceFunction.numProperties = interfaces2.length;
	      _interfaceFunction._name = "Contents";
	      return _interfaceFunction;
	    };
	  }();
	  var TextExpressionInterface = /* @__PURE__ */ function() {
	    return function(elem2) {
	      var _sourceText;
	      function _thisLayerFunction(name2) {
	        switch (name2) {
	          case "ADBE Text Document":
	            return _thisLayerFunction.sourceText;
	          default:
	            return null;
	        }
	      }
	      Object.defineProperty(_thisLayerFunction, "sourceText", {
	        get: function get() {
	          elem2.textProperty.getValue();
	          var stringValue = elem2.textProperty.currentData.t;
	          if (!_sourceText || stringValue !== _sourceText.value) {
	            _sourceText = new String(stringValue);
	            _sourceText.value = stringValue || new String(stringValue);
	            Object.defineProperty(_sourceText, "style", {
	              get: function get2() {
	                return {
	                  fillColor: elem2.textProperty.currentData.fc
	                };
	              }
	            });
	          }
	          return _sourceText;
	        }
	      });
	      return _thisLayerFunction;
	    };
	  }();
	  function _typeof(o) {
	    "@babel/helpers - typeof";
	    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
	      return typeof o2;
	    } : function(o2) {
	      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
	    }, _typeof(o);
	  }
	  var FootageInterface = /* @__PURE__ */ function() {
	    var outlineInterfaceFactory = function outlineInterfaceFactory2(elem2) {
	      var currentPropertyName = "";
	      var currentProperty = elem2.getFootageData();
	      function init() {
	        currentPropertyName = "";
	        currentProperty = elem2.getFootageData();
	        return searchProperty;
	      }
	      function searchProperty(value2) {
	        if (currentProperty[value2]) {
	          currentPropertyName = value2;
	          currentProperty = currentProperty[value2];
	          if (_typeof(currentProperty) === "object") {
	            return searchProperty;
	          }
	          return currentProperty;
	        }
	        var propertyNameIndex = value2.indexOf(currentPropertyName);
	        if (propertyNameIndex !== -1) {
	          var index2 = parseInt(value2.substr(propertyNameIndex + currentPropertyName.length), 10);
	          currentProperty = currentProperty[index2];
	          if (_typeof(currentProperty) === "object") {
	            return searchProperty;
	          }
	          return currentProperty;
	        }
	        return "";
	      }
	      return init;
	    };
	    var dataInterfaceFactory = function dataInterfaceFactory2(elem2) {
	      function interfaceFunction(value2) {
	        if (value2 === "Outline") {
	          return interfaceFunction.outlineInterface();
	        }
	        return null;
	      }
	      interfaceFunction._name = "Outline";
	      interfaceFunction.outlineInterface = outlineInterfaceFactory(elem2);
	      return interfaceFunction;
	    };
	    return function(elem2) {
	      function _interfaceFunction(value2) {
	        if (value2 === "Data") {
	          return _interfaceFunction.dataInterface;
	        }
	        return null;
	      }
	      _interfaceFunction._name = "Data";
	      _interfaceFunction.dataInterface = dataInterfaceFactory(elem2);
	      return _interfaceFunction;
	    };
	  }();
	  var interfaces = {
	    layer: LayerExpressionInterface,
	    effects: EffectsExpressionInterface,
	    comp: CompExpressionInterface,
	    shape: ShapeExpressionInterface,
	    text: TextExpressionInterface,
	    footage: FootageInterface
	  };
	  function getInterface(type) {
	    return interfaces[type] || null;
	  }
	  var expressionHelpers = /* @__PURE__ */ function() {
	    function searchExpressions(elem2, data2, prop) {
	      if (data2.x) {
	        prop.k = true;
	        prop.x = true;
	        prop.initiateExpression = ExpressionManager.initiateExpression;
	        prop.effectsSequence.push(prop.initiateExpression(elem2, data2, prop).bind(prop));
	      }
	    }
	    function getValueAtTime(frameNum) {
	      frameNum *= this.elem.globalData.frameRate;
	      frameNum -= this.offsetTime;
	      if (frameNum !== this._cachingAtTime.lastFrame) {
	        this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < frameNum ? this._cachingAtTime.lastIndex : 0;
	        this._cachingAtTime.value = this.interpolateValue(frameNum, this._cachingAtTime);
	        this._cachingAtTime.lastFrame = frameNum;
	      }
	      return this._cachingAtTime.value;
	    }
	    function getSpeedAtTime(frameNum) {
	      var delta = -0.01;
	      var v1 = this.getValueAtTime(frameNum);
	      var v2 = this.getValueAtTime(frameNum + delta);
	      var speed = 0;
	      if (v1.length) {
	        var i;
	        for (i = 0; i < v1.length; i += 1) {
	          speed += Math.pow(v2[i] - v1[i], 2);
	        }
	        speed = Math.sqrt(speed) * 100;
	      } else {
	        speed = 0;
	      }
	      return speed;
	    }
	    function getVelocityAtTime(frameNum) {
	      if (this.vel !== void 0) {
	        return this.vel;
	      }
	      var delta = -1e-3;
	      var v1 = this.getValueAtTime(frameNum);
	      var v2 = this.getValueAtTime(frameNum + delta);
	      var velocity2;
	      if (v1.length) {
	        velocity2 = createTypedArray("float32", v1.length);
	        var i;
	        for (i = 0; i < v1.length; i += 1) {
	          velocity2[i] = (v2[i] - v1[i]) / delta;
	        }
	      } else {
	        velocity2 = (v2 - v1) / delta;
	      }
	      return velocity2;
	    }
	    function getStaticValueAtTime() {
	      return this.pv;
	    }
	    function setGroupProperty(propertyGroup) {
	      this.propertyGroup = propertyGroup;
	    }
	    return {
	      searchExpressions,
	      getSpeedAtTime,
	      getVelocityAtTime,
	      getValueAtTime,
	      getStaticValueAtTime,
	      setGroupProperty
	    };
	  }();
	  function addPropertyDecorator() {
	    function loopOut2(type, duration, durationFlag) {
	      if (!this.k || !this.keyframes) {
	        return this.pv;
	      }
	      type = type ? type.toLowerCase() : "";
	      var currentFrame = this.comp.renderedFrame;
	      var keyframes = this.keyframes;
	      var lastKeyFrame = keyframes[keyframes.length - 1].t;
	      if (currentFrame <= lastKeyFrame) {
	        return this.pv;
	      }
	      var cycleDuration;
	      var firstKeyFrame;
	      if (!durationFlag) {
	        if (!duration || duration > keyframes.length - 1) {
	          duration = keyframes.length - 1;
	        }
	        firstKeyFrame = keyframes[keyframes.length - 1 - duration].t;
	        cycleDuration = lastKeyFrame - firstKeyFrame;
	      } else {
	        if (!duration) {
	          cycleDuration = Math.max(0, lastKeyFrame - this.elem.data.ip);
	        } else {
	          cycleDuration = Math.abs(lastKeyFrame - this.elem.comp.globalData.frameRate * duration);
	        }
	        firstKeyFrame = lastKeyFrame - cycleDuration;
	      }
	      var i;
	      var len;
	      var ret;
	      if (type === "pingpong") {
	        var iterations = Math.floor((currentFrame - firstKeyFrame) / cycleDuration);
	        if (iterations % 2 !== 0) {
	          return this.getValueAtTime((cycleDuration - (currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
	        }
	      } else if (type === "offset") {
	        var initV = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
	        var endV = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
	        var current = this.getValueAtTime(((currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
	        var repeats = Math.floor((currentFrame - firstKeyFrame) / cycleDuration);
	        if (this.pv.length) {
	          ret = new Array(initV.length);
	          len = ret.length;
	          for (i = 0; i < len; i += 1) {
	            ret[i] = (endV[i] - initV[i]) * repeats + current[i];
	          }
	          return ret;
	        }
	        return (endV - initV) * repeats + current;
	      } else if (type === "continue") {
	        var lastValue = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
	        var nextLastValue = this.getValueAtTime((lastKeyFrame - 1e-3) / this.comp.globalData.frameRate, 0);
	        if (this.pv.length) {
	          ret = new Array(lastValue.length);
	          len = ret.length;
	          for (i = 0; i < len; i += 1) {
	            ret[i] = lastValue[i] + (lastValue[i] - nextLastValue[i]) * ((currentFrame - lastKeyFrame) / this.comp.globalData.frameRate) / 5e-4;
	          }
	          return ret;
	        }
	        return lastValue + (lastValue - nextLastValue) * ((currentFrame - lastKeyFrame) / 1e-3);
	      }
	      return this.getValueAtTime(((currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
	    }
	    function loopIn2(type, duration, durationFlag) {
	      if (!this.k) {
	        return this.pv;
	      }
	      type = type ? type.toLowerCase() : "";
	      var currentFrame = this.comp.renderedFrame;
	      var keyframes = this.keyframes;
	      var firstKeyFrame = keyframes[0].t;
	      if (currentFrame >= firstKeyFrame) {
	        return this.pv;
	      }
	      var cycleDuration;
	      var lastKeyFrame;
	      if (!durationFlag) {
	        if (!duration || duration > keyframes.length - 1) {
	          duration = keyframes.length - 1;
	        }
	        lastKeyFrame = keyframes[duration].t;
	        cycleDuration = lastKeyFrame - firstKeyFrame;
	      } else {
	        if (!duration) {
	          cycleDuration = Math.max(0, this.elem.data.op - firstKeyFrame);
	        } else {
	          cycleDuration = Math.abs(this.elem.comp.globalData.frameRate * duration);
	        }
	        lastKeyFrame = firstKeyFrame + cycleDuration;
	      }
	      var i;
	      var len;
	      var ret;
	      if (type === "pingpong") {
	        var iterations = Math.floor((firstKeyFrame - currentFrame) / cycleDuration);
	        if (iterations % 2 === 0) {
	          return this.getValueAtTime(((firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
	        }
	      } else if (type === "offset") {
	        var initV = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
	        var endV = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
	        var current = this.getValueAtTime((cycleDuration - (firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
	        var repeats = Math.floor((firstKeyFrame - currentFrame) / cycleDuration) + 1;
	        if (this.pv.length) {
	          ret = new Array(initV.length);
	          len = ret.length;
	          for (i = 0; i < len; i += 1) {
	            ret[i] = current[i] - (endV[i] - initV[i]) * repeats;
	          }
	          return ret;
	        }
	        return current - (endV - initV) * repeats;
	      } else if (type === "continue") {
	        var firstValue = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
	        var nextFirstValue = this.getValueAtTime((firstKeyFrame + 1e-3) / this.comp.globalData.frameRate, 0);
	        if (this.pv.length) {
	          ret = new Array(firstValue.length);
	          len = ret.length;
	          for (i = 0; i < len; i += 1) {
	            ret[i] = firstValue[i] + (firstValue[i] - nextFirstValue[i]) * (firstKeyFrame - currentFrame) / 1e-3;
	          }
	          return ret;
	        }
	        return firstValue + (firstValue - nextFirstValue) * (firstKeyFrame - currentFrame) / 1e-3;
	      }
	      return this.getValueAtTime((cycleDuration - ((firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame)) / this.comp.globalData.frameRate, 0);
	    }
	    function smooth2(width2, samples) {
	      if (!this.k) {
	        return this.pv;
	      }
	      width2 = (width2 || 0.4) * 0.5;
	      samples = Math.floor(samples || 5);
	      if (samples <= 1) {
	        return this.pv;
	      }
	      var currentTime = this.comp.renderedFrame / this.comp.globalData.frameRate;
	      var initFrame2 = currentTime - width2;
	      var endFrame = currentTime + width2;
	      var sampleFrequency = samples > 1 ? (endFrame - initFrame2) / (samples - 1) : 1;
	      var i = 0;
	      var j = 0;
	      var value2;
	      if (this.pv.length) {
	        value2 = createTypedArray("float32", this.pv.length);
	      } else {
	        value2 = 0;
	      }
	      var sampleValue;
	      while (i < samples) {
	        sampleValue = this.getValueAtTime(initFrame2 + i * sampleFrequency);
	        if (this.pv.length) {
	          for (j = 0; j < this.pv.length; j += 1) {
	            value2[j] += sampleValue[j];
	          }
	        } else {
	          value2 += sampleValue;
	        }
	        i += 1;
	      }
	      if (this.pv.length) {
	        for (j = 0; j < this.pv.length; j += 1) {
	          value2[j] /= samples;
	        }
	      } else {
	        value2 /= samples;
	      }
	      return value2;
	    }
	    function getTransformValueAtTime(time2) {
	      if (!this._transformCachingAtTime) {
	        this._transformCachingAtTime = {
	          v: new Matrix()
	        };
	      }
	      var matrix = this._transformCachingAtTime.v;
	      matrix.cloneFromProps(this.pre.props);
	      if (this.appliedTransformations < 1) {
	        var anchor = this.a.getValueAtTime(time2);
	        matrix.translate(-anchor[0] * this.a.mult, -anchor[1] * this.a.mult, anchor[2] * this.a.mult);
	      }
	      if (this.appliedTransformations < 2) {
	        var scale2 = this.s.getValueAtTime(time2);
	        matrix.scale(scale2[0] * this.s.mult, scale2[1] * this.s.mult, scale2[2] * this.s.mult);
	      }
	      if (this.sk && this.appliedTransformations < 3) {
	        var skew = this.sk.getValueAtTime(time2);
	        var skewAxis = this.sa.getValueAtTime(time2);
	        matrix.skewFromAxis(-skew * this.sk.mult, skewAxis * this.sa.mult);
	      }
	      if (this.r && this.appliedTransformations < 4) {
	        var rotation2 = this.r.getValueAtTime(time2);
	        matrix.rotate(-rotation2 * this.r.mult);
	      } else if (!this.r && this.appliedTransformations < 4) {
	        var rotationZ = this.rz.getValueAtTime(time2);
	        var rotationY = this.ry.getValueAtTime(time2);
	        var rotationX = this.rx.getValueAtTime(time2);
	        var orientation = this.or.getValueAtTime(time2);
	        matrix.rotateZ(-rotationZ * this.rz.mult).rotateY(rotationY * this.ry.mult).rotateX(rotationX * this.rx.mult).rotateZ(-orientation[2] * this.or.mult).rotateY(orientation[1] * this.or.mult).rotateX(orientation[0] * this.or.mult);
	      }
	      if (this.data.p && this.data.p.s) {
	        var positionX = this.px.getValueAtTime(time2);
	        var positionY = this.py.getValueAtTime(time2);
	        if (this.data.p.z) {
	          var positionZ = this.pz.getValueAtTime(time2);
	          matrix.translate(positionX * this.px.mult, positionY * this.py.mult, -positionZ * this.pz.mult);
	        } else {
	          matrix.translate(positionX * this.px.mult, positionY * this.py.mult, 0);
	        }
	      } else {
	        var position2 = this.p.getValueAtTime(time2);
	        matrix.translate(position2[0] * this.p.mult, position2[1] * this.p.mult, -position2[2] * this.p.mult);
	      }
	      return matrix;
	    }
	    function getTransformStaticValueAtTime() {
	      return this.v.clone(new Matrix());
	    }
	    var getTransformProperty = TransformPropertyFactory.getTransformProperty;
	    TransformPropertyFactory.getTransformProperty = function(elem2, data2, container) {
	      var prop = getTransformProperty(elem2, data2, container);
	      if (prop.dynamicProperties.length) {
	        prop.getValueAtTime = getTransformValueAtTime.bind(prop);
	      } else {
	        prop.getValueAtTime = getTransformStaticValueAtTime.bind(prop);
	      }
	      prop.setGroupProperty = expressionHelpers.setGroupProperty;
	      return prop;
	    };
	    var propertyGetProp = PropertyFactory.getProp;
	    PropertyFactory.getProp = function(elem2, data2, type, mult, container) {
	      var prop = propertyGetProp(elem2, data2, type, mult, container);
	      if (prop.kf) {
	        prop.getValueAtTime = expressionHelpers.getValueAtTime.bind(prop);
	      } else {
	        prop.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(prop);
	      }
	      prop.setGroupProperty = expressionHelpers.setGroupProperty;
	      prop.loopOut = loopOut2;
	      prop.loopIn = loopIn2;
	      prop.smooth = smooth2;
	      prop.getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(prop);
	      prop.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(prop);
	      prop.numKeys = data2.a === 1 ? data2.k.length : 0;
	      prop.propertyIndex = data2.ix;
	      var value2 = 0;
	      if (type !== 0) {
	        value2 = createTypedArray("float32", data2.a === 1 ? data2.k[0].s.length : data2.k.length);
	      }
	      prop._cachingAtTime = {
	        lastFrame: initialDefaultFrame,
	        lastIndex: 0,
	        value: value2
	      };
	      expressionHelpers.searchExpressions(elem2, data2, prop);
	      if (prop.k) {
	        container.addDynamicProperty(prop);
	      }
	      return prop;
	    };
	    function getShapeValueAtTime(frameNum) {
	      if (!this._cachingAtTime) {
	        this._cachingAtTime = {
	          shapeValue: shapePool.clone(this.pv),
	          lastIndex: 0,
	          lastTime: initialDefaultFrame
	        };
	      }
	      frameNum *= this.elem.globalData.frameRate;
	      frameNum -= this.offsetTime;
	      if (frameNum !== this._cachingAtTime.lastTime) {
	        this._cachingAtTime.lastIndex = this._cachingAtTime.lastTime < frameNum ? this._caching.lastIndex : 0;
	        this._cachingAtTime.lastTime = frameNum;
	        this.interpolateShape(frameNum, this._cachingAtTime.shapeValue, this._cachingAtTime);
	      }
	      return this._cachingAtTime.shapeValue;
	    }
	    var ShapePropertyConstructorFunction = ShapePropertyFactory.getConstructorFunction();
	    var KeyframedShapePropertyConstructorFunction = ShapePropertyFactory.getKeyframedConstructorFunction();
	    function ShapeExpressions() {
	    }
	    ShapeExpressions.prototype = {
	      vertices: function vertices(prop, time2) {
	        if (this.k) {
	          this.getValue();
	        }
	        var shapePath = this.v;
	        if (time2 !== void 0) {
	          shapePath = this.getValueAtTime(time2, 0);
	        }
	        var i;
	        var len = shapePath._length;
	        var vertices2 = shapePath[prop];
	        var points = shapePath.v;
	        var arr = createSizedArray(len);
	        for (i = 0; i < len; i += 1) {
	          if (prop === "i" || prop === "o") {
	            arr[i] = [vertices2[i][0] - points[i][0], vertices2[i][1] - points[i][1]];
	          } else {
	            arr[i] = [vertices2[i][0], vertices2[i][1]];
	          }
	        }
	        return arr;
	      },
	      points: function points(time2) {
	        return this.vertices("v", time2);
	      },
	      inTangents: function inTangents(time2) {
	        return this.vertices("i", time2);
	      },
	      outTangents: function outTangents(time2) {
	        return this.vertices("o", time2);
	      },
	      isClosed: function isClosed() {
	        return this.v.c;
	      },
	      pointOnPath: function pointOnPath(perc, time2) {
	        var shapePath = this.v;
	        if (time2 !== void 0) {
	          shapePath = this.getValueAtTime(time2, 0);
	        }
	        if (!this._segmentsLength) {
	          this._segmentsLength = bez.getSegmentsLength(shapePath);
	        }
	        var segmentsLength = this._segmentsLength;
	        var lengths = segmentsLength.lengths;
	        var lengthPos = segmentsLength.totalLength * perc;
	        var i = 0;
	        var len = lengths.length;
	        var accumulatedLength = 0;
	        var pt;
	        while (i < len) {
	          if (accumulatedLength + lengths[i].addedLength > lengthPos) {
	            var initIndex = i;
	            var endIndex = shapePath.c && i === len - 1 ? 0 : i + 1;
	            var segmentPerc = (lengthPos - accumulatedLength) / lengths[i].addedLength;
	            pt = bez.getPointInSegment(shapePath.v[initIndex], shapePath.v[endIndex], shapePath.o[initIndex], shapePath.i[endIndex], segmentPerc, lengths[i]);
	            break;
	          } else {
	            accumulatedLength += lengths[i].addedLength;
	          }
	          i += 1;
	        }
	        if (!pt) {
	          pt = shapePath.c ? [shapePath.v[0][0], shapePath.v[0][1]] : [shapePath.v[shapePath._length - 1][0], shapePath.v[shapePath._length - 1][1]];
	        }
	        return pt;
	      },
	      vectorOnPath: function vectorOnPath(perc, time2, vectorType) {
	        if (perc == 1) {
	          perc = this.v.c;
	        } else if (perc == 0) {
	          perc = 0.999;
	        }
	        var pt1 = this.pointOnPath(perc, time2);
	        var pt2 = this.pointOnPath(perc + 1e-3, time2);
	        var xLength = pt2[0] - pt1[0];
	        var yLength = pt2[1] - pt1[1];
	        var magnitude = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2));
	        if (magnitude === 0) {
	          return [0, 0];
	        }
	        var unitVector = vectorType === "tangent" ? [xLength / magnitude, yLength / magnitude] : [-yLength / magnitude, xLength / magnitude];
	        return unitVector;
	      },
	      tangentOnPath: function tangentOnPath(perc, time2) {
	        return this.vectorOnPath(perc, time2, "tangent");
	      },
	      normalOnPath: function normalOnPath(perc, time2) {
	        return this.vectorOnPath(perc, time2, "normal");
	      },
	      setGroupProperty: expressionHelpers.setGroupProperty,
	      getValueAtTime: expressionHelpers.getStaticValueAtTime
	    };
	    extendPrototype([ShapeExpressions], ShapePropertyConstructorFunction);
	    extendPrototype([ShapeExpressions], KeyframedShapePropertyConstructorFunction);
	    KeyframedShapePropertyConstructorFunction.prototype.getValueAtTime = getShapeValueAtTime;
	    KeyframedShapePropertyConstructorFunction.prototype.initiateExpression = ExpressionManager.initiateExpression;
	    var propertyGetShapeProp = ShapePropertyFactory.getShapeProp;
	    ShapePropertyFactory.getShapeProp = function(elem2, data2, type, arr, trims) {
	      var prop = propertyGetShapeProp(elem2, data2, type, arr, trims);
	      prop.propertyIndex = data2.ix;
	      prop.lock = false;
	      if (type === 3) {
	        expressionHelpers.searchExpressions(elem2, data2.pt, prop);
	      } else if (type === 4) {
	        expressionHelpers.searchExpressions(elem2, data2.ks, prop);
	      }
	      if (prop.k) {
	        elem2.addDynamicProperty(prop);
	      }
	      return prop;
	    };
	  }
	  function initialize$1() {
	    addPropertyDecorator();
	  }
	  function addDecorator() {
	    function searchExpressions() {
	      if (this.data.d.x) {
	        this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this);
	        this.addEffect(this.getExpressionValue.bind(this));
	        return true;
	      }
	      return null;
	    }
	    TextProperty.prototype.getExpressionValue = function(currentValue, text2) {
	      var newValue = this.calculateExpression(text2);
	      if (currentValue.t !== newValue) {
	        var newData = {};
	        this.copyData(newData, currentValue);
	        newData.t = newValue.toString();
	        newData.__complete = false;
	        return newData;
	      }
	      return currentValue;
	    };
	    TextProperty.prototype.searchProperty = function() {
	      var isKeyframed = this.searchKeyframes();
	      var hasExpressions = this.searchExpressions();
	      this.kf = isKeyframed || hasExpressions;
	      return this.kf;
	    };
	    TextProperty.prototype.searchExpressions = searchExpressions;
	  }
	  function initialize() {
	    addDecorator();
	  }
	  function SVGComposableEffect() {
	  }
	  SVGComposableEffect.prototype = {
	    createMergeNode: function createMergeNode(resultId, ins) {
	      var feMerge = createNS("feMerge");
	      feMerge.setAttribute("result", resultId);
	      var feMergeNode;
	      var i;
	      for (i = 0; i < ins.length; i += 1) {
	        feMergeNode = createNS("feMergeNode");
	        feMergeNode.setAttribute("in", ins[i]);
	        feMerge.appendChild(feMergeNode);
	        feMerge.appendChild(feMergeNode);
	      }
	      return feMerge;
	    }
	  };
	  var linearFilterValue = "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0";
	  function SVGTintFilter(filter, filterManager, elem2, id, source) {
	    this.filterManager = filterManager;
	    var feColorMatrix = createNS("feColorMatrix");
	    feColorMatrix.setAttribute("type", "matrix");
	    feColorMatrix.setAttribute("color-interpolation-filters", "linearRGB");
	    feColorMatrix.setAttribute("values", linearFilterValue + " 1 0");
	    this.linearFilter = feColorMatrix;
	    feColorMatrix.setAttribute("result", id + "_tint_1");
	    filter.appendChild(feColorMatrix);
	    feColorMatrix = createNS("feColorMatrix");
	    feColorMatrix.setAttribute("type", "matrix");
	    feColorMatrix.setAttribute("color-interpolation-filters", "sRGB");
	    feColorMatrix.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0");
	    feColorMatrix.setAttribute("result", id + "_tint_2");
	    filter.appendChild(feColorMatrix);
	    this.matrixFilter = feColorMatrix;
	    var feMerge = this.createMergeNode(id, [source, id + "_tint_1", id + "_tint_2"]);
	    filter.appendChild(feMerge);
	  }
	  extendPrototype([SVGComposableEffect], SVGTintFilter);
	  SVGTintFilter.prototype.renderFrame = function(forceRender) {
	    if (forceRender || this.filterManager._mdf) {
	      var colorBlack = this.filterManager.effectElements[0].p.v;
	      var colorWhite = this.filterManager.effectElements[1].p.v;
	      var opacity = this.filterManager.effectElements[2].p.v / 100;
	      this.linearFilter.setAttribute("values", linearFilterValue + " " + opacity + " 0");
	      this.matrixFilter.setAttribute("values", colorWhite[0] - colorBlack[0] + " 0 0 0 " + colorBlack[0] + " " + (colorWhite[1] - colorBlack[1]) + " 0 0 0 " + colorBlack[1] + " " + (colorWhite[2] - colorBlack[2]) + " 0 0 0 " + colorBlack[2] + " 0 0 0 1 0");
	    }
	  };
	  function SVGFillFilter(filter, filterManager, elem2, id) {
	    this.filterManager = filterManager;
	    var feColorMatrix = createNS("feColorMatrix");
	    feColorMatrix.setAttribute("type", "matrix");
	    feColorMatrix.setAttribute("color-interpolation-filters", "sRGB");
	    feColorMatrix.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0");
	    feColorMatrix.setAttribute("result", id);
	    filter.appendChild(feColorMatrix);
	    this.matrixFilter = feColorMatrix;
	  }
	  SVGFillFilter.prototype.renderFrame = function(forceRender) {
	    if (forceRender || this.filterManager._mdf) {
	      var color = this.filterManager.effectElements[2].p.v;
	      var opacity = this.filterManager.effectElements[6].p.v;
	      this.matrixFilter.setAttribute("values", "0 0 0 0 " + color[0] + " 0 0 0 0 " + color[1] + " 0 0 0 0 " + color[2] + " 0 0 0 " + opacity + " 0");
	    }
	  };
	  function SVGStrokeEffect(fil, filterManager, elem2) {
	    this.initialized = false;
	    this.filterManager = filterManager;
	    this.elem = elem2;
	    this.paths = [];
	  }
	  SVGStrokeEffect.prototype.initialize = function() {
	    var elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
	    var path;
	    var groupPath;
	    var i;
	    var len;
	    if (this.filterManager.effectElements[1].p.v === 1) {
	      len = this.elem.maskManager.masksProperties.length;
	      i = 0;
	    } else {
	      i = this.filterManager.effectElements[0].p.v - 1;
	      len = i + 1;
	    }
	    groupPath = createNS("g");
	    groupPath.setAttribute("fill", "none");
	    groupPath.setAttribute("stroke-linecap", "round");
	    groupPath.setAttribute("stroke-dashoffset", 1);
	    for (i; i < len; i += 1) {
	      path = createNS("path");
	      groupPath.appendChild(path);
	      this.paths.push({
	        p: path,
	        m: i
	      });
	    }
	    if (this.filterManager.effectElements[10].p.v === 3) {
	      var mask2 = createNS("mask");
	      var id = createElementID();
	      mask2.setAttribute("id", id);
	      mask2.setAttribute("mask-type", "alpha");
	      mask2.appendChild(groupPath);
	      this.elem.globalData.defs.appendChild(mask2);
	      var g = createNS("g");
	      g.setAttribute("mask", "url(" + getLocationHref() + "#" + id + ")");
	      while (elemChildren[0]) {
	        g.appendChild(elemChildren[0]);
	      }
	      this.elem.layerElement.appendChild(g);
	      this.masker = mask2;
	      groupPath.setAttribute("stroke", "#fff");
	    } else if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
	      if (this.filterManager.effectElements[10].p.v === 2) {
	        elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
	        while (elemChildren.length) {
	          this.elem.layerElement.removeChild(elemChildren[0]);
	        }
	      }
	      this.elem.layerElement.appendChild(groupPath);
	      this.elem.layerElement.removeAttribute("mask");
	      groupPath.setAttribute("stroke", "#fff");
	    }
	    this.initialized = true;
	    this.pathMasker = groupPath;
	  };
	  SVGStrokeEffect.prototype.renderFrame = function(forceRender) {
	    if (!this.initialized) {
	      this.initialize();
	    }
	    var i;
	    var len = this.paths.length;
	    var mask2;
	    var path;
	    for (i = 0; i < len; i += 1) {
	      if (this.paths[i].m !== -1) {
	        mask2 = this.elem.maskManager.viewData[this.paths[i].m];
	        path = this.paths[i].p;
	        if (forceRender || this.filterManager._mdf || mask2.prop._mdf) {
	          path.setAttribute("d", mask2.lastPath);
	        }
	        if (forceRender || this.filterManager.effectElements[9].p._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager.effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || mask2.prop._mdf) {
	          var dasharrayValue;
	          if (this.filterManager.effectElements[7].p.v !== 0 || this.filterManager.effectElements[8].p.v !== 100) {
	            var s = Math.min(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01;
	            var e = Math.max(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01;
	            var l = path.getTotalLength();
	            dasharrayValue = "0 0 0 " + l * s + " ";
	            var lineLength = l * (e - s);
	            var segment = 1 + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01;
	            var units = Math.floor(lineLength / segment);
	            var j;
	            for (j = 0; j < units; j += 1) {
	              dasharrayValue += "1 " + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01 + " ";
	            }
	            dasharrayValue += "0 " + l * 10 + " 0 0";
	          } else {
	            dasharrayValue = "1 " + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01;
	          }
	          path.setAttribute("stroke-dasharray", dasharrayValue);
	        }
	      }
	    }
	    if (forceRender || this.filterManager.effectElements[4].p._mdf) {
	      this.pathMasker.setAttribute("stroke-width", this.filterManager.effectElements[4].p.v * 2);
	    }
	    if (forceRender || this.filterManager.effectElements[6].p._mdf) {
	      this.pathMasker.setAttribute("opacity", this.filterManager.effectElements[6].p.v);
	    }
	    if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
	      if (forceRender || this.filterManager.effectElements[3].p._mdf) {
	        var color = this.filterManager.effectElements[3].p.v;
	        this.pathMasker.setAttribute("stroke", "rgb(" + bmFloor(color[0] * 255) + "," + bmFloor(color[1] * 255) + "," + bmFloor(color[2] * 255) + ")");
	      }
	    }
	  };
	  function SVGTritoneFilter(filter, filterManager, elem2, id) {
	    this.filterManager = filterManager;
	    var feColorMatrix = createNS("feColorMatrix");
	    feColorMatrix.setAttribute("type", "matrix");
	    feColorMatrix.setAttribute("color-interpolation-filters", "linearRGB");
	    feColorMatrix.setAttribute("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");
	    filter.appendChild(feColorMatrix);
	    var feComponentTransfer = createNS("feComponentTransfer");
	    feComponentTransfer.setAttribute("color-interpolation-filters", "sRGB");
	    feComponentTransfer.setAttribute("result", id);
	    this.matrixFilter = feComponentTransfer;
	    var feFuncR = createNS("feFuncR");
	    feFuncR.setAttribute("type", "table");
	    feComponentTransfer.appendChild(feFuncR);
	    this.feFuncR = feFuncR;
	    var feFuncG = createNS("feFuncG");
	    feFuncG.setAttribute("type", "table");
	    feComponentTransfer.appendChild(feFuncG);
	    this.feFuncG = feFuncG;
	    var feFuncB = createNS("feFuncB");
	    feFuncB.setAttribute("type", "table");
	    feComponentTransfer.appendChild(feFuncB);
	    this.feFuncB = feFuncB;
	    filter.appendChild(feComponentTransfer);
	  }
	  SVGTritoneFilter.prototype.renderFrame = function(forceRender) {
	    if (forceRender || this.filterManager._mdf) {
	      var color1 = this.filterManager.effectElements[0].p.v;
	      var color2 = this.filterManager.effectElements[1].p.v;
	      var color3 = this.filterManager.effectElements[2].p.v;
	      var tableR = color3[0] + " " + color2[0] + " " + color1[0];
	      var tableG = color3[1] + " " + color2[1] + " " + color1[1];
	      var tableB = color3[2] + " " + color2[2] + " " + color1[2];
	      this.feFuncR.setAttribute("tableValues", tableR);
	      this.feFuncG.setAttribute("tableValues", tableG);
	      this.feFuncB.setAttribute("tableValues", tableB);
	    }
	  };
	  function SVGProLevelsFilter(filter, filterManager, elem2, id) {
	    this.filterManager = filterManager;
	    var effectElements = this.filterManager.effectElements;
	    var feComponentTransfer = createNS("feComponentTransfer");
	    if (effectElements[10].p.k || effectElements[10].p.v !== 0 || effectElements[11].p.k || effectElements[11].p.v !== 1 || effectElements[12].p.k || effectElements[12].p.v !== 1 || effectElements[13].p.k || effectElements[13].p.v !== 0 || effectElements[14].p.k || effectElements[14].p.v !== 1) {
	      this.feFuncR = this.createFeFunc("feFuncR", feComponentTransfer);
	    }
	    if (effectElements[17].p.k || effectElements[17].p.v !== 0 || effectElements[18].p.k || effectElements[18].p.v !== 1 || effectElements[19].p.k || effectElements[19].p.v !== 1 || effectElements[20].p.k || effectElements[20].p.v !== 0 || effectElements[21].p.k || effectElements[21].p.v !== 1) {
	      this.feFuncG = this.createFeFunc("feFuncG", feComponentTransfer);
	    }
	    if (effectElements[24].p.k || effectElements[24].p.v !== 0 || effectElements[25].p.k || effectElements[25].p.v !== 1 || effectElements[26].p.k || effectElements[26].p.v !== 1 || effectElements[27].p.k || effectElements[27].p.v !== 0 || effectElements[28].p.k || effectElements[28].p.v !== 1) {
	      this.feFuncB = this.createFeFunc("feFuncB", feComponentTransfer);
	    }
	    if (effectElements[31].p.k || effectElements[31].p.v !== 0 || effectElements[32].p.k || effectElements[32].p.v !== 1 || effectElements[33].p.k || effectElements[33].p.v !== 1 || effectElements[34].p.k || effectElements[34].p.v !== 0 || effectElements[35].p.k || effectElements[35].p.v !== 1) {
	      this.feFuncA = this.createFeFunc("feFuncA", feComponentTransfer);
	    }
	    if (this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA) {
	      feComponentTransfer.setAttribute("color-interpolation-filters", "sRGB");
	      filter.appendChild(feComponentTransfer);
	    }
	    if (effectElements[3].p.k || effectElements[3].p.v !== 0 || effectElements[4].p.k || effectElements[4].p.v !== 1 || effectElements[5].p.k || effectElements[5].p.v !== 1 || effectElements[6].p.k || effectElements[6].p.v !== 0 || effectElements[7].p.k || effectElements[7].p.v !== 1) {
	      feComponentTransfer = createNS("feComponentTransfer");
	      feComponentTransfer.setAttribute("color-interpolation-filters", "sRGB");
	      feComponentTransfer.setAttribute("result", id);
	      filter.appendChild(feComponentTransfer);
	      this.feFuncRComposed = this.createFeFunc("feFuncR", feComponentTransfer);
	      this.feFuncGComposed = this.createFeFunc("feFuncG", feComponentTransfer);
	      this.feFuncBComposed = this.createFeFunc("feFuncB", feComponentTransfer);
	    }
	  }
	  SVGProLevelsFilter.prototype.createFeFunc = function(type, feComponentTransfer) {
	    var feFunc = createNS(type);
	    feFunc.setAttribute("type", "table");
	    feComponentTransfer.appendChild(feFunc);
	    return feFunc;
	  };
	  SVGProLevelsFilter.prototype.getTableValue = function(inputBlack, inputWhite, gamma, outputBlack, outputWhite) {
	    var cnt = 0;
	    var segments = 256;
	    var perc;
	    var min = Math.min(inputBlack, inputWhite);
	    var max = Math.max(inputBlack, inputWhite);
	    var table = Array.call(null, {
	      length: segments
	    });
	    var colorValue;
	    var pos = 0;
	    var outputDelta = outputWhite - outputBlack;
	    var inputDelta = inputWhite - inputBlack;
	    while (cnt <= 256) {
	      perc = cnt / 256;
	      if (perc <= min) {
	        colorValue = inputDelta < 0 ? outputWhite : outputBlack;
	      } else if (perc >= max) {
	        colorValue = inputDelta < 0 ? outputBlack : outputWhite;
	      } else {
	        colorValue = outputBlack + outputDelta * Math.pow((perc - inputBlack) / inputDelta, 1 / gamma);
	      }
	      table[pos] = colorValue;
	      pos += 1;
	      cnt += 256 / (segments - 1);
	    }
	    return table.join(" ");
	  };
	  SVGProLevelsFilter.prototype.renderFrame = function(forceRender) {
	    if (forceRender || this.filterManager._mdf) {
	      var val2;
	      var effectElements = this.filterManager.effectElements;
	      if (this.feFuncRComposed && (forceRender || effectElements[3].p._mdf || effectElements[4].p._mdf || effectElements[5].p._mdf || effectElements[6].p._mdf || effectElements[7].p._mdf)) {
	        val2 = this.getTableValue(effectElements[3].p.v, effectElements[4].p.v, effectElements[5].p.v, effectElements[6].p.v, effectElements[7].p.v);
	        this.feFuncRComposed.setAttribute("tableValues", val2);
	        this.feFuncGComposed.setAttribute("tableValues", val2);
	        this.feFuncBComposed.setAttribute("tableValues", val2);
	      }
	      if (this.feFuncR && (forceRender || effectElements[10].p._mdf || effectElements[11].p._mdf || effectElements[12].p._mdf || effectElements[13].p._mdf || effectElements[14].p._mdf)) {
	        val2 = this.getTableValue(effectElements[10].p.v, effectElements[11].p.v, effectElements[12].p.v, effectElements[13].p.v, effectElements[14].p.v);
	        this.feFuncR.setAttribute("tableValues", val2);
	      }
	      if (this.feFuncG && (forceRender || effectElements[17].p._mdf || effectElements[18].p._mdf || effectElements[19].p._mdf || effectElements[20].p._mdf || effectElements[21].p._mdf)) {
	        val2 = this.getTableValue(effectElements[17].p.v, effectElements[18].p.v, effectElements[19].p.v, effectElements[20].p.v, effectElements[21].p.v);
	        this.feFuncG.setAttribute("tableValues", val2);
	      }
	      if (this.feFuncB && (forceRender || effectElements[24].p._mdf || effectElements[25].p._mdf || effectElements[26].p._mdf || effectElements[27].p._mdf || effectElements[28].p._mdf)) {
	        val2 = this.getTableValue(effectElements[24].p.v, effectElements[25].p.v, effectElements[26].p.v, effectElements[27].p.v, effectElements[28].p.v);
	        this.feFuncB.setAttribute("tableValues", val2);
	      }
	      if (this.feFuncA && (forceRender || effectElements[31].p._mdf || effectElements[32].p._mdf || effectElements[33].p._mdf || effectElements[34].p._mdf || effectElements[35].p._mdf)) {
	        val2 = this.getTableValue(effectElements[31].p.v, effectElements[32].p.v, effectElements[33].p.v, effectElements[34].p.v, effectElements[35].p.v);
	        this.feFuncA.setAttribute("tableValues", val2);
	      }
	    }
	  };
	  function SVGDropShadowEffect(filter, filterManager, elem2, id, source) {
	    var globalFilterSize = filterManager.container.globalData.renderConfig.filterSize;
	    var filterSize = filterManager.data.fs || globalFilterSize;
	    filter.setAttribute("x", filterSize.x || globalFilterSize.x);
	    filter.setAttribute("y", filterSize.y || globalFilterSize.y);
	    filter.setAttribute("width", filterSize.width || globalFilterSize.width);
	    filter.setAttribute("height", filterSize.height || globalFilterSize.height);
	    this.filterManager = filterManager;
	    var feGaussianBlur = createNS("feGaussianBlur");
	    feGaussianBlur.setAttribute("in", "SourceAlpha");
	    feGaussianBlur.setAttribute("result", id + "_drop_shadow_1");
	    feGaussianBlur.setAttribute("stdDeviation", "0");
	    this.feGaussianBlur = feGaussianBlur;
	    filter.appendChild(feGaussianBlur);
	    var feOffset = createNS("feOffset");
	    feOffset.setAttribute("dx", "25");
	    feOffset.setAttribute("dy", "0");
	    feOffset.setAttribute("in", id + "_drop_shadow_1");
	    feOffset.setAttribute("result", id + "_drop_shadow_2");
	    this.feOffset = feOffset;
	    filter.appendChild(feOffset);
	    var feFlood = createNS("feFlood");
	    feFlood.setAttribute("flood-color", "#00ff00");
	    feFlood.setAttribute("flood-opacity", "1");
	    feFlood.setAttribute("result", id + "_drop_shadow_3");
	    this.feFlood = feFlood;
	    filter.appendChild(feFlood);
	    var feComposite = createNS("feComposite");
	    feComposite.setAttribute("in", id + "_drop_shadow_3");
	    feComposite.setAttribute("in2", id + "_drop_shadow_2");
	    feComposite.setAttribute("operator", "in");
	    feComposite.setAttribute("result", id + "_drop_shadow_4");
	    filter.appendChild(feComposite);
	    var feMerge = this.createMergeNode(id, [id + "_drop_shadow_4", source]);
	    filter.appendChild(feMerge);
	  }
	  extendPrototype([SVGComposableEffect], SVGDropShadowEffect);
	  SVGDropShadowEffect.prototype.renderFrame = function(forceRender) {
	    if (forceRender || this.filterManager._mdf) {
	      if (forceRender || this.filterManager.effectElements[4].p._mdf) {
	        this.feGaussianBlur.setAttribute("stdDeviation", this.filterManager.effectElements[4].p.v / 4);
	      }
	      if (forceRender || this.filterManager.effectElements[0].p._mdf) {
	        var col = this.filterManager.effectElements[0].p.v;
	        this.feFlood.setAttribute("flood-color", rgbToHex(Math.round(col[0] * 255), Math.round(col[1] * 255), Math.round(col[2] * 255)));
	      }
	      if (forceRender || this.filterManager.effectElements[1].p._mdf) {
	        this.feFlood.setAttribute("flood-opacity", this.filterManager.effectElements[1].p.v / 255);
	      }
	      if (forceRender || this.filterManager.effectElements[2].p._mdf || this.filterManager.effectElements[3].p._mdf) {
	        var distance = this.filterManager.effectElements[3].p.v;
	        var angle = (this.filterManager.effectElements[2].p.v - 90) * degToRads;
	        var x = distance * Math.cos(angle);
	        var y = distance * Math.sin(angle);
	        this.feOffset.setAttribute("dx", x);
	        this.feOffset.setAttribute("dy", y);
	      }
	    }
	  };
	  var _svgMatteSymbols = [];
	  function SVGMatte3Effect(filterElem, filterManager, elem2) {
	    this.initialized = false;
	    this.filterManager = filterManager;
	    this.filterElem = filterElem;
	    this.elem = elem2;
	    elem2.matteElement = createNS("g");
	    elem2.matteElement.appendChild(elem2.layerElement);
	    elem2.matteElement.appendChild(elem2.transformedElement);
	    elem2.baseElement = elem2.matteElement;
	  }
	  SVGMatte3Effect.prototype.findSymbol = function(mask2) {
	    var i = 0;
	    var len = _svgMatteSymbols.length;
	    while (i < len) {
	      if (_svgMatteSymbols[i] === mask2) {
	        return _svgMatteSymbols[i];
	      }
	      i += 1;
	    }
	    return null;
	  };
	  SVGMatte3Effect.prototype.replaceInParent = function(mask2, symbolId) {
	    var parentNode = mask2.layerElement.parentNode;
	    if (!parentNode) {
	      return;
	    }
	    var children = parentNode.children;
	    var i = 0;
	    var len = children.length;
	    while (i < len) {
	      if (children[i] === mask2.layerElement) {
	        break;
	      }
	      i += 1;
	    }
	    var nextChild;
	    if (i <= len - 2) {
	      nextChild = children[i + 1];
	    }
	    var useElem = createNS("use");
	    useElem.setAttribute("href", "#" + symbolId);
	    if (nextChild) {
	      parentNode.insertBefore(useElem, nextChild);
	    } else {
	      parentNode.appendChild(useElem);
	    }
	  };
	  SVGMatte3Effect.prototype.setElementAsMask = function(elem2, mask2) {
	    if (!this.findSymbol(mask2)) {
	      var symbolId = createElementID();
	      var masker = createNS("mask");
	      masker.setAttribute("id", mask2.layerId);
	      masker.setAttribute("mask-type", "alpha");
	      _svgMatteSymbols.push(mask2);
	      var defs = elem2.globalData.defs;
	      defs.appendChild(masker);
	      var symbol = createNS("symbol");
	      symbol.setAttribute("id", symbolId);
	      this.replaceInParent(mask2, symbolId);
	      symbol.appendChild(mask2.layerElement);
	      defs.appendChild(symbol);
	      var useElem = createNS("use");
	      useElem.setAttribute("href", "#" + symbolId);
	      masker.appendChild(useElem);
	      mask2.data.hd = false;
	      mask2.show();
	    }
	    elem2.setMatte(mask2.layerId);
	  };
	  SVGMatte3Effect.prototype.initialize = function() {
	    var ind = this.filterManager.effectElements[0].p.v;
	    var elements = this.elem.comp.elements;
	    var i = 0;
	    var len = elements.length;
	    while (i < len) {
	      if (elements[i] && elements[i].data.ind === ind) {
	        this.setElementAsMask(this.elem, elements[i]);
	      }
	      i += 1;
	    }
	    this.initialized = true;
	  };
	  SVGMatte3Effect.prototype.renderFrame = function() {
	    if (!this.initialized) {
	      this.initialize();
	    }
	  };
	  function SVGGaussianBlurEffect(filter, filterManager, elem2, id) {
	    filter.setAttribute("x", "-100%");
	    filter.setAttribute("y", "-100%");
	    filter.setAttribute("width", "300%");
	    filter.setAttribute("height", "300%");
	    this.filterManager = filterManager;
	    var feGaussianBlur = createNS("feGaussianBlur");
	    feGaussianBlur.setAttribute("result", id);
	    filter.appendChild(feGaussianBlur);
	    this.feGaussianBlur = feGaussianBlur;
	  }
	  SVGGaussianBlurEffect.prototype.renderFrame = function(forceRender) {
	    if (forceRender || this.filterManager._mdf) {
	      var kBlurrinessToSigma = 0.3;
	      var sigma = this.filterManager.effectElements[0].p.v * kBlurrinessToSigma;
	      var dimensions = this.filterManager.effectElements[1].p.v;
	      var sigmaX = dimensions == 3 ? 0 : sigma;
	      var sigmaY = dimensions == 2 ? 0 : sigma;
	      this.feGaussianBlur.setAttribute("stdDeviation", sigmaX + " " + sigmaY);
	      var edgeMode = this.filterManager.effectElements[2].p.v == 1 ? "wrap" : "duplicate";
	      this.feGaussianBlur.setAttribute("edgeMode", edgeMode);
	    }
	  };
	  function TransformEffect() {
	  }
	  TransformEffect.prototype.init = function(effectsManager) {
	    this.effectsManager = effectsManager;
	    this.type = effectTypes.TRANSFORM_EFFECT;
	    this.matrix = new Matrix();
	    this.opacity = -1;
	    this._mdf = false;
	    this._opMdf = false;
	  };
	  TransformEffect.prototype.renderFrame = function(forceFrame) {
	    this._opMdf = false;
	    this._mdf = false;
	    if (forceFrame || this.effectsManager._mdf) {
	      var effectElements = this.effectsManager.effectElements;
	      var anchor = effectElements[0].p.v;
	      var position2 = effectElements[1].p.v;
	      var isUniformScale = effectElements[2].p.v === 1;
	      var scaleHeight = effectElements[3].p.v;
	      var scaleWidth = isUniformScale ? scaleHeight : effectElements[4].p.v;
	      var skew = effectElements[5].p.v;
	      var skewAxis = effectElements[6].p.v;
	      var rotation2 = effectElements[7].p.v;
	      this.matrix.reset();
	      this.matrix.translate(-anchor[0], -anchor[1], anchor[2]);
	      this.matrix.scale(scaleWidth * 0.01, scaleHeight * 0.01, 1);
	      this.matrix.rotate(-rotation2 * degToRads);
	      this.matrix.skewFromAxis(-skew * degToRads, (skewAxis + 90) * degToRads);
	      this.matrix.translate(position2[0], position2[1], 0);
	      this._mdf = true;
	      if (this.opacity !== effectElements[8].p.v) {
	        this.opacity = effectElements[8].p.v;
	        this._opMdf = true;
	      }
	    }
	  };
	  function SVGTransformEffect(_, filterManager) {
	    this.init(filterManager);
	  }
	  extendPrototype([TransformEffect], SVGTransformEffect);
	  function CVTransformEffect(effectsManager) {
	    this.init(effectsManager);
	  }
	  extendPrototype([TransformEffect], CVTransformEffect);
	  registerRenderer("canvas", CanvasRenderer);
	  registerRenderer("html", HybridRenderer);
	  registerRenderer("svg", SVGRenderer);
	  ShapeModifiers.registerModifier("tm", TrimModifier);
	  ShapeModifiers.registerModifier("pb", PuckerAndBloatModifier);
	  ShapeModifiers.registerModifier("rp", RepeaterModifier);
	  ShapeModifiers.registerModifier("rd", RoundCornersModifier);
	  ShapeModifiers.registerModifier("zz", ZigZagModifier);
	  ShapeModifiers.registerModifier("op", OffsetPathModifier);
	  setExpressionsPlugin(Expressions);
	  setExpressionInterfaces(getInterface);
	  initialize$1();
	  initialize();
	  registerEffect$1(20, SVGTintFilter, true);
	  registerEffect$1(21, SVGFillFilter, true);
	  registerEffect$1(22, SVGStrokeEffect, false);
	  registerEffect$1(23, SVGTritoneFilter, true);
	  registerEffect$1(24, SVGProLevelsFilter, true);
	  registerEffect$1(25, SVGDropShadowEffect, true);
	  registerEffect$1(28, SVGMatte3Effect, false);
	  registerEffect$1(29, SVGGaussianBlurEffect, true);
	  registerEffect$1(35, SVGTransformEffect, false);
	  registerEffect(35, CVTransformEffect);
	  return lottie;
	}); 
} (lottie$1, lottie$1.exports));

var lottieExports = lottie$1.exports;
const lottie = /*@__PURE__*/getDefaultExportFromCjs(lottieExports);

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = true,
      o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

var _excluded$1 = ["animationData", "loop", "autoplay", "initialSegment", "onComplete", "onLoopComplete", "onEnterFrame", "onSegmentStart", "onConfigReady", "onDataReady", "onDataFailed", "onLoadedImages", "onDOMLoaded", "onDestroy", "lottieRef", "renderer", "name", "assetsPath", "rendererSettings"];
var useLottie = function useLottie(props, style) {
  var animationData = props.animationData,
    loop = props.loop,
    autoplay = props.autoplay,
    initialSegment = props.initialSegment,
    onComplete = props.onComplete,
    onLoopComplete = props.onLoopComplete,
    onEnterFrame = props.onEnterFrame,
    onSegmentStart = props.onSegmentStart,
    onConfigReady = props.onConfigReady,
    onDataReady = props.onDataReady,
    onDataFailed = props.onDataFailed,
    onLoadedImages = props.onLoadedImages,
    onDOMLoaded = props.onDOMLoaded,
    onDestroy = props.onDestroy;
    props.lottieRef;
    props.renderer;
    props.name;
    props.assetsPath;
    props.rendererSettings;
    var rest = _objectWithoutProperties(props, _excluded$1);
  var _useState = reactExports.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    animationLoaded = _useState2[0],
    setAnimationLoaded = _useState2[1];
  var animationInstanceRef = reactExports.useRef();
  var animationContainer = reactExports.useRef(null);
  /*
        ======================================
            INTERACTION METHODS
        ======================================
     */
  /**
   * Play
   */
  var play = function play() {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.play();
  };
  /**
   * Stop
   */
  var stop = function stop() {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.stop();
  };
  /**
   * Pause
   */
  var pause = function pause() {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.pause();
  };
  /**
   * Set animation speed
   * @param speed
   */
  var setSpeed = function setSpeed(speed) {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setSpeed(speed);
  };
  /**
   * Got to frame and play
   * @param value
   * @param isFrame
   */
  var goToAndPlay = function goToAndPlay(value, isFrame) {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.goToAndPlay(value, isFrame);
  };
  /**
   * Got to frame and stop
   * @param value
   * @param isFrame
   */
  var goToAndStop = function goToAndStop(value, isFrame) {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.goToAndStop(value, isFrame);
  };
  /**
   * Set animation direction
   * @param direction
   */
  var setDirection = function setDirection(direction) {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setDirection(direction);
  };
  /**
   * Play animation segments
   * @param segments
   * @param forceFlag
   */
  var playSegments = function playSegments(segments, forceFlag) {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.playSegments(segments, forceFlag);
  };
  /**
   * Set sub frames
   * @param useSubFrames
   */
  var setSubframe = function setSubframe(useSubFrames) {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setSubframe(useSubFrames);
  };
  /**
   * Get animation duration
   * @param inFrames
   */
  var getDuration = function getDuration(inFrames) {
    var _a;
    return (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.getDuration(inFrames);
  };
  /**
   * Destroy animation
   */
  var destroy = function destroy() {
    var _a;
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
    // Removing the reference to the animation so separate cleanups are skipped.
    // Without it the internal `lottie-react` instance throws exceptions as it already cleared itself on destroy.
    animationInstanceRef.current = undefined;
  };
  /*
        ======================================
            LOTTIE
        ======================================
     */
  /**
   * Load a new animation, and if it's the case, destroy the previous one
   * @param {Object} forcedConfigs
   */
  var loadAnimation = function loadAnimation() {
    var forcedConfigs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _a;
    // Return if the container ref is null
    if (!animationContainer.current) {
      return;
    }
    // Destroy any previous instance
    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
    // Build the animation configuration
    var config = _objectSpread2(_objectSpread2(_objectSpread2({}, props), forcedConfigs), {}, {
      container: animationContainer.current
    });
    // Save the animation instance
    animationInstanceRef.current = lottie.loadAnimation(config);
    setAnimationLoaded(!!animationInstanceRef.current);
    // Return a function that will clean up
    return function () {
      var _a;
      (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
      animationInstanceRef.current = undefined;
    };
  };
  /**
   * (Re)Initialize when animation data changed
   */
  reactExports.useEffect(function () {
    var onUnmount = loadAnimation();
    // Clean up on unmount
    return function () {
      return onUnmount === null || onUnmount === void 0 ? void 0 : onUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationData, loop]);
  // Update the autoplay state
  reactExports.useEffect(function () {
    if (!animationInstanceRef.current) {
      return;
    }
    animationInstanceRef.current.autoplay = !!autoplay;
  }, [autoplay]);
  // Update the initial segment state
  reactExports.useEffect(function () {
    if (!animationInstanceRef.current) {
      return;
    }
    // When null should reset to default animation length
    if (!initialSegment) {
      animationInstanceRef.current.resetSegments(true);
      return;
    }
    // If it's not a valid segment, do nothing
    if (!Array.isArray(initialSegment) || !initialSegment.length) {
      return;
    }
    // If the current position it's not in the new segment
    // set the current position to start
    if (animationInstanceRef.current.currentRawFrame < initialSegment[0] || animationInstanceRef.current.currentRawFrame > initialSegment[1]) {
      animationInstanceRef.current.currentRawFrame = initialSegment[0];
    }
    // Update the segment
    animationInstanceRef.current.setSegment(initialSegment[0], initialSegment[1]);
  }, [initialSegment]);
  /*
        ======================================
            EVENTS
        ======================================
     */
  /**
   * Reinitialize listener on change
   */
  reactExports.useEffect(function () {
    var partialListeners = [{
      name: "complete",
      handler: onComplete
    }, {
      name: "loopComplete",
      handler: onLoopComplete
    }, {
      name: "enterFrame",
      handler: onEnterFrame
    }, {
      name: "segmentStart",
      handler: onSegmentStart
    }, {
      name: "config_ready",
      handler: onConfigReady
    }, {
      name: "data_ready",
      handler: onDataReady
    }, {
      name: "data_failed",
      handler: onDataFailed
    }, {
      name: "loaded_images",
      handler: onLoadedImages
    }, {
      name: "DOMLoaded",
      handler: onDOMLoaded
    }, {
      name: "destroy",
      handler: onDestroy
    }];
    var listeners = partialListeners.filter(function (listener) {
      return listener.handler != null;
    });
    if (!listeners.length) {
      return;
    }
    var deregisterList = listeners.map(
    /**
     * Handle the process of adding an event listener
     * @param {Listener} listener
     * @return {Function} Function that deregister the listener
     */
    function (listener) {
      var _a;
      (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener(listener.name, listener.handler);
      // Return a function to deregister this listener
      return function () {
        var _a;
        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener(listener.name, listener.handler);
      };
    });
    // Deregister listeners on unmount
    return function () {
      deregisterList.forEach(function (deregister) {
        return deregister();
      });
    };
  }, [onComplete, onLoopComplete, onEnterFrame, onSegmentStart, onConfigReady, onDataReady, onDataFailed, onLoadedImages, onDOMLoaded, onDestroy]);
  /**
   * Build the animation view
   */
  var View = /*#__PURE__*/React.createElement("div", _objectSpread2({
    style: style,
    ref: animationContainer
  }, rest));
  return {
    View: View,
    play: play,
    stop: stop,
    pause: pause,
    setSpeed: setSpeed,
    goToAndStop: goToAndStop,
    goToAndPlay: goToAndPlay,
    setDirection: setDirection,
    playSegments: playSegments,
    setSubframe: setSubframe,
    getDuration: getDuration,
    destroy: destroy,
    animationContainerRef: animationContainer,
    animationLoaded: animationLoaded,
    animationItem: animationInstanceRef.current
  };
};

export { AnimatePresence as A, LayoutGroup as L, motion as m, useLottie as u };
