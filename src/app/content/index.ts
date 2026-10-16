import { AlgorithmContent } from './content.types';
import { BUBBLE_SORT_CONTENT } from './bubble-sort.content';
import { SELECTION_SORT_CONTENT } from './selection-sort.content';
import { INSERTION_SORT_CONTENT } from './insertion-sort.content';
import { MERGE_SORT_CONTENT } from './merge-sort.content';
import { QUICK_SORT_CONTENT } from './quick-sort.content';
import { DUAL_PIVOT_QUICK_SORT_CONTENT } from './dual-pivot-quick-sort.content';
import { HEAP_SORT_CONTENT } from './heap-sort.content';
import { COUNTING_SORT_CONTENT } from './counting-sort.content';
import { RADIX_SORT_CONTENT } from './radix-sort.content';
import { TIMSORT_CONTENT } from './timsort.content';
import { INTROSORT_CONTENT } from './introsort.content';
import { ARRAY_CONTENT } from './array.content';
import { LINKED_LIST_CONTENT } from './linked-list.content';
import { STACK_CONTENT } from './stack.content';
import { QUEUE_CONTENT } from './queue.content';
import { BST_CONTENT } from './bst.content';
import { AVL_TREE_CONTENT } from './avl-tree.content';
import { TREE_TRAVERSAL_CONTENT } from './tree-traversal.content';
import { RED_BLACK_TREE_CONTENT } from './red-black-tree.content';
import { GRAPH_CONTENT } from './graph.content';
import { HASH_MAP_CONTENT } from './hash-map.content';

export * from './content.types';
export * from './bubble-sort.content';
export * from './selection-sort.content';
export * from './insertion-sort.content';
export * from './merge-sort.content';
export * from './quick-sort.content';
export * from './dual-pivot-quick-sort.content';
export * from './heap-sort.content';
export * from './counting-sort.content';
export * from './radix-sort.content';
export * from './timsort.content';
export * from './introsort.content';
export * from './array.content';
export * from './linked-list.content';
export * from './stack.content';
export * from './queue.content';
export * from './bst.content';
export * from './avl-tree.content';
export * from './tree-traversal.content';
export * from './red-black-tree.content';
export * from './graph.content';
export * from './hash-map.content';

export const ALL_ALGORITHM_CONTENTS: readonly AlgorithmContent[] = [
  // Algoritmos de Ordenação
  BUBBLE_SORT_CONTENT,
  SELECTION_SORT_CONTENT,
  INSERTION_SORT_CONTENT,
  MERGE_SORT_CONTENT,
  QUICK_SORT_CONTENT,
  DUAL_PIVOT_QUICK_SORT_CONTENT,
  HEAP_SORT_CONTENT,
  COUNTING_SORT_CONTENT,
  RADIX_SORT_CONTENT,
  TIMSORT_CONTENT,
  INTROSORT_CONTENT,

  // Estruturas de Dados Fundamentais e Árvores
  ARRAY_CONTENT,
  LINKED_LIST_CONTENT,
  STACK_CONTENT,
  QUEUE_CONTENT,
  BST_CONTENT,
  AVL_TREE_CONTENT,
  TREE_TRAVERSAL_CONTENT,
  RED_BLACK_TREE_CONTENT,
  GRAPH_CONTENT,
  HASH_MAP_CONTENT
];

export const ALGORITHM_CONTENT_MAP: Readonly<Record<string, AlgorithmContent>> = {
  [BUBBLE_SORT_CONTENT.id]: BUBBLE_SORT_CONTENT,
  [SELECTION_SORT_CONTENT.id]: SELECTION_SORT_CONTENT,
  [INSERTION_SORT_CONTENT.id]: INSERTION_SORT_CONTENT,
  [MERGE_SORT_CONTENT.id]: MERGE_SORT_CONTENT,
  [QUICK_SORT_CONTENT.id]: QUICK_SORT_CONTENT,
  [DUAL_PIVOT_QUICK_SORT_CONTENT.id]: DUAL_PIVOT_QUICK_SORT_CONTENT,
  [HEAP_SORT_CONTENT.id]: HEAP_SORT_CONTENT,
  [COUNTING_SORT_CONTENT.id]: COUNTING_SORT_CONTENT,
  [RADIX_SORT_CONTENT.id]: RADIX_SORT_CONTENT,
  [TIMSORT_CONTENT.id]: TIMSORT_CONTENT,
  [INTROSORT_CONTENT.id]: INTROSORT_CONTENT,

  [ARRAY_CONTENT.id]: ARRAY_CONTENT,
  [LINKED_LIST_CONTENT.id]: LINKED_LIST_CONTENT,
  [STACK_CONTENT.id]: STACK_CONTENT,
  [QUEUE_CONTENT.id]: QUEUE_CONTENT,
  [BST_CONTENT.id]: BST_CONTENT,
  'bst-insert': BST_CONTENT, // Alias de retrocompatibilidade
  [AVL_TREE_CONTENT.id]: AVL_TREE_CONTENT,
  [TREE_TRAVERSAL_CONTENT.id]: TREE_TRAVERSAL_CONTENT,
  [RED_BLACK_TREE_CONTENT.id]: RED_BLACK_TREE_CONTENT,
  [GRAPH_CONTENT.id]: GRAPH_CONTENT,
  [HASH_MAP_CONTENT.id]: HASH_MAP_CONTENT
};

export function getAlgorithmContent(id: string): AlgorithmContent | undefined {
  return ALGORITHM_CONTENT_MAP[id];
}
