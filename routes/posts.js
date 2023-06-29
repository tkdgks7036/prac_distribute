const express = require('express');
const router = express.Router();
const Posts = require('../schemas/posts.js');

// 게시글 목록 조회 API
router.get('/', async (req, res) => {
    const posts = await Posts.find({});

    const results = posts.map(post => {
        return {
            postId: post._id,
            user: post.user,
            title: post.title,
            createdAt: post.createdAt,
        };
    }).sort();

    res.status(200).json({ data: results });
});

// 게시글 상세 조회 API
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.find({ _id: postId });

    const [result] = post.map(post => {
        return {
            postId: post._id,
            user: post.user,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
        };
    });

    if (post.length === 0) {
        res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    };

    res.status(200).json({ data: result });
});

// 게시글 수정 API
router.put('/:postId', async (req, res) => {
    const { postId } = req.params;
    const { password, title, content } = req.body;

    const formalPost = await Posts.find({ _id: postId });

    if (password === formalPost[0].password) {
        await Posts.updateOne({ _id: postId }, { $set: { title, content } });
        res.status(200).json({ message: "게시글을 수정하였습니다." });
    } else {
        res.send('비밀번호가 일치하지 않습니다.');
    };
});

// 게시글 삭제 API
router.delete('/:postId', async (req, res) => {
    const { postId } = req.params;
    const { password } = req.body;

    const deletePost = await Posts.find({ _id: postId });

    if (password === deletePost[0].password) {
        await Posts.deleteOne({ _id: postId });
        res.status(200).json({ message: "게시글을 삭제하였습니다." });
    } else {
        res.send('비밀번호가 일치하지 않습니다.');
    };
});

// 게시글 작성 API
router.post('/', async (req, res) => {
    const { user, password, title, content } = req.body;
    const post_value = Object.values(req.body);

    if (post_value.includes('')) {
        res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    };

    await Posts.create({ user, password, title, content });
    res.status(200).json({ message: "게시글을 생성하였습니다." });
})

module.exports = router;