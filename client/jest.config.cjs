// jest.config.cjs
module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

    // Babel را برای .js و .jsx فراخوانی کن:
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest'
    },

    // مسیر تست‌های شما
    testMatch: [
        '<rootDir>/src/__tests__/**/*.{js,jsx}'
    ],

    transformIgnorePatterns: [
        '/node_modules/'
    ]
};
