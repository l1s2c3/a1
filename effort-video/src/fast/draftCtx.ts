import React from 'react';

/**
 * 草稿开关。
 * 正品 composition（EffortFast）恒为 false，渲染路径不受任何草稿改动影响；
 * 只有 EffortDraft 里为 true，用来试"加密度"的方案。
 */
export const DraftCtx = React.createContext(false);
