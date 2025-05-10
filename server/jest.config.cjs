// jest.config.cjs
module.exports = {
    testEnvironment: 'node',

    // بگو که تمام فایل‌های .js با babel-jest ترنسپایل شوند:
    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    // اگر تست‌ها در src/__tests__ قرار دارند
    testMatch: [
        '<rootDir>/src/__tests__/**/*.test.js'
    ],

    // نادیده گرفتن node_modules (پیش‌فرض):
    transformIgnorePatterns: ['/node_modules/']
};
