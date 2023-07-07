const express = require('express');
const router = express.Router();
const User = require('../schemas/user.js');
const jwt = require('jsonwebtoken');

// 로그인 API
router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname: nickname });

    try {
        // 1. nickname 이 DB 에 등록되어 있는지?
        // 2. 등록되어 있는 nickname 이 가지고 있는 password 와 일치하는지?
        // 정확히 무엇이 틀렸는지 에러 메세지를 출력하는 것은 보안상 좋지 않다.
        if (!user || password !== user.password) {
            res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
            return;
        };

        const token = jwt.sign({ userId: user.userId }, process.env.PRIVATE_KEY);

        // 인증된 JWT 를 cookie 로 할당 후 Body 로 보낸다.
        res.cookie('permission', `Bearer ${token}`);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
        console.error(error);
    };
});

module.exports = router;