const mongoose = require('mongoose');

const connect = () => {
    mongoose
        .connect('mongodb://0.0.0.0:27017/homework_lv1')
        .catch(err => console.error(err));
};

mongoose.connection.on('error', err => {
    console.error('MongoDB 연결 에러 발생', err);
});

module.exports = connect;