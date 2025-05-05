import { isValidElement, useState } from 'react';
import { CommentData } from '../../../../types';
import CommentList from './CommentList';
import { usePlayingState } from '../../../../hooks/useIsPlaying';

interface CommentItemProps {
  comment: CommentData;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, level = 0 }) => {
  // State to track visibility of comment and replies
  const isPlaying = usePlayingState((state) => state.isPlaying)
  const [isVisible, setIsVisible] = useState(true);

  // Toggle visibility on click
  const handleToggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div
      className={`${!isPlaying ? "bg-[#2a2a2a] p-3 rounded-medium text-white" : "blur-[1px]"}`}
      style={{ marginLeft: `${level * 20}px` }}
      onClick={handleToggleVisibility}
    >
      <div 
        className={`flex items-center justify-between`}
      >
        <span className="font-light text-dark-golden">{comment.author}</span>
        <span className="text-sm text-golden">Score: {comment.score}</span>
      </div>
      <p 
        className={`${isVisible} ? "text-gray-200 mb-2" ? "" `}
      >{comment.body}</p>
      <div className="flex space-x-4 text-sm text-gray-400">
        <span>↑ {comment.ups}</span>
        <span>↓ {comment.downs}</span>
      </div>
      {isVisible && comment.replies && comment.replies.length > 0 && (
        <div 
            className="mt-3 border-l-2 border-gray-600 pl-4"
        >
          <CommentList comments={comment.replies} />
        </div>
      )}
    </div>
  );
};

export default CommentItem;
