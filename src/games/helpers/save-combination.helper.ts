import { EMPTY_SAVED_DEICES } from '../constants';
import { GameEntity } from '../dao/game.entity';
import { PlayerEntity } from '../dao/player.entity';

export const saveCombination = (
    game: GameEntity,
    player: PlayerEntity,
    { column, row }: { column: number; row: number },
) => {
    const { currentDicesInfo } = game;
    const { currentPlayerInfo } = player;
    const newTable = player.table.map((comb, i) =>
        comb.map((cell, j) => {
            if (i === row && j === column) {
                return currentDicesInfo.combinations[row].toString();
            }
            return cell;
        }),
    );

    if (row <= 5) {
        const currentSchool: string[] = [];
        for (let i = 0; i <= 5; i += 1) {
            currentSchool.push(newTable[i][column]);
        }
        if (!currentSchool.some((val) => val === '')) {
            let sum = currentSchool.reduce((acc, curr) => acc + Number(curr), 0);
            if (sum > 0) {
                sum += 50;
            } else if (sum < 0) {
                sum -= 50;
            }
            newTable[6][column] = sum.toString();
        }
    }

    if (currentPlayerInfo.combsNumber === 50) {
        let sums = [0, 0, 0];
        for (let i = 6; i <= 17; i += 1) {
            sums[0] += Number(newTable[i][1]);
            sums[1] += Number(newTable[i][2]);
            sums[2] += Number(newTable[i][3]);
        }

        newTable[18][1] = sums[0].toString();
        newTable[18][2] = sums[1].toString();
        newTable[18][3] = sums[2].toString();

        newTable[18][0] = (sums[0] + sums[1] + sums[2]).toString();
    }
    currentDicesInfo.shakeCount = 0;

    if (column === 1) {
        let downTo = 1;
        if (row === 5) {
            downTo += 1;
        }
        currentPlayerInfo.downIndex = currentPlayerInfo.downIndex + downTo;
    }
    if (column === 3) {
        let upTo = 1;
        if (row === 7) {
            upTo += 1;
        }
        currentPlayerInfo.upIndex = currentPlayerInfo.upIndex - upTo;
    }

    currentPlayerInfo.combsNumber = currentPlayerInfo.combsNumber + 1;
    currentDicesInfo.savedDices = EMPTY_SAVED_DEICES;
    currentDicesInfo.combinations = [];

    return {
        table: newTable,
        currentPlayerInfo,
        currentDicesInfo,
    }
};
