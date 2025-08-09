export const countPossibleCombinations = (dices: number[], isFirstShake: boolean = false) => {
    const counts = dices.reduce(
        (acc, curr) => {
            acc[curr - 1] += 1;
            return acc;
        },
        [0, 0, 0, 0, 0, 0],
    );

    const res = [
        ...counts.map((count, index) => fromCountToResult(count, index + 1)),
        '',
        p(counts, isFirstShake),
        twoP(counts, isFirstShake),
        triangle(counts, isFirstShake),
        square(counts, isFirstShake),
        f(counts, isFirstShake),
        ms(counts, isFirstShake),
        bs(counts, isFirstShake),
        th(counts, isFirstShake),
        n(counts, isFirstShake),
        s(counts, isFirstShake),
        pocker(counts, isFirstShake),
    ];
    return res;
};

const fromCountToResult = (count: number, dice: number) => {
    let value;
    switch (count) {
        case 0: {
            value = -3 * dice;
            break;
        }
        case 1: {
            value = -2 * dice;
            break;
        }
        case 2: {
            value = -1 * dice;
            break;
        }
        case 3: {
            value = 0;
            break;
        }
        case 4: {
            value = dice;
            break;
        }
        case 5: {
            value = 2 * dice;
            break;
        }
        default: {
            throw 'WTF';
        }
    }
    return value;
};

const p = (counts: number[], isFirstShake: boolean) => {
    let value = counts.reduce((acc, curr, index) => {
        if (curr >= 2) {
            acc = (index + 1) * 2;
        }
        return acc;
    }, 0);

    if (isFirstShake) {
        value *= 2;
    }

    return value;
};

const twoP = (counts: number[], isFirstShake: boolean) => {
    const value = counts.reduce(
        (acc, curr, index) => {
            if (curr >= 2) {
                const currP = (index + 1) * 2;
                if (acc[1]) {
                    acc[0] = acc[1];
                    acc[1] = currP;
                } else if (acc[0]) {
                    acc[1] = currP;
                } else {
                    acc[0] = currP;
                }
                if (curr >= 4) {
                    acc[0] = currP;
                    acc[1] = currP;
                }
            }
            return acc;
        },
        [0, 0],
    );

    if (value[0] > 0 && value[1] > 0) {
        let sum = value[0] + value[1];
        if (isFirstShake) {
            sum *= 2;
        }

        return sum;
    }
    return 0;
};

const triangle = (counts: number[], isFirstShake: boolean) => {
    let value = counts.reduce((acc, curr, index) => {
        if (curr >= 3) {
            acc = (index + 1) * 3;
        }
        return acc;
    }, 0);

    if (isFirstShake) {
        value *= 2;
    }

    return value;
};

const square = (counts: number[], isFirstShake: boolean) => {
    let value = counts.reduce((acc, curr, index) => {
        if (curr >= 4) {
            acc = (index + 1) * 4;
        }
        return acc;
    }, 0);

    if (isFirstShake) {
        value *= 2;
    }

    return value;
};

const f = (counts: number[], isFirstShake: boolean) => {
    const value = counts.reduce(
        (acc, curr, index) => {
            if (curr === 2 || curr === 5) {
                acc[0] = (index + 1) * 2;
            }
            if (curr === 3 || curr === 5) {
                acc[1] = (index + 1) * 3;
            }
            return acc;
        },
        [0, 0],
    );

    if (value[0] > 0 && value[1] > 0) {
        let sum = value[0] + value[1];
        if (isFirstShake) {
            sum *= 2;
        }

        return sum;
    }
    return 0;
};

const ms = (counts: number[], isFirstShake: boolean) => {
    let value = counts.toString() === '1,1,1,1,1,0' ? 15 : 0;
    if (isFirstShake) {
        value *= 2;
    }
    return value;
};

const bs = (counts: number[], isFirstShake: boolean) => {
    let value = counts.toString() === '0,1,1,1,1,1' ? 20 : 0;
    if (isFirstShake) {
        value *= 2;
    }
    return value;
};

const th = (counts: number[], isFirstShake: boolean) => {
    const isEven = !counts[0] && !counts[2] && !counts[4];
    if (!isEven) {
        return 0;
    }
    let value = counts.reduce((acc, curr, index) => {
        acc += (index + 1) * curr;
        return acc;
    }, 0);
    if (isFirstShake) {
        value *= 2;
    }
    return value;
};

const n = (counts: number[], isFirstShake: boolean) => {
    const isOdd = !counts[1] && !counts[3] && !counts[5];
    if (!isOdd) {
        return 0;
    }
    let value = counts.reduce((acc, curr, index) => {
        acc += (index + 1) * curr;
        return acc;
    }, 0);
    if (isFirstShake) {
        value *= 2;
    }
    return value;
};

const s = (counts: number[], isFirstShake: boolean) => {
    let value = counts.reduce((acc, curr, index) => {
        acc += (index + 1) * curr;
        return acc;
    }, 0);
    if (isFirstShake) {
        value *= 2;
    }
    return value;
};

const pocker = (counts: number[], isFirstShake: boolean) => {
    let value = counts.reduce((acc, curr, index) => {
        if (curr === 5) {
            acc += (index + 1) * curr + 50;
        }
        return acc;
    }, 0);
    if (isFirstShake) {
        value *= 2;
    }
    return value;
};
