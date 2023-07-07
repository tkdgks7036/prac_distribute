const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    }
});

// 가상의 userId 할당
UserSchema.virtual('userId').get(function () {
    return this._id.toHexString();
});

// user 정보를 JSON 으로 형변환 할 때
// 위에서 설정해둔 가상의 userId ( = virtual ) 값이 출력되도록 설정
UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);