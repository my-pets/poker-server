import { CurrentDicesInfo } from "./dao/current-dices-info.type";
import { CurrentPlayerInfo } from "./dao/current-player-info.type";

export const EMPTY_DICES = [1, 1, 1, 1, 1];
export const EMPTY_SAVED_DEICES = [false, false, false, false, false];
export const DEFAULT_DOWN_INDEX = 1;
export const DEFAULT_UP_INDEX = 18;

export const DEFAULT_TABLE = [
    ['1', '', '', ''],
    ['2', '', '', ''],
    ['3', '', '', ''],
    ['4', '', '', ''],
    ['5', '', '', ''],
    ['6', '', '', ''],
    ['', '', '', ''],
    ['p', '', '', ''],
    ['2p', '', '', ''],
    ['▵', '', '', ''],
    ['□', '', '', ''],
    ['F', '', '', ''],
    ['Ms', '', '', ''],
    ['Bs', '', '', ''],
    ['Th', '', '', ''],
    ['N', '', '', ''],
    ['S', '', '', ''],
    ['P', '', '', ''],
    ['', '', '', ''],
];

export const DEFAULT_CURRENT_DICES_INFO: CurrentDicesInfo = {
    dices: EMPTY_DICES,
    savedDices: EMPTY_SAVED_DEICES,
    shakeCount: 0,
    combinations: [],
}

export const DEFAULT_CURRENT_PLAYER_INFO: CurrentPlayerInfo = {
    downIndex: DEFAULT_DOWN_INDEX,
    upIndex: DEFAULT_UP_INDEX,
    combsNumber: 0,
}