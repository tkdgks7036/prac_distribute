const express = require('express');
const router = express.Router();
const Comments = require('../schemas/comments.js');

// 댓글 목록 조회 API
router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const comments = await Comments.find({ commentId: postId });

    const results = comments.map(comment => {
        return {
            commentId: comment._id,
            user: comment.user,
            content: comment.content,
            createdAt: comment.createdAt,
        };
    }).sort();

    res.status(200).json({ data: results });
});

// 댓글 수정 API
router.put('/:postId/comments/:commentId', async (req, res) => {
    const { postId } = req.params;
    const { commentId } = req.params;
    const { password, content } = req.body;
    const formalComment = await Comments.find({ _id: commentId, commentId: postId });

    if (!content) return res.status(400).json({ message: "댓글 내용을 입력해주세요." });

    if (password === formalComment[0].password) {
        await Comments.updateOne({ _id: commentId, commentId: postId }, { $set: { content } });
        res.status(200).json({ message: "댓글을 수정하였습니다." });
    } else {
        return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    };
});

// 댓글 삭제 API
router.delete('/:postId/comments/:commentId', async (req, res) => {
    const { postId } = req.params;
    const { commentId } = req.params;
    const { password } = req.body;

    const deleteComment = await Comments.find({ _id: commentId, commentId: postId });

    if (deleteComment.length && password === deleteComment[0].password) {
        await Comments.deleteOne({ _id: commentId, commentId: postId });
        res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } else {
        res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    };
});

// 댓글 작성 API
router.post('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { user, password, content } = req.body;
    const comment_value = Object.values(req.body);

    if (!content) return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });

    if (comment_value.includes('')) {
        res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    };

    await Comments.create({ commentId: postId, user, password, content });
    res.status(200).json({ message: "댓글을 생성하였습니다." });
});

module.exports = router;