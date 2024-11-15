// customBlockRenderMap.ts
import { DefaultDraftBlockRenderMap } from 'draft-js';
import Immutable from 'immutable';

const blockRenderMap = Immutable.Map({
  table: {
    element: 'div',
  },
});

export const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
  blockRenderMap
);