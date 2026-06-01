const { LIGHT, DARK } = require("./constants/colors");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        LIGHT,
        DARK,
      },
      fontFamily: {
        ROBOTO_MONO: ["ROBOTO_MONO"],
      },
    },
  },
  plugins: [],
};
