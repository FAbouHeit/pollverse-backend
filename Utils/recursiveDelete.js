import Comment from '../models/CommentModel.js';

const recursiveDelete = async (commentId) => {
    try {
        let comment = await Comment.findById(commentId);

        if (!comment) {
            return
        }

        if (comment.replies.length === 0) {
            await Comment.findByIdAndDelete(commentId);
            return
        }

        for (let i = 0; i < comment.replies.length; i++) {
            await deleteCommentUtil(comment.replies[i]);
        }

        await Comment.findByIdAndDelete(commentId);
    } catch (error) {
        return
    }
};

export default recursiveDelete;
