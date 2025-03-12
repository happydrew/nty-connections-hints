export{type Hint,type GroupHint,type GroupData}

interface Hint {
    hintlevel: number;
    hint: string;
  }
  
  interface GroupHint {
    data_level: number;
    hints: Hint[];
  }

  // 游戏数据，一个分组的数据结构
interface GroupData {
    group_name: string,
    group_words: string[],
    data_level: number
}