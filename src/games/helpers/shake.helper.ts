import { GameEntity } from '../dao/game.entity';
import { countPossibleCombinations } from './count-possible-combinations.helper';

const getRandomValue = () => {
    return Math.floor(Math.random() * 6 + 1);
};

export const shake = (game: GameEntity, savedDices: boolean[]) => {
    const { currentDicesInfo } = game;

    const dices = game.currentDicesInfo.dices.map((dice, i) => {
        return savedDices[i] ? dice : getRandomValue();
    });

    currentDicesInfo.dices = dices;
    currentDicesInfo.combinations = countPossibleCombinations(dices, currentDicesInfo.shakeCount === 0);
    currentDicesInfo.shakeCount = currentDicesInfo.shakeCount + 1;
    currentDicesInfo.savedDices = savedDices;

    return {
        currentDicesInfo,
    };
};
