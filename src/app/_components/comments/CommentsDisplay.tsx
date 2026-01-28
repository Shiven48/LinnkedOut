import { CommentData } from '@/services/common/types';
import CommentList from "./CommentList";

interface CommentsDisplayProps {
  comments: CommentData[];
}

const CommentsDisplay: React.FC<CommentsDisplayProps> = ({ comments }) => {
  return (
    <div className="max-h-[200px] mt-2 rounded-lg">
      <CommentList comments={comments} />
    </div>
  );
};

export default CommentsDisplay