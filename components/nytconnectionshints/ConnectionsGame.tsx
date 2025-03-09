// components/ConnectionsGame.tsx
'use client';

export { getDataLevelColor };
export type { PzGroup };

import { useState, useEffect, useRef } from 'react';
import { Switch, FormControlLabel } from "@mui/material";
import { to2DArray } from '@utils'


// 游戏数据，一个分组的数据结构
interface PzGroup {
    group_name: string,
    group_words: string[],
    data_level: number
}

const getDataLevelColor = (data_level: number) => {
    switch (data_level) {
        case 0:
            return '#F9DF6D';
        case 1:
            return '#A0C35A';
        case 2:
            return '#B0C4EF';
        case 3:
            return '#BA81C5';
        default:
            throw new Error(`Invalid data_level: ${data_level}`);
    }
}

type ConnectionsGameProps = {
    groups: PzGroup[];
    unlimitedMode?: boolean;
};

export default function ConnectionsGame({
    groups,
    unlimitedMode = true,
}: ConnectionsGameProps) {

    console.log(`ConnectionsGame 组件接收到的参数：\n groups: ${JSON.stringify(groups)}\n unlimitedMode: ${unlimitedMode}`);

    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [shuffledWords, setShuffledWords] = useState<string[]>([]);
    const [solvedLevels, setSolvedLevels] = useState<number[]>([]);
    const [submittedGroups, setSubmittedGroups] = useState<string[][]>([]);
    const [unlimited, setUnlimited] = useState(unlimitedMode);
    const [mistakeTimes, setMistakeTimes] = useState(0);
    const [alreadyGessedTip, setAlreadyGessedTip] = useState(false);
    const [guessWrongTip, setGuessWrongTip] = useState(false);
    const wordsRegion = useRef<HTMLDivElement>(null);
    const [showCongratulations, setShowCongratulations] = useState(false);

    const allSolved = solvedLevels.length === groups.length;

    // 初始化洗牌单词
    useEffect(() => {
        shuffleWords();
    }, []);

    const shuffleWords = () => {
        const allWords = groups.filter(group => !solvedLevels.includes(group.data_level)).flatMap(g => g.group_words);
        setShuffledWords([...allWords].sort(() => Math.random() - 0.5));
    };

    const handleWordSelect = (word: string) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(prev => prev.filter(w => w !== word))
        } else {
            setSelectedWords(prev => [...prev, word])
        }
    };

    const restartGame = () => {
        setSelectedWords([]);
        setSolvedLevels([]);
        setSubmittedGroups([]);
        setMistakeTimes(0);
    }

    const handleSubmit = async () => {
        if (selectedWords.length < 4) return;

        const submittedGroup = submittedGroups.find(group => group.every(word => selectedWords.includes(word)));
        if (submittedGroup) {
            setAlreadyGessedTip(true);
            setTimeout(() => setAlreadyGessedTip(false), 2000);
            return;
        } else {
            setSubmittedGroups(prev => [...prev, [...selectedWords]])
        }

        // 查找匹配的分组
        const matchedGroup = groups.filter(group => !solvedLevels.includes(group.data_level)).find(group =>
            selectedWords.every(word => group.group_words.includes(word))
        );

        const oldSolvedLevelsLength = solvedLevels.length;

        if (matchedGroup) {
            await solveAGroup(matchedGroup);
            if (oldSolvedLevelsLength == groups.length - 1) {
                setShowCongratulations(true);
                setTimeout(() => setShowCongratulations(false), 2000);
            }
        } else {
            setGuessWrongTip(true);
            setTimeout(() => setGuessWrongTip(false), 2000);
            setMistakeTimes(prev => prev + 1);
        }
    };

    async function solveAGroup(matchedGroup: PzGroup) {
        // 已解决的卡片跳动效果
        const solvedGrids = Array.from(wordsRegion.current!.querySelectorAll('button'))
            .filter(grid => matchedGroup.group_words.includes(grid.textContent));
        for (let i = 0; i < solvedGrids.length; i++) {
            const solvedGrid = solvedGrids[i];
            solvedGrid.classList.add('animate-jump-once');
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        await new Promise(resolve => setTimeout(resolve, 500))

        // 本次猜中的4张卡片排成一行
        setShuffledWords([...(matchedGroup.group_words), ...(groups.filter(group => !solvedLevels.includes(group.data_level) && group.data_level !== matchedGroup.data_level).flatMap(g => g.group_words).sort(() => Math.random() - 0.5))])
        // 等待0.5秒
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 将已解决的分组变成条状颜色, 并展示缩放动画效果
        setSolvedLevels(prev => [...prev, matchedGroup.data_level])
        setShuffledWords(prev => prev.slice(4));
        setSelectedWords([]);
        await new Promise(resolve => setTimeout(resolve, 600))
    }

    return (
        <div className="relative mx-auto w-full px-20 py-4 bg-white rounded-lg">
            {/* 祝贺提示 */}
            {showCongratulations && <div
                className="absolute top-10 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl bg-green-500 text-white text-xl flex justify-center items-center"
            >
                Congratulations! 🎉
            </div>}

            {/* 猜错提示 */}
            {guessWrongTip && <div className="absolute top-5 left-1/2 -translate-x-1/2 w-40 h-10 bg-red-500 text-white text-sm rounded-lg flex justify-center items-center">
                Guess wrong!
            </div>}

            {/* 已提交过提示 */}
            {alreadyGessedTip && <div className="absolute top-5 left-1/2 -translate-x-1/2 w-40 h-10 bg-black text-white text-sm rounded-lg flex justify-center items-center">
                Already guessed!
            </div>}
            {/* 游戏结束提示 */}
            {mistakeTimes >= 4 && !unlimited && <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                <div className="flex flex-col flex-justify items-center w-3/4 text-center text-zinc-800 bg-[#d7d1fe] rounded-xl p-4 gap-10">
                    <span className='leading-8'><span className='text-xl'>Oops! 😵‍💫 You're out of chances!</span><br />
                        <strong>Restart</strong> or switch to <strong>Unlimited Mode</strong> for endless fun! 🎮
                    </span>
                    <div id='buttons' className='flex justify-center items-center gap-4'>
                        <button onClick={() => restartGame()} className='px-4 py-2.5 rounded-full bg-white text-zinc-800 border border-[#8B8B8B]'>Restart</button>
                        <button onClick={() => setUnlimited(true)} className='px-4 py-2.5 rounded-full bg-white text-zinc-800 border border-[#8B8B8B]'>Unlimited Mode</button>
                    </div>
                </div>
            </div>}
            <h2 className='text-center mb-4'>Create four groups of four!</h2>

            {/* 游戏网格 */}
            <div id='words-region' ref={wordsRegion} className='flex flex-col justify-center items-center mb-6 gap-2'>
                {/* 已解决的卡片 */}
                {solvedLevels.map(solvedLevel =>
                    <div
                        style={{ backgroundColor: getDataLevelColor(solvedLevel) }}
                        className={`w-full h-[6rem] flex flex-col justify-center items-center rounded-lg animate-zoom`}
                        data-solved-group
                    >
                        <span className='text-center text-zinc-900 font-bold'>{groups.find(group => group.data_level === solvedLevel)?.group_name}</span>
                        <span className='text-center text-zinc-800'>{groups.find(group => group.data_level === solvedLevel)?.group_words.join(', ')}</span>
                    </div>)}

                {/* 未解决的 words */}
                {to2DArray(shuffledWords, 4).map((row, rowIndex) =>
                    <div
                        className="grid grid-cols-4 gap-2 h-[6rem] w-full" data-unsolved-group={rowIndex}
                    >
                        {row.map(word => {
                            const isSelected = selectedWords.includes(word);
                            const isDisabled = selectedWords.length === 4 && !isSelected;

                            return (
                                <button
                                    key={word}
                                    onClick={() => handleWordSelect(word)}
                                    disabled={isDisabled}
                                    className={`
                px-6 h-[6rem] text-center rounded-lg border-2 transition-all border-none font-bold text-lg
                ${isSelected ? ' bg-[#5A594E] text-[#F8F8F8]' : ' bg-[#EFEFE6] text-[#121212]'}
              `}
                                >
                                    {word}
                                </button>
                            );
                        })}
                    </div>)}
            </div>

            {/* mistakes提示 */}
            <div className="flex justify-center items-center mb-4 gap-8">
                <div id="mistake-bar" className='w-1/2 flex justify-end items-center'>
                    {unlimited ? <div id='mistake-times'>
                        Mistakes:&nbsp;
                        <span className='text-red-600'>{mistakeTimes}</span>
                    </div> : <div className='flex justify-center items-center gap-2 text-[#5A594E]'>
                        Mistakes Remaining:&nbsp;
                        <div className='flex justify-start items-center gap-2 w-[90px]'>
                            {Array.from({ length: 4 - mistakeTimes }).map(i => <span className='w-[16px] h-[16px] rounded-full bg-[#5A594E]'></span>)}
                        </div>

                    </div>}
                </div>
                <div id="switch" className='w-1/2 flex justify-start items-center'>
                    Unlimited Mode:&nbsp;
                    <FormControlLabel
                        control={<Switch checked={unlimited} onChange={e => setUnlimited(e.target.checked)} />}
                        label={unlimited ? "ON" : "OFF"}
                    />
                </div>

            </div>

            {/* 控制区域 */}
            <div className="flex justify-center items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={shuffleWords}
                        className="flex items-center gap-1 px-4 py-2.5 border border-zinc-800 rounded-full font-semibold"
                    >
                        Shuffle
                    </button>
                    <button
                        onClick={() => setSelectedWords([])}
                        className={`
                            flex items-center gap-1 px-4 py-2.5 border rounded-full font-semibold
                        ${selectedWords.length == 0 ? ' border-[#8B8B8B] text-[#8B8B8B]' : 'border-zinc-800'}
                        `}
                        disabled={selectedWords.length === 0}
                    >
                        Deselect All
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={selectedWords.length < 4 || allSolved || (!unlimited && mistakeTimes >= 4)}
                        className={`
            px-4 py-2.5 rounded-full transition-all text-center font-semibold border
            ${selectedWords.length == 4 ? 'bg-[#121212] text-white' : 'bg-white text-[#8B8B8B] border-[#8B8B8B]'}
          `}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div >
    );
}