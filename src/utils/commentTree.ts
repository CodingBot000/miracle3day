/**
 * 평면 댓글 배열을 트리 구조로 변환
 */
export function buildCommentTree(comments: any[]): any[] {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // 1. 모든 댓글을 Map에 저장하고 children 배열 초기화
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  // 2. 부모-자식 관계 설정
  comments.forEach(comment => {
    const node = commentMap.get(comment.id);
    
    if (comment.id_parent) {
      // 대댓글인 경우: 부모의 children에 추가
      const parent = commentMap.get(comment.id_parent);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      // 최상위 댓글인 경우
      rootComments.push(node);
    }
  });

  return rootComments;
}

