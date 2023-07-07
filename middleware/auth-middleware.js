const jwt = require('jsonwebtoken');
const User = require('../schemas/user.js');

module.exports = async (req, res, next) => {
    // routes/auth.js 에서 JWT 를 cookie 로 설정한 값을 가져온 것
    const { permission } = req.cookies;

    // 위에서 가져온 cookie 값이 비어있다면 "" 로 변경하고
    // 값이 존재한다면 .split(' ') 의 규칙을 따른다.

    //! 주의할 점 : 자꾸 변수를 { } 로 담고있는 내 자신을 본다.
    //! .split 을 해야하기 때문에 나눈 값을 배열에 담을 것
    const [permission_type, permission_token] = (permission ?? "").split(' ');

    // 1. permission_token 의 유무
    // 2. permission_type 이 'Bearer' 인지 ?
    if (!permission_token || permission_type !== 'Bearer') {
        res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
        return;
    };

    try {
        // 1. permission_token 만료여부
        // 2. permission_token 이 서버가 발급한 것이 맞는지 체크

        // permission_token 에는 Header, Payload, signature 가 담겨져있고,
        // Private.Key('Luna') 를 통해 데이터 위조여부 확인 후 userId 를 가져온다.

        // 여기서 의미하는 userId 는 _id 값을 가져와서 만든 userId 이다.
        // schemas/user.js 에서 설정한 virtual('userId')
        const { userId } = jwt.verify(permission_token, process.env.PRIVATE_KEY);

        // 3. permission_token 에 들어있는 userId 가 DB 에 있는 _id 와 일치하는게 있는지
        const user = await User.findById(userId); // = await User.find({ _id: userId });

        // try 안에 있는 user 를 찾는 일련의 인증 과정에 대해서
        // auth-middleware 를 require 하는 모든 router 들이 사용할 수 있도록 전역설정하는 것
        res.locals.user = user;

        next();

    } catch (error) {
        res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
        return;
    };
};