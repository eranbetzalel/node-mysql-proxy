var config = {
    web: {
        httpPort: 8080 || process.env.MYSQL_PROXY_HTTP,
        responseTimeout: 60 * 1000
    },
    mysqlPool: {
        connectionLimit: 10,
        host: '',
        user: '',
        password: ''
    }
};

module.exports = config;