const express = require('express');
const router = express.Router();
const User = require('../schemas/user.js');
const authMiddleware = require('../middleware/auth-middleware.js');

// 회원가입 API
router.post('/signup', async (req, res) => {
    const { nickname, password, confirmPassword } = req.body;
    try {
        // nickname 형식이 잘못되었을 때
        // 규칙: 최소 3자 이상 + 대소문자(a~z, A~Z) / 숫자(0~9) 로 구성
        if (nickname.length < 3 || nickname.replace(/[a-zA-Z0-9]/g, "").length !== 0) {
            res.status(412).json({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
            return;
        };

        // password 형식이 잘못되었을 때(1)
        // 규칙: 최소 4자 이상
        if (password.length < 4) {
            res.status(412).json({ errorMessage: '패스워드 형식이 일치하지 않습니다.' });
            return;
        };

        // password 형식이 잘못되었을 때(2)
        // password 안에 nickname 패턴이 포함되어 있는 경우
        if (password.includes(nickname) === true) {
            res.status(412).json({ errorMessage: '패스워드에 닉네임이 포함되어 있습니다.' });
            return;
        };

        // 설정한 password 를 다시 한 번 확인했을 때 일치하는지?
        if (password !== confirmPassword) {
            res.status(412).json({ errorMessage: '패스워드가 일치하지 않습니다.' });
            return;
        };

        const checkNickname = await User.findOne({ nickname: nickname });
        if (checkNickname) {
            // 정확히 무엇이 틀렸는지 에러 메세지를 출력하는 것은 보안상 좋지 않지만,
            // 현재 확인하려는 값이 1개이기 때문에 어쩔 수 없는 상황인 것 같다.
            res.status(412).json({ errorMessage: '이미 존재하는 nickname 입니다.' });
            return;
        };

        const user = new User({ nickname, password });
        await user.save();

        res.status(201).json({ message: '회원 가입에 성공하였습니다.' });
    } catch (error) {
        res.status(400).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
        console.error(error);
    };
});

module.exports = router;