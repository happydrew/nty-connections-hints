import ConnectionsGame from './ConnectionsGame';
import { GroupData } from '@lib/types';
import { getPreviousDayUrl, getNextDayUrl, getPreviousDate,getNextDate, getFormattedDate } from '@lib/utils';
import { Lock, Archive } from 'lucide-react';

export const GameArea = ({
    game_date,
    game_number,
    game_data,
    has_previous = true,
    has_next = true
}: {
    game_date: string,
    game_number: number,
    game_data: GroupData[],
    has_previous: boolean,
    has_next: boolean
}) => {

    return <div id="game" className="bg-white rounded-lg shadow p-6 mb-8 relative">
        <h2 className="text-xl font-semibold mb-4">Play Today's Puzzle</h2>
        <div className="rounded-lg flex items-center justify-center">
            <ConnectionsGame
                groups={game_data}
                unlimitedMode={true}
            />
        </div>

        {/* Navigation Links */}
        <div className="mt-4 flex justify-between items-center text-sm">
            <div className='w-1/3'>
                {has_previous && <a href={getPreviousDayUrl(game_date, game_number)} className="text-blue-600">
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
                {has_next && <a href={getNextDayUrl(game_date, game_number)} className="text-blue-600">
                    Next day - {getFormattedDate(getNextDate(new Date(game_date)))} ⏩
                </a>}
            </div>

        </div>
    </div>
}