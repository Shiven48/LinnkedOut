import { CommentData } from "../../../types";
import CommentList from "./CommentList";

interface CommentsDisplayProps {
  comments: CommentData[];
}

const CommentsDisplay: React.FC<CommentsDisplayProps> = ({ comments }) => {
  return (
    <div className="max-h-[200px] mt-10 rounded-lg">
      <CommentList comments={comments} />
    </div>
  );
};

export default CommentsDisplay