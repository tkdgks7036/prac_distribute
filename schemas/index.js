const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connect = () => {
    mongoose
        .connect(process.env.MONGODB_LINK)
        .then(() => console.log('MongoDB 연결 완료'))
        .catch(err => console.error(err));
};

mongoose.connection.on('error', err => {
    console.error('MongoDB 연결 에러', err);
});

module.exports = connect;