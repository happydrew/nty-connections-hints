import React, { useState } from 'react';
import { Lock, Archive } from 'lucide-react';
import ConnectionsGame from './ConnectionsGame';
import { getDataLevelColor } from './ConnectionsGame';
import Article from './Article';
import { PzGroup } from './ConnectionsGame';
import { formatDateToArchiveUrlSeg, getPreviousDate, getNextDate, getArchiveUrlByDateAndNumber } from '@lib/utils';

interface Hint {
  hintlevel: number;
  hint: string;
}

interface OriGroupHint {
  group_name: string;
  hints: Hint[];
}

interface GroupHint {
  data_level: number;
  hints: Hint[];
}

function getHintlevelText(level: number) {
  switch (level) {
    case 1:
      return "Light hint";
    case 2:
      return "Medium hint";
    case 3:
      return "Strong hint";
    default:
      return "default hint";
  }
}

function getHintlevelColor(hintlevel: number, datalevel: number) {
  switch (datalevel) {
    // 黄色
    case 0:
      switch (hintlevel) {
        case 1:
          return "#fff1b7";
        case 2:
          return "#F9DF6D";
        case 3:
          return "#E5C144";
        default:
          return "#F9DF6D";
      }
    // 绿色
    case 1:
      switch (hintlevel) {
        case 1:
          return "#A8D77C";
        case 2:
          return "#A0C35A";
        case 3:
          return "#7D9A42";
        default:
          return "#A0C35A";
      }
    // 蓝色
    case 2:
      switch (hintlevel) {
        case 1:
          return "#C4D9F9";
        case 2:
          return "#B0C4EF";
        case 3:
          return "#8D9FCE";
        default:
          return "#B0C4EF";
      }
    // 紫色
    case 3:
      switch (hintlevel) {
        case 1:
          return "#D59ED7";
        case 2:
          return "#BA81C5";
        case 3:
          return "#9B5C98";
        default:
          return "#BA81C5";
      }
    default:
      return "bg-gray-500";
  }
}

function getDatalevelGroupHintText(level: number) {
  switch (level) {
    case 0:
      return "Yellow group hints";
    case 1:
      return "Green group hints";
    case 2:
      return "Blue group hints";
    case 3:
      return "Purple group hints";
    default:
      return "unknown group hints";
  }
}

function getGroupTextByDatalevel(level: number) {
  switch (level) {
    case 0:
      return "Yellow group";
    case 1:
      return "Green group";
    case 2:
      return "Blue group";
    case 3:
      return "Purple group";
    default:
      return "unknown group";
  }
}

const Hint = ({ title, hint, color }: { title: string, hint: string, color: string }) => {

  const [showHint, setShowHint] = useState(false);

  return <div
    className='w-full px-6 py-4 rounded-lg flex justify-center items-center text-zinc-900 font-bold cursor-pointer'
    style={{ backgroundColor: color }}
    onClick={() => setShowHint(!showHint)}
  >
    {showHint ?
      <span className='text-lg font-bold text-zinc-900 text-center'>{hint}</span> :
      <span className='text-lg font-bold flex justify-center items-center text-zinc-700'>
        <Lock className="mx-auto mr-2" />
        See {title}
      </span>

    }
  </div>
}

const HintsPage = ({
  game_date,
  game_number,
  game_author,
  game_data,
  hints,
  has_previous = true,
  has_next = true }: {
    game_date: string,
    game_number: number,
    game_author: string,
    game_data: string,
    hints: string,
    has_previous?: boolean,
    has_next?: boolean,
  }) => {

  //console.log(`HintsPage 组件接收到的参数：game_date=${game_date}, game_number=${game_number}, game_author=${game_author}, game_data=${game_data}, hints=${hints}`)

  //首先解析game_data，得到groupHints, 和todayGroups
  const todayGroups: PzGroup[] = JSON.parse(game_data);
  const groupNameToLevel = {}
  todayGroups.forEach(group => {
    groupNameToLevel[group.group_name] = group.data_level
  })
  const oriGroupHints: OriGroupHint[] = JSON.parse(hints)
  const groupHints: GroupHint[] = oriGroupHints.map(groupHint => ({
    data_level: groupNameToLevel[groupHint.group_name],
    hints: groupHint.hints
  }))

  const [showAnswer, setShowAnswer] = useState(false);

  function getFormattedDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  function getPreviousDayUrl() {
    return getArchiveUrlByDateAndNumber(getPreviousDate(new Date(game_date)), game_number - 1)
  }

  function getNextDayUrl() {
    return getArchiveUrlByDateAndNumber(getNextDate(new Date(game_date)), game_number + 1)
  }

  const toc = [
    { title: "Play Today's Nyt Connections Puzzle", href: '#game' },
    { title: "See Today's Nyt Connections Hints", href: '#hints' },
    { title: "Introduction of Hints", href: '#about' },
    { title: "Introduction of Nyt Connections", href: '#how-to-play' },
    { title: "Strategy Guide", href: '#strategy' },
    { title: "See Today's Nyt Connections Answer", href: '#answer' },
  ]

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 ">
          NYT connections hints and answers for today's puzzle - <span className='text-primary'>{getFormattedDate(new Date(game_date))}</span> <span className='text-xl'>#{game_number}</span>
        </h1>

        {/* Page Overview */}
        <div className=" rounded-lg p-6 mb-8">
          <p className="text-zinc-900 text-base leading-relaxed">
            Hi!😊 This page daily-updates for NYT Connections <a className='text-primary !underline underline-offset-2' href="#hints">hints</a>, <a className='text-primary !underline underline-offset-2' href="#answers">answers</a> and help with multi-level clues, enhances your game experience.
            Besides, you can <a className='text-primary !underline underline-offset-2' href="#game">play nyt connections unlimited mode</a>, and access all historical <a className='text-primary !underline underline-offset-2' href="/archive">NYT Connections archive</a>.
            Wish you have a good time playing NYT Connections today!
          </p>
        </div>

        {/* Game Area Placeholder */}
        <div id="game" className="bg-white rounded-lg shadow p-6 mb-8 relative">
          <h2 className="text-xl font-semibold mb-4">Play Today's Puzzle</h2>
          <div className="rounded-lg flex items-center justify-center">
            <ConnectionsGame
              groups={todayGroups}
              unlimitedMode={true}
            />
          </div>

          {/* Navigation Links */}
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className='w-1/3'>
              {has_previous && <a href={getPreviousDayUrl()} className="text-blue-600">
                ⏪ Previous day - {getFormattedDate(getPreviousDate(new Date(game_date)))}
              </a>}
            </div>

            <div>
              <a href="/archive" className="flex justify-center items-center text-blue-600">
                <Archive className="w-4 h-4 mr-2" />
                View Archive
              </a>
            </div>

            <div className='w-1/3 flex justify-end'>
              {has_next && <a href={getNextDayUrl()} className="text-blue-600">
                Next day - {getFormattedDate(getNextDate(new Date(game_date)))} ⏩
              </a>}
            </div>

          </div>
        </div>

        {/* Hints Section */}
        <div id="hints" className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Group Hints</h2>

          {groupHints.map((hintgroup) =>
            <div className='flex flex-col items-center justify-center p-4'>
              <h3 className='w-full flex items-center justify-start gap-2'>
                <span className='inline-block w-[16px] h-[16px] rounded-full' style={{ backgroundColor: getDataLevelColor(hintgroup.data_level) }}></span>
                {getDatalevelGroupHintText(hintgroup.data_level)}
              </h3>

              <div className='w-full flex flex-col items-center justify-center gap-2 p-4'>
                {hintgroup.hints.map(hint =>
                  <Hint title={getHintlevelText(hint.hintlevel)} hint={hint.hint} color={getHintlevelColor(hint.hintlevel, hintgroup.data_level)} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Group name Section */}
        <div id="group_name" className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Group name</h2>

          {todayGroups.map(group =>
            <div className='flex flex-col items-center justify-center p-2'>
              <h3 className='w-full flex items-center justify-start gap-2'>
                <span className='inline-block w-[16px] h-[16px] rounded-full' style={{ backgroundColor: getDataLevelColor(group.data_level) }}></span>
                {getGroupTextByDatalevel(group.data_level)} name
              </h3>

              <div className='w-full flex flex-col items-center justify-center gap-2 px-4 py-2'>
                <Hint title={`${getGroupTextByDatalevel(group.data_level)} name`} hint={group.group_name} color={getHintlevelColor(2, group.data_level)} />
              </div>
            </div>
          )}
        </div>

        {/* Group first word Section */}
        <div id="group" className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Group first word</h2>

          {todayGroups.map(group =>
            <div className='flex flex-col items-center justify-center p-2'>
              <h3 className='w-full flex items-center justify-start gap-2'>
                <span className='inline-block w-[16px] h-[16px] rounded-full' style={{ backgroundColor: getDataLevelColor(group.data_level) }}></span>
                {`${getGroupTextByDatalevel(group.data_level)} first word`}
              </h3>

              <div className='w-full flex flex-col items-center justify-center gap-2 px-4 py-2'>
                <Hint title={`${getGroupTextByDatalevel(group.data_level)} first word`} hint={group.group_words[0]} color={getHintlevelColor(2, group.data_level)} />
              </div>
            </div>
          )}
        </div>

        <div id='article' className='bg-white rounded-lg shadow p-6 mb-8'>
          <Article />
        </div>


        {/* Answer Section */}
        <div id="answers" className="relative bg-white rounded shadow p-6 mb-8">
          <div className="relative p-4">
            {!showAnswer &&
              <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 backdrop-blur-lg flex items-center justify-center">
                <div className="text-center text-zinc-900 text-xl font-bold cursor-pointer" onClick={() => setShowAnswer(true)}>
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <p className="">Click to reveal today's answer</p>
                </div>
              </div>}
            <h3 className="font-bold mb-4">Today's NYT Connections Answer:</h3>
            <div className='flex flex-col items-center justify-center gap-2'>
              {todayGroups.map(group =>
                <div
                  style={{ backgroundColor: getDataLevelColor(group.data_level) }}
                  className={`w-full h-20 flex flex-col justify-center items-center rounded-lg`}
                  data-solved-group
                >
                  <span className='text-center text-zinc-900 font-bold'>{group.group_name}</span>
                  <span className='text-center text-zinc-800'>{group.group_words.join(', ')}</span>
                </div>)}
            </div>

          </div>
        </div>

        {/* More Resources */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-2">More Resources 🌐</h2>
          <div className='flex flex-col items-start justify-center gap-2'>
            {has_previous && <a href={getPreviousDayUrl()} className="text-blue-600 underline">
              ⏪ Previous day - {getFormattedDate(getPreviousDate(new Date(game_date)))}
            </a>}
            {has_next && <a href={getNextDayUrl()} className="text-blue-600 underline">
              ⏩ Next day - {getFormattedDate(getNextDate(new Date(game_date)))}
            </a>}
            <a href="/archive" className="flex items-center text-blue-600 underline">
              <Archive className="w-4 h-4 mr-2" />Play All NYT Connections Archives
            </a>
          </div>

        </section>
      </div>
    </div >
  );
};

export default HintsPage;