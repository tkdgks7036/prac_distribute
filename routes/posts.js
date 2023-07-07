const express = require('express');
const router = express.Router();
const Post = require('../schemas/posts.js');
const authMiddleware = require('../middleware/auth-middleware.js');

// 전체 게시글 목록 조회 API
router.get('/', async (req, res) => {
    try {
        const all_list = await Post.find({}).sort('-createdAt');

        const post_list = all_list.map(post => {
            return {
                postId: post._id,
                userId: post.userId,
                nickname: post.nickname,
                title: post.title,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            };
        });

        res.status(200).json({ posts: post_list });
    } catch (error) {
        res.status(400).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
        console.error(error);
    };
});

// 게시글 상세 조회 API
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findOne({ _id: postId });

        const result = {
            postId: post._id,
            userId: post.userId,
            nickname: post.nickname,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };

        res.status(200).json({ posts: result });
    } catch (error) {
        res.status(400).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
        console.error(error);
    };
});

// 게시글 작성 API
router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const { userId, nickname } = res.locals.user;
    console.log(userId);

    try {
        if (!req.cookies) { // cookie 가 존재하지 않을 경우
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        };

        // ↑↑↑ req.cookies 와 ↓↓↓ req.body 를 관리하는 if 문을 각각 분리

        if (!req.body) { // body 데이터가 정상적으로 전달되지 않은 경우
            res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
            return;
        }

        else if (!title) { // title 의 형식이 비정상적인 경우 ( = 제목이 없는 경우 ? )
            res.status(412).json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
            return;
        }

        else if (!content) { // content 의 형식이 비정상적인 경우 ( = 내용이 없는 경우 ? )
            res.status(412).json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
            return;
        };

        await Post.create({ userId, nickname, title, content });
        res.status(201).json({ message: '게시글을 작성에 성공하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
        console.error(error);
    };
});

// 게시글 수정 API
router.put('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    try {
        if (!req.cookies) { // cookie 가 존재하지 않을 경우
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        };

        // ↑↑↑ req.cookies 와 ↓↓↓ req.body 를 관리하는 if 문을 각각 분리

        if (!req.body) { // body 데이터가 정상적으로 전달되지 않은 경우
            res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
            return;
        }

        else if (!title) { // title 의 형식이 비정상적인 경우 ( = 제목이 없는 경우 ? )
            res.status(412).json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
            return;
        }

        else if (!content) { // content 의 형식이 비정상적인 경우 ( = 내용이 없는 경우 ? )
            res.status(412).json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
            return;
        };

        // 수정이 필요한 게시글 ( = update_target ) 을 작성한 userId 와
        // 현재 로그인한 아이디의 userId 가 일치하는지 확인 후 수정 권한 체크
        const update_target = await Post.findOne({ _id: postId });
        if (userId !== update_target.userId) {
            res.status(403).json({ errorMessage: '게시글의 수정 권한이 존재하지 않습니다.' });
            return;
        };

        // 기존에 있는 updatedAt 을 수정하는 시간을 기준으로 새로 만들어서 덮어씌움
        const updatedAt = new Date();
        updatedAt.setHours(updatedAt.getHours() + 9);

        // 수정된 게시글이 있는지 체크해서 수정이 정상적으로 처리되었는지 확인
        // modifiedCount => 수정된 것이 있는지 체크 ( 수정o : 1, 수정x: 0 )
        //! 해당 조건은 수정할 때마다 updatedAt 은 계속 변경되기 때문에 완벽한 조건은 아니다.
        const update_done = await Post.updateOne({ _id: postId }, { $set: { title, content, updatedAt } });
        if (update_done.modifiedCount === 0) {
            res.status(401).json({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' });
            return;
        };

        res.status(200).json({ message: '게시글을 수정하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
        console.error(error);
    };
});

// 게시글 삭제 API
router.delete('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    try {
        if (!req.cookies) { // cookie 가 존재하지 않을 경우
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        };

        // ↑↑↑ req.cookies 와 ↓↓↓ 이 외의 조건을 체크하는 if 문을 각각 분리

        // 삭제할 게시글 ( = delete_target ) 이 존재하지 않을 경우
        const delete_target = await Post.findOne({ _id: postId });
        if (!delete_target) {
            res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
            return;
        };

        // 삭제할 게시글 ( = delete_target ) 을 작성한 userId 와
        // 현재 로그인한 아이디의 userId 가 일치하는지 확인 후 삭제 권한 체크
        if (userId !== delete_target.userId) {
            res.status(403).json({ errorMessage: '게시글의 삭제 권한이 존재하지 않습니다.' });
            return;
        };

        // 삭제된 게시글이 있는지 체크해서 삭제가 정상적으로 처리되었는지 확인
        // deletedCount => 삭제된 것이 있는지 체크 ( 삭제o : 1, 삭제x: 0 )
        const delete_done = await Post.deleteOne({ _id: postId });
        if (delete_done.deletedCount === 0) {
            res.status(401).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
            return;
        };

        res.status(200).json({ message: '게시글을 삭제하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
        console.error(error);
    };
});

module.exports = router;