import { CommentData } from '../../../../types';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: CommentData[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div className="space-y-4 ">
      {comments.map((comment, index) => (
        <CommentItem key={index} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;