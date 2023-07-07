const express = require('express');
const router = express.Router();
const Comment = require('../schemas/comments.js');
const Post = require('../schemas/posts.js');
const authMiddleware = require('../middleware/auth-middleware.js');

// 댓글 목록 조회 API
router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId });

    try {
        // 댓글을 조회할 게시글 ( = :postId ) 이 없는 경우
        if (!post) {
            res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
            return;
        };

        const all_list = await Comment.find({ postId: postId });

        const comment_list = all_list.map(comment => {
            return {
                commentId: comment._id,
                // postId: comment.postId, // 값은 있지만 res 에서 요구하지 않은 사항
                userId: comment.userId,
                nickname: comment.nickname,
                comment: comment.comment,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            };
        });

        res.status(200).json({ comments: comment_list });
    } catch (error) {
        res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
        console.error(error);
    };
});

// 댓글 작성 API
router.post('/:postId/comments', authMiddleware, async (req, res) => {
    const { userId, nickname } = res.locals.user;
    const { postId } = req.params;
    const { comment } = req.body;
    const post = await Post.findOne({ _id: postId });

    try {
        // 댓글을 작성할 게시글 ( = :postId ) 이 없는 경우    
        if (!post) {
            res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
            return;
        };

        if (!req.cookies) { // cookie 가 존재하지 않을 경우
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        };

        // ↑↑↑ req.cookies 와 ↓↓↓ req.body 를 관리하는 if 문을 각각 분리

        if (!req.body) { // body 데이터가 정상적으로 전달되지 않은 경우
            res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
            return;
        }

        else if (!comment) { // comment 내용이 없는 경우
            res.status(400).json({ errorMessage: '댓글 내용을 입력해주세요.' });
            return;
        };

        await Comment.create({ postId, userId, nickname, comment });
        res.status(201).json({ message: '댓글을 작성하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
        console.log(error);
    };
});

// 댓글 수정 API
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { commentId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;

    try {
        // 댓글을 수정할 게시글 ( = :postId ) 이 없는 경우    
        const owner_comment = await Post.findOne({ _id: postId });
        if (!owner_comment) {
            res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
            return;
        };

        if (!req.cookies) { // cookie 가 존재하지 않을 경우
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        };

        // ↑↑↑ req.cookies 와 ↓↓↓ req.body 를 관리하는 if 문을 각각 분리

        if (!req.body) { // body 데이터가 정상적으로 전달되지 않은 경우
            res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
            return;
        }

        else if (!comment) { // comment 내용이 없는 경우
            res.status(400).json({ errorMessage: '댓글 내용을 입력해주세요.' });
            return;
        };

        // 수정이 필요한 댓글 ( =update_target ) 을 작성한 userId 와
        // 현재 로그인한 아이디의 userID 가 일치하는지 확인 후 수정 권한 체크
        const update_target = await Comment.findOne({ _id: commentId });

        if (!update_target) {
            res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
            return;
        };

        if (userId !== update_target.userId) {
            res.status(403).json({ errorMessage: '댓글의 수정 권한이 존재하지 않습니다.' });
            return;
        };

        // 기존에 있는 updatedAt 을 수정하는 시간을 기준으로 새로 만들어서 덮어씌움
        const updatedAt = new Date();
        updatedAt.setHours(updatedAt.getHours() + 9);

        // 수정된 댓글이 있는지 체크해서 수정이 정상적으로 처리되었는지 확인
        // modifiedCount => 수정된 것이 있는지 체크 ( 수정o : 1, 수정x: 0 )
        //! 해당 조건은 수정할 때마다 updatedAt 은 계속 변경되기 때문에 완벽한 조건은 아니다.
        const update_done = await Comment.updateOne({ _id: commentId }, { $set: { comment, updatedAt } });
        if (update_done.modifiedCount === 0) {
            res.status(400).json({ errorMessage: '댓글이 정상적으로 수정되지 않았습니다.' });
            return;
        };

        res.status(200).json({ message: '댓글을 수정하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
        console.error(error);
    };
});

// 댓글 삭제 API
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { commentId } = req.params;
    const { userId } = res.locals.user;

    try {
        // 댓글을 삭제할 게시글 ( = :postId ) 이 없는 경우    
        const owner_comment = await Post.findOne({ _id: postId });
        if (!owner_comment) {
            res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
            return;
        };

        if (!req.cookies) { // cookie 가 존재하지 않을 경우
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        };

        // 삭제가 필요한 댓글 ( =update_target ) 을 작성한 userId 와
        // 현재 로그인한 아이디의 userID 가 일치하는지 확인 후 삭제 권한 체크
        const delete_target = await Comment.findOne({ _id: commentId });

        if (!delete_target) {
            res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
            return;
        };

        if (userId !== delete_target.userId) {
            res.status(403).json({ errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.' });
            return;
        };

        // 삭제된 댓글이 있는지 체크해서 삭제가 정상적으로 처리되었는지 확인
        // deletedCount => 삭제된 것이 있는지 체크 ( 삭제o : 1, 삭제x: 0 )
        const delete_done = await Comment.deleteOne({ _id: commentId });
        if (delete_done.deletedCount === 0) {
            res.status(401).json({ errorMessage: '댓글이 정상적으로 삭제되지 않았습니다.' });
            return;
        };

        res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
        console.error(error);
    };
});

module.exports = router;