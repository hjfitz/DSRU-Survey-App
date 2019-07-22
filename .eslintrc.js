module.exports = {
	"extends": "airbnb",
	"plugins": ["react", "jsx-a11y", "import"],
	"env": {
		"browser": true,
		"node": true,
	},
	"rules": {
		"indent": ["error", "tab"],
		"semi": ["error", "never"],
		"camelcase": 0,
		"max-len": ["error", { "code": 160 }],

		"no-underscore-dangle": 0,
		"no-param-reassign": 0,
		"no-return-assign": 0,
		"no-console": 0,
		"no-tabs": 0,

		"object-curly-spacing": ["error", "never"],
		"object-curly-newline": 0,

		"react/jsx-one-expression-per-line": 0,
		"react/no-access-state-in-setstate": 0,
		"react/destructuring-assignment": 0,
		"react/jsx-indent": [2, 'tab'],
		"react/no-array-index-key": 0,
		"react/react-in-jsx-scope": 0,
		"react/jsx-indent-props": 0,
		"react/prop-types": 0,

		"jsx-a11y/no-noninteractive-element-interactions": 0,
		"jsx-a11y/no-static-element-interactions": 0,
		"jsx-a11y/click-events-have-key-events": 0,
		"jsx-a11y/label-has-associated-control": 0,
		"jsx-a11y/media-has-caption": 0,
		"jsx-a11y/anchor-is-valid": 0,
		"jsx-a11y/label-has-for": 0,

	},
};
