module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "script",
        "ecmaFeatures": {
            "modules": false
        }
    },
    "env": {
        "mocha": true
    },
    "rules": {
        "comma-dangle": 0,
        "prefer-const": 0,
        "prefer-destructuring": 0,
        "prefer-template": 0,
        "no-underscore-dangle": 0,
        "import/no-dynamic-require": 0,
        "arrow-body-style": 0,
        "strict": [2, "global"],
        "operator-linebreak": 0,
        "max-classes-per-file": ["error", 3]
    }
};
